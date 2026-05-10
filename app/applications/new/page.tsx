"use client";

import { useEffect, useState, type SetStateAction } from "react";
import { useRouter } from "next/navigation";
import type { ResumeVersion } from "@/generated/prisma/client";
import type { ResumeAnalysis } from "@/lib/schemas/resume-analysis";
import type { AiSuggestion, SuggestionsResponse } from "@/lib/schemas/resume-suggestions";
import {
    ResumeStructuredDataSchema,
    type ResumeStructuredData,
} from "@/lib/schemas/resume-structured-data";
import ResumeEditor from "./ResumeEditor";
import NewApplicationForm from "./NewApplicationForm";
import ResumeAnalysisResult from "./ResumeAnalysisResults";

type ResumeAnalysisResponse = ResumeAnalysis & {
    strengthCount: number
}

export default function Page() {
    const router = useRouter()

    const [isParsing, setIsParsing] = useState(false); // State to indicate if parsing is in progress

    // job description data
    const [jdText, setJdText] = useState(""); // State to hold the job description text
    const [companyName, setCompanyName] = useState("");
    const [roleTitle, setRoleTitle] = useState("");
    const [emailUsed, setEmailUsed] = useState("");
    const [resumes, setResumes] = useState<ResumeVersion[]>([]); // State to hold the list of resumes (if needed in the future)
    const [selectedResumeId, setSelectedResumeId] = useState(""); // State to hold the ID of the selected resume (if needed in the future)

    // state to manage the result page
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [view, setView] = useState<'form' | 'analysis' | 'editor'>('form')
    const [targetSuggestion, setTargetSuggestion] = useState<AiSuggestion | null>(null)
    const [resumeAnalysisResult, setresumeAnalysisResult] = useState<ResumeAnalysisResponse | null>(null); // State to hold the analysis result (if needed for future use)
    const [aiSuggestions, setAiSuggestions] = useState<AiSuggestion[] | null>(null)
    const [selectedResumeStructuredData, setSelectedResumeStructuredData] = useState<ResumeStructuredData | null>(null)
    const [draftResume, setDraftResume] = useState<ResumeStructuredData | null>(null)
    const [appliedFixes, setAppliedFixes] = useState<Set<string>>(new Set())
    const [savedTailoredResumeId, setSavedTailoredResumeId] = useState<string | null>(null)
    const [isDraftDirty, setIsDraftDirty] = useState(false)
    const [isSavingTailoredResume, setIsSavingTailoredResume] = useState(false)
    const [isSubmittingApplication, setIsSubmittingApplication] = useState(false)
    const [tailoredResumeSaveError, setTailoredResumeSaveError] = useState<string | null>(null)
    const [applicationSubmitError, setApplicationSubmitError] = useState<string | null>(null)
    const [jobDescriptionParsingResult, setJobDescriptionParsingResult] = useState<{
        companyName: string
        roleTitle: string
    } | null>(null)


    // run once
    useEffect(() => {
        const fetchedResumes = async () => {
            const resumeResponse = await fetch("/api/resumes");
            if (!resumeResponse.ok) {
                console.error("Failed to fetch resumes");
                return;
            }

            const resumesData = await resumeResponse.json();
            console.log("Fetched resumes:", resumesData);

            setResumes(resumesData); // Store the fetched resumes in state (if needed for future use)
        }

        // Call the function to fetch resumes
        fetchedResumes();

    }, []);


    const handleSelectedResumeChange = (resumeId: string) => {
        setSelectedResumeId(resumeId)
        setSelectedResumeStructuredData(null)
        setDraftResume(null)
        setAppliedFixes(new Set())
        setSavedTailoredResumeId(null)
        setIsDraftDirty(false)
        setTailoredResumeSaveError(null)
        setApplicationSubmitError(null)
        setresumeAnalysisResult(null)
        setAiSuggestions(null)
        setTargetSuggestion(null)
    }

    const handleDraftResumeChange = (action: SetStateAction<ResumeStructuredData>) => {
        setDraftResume((previous) => {
            if (!previous) {
                return previous
            }

            return typeof action === "function" ? action(previous) : action
        })
        setIsDraftDirty(true)
        setTailoredResumeSaveError(null)
    }

    const buildTailoredResumeLabel = () => {
        const role = roleTitle.trim()
        const company = companyName.trim()

        if (role && company) {
            return `${role} - ${company} tailored resume`
        }

        if (role) {
            return `${role} tailored resume`
        }

        if (company) {
            return `${company} tailored resume`
        }

        const parentResume = resumes.find((resume) => resume.id === selectedResumeId)
        return `${parentResume?.label ?? "Resume"} - tailored`
    }

    const buildTailoredResumeNotes = () => {
        const details = [companyName.trim(), roleTitle.trim()].filter(Boolean).join(" - ")
        return details ? `Tailored for ${details}` : "Tailored from application editor"
    }

    const ensureTailoredResumeSaved = async () => {
        if (!draftResume) {
            throw new Error("No draft resume to save")
        }

        if (!selectedResumeId) {
            throw new Error("No parent resume selected")
        }

        if (savedTailoredResumeId && !isDraftDirty) {
            return savedTailoredResumeId
        }

        setIsSavingTailoredResume(true)
        setTailoredResumeSaveError(null)

        try {
            const payload = {
                label: buildTailoredResumeLabel(),
                notes: buildTailoredResumeNotes(),
                structuredData: draftResume,
            }

            if (savedTailoredResumeId) {
                const response = await fetch(`/api/resumes/${savedTailoredResumeId}`, {
                    method: "PATCH",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(payload),
                })

                if (!response.ok) {
                    throw new Error("Failed to update tailored resume")
                }

                const savedResume = await response.json() as ResumeVersion
                setSavedTailoredResumeId(savedResume.id)
                setIsDraftDirty(false)
                return savedResume.id
            }

            const response = await fetch("/api/resumes/tailored", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    parentResumeId: selectedResumeId,
                    ...payload,
                }),
            })

            if (!response.ok) {
                throw new Error("Failed to create tailored resume")
            }

            const savedResume = await response.json() as ResumeVersion
            setSavedTailoredResumeId(savedResume.id)
            setIsDraftDirty(false)
            return savedResume.id
        } catch (error) {
            const message = error instanceof Error ? error.message : "Failed to save tailored resume"
            setTailoredResumeSaveError(message)
            throw error
        } finally {
            setIsSavingTailoredResume(false)
        }
    }

    const handleSaveTailoredResume = async () => {
        try {
            const tailoredResumeId = await ensureTailoredResumeSaved()
            console.log("Tailored resume saved:", tailoredResumeId)
        } catch (error) {
            console.error("Error saving tailored resume:", error)
        }
    }

    const handleSubmitApplication = async () => {
        setIsSubmittingApplication(true)
        setApplicationSubmitError(null)
        setTailoredResumeSaveError(null)

        try {
            if (!resumeAnalysisResult) {
                throw new Error("No resume analysis to submit")
            }

            if (!aiSuggestions) {
                throw new Error("No resume suggestions to submit")
            }

            const submitCompanyName = jobDescriptionParsingResult?.companyName || companyName
            const submitRoleTitle = jobDescriptionParsingResult?.roleTitle || roleTitle

            if (!submitCompanyName.trim()) {
                throw new Error("Missing company name")
            }

            if (!submitRoleTitle.trim()) {
                throw new Error("Missing role title")
            }

            if (!jdText.trim()) {
                throw new Error("Missing job description")
            }

            const finalResumeId = await ensureTailoredResumeSaved()
            const response = await fetch("/api/applications", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    companyName: submitCompanyName,
                    roleTitle: submitRoleTitle,
                    resumeId: finalResumeId,
                    jobDescription: jdText,
                    emailUsed,
                    analysisResult: resumeAnalysisResult,
                    aiSuggestions,
                }),
            })

            if (!response.ok) {
                let errorMessage = "Failed to submit application"

                try {
                    const errorPayload = await response.json()
                    if (typeof errorPayload.error === "string") {
                        errorMessage = errorPayload.error
                    }
                } catch {
                    // Keep the generic message when the response body is not JSON.
                }

                throw new Error(errorMessage)
            }

            router.push("/")
        } catch (error) {
            const message = error instanceof Error ? error.message : "Failed to submit application"
            setApplicationSubmitError(message)
            setTailoredResumeSaveError(message)
            console.error("Error submitting application:", error)
        } finally {
            setIsSubmittingApplication(false)
        }
    }


    // handle the form submission
    const handleResumeAnalysis = async () => {
        setIsAnalyzing(true);
        setSelectedResumeStructuredData(null)
        setDraftResume(null)
        setAppliedFixes(new Set())
        setSavedTailoredResumeId(null)
        setIsDraftDirty(false)
        setTailoredResumeSaveError(null)
        setApplicationSubmitError(null)
        setAiSuggestions(null)
        setTargetSuggestion(null)

        try {
            const requestBody = JSON.stringify({
                resumeId: selectedResumeId,
                jobDescription: jdText,
            })

            const [analysisResponse, suggestionsResponse] = await Promise.all([
                fetch("/api/resume-comparision", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: requestBody,
                }),
                fetch("/api/suggestions", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: requestBody,
                }),
            ])

            if (!analysisResponse.ok) {
                throw new Error("Failed to analyze the resume with the job description");
            }

            if (!suggestionsResponse.ok) {
                throw new Error("Failed to generate resume suggestions");
            }

            const analysisData = await analysisResponse.json() as ResumeAnalysisResponse;
            const suggestionsPayload = await suggestionsResponse.json() as SuggestionsResponse;
            const selectedResume = resumes.find((resume) => resume.id === selectedResumeId)
            const structuredDataResult = ResumeStructuredDataSchema.safeParse(selectedResume?.structuredData)

            if (!structuredDataResult.success) {
                throw new Error("Selected resume has invalid structured data")
            }

            setJobDescriptionParsingResult({ companyName, roleTitle });
            setresumeAnalysisResult(analysisData)
            setAiSuggestions(suggestionsPayload.aiSuggestions)
            setSelectedResumeStructuredData(structuredDataResult.data)
            setDraftResume(structuredDataResult.data)
            setView('analysis')

            console.log("Finish analyze the resume")
            console.log("Current job description:", jobDescriptionParsingResult);
            console.log("Current resume analysis:", analysisData);
            console.log("Current resume suggestions:", suggestionsPayload);

        } catch (error) {
            console.error("Error submitting application:", error);
        } finally {
            setIsAnalyzing(false);
        }
    }



    // Handler function for the Parsing Form button
    const handleParseJobDescription = async () => {
        setIsParsing(true);

        try {
            const response = await fetch("/api/parse-jd", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    jobDescription: jdText,
                })
            });

            if (!response.ok) {
                throw new Error("Failed to parse the job description");
            }

            console.log("Job description parsed successfully");

            const jobDescriptionData = await response.json();
            setJobDescriptionParsingResult(jobDescriptionData);
            setCompanyName(jobDescriptionData.companyName);
            setRoleTitle(jobDescriptionData.roleTitle);

        } catch (error) {
            console.error("Error parsing job description:", error);
        } finally {
            setIsParsing(false);
        }


    }

    if (view === 'editor' && resumeAnalysisResult && selectedResumeStructuredData && draftResume && aiSuggestions) {
        return (
            <ResumeEditor
                resume={draftResume}
                onResumeChange={handleDraftResumeChange}
                appliedFixes={appliedFixes}
                onAppliedFixesChange={setAppliedFixes}
                onSaveTailoredResume={handleSaveTailoredResume}
                onSubmitApplication={handleSubmitApplication}
                isSavingTailoredResume={isSavingTailoredResume}
                isSubmittingApplication={isSubmittingApplication}
                isDraftDirty={isDraftDirty}
                savedTailoredResumeId={savedTailoredResumeId}
                tailoredResumeSaveError={tailoredResumeSaveError}
                aiSuggestions={aiSuggestions}
                matchScore={resumeAnalysisResult.matchScore}
                strengthCount={resumeAnalysisResult.strengthCount}
                initialTargetSuggestion={targetSuggestion}
                onBackToAnalysis={() => setView('analysis')}
            />
        )
    }

    if (view === 'analysis' && resumeAnalysisResult && jobDescriptionParsingResult && selectedResumeStructuredData && draftResume && aiSuggestions) {
        return (
            <main className="min-h-screen">
                <ResumeAnalysisResult
                    resumeAnalysisData={resumeAnalysisResult}
                    jobDescriptionParsingData={jobDescriptionParsingResult}
                    resumeList={resumes}
                    defaultSelectedResumeId={selectedResumeId}
                    resumeStructuredData={draftResume}
                    onEdit={() => setView('form')}
                    matchScore={resumeAnalysisResult.matchScore}
                    strengthCount={resumeAnalysisResult.strengthCount}
                    aiSuggestions={aiSuggestions}
                    onSubmitApplication={handleSubmitApplication}
                    isSubmittingApplication={isSubmittingApplication}
                    applicationSubmitError={applicationSubmitError}
                    onFixNow={(suggestion) => {
                        setTargetSuggestion(suggestion)
                        setView('editor')
                    }}
                />
            </main>
        )
    }

    return (
        <main className="min-h-screen px-4 py-10">
            <NewApplicationForm
                jdText={jdText}
                setJdText={setJdText}
                companyName={companyName}
                setCompanyName={setCompanyName}
                roleTitle={roleTitle}
                setRoleTitle={setRoleTitle}
                emailUsed={emailUsed}
                setEmailUsed={setEmailUsed}
                resumes={resumes}
                selectedResumeId={selectedResumeId}
                setSelectedResumeId={handleSelectedResumeChange}
                isParsing={isParsing}
                isAnalyzing={isAnalyzing}
                onParse={handleParseJobDescription}
                onAnalyze={handleResumeAnalysis}
            />
        </main>
    )
}
