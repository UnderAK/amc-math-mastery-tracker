import { Question } from './Question';

export type TestType = 'amc8' | 'amc10' | 'amc12';

export interface UserProfileData {
  username: string;
  name?: string;
  avatar: string;
  joinDate: string;
  xp: number;
}

export interface Test {
  id: string;
  name: string;
  year: number;
  competition: 'AMC 10A' | 'AMC 10B' | 'AMC 12A' | 'AMC 12B';
  questions: Question[];
}

export interface CompletedTest extends Test {
  score: number;
  date: string;
  testType: TestType;
}
