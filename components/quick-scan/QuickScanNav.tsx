import type { PublicScanView } from "@/components/quick-scan/quick-scan-types"

type QuickScanNavProps = {
  view: PublicScanView
  onReset: () => void
  onTryFree: () => void
}

export function QuickScanNav({ view, onReset, onTryFree }: QuickScanNavProps) {
  const isLanding = view === "landing"

  return (
    <nav className="sticky top-0 z-50 flex h-[52px] items-center justify-between border-b border-border bg-[#fffcf8]/95 px-5 backdrop-blur-[10px] sm:px-7">
      <button
        type="button"
        onClick={onReset}
        aria-label="Reset scan flow"
        className="font-serif text-[18px] leading-none text-foreground"
      >
        ResumeScore
      </button>

      <div className="flex items-center gap-4 sm:gap-5">
        <a
          href="#how-it-works"
          className="hidden text-[13px] font-medium text-muted-copy transition-colors hover:text-foreground sm:inline"
        >
          How it works
        </a>
        <a
          href="#pricing"
          className="hidden text-[13px] font-medium text-muted-copy transition-colors hover:text-foreground sm:inline"
        >
          Pricing
        </a>
        <button
          type="button"
          onClick={isLanding ? onTryFree : onReset}
          className="rounded-[7px] bg-primary px-4 py-[7px] text-[13px] font-medium leading-none text-primary-foreground transition-colors hover:bg-[#2D2420]"
        >
          {isLanding ? "Try free" : "New scan ->"}
        </button>
      </div>
    </nav>
  )
}
