'use client'

import { useCallback, useEffect, useRef, useState, type Dispatch, type SetStateAction } from 'react'

import {
  getBulletElementId,
  getBulletKey,
} from '@/lib/resume-demo-data'
import type { AiSuggestion } from '@/lib/schemas/resume-suggestions'
import type { ResumeStructuredData } from '@/lib/schemas/resume-structured-data'

type EducationField = keyof Omit<ResumeStructuredData['education'][number], 'id' | 'bullets'>
type ExperienceField = keyof Omit<ResumeStructuredData['experience'][number], 'id' | 'bullets'>
type ProjectField = keyof Omit<ResumeStructuredData['projects'][number], 'id' | 'bullets'>
type SkillField = keyof ResumeStructuredData['skills'][number]

type ResumeEditorProps = {
  resume: ResumeStructuredData
  onResumeChange: Dispatch<SetStateAction<ResumeStructuredData>>
  appliedFixes: Set<string>
  onAppliedFixesChange: Dispatch<SetStateAction<Set<string>>>
  onSaveTailoredResume: () => Promise<void>
  onSubmitApplication: () => Promise<void>
  isSavingTailoredResume: boolean
  isSubmittingApplication: boolean
  isDraftDirty: boolean
  savedTailoredResumeId: string | null
  tailoredResumeSaveError: string | null
  aiSuggestions: AiSuggestion[]
  matchScore: number
  strengthCount: number
  initialTargetSuggestion: AiSuggestion | null
  onBackToAnalysis: () => void
}

const EMPTY_COLLAPSE_STATE = {
  suggestions: false,
  header: false,
  education: false,
  experience: false,
  projects: false,
  skills: false,
}

function AutoResizeTextarea({
  value,
  onChange,
  label,
  minRows = 1,
  className = '',
}: {
  value: string
  onChange: (value: string) => void
  label: string
  minRows?: number
  className?: string
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return

    textarea.style.height = 'auto'
    textarea.style.height = `${textarea.scrollHeight}px`
  }, [value])

  return (
    <textarea
      ref={textareaRef}
      aria-label={label}
      className={`editable-textarea ${className}`}
      rows={minRows}
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
  )
}

function SectionHeader({
  title,
  count,
  collapsed,
  onToggle,
}: {
  title: string
  count?: number
  collapsed: boolean
  onToggle: () => void
}) {
  return (
    <button className="section-toggle" type="button" onClick={onToggle} aria-expanded={!collapsed}>
      <span className={`chevron ${collapsed ? 'collapsed' : ''}`}>&rsaquo;</span>
      <span>{title}</span>
      {typeof count === 'number' && <span className="section-count">{count}</span>}
    </button>
  )
}

function SuggestionCards({
  suggestions,
  appliedFixes,
  experiences,
  onSelect,
}: {
  suggestions: AiSuggestion[]
  appliedFixes: Set<string>
  experiences: ResumeStructuredData['experience']
  onSelect: (suggestion: AiSuggestion) => void
}) {
  return (
    <div className="suggestion-grid">
      {suggestions.map((suggestion) => {
        const applied = appliedFixes.has(suggestion.id)
        const targetExperience = experiences.find((experience) => experience.id === suggestion.experienceId)
        const targetLabel = `${targetExperience?.company ?? 'Experience'} \u00b7 Bullet ${suggestion.bulletIndex + 1}`

        return (
          <button
            type="button"
            className={`suggestion-card ${suggestion.priority} ${applied ? 'applied' : ''}`}
            key={suggestion.id}
            onClick={() => onSelect(suggestion)}
          >
            <div className="suggestion-card-main">
              <span className="suggestion-dot" aria-hidden="true" />
              <div>
                <h3>{suggestion.title}</h3>
                <p>{targetLabel}</p>
              </div>
            </div>
            <span className={`suggestion-status ${applied ? 'applied' : 'pending'}`}>
              {applied ? '\u2713 Applied' : '\u25cb Pending'}
            </span>
          </button>
        )
      })}
    </div>
  )
}

function HeaderCounter({
  tone,
  applied,
  total,
}: {
  tone: 'critical' | 'important'
  applied: number
  total: number
}) {
  const complete = applied === total

  return (
    <span className={`header-counter ${tone} ${complete ? 'complete' : ''}`}>
      <span className="counter-icon">{complete ? '\u2713' : '\u25cf'}</span>
      {applied}/{total}
    </span>
  )
}

