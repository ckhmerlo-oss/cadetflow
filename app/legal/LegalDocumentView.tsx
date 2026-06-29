import type { LegalDocument } from '@/app/legal/content/types'

export default function LegalDocumentView({ document }: { document: LegalDocument }) {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
      <header className="space-y-2 border-b border-border pb-6">
        <h1 className="text-3xl font-bold text-foreground">{document.title}</h1>
        <p className="text-sm text-muted-foreground">
          Version {document.version} · Effective {document.effectiveDate}
        </p>
        <p className="text-sm text-amber-700 dark:text-amber-300 bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
          Draft for attorney review — not legal advice.
        </p>
      </header>
      <div className="space-y-6">
        {document.sections.map((section) => (
          <section key={section.title} className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">{section.title}</h2>
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {section.body}
            </p>
          </section>
        ))}
      </div>
    </div>
  )
}
