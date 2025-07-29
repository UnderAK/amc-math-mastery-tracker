import { TestType } from '@/types/amc';

export function getTotalQuestions(testType: TestType): number {
  // Default to AMC 8/10/12 (25 questions), but can be customized per testType
  if (testType === 'amc8') return 25;
  if (testType === 'amc10') return 25;
  if (testType === 'amc12') return 25;
  // fallback
  return 25;
}

export function getMaxPoints(testType: TestType): number {
  // AMC 8: 15 x 1 + 10 x 2 = 35, AMC 10/12: 25 x 6 = 150
  if (testType === 'amc8') return 25; // 1 point per question
  if (testType === 'amc10' || testType === 'amc12') return 150; // 6 points per correct
  return 150;
}

export function calculateScore(userAnswers: (string | null)[], correctAnswers: string[], testType: TestType): number {
  let score = 0;
  const totalQuestions = correctAnswers.length;

  for (let i = 0; i < totalQuestions; i++) {
    const userAnswer = userAnswers[i];
    const correctAnswer = correctAnswers[i];

    if (userAnswer === null || userAnswer === '' || userAnswer === undefined) {
      if (testType === 'amc10' || testType === 'amc12') {
        score += 1.5; // Blank answers are worth 1.5 points
      }
    } else if (userAnswer === correctAnswer) {
      if (testType === 'amc10' || testType === 'amc12') {
        score += 6; // Correct answers are 6 points
      } else if (testType === 'amc8') {
        score += 1; // Correct answers are 1 point
      }
    }
    // Incorrect answers are 0 points, so no change to score
  }
  return score;
}

export function getCorrectCount(userAnswers: (string | null)[], correctAnswers: string[]): number {
  return userAnswers.reduce((count, answer, i) => {
    return answer === correctAnswers[i] ? count + 1 : count;
  }, 0);
}
