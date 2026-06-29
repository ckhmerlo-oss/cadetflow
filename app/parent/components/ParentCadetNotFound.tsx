import Link from 'next/link'

export default function ParentCadetNotFound() {
  return (
    <div className="max-w-2xl mx-auto p-4 sm:p-6 space-y-3">
      <p className="text-muted-foreground">That cadet is not linked to your account.</p>
      <Link href="/parent" className="text-sm text-primary hover:underline">
        ← Back to My cadet(s)
      </Link>
    </div>
  )
}
