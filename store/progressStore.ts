export type IELTSWordStatus = "known" | "learning" | "hard" | "unseen";

export interface IELTSProgressMap {
  [wordId: string]: IELTSWordStatus;
}

export interface GermanWordScore {
  correct: number;
  incorrect: number;
}

export interface GermanProgressMap {
  [wordId: string]: GermanWordScore;
}

export const STORAGE_KEYS = {
  IELTS_PROGRESS: "cards_ielts_progress",
  GERMAN_PROGRESS: "cards_german_progress",
} as const;