function ResumeEditorHeader({
  matchScore,
  strengthCount,
  criticalApplied,
  totalCritical,
  importantApplied,
  totalImportant,
  allComplete,
  onBackToAnalysis,
  onSaveTailoredResume,
  onExport,
  onSubmit,
  isSavingTailoredResume,
  isSubmittingApplication,
  isDraftDirty,
  savedTailoredResumeId,
  tailoredResumeSaveError,
}: {
  matchScore: number
  strengthCount: number
  criticalApplied: number
  totalCritical: number
  importantApplied: number
  totalImportant: number
  allComplete: boolean
  onBackToAnalysis: () => void
  onSaveTailoredResume: () => void
  onExport: () => void
  onSubmit: () => void
  isSavingTailoredResume: boolean
  isSubmittingApplication: boolean
  isDraftDirty: boolean
  savedTailoredResumeId: string | null
  tailoredResumeSaveError: string | null
}) {
  const saveLabel = isSavingTailoredResume
    ? 'Saving...'
    : savedTailoredResumeId && !isDraftDirty
      ? 'Tailored Resume Saved'
      : 'Save Tailored Resume'
  const submitLabel = isSubmittingApplication ? 'Submitting...' : 'Submit Application'

  return (
    <header className="app-header no-print">
      <div className="header-row primary">
        <div className="header-left">
          <button type="button" className="header-button back-action" onClick={onBackToAnalysis}>
            Back to Analysis
          </button>
          <div className="role-title">Uber &middot; Data Scientist I</div>
        </div>
        <div className="header-actions">
          <button
            type="button"
            className="header-button"
            data-complete={Boolean(savedTailoredResumeId) && !isDraftDirty}
            disabled={isSavingTailoredResume}
            onClick={onSaveTailoredResume}
          >
            {saveLabel}
          </button>
          <button type="button" className="header-button" data-complete={allComplete} onClick={onExport}>
            Export PDF
          </button>
          <button
            type="button"
            className="header-button primary-action"
            data-complete={allComplete}
            disabled={isSavingTailoredResume || isSubmittingApplication}
            onClick={onSubmit}
          >
            {submitLabel}
          </button>
        </div>
      </div>
      {tailoredResumeSaveError ? (
        <div className="header-row save-error">
          <span>{tailoredResumeSaveError}</span>
        </div>
      ) : null}
      <div className="header-row secondary">
        <span className="match-score">Match: {matchScore}%</span>
        <HeaderCounter tone="critical" applied={criticalApplied} total={totalCritical} />
        <HeaderCounter tone="important" applied={importantApplied} total={totalImportant} />
        <span className="header-counter strengths complete">
          <span className="counter-icon">{'\u2713'}</span>
          {strengthCount}
        </span>
      </div>
    </header>
  )
}

