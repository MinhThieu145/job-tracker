import { z } from "zod"

export const RESUME_STRUCTURED_DATA_SCHEMA_VERSION = 1

export const ResumeContactSchema = z
  .object({
    email: z.string(),
    phone: z.string(),
    linkedin: z.string(),
  })
  .strict()

export const ResumeEducationSchema = z
  .object({
    id: z.string(),
    institution: z.string(),
    location: z.string(),
    degree: z.string(),
    gpa: z.string(),
    dates: z.string(),
    bullets: z.array(z.string()),
  })
  .strict()

export const ResumeExperienceSchema = z
  .object({
    id: z.string(),
    company: z.string(),
    role: z.string(),
    dates: z.string(),
    location: z.string(),
    bullets: z.array(z.string()),
  })
  .strict()

export const ResumeProjectSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    technologies: z.string(),
    bullets: z.array(z.string()),
  })
  .strict()

export const ResumeSkillSchema = z
  .object({
    category: z.string(),
    items: z.string(),
  })
  .strict()

export const ResumeStructuredDataSchema = z
  .object({
    schemaVersion: z.literal(RESUME_STRUCTURED_DATA_SCHEMA_VERSION),
    name: z.string(),
    contact: ResumeContactSchema,
    education: z.array(ResumeEducationSchema),
    experience: z.array(ResumeExperienceSchema),
    projects: z.array(ResumeProjectSchema),
    skills: z.array(ResumeSkillSchema),
  })
  .strict()

export type ResumeStructuredData = z.infer<typeof ResumeStructuredDataSchema>
