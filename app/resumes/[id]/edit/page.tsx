"use client";

import { useEffect, useState } from "react"
import { useParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { deleteResumeFromBucket, uploadResumeToBucket } from "@/lib/utils";

export default function EditResumePage({ params }: { params: Promise<{ id: string }> }) {

    const { id } = useParams<{ id: string }>();

    const [resumeFile, setResumeFile] = useState<File | null>(null);
    const [resumeFileUrl, setResumeFileUrl] = useState("");
    const [resumeFileName, setResumeFileName] = useState("");
    const [resumeLabel, setResumeLabel] = useState("");
    const [resumeNote, setResumeNote] = useState("");


    // we have to get the data of the resume from prisma
    useEffect( () => {
        // fetch the resume
        const fetchedResume = async() => {
            try {
                const response = await fetch(`/api/resumes/${id}`)

                const resumeData = await response.json();

                setResumeLabel(resumeData.label)
                setResumeNote(resumeData.notes)
                setResumeFileName(resumeData.fileName)
                setResumeFileUrl(resumeData.fileUrl)

            } catch (error) {
                console.error("Error fetching resume:", error)

            }
        }

        fetchedResume();
    }, []);


    const handleResumeSubmit = async () => {
        try {
            // keep the old one in case user not update
            let newResumeFileUrl = resumeFileUrl
            let newResumeFileName = resumeFileName
            
            // if user pick a new file (so it's not null)
            if ( resumeFile ) {
                // 1. we have to upload that file to supabase storage
                const { fileUrl, fileName, storagePath  } = await uploadResumeToBucket(resumeFile)
                
                newResumeFileUrl = fileUrl
                newResumeFileName = fileName

            }

            // 2. then save the record to the db (update the old record)
            const resumeSavingResponse = await fetch(`/api/resumes/${id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    label: resumeLabel,
                    notes: resumeNote,
                    fileUrl: newResumeFileUrl,
                    fileName: newResumeFileName
                })
            });

            // 3. then we delete old pdf from the storage
            if (resumeFile) {
                await deleteResumeFromBucket(resumeFileName)
            }

        } catch (error){
            console.log("Failed to edit the current resume version:", error);

        }
    }

    return (
        <main className="min-h-screen">
            <div className="flex flex-col max-w-4xl mx-auto py-10 px-4">
                <h1 className="text-4xl font-bold mb-8">
                    Edit your resume
                </h1>


                <div className="mb-6">
                    <label htmlFor="resumeLabel" className="block text-sm font-medium text-gray-700 mb-1">
                        Resume Label
                    </label>
                    <Input
                        id="resumeLabel"
                        type="text"
                        placeholder="e.g., My Professional Resume V3"
                        onChange={(e) => setResumeLabel(e.target.value)}
                        value={resumeLabel}
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
                        value={resumeNote}
                        className="w-full p-4 rounded-lg text-sm border border-gray-400 text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Resume File
                    </label>

                    <div className="flex items-center gap-4 p-4 rounded-lg border border-gray-400 mb-3">
                        <span>📄 {resumeFileName || "No file uploaded"}</span>
                        <button
                            onClick={() => window.open(resumeFileUrl, "_blank")}
                            className="text-blue-500 hover:underline text-sm"
                        >
                            View current
                        </button>
                    </div>

                    <input
                        type="file"
                        accept=".pdf"
                        onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                        className="w-full p-4 rounded-lg border border-gray-400 cursor-pointer"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                        Leave empty to keep current file. Pick a new file to replace it.
                    </p>
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