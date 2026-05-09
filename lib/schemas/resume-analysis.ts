import { z } from "zod"

const SkillReasonSchema = z
  .object({
    skill: z.string(),
    reason: z.string(),
  })
  .strict()

const EvidenceSchema = z
  .object({
    company: z.string(),
    bullet: z.string(),
    reason: z.string(),
  })
  .strict()

const NumericTierSchema = z.union([z.literal(1), z.literal(2), z.literal(3)])

export const AiSuggestionSchema = z
  .object({
    id: z.string(),
    priority: z.enum(["critical", "important"]),
    title: z.string(),
    why: z.string(),
    experienceId: z.string(),
    bulletIndex: z.number().int().nonnegative(),
    newText: z.string(),
  })
  .strict()

export const ResumeAnalysisSchema = z
  .object({
    matchScore: z.number(),
    jobSummary: z.string(),
    roleArchetype: z
      .object({
        label: z.string(),
        reason: z.string(),
      })
      .strict(),
    techHierarchy: z
      .object({
        tier1: z.array(SkillReasonSchema),
        tier2: z.array(SkillReasonSchema),
        tier3: z.array(SkillReasonSchema),
      })
      .strict(),
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
          bestEvidence: z.array(EvidenceSchema),
          recommendedAction: z.enum([
            "no_action",
            "move_existing_bullet_higher",
            "rewrite_existing_bullet",
            "add_keyword_to_skills_if_true",
            "mention_in_bullet",
            "do_not_claim",
          ]),
        })
        .strict()
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
        .strict()
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
        .strict()
    ),
    matchStrengths: z.array(
      z
        .object({
          responsibility: z.string(),
          yourEvidence: z.string(),
          whyItMatches: z.string(),
        })
        .strict()
    ),
    riskAssessment: z.array(
      z
        .object({
          risk: z.string(),
          severity: z.enum(["low", "medium", "high"]),
          mitigation: z.string(),
        })
        .strict()
    ),
    recommendedNextActions: z.array(
      z
        .object({
          priority: z.number(),
          action: z.string(),
          reason: z.string(),
        })
        .strict()
    ),
    aiSuggestions: z.array(AiSuggestionSchema).max(6),
  })
  .strict()

export type ResumeAnalysis = z.infer<typeof ResumeAnalysisSchema>
export type AiSuggestion = z.infer<typeof AiSuggestionSchema>
