"use client";

import { Input } from "@/components/ui/input";
import { uploadResumeToBucket } from "@/lib/utils";
import { useState } from "react"
import { Origami } from "lucide-react";
import { Toggle } from "@/components/ui/toggle";

import type { TextItem, TextMarkedContent } from "pdfjs-dist/types/src/display/api";


const Page = () => {

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [resumeLabel, setResumeLabel] = useState("");
    const [resumeNote, setResumeNote] = useState("");
    const [resumeIsGolden, setResumeIsGolden] = useState(false);
    const [resumeStructuredData, setresumeStructuredData] = useState(null)

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {

        console.log("file change event: ", e);

        try {
        
            // e.target.files is a FileList, which is array-like
            // We use the optional chaining (?.) and [0] to get the first file
            const file = e.target.files?.[0] || null;
            setSelectedFile(file);

            // 2. convert the pdf to text
            const convertPDFToText = async (pdfFile: File | null) => {
                
                // for the pdf parser
                const pdfjs = await import('pdfjs-dist')
                pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;


                if (pdfFile) {
                    // 2.1 Convert File to ArrayBuffer for PDF.js
                    const arrayBuffer = await pdfFile?.arrayBuffer()

                    // 2.2 Load the PDF 
                    const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
                    const pdf = await loadingTask.promise;

                    let fullText = "";

                    // 2.3 Loop through each page
                    for (let i = 1; i <= pdf.numPages; i++) {
                        const page = await pdf.getPage(i)

                        // get the content of the page
                        const textContentOfPage = await page.getTextContent();
                        console.log("text content of an pdf page (log just to see how it looks like): ", textContentOfPage);

                        // we get the content of each item (pls see the log to see how the text content actually looks like )
                        const pageText = textContentOfPage.items
                            .map((item: TextItem | TextMarkedContent) => {
                                if ("str" in item) {
                                    return item.str
                                } else{
                                    return ""
                                }
                            })
                            .join(" ")

                        fullText += pageText + "\n\n"
                    }
                    
                    return fullText
                }
            }
            

            const fullPdfText = await convertPDFToText(file)
            
            // 3. parsed the text with Anthropic into structured JSON
            const response = await fetch ("/api/parse-resume/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    resumeText: fullPdfText
                })
            })

            const resumeStructuredData = await response.json()

            setresumeStructuredData(resumeStructuredData)

            console.log("the structured data parsed from the resume: ", resumeStructuredData)

        } catch (error) {
            console.error("Error while parsing resume content", error);
        }

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
                    fileUrl: fileUrl,
                    isGolden: resumeIsGolden,
                    structuredData: resumeStructuredData
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

                {/* Toggle for the isGolden shadcn toggle*/}
                <div className="mb-6 ">
                    <label htmlFor="isGolden" className="block text-sm font-medium text-gray-700 mb-1">
                        Mark as Golden Resume
                    </label>
                    <Toggle
                        id="isGolden"
                        pressed={resumeIsGolden}
                        variant="outline"
                        onPressedChange={(pressed) => setResumeIsGolden(pressed)}
                    >

                        <Origami className="group-data-[state=on]/toggle:fill-foreground" size={16} />
                        {resumeIsGolden ? "Yes, this is a golden resume" : "No, it's not a golden resume"}
                    </Toggle>
                </div>

                {/* Json display the structuredData */}
                {resumeStructuredData && (
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold mb-4">Parsed Resume Data (Structured JSON):</h2>
                        <pre className="bg-[#1e1e1e] text-slate-400 p-4 rounded-md border-l-4 border-emerald-500 selection:bg-emerald-500/30 overflow-x-auto">
                            {JSON.stringify(resumeStructuredData, null, 2)}
                        </pre>
                    </div>
                )}


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