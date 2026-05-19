"use client"

import { useEffect, useState } from "react"

const scanningSteps = [
  "Parsing resume structure...",
  "Extracting job requirements...",
  "Scoring keyword coverage...",
]

type ScanningScreenProps = {
  onComplete: () => void
}

export function ScanningScreen({ onComplete }: ScanningScreenProps) {
  const [activeStep, setActiveStep] = useState(0)

  useEffect(() => {
    const stepTwoTimer = window.setTimeout(() => setActiveStep(1), 800)
    const stepThreeTimer = window.setTimeout(() => setActiveStep(2), 1700)
    const completeTimer = window.setTimeout(onComplete, 2800)

    return () => {
      window.clearTimeout(stepTwoTimer)
      window.clearTimeout(stepThreeTimer)
      window.clearTimeout(completeTimer)
    }
  }, [onComplete])

  return (
    <section className="flex min-h-[calc(100vh-52px)] items-center justify-center bg-background px-6 py-16">
      <div className="text-center">
        <h1 className="mb-9 font-serif text-[26px] font-normal tracking-normal text-foreground">
          Analyzing your match...
        </h1>

        <div className="flex flex-col items-start gap-4">
          {scanningSteps.map((label, index) => {
            const isComplete = index < activeStep
            const isActive = index === activeStep

            return (
              <div
                key={label}
                className={`flex items-center gap-3.5 transition-opacity duration-500 ${
                  index <= activeStep ? "opacity-100" : "opacity-25"
                }`}
              >
                <span
                  className={`flex size-6 shrink-0 items-center justify-center rounded-full border-[1.5px] transition-colors duration-300 ${
                    isComplete
                      ? "border-ok bg-ok-bg"
                      : isActive
                        ? "border-accent bg-accent-bg"
                        : "border-border-mid bg-surface"
                  }`}
                >
                  {isComplete ? (
                    <span className="text-[11px] font-bold text-ok">✓</span>
                  ) : null}
                  {isActive ? (
                    <span className="size-[7px] animate-pulse rounded-full bg-accent" />
                  ) : null}
                </span>
                <span
                  className={`text-[14px] transition-colors duration-300 ${
                    index <= activeStep ? "text-foreground" : "text-muted-copy"
                  }`}
                >
                  {label}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
