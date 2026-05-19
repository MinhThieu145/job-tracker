export type PublicScanView = "landing" | "scanning" | "results"

export type ScanSource = "uploaded" | "demo"

export type LandingMessage = {
  tone: "info" | "error"
  text: string
}
