export type QuestionTopic = 'Algebra' | 'Geometry' | 'Number Theory' | 'Combinatorics';

export interface Question {
  id: string;
  questionNumber: number;
  answer: 'A' | 'B' | 'C' | 'D' | 'E';
  topic: QuestionTopic;
  solution?: string; // Optional for now
}

export interface Test {
  id: string;
  name: string;
  year: number;
  competition: 'AMC 10A' | 'AMC 10B' | 'AMC 12A' | 'AMC 12B';
  questions: Question[];
}
