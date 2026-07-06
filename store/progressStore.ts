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
  NOTIFICATIONS_ENABLED: "cards_notifications_enabled",
  VOCAB_NOTIF_INDEX: "cards_vocab_notif_index",
  VOCAB_NOTIF_INTERVAL_MINUTES: "cards_vocab_notif_interval_minutes",
} as const;
