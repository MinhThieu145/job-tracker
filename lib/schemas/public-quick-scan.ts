import { z } from "zod"

export const BulletSignalSchema = z.enum(["good", "partial", "weak"])
export const BulletSignalKeySchema = z.string().regex(/^[^:]+:\d+$/)

export const QuickScanScoreLabelSchema = z.enum([
  "Below target",
  "Getting there",
  "Strong match",
])

export const QuickScanMetricSchema = z
  .object({
    found: z.number().int().nonnegative(),
    total: z.number().int().nonnegative(),
  })
  .strict()

export const MissingKeywordActionSchema = z.enum([
  "add_to_skills",
  "strengthen",
  "real_gap",
])

export const MissingKeywordSchema = z
  .object({
    label: z.string(),
    action: MissingKeywordActionSchema,
    jdFreq: z.number().int().nonnegative(),
    reason: z.string(),
  })
  .strict()

export const WeakKeywordSchema = z
  .object({
    label: z.string(),
    note: z.string(),
  })
  .strict()

export const ResponsibilityStatusSchema = z.enum([
  "demonstrated",
  "partial",
  "not_shown",
])

export const ResponsibilityMatchSchema = z
  .object({
    label: z.string(),
    status: ResponsibilityStatusSchema,
    evidence: z.string().nullable(),
    gap: z.string().nullable(),
    targetBulletKey: BulletSignalKeySchema.optional(),
  })
  .strict()

export const SearchabilityStatusSchema = z.enum(["pass", "warn", "fail"])

export const SearchabilityCheckSchema = z
  .object({
    category: z.enum([
      "Contact information",
      "Section headings",
      "Experience format",
      "Date consistency",
    ]),
    status: SearchabilityStatusSchema,
    text: z.string(),
  })
  .strict()

export const PublicQuickScanResultSchema = z
  .object({
    score: z.number().int().min(0).max(100),
    scoreLabel: QuickScanScoreLabelSchema,
    verdict: z.string(),
    strongestSignal: z.string(),
    biggestGap: z.string(),
    metrics: z
      .object({
        hardSkills: QuickScanMetricSchema,
        domainTerms: QuickScanMetricSchema,
        softSkills: QuickScanMetricSchema,
      })
      .strict(),
    missing: z.array(MissingKeywordSchema),
    weak: z.array(WeakKeywordSchema),
    present: z.array(z.string()),
    responsibilities: z.array(ResponsibilityMatchSchema),
    searchability: z.array(SearchabilityCheckSchema),
  })
  .strict()

export const PublicQuickScanPayloadSchema = z
  .object({
    result: PublicQuickScanResultSchema,
    bulletSignals: z.record(BulletSignalKeySchema, BulletSignalSchema),
  })
  .strict()

export type BulletSignal = z.infer<typeof BulletSignalSchema>
export type BulletSignalKey = `${string}:${number}`
export type QuickScanScoreLabel = z.infer<typeof QuickScanScoreLabelSchema>
export type QuickScanMetric = z.infer<typeof QuickScanMetricSchema>
export type MissingKeywordAction = z.infer<typeof MissingKeywordActionSchema>
export type MissingKeyword = z.infer<typeof MissingKeywordSchema>
export type WeakKeyword = z.infer<typeof WeakKeywordSchema>
export type ResponsibilityStatus = z.infer<typeof ResponsibilityStatusSchema>
export type ResponsibilityMatch = Omit<
  z.infer<typeof ResponsibilityMatchSchema>,
  "targetBulletKey"
> & {
  targetBulletKey?: BulletSignalKey
}
export type SearchabilityStatus = z.infer<typeof SearchabilityStatusSchema>
export type SearchabilityCheck = z.infer<typeof SearchabilityCheckSchema>
export type PublicQuickScanResult = Omit<
  z.infer<typeof PublicQuickScanResultSchema>,
  "responsibilities"
> & {
  responsibilities: ResponsibilityMatch[]
}
export type PublicQuickScanPayload = {
  result: PublicQuickScanResult
  bulletSignals: Record<BulletSignalKey, BulletSignal>
}
