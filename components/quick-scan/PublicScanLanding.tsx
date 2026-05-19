import type { ChangeEvent, DragEvent, RefObject } from "react"
import {
  AlertTriangle,
  ArrowRight,
  Check,
  CircleHelp,
  FileText,
  X,
} from "lucide-react"

import { MetricBar } from "@/components/quick-scan/MetricBar"
import { ScoreArc } from "@/components/quick-scan/ScoreArc"
import type { LandingMessage } from "@/components/quick-scan/quick-scan-types"
import { DEMO_QUICK_SCAN_RESULT } from "@/lib/demo/public-quick-scan-demo"

const trustItems = [
  "No inflated scores",
  "Only changes you can defend",
  "PDF scans for this version",
]

const checkCards = [
  {
    number: "01",
    title: "Searchability",
    body: "Checks whether the resume has readable contact details, clear sections, consistent dates, and scan-friendly structure.",
  },
  {
    number: "02",
    title: "Role match",
    body: "Compares your resume against the actual job description, so each role can produce a different score.",
  },
  {
    number: "03",
    title: "Honest fixes",
    body: "Separates defensible resume changes from gaps you should not fake in an interview.",
  },
]

const trustRows = [
  ["We show", "what your resume already proves, using exact evidence."],
  ["We flag", "keywords that are missing, buried, or too weakly placed."],
  ["We warn", "when a gap should stay honest instead of being stuffed in."],
]

type PublicScanLandingProps = {
  fileInputRef: RefObject<HTMLInputElement | null>
  selectedFile: File | null
  jobDescription: string
  isDragging: boolean
  message: LandingMessage | null
  onOpenFilePicker: () => void
  onFileChange: (event: ChangeEvent<HTMLInputElement>) => void
  onDragOver: (event: DragEvent<HTMLButtonElement>) => void
  onDragLeave: () => void
  onDrop: (event: DragEvent<HTMLButtonElement>) => void
  onJobDescriptionChange: (value: string) => void
  onScan: () => void
  onTryDemo: () => void
}

