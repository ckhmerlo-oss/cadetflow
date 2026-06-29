export type DocSectionId =
  | 'basics'
  | 'howToUse'
  | 'whatHappensNext'
  | 'whoSeesThis'
  | 'tips'
  | 'tracking'

export type DocSection = {
  id: DocSectionId
  title: string
  items: string[]
}

export type DocTopicSections = Record<DocSectionId, string[]>

export const DOC_SECTION_META: { id: DocSectionId; title: string }[] = [
  { id: 'basics', title: 'The Basics' },
  { id: 'howToUse', title: 'How to Use It' },
  { id: 'whatHappensNext', title: 'What Happens Next' },
  { id: 'whoSeesThis', title: 'Who Sees This' },
  { id: 'tips', title: 'Common Questions & Pro Tips' },
  { id: 'tracking', title: 'Tracking & History' },
]

export function buildDocSections(sections: DocTopicSections): DocSection[] {
  return DOC_SECTION_META.map(({ id, title }) => ({
    id,
    title,
    items: sections[id],
  }))
}
