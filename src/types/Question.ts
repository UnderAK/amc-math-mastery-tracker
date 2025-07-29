export type QuestionTopic = 'Algebra' | 'Geometry' | 'Number Theory' | 'Combinatorics';

export interface Question {
  id: string;
  questionNumber: number;
  answer: 'A' | 'B' | 'C' | 'D' | 'E';
  topic: QuestionTopic;
  solution?: string; // Optional for now
}

