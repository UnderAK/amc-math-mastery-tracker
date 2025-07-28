import { TestType } from "./amc";

export interface TestScore {
  id: string;
  date: string;
  score: number;
  testType: TestType;
  year: number;
  input?: string;
  key?: string;
  label?: string;
  synced?: boolean;
  questionTopics?: { [questionNum: number]: string };
  questionCorrectness?: { [questionNum: number]: boolean };
  // Legacy support for older data
  incorrectQuestions?: number[];
  topicMistakes?: { [topic: string]: number };
}
