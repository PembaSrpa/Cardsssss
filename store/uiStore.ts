// UI-only persistence keys — last visited position per module.
// These live here (not in progressStore.ts) because they are UI state,
// not learning-progress data.
export const UI_STORAGE_KEYS = {
  LAST_IELTS_SECTION: "cards_ui_last_ielts_section",
  LAST_IELTS_INDEX: "cards_ui_last_ielts_index",
  LAST_GERMAN_LEVEL: "cards_ui_last_german_level",
  LAST_GERMAN_INDEX: "cards_ui_last_german_index",
  LAST_GERMAN_SCORE: "cards_ui_last_german_score",
  LAST_GERMAN_STREAK: "cards_ui_last_german_streak",
  LAST_GLOSSAR_LEVEL: "cards_ui_last_glossar_level",
  LAST_GLOSSAR_KAPITEL: "cards_ui_last_glossar_kapitel",
  LAST_GLOSSAR_MODULE: "cards_ui_last_glossar_module",
  LAST_GLOSSAR_INDEX: "cards_ui_last_glossar_index",
} as const;

// Per-list resume position — separate from the "last visited anywhere" keys
// above. Each vocabulary-list screen (one per IELTS section or Glossar
// kapitel/module) needs to know its OWN saved index, not just whichever
// list was visited most recently overall.
export function ieltsListIndexKey(section: string): string {
  return `cards_ui_ielts_list_index_${section}`;
}

export function glossarListIndexKey(level: string, kapitel: number, moduleId?: string): string {
  return moduleId
    ? `cards_ui_glossar_list_index_${level}_${kapitel}_${moduleId}`
    : `cards_ui_glossar_list_index_${level}_${kapitel}`;
}
