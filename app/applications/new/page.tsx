"use client";

import { useEffect, useState } from "react";
import type { ResumeVersion } from "@/generated/prisma/client";
import type { AiSuggestion } from "@/lib/resume-demo-data";
import ResumeEditor from "@/app/resume-editor/ResumeEditor";
import NewApplicationForm from "./NewApplicationForm";
import ResumeAnalysisResult from "./ResumeAnalysisResults";

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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [resumeAnalysisResult, setresumeAnalysisResult] = useState<any>(null); // State to hold the analysis result (if needed for future use)
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


    // handle the form submission
    const handleResumeAnalysis = async () => {
        setIsAnalyzing(true);

        try {
            const resumeAnalysisResult = await fetch("/api/resume-comparision", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(
                    {
                        resumeId: selectedResumeId,
                        jobDescription: jdText,
                    })
            })

            if (!resumeAnalysisResult.ok) {
                throw new Error("Failed to analyze the resume with the job description");
            }

            const resumeAnalysisData = await resumeAnalysisResult.json();
            setJobDescriptionParsingResult({ companyName, roleTitle });
            setresumeAnalysisResult(resumeAnalysisData)
            setView('analysis')

            console.log("Finish analyze the resume")
            console.log("Current job description:", jobDescriptionParsingResult);
            console.log("Current resume analysis:", resumeAnalysisData);

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

    if (view === 'editor' && resumeAnalysisResult) {
        return (
            <ResumeEditor
                aiSuggestions={resumeAnalysisResult.aiSuggestions}
                matchScore={resumeAnalysisResult.matchScore}
                strengthCount={resumeAnalysisResult.strengthCount}
                initialTargetSuggestion={targetSuggestion}
                onBackToAnalysis={() => setView('analysis')}
            />
        )
    }

    if (view === 'analysis' && resumeAnalysisResult && jobDescriptionParsingResult) {
        return (
            <main className="min-h-screen">
                <ResumeAnalysisResult
                    resumeAnalysisData={resumeAnalysisResult}
                    jobDescriptionParsingData={jobDescriptionParsingResult}
                    resumeList={resumes}
                    defaultSelectedResumeId={selectedResumeId}
                    onEdit={() => setView('form')}
                    matchScore={resumeAnalysisResult.matchScore}
                    strengthCount={resumeAnalysisResult.strengthCount}
                    aiSuggestions={resumeAnalysisResult.aiSuggestions}
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
                setSelectedResumeId={setSelectedResumeId}
                isParsing={isParsing}
                isAnalyzing={isAnalyzing}
                onParse={handleParseJobDescription}
                onAnalyze={handleResumeAnalysis}
            />
        </main>
    )
}
