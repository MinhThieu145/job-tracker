import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod"
import { appendFile, mkdir } from "node:fs/promises"
import { join } from "node:path"
import { NextResponse } from "next/server"
import { z } from "zod"

import { anthropicClient } from "@/lib/anthropic"
import {
  DEMO_BULLET_SIGNALS,
  DEMO_QUICK_SCAN_RESULT,
} from "@/lib/demo/public-quick-scan-demo"
import {
  BulletSignalKeySchema,
  BulletSignalSchema,
  PublicQuickScanPayloadSchema,
  PublicQuickScanResultSchema,
  type BulletSignal,
  type BulletSignalKey,
  type PublicQuickScanPayload,
} from "@/lib/schemas/public-quick-scan"
import {
  ResumeStructuredDataSchema,
  type ResumeStructuredData,
} from "@/lib/schemas/resume-structured-data"

const AiBulletSignalSchema = z
  .object({
    key: BulletSignalKeySchema,
    signal: BulletSignalSchema,
  })
  .strict()

const AiPublicQuickScanPayloadSchema = z
  .object({
    result: PublicQuickScanResultSchema,
    bulletSignals: z.array(AiBulletSignalSchema),
  })
  .strict()

async function appendPublicQuickScanLog(record: Record<string, unknown>) {
  console.log("[quick-scan]", JSON.stringify(record))

  if (process.env.APP_ENV !== "production") {
    try {
      const logDirectory = join(process.cwd(), "logs")
      await mkdir(logDirectory, { recursive: true })
      await appendFile(
        join(logDirectory, "claude-public-quick-scan.jsonl"),
        `${JSON.stringify(record)}\n`,
        "utf8",
      )
    } catch (error) {
      console.error("Failed to write log file:", error)
    }
  }
}

function getValidBulletKeys(resume: ResumeStructuredData) {
  return resume.experience.flatMap((experience) =>
    experience.bullets.map(
      (_bullet, index) => `${experience.id}:${index}` as BulletSignalKey,
    ),
  )
}

function getScoreLabel(score: number) {
  if (score >= 75) return "Strong match"
  if (score >= 65) return "Getting there"
  return "Below target"
}

function normalizeQuickScanPayload(
  aiPayload: z.infer<typeof AiPublicQuickScanPayloadSchema>,
  validBulletKeys: BulletSignalKey[],
): PublicQuickScanPayload {
  const validBulletKeySet = new Set<string>(validBulletKeys)
  const bulletSignals = validBulletKeys.reduce<Record<BulletSignalKey, BulletSignal>>(
    (signals, key) => {
      signals[key] = "partial"
      return signals
    },
    {} as Record<BulletSignalKey, BulletSignal>,
  )

  for (const item of aiPayload.bulletSignals) {
    if (validBulletKeySet.has(item.key)) {
      bulletSignals[item.key as BulletSignalKey] = item.signal
    }
  }

  return {
    result: {
      ...aiPayload.result,
      scoreLabel: getScoreLabel(aiPayload.result.score),
      responsibilities: aiPayload.result.responsibilities.map((item) => {
        if (item.targetBulletKey && validBulletKeySet.has(item.targetBulletKey)) {
          return {
            ...item,
            targetBulletKey: item.targetBulletKey as BulletSignalKey,
          }
        }

        return {
          label: item.label,
          status: item.status,
          evidence: item.evidence,
          gap: item.gap,
        }
      }),
    },
    bulletSignals,
  }
}

