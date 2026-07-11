export interface GermanWordScore {
  correct: number;
  incorrect: number;
}

export interface GermanProgressMap {
  [wordId: string]: GermanWordScore;
}

export const STORAGE_KEYS = {
  GERMAN_PROGRESS: "cards_german_progress",
} as const;
