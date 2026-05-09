import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod"
import { appendFile, mkdir } from "node:fs/promises"
import { join } from "node:path"
import { NextResponse } from "next/server"

import { anthropicClient } from "@/lib/anthropic"
import { prisma } from "@/lib/prisma"
import { AI_SUGGESTIONS } from "@/lib/resume-demo-data"
import {
    ResumeStructuredDataSchema,
    type ResumeStructuredData,
} from "@/lib/schemas/resume-structured-data"
import {
    SuggestionsResponseSchema,
    type SuggestionsResponse,
} from "@/lib/schemas/resume-suggestions"

async function appendClaudeSuggestionsLog(record: Record<string, unknown>) {
    try {
        const logDirectory = join(process.cwd(), "logs")
        await mkdir(logDirectory, { recursive: true })
        await appendFile(
            join(logDirectory, "claude-resume-suggestions.jsonl"),
            `${JSON.stringify(record)}\n`,
            "utf8"
        )
    } catch (error) {
        console.error("Failed to write Claude suggestions log:", error)
    }
}

function getInvalidSuggestionTargets(
    aiSuggestions: SuggestionsResponse["aiSuggestions"],
    structuredData: ResumeStructuredData
) {
    return aiSuggestions.flatMap((suggestion) => {
        const targetExperience = structuredData.experience.find(
            (experience) => experience.id === suggestion.experienceId
        )

        if (!targetExperience) {
            return [{
                suggestionId: suggestion.id,
                experienceId: suggestion.experienceId,
                bulletIndex: suggestion.bulletIndex,
                reason: "experienceId does not exist on the selected resume",
            }]
        }

        if (
            !Number.isInteger(suggestion.bulletIndex) ||
            suggestion.bulletIndex < 0 ||
            suggestion.bulletIndex >= targetExperience.bullets.length
        ) {
            return [{
                suggestionId: suggestion.id,
                experienceId: suggestion.experienceId,
                bulletIndex: suggestion.bulletIndex,
                reason: "bulletIndex does not exist on the target experience",
            }]
        }

        return []
    })
}

export async function POST(req: Request) {
    try {
        const { resumeId, jobDescription } = await req.json()

        if (!resumeId || typeof resumeId !== "string") {
            return NextResponse.json({ error: "Missing resumeId" }, { status: 400 })
        }

        if (!jobDescription || typeof jobDescription !== "string") {
            return NextResponse.json({ error: "Missing or error parsing job description" }, { status: 400 })
        }

        const resumeData = await prisma.resumeVersion.findUnique({
            where: {
                id: resumeId,
            },
        })

        if (!resumeData) {
            return NextResponse.json({ error: "Resume not found" }, { status: 404 })
        }

        if (!resumeData.structuredData) {
            return NextResponse.json({ error: "Resume has no structuredData" }, { status: 400 })
        }

        const structuredDataResult = ResumeStructuredDataSchema.safeParse(resumeData.structuredData)

        if (!structuredDataResult.success) {
            return NextResponse.json(
                {
                    error: "Resume has invalid structuredData",
                    issues: structuredDataResult.error.issues,
                },
                { status: 400 }
            )
        }

        const structuredData = structuredDataResult.data

        if (process.env.USE_DEMO_DATA === "true") {
            return NextResponse.json({ aiSuggestions: AI_SUGGESTIONS }, { status: 200 })
        }

        const prompt = `
        You are a resume rewrite strategist.

        Generate up to 6 specific bullet rewrite suggestions for this job description and resume.

        Rules:
        - Only suggest edits to existing experience bullets.
        - Focus on the highest-impact truthful changes for this role.
        - Do not invent employers, projects, tools, metrics, responsibilities, or outcomes.
        - If a gap cannot be fixed truthfully from the resume evidence, do not create a suggestion for it.
        - experienceId must exactly match one of the provided RESUME STRUCTURED DATA experience[].id values.
        - bulletIndex must be zero-based and must point to an existing bullet in that experience.
        - newText must be a full replacement bullet, not commentary.
        - priority must be either "critical" or "important".
        - title should be short and action-oriented.
        - why should explain why the rewrite matters for this specific role.

        JOB DESCRIPTION:
        ${jobDescription}

        RESUME STRUCTURED DATA:
        ${JSON.stringify(structuredData, null, 2)}
        `

        const response = await anthropicClient.messages.create({
            model: "claude-sonnet-4-6",
            max_tokens: 3000,
            output_config: {
                format: zodOutputFormat(SuggestionsResponseSchema),
            },
            messages: [
                {
                    role: "user",
                    content: prompt,
                },
            ],
        })

        const timestamp = new Date().toISOString()
        const rawText = response.content
            .filter((block) => block.type === "text")
            .map((block) => block.text)
            .join("\n\n")
        const logContext = {
            timestamp,
            route: "suggestions",
            model: response.model,
            stopReason: response.stop_reason,
            usage: response.usage,
            resumeId,
        }

        await appendClaudeSuggestionsLog({
            ...logContext,
            rawText,
        })

        if (response.stop_reason === "refusal") {
            return NextResponse.json({ error: "Claude refused to generate suggestions" }, { status: 400 })
        }

        let parsedJson: unknown

        try {
            parsedJson = JSON.parse(rawText)
        } catch (error) {
            await appendClaudeSuggestionsLog({
                ...logContext,
                parseStatus: "failed",
                error: error instanceof Error ? error.message : String(error),
                rawText,
            })

            return NextResponse.json({ error: "Claude returned invalid JSON suggestions" }, { status: 500 })
        }

        const validationResult = SuggestionsResponseSchema.safeParse(parsedJson)

        if (!validationResult.success) {
            await appendClaudeSuggestionsLog({
                ...logContext,
                parseStatus: "failed",
                error: validationResult.error.message,
                issues: validationResult.error.issues,
                rawText,
            })

            return NextResponse.json({ error: "Claude returned invalid suggestions shape" }, { status: 500 })
        }

        const suggestions = validationResult.data
        const invalidSuggestionTargets = getInvalidSuggestionTargets(suggestions.aiSuggestions, structuredData)

        if (invalidSuggestionTargets.length > 0) {
            await appendClaudeSuggestionsLog({
                ...logContext,
                parseStatus: "failed",
                error: "Claude returned aiSuggestions with invalid resume targets",
                invalidSuggestionTargets,
                rawText,
            })

            return NextResponse.json(
                {
                    error: "Claude returned invalid aiSuggestion targets",
                    invalidSuggestionTargets,
                },
                { status: 500 }
            )
        }

        return NextResponse.json(suggestions, { status: 200 })
    } catch (error) {
        console.error("Error generating resume suggestions:", error)
        return NextResponse.json({ error: "Failed to generate resume suggestions" }, { status: 500 })
    }
}
