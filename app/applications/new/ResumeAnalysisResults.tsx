"use client"

import { useMemo, useState } from "react"
import Link from "next/link"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"
import type { ResumeAnalysis } from "@/lib/schemas/resume-analysis"
import type { AiSuggestion } from "@/lib/schemas/resume-suggestions"
import type { ResumeStructuredData } from "@/lib/schemas/resume-structured-data"

import type { ResumeVersion } from "@/generated/prisma/client"

type JobDescriptionParsingData = {
    companyName: string
    roleTitle: string
}

type TierSkill = ResumeAnalysis["techHierarchy"]["tier1"][number]
type KeywordCoverageItem = ResumeAnalysis["keywordCoverage"][number]

type ResumeAnalysisProps = {
    resumeAnalysisData: ResumeAnalysis
    jobDescriptionParsingData: JobDescriptionParsingData
    resumeList: ResumeVersion[]
    defaultSelectedResumeId: string
    resumeStructuredData: ResumeStructuredData
    onEdit: () => void
    matchScore: number
    strengthCount: number
    aiSuggestions: AiSuggestion[]
    onFixNow: (suggestion: AiSuggestion) => void
}

const keywordFilters = [
    { label: "All", value: "all" },
    { label: "Tier 1", value: "tier1" },
    { label: "Tier 2", value: "tier2" },
    { label: "Tier 3", value: "tier3" },
    { label: "Missing", value: "missing" },
    { label: "Buried", value: "buried" },
]

function formatLabel(value: string) {
    return value.replaceAll("_", " ")
}

function statusClass(status: string) {
    switch (status) {
        case "strong_match":
        case "covered":
            return "border-green-500/35 bg-green-500/10 text-green-200"
        case "partial_match":
        case "covered_but_buried":
            return "border-yellow-500/35 bg-yellow-500/10 text-yellow-100"
        case "semantic_match":
            return "border-blue-500/35 bg-blue-500/10 text-blue-100"
        case "missing":
            return "border-red-500/40 bg-red-500/10 text-red-100"
        default:
            return "border-border bg-muted text-muted-foreground"
    }
}

function severityClass(severity: string) {
    switch (severity) {
        case "low":
            return "border-green-500/35 bg-green-500/10 text-green-200"
        case "medium":
            return "border-yellow-500/35 bg-yellow-500/10 text-yellow-100"
        case "high":
            return "border-red-500/40 bg-red-500/10 text-red-100"
        default:
            return "border-border bg-muted text-muted-foreground"
    }
}

function priorityTone(priority: AiSuggestion["priority"]) {
    switch (priority) {
        case "critical":
            return {
                label: "Critical",
                card: "border-red-500/25 bg-red-500/[0.04]",
                badge: "border-red-500/35 bg-red-500/10 text-red-100",
                dot: "bg-red-400",
                button: "border-red-500/25 bg-red-500/10 text-red-100 hover:bg-red-500/15",
            }
        case "important":
            return {
                label: "Important",
                card: "border-yellow-500/25 bg-yellow-500/[0.04]",
                badge: "border-yellow-500/35 bg-yellow-500/10 text-yellow-100",
                dot: "bg-yellow-400",
                button: "border-yellow-500/25 bg-yellow-500/10 text-yellow-100 hover:bg-yellow-500/15",
            }
    }
}

function MetricChip({
    label,
    value,
    tone,
}: {
    label: string
    value: string | number
    tone: "critical" | "important" | "strength"
}) {
    const toneClass = {
        critical: "border-red-500/25 bg-red-500/10 text-red-100",
        important: "border-yellow-500/25 bg-yellow-500/10 text-yellow-100",
        strength: "border-green-500/25 bg-green-500/10 text-green-100",
    }[tone]

    return (
        <div className={cn("rounded-full border px-3 py-1 text-sm font-medium", toneClass)}>
            {value} {label}
        </div>
    )
}