export async function POST(req: Request) {
  const timestamp = new Date().toISOString()

  try {
    const body = await req.json().catch(() => null)
    const resumeResult = ResumeStructuredDataSchema.safeParse(body?.resume)
    const jobDescription =
      typeof body?.jobDescription === "string" ? body.jobDescription.trim() : ""

    if (!resumeResult.success) {
      return NextResponse.json(
        {
          error: "Invalid resume structured data",
          issues: resumeResult.error.issues,
        },
        { status: 400 },
      )
    }

    if (!jobDescription) {
      return NextResponse.json(
        { error: "Job description is required for a role-match scan" },
        { status: 400 },
      )
    }

    if (process.env.USE_DEMO_DATA === "true") {
      return NextResponse.json(
        {
          result: DEMO_QUICK_SCAN_RESULT,
          bulletSignals: DEMO_BULLET_SIGNALS,
        },
        { status: 200 },
      )
    }

    const resume = resumeResult.data
    const validBulletKeys = getValidBulletKeys(resume)

    const response = await anthropicClient.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 5000,
      system: `You are a senior recruiter and resume match analyst.
Return a concise public quick-scan result for one resume and one job description.
Be honest. Do not invent experience, tools, credentials, employers, or metrics.
Use only evidence found in the resume. If a missing requirement is not defensible from the resume, mark it as a real_gap.
Keep all explanation strings short enough for compact UI rows.`,
      messages: [
        {
          role: "user",
          content: `Analyze this resume against this job description and return the requested JSON shape.

Valid targetBulletKey values are exactly: ${validBulletKeys.join(", ") || "none"}.
For every experience bullet, include one bulletSignals item using one of those exact keys.
Use status "good" for clear role evidence, "partial" for adjacent or buried evidence, and "weak" for generic or low-signal bullets.

Score guidance:
- 0-64: Below target
- 65-74: Getting there
- 75-100: Strong match

Result guidance:
- metrics.hardSkills, metrics.domainTerms, and metrics.softSkills should compare resume coverage against the job description.
- missing should include the highest-impact missing or unsupported terms, usually 3-7 items.
- weak should include terms that are present but buried, vague, or unsupported by bullet evidence.
- present should include the strongest high-confidence terms already shown in the resume.
- responsibilities should include 5-8 core responsibilities from the job description, sorted by importance or risk.
- searchability should assess the resume structure from the structured data, not the PDF formatting.

JOB DESCRIPTION:
${jobDescription}

RESUME STRUCTURED DATA:
${JSON.stringify(resume, null, 2)}`,
        },
      ],
      output_config: {
        format: zodOutputFormat(AiPublicQuickScanPayloadSchema),
      },
      temperature: 0.1,
    })

    const rawText = response.content
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("\n\n")

    const logContext = {
      timestamp,
      route: "public-quick-scan",
      model: response.model,
      stopReason: response.stop_reason,
      usage: response.usage,
      resumeTextCompanyCount: resume.experience.length,
      jobDescriptionLength: jobDescription.length,
    }

    await appendPublicQuickScanLog({
      ...logContext,
      rawContent: response.content,
      rawText,
    })

    if (response.stop_reason === "refusal") {
      return NextResponse.json(
        { error: "Claude refused to analyze this resume" },
        { status: 400 },
      )
    }

    if (response.stop_reason === "max_tokens") {
      return NextResponse.json(
        {
          error:
            "Resume analysis was too long to complete. Try a shorter job description.",
        },
        { status: 500 },
      )
    }

    let parsedJson: unknown

    try {
      parsedJson = JSON.parse(rawText)
    } catch (error) {
      await appendPublicQuickScanLog({
        ...logContext,
        parseStatus: "failed",
        error: error instanceof Error ? error.message : String(error),
        rawContent: response.content,
        rawText,
      })

      return NextResponse.json(
        { error: "Claude returned invalid JSON quick-scan data" },
        { status: 500 },
      )
    }

    const aiValidationResult = AiPublicQuickScanPayloadSchema.safeParse(parsedJson)

    if (!aiValidationResult.success) {
      await appendPublicQuickScanLog({
        ...logContext,
        parseStatus: "failed",
        error: aiValidationResult.error.message,
        issues: aiValidationResult.error.issues,
        rawContent: response.content,
        rawText,
      })

      return NextResponse.json(
        { error: "Claude returned invalid quick-scan data" },
        { status: 500 },
      )
    }

    const payload = normalizeQuickScanPayload(
      aiValidationResult.data,
      validBulletKeys,
    )
    const payloadValidationResult = PublicQuickScanPayloadSchema.safeParse(payload)

    if (!payloadValidationResult.success) {
      await appendPublicQuickScanLog({
        ...logContext,
        parseStatus: "failed",
        error: payloadValidationResult.error.message,
        issues: payloadValidationResult.error.issues,
        rawContent: response.content,
        rawText,
      })

      return NextResponse.json(
        { error: "Quick-scan payload failed validation" },
        { status: 500 },
      )
    }

    return NextResponse.json(payloadValidationResult.data, { status: 200 })
  } catch (error) {
    console.error("Error generating public quick scan:", error)
    return NextResponse.json(
      { error: "Failed to generate public quick scan" },
      { status: 500 },
    )
  }
}
