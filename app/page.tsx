"use client"

import {
  type ChangeEvent,
  type DragEvent,
  useCallback,
  useRef,
  useState,
} from "react"
import { PublicScanLanding } from "@/components/quick-scan/PublicScanLanding"
import { QuickScanNav } from "@/components/quick-scan/QuickScanNav"
import { QuickScanResults } from "@/components/quick-scan/QuickScanResults"
import { ScanningScreen } from "@/components/quick-scan/ScanningScreen"
import type {
  LandingMessage,
  PublicScanView,
  ScanSource,
} from "@/components/quick-scan/quick-scan-types"
import {
  DEMO_BULLET_SIGNALS,
  DEMO_QUICK_SCAN_RESULT,
  DEMO_RESUME_STRUCTURED_DATA,
} from "@/lib/demo/public-quick-scan-demo"
import { parseResumeFile } from "@/lib/resume-file-parser"
import type { PublicQuickScanPayload } from "@/lib/schemas/public-quick-scan"
import type { ResumeStructuredData } from "@/lib/schemas/resume-structured-data"

export default function Home() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [view, setView] = useState<PublicScanView>("landing")
  const [scanSource, setScanSource] = useState<ScanSource | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [jobDescription, setJobDescription] = useState("")
  const [isDragging, setIsDragging] = useState(false)
  const [message, setMessage] = useState<LandingMessage | null>(null)
  const [scanPayload, setScanPayload] = useState<PublicQuickScanPayload | null>(null)
  const [scanResume, setScanResume] = useState<ResumeStructuredData | null>(null)
  const scanPayloadRef = useRef<PublicQuickScanPayload | null>(null)
  const scanResumeRef = useRef<ResumeStructuredData | null>(null)
  const scanAnimationDoneRef = useRef(false)

  const openFilePicker = () => {
    fileInputRef.current?.click()
  }

  const resetScan = useCallback(() => {
    setView("landing")
    setScanSource(null)
    setSelectedFile(null)
    setJobDescription("")
    setIsDragging(false)
    setMessage(null)
    setScanPayload(null)
    setScanResume(null)
    scanPayloadRef.current = null
    scanResumeRef.current = null
    scanAnimationDoneRef.current = false
  }, [])

  const validateAndSetFile = (file: File | null) => {
    if (!file) return

    const isPdf =
      file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")

    if (!isPdf) {
      setSelectedFile(null)
      setMessage({
        tone: "error",
        text: "Please upload a PDF file for this first scan version.",
      })
      return
    }

    setSelectedFile(file)
    setMessage(null)
  }

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    validateAndSetFile(event.target.files?.[0] ?? null)
    event.target.value = ""
  }

  const handleDragOver = (event: DragEvent<HTMLButtonElement>) => {
    event.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (event: DragEvent<HTMLButtonElement>) => {
    event.preventDefault()
    setIsDragging(false)
    validateAndSetFile(event.dataTransfer.files?.[0] ?? null)
  }

  const startScan = (source: ScanSource) => {
    setScanSource(source)
    setMessage(null)
    setIsDragging(false)
    setScanPayload(null)
    setScanResume(null)
    scanPayloadRef.current = null
    scanResumeRef.current = null
    scanAnimationDoneRef.current = false
    setView("scanning")
  }

  const handleScan = async () => {
    if (!selectedFile) {
      setMessage({
        tone: "error",
        text: "Upload a resume PDF first, then the scan flow can start.",
      })
      return
    }

    const trimmedJobDescription = jobDescription.trim()

    if (!trimmedJobDescription) {
      setMessage({
        tone: "error",
        text: "Paste the job description first so the scan can score this specific role.",
      })
      return
    }

    startScan("uploaded")

    try {
      const resume = await parseResumeFile(selectedFile)
      const response = await fetch("/api/public-quick-scan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resume,
          jobDescription: trimmedJobDescription,
        }),
      })

      if (!response.ok) {
        const errorBody = await response.json().catch(() => null)
        throw new Error(errorBody?.error ?? "Failed to analyze this resume")
      }

      const payload = (await response.json()) as PublicQuickScanPayload
      scanResumeRef.current = resume
      scanPayloadRef.current = payload
      setScanResume(resume)
      setScanPayload(payload)

      if (scanAnimationDoneRef.current) {
        setView("results")
      }
    } catch (error) {
      setView("landing")
      setScanSource(null)
      setScanPayload(null)
      setScanResume(null)
      scanPayloadRef.current = null
      scanResumeRef.current = null
      scanAnimationDoneRef.current = false
      setMessage({
        tone: "error",
        text:
          error instanceof Error
            ? error.message
            : "Something went wrong while scanning your resume.",
      })
    }
  }

  const handleTryDemo = () => {
    startScan("demo")
    const demoPayload: PublicQuickScanPayload = {
      result: DEMO_QUICK_SCAN_RESULT,
      bulletSignals: DEMO_BULLET_SIGNALS,
    }
    scanResumeRef.current = DEMO_RESUME_STRUCTURED_DATA
    scanPayloadRef.current = demoPayload
    setScanResume(DEMO_RESUME_STRUCTURED_DATA)
    setScanPayload(demoPayload)

    if (scanAnimationDoneRef.current) {
      setView("results")
    }
  }

  const handleScanningComplete = useCallback(() => {
    scanAnimationDoneRef.current = true

    if (scanPayloadRef.current && scanResumeRef.current) {
      setView("results")
    }
  }, [])

  return (
    <main className="min-h-screen bg-background text-foreground">
      <QuickScanNav view={view} onReset={resetScan} onTryFree={openFilePicker} />

      {view === "landing" ? (
        <PublicScanLanding
          fileInputRef={fileInputRef}
          selectedFile={selectedFile}
          jobDescription={jobDescription}
          isDragging={isDragging}
          message={message}
          onOpenFilePicker={openFilePicker}
          onFileChange={handleFileChange}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onJobDescriptionChange={setJobDescription}
          onScan={handleScan}
          onTryDemo={handleTryDemo}
        />
      ) : null}

      {view === "scanning" ? <ScanningScreen onComplete={handleScanningComplete} /> : null}

      {view === "results" && scanSource && scanPayload && scanResume ? (
        <QuickScanResults
          scanSource={scanSource}
          result={scanPayload.result}
          resume={scanResume}
          bulletSignals={scanPayload.bulletSignals}
          onNewScan={resetScan}
        />
      ) : null}
    </main>
  )
}
