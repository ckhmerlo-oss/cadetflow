import { buildDocSections, type DocSection, type DocTopicSections } from './docSections'

export type DocTopic = {
  id: string
  title: string
  summary: string
  sections: DocSection[]
  relatedRoutes?: string[]
  isNew?: boolean
  comingSoon?: boolean
}

export type DocCategory = {
  id: string
  title: string
  topics: DocTopic[]
}

export function topic(
  id: string,
  title: string,
  summary: string,
  sections: DocTopicSections,
  options?: { relatedRoutes?: string[]; isNew?: boolean; comingSoon?: boolean },
): DocTopic {
  return {
    id,
    title,
    summary,
    sections: buildDocSections(sections),
    ...options,
  }
}
