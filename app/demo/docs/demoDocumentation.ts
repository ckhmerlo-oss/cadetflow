import type { DocCategory, DocTopic } from './topicHelper'
import { gettingStartedCategory } from './categories/gettingStarted'
import { reportsSubmissionsCategory } from './categories/reportsSubmissions'
import { notificationsCategory, oversightCategory } from './categories/notificationsAndOversight'
import { archivalCategory, historyCategory } from './categories/archivalAndHistory'
import { workOrdersCategory, barracksCategory } from './categories/workOrdersAndBarracks'
import { eventsSpecialCategory, parentPortalCategory } from './categories/eventsAndParentPortal'
import { coreOperationsCategory, adminCategory } from './categories/coreOperationsAndAdmin'
import { comingSoonCategory } from './categories/comingSoon'

export type { DocTopic, DocCategory } from './topicHelper'
export type { DocSection, DocSectionId } from './docSections'
export { DOC_SECTION_META } from './docSections'

export const DEMO_DOC_CATEGORIES: DocCategory[] = [
  gettingStartedCategory,
  reportsSubmissionsCategory,
  notificationsCategory,
  oversightCategory,
  archivalCategory,
  historyCategory,
  workOrdersCategory,
  barracksCategory,
  eventsSpecialCategory,
  parentPortalCategory,
  coreOperationsCategory,
  adminCategory,
  comingSoonCategory,
]

export const DEFAULT_DOC_TOPIC_ID = DEMO_DOC_CATEGORIES[0].topics[0].id

export function getDocTopicById(topicId: string): DocTopic | undefined {
  for (const category of DEMO_DOC_CATEGORIES) {
    const topic = category.topics.find((t) => t.id === topicId)
    if (topic) return topic
  }
  return undefined
}

export function getDocCategoryForTopic(topicId: string): DocCategory | undefined {
  return DEMO_DOC_CATEGORIES.find((c) => c.topics.some((t) => t.id === topicId))
}
