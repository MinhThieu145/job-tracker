import { z } from "zod"

const SkillReasonSchema = z
  .object({
    skill: z.string(),
    reason: z.string(),
  })

const NumericTierSchema = z.union([z.literal(1), z.literal(2), z.literal(3)])

const NumericTierSchemaLenient = NumericTierSchema.catch((ctx) => {
  console.warn(
    "[ResumeAnalysis] Unexpected keywordCoverage.tier:",
    ctx.error.issues,
    "defaulting to 3"
  )
  return 3
})

export const ResumeAnalysisSchema = z
  .object({
    matchScore: z.number(),
    jobSummary: z.string(),
    roleArchetype: z
      .object({
        label: z.string(),
        reason: z.string(),
      }),
    techHierarchy: z
      .object({
        tier1: z.array(SkillReasonSchema),
        tier2: z.array(SkillReasonSchema),
        tier3: z.array(SkillReasonSchema),
      }),
    responsibilityHierarchy: z.array(
      z
        .object({
          rank: z.number(),
          responsibility: z.string(),
          whatItMeans: z.string(),
          whyCore: z.string(),
          resumeCoverage: z.enum([
            "strong_match",
            "partial_match",
            "covered_but_buried",
            "semantic_match",
            "missing",
          ]),
          bestEvidence: z.array(z.string()),
        })
    ),
    keywordCoverage: z.array(
      z
        .object({
          keyword: z.string(),
          category: z.enum([
            "tool",
            "language",
            "platform",
            "framework",
            "methodology",
            "domain",
            "business_process",
            "soft_skill",
            "other",
          ]),
          tier: NumericTierSchema,
          status: z.enum([
            "covered",
            "covered_but_buried",
            "semantic_match",
            "missing",
          ]),
          evidence: z.array(z.string()),
          recommendation: z.enum([
            "keep",
            "move_higher",
            "add_to_skills_if_true",
            "mention_in_bullet",
            "do_not_add_unless_true",
            "ignore_low_priority",
          ]),
          reason: z.string(),
        })
    ),
    criticalGaps: z.array(
      z
        .object({
          gap: z.string(),
          type: z.enum(["skill", "responsibility", "domain", "tool"]),
          tier: z.literal(1),
          reason: z.string(),
          evidenceChecked: z.array(z.string()),
        })
    ),
    matchStrengths: z.array(
      z
        .object({
          responsibility: z.string(),
          yourEvidence: z.string(),
          whyItMatches: z.string(),
        })
    ),
    riskAssessment: z.array(
      z
        .object({
          risk: z.string(),
          severity: z.enum(["low", "medium", "high"]),
          mitigation: z.string(),
        })
    ),
  })

export const ResumeAnalysisSchemaLenient = ResumeAnalysisSchema.extend({
  responsibilityHierarchy: z.array(
    z
      .object({
        rank: z.number(),
        responsibility: z.string(),
        whatItMeans: z.string(),
        whyCore: z.string(),
        resumeCoverage: z.enum([
          "strong_match",
          "partial_match",
          "covered_but_buried",
          "semantic_match",
          "missing",
        ]).catch((ctx) => {
          console.warn(
            "[ResumeAnalysis] Unexpected responsibilityHierarchy.resumeCoverage:",
            ctx.error.issues,
            "defaulting to 'missing'"
          )
          return "missing"
        }),
        bestEvidence: z.array(z.string()),
      })
  ),
  keywordCoverage: z.array(
    z
      .object({
        keyword: z.string(),
        category: z.enum([
          "tool",
          "language",
          "platform",
          "framework",
          "methodology",
          "domain",
          "business_process",
          "soft_skill",
          "other",
        ]).catch((ctx) => {
          console.warn(
            "[ResumeAnalysis] Unexpected keywordCoverage.category:",
            ctx.error.issues,
            "defaulting to 'other'"
          )
          return "other"
        }),
        tier: NumericTierSchemaLenient,
        status: z.enum([
          "covered",
          "covered_but_buried",
          "semantic_match",
          "missing",
        ]).catch((ctx) => {
          console.warn(
            "[ResumeAnalysis] Unexpected keywordCoverage.status:",
            ctx.error.issues,
            "defaulting to 'missing'"
          )
          return "missing"
        }),
        evidence: z.array(z.string()),
        recommendation: z.enum([
          "keep",
          "move_higher",
          "add_to_skills_if_true",
          "mention_in_bullet",
          "do_not_add_unless_true",
          "ignore_low_priority",
        ]).catch((ctx) => {
          console.warn(
            "[ResumeAnalysis] Unexpected keywordCoverage.recommendation:",
            ctx.error.issues,
            "defaulting to 'ignore_low_priority'"
          )
          return "ignore_low_priority"
        }),
        reason: z.string(),
      })
  ),
  criticalGaps: z.array(
    z
      .object({
        gap: z.string(),
        type: z.enum(["skill", "responsibility", "domain", "tool"]).catch((ctx) => {
          console.warn(
            "[ResumeAnalysis] Unexpected criticalGaps.type:",
            ctx.error.issues,
            "defaulting to 'skill'"
          )
          return "skill"
        }),
        tier: z.literal(1),
        reason: z.string(),
        evidenceChecked: z.array(z.string()),
      })
  ),
  riskAssessment: z.array(
    z
      .object({
        risk: z.string(),
        severity: z.enum(["low", "medium", "high"]).catch((ctx) => {
          console.warn(
            "[ResumeAnalysis] Unexpected riskAssessment.severity:",
            ctx.error.issues,
            "defaulting to 'medium'"
          )
          return "medium"
        }),
        mitigation: z.string(),
      })
  ),
})

export type ResumeAnalysis = z.infer<typeof ResumeAnalysisSchema>
export type ResumeAnalysisLenient = z.infer<typeof ResumeAnalysisSchemaLenient>
