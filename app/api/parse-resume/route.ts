import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod"
import { appendFile, mkdir } from "node:fs/promises"
import { join } from "node:path"
import { NextResponse } from "next/server"

import { anthropicClient } from "@/lib/anthropic"
import { ResumeStructuredDataSchema } from "@/lib/schemas/resume-structured-data"

async function appendClaudeResumeParseLog(record: Record<string, unknown>) {
    try {
        const logDirectory = join(process.cwd(), "logs")
        await mkdir(logDirectory, { recursive: true })
        await appendFile(
            join(logDirectory, "claude-resume-parse.jsonl"),
            `${JSON.stringify(record)}\n`,
            "utf8"
        )
    } catch (error) {
        console.error("Failed to write Claude resume parse log:", error)
    }
}

export async function POST(req: Request) {
    try {
        const { resumeText } = await req.json()

        if (!resumeText || typeof resumeText !== "string") {
            return NextResponse.json({ error: "Missing resume text" }, { status: 400 })
        }

        const response = await anthropicClient.messages.create({
            model: "claude-haiku-4-5",
            max_tokens: 6000,
            system: `You are a resume parser. Extract structured information from the resume text provided.
Be precise. Use exact company names, job titles, and bullet points as written.
Do not summarize or rewrite bullet points. Extract them verbatim.
Return one JSON object that matches the provided schema exactly.
If a string field cannot be found, return an empty string.
If a section cannot be found, return an empty array.
For id fields, create stable lowercase kebab-case IDs from the section's visible name and add the array index when needed for uniqueness.
For dates, preserve the visible date range as one string.
For project technologies, return one comma-separated string, not an array.
For skills, group skills by visible resume category. If no categories are visible, use category "Skills".`,
            messages: [
                {
                    role: "user",
                    content: `Here is the resume text:\n\n${resumeText}`,
                },
            ],
            output_config: {
                format: zodOutputFormat(ResumeStructuredDataSchema),
            },
            temperature: 0.1,
        })

        const timestamp = new Date().toISOString()
        const rawText = response.content
            .filter((block) => block.type === "text")
            .map((block) => block.text)
            .join("\n\n")
        const logContext = {
            timestamp,
            route: "parse-resume",
            model: response.model,
            stopReason: response.stop_reason,
            usage: response.usage,
            resumeTextLength: resumeText.length,
        }

        await appendClaudeResumeParseLog({
            ...logContext,
            rawText,
        })

        if (response.stop_reason === "refusal") {
            return NextResponse.json({ error: "Claude refused to parse the resume" }, { status: 400 })
        }

        let parsedJson: unknown

        try {
            parsedJson = JSON.parse(rawText)
        } catch (error) {
            await appendClaudeResumeParseLog({
                ...logContext,
                parseStatus: "failed",
                error: error instanceof Error ? error.message : String(error),
                rawText,
            })

            return NextResponse.json({ error: "Claude returned invalid JSON resume data" }, { status: 500 })
        }

        const validationResult = ResumeStructuredDataSchema.safeParse(parsedJson)

        if (!validationResult.success) {
            await appendClaudeResumeParseLog({
                ...logContext,
                parseStatus: "failed",
                error: validationResult.error.message,
                issues: validationResult.error.issues,
                rawText,
            })

            return NextResponse.json({ error: "Claude returned invalid resume structured data" }, { status: 500 })
        }

        return NextResponse.json(validationResult.data, { status: 200 })
    } catch (error) {
        console.error("Error parsing resume:", error)
        return NextResponse.json({ error: "Failed to parse resume" }, { status: 500 })
    }
}
