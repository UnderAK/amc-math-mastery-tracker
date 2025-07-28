import React, { useState, useEffect, useCallback } from 'react';
import { useDebounce } from '@/hooks/use-debounce';
import { Button } from '@/components/ui/button';

interface McqInputProps {
  userAnswers: string;
  answerKey: string;
  onUserAnswersChange: (value: string) => void;
  onAnswerKeyChange: (value: string) => void;
}

const QuestionRow = React.memo(({ qNum, selected, onSelect }: { qNum: number, selected: string, onSelect: (index: number, option: string) => void }) => {
  return (
    <div className="p-2 rounded-md bg-background/60 border flex flex-col items-center space-y-2">
      <span className="font-bold text-sm text-muted-foreground">{qNum}</span>
      <div className="flex justify-center gap-1 w-full">
        {['A', 'B', 'C', 'D', 'E'].map(option => (
          <Button
            key={option}
            size="sm"
            variant={selected === option ? 'default' : 'outline'}
            onClick={() => onSelect(qNum - 1, option)}
            className="w-7 h-7 p-0 text-xs transition-all duration-150 ease-in-out transform hover:scale-110"
          >
            {option}
          </Button>
        ))}
      </div>
    </div>
  );
});

const AnswerGrid = React.memo(({ title, answers, onAnswerChange }: { title: string, answers: string[], onAnswerChange: (index: number, value: string) => void }) => {
  return (
    <div className="bg-muted/30 p-4 rounded-lg border">
      <h3 className="text-lg font-semibold mb-4 text-center">{title}</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {answers.map((answer, i) => (
          <QuestionRow
            key={i}
            qNum={i + 1}
            selected={answer}
            onSelect={onAnswerChange}
          />
        ))}
      </div>
    </div>
  );
});

export const McqInput = ({ userAnswers, answerKey, onUserAnswersChange, onAnswerKeyChange }: McqInputProps) => {
  const [localUserAnswers, setLocalUserAnswers] = useState(() => userAnswers.padEnd(25, ' ').split('').slice(0, 25));
  const [localAnswerKey, setLocalAnswerKey] = useState(() => answerKey.padEnd(25, ' ').split('').slice(0, 25));

  useEffect(() => {
    setLocalUserAnswers(userAnswers.padEnd(25, ' ').split('').slice(0, 25));
  }, [userAnswers]);

  useEffect(() => {
    setLocalAnswerKey(answerKey.padEnd(25, ' ').split('').slice(0, 25));
  }, [answerKey]);

      const debouncedUserAnswers = useDebounce(localUserAnswers.join(''), 200);
  const debouncedAnswerKey = useDebounce(localAnswerKey.join(''), 200);

  useEffect(() => {
    onUserAnswersChange(debouncedUserAnswers.trimEnd());
  }, [debouncedUserAnswers, onUserAnswersChange]);

  useEffect(() => {
    onAnswerKeyChange(debouncedAnswerKey.trimEnd());
  }, [debouncedAnswerKey, onAnswerKeyChange]);

  const handleUserAnswerChange = useCallback((index: number, value: string) => {
    setLocalUserAnswers(prevAnswers => {
      const newAnswers = [...prevAnswers];
      newAnswers[index] = value;
      return newAnswers;
    });
  }, []);

  const handleAnswerKeyChange = useCallback((index: number, value: string) => {
    setLocalAnswerKey(prevKey => {
      const newKey = [...prevKey];
      newKey[index] = value;
      return newKey;
    });
  }, []);

  return (
    <div className="space-y-8">
      <AnswerGrid title="Your Answers" answers={localUserAnswers} onAnswerChange={handleUserAnswerChange} />
      <AnswerGrid title="Official Answer Key" answers={localAnswerKey} onAnswerChange={handleAnswerKeyChange} />
    </div>
  );
};
