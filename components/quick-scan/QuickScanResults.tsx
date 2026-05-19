"use client"

import { forwardRef, useMemo, useRef, useState } from "react"
import type { ReactNode, RefObject } from "react"
import { AlertTriangle, Check, ChevronDown, X } from "lucide-react"
import { MetricBar } from "@/components/quick-scan/MetricBar"
import { ResumePanel, getResumeBulletId } from "@/components/quick-scan/ResumePanel"
import { ScoreArc } from "@/components/quick-scan/ScoreArc"
import type { ScanSource } from "@/components/quick-scan/quick-scan-types"
import type {
  BulletSignal,
  BulletSignalKey,
  MissingKeywordAction,
  PublicQuickScanResult,
  ResponsibilityStatus,
  SearchabilityCheck,
  SearchabilityStatus,
} from "@/lib/schemas/public-quick-scan"
import type { ResumeStructuredData } from "@/lib/schemas/resume-structured-data"

type QuickScanResultsProps = {
  scanSource: ScanSource
  result: PublicQuickScanResult
  resume: ResumeStructuredData
  bulletSignals: Record<BulletSignalKey, BulletSignal>
  onNewScan: () => void
}

type SectionId = "summary" | "searchability" | "keywords" | "responsibilities"

const sections: { id: SectionId; label: string }[] = [
  { id: "summary", label: "Match summary" },
  { id: "searchability", label: "Searchability" },
  { id: "keywords", label: "Keywords" },
  { id: "responsibilities", label: "Responsibilities" },
]

const responsibilityOrder: Record<ResponsibilityStatus, number> = {
  not_shown: 0,
  partial: 1,
  demonstrated: 2,
}

const searchabilityCategories: SearchabilityCheck["category"][] = [
  "Contact information",
  "Section headings",
  "Experience format",
  "Date consistency",
]

const actionMeta: Record<MissingKeywordAction, { label: string; className: string }> = {
  add_to_skills: { label: "Add to skills", className: "text-ok" },
  strengthen: { label: "Strengthen bullet", className: "text-accent" },
  real_gap: { label: "Real gap", className: "text-err" },
}

