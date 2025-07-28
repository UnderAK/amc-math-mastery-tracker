import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { NUM_QUESTIONS } from '@/config/test-config';
import { TestType } from '@/types/amc';
import { TestScore } from '@/types/TestScore';

interface UseTestGraderProps {
  debouncedUserAnswers: string;
  debouncedAnswerKey: string;
  testType: TestType;
  testYear: string;
  allQuestionTopics: { [key: number]: string };
  savedTests: TestScore[];
  setSavedTests: (tests: TestScore[]) => void;
  setNewAchievements: (achievements: any[]) => void;
  setShowAchievementPopup: (show: boolean) => void;
}

export function useTestGrader({ debouncedUserAnswers, debouncedAnswerKey, testType, testYear, allQuestionTopics, savedTests, setSavedTests, setNewAchievements, setShowAchievementPopup }: UseTestGraderProps) {
  const [isGrading, setIsGrading] = useState(false);
  const { toast } = useToast();

  const gradeTest = () => {
    return new Promise<string>((resolve) => {
      if (debouncedUserAnswers.length !== NUM_QUESTIONS || debouncedAnswerKey.length !== NUM_QUESTIONS) {
        const errorMsg = `❌ You must enter exactly ${NUM_QUESTIONS} characters in both fields.`;
        toast({
          title: 'Invalid Input',
          description: `User answers: ${debouncedUserAnswers.length}/${NUM_QUESTIONS}, Answer key: ${debouncedAnswerKey.length}/${NUM_QUESTIONS} characters`,
          variant: 'destructive',
        });
        resolve(errorMsg);
        return;
      }

      setIsGrading(true);
      setTimeout(() => {
        let score = 0;
        for (let i = 0; i < NUM_QUESTIONS; i++) {
          if (debouncedUserAnswers[i] === debouncedAnswerKey[i]) {
            score++;
          }
        }

        const newTestScore: TestScore = {
          id: Date.now().toString(),
          testType: testType,
          year: parseInt(testYear, 10),
          score,
          input: debouncedUserAnswers,
          key: debouncedAnswerKey,
          date: new Date().toISOString(),
          questionTopics: allQuestionTopics,
        };

        const updatedTests = [...savedTests, newTestScore];
        setSavedTests(updatedTests);
        localStorage.setItem('scores', JSON.stringify(updatedTests));

        const resultText = `🎉 Graded! Score: ${score}/${NUM_QUESTIONS}`;
        setIsGrading(false);
        window.dispatchEvent(new CustomEvent('dataUpdate'));
        resolve(resultText);
      }, 1000);
    });
  };

  return { isGrading, gradeTest };
}
