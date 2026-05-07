export default function ResumeEditorPage() {
  return (
    <main className="min-h-screen px-4 py-10">
      <section className="mx-auto max-w-2xl rounded-lg border border-border bg-card p-6 text-foreground">
        <h1 className="text-xl font-semibold">Open an application first</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          The resume editor now uses analysis data from the new application flow. Run an application analysis, then choose
          a fix to open the editor with the right bullet selected.
        </p>
      </section>
    </main>
  )
}
