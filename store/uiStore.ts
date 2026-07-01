// UI-only persistence keys — last visited position per module.
// These live here (not in progressStore.ts) because they are UI state,
// not learning-progress data.
export const UI_STORAGE_KEYS = {
  LAST_IELTS_SECTION: "cards_ui_last_ielts_section",
  LAST_IELTS_INDEX: "cards_ui_last_ielts_index",
  LAST_GERMAN_LEVEL: "cards_ui_last_german_level",
  LAST_GERMAN_INDEX: "cards_ui_last_german_index",
} as const;
