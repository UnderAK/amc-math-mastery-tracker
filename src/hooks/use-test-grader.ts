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
        const questionCorrectness: { [key: number]: boolean } = {};
        for (let i = 0; i < NUM_QUESTIONS; i++) {
          const isCorrect = debouncedUserAnswers[i].toLowerCase() === debouncedAnswerKey[i].toLowerCase();
          questionCorrectness[i + 1] = isCorrect;
          if (isCorrect) {
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
          questionCorrectness,
        };

        const updatedTests = [...savedTests, newTestScore];
        setSavedTests(updatedTests);
        localStorage.setItem('scores', JSON.stringify(updatedTests));

        // Award coins
        const coinsEarned = score * 10;
        const currentCoins = parseInt(localStorage.getItem('coins') || '0', 10);
        const newTotalCoins = currentCoins + coinsEarned;
        localStorage.setItem('coins', newTotalCoins.toString());

        // Add to coin transactions
        const transactions = JSON.parse(localStorage.getItem('coinTransactions') || '[]');
        transactions.push({ 
          id: `test-${newTestScore.id}`,
          description: `Earned from ${testType.toUpperCase()} ${testYear}`,
          amount: coinsEarned,
          date: new Date().toISOString(),
        });
        localStorage.setItem('coinTransactions', JSON.stringify(transactions));

        toast({
          title: 'Coins Earned! 💰',
          description: `You earned ${coinsEarned} coins for your performance.`,
        });

        // Award XP
        const xpEarned = score * 100;
        const currentXp = parseInt(localStorage.getItem('xp') || '0', 10);
        const newTotalXp = currentXp + xpEarned;
        localStorage.setItem('xp', newTotalXp.toString());

        toast({
          title: 'XP Gained! ✨',
          description: `You gained ${xpEarned} XP.`,
        });

        const resultText = `🎉 Graded! Score: ${score}/${NUM_QUESTIONS}`;
        setIsGrading(false);
        window.dispatchEvent(new CustomEvent('dataUpdate'));
        resolve(resultText);
      }, 1000);
    });
  };

  return { isGrading, gradeTest };
}
