'use client'

import Link from 'next/link'
import HallwayBuildingSheet from '../../components/HallwayBuildingSheet'
import PrintButton from '../../components/PrintButton'
import type { HallwayBuildingResult } from '../../actions'

export default function PrintPageShell({
  building,
  company,
}: {
  building: HallwayBuildingResult
  company: string
}) {
  return (
    <>
      <style jsx global>{`
        @media screen {
          .print-page-preview {
            width: 8.5in;
            min-height: 11in;
            max-width: calc(100vw - 2rem);
            margin-left: auto;
            margin-right: auto;
            padding: 0.2in;
            background: white;
            color: black;
            box-shadow: 0 4px 24px rgba(0, 0, 0, 0.15);
            border: 1px solid #ccc;
          }
        }
        @media print {
          @page { margin: 0.2in; size: letter portrait; }
          body { background: white !important; color: black !important; }
          header, .no-print { display: none !important; }
          .print-page-preview {
            width: 100% !important;
            min-height: auto !important;
            max-width: none !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            border: none !important;
          }
          .print-roster { max-width: 100% !important; width: 100% !important; padding: 0 !important; }
        }
      `}</style>

      <div className="no-print max-w-6xl mx-auto p-4 flex justify-between items-center gap-4 border-b border-border mb-4">
        <Link href={`/barracks/hallway?company=${company}`} className="text-sm text-primary hover:underline">
          ← Back to hallway
        </Link>
        <PrintButton />
      </div>

      <div className="print-page-preview mb-8">
        <HallwayBuildingSheet building={building} printMode sportCodes={building.sport_codes} />
      </div>
    </>
  )
}
