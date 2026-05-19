"use client"

import { type ChangeEvent, type DragEvent, useCallback, useRef, useState } from "react"
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
    setView("scanning")
  }

  const handleScan = () => {
    if (!selectedFile) {
      setMessage({
        tone: "error",
        text: "Upload a resume PDF first, then the scan flow can start.",
      })
      return
    }

    startScan("uploaded")
  }

  const handleTryDemo = () => {
    startScan("demo")
  }

  const handleScanningComplete = useCallback(() => {
    setView("results")
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

      {view === "results" && scanSource ? (
        <QuickScanResults
          scanSource={scanSource}
          result={DEMO_QUICK_SCAN_RESULT}
          resume={DEMO_RESUME_STRUCTURED_DATA}
          bulletSignals={DEMO_BULLET_SIGNALS}
          onNewScan={resetScan}
        />
      ) : null}
    </main>
  )
}
