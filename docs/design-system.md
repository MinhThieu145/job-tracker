# ResumeScore Design System

This is the source of truth for frontend design in this repo. Before making UI or frontend changes, read this file and follow these rules unless the user explicitly asks for a different direction.

## Product Feel

ResumeScore should feel warm, fast, focused, and specific to resume analysis. The interface should help a user understand their resume fit quickly, not make them read a report.

- Use a soft paper page background with white tool surfaces.
- Keep layouts compact, calm, and scannable.
- Use color only for state or action.
- Avoid dashboard darkness, decorative gradients, colored ornaments, and visual noise.
- Avoid long explanatory copy inside tool surfaces.

## Tokens

Use these exact product tokens for the public scan, analysis, and resume-writing surfaces.

```ts
const T = {
  bg: "#FAF7F2",
  card: "#FFFFFF",
  surface: "#F2EDE5",
  border: "#EDE7DE",
  borderMid: "#D8D0C8",
  t1: "#1A1410",
  t2: "#5C4F47",
  t3: "#9B8F85",
  accent: "#B45309",
  accentBg: "#FEF3C7",
  accentRim: "#F3E4C0",
  ok: "#16A34A",
  okBg: "#DCFCE7",
  err: "#DC2626",
  errBg: "#FEE2E2",
  warn: "#D97706",
  warnBg: "#FEF9C3",
}
```

## Typography

- Instrument Serif: logo, hero headlines, and CTA headline only.
- DM Sans: body text, labels, buttons, tables, cards, and navigation.
- JetBrains Mono: score percentages and numeric counts only.
- Do not use italic serif for analysis or data content.
- Do not scale font size with viewport width.
- Letter spacing should normally be `0`; use small positive tracking only for tiny uppercase labels.

## Components

Buttons:

- Primary buttons use `#1A1410` fill with white text.
- Ghost buttons are transparent with `#D8D0C8` border.
- Do not use colored pill buttons in data rows.
- Button labels should be short and action-oriented.

Cards:

- Background: `#FFFFFF`.
- Border: `1px solid #EDE7DE`.
- Radius: `12px`.
- No colored top borders.
- No nested decorative cards.

Data rows:

- Use status text and icons rather than heavy badges.
- Badge backgrounds are only for tiny counts.
- Keep row details short and specific.
- Use `#5C4F47` for explanatory text and `#9B8F85` for labels.

Status icons:

- Pass or demonstrated: green circle with check.
- Warn, partial, or weak: amber circle with exclamation or partial icon.
- Fail, missing, or not shown: red circle or red outlined icon.

## Layout Rules

Landing pages:

- The first screen should expose the actual scan action.
- Use one dominant primary CTA.
- Keep trust copy short.
- Do not make the user read a marketing page before using the tool.

Results pages:

- Use the three-column model: score/actions, analysis, resume.
- Keep score and navigation sticky.
- Keep the resume visible alongside analysis.
- Do not force users to switch between analysis and resume context.

Analysis content:

- Prefer compact cards with short sections.
- Put the most actionable gaps first.
- Avoid walls of text.
- Avoid long description text under section headers.

Resume panel:

- Render the resume as plain structured text.
- Use subtle left-border status indicators on bullets.
- Do not add keyword highlight marks.
- Do not add a legend unless the user explicitly asks for one.

## Examples

Good:

- `62%` in JetBrains Mono with accent color.
- A missing keyword row with a red icon, the skill name, short action text, and one sentence of reasoning.
- A white card with warm border and a short heading.

Avoid:

- Dark dashboard styling for the public scan flow.
- Purple, blue, or multi-color decorative gradients.
- Large colored badges inside every row.
- A standalone analysis report that hides the resume.
- A parse button followed by a second analyze button for the public scan flow.
