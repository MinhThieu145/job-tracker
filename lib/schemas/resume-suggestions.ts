import { z } from "zod"

export const AiSuggestionSchema = z.object({
  id: z.string(),
  priority: z.enum(["critical", "important"]),
  title: z.string(),
  why: z.string(),
  experienceId: z.string(),
  bulletIndex: z.number().int().nonnegative(),
  newText: z.string(),
})

export const SuggestionsResponseSchema = z.object({
  aiSuggestions: z.array(AiSuggestionSchema).max(6),
})

export type AiSuggestion = z.infer<typeof AiSuggestionSchema>
export type SuggestionsResponse = z.infer<typeof SuggestionsResponseSchema>
