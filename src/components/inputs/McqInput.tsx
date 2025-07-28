import React, { useMemo } from 'react';
import { Button } from '@/components/ui/button';

interface McqInputProps {
  userAnswers: string;
  answerKey: string;
  onUserAnswersChange: (value: string) => void;
  onAnswerKeyChange: (value: string) => void;
}

const QuestionRow = React.memo(({ qNum, selected, onSelect }: { qNum: number, selected: string, onSelect: (option: string) => void }) => {
  return (
    <div className="p-2 rounded-md bg-background/60 border flex flex-col items-center space-y-2">
      <span className="font-bold text-sm text-muted-foreground">{qNum}</span>
      <div className="flex justify-center gap-1 w-full">
        {['A', 'B', 'C', 'D', 'E'].map(option => (
          <Button
            key={option}
            size="sm"
            variant={selected === option ? 'default' : 'outline'}
            onClick={() => onSelect(option)}
            className="w-7 h-7 p-0 text-xs transition-all duration-150 ease-in-out transform hover:scale-110"
          >
            {option}
          </Button>
        ))}
      </div>
    </div>
  );
});

const AnswerGrid = ({ title, answers, onAnswerChange }: { title: string, answers: string[], onAnswerChange: (index: number, value: string) => void }) => (
  <div className="bg-muted/30 p-4 rounded-lg border">
    <h3 className="text-lg font-semibold mb-4 text-center">{title}</h3>
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {answers.map((answer, i) => (
        <QuestionRow
          key={i}
          qNum={i + 1}
          selected={answer}
          onSelect={(option) => onAnswerChange(i, option)}
        />
      ))}
    </div>
  </div>
);

export const McqInput = ({ userAnswers, answerKey, onUserAnswersChange, onAnswerKeyChange }: McqInputProps) => {
  const userAnswersArray = useMemo(() => userAnswers.padEnd(25, ' ').split('').slice(0, 25), [userAnswers]);
  const answerKeyArray = useMemo(() => answerKey.padEnd(25, ' ').split('').slice(0, 25), [answerKey]);

  const handleUserAnswerChange = (index: number, value: string) => {
    const newAnswers = [...userAnswersArray];
    newAnswers[index] = value;
    onUserAnswersChange(newAnswers.join('').trimEnd());
  };

  const handleAnswerKeyChange = (index: number, value: string) => {
    const newKey = [...answerKeyArray];
    newKey[index] = value;
    onAnswerKeyChange(newKey.join('').trimEnd());
  };

  return (
    <div className="space-y-8">
      <AnswerGrid title="Your Answers" answers={userAnswersArray} onAnswerChange={handleUserAnswerChange} />
      <AnswerGrid title="Official Answer Key" answers={answerKeyArray} onAnswerChange={handleAnswerKeyChange} />
    </div>
  );
};
