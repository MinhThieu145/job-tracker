import type { TextItem, TextMarkedContent } from "pdfjs-dist/types/src/display/api"

import type { ResumeStructuredData } from "@/lib/schemas/resume-structured-data"

export async function convertResumePdfToText(pdfFile: File) {
    const pdfjs = await import("pdfjs-dist")
    pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

    const arrayBuffer = await pdfFile.arrayBuffer()
    const loadingTask = pdfjs.getDocument({ data: arrayBuffer })
    const pdf = await loadingTask.promise

    let fullText = ""

    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i)
        const textContentOfPage = await page.getTextContent()
        const pageText = textContentOfPage.items
            .map((item: TextItem | TextMarkedContent) => {
                if ("str" in item) {
                    return item.str
                }

                return ""
            })
            .join(" ")

        fullText += `${pageText}\n\n`
    }

    return fullText
}

export async function parseResumeFile(pdfFile: File): Promise<ResumeStructuredData> {
    const resumeText = await convertResumePdfToText(pdfFile)
    const response = await fetch("/api/parse-resume", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            resumeText,
        }),
    })

    if (!response.ok) {
        const errorBody = await response.json().catch(() => null)
        throw new Error(errorBody?.error ?? "Failed to parse resume")
    }

    return await response.json() as ResumeStructuredData
}
