import React, { useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface McqInputProps {
  userAnswers: string;
  answerKey: string;
  onUserAnswersChange: React.Dispatch<React.SetStateAction<string>>;
  onAnswerKeyChange: React.Dispatch<React.SetStateAction<string>>;
}

const AnswerButton = React.memo(({ option, isSelected, onSelect }: { option: string; isSelected: boolean; onSelect: (option: string) => void; }) => {
  return (
    <Button
      size="sm"
      variant="outline"
      onClick={() => onSelect(option)}
      className={cn(
        'w-7 h-7 p-0 text-xs transition-all duration-150 ease-in-out transform hover:scale-110',
        isSelected && 'bg-primary text-primary-foreground hover:bg-primary/90'
      )}
    >
      {option}
    </Button>
  );
});

const QuestionRow = React.memo(({ qNum, selectedAnswer, onSelect }: { qNum: number; selectedAnswer: string; onSelect: (qNum: number, option: string) => void; }) => {
  const handleSelect = useCallback((option: string) => {
    onSelect(qNum, option);
  }, [onSelect, qNum]);

  return (
    <div className="p-2 rounded-md bg-background/60 border flex flex-col items-center space-y-2">
      <span className="font-bold text-sm text-muted-foreground">{qNum}</span>
      <div className="flex justify-center gap-1 w-full">
        {['A', 'B', 'C', 'D', 'E'].map(option => (
          <AnswerButton
            key={option}
            option={option}
            isSelected={selectedAnswer === option}
            onSelect={handleSelect}
          />
        ))}
      </div>
    </div>
  );
});

const AnswerGrid = React.memo(({ title, answers, onAnswerChange }: { title: string; answers: string[]; onAnswerChange: (index: number, value: string) => void; }) => {
  const handleAnswerChange = useCallback((qNum: number, option: string) => {
    onAnswerChange(qNum - 1, option);
  }, [onAnswerChange]);

  return (
    <div className="bg-muted/30 p-4 rounded-lg border">
      <h3 className="text-lg font-semibold mb-4 text-center">{title}</h3>
      <div role="grid" className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {answers.map((answer, i) => (
          <QuestionRow
            key={i}
            qNum={i + 1}
            selectedAnswer={answer}
            onSelect={handleAnswerChange}
          />
        ))}
      </div>
    </div>
  );
});

export const McqInput = ({ userAnswers, answerKey, onUserAnswersChange, onAnswerKeyChange }: McqInputProps) => {
  const userAnswersArray = useMemo(() => userAnswers.padEnd(25, ' ').split('').slice(0, 25), [userAnswers]);
  const answerKeyArray = useMemo(() => answerKey.padEnd(25, ' ').split('').slice(0, 25), [answerKey]);

  const handleUserAnswerChange = useCallback((index: number, value: string) => {
    onUserAnswersChange(prevAnswers => {
      const newAnswers = prevAnswers.padEnd(25, ' ').split('').slice(0, 25);
      newAnswers[index] = value;
      return newAnswers.join('').trimEnd();
    });
  }, [onUserAnswersChange]);

  const handleAnswerKeyChange = useCallback((index: number, value: string) => {
    onAnswerKeyChange(prevKey => {
      const newKey = prevKey.padEnd(25, ' ').split('').slice(0, 25);
      newKey[index] = value;
      return newKey.join('').trimEnd();
    });
  }, [onAnswerKeyChange]);

  return (
    <div className="space-y-8">
      <AnswerGrid title="Your Answers" answers={userAnswersArray} onAnswerChange={handleUserAnswerChange} />
      <AnswerGrid title="Official Answer Key" answers={answerKeyArray} onAnswerChange={handleAnswerKeyChange} />
    </div>
  );
};
