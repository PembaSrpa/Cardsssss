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
  "5K": () => require("../assets/data/ielts_speaking_5K.json"),
  "5L": () => require("../assets/data/ielts_speaking_5L.json"),
  "5M": () => require("../assets/data/ielts_speaking_5M.json"),
  "5N": () => require("../assets/data/ielts_speaking_5N.json"),
  "5O": () => require("../assets/data/ielts_speaking_5O.json"),
  "5P": () => require("../assets/data/ielts_speaking_5P.json"),
  "5Q": () => require("../assets/data/ielts_speaking_5Q.json"),
  "5R": () => require("../assets/data/ielts_speaking_5R.json"),
  "5S": () => require("../assets/data/ielts_speaking_5S.json"),
  "5T": () => require("../assets/data/ielts_speaking_5T.json"),
  "5U": () => require("../assets/data/ielts_speaking_5U.json"),
  "5V": () => require("../assets/data/ielts_speaking_5V.json"),
  "5W": () => require("../assets/data/ielts_speaking_5W.json"),
  "5X": () => require("../assets/data/ielts_speaking_5X.json"),
  "5Y": () => require("../assets/data/ielts_speaking_5Y.json"),
  "5Z": () => require("../assets/data/ielts_speaking_5Z.json"),
  "5AA": () => require("../assets/data/ielts_speaking_5AA.json"),
  "5AB": () => require("../assets/data/ielts_speaking_5AB.json"),
  "5AC": () => require("../assets/data/ielts_speaking_5AC.json"),
  "5AD": () => require("../assets/data/ielts_speaking_5AD.json"),
  "5AE": () => require("../assets/data/ielts_speaking_5AE.json"),
  "5AF": () => require("../assets/data/ielts_speaking_5AF.json"),
  "5AG": () => require("../assets/data/ielts_speaking_5AG.json"),
  "5AH": () => require("../assets/data/ielts_speaking_5AH.json"),
  "5AI": () => require("../assets/data/ielts_speaking_5AI.json"),
  "5AJ": () => require("../assets/data/ielts_speaking_5AJ.json"),
  "5AK": () => require("../assets/data/ielts_speaking_5AK.json"),
  "5AL": () => require("../assets/data/ielts_speaking_5AL.json"),
  "5AM": () => require("../assets/data/ielts_speaking_5AM.json"),
  "5AN": () => require("../assets/data/ielts_speaking_5AN.json"),
  "5AO": () => require("../assets/data/ielts_speaking_5AO.json"),
  "5AP": () => require("../assets/data/ielts_speaking_5AP.json"),
  "5AQ": () => require("../assets/data/ielts_speaking_5AQ.json"),
  "5AR": () => require("../assets/data/ielts_speaking_5AR.json"),
  "5AS": () => require("../assets/data/ielts_speaking_5AS.json"),
  "5AT": () => require("../assets/data/ielts_speaking_5AT.json"),
  "5AU": () => require("../assets/data/ielts_speaking_5AU.json"),
  "5AV": () => require("../assets/data/ielts_speaking_5AV.json"),
  "5AW": () => require("../assets/data/ielts_speaking_5AW.json"),
  "5AX": () => require("../assets/data/ielts_speaking_5AX.json"),
  "5AY": () => require("../assets/data/ielts_speaking_5AY.json"),
  "5AZ": () => require("../assets/data/ielts_speaking_5AZ.json"),
  "5BA": () => require("../assets/data/ielts_speaking_5BA.json"),
  "5BB": () => require("../assets/data/ielts_speaking_5BB.json"),
  "5BC": () => require("../assets/data/ielts_speaking_5BC.json"),
  "5BD": () => require("../assets/data/ielts_speaking_5BD.json"),
  "5BE": () => require("../assets/data/ielts_speaking_5BE.json"),
  "5BF": () => require("../assets/data/ielts_speaking_5BF.json"),
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
