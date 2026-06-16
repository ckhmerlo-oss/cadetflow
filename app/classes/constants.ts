const SLOT_LABELS: Record<string, string> = {
  term_1: 'Term 1',
  term_2: 'Term 2',
  term_3: 'Term 3',
  term_4: 'Term 4',
  term_5: 'Term 5',
  seminar_a: 'Seminar A',
  seminar_b: 'Seminar B',
}

export function slotLabel(slot: string) {
  return SLOT_LABELS[slot] ?? slot
}