export function QuickScanResults({
  scanSource,
  result,
  resume,
  bulletSignals,
  onNewScan,
}: QuickScanResultsProps) {
  const [activeSection, setActiveSection] = useState<SectionId>("summary")
  const [searchOpen, setSearchOpen] = useState(true)
  const [highlightedBulletKey, setHighlightedBulletKey] = useState<BulletSignalKey | null>(null)
  const [conversionMessage, setConversionMessage] = useState<string | null>(null)
  const summaryRef = useRef<HTMLDivElement | null>(null)
  const searchabilityRef = useRef<HTMLDivElement | null>(null)
  const keywordsRef = useRef<HTMLDivElement | null>(null)
  const responsibilitiesRef = useRef<HTMLDivElement | null>(null)

  const sectionRefs: Record<SectionId, RefObject<HTMLDivElement | null>> = {
    summary: summaryRef,
    searchability: searchabilityRef,
    keywords: keywordsRef,
    responsibilities: responsibilitiesRef,
  }

  const sortedResponsibilities = useMemo(
    () =>
      [...result.responsibilities].sort(
        (a, b) => responsibilityOrder[a.status] - responsibilityOrder[b.status],
      ),
    [result.responsibilities],
  )

  const searchabilityCounts = useMemo(() => {
    return result.searchability.reduce(
      (counts, item) => {
        counts[item.status] += 1
        return counts
      },
      { pass: 0, warn: 0, fail: 0 } satisfies Record<SearchabilityStatus, number>,
    )
  }, [result.searchability])

  const scrollToSection = (id: SectionId) => {
    setActiveSection(id)
    sectionRefs[id].current?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  const handleReframe = (targetBulletKey: BulletSignalKey) => {
    setHighlightedBulletKey(targetBulletKey)
    window.setTimeout(() => {
      document
        .getElementById(getResumeBulletId(targetBulletKey))
        ?.scrollIntoView({ behavior: "smooth", block: "center" })
    }, 80)
  }

  const showConversionMessage = () => {
    setConversionMessage("Account creation and saved fixes are coming next. This preview is demo-only for now.")
  }

  return (
    <section className="min-h-[calc(100vh-52px)] bg-background lg:flex">
      <aside className="border-b border-border bg-card p-4 lg:sticky lg:top-[52px] lg:h-[calc(100vh-52px)] lg:w-[210px] lg:shrink-0 lg:overflow-y-auto lg:border-b-0 lg:border-r lg:px-4 lg:py-[22px]">
        <div className="flex justify-center">
          <ScoreArc score={result.score} />
        </div>
        <div className="mb-4 text-center">
          <span className="inline-flex rounded bg-accent-bg px-2.5 py-1 text-[10px] font-semibold text-accent">
            {result.scoreLabel} - aim for 75%+
          </span>
        </div>

        <div className="mb-5">
          <MetricBar
            label="Hard skills"
            found={result.metrics.hardSkills.found}
            total={result.metrics.hardSkills.total}
            tone="accent"
            delay={250}
          />
          <MetricBar
            label="Domain terms"
            found={result.metrics.domainTerms.found}
            total={result.metrics.domainTerms.total}
            tone="err"
            delay={400}
          />
          <MetricBar
            label="Soft skills"
            found={result.metrics.softSkills.found}
            total={result.metrics.softSkills.total}
            tone="ok"
            delay={550}
          />
        </div>

        <Divider />

        <div className="mb-2 text-[9px] font-bold uppercase tracking-[0.1em] text-muted-copy">
          Sections
        </div>
        <div className="mb-5 flex flex-col gap-0.5">
          {sections.map((section) => (
            <button
              key={section.id}
              type="button"
              onClick={() => scrollToSection(section.id)}
              className={`rounded-md px-2.5 py-2 text-left text-[12px] transition-colors hover:bg-surface hover:text-foreground ${
                activeSection === section.id
                  ? "bg-background font-semibold text-accent"
                  : "text-muted-copy"
              }`}
            >
              {section.label}
            </button>
          ))}
        </div>

        <Divider />

        <button
          type="button"
          onClick={showConversionMessage}
          className="mb-2 w-full rounded-lg bg-primary px-3.5 py-2.5 text-[12px] font-medium text-primary-foreground transition-colors hover:bg-[#2D2420]"
        >
          See all 6 fixes -&gt;
        </button>
        <button
          type="button"
          onClick={onNewScan}
          className="w-full rounded-lg border border-border-mid bg-transparent px-3.5 py-2 text-[12px] text-muted-copy transition-colors hover:bg-surface"
        >
          &lt;- New scan
        </button>
      </aside>

      <main className="min-w-0 flex-1 px-4 py-5 sm:px-7 lg:max-h-[calc(100vh-52px)] lg:overflow-y-auto">
        {scanSource === "uploaded" ? (
          <div className="mb-3 rounded-lg border border-accent-rim bg-accent-bg px-4 py-3 text-[12px] leading-relaxed text-secondary-copy">
            <span className="font-semibold text-accent">Demo preview:</span> this view is using
            Nathan&apos;s sample data while the real quick-scan API is still being built.
          </div>
        ) : null}

        {conversionMessage ? (
          <div className="mb-3 rounded-lg border border-border bg-card px-4 py-3 text-[12px] text-secondary-copy">
            {conversionMessage}
          </div>
        ) : null}

        <AnalysisCard ref={summaryRef} className="mb-3.5">
          <CardHeader>
            <div className="text-[13px] font-semibold text-foreground">Match summary</div>
            <span className="font-mono text-[11px] font-semibold text-accent">{result.score}%</span>
          </CardHeader>
          <div className="flex flex-col gap-3 px-[22px] py-[18px]">
            <p className="text-[13px] leading-[1.65] text-secondary-copy">{result.verdict}</p>
            <div className="h-px bg-border" />
            <SignalRow tone="ok" label="Strongest signal" text={result.strongestSignal} />
            <SignalRow tone="err" label="Biggest gap" text={result.biggestGap} />
          </div>
        </AnalysisCard>

        <AnalysisCard ref={searchabilityRef} className="mb-3.5">
          <button
            type="button"
            onClick={() => setSearchOpen((value) => !value)}
            className={`flex w-full items-center justify-between gap-4 px-[22px] py-4 text-left ${
              searchOpen ? "border-b border-border" : ""
            }`}
          >
            <div className="text-[13px] font-semibold text-foreground">Searchability</div>
            <div className="flex items-center gap-2.5 text-[11px] text-muted-copy">
              <span className="font-semibold text-ok">{searchabilityCounts.pass} pass</span>
              <span>·</span>
              <span className="font-semibold text-warn">{searchabilityCounts.warn} warn</span>
              {searchabilityCounts.fail > 0 ? (
                <>
                  <span>·</span>
                  <span className="font-semibold text-err">{searchabilityCounts.fail} fail</span>
                </>
              ) : null}
              <ChevronDown
                size={14}
                className={`transition-transform ${searchOpen ? "rotate-180" : "rotate-0"}`}
              />
            </div>
          </button>

          {searchOpen ? (
            <div>
              {searchabilityCategories.map((category, groupIndex) => {
                const checks = result.searchability.filter((item) => item.category === category)

                return (
                  <div
                    key={category}
                    className={groupIndex < searchabilityCategories.length - 1 ? "border-b border-border" : ""}
                  >
                    <table className="w-full border-collapse">
                      <tbody>
                        {checks.map((check, index) => (
                          <tr
                            key={`${category}-${check.text}`}
                            className={index < checks.length - 1 ? "border-b border-border/40" : ""}
                          >
                            <td className="hidden w-40 px-[22px] py-3 align-top sm:table-cell">
                              {index === 0 ? (
                                <span className="text-[12px] font-semibold text-foreground">
                                  {category}
                                </span>
                              ) : null}
                            </td>
                            <td className="w-9 px-2 py-3 text-center align-top">
                              <StatusIcon status={check.status} />
                            </td>
                            <td className="py-3 pl-1 pr-[22px] align-top">
                              <div className="mb-1 text-[12px] font-semibold text-foreground sm:hidden">
                                {index === 0 ? category : null}
                              </div>
                              <span
                                className={`text-[12px] leading-[1.55] ${
                                  check.status === "warn"
                                    ? "text-warn"
                                    : check.status === "fail"
                                      ? "text-err"
                                      : "text-secondary-copy"
                                }`}
                              >
                                {check.text}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )
              })}
            </div>
          ) : null}
        </AnalysisCard>

        <AnalysisCard ref={keywordsRef} className="mb-3.5">
          <CardHeader>
            <div className="text-[13px] font-semibold text-foreground">Keyword coverage</div>
          </CardHeader>
          <div className="px-[22px] py-[18px]">
            <section className="mb-5">
              <GroupTitle tone="err" label="Missing from your resume" count={result.missing.length} />
              <div className="overflow-hidden rounded-lg border border-border">
                {result.missing.map((item, index) => {
                  const action = actionMeta[item.action]

                  return (
                    <div
                      key={item.label}
                      className={`flex items-start gap-3 px-3.5 py-2.5 ${
                        index < result.missing.length - 1 ? "border-b border-border" : ""
                      }`}
                    >
                      <StatusIcon status="fail" size="small" />
                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                          <span className="text-[12px] font-semibold text-foreground">{item.label}</span>
                          {index < 3 ? (
                            <span className="rounded bg-surface px-1.5 py-0.5 font-mono text-[9px] text-muted-copy">
                              mentioned {item.jdFreq}x in JD
                            </span>
                          ) : null}
                          <span className={`text-[10px] font-medium ${action.className}`}>
                            {action.label}
                          </span>
                        </div>
                        <p className="text-[11px] leading-[1.5] text-muted-copy">{item.reason}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>

            <section className="mb-5">
              <GroupTitle tone="warn" label="Weak placement" count={result.weak.length} />
              <div className="overflow-hidden rounded-lg border border-border">
                {result.weak.map((item, index) => (
                  <div
                    key={item.label}
                    className={`flex items-start gap-3 px-3.5 py-2.5 ${
                      index < result.weak.length - 1 ? "border-b border-border" : ""
                    }`}
                  >
                    <StatusIcon status="warn" size="small" />
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 text-[12px] font-semibold text-foreground">{item.label}</div>
                      <p className="text-[11px] leading-[1.5] text-muted-copy">{item.note}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <GroupTitle tone="ok" label="Found in resume" count={result.present.length} />
              <div className="flex flex-wrap gap-1.5">
                {result.present.map((keyword) => (
                  <span
                    key={keyword}
                    className="rounded bg-ok-bg px-2 py-1 text-[11px] font-medium text-ok"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </section>
          </div>
        </AnalysisCard>

        <AnalysisCard ref={responsibilitiesRef} className="mb-3.5">
          <CardHeader>
            <div className="text-[13px] font-semibold text-foreground">Responsibility match</div>
          </CardHeader>
          <div>
            {sortedResponsibilities.map((item, index) => {
              const statusMeta = getResponsibilityMeta(item.status)
              const targetBulletKey = item.targetBulletKey

              return (
                <div
                  key={item.label}
                  className={`flex items-start gap-3.5 px-[22px] py-3.5 ${
                    index < sortedResponsibilities.length - 1 ? "border-b border-border" : ""
                  }`}
                >
                  <ResponsibilityIcon status={item.status} />
                  <div className="min-w-0 flex-1">
                    <div className="mb-1.5 flex flex-wrap items-center gap-2">
                      <span className="text-[12px] font-semibold text-foreground">{item.label}</span>
                      <span className={`text-[11px] font-medium ${statusMeta.className}`}>
                        {statusMeta.label}
                      </span>
                    </div>
                    {item.evidence ? (
                      <p className="mb-2 border-l-2 border-border pl-2.5 text-[12px] leading-[1.55] text-muted-copy">
                        {item.evidence}
                      </p>
                    ) : null}
                    {item.gap ? (
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                        <p
                          className={`text-[11px] leading-[1.55] ${
                            item.status === "not_shown" ? "text-err" : "text-warn"
                          }`}
                        >
                          {item.gap}
                        </p>
                        {targetBulletKey && item.status !== "demonstrated" ? (
                          <button
                            type="button"
                            onClick={() => handleReframe(targetBulletKey)}
                            className="shrink-0 rounded-md border border-border-mid bg-transparent px-3 py-1.5 text-[11px] font-medium text-secondary-copy transition-colors hover:bg-surface"
                          >
                            Reframe a bullet -&gt;
                          </button>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                </div>
              )
            })}
          </div>
        </AnalysisCard>

        <section className="rounded-[14px] border border-accent-rim bg-accent-bg px-7 py-7 text-center">
          <h2 className="mb-2 font-serif text-[22px] font-normal tracking-normal text-foreground">
            6 targeted fixes are ready.
          </h2>
          <p className="mx-auto mb-5 max-w-[360px] text-[13px] leading-[1.65] text-secondary-copy">
            Create a free account to see exactly which bullets to rewrite - only changes you can
            honestly defend in an interview.
          </p>
          <button
            type="button"
            onClick={showConversionMessage}
            className="rounded-lg bg-primary px-7 py-3 text-[13px] font-medium text-primary-foreground transition-colors hover:bg-[#2D2420]"
          >
            See all 6 fixes - free -&gt;
          </button>
          <div className="mt-2.5 text-[11px] text-muted-copy">No credit card - 30 seconds to set up</div>
        </section>
      </main>

      <ResumePanel
        resume={resume}
        bulletSignals={bulletSignals}
        highlightedBulletKey={highlightedBulletKey}
      />
    </section>
  )
}

const AnalysisCard = forwardRef<HTMLDivElement, { children: ReactNode; className?: string }>(
  function AnalysisCard({ children, className = "" }, ref) {
  return (
    <section ref={ref} className={`scroll-mt-[68px] overflow-hidden rounded-xl border border-border bg-card ${className}`}>
      {children}
    </section>
  )
  },
)

function CardHeader({ children }: { children: ReactNode }) {
  return <div className="flex items-center justify-between gap-4 border-b border-border px-[22px] py-4">{children}</div>
}

function SignalRow({ tone, label, text }: { tone: "ok" | "err"; label: string; text: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <span className={`mt-1.5 size-1.5 shrink-0 rounded-full ${tone === "ok" ? "bg-ok" : "bg-err"}`} />
      <div>
        <div className="mb-0.5 text-[11px] font-semibold text-muted-copy">{label}</div>
        <p className="text-[12px] leading-[1.55] text-foreground">{text}</p>
      </div>
    </div>
  )
}

function GroupTitle({
  tone,
  label,
  count,
}: {
  tone: "ok" | "warn" | "err"
  label: string
  count: number
}) {
  const className = tone === "ok" ? "text-ok bg-ok-bg" : tone === "warn" ? "text-warn bg-warn-bg" : "text-err bg-err-bg"
  const textClassName = tone === "ok" ? "text-ok" : tone === "warn" ? "text-warn" : "text-err"

  return (
    <div className="mb-2.5 flex items-center gap-2">
      <span className={`text-[12px] font-semibold ${textClassName}`}>{label}</span>
      <span className={`rounded px-1.5 py-0.5 font-mono text-[9px] ${className}`}>{count}</span>
    </div>
  )
}

function StatusIcon({
  status,
  size = "default",
}: {
  status: SearchabilityStatus
  size?: "default" | "small"
}) {
  const sizeClassName = size === "small" ? "size-[18px]" : "size-5"
  const iconSize = size === "small" ? 10 : 11

  if (status === "pass") {
    return (
      <span className={`mx-auto flex ${sizeClassName} items-center justify-center rounded-full bg-ok-bg text-ok`}>
        <Check size={iconSize} strokeWidth={3} />
      </span>
    )
  }

  if (status === "warn") {
    return (
      <span className={`mx-auto flex ${sizeClassName} items-center justify-center rounded-full bg-warn-bg text-warn`}>
        <AlertTriangle size={iconSize} strokeWidth={2.5} />
      </span>
    )
  }

  return (
    <span className={`mx-auto flex ${sizeClassName} items-center justify-center rounded-full bg-err-bg text-err`}>
      <X size={iconSize} strokeWidth={3} />
    </span>
  )
}

function ResponsibilityIcon({ status }: { status: ResponsibilityStatus }) {
  if (status === "demonstrated") {
    return (
      <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-ok-bg text-ok">
        <Check size={11} strokeWidth={3} />
      </span>
    )
  }

  if (status === "partial") {
    return (
      <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-warn-bg text-warn">
        <AlertTriangle size={11} strokeWidth={2.5} />
      </span>
    )
  }

  return (
    <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border-2 border-err bg-transparent text-err">
      <X size={10} strokeWidth={3} />
    </span>
  )
}

function getResponsibilityMeta(status: ResponsibilityStatus) {
  if (status === "demonstrated") {
    return { label: "Demonstrated", className: "text-ok" }
  }

  if (status === "partial") {
    return { label: "Partial", className: "text-warn" }
  }

  return { label: "Not shown", className: "text-err" }
}

function Divider() {
  return <div className="mb-4 h-px bg-border" />
}
