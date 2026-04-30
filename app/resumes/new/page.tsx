"use client";

import { Input } from "@/components/ui/input";
import { uploadResumeToBucket } from "@/lib/utils";
import { useState } from "react"


const Page = () => {

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [resumeLabel, setResumeLabel] = useState("");
    const [resumeNote, setResumeNote] = useState("");

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // e.target.files is a FileList, which is array-like
        // We use the optional chaining (?.) and [0] to get the first file
        const file = e.target.files?.[0] || null;
        setSelectedFile(file);
    };

    const handleResumeSubmit = async () => {
        if (!selectedFile || !resumeLabel) {
            alert("Please upload a resume and provide a label before saving.");
            return
        } 
        

        // now we save the resume info to supabase database
        try {
            // upload the file to supabase storage
            const { fileUrl, fileName } = await uploadResumeToBucket(selectedFile)

            const response = await fetch("/api/resumes", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    label: resumeLabel,
                    notes: resumeNote,
                    fileName: fileName,
                    fileUrl: fileUrl
                })
            });

            if (!response.ok) {
                throw new Error("API request failed to save resume to db");
            }
        
        } catch (error) {
            console.error("Error with upload resume:", error);
        }


    }


    return (
        <main className="min-h-screen">
            <div className="flex flex-col max-w-4xl mx-auto py-10 px-4">
                <h1 className="text-4xl font-bold mb-8">
                    Create a New Resume
                </h1>

                <div className="mb-6">
                    <label htmlFor="resumeUpload" className="block text-sm font-medium text-gray-700 mb-1">
                        Upload your resume (PDF, DOC, DOCX)
                    </label>
                    <Input
                        id="resumeUpload"
                        type="file"
                        accept=".pdf, .doc, .docx"
                        className=" w-full rounded-lg border border-gray-400 text-gray-500 cursor-pointer"
                        onChange={handleFileChange}
                    />
                </div>

                <div className="mb-6">
                    <label htmlFor="resumeLabel" className="block text-sm font-medium text-gray-700 mb-1">
                        Resume Label
                    </label>
                    <Input
                        id="resumeLabel"
                        type="text"
                        placeholder="e.g., My Professional Resume V3"
                        onChange={(e) => setResumeLabel(e.target.value)}
                        className="w-full p-4 rounded-lg text-sm border border-gray-400 text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div className="mb-6">
                    <label htmlFor="resumeNote" className="block text-sm font-medium text-gray-700 mb-1">
                        Additional Notes
                    </label>
                    <textarea
                        id="resumeNote"
                        placeholder="Any additional information or notes about this resume version..."
                        onChange={(e) => setResumeNote(e.target.value)}
                        className="w-full p-4 rounded-lg text-sm border border-gray-400 text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                
                </div>

                <button
                    className="w-fit self-end bg-blue-500 hover:bg-blue-600 cursor-pointer text-white text-sm font-bold py-2 px-4 rounded-lg"
                    onClick={handleResumeSubmit}
                >
                    Save Resume
                </button>

            </div>
        </main>
    )
}

export default Page