import { anthropicClient } from "@/lib/anthropic";
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import {
    ResumeAnalysisSchema,
    ResumeAnalysisSchemaLenient,
    type ResumeAnalysisLenient,
} from "@/lib/schemas/resume-analysis";
import { ResumeStructuredDataSchema } from "@/lib/schemas/resume-structured-data";
import { RESUME_ANALYSIS_DEMO } from "@/lib/demo/resume-analysis-demo";
import { appendFile, mkdir } from "node:fs/promises";
import { join } from "node:path";

async function appendClaudeAnalysisLog(record: Record<string, unknown>) {
    try {
        const logDirectory = join(process.cwd(), "logs");
        await mkdir(logDirectory, { recursive: true });
        await appendFile(
            join(logDirectory, "claude-resume-analysis.jsonl"),
            `${JSON.stringify(record)}\n`,
            "utf8"
        );
    } catch (error) {
        console.error("Failed to write Claude response log:", error);
    }
}

export async function POST(req: Request) {
    try {
        // 1. we take in the resumeId and jobDescription
        const { resumeId, jobDescription } = await req.json()

        // 2. get the resume data structured
        const resumeData = await prisma.resumeVersion.findUnique({
            where: {
                id: resumeId
            }
        })


        // Since the resumeData can be null we would need at least 2 check like this
        // so that typescript is not complain
        if (!resumeData) {
            return NextResponse.json(
                { error: "Resume not found" },
                { status: 404 }
            );
        }

        if (!resumeData.structuredData) {
            return NextResponse.json(
                { error: "Resume has no structuredData" },
                { status: 400 }
            );
        }

        // while we at it. Might as well also check this.
        // typescript not complain but it's good to check
        if (!jobDescription || typeof (jobDescription) != "string") {
            return NextResponse.json({ error: "Missing or error parsing job description" }, { status: 400 })
        }

        const structuredDataResult = ResumeStructuredDataSchema.safeParse(resumeData.structuredData);

        if (!structuredDataResult.success) {
            return NextResponse.json(
                {
                    error: "Resume has invalid structuredData",
                    issues: structuredDataResult.error.issues,
                },
                { status: 400 }
            );
        }

        const structuredData = structuredDataResult.data;


        if (process.env.USE_DEMO_DATA === "true") {
            return NextResponse.json(RESUME_ANALYSIS_DEMO, { status: 200 })
        }

        // 3. Now we gotta feed the AI both and got the result back

        // 3.1 Build the prompt for the Claude AI
        const prompt = `
        You are a Senior Technical Recruiter and Resume Positioning Analyst.

        Compare this job description against this resume structured data.

        Rules:
        - Ignore location, visa, education, degree type, and logistics.
        - Focus only on work, responsibilities, tools, skills, and business needs.
        - Do not invent experience.
        - Use exact resume evidence when claiming a match.
        - Do not generate bullet rewrites, fix cards, or next-action lists.
        - bestEvidence must be plain evidence strings, not nested objects.
        - criticalGaps should describe important missing or risky signals, even when they cannot be fixed truthfully.

        JOB DESCRIPTION:
        ${jobDescription}

        RESUME STRUCTURED DATA:
        ${JSON.stringify(structuredData, null, 2)}
        `;

        const response = await anthropicClient.messages.create({
            model: "claude-sonnet-4-6",
            max_tokens: 6000,
            output_config: {
                format: zodOutputFormat(ResumeAnalysisSchema),
            },
            messages: [
                {
                    role: "user",
                    content: prompt,
                },
            ],
        });

        const timestamp = new Date().toISOString();
        const rawText = response.content
            .filter((block) => block.type === "text")
            .map((block) => block.text)
            .join("\n\n");
        const logContext = {
            timestamp,
            route: "resume-comparision",
            model: response.model,
            stopReason: response.stop_reason,
            usage: response.usage,
            resumeId,
        };

        await appendClaudeAnalysisLog({
            ...logContext,
            rawText,
        });

        if (response.stop_reason == "refusal") {
            return NextResponse.json({ error: "Claude detect violation message and refuse to answer " })
        }

        let parsedJson: unknown;

        try {
            parsedJson = JSON.parse(rawText);
        } catch (error) {
            await appendClaudeAnalysisLog({
                ...logContext,
                parseStatus: "failed",
                error: error instanceof Error ? error.message : String(error),
                rawText,
            });

            return NextResponse.json({ error: "Claude returned invalid JSON resume analysis" }, { status: 500 })
        }

        const validationResult = ResumeAnalysisSchemaLenient.safeParse(parsedJson);

        if (!validationResult.success) {
            await appendClaudeAnalysisLog({
                ...logContext,
                parseStatus: "failed",
                error: validationResult.error.message,
                issues: validationResult.error.issues,
                rawText,
            });

            return NextResponse.json({ error: "Claude returned invalid resume analysis shape" }, { status: 500 })
        }

        const resumeAnalysis: ResumeAnalysisLenient = validationResult.data;

        return NextResponse.json({
            ...resumeAnalysis,
            strengthCount: resumeAnalysis.matchStrengths.length,
        }, { status: 200 });

    } catch (error) {
        console.error("encounter error when comparing resume with jd:", error)
        return NextResponse.json({ error: "Encounter error when comparing resume with jd" }, { status: 500 })
    }


}