function DecisionFixCard({
    suggestion,
    index,
    resumeStructuredData,
    onFixNow,
}: {
    suggestion: AiSuggestion
    index: number
    resumeStructuredData: ResumeStructuredData
    onFixNow: (suggestion: AiSuggestion) => void
}) {
    const tone = priorityTone(suggestion.priority)
    const targetExperience = resumeStructuredData.experience.find(
        (experience) => experience.id === suggestion.experienceId
    )
    const currentBullet =
        targetExperience?.bullets[suggestion.bulletIndex] ?? "Current bullet unavailable for this resume."

    return (
        <Card className={cn("overflow-hidden rounded-2xl border bg-card/60 shadow-none", tone.card)}>
            <CardContent className="space-y-5 p-5 sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                Fix {index + 1}
                            </span>
                            <Badge className={cn("border", tone.badge)}>
                                {tone.label}
                            </Badge>
                        </div>
                        <h3 className="text-lg font-semibold leading-snug text-foreground">
                            {suggestion.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            {targetExperience?.company ?? "Experience"}{" "}
                            <span aria-hidden="true">&middot;</span> Bullet {suggestion.bulletIndex + 1}
                        </p>
                    </div>

                    <Button
                        size="sm"
                        type="button"
                        variant="outline"
                        className={cn("shrink-0", tone.button)}
                        onClick={() => onFixNow(suggestion)}
                    >
                        Fix This Now -&gt;
                    </Button>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                    <div className="rounded-xl border border-border/70 bg-muted/20 p-4">
                        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                            Why this matters
                        </p>
                        <p className="text-sm leading-6 text-foreground">
                            {suggestion.why}
                        </p>
                    </div>
                    <div className="rounded-xl border border-border/70 bg-muted/20 p-4">
                        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                            What to change
                        </p>
                        <p className="text-sm leading-6 text-foreground">
                            Replace this bullet with wording that makes the missing signal obvious to a recruiter.
                        </p>
                    </div>
                </div>

                <div className="rounded-xl border border-border/70 bg-background/30 p-4">
                    <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Evidence
                    </p>
                    <div className="space-y-3">
                        <div>
                            <p className="mb-1 text-xs font-medium text-muted-foreground">
                                Current resume bullet
                            </p>
                            <p className="text-sm leading-6 text-muted-foreground">
                                {currentBullet}
                            </p>
                        </div>
                        <div className="h-px bg-border/70" />
                        <div>
                            <p className="mb-1 text-xs font-medium text-muted-foreground">
                                Improved version
                            </p>
                            <p className="text-sm leading-6 text-foreground">
                                {suggestion.newText}
                            </p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

function renderTierCard(
    title: string,
    tone: string,
    skills: TierSkill[]
) {
    return (
        <Card className="border-border/70 bg-card/60 shadow-none">
            <CardHeader className={cn("border-b border-border/70 py-3", tone)}>
                <CardTitle className="text-sm">{title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-4">
                {skills.map((item, index) => (
                    <div key={`${item.skill}-${index}`} className="space-y-1">
                        <p className="text-sm font-medium text-foreground">{item.skill}</p>
                        <p className="text-xs leading-relaxed text-muted-foreground">
                            {item.reason}
                        </p>
                    </div>
                ))}
            </CardContent>
        </Card>
    )
}

const ResumeAnalysisResult = ({
    resumeAnalysisData,
    jobDescriptionParsingData,
    resumeList,
    defaultSelectedResumeId,
    resumeStructuredData,
    matchScore,
    strengthCount,
    aiSuggestions,
    onFixNow,
}: ResumeAnalysisProps) => {
    const {
        jobSummary,
        roleArchetype,
        techHierarchy,
        responsibilityHierarchy,
        keywordCoverage,
        matchStrengths,
        riskAssessment,
    } = resumeAnalysisData
    const { companyName, roleTitle } = jobDescriptionParsingData

    const [keywordFilter, setKeywordFilter] = useState("all")
    const [isDeepAnalysisOpen, setIsDeepAnalysisOpen] = useState(false)
    const [selectedKeyword, setSelectedKeyword] = useState<KeywordCoverageItem | null>(null)

    const analysisResume = resumeList.find((resume) => resume.id === defaultSelectedResumeId)
    const resumeFitSummary = "Nathan's resume has credible large-scale analytics signals, especially eBay funnel analysis, Goldman reconciliation work, and strong SQL/Python tooling. The main gap is positioning: the current bullets often read like data engineering or automation work when this Uber role needs experimentation, statistical modeling, and marketplace decision support to be obvious at first scan."
    const totalCritical = aiSuggestions.filter((suggestion) => suggestion.priority === "critical").length
    const totalImportant = aiSuggestions.filter((suggestion) => suggestion.priority === "important").length
    const visibleStrengths = matchStrengths.slice(0, strengthCount)

    const filteredKeywords = useMemo<KeywordCoverageItem[]>(() => {
        if (keywordFilter === "all") {
            return keywordCoverage
        }

        if (keywordFilter === "missing") {
            return keywordCoverage.filter((item) => item.status === "missing")
        }

        if (keywordFilter === "buried") {
            return keywordCoverage.filter((item) => item.status === "covered_but_buried")
        }

        const tier = Number(keywordFilter.replace("tier", "")) as KeywordCoverageItem["tier"]
        return keywordCoverage.filter((item) => item.tier === tier)
    }, [keywordCoverage, keywordFilter])

    return (
        <div className="min-h-screen bg-background text-foreground">
            <header className="sticky top-0 z-30 border-b border-border/70 bg-background/90 backdrop-blur-xl">
                <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                    <div className="min-w-0">
                        <div className="flex min-w-0 items-center gap-2 text-sm font-semibold">
                            <span className="truncate">{companyName || "Company"}</span>
                            <span className="text-muted-foreground" aria-hidden="true">
                                &middot;
                            </span>
                            <span className="truncate">{roleTitle || "Role title"}</span>
                        </div>
                        <p className="mt-1 truncate text-xs text-muted-foreground">
                            Analyzed against: {analysisResume?.label ?? "Selected resume"}
                        </p>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                        <Button asChild type="button" variant="secondary">
                            <Link href="/resume-editor">Editor</Link>
                        </Button>
                        <Button type="button">Submit Application</Button>
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-5xl space-y-8 px-4 py-8 sm:px-6 sm:py-10">
                <section className="rounded-3xl border border-border/70 bg-card/60 p-6 shadow-sm sm:p-8">
                    <div className="grid gap-8 lg:grid-cols-[1.45fr_0.85fr] lg:items-stretch">
                        <div className="space-y-5">
                            <div className="flex flex-wrap items-center gap-2">
                                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                    Role reality
                                </p>
                                <Badge className="border-blue-500/25 bg-blue-500/10 text-blue-100">
                                    {roleArchetype.label}
                                </Badge>
                            </div>
                            <div className="space-y-3">
                                <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                                    This is a product data science screen, not a pure ML screen.
                                </h1>
                                <p className="text-base leading-7 text-foreground">
                                    {jobSummary}
                                </p>
                                <p className="text-sm leading-7 text-muted-foreground">
                                    {resumeFitSummary}
                                </p>
                            </div>
                        </div>

                        <div className="rounded-2xl border border-border/70 bg-background/35 p-5">
                            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                Match score
                            </p>
                            <div className="mt-5 flex items-end gap-3">
                                <span className="text-6xl font-semibold leading-none tracking-tight">
                                    {matchScore}%
                                </span>
                                <span className="pb-2 text-lg font-medium text-yellow-100">
                                    Moderate
                                </span>
                            </div>
                            <p className="mt-4 text-sm leading-6 text-muted-foreground">
                                Good base, needs sharper data science framing before this resume feels targeted.
                            </p>
                            <div className="mt-5 flex flex-wrap gap-2">
                                <MetricChip label="Critical" value={totalCritical} tone="critical" />
                                <MetricChip label="Important" value={totalImportant} tone="important" />
                                <MetricChip label="Strengths" value={visibleStrengths.length} tone="strength" />
                            </div>
                        </div>
                    </div>
                </section>

                <section className="space-y-4">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            Recommended path
                        </p>
                        <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                            Fix these first
                        </h2>
                        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                            These are the highest-leverage edits for this role. Each one jumps directly to the
                            exact bullet in the editor.
                        </p>
                    </div>

                    <div className="space-y-4">
                        {aiSuggestions.map((suggestion, index) => (
                            <DecisionFixCard
                                key={suggestion.id}
                                suggestion={suggestion}
                                index={index}
                                resumeStructuredData={resumeStructuredData}
                                onFixNow={onFixNow}
                            />
                        ))}
                    </div>
                </section>

                <section className="rounded-2xl border border-border/70 bg-card/60 p-5 shadow-none sm:p-6">
                    <div className="mb-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                            What is already working
                        </p>
                        <h2 className="mt-2 text-xl font-semibold">
                            Keep these signals visible
                        </h2>
                    </div>
                    <div className="grid gap-3 md:grid-cols-3">
                        {visibleStrengths.map((strength, index) => (
                            <div
                                key={`${strength.responsibility}-${index}`}
                                className="rounded-xl border border-green-500/20 bg-green-500/[0.04] p-4"
                            >
                                <div className="mb-2 flex items-center gap-2 text-sm font-medium text-green-100">
                                    <span
                                        className="flex size-5 items-center justify-center rounded-full bg-green-500/15 text-xs"
                                        aria-hidden="true"
                                    >
                                        &#10003;
                                    </span>
                                    <span>{strength.responsibility}</span>
                                </div>
                                <p className="text-xs leading-5 text-muted-foreground">
                                    {strength.whyItMatches}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

                <Collapsible open={isDeepAnalysisOpen} onOpenChange={setIsDeepAnalysisOpen}>
                    <section className="rounded-2xl border border-border/70 bg-card/50 p-5 shadow-none sm:p-6">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                    Deep analysis
                                </p>
                                <h2 className="mt-2 text-xl font-semibold">
                                    Reference material only
                                </h2>
                                <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                                    Open this when you want the detailed tech stack, responsibility, keyword, and
                                    risk breakdown behind the recommendations.
                                </p>
                            </div>
                            <CollapsibleTrigger asChild>
                                <Button type="button" variant="outline" className="shrink-0">
                                    {isDeepAnalysisOpen ? "Hide" : "Show"}
                                </Button>
                            </CollapsibleTrigger>
                        </div>

                        <CollapsibleContent className="mt-7 space-y-8">
                            <div className="space-y-3">
                                <h3 className="text-lg font-semibold">Tech stack by priority</h3>
                                <div className="grid gap-4 lg:grid-cols-3">
                                    {renderTierCard(
                                        "Tier 1",
                                        "bg-orange-500/10 text-orange-100",
                                        techHierarchy.tier1
                                    )}
                                    {renderTierCard(
                                        "Tier 2",
                                        "bg-yellow-500/10 text-yellow-100",
                                        techHierarchy.tier2
                                    )}
                                    {renderTierCard(
                                        "Tier 3",
                                        "bg-muted/60 text-muted-foreground",
                                        techHierarchy.tier3
                                    )}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <h3 className="text-lg font-semibold">Responsibility hierarchy</h3>
                                <div className="space-y-3">
                                    {responsibilityHierarchy.map((item) => (
                                        <Card key={item.rank} className="border-border/70 bg-background/30 shadow-none">
                                            <CardContent className="space-y-4 p-4">
                                                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                                    <div className="flex gap-3">
                                                        <div className="flex size-8 shrink-0 items-center justify-center rounded-full border border-border bg-muted/50 text-sm font-medium">
                                                            {item.rank}
                                                        </div>
                                                        <div>
                                                            <h4 className="font-medium leading-snug">
                                                                {item.responsibility}
                                                            </h4>
                                                            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                                                                {item.whatItMeans}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <Badge className={statusClass(item.resumeCoverage)}>
                                                        {formatLabel(item.resumeCoverage)}
                                                    </Badge>
                                                </div>

                                                <p className="text-sm leading-relaxed text-muted-foreground">
                                                    {item.whyCore}
                                                </p>

                                                <Collapsible>
                                                    <CollapsibleTrigger asChild>
                                                        <Button type="button" size="sm" variant="outline">
                                                            Evidence ({item.bestEvidence.length})
                                                        </Button>
                                                    </CollapsibleTrigger>
                                                    <CollapsibleContent className="mt-3 space-y-3">
                                                        {item.bestEvidence.map((evidence, index) => (
                                                            <div
                                                                key={`${evidence.company}-${index}`}
                                                                className="rounded-lg border border-border/70 bg-muted/20 p-3"
                                                            >
                                                                <p className="text-sm font-medium">
                                                                    {evidence.company}
                                                                </p>
                                                                <p className="mt-2 text-sm leading-relaxed">
                                                                    {evidence.bullet}
                                                                </p>
                                                                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                                                                    {evidence.reason}
                                                                </p>
                                                            </div>
                                                        ))}
                                                    </CollapsibleContent>
                                                </Collapsible>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                    <h3 className="text-lg font-semibold">Keyword coverage</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {keywordFilters.map((filter) => (
                                            <Button
                                                key={filter.value}
                                                type="button"
                                                size="sm"
                                                variant={keywordFilter === filter.value ? "secondary" : "ghost"}
                                                onClick={() => setKeywordFilter(filter.value)}
                                            >
                                                {filter.label}
                                            </Button>
                                        ))}
                                    </div>
                                </div>

                                <Card className="border-border/70 bg-background/30 shadow-none">
                                    <CardContent className="space-y-4 p-4">
                                        <div className="flex flex-wrap gap-2">
                                            {filteredKeywords.map((keyword) => (
                                                <Badge
                                                    key={`${keyword.keyword}-${keyword.tier}`}
                                                    asChild
                                                    className={cn(
                                                        "cursor-pointer border px-2.5 py-1",
                                                        statusClass(keyword.status),
                                                        selectedKeyword?.keyword === keyword.keyword && "ring-2 ring-ring"
                                                    )}
                                                >
                                                    <button
                                                        type="button"
                                                        onClick={() => setSelectedKeyword(keyword)}
                                                    >
                                                        {keyword.keyword}
                                                    </button>
                                                </Badge>
                                            ))}
                                        </div>

                                        {selectedKeyword ? (
                                            <div className="rounded-lg border border-border/70 bg-muted/20 p-4">
                                                <div className="mb-2 flex items-center justify-between gap-3">
                                                    <div>
                                                        <p className="font-medium">{selectedKeyword.keyword}</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            Tier {selectedKeyword.tier}{" "}
                                                            <span aria-hidden="true">&middot;</span>{" "}
                                                            {selectedKeyword.category}
                                                        </p>
                                                    </div>
                                                    <Badge className={statusClass(selectedKeyword.status)}>
                                                        {formatLabel(selectedKeyword.status)}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm leading-relaxed text-muted-foreground">
                                                    {selectedKeyword.reason}
                                                </p>
                                                <p className="mt-2 text-sm">
                                                    Recommendation:{" "}
                                                    <span className="text-muted-foreground">
                                                        {formatLabel(selectedKeyword.recommendation)}
                                                    </span>
                                                </p>
                                                {selectedKeyword.evidence.length > 0 ? (
                                                    <div className="mt-3 space-y-1">
                                                        {selectedKeyword.evidence.map((evidence, index) => (
                                                            <p
                                                                key={`${evidence}-${index}`}
                                                                className="text-xs leading-relaxed text-muted-foreground"
                                                            >
                                                                {evidence}
                                                            </p>
                                                        ))}
                                                    </div>
                                                ) : null}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-muted-foreground">
                                                Select a keyword to see the reason and recommendation.
                                            </p>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>

                            <div className="space-y-3">
                                <h3 className="text-lg font-semibold">Risk assessment</h3>
                                <div className="grid gap-3 md:grid-cols-2">
                                    {riskAssessment.map((risk, index) => (
                                        <div
                                            key={`${risk.risk}-${index}`}
                                            className="rounded-xl border border-border/70 bg-background/30 p-4"
                                        >
                                            <div className="mb-2 flex items-start justify-between gap-3">
                                                <p className="font-medium leading-snug">{risk.risk}</p>
                                                <Badge className={severityClass(risk.severity)}>
                                                    {risk.severity}
                                                </Badge>
                                            </div>
                                            <p className="text-sm leading-relaxed text-muted-foreground">
                                                {risk.mitigation}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CollapsibleContent>
                    </section>
                </Collapsible>
            </main>
        </div>
    )
}

export default ResumeAnalysisResult
