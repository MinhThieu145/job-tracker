type ScoreArcProps = {
  score: number
}

export function ScoreArc({ score }: ScoreArcProps) {
  const radius = 48
  const circumference = 2 * Math.PI * radius
  const arcLength = circumference * 0.75
  const filledLength = (score / 100) * arcLength
  const color = score >= 75 ? "var(--ok)" : score >= 65 ? "var(--warn)" : "var(--accent)"

  return (
    <svg width="120" height="92" viewBox="0 0 120 92" aria-label={`Resume score ${score}%`}>
      <circle
        cx="60"
        cy="66"
        r={radius}
        fill="none"
        stroke="var(--surface)"
        strokeWidth="5"
        strokeDasharray={`${arcLength} ${circumference - arcLength}`}
        strokeDashoffset={circumference * 0.125}
        strokeLinecap="round"
      />
      <circle
        cx="60"
        cy="66"
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth="5"
        strokeDasharray={`${filledLength} ${circumference - filledLength}`}
        strokeDashoffset={circumference * 0.125 + (arcLength - filledLength)}
        strokeLinecap="round"
        className="transition-[stroke-dasharray,stroke-dashoffset] duration-1000 ease-out"
      />
      <text
        x="60"
        y="63"
        textAnchor="middle"
        className="fill-[var(--accent)] font-mono text-[24px] font-bold"
      >
        {score}%
      </text>
      <text
        x="60"
        y="78"
        textAnchor="middle"
        className="fill-[var(--text-muted)] text-[9px] font-semibold tracking-[0.08em]"
      >
        SCORE
      </text>
    </svg>
  )
}
