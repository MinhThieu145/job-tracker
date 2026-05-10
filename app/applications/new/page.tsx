"use client";

import { useEffect, useState, type SetStateAction } from "react";
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
    }


    // handle the form submission
    const handleResumeAnalysis = async () => {
        setIsAnalyzing(true);
        setSelectedResumeStructuredData(null)
        setDraftResume(null)
        setAppliedFixes(new Set())
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