function BulletEditor({
  bullet,
  label,
  onChange,
  onDelete,
  suggestion,
  onApplySuggestion,
  bulletId,
  isFlashing = false,
  isTargeted = false,
}: {
  bullet: string
  label: string
  onChange: (value: string) => void
  onDelete: () => void
  suggestion?: AiSuggestion
  onApplySuggestion?: (suggestion: AiSuggestion) => void
  bulletId?: string
  isFlashing?: boolean
  isTargeted?: boolean
}) {
  return (
    <div className={`bullet-editor-item ${isTargeted ? 'targeted' : ''}`} id={bulletId}>
      <div className="bullet-editor-row">
        <span className="bullet-dot">&bull;</span>
        <AutoResizeTextarea
          value={bullet}
          onChange={onChange}
          label={label}
          minRows={1}
          className={`bullet-input ${isFlashing ? 'applied-flash' : ''}`}
        />
        <button type="button" className="delete-bullet" onClick={onDelete} aria-label={`Delete ${label}`}>
          x
        </button>
      </div>

      {suggestion && onApplySuggestion && (
        <div className={`inline-suggestion-panel ${suggestion.priority}`}>
          <div className="inline-suggestion-label">
            <span className="inline-suggestion-dot" aria-hidden="true" />
            <span>Suggested Improvement</span>
          </div>
          <p>{suggestion.newText}</p>
          <div className="inline-suggestion-actions">
            <button type="button" onClick={() => onApplySuggestion(suggestion)}>
              Apply Fix -&gt;
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function EducationCard({
  education,
  onFieldChange,
  onBulletChange,
  onBulletDelete,
  onBulletAdd,
}: {
  education: ResumeStructuredData['education'][number]
  onFieldChange: (field: EducationField, value: string) => void
  onBulletChange: (index: number, value: string) => void
  onBulletDelete: (index: number) => void
  onBulletAdd: () => void
}) {
  return (
    <article className="editor-card">
      <div className="card-grid two-columns">
        <AutoResizeTextarea
          value={education.institution}
          onChange={(value) => onFieldChange('institution', value)}
          label="Institution"
          className="field-strong"
        />
        <AutoResizeTextarea value={education.dates} onChange={(value) => onFieldChange('dates', value)} label="Dates" />
        <AutoResizeTextarea value={education.degree} onChange={(value) => onFieldChange('degree', value)} label="Degree" />
        <AutoResizeTextarea value={education.location} onChange={(value) => onFieldChange('location', value)} label="Location" />
        <AutoResizeTextarea value={education.gpa} onChange={(value) => onFieldChange('gpa', value)} label="GPA" />
      </div>

      <div className="bullet-list-editor">
        {education.bullets.map((bullet, index) => (
          <BulletEditor
            key={`${education.id}-bullet-${index}`}
            bullet={bullet}
            label={`Education bullet ${index + 1}`}
            onChange={(value) => onBulletChange(index, value)}
            onDelete={() => onBulletDelete(index)}
          />
        ))}
      </div>

      <button type="button" className="add-bullet" onClick={onBulletAdd}>
        + Add Bullet
      </button>
    </article>
  )
}

function ExperienceCard({
  experience,
  suggestions,
  appliedFixes,
  flashingBulletKeys,
  targetedBulletKey,
  onFieldChange,
  onBulletChange,
  onBulletDelete,
  onBulletAdd,
  onSuggestionApply,
}: {
  experience: ResumeStructuredData['experience'][number]
  suggestions: AiSuggestion[]
  appliedFixes: Set<string>
  flashingBulletKeys: Set<string>
  targetedBulletKey: string | null
  onFieldChange: (field: ExperienceField, value: string) => void
  onBulletChange: (index: number, value: string) => void
  onBulletDelete: (index: number) => void
  onBulletAdd: () => void
  onSuggestionApply: (suggestion: AiSuggestion) => void
}) {
  return (
    <article className="editor-card">
      <div className="card-grid two-columns">
        <AutoResizeTextarea
          value={experience.company}
          onChange={(value) => onFieldChange('company', value)}
          label="Company"
          className="field-strong"
        />
        <AutoResizeTextarea value={experience.dates} onChange={(value) => onFieldChange('dates', value)} label="Dates" />
        <AutoResizeTextarea value={experience.role} onChange={(value) => onFieldChange('role', value)} label="Role" />
        <AutoResizeTextarea
          value={experience.location}
          onChange={(value) => onFieldChange('location', value)}
          label="Location"
        />
      </div>

      <div className="bullet-list-editor">
        {experience.bullets.map((bullet, index) => {
          const matchingSuggestion = suggestions.find(
            (suggestion) =>
              suggestion.experienceId === experience.id &&
              suggestion.bulletIndex === index &&
              !appliedFixes.has(suggestion.id)
          )
          const bulletKey = getBulletKey(experience.id, index)

          return (
            <BulletEditor
              key={`${experience.id}-bullet-${index}`}
              bullet={bullet}
              label={`${experience.company} bullet ${index + 1}`}
              onChange={(value) => onBulletChange(index, value)}
              onDelete={() => onBulletDelete(index)}
              suggestion={matchingSuggestion}
              onApplySuggestion={onSuggestionApply}
              bulletId={getBulletElementId(experience.id, index)}
              isFlashing={flashingBulletKeys.has(bulletKey)}
              isTargeted={targetedBulletKey === bulletKey}
            />
          )
        })}
      </div>

      <button type="button" className="add-bullet" onClick={onBulletAdd}>
        + Add Bullet
      </button>
    </article>
  )
}

function ProjectCard({
  project,
  onFieldChange,
  onBulletChange,
  onBulletDelete,
  onBulletAdd,
}: {
  project: ResumeStructuredData['projects'][number]
  onFieldChange: (field: ProjectField, value: string) => void
  onBulletChange: (index: number, value: string) => void
  onBulletDelete: (index: number) => void
  onBulletAdd: () => void
}) {
  return (
    <article className="editor-card">
      <div className="card-grid two-columns">
        <AutoResizeTextarea
          value={project.name}
          onChange={(value) => onFieldChange('name', value)}
          label="Project name"
          className="field-strong"
        />
        <AutoResizeTextarea
          value={project.technologies}
          onChange={(value) => onFieldChange('technologies', value)}
          label="Technologies"
        />
      </div>

      <div className="bullet-list-editor">
        {project.bullets.map((bullet, index) => (
          <BulletEditor
            key={`${project.id}-bullet-${index}`}
            bullet={bullet}
            label={`${project.name} bullet ${index + 1}`}
            onChange={(value) => onBulletChange(index, value)}
            onDelete={() => onBulletDelete(index)}
          />
        ))}
      </div>

      <button type="button" className="add-bullet" onClick={onBulletAdd}>
        + Add Bullet
      </button>
    </article>
  )
}

function SkillCard({
  skill,
  onFieldChange,
}: {
  skill: ResumeStructuredData['skills'][number]
  onFieldChange: (field: SkillField, value: string) => void
}) {
  return (
    <article className="editor-card compact">
      <div className="card-grid skill-grid">
        <AutoResizeTextarea
          value={skill.category}
          onChange={(value) => onFieldChange('category', value)}
          label="Skill category"
          className="field-strong"
        />
        <AutoResizeTextarea value={skill.items} onChange={(value) => onFieldChange('items', value)} label="Skill items" />
      </div>
    </article>
  )
}

function ResumePreview({ resume }: { resume: ResumeStructuredData }) {
  return (
    <div className="resume-page">
      <header className="resume-header-preview">
        <h1>{resume.name}</h1>
        <p>
          {resume.contact.email} | {resume.contact.phone} | {resume.contact.linkedin}
        </p>
      </header>

      <PreviewSection title="EDUCATION">
        {resume.education.map((education) => (
          <div className="preview-entry" key={education.id}>
            <div className="preview-row">
              <div>
                <strong>{education.institution}</strong>
                {education.location && <span> | {education.location}</span>}
              </div>
              <div>{education.dates}</div>
            </div>
            <div className="preview-row">
              <div>{education.degree}</div>
              <div>{education.gpa}</div>
            </div>
            <PreviewBullets bullets={education.bullets} />
          </div>
        ))}
      </PreviewSection>

      <PreviewSection title="WORK EXPERIENCE">
        {resume.experience.map((experience) => (
          <div className="preview-entry" key={experience.id}>
            <div className="preview-row">
              <div>
                <strong>{experience.company}</strong>
              </div>
              <div>{experience.dates}</div>
            </div>
            <div className="preview-row">
              <div>
                <em>{experience.role}</em>
              </div>
              <div>{experience.location}</div>
            </div>
            <PreviewBullets bullets={experience.bullets} />
          </div>
        ))}
      </PreviewSection>

      <PreviewSection title="PROJECTS">
        {resume.projects.map((project) => (
          <div className="preview-entry" key={project.id}>
            <div className="preview-project-title">
              <strong>{project.name}</strong>
              {project.technologies && <span> | <em>{project.technologies}</em></span>}
            </div>
            <PreviewBullets bullets={project.bullets} />
          </div>
        ))}
      </PreviewSection>

      <PreviewSection title="SKILLS">
        <div className="preview-skills">
          {resume.skills.map((skill, index) => (
            <p key={`${skill.category}-${index}`}>
              <strong>{skill.category}:</strong> {skill.items}
            </p>
          ))}
        </div>
      </PreviewSection>
    </div>
  )
}

function PreviewSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="preview-section">
      <h2>{title}</h2>
      {children}
    </section>
  )
}

function PreviewBullets({ bullets }: { bullets: string[] }) {
  const visibleBullets = bullets.filter((bullet) => bullet.trim().length > 0)

  if (visibleBullets.length === 0) return null

  return (
    <ul className="preview-bullets">
      {visibleBullets.map((bullet, index) => (
        <li key={`${bullet.slice(0, 24)}-${index}`}>{bullet}</li>
      ))}
    </ul>
  )
}

export default function ResumeEditor({
  resume,
  onResumeChange,
  appliedFixes,
  onAppliedFixesChange,
  onSaveTailoredResume,
  onSubmitApplication,
  isSavingTailoredResume,
  isSubmittingApplication,
  isDraftDirty,
  savedTailoredResumeId,
  tailoredResumeSaveError,
  aiSuggestions,
  matchScore,
  strengthCount,
  initialTargetSuggestion,
  onBackToAnalysis,
}: ResumeEditorProps) {
  const [flashingBulletKeys, setFlashingBulletKeys] = useState<Set<string>>(new Set())
  const [targetedBulletKey, setTargetedBulletKey] = useState<string | null>(null)
  const [collapsedSections, setCollapsedSections] = useState(EMPTY_COLLAPSE_STATE)

  const totalCritical = aiSuggestions.filter((suggestion) => suggestion.priority === 'critical').length
  const totalImportant = aiSuggestions.filter((suggestion) => suggestion.priority === 'important').length
  const criticalApplied = aiSuggestions.filter(
    (suggestion) => suggestion.priority === 'critical' && appliedFixes.has(suggestion.id)
  ).length
  const importantApplied = aiSuggestions.filter(
    (suggestion) => suggestion.priority === 'important' && appliedFixes.has(suggestion.id)
  ).length
  const allComplete = criticalApplied === totalCritical && importantApplied === totalImportant

  const revealSuggestion = useCallback((suggestion: AiSuggestion, behavior: ScrollBehavior = 'smooth') => {
    const bulletKey = getBulletKey(suggestion.experienceId, suggestion.bulletIndex)

    setTargetedBulletKey(bulletKey)
    setCollapsedSections((previous) => ({
      ...previous,
      experience: false,
    }))

    window.setTimeout(() => {
      document
        .getElementById(getBulletElementId(suggestion.experienceId, suggestion.bulletIndex))
        ?.scrollIntoView({ behavior, block: 'center' })
    }, 0)
  }, [])

  useEffect(() => {
    if (!initialTargetSuggestion) return

    const timeoutId = window.setTimeout(() => {
      revealSuggestion(initialTargetSuggestion)
    }, 0)

    return () => window.clearTimeout(timeoutId)
  }, [initialTargetSuggestion, revealSuggestion])

  const toggleSection = (section: keyof typeof EMPTY_COLLAPSE_STATE) => {
    setCollapsedSections((previous) => ({
      ...previous,
      [section]: !previous[section],
    }))
  }

  const updateContact = (field: keyof ResumeStructuredData['contact'], value: string) => {
    onResumeChange((previous) => ({
      ...previous,
      contact: {
        ...previous.contact,
        [field]: value,
      },
    }))
  }

  const updateEducationField = (id: string, field: EducationField, value: string) => {
    onResumeChange((previous) => ({
      ...previous,
      education: previous.education.map((education) =>
        education.id === id ? { ...education, [field]: value } : education
      ),
    }))
  }

  const updateEducationBullet = (id: string, bulletIndex: number, value: string) => {
    onResumeChange((previous) => ({
      ...previous,
      education: previous.education.map((education) =>
        education.id === id
          ? {
              ...education,
              bullets: education.bullets.map((bullet, index) => (index === bulletIndex ? value : bullet)),
            }
          : education
      ),
    }))
  }

  const deleteEducationBullet = (id: string, bulletIndex: number) => {
    onResumeChange((previous) => ({
      ...previous,
      education: previous.education.map((education) =>
        education.id === id
          ? { ...education, bullets: education.bullets.filter((_, index) => index !== bulletIndex) }
          : education
      ),
    }))
  }

  const addEducationBullet = (id: string) => {
    onResumeChange((previous) => ({
      ...previous,
      education: previous.education.map((education) =>
        education.id === id ? { ...education, bullets: [...education.bullets, ''] } : education
      ),
    }))
  }

  const updateExperienceField = (id: string, field: ExperienceField, value: string) => {
    onResumeChange((previous) => ({
      ...previous,
      experience: previous.experience.map((experience) =>
        experience.id === id ? { ...experience, [field]: value } : experience
      ),
    }))
  }

  const updateExperienceBullet = (id: string, bulletIndex: number, value: string) => {
    onResumeChange((previous) => ({
      ...previous,
      experience: previous.experience.map((experience) =>
        experience.id === id
          ? {
              ...experience,
              bullets: experience.bullets.map((bullet, index) => (index === bulletIndex ? value : bullet)),
            }
          : experience
      ),
    }))
  }

  const deleteExperienceBullet = (id: string, bulletIndex: number) => {
    onResumeChange((previous) => ({
      ...previous,
      experience: previous.experience.map((experience) =>
        experience.id === id
          ? { ...experience, bullets: experience.bullets.filter((_, index) => index !== bulletIndex) }
          : experience
      ),
    }))
  }

  const addExperienceBullet = (id: string) => {
    onResumeChange((previous) => ({
      ...previous,
      experience: previous.experience.map((experience) =>
        experience.id === id ? { ...experience, bullets: [...experience.bullets, ''] } : experience
      ),
    }))
  }

  const updateProjectField = (id: string, field: ProjectField, value: string) => {
    onResumeChange((previous) => ({
      ...previous,
      projects: previous.projects.map((project) => (project.id === id ? { ...project, [field]: value } : project)),
    }))
  }

  const updateProjectBullet = (id: string, bulletIndex: number, value: string) => {
    onResumeChange((previous) => ({
      ...previous,
      projects: previous.projects.map((project) =>
        project.id === id
          ? {
              ...project,
              bullets: project.bullets.map((bullet, index) => (index === bulletIndex ? value : bullet)),
            }
          : project
      ),
    }))
  }

  const deleteProjectBullet = (id: string, bulletIndex: number) => {
    onResumeChange((previous) => ({
      ...previous,
      projects: previous.projects.map((project) =>
        project.id === id ? { ...project, bullets: project.bullets.filter((_, index) => index !== bulletIndex) } : project
      ),
    }))
  }

  const addProjectBullet = (id: string) => {
    onResumeChange((previous) => ({
      ...previous,
      projects: previous.projects.map((project) =>
        project.id === id ? { ...project, bullets: [...project.bullets, ''] } : project
      ),
    }))
  }

  const updateSkillField = (skillIndex: number, field: SkillField, value: string) => {
    onResumeChange((previous) => ({
      ...previous,
      skills: previous.skills.map((skill, index) => (index === skillIndex ? { ...skill, [field]: value } : skill)),
    }))
  }

  const applySuggestion = (suggestion: AiSuggestion) => {
    const targetExperience = resume.experience.find((experience) => experience.id === suggestion.experienceId)
    const bulletKey = getBulletKey(suggestion.experienceId, suggestion.bulletIndex)

    if (!targetExperience || !targetExperience.bullets[suggestion.bulletIndex]) return

    onResumeChange((previous) => ({
      ...previous,
      experience: previous.experience.map((experience) =>
        experience.id === suggestion.experienceId
          ? {
              ...experience,
              bullets: experience.bullets.map((bullet, index) =>
                index === suggestion.bulletIndex ? suggestion.newText : bullet
              ),
            }
          : experience
      ),
    }))
    onAppliedFixesChange((previous) => new Set([...previous, suggestion.id]))
    setTargetedBulletKey(null)
    setFlashingBulletKeys((previous) => new Set([...previous, bulletKey]))
    window.setTimeout(() => {
      setFlashingBulletKeys((previous) => {
        const next = new Set(previous)
        next.delete(bulletKey)
        return next
      })
    }, 1000)
  }

  const scrollToSuggestion = (suggestion: AiSuggestion) => {
    revealSuggestion(suggestion)
  }

  const handleExport = () => {
    window.print()
  }

  return (
    <>
      <style>{`
        *, *::before, *::after {
          box-sizing: border-box;
        }

        html, body {
          margin: 0;
          padding: 0;
          height: 100%;
        }

        .resume-editor-page {
          min-height: 100vh;
          background: #080d19;
          color: #e5e7eb;
          font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        }

        .app-header {
          position: sticky;
          top: 0;
          z-index: 20;
          min-height: 68px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 6px;
          padding: 8px 22px 9px;
          background: rgba(7, 11, 23, 0.96);
          border-bottom: 1px solid rgba(255, 255, 255, 0.07);
          backdrop-filter: blur(14px);
        }

        .header-row {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }

        .header-row.secondary {
          justify-content: flex-start;
          gap: 14px;
        }

        .header-row.save-error {
          justify-content: flex-end;
          color: #fecaca;
          font-size: 11px;
          font-weight: 700;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 0;
        }

        .role-title {
          color: #f8fafc;
          font-size: 14px;
          font-weight: 750;
          line-height: 1;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
        }

        .match-score {
          color: #94a3b8;
          font-size: 12px;
          font-weight: 600;
        }

        .header-counter {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          color: #cbd5e1;
          font-size: 12px;
          font-weight: 800;
          line-height: 1;
        }

        .counter-icon {
          color: #ef4444;
          font-size: 10px;
          line-height: 1;
        }

        .header-counter.important .counter-icon {
          color: #f59e0b;
        }

        .header-counter.complete {
          color: #86efac;
        }

        .header-counter.complete .counter-icon,
        .header-counter.strengths .counter-icon {
          color: #22c55e;
          font-size: 12px;
        }

        .header-button {
          border: 0;
          border-radius: 7px;
          background: rgba(37, 99, 235, 0.92);
          color: #fff;
          cursor: pointer;
          font: inherit;
          font-size: 12px;
          font-weight: 700;
          opacity: 0.7;
          padding: 7px 13px;
          transition: opacity 0.18s ease, background 0.18s ease;
        }

        .header-button.primary-action {
          background: rgba(22, 163, 74, 0.92);
        }

        .header-button.back-action {
          border: 1px solid rgba(148, 163, 184, 0.18);
          background: rgba(15, 23, 42, 0.72);
          color: #cbd5e1;
          opacity: 1;
        }

        .header-button.back-action:hover {
          background: rgba(30, 41, 59, 0.92);
        }

        .header-button[data-complete="true"] {
          opacity: 1;
        }

        .header-button:hover {
          filter: brightness(1.08);
        }

        .header-button:disabled {
          cursor: not-allowed;
          filter: none;
          opacity: 0.45;
        }

        .workspace {
          display: grid;
          grid-template-columns: minmax(420px, 45%) minmax(520px, 55%);
          height: calc(100vh - 68px);
          overflow: hidden;
        }

        .editor-pane {
          overflow-y: auto;
          padding: 18px;
          background: #0b1020;
          border-right: 1px solid rgba(255, 255, 255, 0.08);
        }

        .editor-section {
          margin-bottom: 14px;
        }

        .section-toggle {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 8px;
          border: 0;
          background: transparent;
          color: #cbd5e1;
          cursor: pointer;
          font: inherit;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.11em;
          padding: 8px 2px;
          text-align: left;
          text-transform: uppercase;
        }

        .chevron {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 14px;
          height: 14px;
          color: #64748b;
          font-size: 18px;
          transform: rotate(90deg);
          transition: transform 0.18s ease;
        }

        .chevron.collapsed {
          transform: rotate(0deg);
        }

        .section-count {
          margin-left: auto;
          color: #64748b;
          font-size: 10px;
          letter-spacing: 0;
        }

        .suggestion-grid {
          display: grid;
          gap: 10px;
        }

        .suggestion-card,
        .editor-card {
          border-radius: 10px;
          border: 1px solid rgba(148, 163, 184, 0.14);
          background: rgba(15, 23, 42, 0.76);
          box-shadow: 0 1px 0 rgba(255, 255, 255, 0.03) inset;
        }

        .suggestion-card {
          width: 100%;
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
          align-items: end;
          gap: 10px;
          padding: 11px 12px;
          color: inherit;
          cursor: pointer;
          font: inherit;
          text-align: left;
        }

        .suggestion-card.critical {
          border-color: rgba(239, 68, 68, 0.24);
          background: rgba(127, 29, 29, 0.16);
        }

        .suggestion-card.important {
          border-color: rgba(245, 158, 11, 0.24);
          background: rgba(120, 53, 15, 0.14);
        }

        .suggestion-card.applied {
          border-color: rgba(34, 197, 94, 0.24);
          background: rgba(20, 83, 45, 0.16);
        }

        .suggestion-card:hover {
          border-color: rgba(148, 163, 184, 0.28);
          background: rgba(30, 41, 59, 0.82);
        }

        .suggestion-card-main {
          display: grid;
          grid-template-columns: 10px minmax(0, 1fr);
          align-items: center;
          gap: 9px;
          min-width: 0;
        }

        .suggestion-dot {
          width: 8px;
          height: 8px;
          border-radius: 999px;
          background: #ef4444;
          box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.12);
        }

        .suggestion-card.important .suggestion-dot {
          background: #f59e0b;
          box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.12);
        }

        .suggestion-card.applied .suggestion-dot {
          background: #22c55e;
          box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.12);
        }

        .suggestion-card h3 {
          margin: 0 0 3px;
          color: #f8fafc;
          font-size: 12.5px;
          font-weight: 750;
          line-height: 1.25;
        }

        .suggestion-card p {
          margin: 0;
          color: #94a3b8;
          font-size: 11px;
          line-height: 1.25;
        }

        .suggestion-status {
          justify-self: end;
          color: #94a3b8;
          font-size: 11px;
          font-weight: 800;
          white-space: nowrap;
        }

        .suggestion-status.applied {
          color: #86efac;
        }

        .suggestion-status.pending {
          color: #cbd5e1;
        }

        .editor-card {
          padding: 14px;
          margin-bottom: 10px;
        }

        .editor-card.compact {
          padding: 11px 14px;
        }

        .card-grid {
          display: grid;
          gap: 7px 12px;
        }

        .two-columns {
          grid-template-columns: minmax(0, 1fr) minmax(135px, 0.42fr);
        }

        .skill-grid {
          grid-template-columns: 150px minmax(0, 1fr);
          align-items: start;
        }

        .editable-textarea {
          width: 100%;
          resize: none;
          overflow: hidden;
          border: 0;
          border-radius: 6px;
          outline: none;
          background: rgba(2, 6, 23, 0.36);
          color: #cbd5e1;
          font: inherit;
          font-size: 12.5px;
          line-height: 1.4;
          padding: 7px 8px;
        }

        .editable-textarea:focus {
          background: rgba(15, 23, 42, 0.96);
          box-shadow: 0 0 0 1px rgba(59, 130, 246, 0.42);
        }

        .field-strong {
          color: #f8fafc;
          font-weight: 700;
        }

        .bullet-list-editor {
          display: grid;
          gap: 8px;
          margin-top: 12px;
        }

        .bullet-editor-item {
          scroll-margin-top: 76px;
          border-radius: 10px;
          transition: background 0.25s ease, box-shadow 0.25s ease;
        }

        .bullet-editor-item.targeted {
          background: rgba(59, 130, 246, 0.08);
          box-shadow: 0 0 0 1px rgba(96, 165, 250, 0.32), 0 0 0 4px rgba(59, 130, 246, 0.07);
          padding: 6px;
          margin: -6px;
        }

        .bullet-editor-row {
          display: grid;
          grid-template-columns: 14px minmax(0, 1fr) 26px;
          align-items: start;
          gap: 7px;
        }

        .bullet-dot {
          color: #64748b;
          font-size: 15px;
          line-height: 28px;
          text-align: center;
        }

        .bullet-input {
          color: #dbeafe;
          transition: background 0.3s, box-shadow 0.3s;
        }

        .bullet-input.applied-flash {
          background: rgba(34, 197, 94, 0.15);
          box-shadow: 0 0 0 1px rgba(34, 197, 94, 0.4);
        }

        .delete-bullet {
          width: 24px;
          height: 24px;
          margin-top: 2px;
          border: 1px solid rgba(148, 163, 184, 0.14);
          border-radius: 6px;
          background: rgba(15, 23, 42, 0.86);
          color: #64748b;
          cursor: pointer;
          font: inherit;
          font-size: 12px;
          font-weight: 800;
          line-height: 1;
        }

        .delete-bullet:hover {
          color: #fecaca;
          border-color: rgba(239, 68, 68, 0.34);
        }

        .inline-suggestion-panel {
          margin: 7px 33px 4px 21px;
          border-left: 2px solid #ef4444;
          border-radius: 8px;
          background: rgba(127, 29, 29, 0.18);
          padding: 10px 11px 11px;
        }

        .inline-suggestion-panel.important {
          border-left-color: #f59e0b;
          background: rgba(120, 53, 15, 0.18);
        }

        .inline-suggestion-label {
          display: flex;
          align-items: center;
          gap: 7px;
          color: #fecaca;
          font-size: 9px;
          font-weight: 850;
          letter-spacing: 0.09em;
          line-height: 1.1;
          margin-bottom: 8px;
          text-transform: uppercase;
        }

        .inline-suggestion-panel.important .inline-suggestion-label {
          color: #fde68a;
        }

        .inline-suggestion-dot {
          width: 7px;
          height: 7px;
          border-radius: 999px;
          background: #ef4444;
        }

        .inline-suggestion-panel.important .inline-suggestion-dot {
          background: #f59e0b;
        }

        .inline-suggestion-panel p {
          margin: 0;
          color: #cbd5e1;
          font-size: 12px;
          line-height: 1.48;
        }

        .inline-suggestion-actions {
          display: flex;
          justify-content: flex-end;
          margin-top: 10px;
        }

        .inline-suggestion-actions button {
          border: 0;
          border-radius: 7px;
          background: #ef4444;
          color: #fff;
          cursor: pointer;
          font: inherit;
          font-size: 11.5px;
          font-weight: 850;
          padding: 7px 11px;
        }

        .inline-suggestion-panel.important .inline-suggestion-actions button {
          background: #d97706;
        }

        .add-bullet {
          margin-top: 10px;
          border: 1px solid rgba(59, 130, 246, 0.24);
          border-radius: 7px;
          background: rgba(37, 99, 235, 0.12);
          color: #93c5fd;
          cursor: pointer;
          font: inherit;
          font-size: 12px;
          font-weight: 800;
          padding: 7px 10px;
        }

        .preview-pane {
          overflow: auto;
          background: #d7dce5;
          padding: 24px;
        }

        .resume-page {
          width: 8.5in;
          min-height: 11in;
          margin: 0 auto;
          padding: 0.65in;
          background: white;
          color: #000;
          box-shadow: 0 18px 50px rgba(15, 23, 42, 0.22);
          font-family: Georgia, "Times New Roman", serif;
          font-size: 10pt;
          line-height: 1.28;
        }

        .resume-header-preview {
          text-align: center;
          margin-bottom: 8px;
        }

        .resume-header-preview h1 {
          margin: 0 0 2px;
          color: #000;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 22pt;
          font-weight: 700;
          line-height: 1.05;
          letter-spacing: 0;
        }

        .resume-header-preview p {
          margin: 0;
          color: #000;
          font-size: 9.5pt;
          line-height: 1.2;
        }

        .preview-section {
          margin-top: 7px;
        }

        .preview-section h2 {
          margin: 0 0 3px;
          padding: 0 0 1px;
          border-bottom: 1.5px solid #000;
          color: #000;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 10.2pt;
          font-weight: 700;
          letter-spacing: 0;
          line-height: 1.05;
          text-transform: uppercase;
        }

        .preview-entry {
          margin: 0 0 4px;
        }

        .preview-row {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          gap: 16px;
          margin: 0;
          color: #000;
          font-size: 10pt;
          line-height: 1.18;
        }

        .preview-row > div:last-child {
          flex-shrink: 0;
          text-align: right;
          white-space: nowrap;
        }

        .preview-project-title {
          margin: 0;
          color: #000;
          font-size: 10pt;
          line-height: 1.18;
        }

        .preview-bullets {
          margin: 1px 0 3px 17px;
          padding: 0;
          list-style-position: outside;
          list-style-type: disc;
        }

        .preview-bullets li {
          margin: 0 0 1px;
          padding-left: 1px;
          color: #000;
          font-size: 9.7pt;
          line-height: 1.22;
        }

        .preview-skills p {
          margin: 0 0 2px;
          color: #000;
          font-size: 9.8pt;
          line-height: 1.18;
        }

        .resume-page strong {
          font-weight: 700;
        }

        .resume-page em {
          font-style: italic;
        }

        @media (max-width: 1100px) {
          .workspace {
            grid-template-columns: 1fr;
            height: auto;
            overflow: visible;
          }

          .editor-pane,
          .preview-pane {
            height: auto;
            overflow: visible;
          }
        }

        @media print {
          @page {
            size: letter;
            margin: 0;
          }

          html,
          body {
            width: 8.5in;
            min-height: 11in;
            background: #fff !important;
          }

          .no-print {
            display: none !important;
          }

          .resume-editor-page,
          .workspace,
          .preview-pane {
            display: block !important;
            height: auto !important;
            min-height: 0 !important;
            overflow: visible !important;
            background: #fff !important;
            padding: 0 !important;
          }

          .preview-pane {
            position: static !important;
            width: 8.5in !important;
          }

          .resume-page {
            width: 8.5in !important;
            min-height: 11in !important;
            margin: 0 !important;
            padding: 0.65in !important;
            box-shadow: none !important;
          }
        }
      `}</style>

      <div className="resume-editor-page">
        <ResumeEditorHeader
          matchScore={matchScore}
          strengthCount={strengthCount}
          criticalApplied={criticalApplied}
          totalCritical={totalCritical}
          importantApplied={importantApplied}
          totalImportant={totalImportant}
          allComplete={allComplete}
          onBackToAnalysis={onBackToAnalysis}
          onSaveTailoredResume={onSaveTailoredResume}
          onExport={handleExport}
          onSubmit={onSubmitApplication}
          isSavingTailoredResume={isSavingTailoredResume}
          isSubmittingApplication={isSubmittingApplication}
          isDraftDirty={isDraftDirty}
          savedTailoredResumeId={savedTailoredResumeId}
          tailoredResumeSaveError={tailoredResumeSaveError}
        />

        <main className="workspace">
          <aside className="editor-pane no-print">
            <section className="editor-section">
              <SectionHeader
                title="AI Suggestions"
                count={aiSuggestions.length}
                collapsed={collapsedSections.suggestions}
                onToggle={() => toggleSection('suggestions')}
              />
              {!collapsedSections.suggestions && (
                <SuggestionCards
                  suggestions={aiSuggestions}
                  appliedFixes={appliedFixes}
                  experiences={resume.experience}
                  onSelect={scrollToSuggestion}
                />
              )}
            </section>

            <section className="editor-section">
              <SectionHeader
                title="Header"
                collapsed={collapsedSections.header}
                onToggle={() => toggleSection('header')}
              />
              {!collapsedSections.header && (
                <article className="editor-card">
                  <div className="card-grid two-columns">
                    <AutoResizeTextarea
                      value={resume.name}
                      onChange={(value) => onResumeChange((previous) => ({ ...previous, name: value }))}
                      label="Name"
                      className="field-strong"
                    />
                    <AutoResizeTextarea
                      value={resume.contact.email}
                      onChange={(value) => updateContact('email', value)}
                      label="Email"
                    />
                    <AutoResizeTextarea
                      value={resume.contact.phone}
                      onChange={(value) => updateContact('phone', value)}
                      label="Phone"
                    />
                    <AutoResizeTextarea
                      value={resume.contact.linkedin}
                      onChange={(value) => updateContact('linkedin', value)}
                      label="LinkedIn"
                    />
                  </div>
                </article>
              )}
            </section>

            <section className="editor-section">
              <SectionHeader
                title="Education"
                count={resume.education.length}
                collapsed={collapsedSections.education}
                onToggle={() => toggleSection('education')}
              />
              {!collapsedSections.education &&
                resume.education.map((education) => (
                  <EducationCard
                    key={education.id}
                    education={education}
                    onFieldChange={(field, value) => updateEducationField(education.id, field, value)}
                    onBulletChange={(index, value) => updateEducationBullet(education.id, index, value)}
                    onBulletDelete={(index) => deleteEducationBullet(education.id, index)}
                    onBulletAdd={() => addEducationBullet(education.id)}
                  />
                ))}
            </section>

            <section className="editor-section">
              <SectionHeader
                title="Experience"
                count={resume.experience.length}
                collapsed={collapsedSections.experience}
                onToggle={() => toggleSection('experience')}
              />
              {!collapsedSections.experience &&
                resume.experience.map((experience) => (
                  <ExperienceCard
                    key={experience.id}
                    experience={experience}
                    suggestions={aiSuggestions}
                    appliedFixes={appliedFixes}
                    flashingBulletKeys={flashingBulletKeys}
                    targetedBulletKey={targetedBulletKey}
                    onFieldChange={(field, value) => updateExperienceField(experience.id, field, value)}
                    onBulletChange={(index, value) => updateExperienceBullet(experience.id, index, value)}
                    onBulletDelete={(index) => deleteExperienceBullet(experience.id, index)}
                    onBulletAdd={() => addExperienceBullet(experience.id)}
                    onSuggestionApply={applySuggestion}
                  />
                ))}
            </section>

            <section className="editor-section">
              <SectionHeader
                title="Projects"
                count={resume.projects.length}
                collapsed={collapsedSections.projects}
                onToggle={() => toggleSection('projects')}
              />
              {!collapsedSections.projects &&
                resume.projects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onFieldChange={(field, value) => updateProjectField(project.id, field, value)}
                    onBulletChange={(index, value) => updateProjectBullet(project.id, index, value)}
                    onBulletDelete={(index) => deleteProjectBullet(project.id, index)}
                    onBulletAdd={() => addProjectBullet(project.id)}
                  />
                ))}
            </section>

            <section className="editor-section">
              <SectionHeader
                title="Skills"
                count={resume.skills.length}
                collapsed={collapsedSections.skills}
                onToggle={() => toggleSection('skills')}
              />
              {!collapsedSections.skills &&
                resume.skills.map((skill, index) => (
                  <SkillCard
                    key={`${skill.category}-${index}`}
                    skill={skill}
                    onFieldChange={(field, value) => updateSkillField(index, field, value)}
                  />
                ))}
            </section>
          </aside>

          <section className="preview-pane">
            <ResumePreview resume={resume} />
          </section>
        </main>
      </div>
    </>
  )
}
