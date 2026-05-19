import type { ReactNode } from "react"
import type { BulletSignal, BulletSignalKey } from "@/lib/schemas/public-quick-scan"
import type { ResumeStructuredData } from "@/lib/schemas/resume-structured-data"

type ResumePanelProps = {
  resume: ResumeStructuredData
  bulletSignals: Record<BulletSignalKey, BulletSignal>
  highlightedBulletKey: BulletSignalKey | null
}

const signalBorderClassName: Record<BulletSignal, string> = {
  good: "border-l-ok",
  partial: "border-l-warn",
  weak: "border-l-err",
}

export function getResumeBulletId(key: BulletSignalKey) {
  return `resume-bullet-${key.replace(":", "-")}`
}

export function ResumePanel({
  resume,
  bulletSignals,
  highlightedBulletKey,
}: ResumePanelProps) {
  return (
    <aside className="border-t border-border bg-card lg:sticky lg:top-14 lg:h-[calc(100vh-56px)] lg:w-[340px] lg:shrink-0 lg:overflow-y-auto lg:border-l lg:border-t-0">
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card px-[18px] py-4">
        <div className="text-[9px] font-bold uppercase tracking-[0.1em] text-muted-copy">
          Your resume
        </div>
        <div className="flex items-center gap-1.5">
          <span className="size-1.5 rounded-full bg-ok" />
          <span className="size-1.5 rounded-full bg-warn" />
          <span className="size-1.5 rounded-full bg-err" />
        </div>
      </div>

      <div className="px-[22px] py-5 text-[12px]">
        <header className="mb-4 border-b border-border pb-4 text-center">
          <div className="mb-1 font-serif text-[20px] font-normal text-foreground">
            {resume.name}
          </div>
          <div className="text-[11px] leading-[1.6] text-muted-copy">
            {resume.contact.email}
          </div>
          <div className="text-[11px] leading-[1.6] text-muted-copy">
            {resume.contact.linkedin} · {resume.contact.phone}
          </div>
        </header>

        <ResumeSectionTitle>Education</ResumeSectionTitle>
        {resume.education.map((item) => (
          <section key={item.id} className="mb-3">
            <div className="mb-0.5 flex justify-between gap-3">
              <span className="text-[12px] font-semibold text-foreground">{item.institution}</span>
              <span className="shrink-0 text-[11px] text-muted-copy">{item.dates}</span>
            </div>
            <div className="mb-1 text-[11px] text-secondary-copy">
              {item.degree} · {item.gpa}
            </div>
            {item.bullets.map((bullet) => (
              <p
                key={bullet}
                className="mb-1 border-l-2 border-l-border pl-2 text-[12px] leading-[1.55] text-secondary-copy"
              >
                {bullet}
              </p>
            ))}
          </section>
        ))}

        <ResumeSectionTitle>Work Experience</ResumeSectionTitle>
        {resume.experience.map((experience) => (
          <section key={experience.id} className="mb-3">
            <div className="mb-0.5 flex justify-between gap-3">
              <span className="text-[12px] font-semibold text-foreground">{experience.company}</span>
              <span className="shrink-0 text-[11px] text-muted-copy">{experience.location}</span>
            </div>
            <div className="mb-1.5 flex justify-between gap-3">
              <span className="text-[11px] italic text-secondary-copy">{experience.role}</span>
              <span className="shrink-0 text-[11px] text-muted-copy">{experience.dates}</span>
            </div>
            {experience.bullets.map((bullet, index) => {
              const bulletKey = `${experience.id}:${index}` as BulletSignalKey
              const signal = bulletSignals[bulletKey] ?? "partial"
              const isHighlighted = highlightedBulletKey === bulletKey

              return (
                <p
                  id={getResumeBulletId(bulletKey)}
                  key={bulletKey}
                  className={`mb-1.5 rounded-r-[3px] border-l-[2.5px] py-0.5 pl-2 text-[12px] leading-[1.6] text-secondary-copy transition-colors duration-300 ${
                    signalBorderClassName[signal]
                  } ${isHighlighted ? "bg-accent-bg" : "bg-transparent"}`}
                >
                  {bullet}
                </p>
              )
            })}
          </section>
        ))}

        <ResumeSectionTitle>Projects</ResumeSectionTitle>
        {resume.projects.map((project) => (
          <section key={project.id} className="mb-2.5">
            <div className="mb-1 text-[12px] font-semibold text-foreground">{project.name}</div>
            <div className="mb-1.5 text-[11px] text-muted-copy">{project.technologies}</div>
            {project.bullets.map((bullet) => (
              <p
                key={bullet}
                className="mb-1 border-l-2 border-l-border pl-2 text-[12px] leading-[1.55] text-secondary-copy"
              >
                {bullet}
              </p>
            ))}
          </section>
        ))}

        <ResumeSectionTitle>Skills</ResumeSectionTitle>
        {resume.skills.map((skill) => (
          <p key={skill.category} className="mb-1.5 text-[11px] leading-[1.55] text-secondary-copy">
            <span className="text-[12px] font-semibold text-foreground">{skill.category}: </span>
            {skill.items}
          </p>
        ))}
      </div>
    </aside>
  )
}

function ResumeSectionTitle({ children }: { children: ReactNode }) {
  return (
    <div className="mb-2.5 mt-5 border-b border-border pb-1.5 text-[9px] font-bold uppercase tracking-[0.1em] text-muted-copy first:mt-0">
      {children}
    </div>
  )
}
