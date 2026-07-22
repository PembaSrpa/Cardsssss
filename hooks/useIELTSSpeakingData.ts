import { useEffect, useState } from "react";

export type SpeakingPart = 1 | 2 | 3;

export interface IELTSSpeakingQuestion {
  id: string;
  part: SpeakingPart;
  question: string;
  cueCardPoints?: string[];
  answer: string;
}

export interface IELTSSpeakingTopicData {
  section: string;
  title: string;
  questions: IELTSSpeakingQuestion[];
}

export interface UseIELTSSpeakingDataResult {
  questions: IELTSSpeakingQuestion[];
  title: string;
  section: string;
  isLoading: boolean;
}

const IELTS_SPEAKING_DATA_MAP: { [key: string]: () => IELTSSpeakingTopicData } = {
  "5A": () => require("../assets/data/ielts_speaking_5A.json"),
  "5B": () => require("../assets/data/ielts_speaking_5B.json"),
  "5C": () => require("../assets/data/ielts_speaking_5C.json"),
  "5D": () => require("../assets/data/ielts_speaking_5D.json"),
  "5E": () => require("../assets/data/ielts_speaking_5E.json"),
  "5F": () => require("../assets/data/ielts_speaking_5F.json"),
  "5G": () => require("../assets/data/ielts_speaking_5G.json"),
  "5H": () => require("../assets/data/ielts_speaking_5H.json"),
  "5I": () => require("../assets/data/ielts_speaking_5I.json"),
  "5J": () => require("../assets/data/ielts_speaking_5J.json"),
};

export const AVAILABLE_IELTS_SPEAKING_TOPICS: string[] = Object.keys(IELTS_SPEAKING_DATA_MAP);

export function isIELTSSpeakingSection(section: string): boolean {
  return section in IELTS_SPEAKING_DATA_MAP;
}

const speakingCache: { [key: string]: IELTSSpeakingTopicData } = {};

function loadTopic(section: string): IELTSSpeakingTopicData | null {
  if (speakingCache[section]) {
    return speakingCache[section];
  }

  const loader = IELTS_SPEAKING_DATA_MAP[section];
  if (!loader) {
    return null;
  }

  const data = loader();
  speakingCache[section] = data;
  return data;
}

export function useIELTSSpeakingData(section: string): UseIELTSSpeakingDataResult {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [data, setData] = useState<IELTSSpeakingTopicData | null>(null);

  useEffect(() => {
    setIsLoading(true);
    const result = loadTopic(section);
    setData(result);
    setIsLoading(false);
  }, [section]);

  return {
    questions: data?.questions ?? [],
    title: data?.title ?? "",
    section: data?.section ?? section,
    isLoading,
  };
}
