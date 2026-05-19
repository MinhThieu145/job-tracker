"use client"

import { useEffect, useState } from "react"

type MetricBarProps = {
  label: string
  found: number
  total: number
  tone: "accent" | "ok" | "warn" | "err"
  delay?: number
}

const toneClassName: Record<MetricBarProps["tone"], string> = {
  accent: "bg-accent",
  ok: "bg-ok",
  warn: "bg-warn",
  err: "bg-err",
}

export function MetricBar({ label, found, total, tone, delay = 0 }: MetricBarProps) {
  const [width, setWidth] = useState(0)
  const percent = total === 0 ? 0 : Math.round((found / total) * 100)

  useEffect(() => {
    const timer = window.setTimeout(() => setWidth(percent), delay)
    return () => window.clearTimeout(timer)
  }, [delay, percent])

  return (
    <div className="mb-2.5">
      <div className="mb-1.5 flex items-center justify-between gap-3">
        <span className="text-[11px] font-medium text-secondary-copy">{label}</span>
        <span className="font-mono text-[10px] text-muted-copy">
          {found}/{total}
        </span>
      </div>
      <div className="h-1 overflow-hidden rounded-full bg-surface">
        <div
          className={`h-full rounded-full transition-[width] duration-1000 ease-out ${toneClassName[tone]}`}
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  )
}
