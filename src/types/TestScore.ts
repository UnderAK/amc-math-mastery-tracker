export interface TestScore {
  date: string;
  score: number;
  testType: string;
  year: number;
  input?: string;
  key?: string;
  label?: string;
  questionTopics?: { [questionNum: number]: string };
  questionCorrectness?: { [questionNum: number]: boolean };
  // Legacy support for older data
  incorrectQuestions?: number[];
  topicMistakes?: { [topic: string]: number };
}
