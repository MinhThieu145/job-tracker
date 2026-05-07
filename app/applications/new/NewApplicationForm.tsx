"use client"

import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

import type { ResumeVersion } from "@/generated/prisma/client"

type ApplicationFormProps = {
    jdText: string
    setJdText: (value: string) => void
    companyName: string
    setCompanyName: (value: string) => void
    roleTitle: string
    setRoleTitle: (value: string) => void
    emailUsed: string
    setEmailUsed: (value: string) => void
    resumes: ResumeVersion[]
    selectedResumeId: string
    setSelectedResumeId: (value: string) => void
    isParsing: boolean
    isAnalyzing: boolean
    onParse: () => void
    onAnalyze: () => void
}

export default function NewApplicationForm({
    jdText,
    setJdText,
    companyName,
    setCompanyName,
    roleTitle,
    setRoleTitle,
    emailUsed,
    setEmailUsed,
    resumes,
    selectedResumeId,
    setSelectedResumeId,
    isParsing,
    isAnalyzing,
    onParse,
    onAnalyze,
}: ApplicationFormProps) {
    const canAnalyze = jdText.trim().length > 0 && selectedResumeId && !isParsing && !isAnalyzing
    const canParse = jdText.trim().length > 0 && !isParsing && !isAnalyzing

    return (
        <Card className="mx-auto w-full max-w-5xl border-border bg-card">
            <CardHeader>
                <CardTitle>New Application</CardTitle>
                <CardDescription>
                    Paste a job description, choose the resume to analyze, then review the match.
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="jobDescription">Job Description</Label>
                    <div className="relative">
                        <Textarea
                            id="jobDescription"
                            placeholder="Paste the job description here..."
                            className="min-h-40 resize-y pb-14"
                            value={jdText}
                            onChange={(event) => setJdText(event.target.value)}
                        />

                        <Button
                            className="absolute bottom-3 right-3"
                            disabled={!canParse}
                            onClick={onParse}
                            size="sm"
                            type="button"
                            variant="secondary"
                        >
                            {isParsing ? "Parsing..." : "Parse"}
                        </Button>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="companyName">Company Name</Label>
                        <Input
                            id="companyName"
                            placeholder="Company name"
                            value={companyName}
                            onChange={(event) => setCompanyName(event.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="roleTitle">Role Title</Label>
                        <Input
                            id="roleTitle"
                            placeholder="Role title"
                            value={roleTitle}
                            onChange={(event) => setRoleTitle(event.target.value)}
                        />
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label>Resume</Label>
                        <Select
                            value={selectedResumeId || undefined}
                            onValueChange={setSelectedResumeId}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select a resume..." />
                            </SelectTrigger>
                            <SelectContent>
                                {resumes.map((resume) => (
                                    <SelectItem key={resume.id} value={resume.id}>
                                        {resume.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="emailUsed">Email Used</Label>
                        <Input
                            id="emailUsed"
                            placeholder="name@example.com"
                            type="email"
                            value={emailUsed}
                            onChange={(event) => setEmailUsed(event.target.value)}
                        />
                    </div>
                </div>

                <div className="pt-2">
                    {isAnalyzing ? (
                        <div className="space-y-3">
                            <div className="h-3 w-1/2 animate-pulse rounded-md bg-muted" />
                            <div className="h-8 w-full animate-pulse rounded-lg bg-muted" />
                            <div className="h-4 w-2/3 animate-pulse rounded-md bg-muted" />
                        </div>
                    ) : (
                        <Button
                            className="w-full"
                            disabled={!canAnalyze}
                            onClick={onAnalyze}
                            type="button"
                        >
                            Analyze Resume Match
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
