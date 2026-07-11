import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";
import {
  GermanProgressMap,
  GermanWordScore,
  STORAGE_KEYS,
} from "../store/progressStore";

export interface UseProgressResult {
  isLoading: boolean;
  germanProgress: GermanProgressMap;
  recordGermanAnswer: (id: string, wasCorrect: boolean) => Promise<void>;
  getGermanScore: (level: string, levelWordIds: string[]) => GermanWordScore;
}

export function useProgress(): UseProgressResult {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [germanProgress, setGermanProgress] = useState<GermanProgressMap>({});

  useEffect(() => {
    let isMounted = true;

    async function loadProgress(): Promise<void> {
      const germanRaw = await AsyncStorage.getItem(
        STORAGE_KEYS.GERMAN_PROGRESS,
      );

      if (!isMounted) {
        return;
      }

      setGermanProgress(
        germanRaw ? (JSON.parse(germanRaw) as GermanProgressMap) : {},
      );
      setIsLoading(false);
    }

    loadProgress();

    return () => {
      isMounted = false;
    };
  }, []);

  const recordGermanAnswer = useCallback(
    async (id: string, wasCorrect: boolean): Promise<void> => {
      const existing: GermanWordScore = germanProgress[id] ?? {
        correct: 0,
        incorrect: 0,
      };
      const updatedScore: GermanWordScore = {
        correct: existing.correct + (wasCorrect ? 1 : 0),
        incorrect: existing.incorrect + (wasCorrect ? 0 : 1),
      };
      const updated: GermanProgressMap = {
        ...germanProgress,
        [id]: updatedScore,
      };
      setGermanProgress(updated);
      await AsyncStorage.setItem(
        STORAGE_KEYS.GERMAN_PROGRESS,
        JSON.stringify(updated),
      );
    },
    [germanProgress],
  );

  const getGermanScore = useCallback(
    (level: string, levelWordIds: string[]): GermanWordScore => {
      return levelWordIds.reduce<GermanWordScore>(
        (totals, id) => {
          const entry = germanProgress[id];
          if (!entry) {
            return totals;
          }
          return {
            correct: totals.correct + entry.correct,
            incorrect: totals.incorrect + entry.incorrect,
          };
        },
        { correct: 0, incorrect: 0 },
      );
    },
    [germanProgress],
  );

  return {
    isLoading,
    germanProgress,
    recordGermanAnswer,
    getGermanScore,
  };
}
