import { TestScore } from '@/types/TestScore';

export function getTotalQuestions(test: TestScore): number {
  // Default to AMC 8/10/12 (25 questions), but can be customized per testType
  if (test.testType === 'amc8') return 25;
  if (test.testType === 'amc10') return 25;
  if (test.testType === 'amc12') return 25;
  // fallback
  return 25;
}

export function getMaxPoints(test: TestScore): number {
  // AMC 8: 15 x 1 + 10 x 2 = 35, AMC 10/12: 25 x 6 = 150
  if (test.testType === 'amc8') return 120;
  if (test.testType === 'amc10' || test.testType === 'amc12') return 150;
  return 150;
}

export function getCorrectCount(test: TestScore): number {
  if (test.questionCorrectness) {
    return Object.values(test.questionCorrectness).filter(Boolean).length;
  }
  if (typeof test.incorrectQuestions === 'object' && Array.isArray(test.incorrectQuestions)) {
    return getTotalQuestions(test) - test.incorrectQuestions.length;
  }
  // fallback: estimate from points if possible
  if (typeof test.score === 'number') {
    if (test.testType === 'amc8') {
      // AMC 8: 10 x 1pt + 15 x 2pt, so max 120
      // Not precise, fallback to 0
      return 0;
    } else {
      // AMC 10/12: 6 points per correct
      return Math.round(test.score / 6);
    }
  }
  return 0;
}
