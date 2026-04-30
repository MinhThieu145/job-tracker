"use client"

import { DataTable } from "@/components/data-table"
import { createColumns } from "../dashboard/resumeColumns"
import { useEffect, useState } from "react"
import { useRouter } from 'next/navigation'


const Page = () => {

    const [resumeData, setResumeData] = useState([]);
    const router = useRouter()

    const columns = createColumns({
        onDelete: async (id) => {
            await fetch("/api/resumes", {
                method: "DELETE",
                body: JSON.stringify({ resumeId: id })
            })
        },

        onEdit: (id) => {
            router.push(`/resumes/${id}/edit`)
        },

        onViewPdf: (fileUrl) => {
            window.open(fileUrl, "_blank")
        }

    });

    useEffect(() => {
        const fetchResume = async () => {
            const response = await fetch("/api/resumes");

            if (!response.ok) {
                console.error("Failed to fetch resume")
                return;
            }

            const resumeData = await response.json()
            console.log("resume data fetched successfully", resumeData)
            setResumeData(resumeData)
        }

        fetchResume();

    }, []);

    return (
        <main className="min-h-screen">
            <div className="max-w-4xl mx-auto px-4 py-12">
                <h1 className="text-2xl font-bold mb-4">Resume Versions</h1>

                <div className="flex flex-col">

                    <DataTable columns={columns} data={resumeData} />

                </div>

            </div>
        </main>
    )
}

export default Page