"use client";

import { useEffect, useState } from "react";
import { ResumeVersion } from "@/generated/prisma/client";

export default function Page() {

    const [isParsing, setIsParsing] = useState(false); // State to indicate if parsing is in progress

    // job description data
    const [jdText, setJdText] = useState(""); // State to hold the job description text
    const [companyName, setCompanyName] = useState("");
    const [roleTitle, setRoleTitle] = useState("");
    const [emailUsed, setEmailUsed] = useState("");
    const [resumes, setResumes] = useState([]); // State to hold the list of resumes (if needed in the future)
    const [selectedResumeId, setSelectedResumeId] = useState(""); // State to hold the ID of the selected resume (if needed in the future)


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
    const handleSubmit = async () => {
        try {
            const response = await fetch("/api/applications", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    roleTitle: roleTitle,
                    companyName: companyName,
                    resumeId: selectedResumeId,
                    jobDescription: jdText,
                    emailUsed: emailUsed
                })
            })

                if (!response.ok) {
                    throw new Error(response.statusText || "Failed to submit the application");

                }

                console.log("Application submitted successfully");
                // Optionally, you can clear the form fields after successful submission
                setCompanyName("");
                setRoleTitle("");
                setEmailUsed("");
                setSelectedResumeId("");
                setJdText("");
        } catch (error) {
            console.error("Error submitting application:", error);
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
            setCompanyName(jobDescriptionData.companyName);
            setRoleTitle(jobDescriptionData.roleTitle);

        } catch (error) {
            console.error("Error parsing job description:", error);
        } finally {
            setIsParsing(false);
        }


    }
        
    return (
        <main className="min-h-screen">
            <div className="max-w-4xl mx-auto px-4 py-12">
                <div className="flex flex-col">
                    <h1 className="text-2xl font-bold mb-4">Job Description Form</h1>

                    {/* Input field for the job description */}
                    <div className="flex flex-col">
                        <label htmlFor="jobDescription" className="block text-sm font-medium text-gray-700 mb-1">
                            Job Description
                        </label>

                        <textarea
                            id="jobDescription"
                            placeholder="Paste the job description here..."
                            className=" w-full p-4 rounded-lg border border-gray-300"                    
                            value={jdText}
                            onChange={(e) => setJdText(e.target.value)}
                        />

                        <button
                            className="w-fit self-end bg-blue-500 hover:bg-blue-600 cursor-pointer text-white text-sm font-bold py-2 px-2 rounded-lg mt-4 "
                            onClick={handleParseJobDescription}
                            disabled={isParsing}
                        >
                            Parse Job Description
                        </button>
                    </div>

                    {/* Separated input fields (some has been refilled from the parser) */}
                    <div className="flex flex-col">
                        <h2 className="text-xl font-bold mt-8 mb-4">Parsed Job Information</h2>
                        
                        <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-1">
                            Company Name
                        </label>
                        <input
                            id="companyName"
                            type="text"
                            placeholder="Company Name"
                            className="w-full p-4 rounded-lg border border-gray-300"
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                        />

                        <label htmlFor="roleTitle" className="block text-sm font-medium text-gray-700 mb-1 mt-4">
                            Role Title
                        </label>
                        <input
                            id="roleTitle"
                            type="text"
                            placeholder="Role Title"
                            className="w-full p-4 rounded-lg border border-gray-300"
                            value={roleTitle}
                            onChange={(e) => setRoleTitle(e.target.value)}
                        />

                        <label htmlFor="emailUsed" className="block text-sm font-medium text-gray-700 mb-1 mt-4">
                            Email Used
                        </label>
                        <input
                            id="emailUsed"
                            type="email"
                            placeholder="Email Used"
                            className="w-full p-4 rounded-lg border border-gray-300"
                            value={emailUsed}
                            onChange={(e) => setEmailUsed(e.target.value)}
                        />

                        <label htmlFor="resumeSelection" className="block text-sm font-medium text-gray-700 mb-1 mt-4">
                            Resume Selection
                        </label>
                        <select
                            value={selectedResumeId}
                            onChange={(e) => setSelectedResumeId(e.target.value)}
                            className=  "w-full p-3 rounded-lg border appearance-none cursor-pointer "
                        >
                            <option className="text-black" value="">Select a resume...</option>
                            {
                                resumes.map( (resume: ResumeVersion) => (
                                    <option key={resume.id} value={resume.id} className="rounded-lg p-2 text-black">
                                        {resume.label}
                                    </option>
                                )
                                )
                            }
                        </select>

                        <button
                            className="w-fit self-end bg-blue-500 hover:bg-blue-600 cursor-pointer text-white text-sm font-bold py-2 px-4 rounded-lg mt-4"
                            onClick={handleSubmit}
                        >
                            Submit Application
                        </button>

                    </div>



                </div>

            </div>
        </main>
    )
}
