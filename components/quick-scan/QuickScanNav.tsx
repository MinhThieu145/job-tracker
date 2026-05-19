import type { PublicScanView } from "@/components/quick-scan/quick-scan-types"

type QuickScanNavProps = {
  view: PublicScanView
  onReset: () => void
  onTryFree: () => void
}

export function QuickScanNav({ view, onReset, onTryFree }: QuickScanNavProps) {
  const isLanding = view === "landing"

  return (
    <header className="sticky top-0 z-50 h-14 border-b border-border bg-background/95 backdrop-blur-[14px]">
      <div className="mx-auto flex h-full w-full max-w-[354px] min-w-0 items-center justify-between gap-4 px-0 sm:max-w-[1160px] sm:px-8">
        <button
          type="button"
          onClick={onReset}
          aria-label="Reset scan flow"
          className="font-serif text-[20px] leading-none tracking-normal text-foreground"
        >
          ResumeScore
        </button>

        <div className="flex items-center gap-4 sm:gap-6">
          {isLanding ? (
            <nav className="hidden items-center gap-6 sm:flex" aria-label="Landing sections">
              <a
                href="#how-it-works"
                className="text-[13px] text-muted-copy transition-colors hover:text-foreground"
              >
                How it works
              </a>
              <a
                href="#why-trust"
                className="text-[13px] text-muted-copy transition-colors hover:text-foreground"
              >
                Why trust it
              </a>
            </nav>
          ) : null}
          <button
            type="button"
            onClick={isLanding ? onTryFree : onReset}
            className="rounded-lg bg-primary px-4 py-2 text-[13px] font-semibold leading-none text-primary-foreground transition-colors hover:bg-[#2D2420]"
          >
            {isLanding ? "Try free" : "New scan ->"}
          </button>
        </div>
      </div>
    </header>
  )
}
