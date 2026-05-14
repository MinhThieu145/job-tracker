"use client";

import { type ChangeEvent, type DragEvent, useRef, useState } from "react";
import { Check, FileText } from "lucide-react";

type Message = {
  tone: "info" | "error";
  text: string;
};

const trustItems = [
  "No account required",
  "10-second results",
  "Honest scoring - no fake 100%",
];

export default function Home() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [jobDescription, setJobDescription] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [message, setMessage] = useState<Message | null>(null);

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  const resetLanding = () => {
    setSelectedFile(null);
    setJobDescription("");
    setIsDragging(false);
    setMessage(null);
  };

  const validateAndSetFile = (file: File | null) => {
    if (!file) return;

    const isPdf =
      file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");

    if (!isPdf) {
      setSelectedFile(null);
      setMessage({
        tone: "error",
        text: "Please upload a PDF file for this first scan version.",
      });
      return;
    }

    setSelectedFile(file);
    setMessage(null);
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    validateAndSetFile(event.target.files?.[0] ?? null);
    event.target.value = "";
  };

  const handleDragOver = (event: DragEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (event: DragEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setIsDragging(false);
    validateAndSetFile(event.dataTransfer.files?.[0] ?? null);
  };

  const handleScan = () => {
    if (!selectedFile) {
      setMessage({
        tone: "error",
        text: "Upload a resume PDF first, then the scan flow can start.",
      });
      return;
    }

    setMessage({
      tone: "info",
      text: "Scanning animation and real scoring are the next build step.",
    });
  };

  const handleTryDemo = () => {
    setMessage({
      tone: "info",
      text: "Demo results are the next build step. This button will load Nathan's sample scan.",
    });
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <style jsx global>{`
        @keyframes resume-score-fade-up {
          from {
            opacity: 0;
            transform: translateY(14px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .resume-score-fade-up {
          animation: resume-score-fade-up 0.5s cubic-bezier(0.22, 1, 0.36, 1)
            both;
        }
      `}</style>

      <nav className="sticky top-0 z-50 flex h-[52px] items-center justify-between border-b border-border bg-[#fffcf8]/95 px-5 backdrop-blur-[10px] sm:px-7">
        <button
          type="button"
          onClick={resetLanding}
          aria-label="Reset landing page"
          className="font-serif text-[18px] leading-none text-foreground"
        >
          ResumeScore
        </button>

        <div className="flex items-center gap-4 sm:gap-5">
          <a
            href="#how-it-works"
            className="hidden text-[13px] font-medium text-muted-copy transition-colors hover:text-foreground sm:inline"
          >
            How it works
          </a>
          <a
            href="#pricing"
            className="hidden text-[13px] font-medium text-muted-copy transition-colors hover:text-foreground sm:inline"
          >
            Pricing
          </a>
          <button
            type="button"
            onClick={openFilePicker}
            className="rounded-[7px] bg-primary px-4 py-[7px] text-[13px] font-medium leading-none text-primary-foreground transition-colors hover:bg-[#2D2420]"
          >
            Try free
          </button>
        </div>
      </nav>

      <section className="flex min-h-[calc(100vh-52px)] items-center justify-center px-4 py-12 sm:px-6">
        <div className="w-full max-w-[500px]">
          <div
            className="resume-score-fade-up mb-5 inline-flex items-center gap-[7px] rounded-full border border-accent-rim bg-accent-bg px-[13px] py-1"
            style={{ animationDelay: "0s" }}
          >
            <span className="size-1.5 rounded-full bg-accent" />
            <span className="text-[11px] font-semibold tracking-[0.07em] text-accent">
              FREE · NO LOGIN · RESULTS IN 10 SECONDS
            </span>
          </div>

          <h1
            className="resume-score-fade-up mb-3 font-serif text-[40px] font-normal leading-[1.15] tracking-normal text-foreground"
            style={{ animationDelay: "0.07s" }}
          >
            See exactly how your
            <br />
            resume <em>scores for this role.</em>
          </h1>

          <p
            className="resume-score-fade-up mb-8 max-w-[400px] text-[15px] leading-[1.65] text-secondary-copy"
            style={{ animationDelay: "0.13s" }}
          >
            Not a fake 100%. An honest searchability score - real gaps, exact
            missing keywords, and the one bullet to fix first.
          </p>

          <section
            className="resume-score-fade-up overflow-hidden rounded-[14px] border border-border bg-card shadow-[0_1px_3px_rgba(26,20,16,0.06),0_4px_16px_rgba(26,20,16,0.04)]"
            style={{ animationDelay: "0.19s" }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf,.pdf"
              className="hidden"
              onChange={handleFileChange}
            />

            <button
              type="button"
              onClick={openFilePicker}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`w-full border-b border-border px-7 py-[30px] text-center transition-colors ${
                isDragging
                  ? "border-accent bg-accent-bg"
                  : "bg-card hover:border-accent hover:bg-surface"
              }`}
            >
              <span className="mx-auto mb-3 flex size-[46px] items-center justify-center rounded-[10px] bg-surface text-muted-copy">
                <FileText size={22} strokeWidth={1.8} />
              </span>
              <span className="mb-1 block text-[15px] font-medium text-foreground">
                {selectedFile ? selectedFile.name : "Drop your resume PDF here"}
              </span>
              <span className="block text-[12px] text-muted-copy">
                {selectedFile
                  ? "Ready to scan"
                  : "or click to browse · PDF only for now"}
              </span>
            </button>

            <div className="border-b border-border px-[22px] py-4">
              <label
                htmlFor="jobDescription"
                className="mb-2 block text-[10px] font-bold uppercase tracking-[0.1em] text-muted-copy"
              >
                Job description{" "}
                <span className="font-normal normal-case tracking-normal">
                  - optional, boosts accuracy
                </span>
              </label>
              <textarea
                id="jobDescription"
                value={jobDescription}
                onChange={(event) => setJobDescription(event.target.value)}
                placeholder="Paste the full job posting here..."
                className="h-[82px] w-full resize-none rounded-lg border border-border bg-background px-3 py-2.5 text-[13px] leading-[1.55] text-foreground outline-none transition-colors placeholder:text-muted-copy focus:border-ring focus:ring-2 focus:ring-ring/15"
              />
            </div>

            <div className="flex flex-col gap-2.5 px-[22px] py-4 sm:flex-row">
              <button
                type="button"
                onClick={handleScan}
                disabled={!selectedFile}
                className="flex-1 rounded-lg bg-primary px-5 py-3 text-[14px] font-medium text-primary-foreground transition-colors hover:bg-[#2D2420] disabled:pointer-events-none disabled:opacity-45"
              >
                Scan my resume →
              </button>
              <button
                type="button"
                onClick={handleTryDemo}
                className="whitespace-nowrap rounded-lg border border-border-mid bg-transparent px-4 py-3 text-[13px] font-medium text-secondary-copy transition-colors hover:bg-surface"
              >
                Try demo
              </button>
            </div>

            {message ? (
              <div
                className={`border-t border-border px-[22px] py-3 text-[12px] leading-relaxed ${
                  message.tone === "error" ? "text-err" : "text-secondary-copy"
                }`}
              >
                {message.text}
              </div>
            ) : null}
          </section>

          <div
            className="resume-score-fade-up mt-[18px] flex flex-wrap justify-center gap-x-[18px] gap-y-2"
            style={{ animationDelay: "0.25s" }}
          >
            {trustItems.map((item) => (
              <div key={item} className="flex items-center gap-1.5">
                <Check size={12} className="text-ok" strokeWidth={2.4} />
                <span className="text-[12px] text-muted-copy">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