export function PublicScanLanding({
  fileInputRef,
  selectedFile,
  jobDescription,
  isDragging,
  message,
  onOpenFilePicker,
  onFileChange,
  onDragOver,
  onDragLeave,
  onDrop,
  onJobDescriptionChange,
  onScan,
  onTryDemo,
}: PublicScanLandingProps) {
  return (
    <>
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

        @keyframes resume-score-scale-in {
          from {
            opacity: 0;
            transform: scale(0.98) translateY(10px);
          }

          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        @keyframes resume-score-pulse {
          0%,
          100% {
            opacity: 1;
            transform: scale(1);
          }

          50% {
            opacity: 0.62;
            transform: scale(1.15);
          }
        }

        .resume-score-fade-up {
          animation: resume-score-fade-up 0.55s cubic-bezier(0.22, 1, 0.36, 1)
            both;
        }

        .resume-score-scale-in {
          animation: resume-score-scale-in 0.7s cubic-bezier(0.22, 1, 0.36, 1)
            both;
        }

        .resume-score-pulse {
          animation: resume-score-pulse 2.2s ease-in-out infinite;
        }
      `}</style>

      <div className="overflow-x-hidden bg-background">
        <section className="mx-auto w-full max-w-[1160px] px-[18px] py-9 sm:px-8 sm:py-10 lg:py-11">
          <div className="grid min-w-0 grid-cols-1 items-start gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(420px,500px)] lg:gap-14">
            <div className="mx-auto flex min-w-0 w-full max-w-[354px] flex-col sm:max-w-[680px] lg:mx-0">
              <div
                className="resume-score-fade-up mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-accent-rim bg-accent-bg px-3 py-1.5"
                style={{ animationDelay: "0.04s" }}
              >
                <span className="resume-score-pulse size-1.5 rounded-full bg-warn" />
                <span className="text-[11px] font-bold uppercase tracking-[0.07em] text-accent">
                  Free - no login - role-specific score
                </span>
              </div>

              <h1
                className="resume-score-fade-up mb-4 max-w-full break-words font-serif text-[34px] font-normal leading-[1.08] tracking-normal text-foreground sm:text-[50px]"
                style={{ animationDelay: "0.11s" }}
              >
                Know exactly why your resume <em>isn&apos;t getting interviews.</em>
              </h1>

              <p
                className="resume-score-fade-up mb-7 max-w-[470px] text-[15px] leading-[1.7] text-secondary-copy"
                style={{ animationDelay: "0.18s" }}
              >
                Not a fake 100%. An honest role-match score with real gaps,
                missing keywords, and the fixes you can actually defend.
              </p>

              <section
                className="resume-score-fade-up mb-4 w-full max-w-full overflow-hidden rounded-xl border border-border bg-card shadow-[0_1px_3px_rgba(26,20,16,0.06),0_8px_28px_rgba(26,20,16,0.05)]"
                style={{ animationDelay: "0.25s" }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf,.pdf"
                  className="hidden"
                  onChange={onFileChange}
                />

                <button
                  type="button"
                  onClick={onOpenFilePicker}
                  onDragOver={onDragOver}
                  onDragLeave={onDragLeave}
                  onDrop={onDrop}
                  className={`w-full border-b px-6 py-5 text-center transition-colors ${
                    isDragging
                      ? "border-accent bg-accent-bg"
                      : "border-border bg-card hover:bg-surface"
                  }`}
                >
                  <span className="mx-auto mb-3 flex size-11 items-center justify-center rounded-[10px] bg-surface text-muted-copy transition-colors">
                    <FileText size={22} strokeWidth={1.8} />
                  </span>
                  <span className="mb-1 block break-all text-[14px] font-semibold text-foreground">
                    {selectedFile ? selectedFile.name : "Drop your resume PDF here"}
                  </span>
                  <span className="block text-[12px] text-muted-copy">
                    {selectedFile ? "Ready for a role-match scan" : "or click to browse - PDF only for now"}
                  </span>
                </button>

                <div className="border-b border-border px-[18px] py-4">
                  <label
                    htmlFor="jobDescription"
                    className="mb-2 block text-[10px] font-bold uppercase tracking-[0.1em] text-muted-copy"
                  >
                    Job description{" "}
                    <span className="font-normal normal-case tracking-normal">
                      - required for role-specific scoring
                    </span>
                  </label>
                  <textarea
                    id="jobDescription"
                    value={jobDescription}
                    onChange={(event) => onJobDescriptionChange(event.target.value)}
                    placeholder="Paste the full job posting here..."
                    className="h-[74px] w-full resize-none rounded-lg border border-border bg-background px-3 py-2.5 text-[13px] leading-[1.55] text-foreground outline-none transition-colors placeholder:text-muted-copy focus:border-border-mid focus:ring-2 focus:ring-ring/15"
                  />
                </div>

                <div className="flex flex-col gap-2.5 px-[18px] py-4 sm:flex-row">
                  <button
                    type="button"
                    onClick={onScan}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3 text-[14px] font-semibold text-primary-foreground transition-colors hover:bg-[#2D2420]"
                  >
                    Scan role match
                    <ArrowRight size={16} strokeWidth={2.2} />
                  </button>
                  <button
                    type="button"
                    onClick={onTryDemo}
                    className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg border border-border-mid bg-transparent px-4 py-3 text-[13px] font-medium text-secondary-copy transition-colors hover:bg-surface"
                  >
                    See sample
                    <ArrowRight size={14} strokeWidth={2.1} />
                  </button>
                </div>

                {message ? (
                  <div
                    className={`border-t border-border px-[18px] py-3 text-[12px] leading-relaxed ${
                      message.tone === "error" ? "text-err" : "text-secondary-copy"
                    }`}
                  >
                    {message.text}
                  </div>
                ) : null}
              </section>

              <div
                className="resume-score-fade-up mb-5 flex items-start gap-3 rounded-xl border border-border bg-card px-4 py-3.5"
                style={{ animationDelay: "0.32s" }}
              >
                <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-surface text-secondary-copy">
                  <CircleHelp size={15} strokeWidth={2} />
                </span>
                <div>
                  <p className="text-[12px] leading-[1.55] text-secondary-copy">
                    <strong className="font-semibold text-foreground">No fake testimonials here.</strong>{" "}
                    The sample scan is the proof: it shows the score, evidence,
                    and exact gaps behind the recommendation.
                  </p>
                </div>
              </div>

              <div
                className="resume-score-fade-up flex flex-wrap gap-x-4 gap-y-2"
                style={{ animationDelay: "0.39s" }}
              >
                {trustItems.map((item) => (
                  <div key={item} className="flex items-center gap-1.5">
                    <Check size={12} className="text-ok" strokeWidth={2.5} />
                    <span className="text-[12px] text-muted-copy">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div
              className="resume-score-scale-in mx-auto min-w-0 w-full max-w-[354px] sm:max-w-[500px] lg:mx-0 lg:ml-auto"
              style={{ animationDelay: "0.46s" }}
            >
              <div className="mb-2.5 flex items-center gap-2">
                <span className="size-1.5 rounded-full bg-ok" />
                <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-copy">
                  Sample output - what you receive
                </span>
              </div>
              <SamplePreview />
            </div>
          </div>
        </section>

        <WhatItChecks />
        <WhyTrust />
        <BottomCTA onOpenFilePicker={onOpenFilePicker} />
        <Footer />
      </div>
    </>
  )
}

function SamplePreview() {
  return (
    <section className="overflow-hidden rounded-xl border border-border bg-card shadow-[0_2px_8px_rgba(26,20,16,0.05),0_16px_48px_rgba(26,20,16,0.07)]">
      <div className="flex items-center justify-between gap-4 border-b border-border px-[18px] py-3.5">
        <div className="min-w-0">
          <div className="text-[12px] font-bold text-foreground">Sample scan</div>
          <div className="mt-0.5 truncate text-[11px] text-muted-copy">
            Data Scientist Intern - ML platform team
          </div>
        </div>
        <span className="shrink-0 rounded-md border border-accent-rim bg-accent-bg px-2.5 py-1 text-[11px] font-bold text-accent">
          {DEMO_QUICK_SCAN_RESULT.scoreLabel}
        </span>
      </div>

      <div className="grid grid-cols-1 border-b border-border sm:grid-cols-[126px_1px_minmax(0,1fr)]">
        <div className="flex items-center justify-center px-3 py-4">
          <ScoreArc score={DEMO_QUICK_SCAN_RESULT.score} />
        </div>
        <div className="hidden w-px bg-border sm:block" />
        <div className="border-t border-border px-4 py-4 sm:border-t-0">
          <MetricBar
            label="Hard skills"
            found={DEMO_QUICK_SCAN_RESULT.metrics.hardSkills.found}
            total={DEMO_QUICK_SCAN_RESULT.metrics.hardSkills.total}
            tone="accent"
            delay={550}
          />
          <MetricBar
            label="Domain terms"
            found={DEMO_QUICK_SCAN_RESULT.metrics.domainTerms.found}
            total={DEMO_QUICK_SCAN_RESULT.metrics.domainTerms.total}
            tone="err"
            delay={700}
          />
          <MetricBar
            label="Soft skills"
            found={DEMO_QUICK_SCAN_RESULT.metrics.softSkills.found}
            total={DEMO_QUICK_SCAN_RESULT.metrics.softSkills.total}
            tone="ok"
            delay={850}
          />
        </div>
      </div>

      <div className="px-[18px] py-1">
        <Finding
          tone="ok"
          title="Strongest signal"
          body={DEMO_QUICK_SCAN_RESULT.strongestSignal}
        />
        <Finding
          tone="err"
          title="Biggest gap"
          body={DEMO_QUICK_SCAN_RESULT.biggestGap}
        />
        <Finding
          tone="warn"
          title="Fix this first"
          body="A strong bullet needs the method, not only the metric."
        />
      </div>

      <div className="border-t border-border bg-background px-[18px] py-3.5">
        <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.09em] text-muted-copy">
          Missing from resume
        </div>
        <div className="flex flex-wrap gap-1.5">
          {DEMO_QUICK_SCAN_RESULT.missing.slice(0, 4).map((item) => (
            <span
              key={item.label}
              className="rounded-full border border-border-mid bg-card px-2.5 py-1 text-[11px] text-secondary-copy"
            >
              {item.label}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}

function Finding({
  tone,
  title,
  body,
}: {
  tone: "ok" | "warn" | "err"
  title: string
  body: string
}) {
  const config = {
    ok: {
      label: "Strong",
      icon: Check,
      className: "border-ok bg-ok-bg text-ok",
      labelClassName: "text-ok",
    },
    warn: {
      label: "Weak",
      icon: AlertTriangle,
      className: "border-warn bg-warn-bg text-warn",
      labelClassName: "text-warn",
    },
    err: {
      label: "Gap",
      icon: X,
      className: "border-err bg-err-bg text-err",
      labelClassName: "text-err",
    },
  }[tone]
  const Icon = config.icon

  return (
    <div className="flex gap-3 border-b border-border py-3 last:border-b-0">
      <span
        className={`mt-0.5 flex size-[22px] shrink-0 items-center justify-center rounded-full border ${config.className}`}
      >
        <Icon size={12} strokeWidth={2.8} />
      </span>
      <div className="min-w-0">
        <div className="mb-1 flex flex-wrap items-baseline gap-2">
          <span className="text-[13px] font-bold text-foreground">{title}</span>
          <span className={`text-[11px] font-bold ${config.labelClassName}`}>
            {config.label}
          </span>
        </div>
        <p className="line-clamp-2 text-[12px] leading-[1.6] text-muted-copy">
          {body}
        </p>
      </div>
    </div>
  )
}

function WhatItChecks() {
  return (
    <section
      id="how-it-works"
      className="mx-auto w-full max-w-[1160px] px-[18px] pb-16 sm:px-8 lg:pb-[72px]"
    >
      <div className="mx-auto mb-8 max-w-[580px] text-center">
        <div className="mb-2.5 text-[11px] font-bold uppercase tracking-[0.09em] text-accent">
          What the scan covers
        </div>
        <h2 className="mb-3 font-serif text-[32px] font-normal leading-[1.1] tracking-normal text-foreground sm:text-[38px]">
          Not just a score.
          <br />
          The reason behind it.
        </h2>
        <p className="text-[15px] leading-[1.7] text-secondary-copy">
          The scan answers the real question: what should I fix first, and what
          should I not pretend to know?
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3.5 lg:grid-cols-3">
        {checkCards.map((card) => (
          <article
            key={card.number}
            className="rounded-xl border border-border bg-card px-5 py-5 transition-[border-color,transform] hover:-translate-y-0.5 hover:border-border-mid"
          >
            <div className="mb-4 font-mono text-[11px] text-muted-copy">
              {card.number}
            </div>
            <h3 className="mb-2 text-[16px] font-bold text-foreground">
              {card.title}
            </h3>
            <p className="text-[13px] leading-[1.65] text-secondary-copy">
              {card.body}
            </p>
          </article>
        ))}
      </div>
    </section>
  )
}

function WhyTrust() {
  return (
    <section
      id="why-trust"
      className="mx-auto w-full max-w-[1160px] px-[18px] pb-16 sm:px-8 lg:pb-[72px]"
    >
      <div className="grid overflow-hidden rounded-xl border border-border bg-card lg:grid-cols-[1.05fr_0.95fr]">
        <div className="px-6 py-8 sm:px-8 sm:py-9">
          <div className="mb-3 text-[11px] font-bold uppercase tracking-[0.09em] text-accent">
            Why trust the score?
          </div>
          <h2 className="mb-3.5 font-serif text-[30px] font-normal leading-[1.1] tracking-normal text-foreground sm:text-[36px]">
            It&apos;s an estimate,
            <br />
            not an official ATS verdict.
          </h2>
          <p className="max-w-[470px] text-[14px] leading-[1.75] text-secondary-copy">
            The score is useful because it surfaces evidence: readable
            structure, missing terms, weak placements, and truthful next steps.
          </p>
        </div>
        <div className="border-t border-border bg-background px-6 py-5 sm:px-7 lg:border-l lg:border-t-0">
          {trustRows.map(([lead, rest], index) => (
            <div
              key={lead}
              className="flex gap-3.5 border-b border-border py-4 last:border-b-0"
            >
              <span className="shrink-0 pt-0.5 font-mono text-[11px] text-muted-copy">
                0{index + 1}
              </span>
              <p className="text-[14px] leading-[1.6] text-secondary-copy">
                <strong className="font-bold text-foreground">{lead}</strong> {rest}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function BottomCTA({ onOpenFilePicker }: { onOpenFilePicker: () => void }) {
  return (
    <section className="mx-auto w-full max-w-[1160px] px-[18px] pb-14 sm:px-8">
      <div className="rounded-xl border border-accent-rim bg-accent-bg px-6 py-10 text-center sm:px-8">
        <div className="mb-3 text-[11px] font-bold uppercase tracking-[0.09em] text-accent">
          Ready?
        </div>
        <h2 className="mb-3 font-serif text-[32px] font-normal leading-[1.12] tracking-normal text-foreground sm:text-[40px]">
          Targeted fixes are ready
          <br />
          the moment you upload.
        </h2>
        <p className="mx-auto mb-6 max-w-[460px] text-[15px] leading-[1.7] text-secondary-copy">
          No account needed. Start with a PDF and the job post. The sample scan
          is there when you want to preview the output first.
        </p>
        <button
          type="button"
          onClick={onOpenFilePicker}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-7 py-3.5 text-[14px] font-bold text-primary-foreground transition-colors hover:bg-[#2D2420]"
        >
          Upload resume PDF
          <ArrowRight size={16} strokeWidth={2.3} />
        </button>
        <div className="mt-3 text-[11px] text-muted-copy">
          No credit card - no account - PDF only for now
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="mx-auto w-full max-w-[1160px] px-[18px] pb-9 sm:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-6">
        <span className="font-serif text-[16px] text-foreground">ResumeScore</span>
        <span className="text-[12px] text-muted-copy">
          Honest scoring for honest job seekers.
        </span>
      </div>
    </footer>
  )
}
