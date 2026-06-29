type ReportSubject = { id: string; first_name: string; last_name: string }

type RawSubjectRow = {
  cadet:
    | ReportSubject
    | ReportSubject[]
    | null
}

export function mapReportSubjects<T extends { subjects?: RawSubjectRow[] }>(
  report: T
): T & { subjects?: ReportSubject[] } {
  const raw = report.subjects ?? []
  const subjects = raw
    .map((row) => {
      const cadet = Array.isArray(row.cadet) ? row.cadet[0] : row.cadet
      return cadet ?? null
    })
    .filter(Boolean) as ReportSubject[]

  return { ...report, subjects }
}
