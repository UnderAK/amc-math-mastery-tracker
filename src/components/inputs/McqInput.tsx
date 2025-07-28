import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

interface McqInputProps {
  userAnswers: string;
  answerKey: string;
  onUserAnswersChange: (value: string) => void;
  onAnswerKeyChange: (value: string) => void;
}

export const McqInput = ({ userAnswers, answerKey, onUserAnswersChange, onAnswerKeyChange }: McqInputProps) => {
  const [localUserAnswers, setLocalUserAnswers] = useState<string[]>(Array(25).fill(''));
  const [localAnswerKey, setLocalAnswerKey] = useState<string[]>(Array(25).fill(''));

  useEffect(() => {
    setLocalUserAnswers(userAnswers.padEnd(25, ' ').split('').slice(0, 25));
  }, [userAnswers]);

  useEffect(() => {
    setLocalAnswerKey(answerKey.padEnd(25, ' ').split('').slice(0, 25));
  }, [answerKey]);

  const handleUserAnswerSelect = (qIndex: number, option: string) => {
    const newAnswers = [...localUserAnswers];
    newAnswers[qIndex] = option;
    onUserAnswersChange(newAnswers.join('').trimEnd());
  };

  const handleAnswerKeySelect = (qIndex: number, option: string) => {
    const newKey = [...localAnswerKey];
    newKey[qIndex] = option;
    onAnswerKeyChange(newKey.join('').trimEnd());
  };

  const renderGrid = (title: string, answers: string[], onSelect: (qIndex: number, option: string) => void) => (
    <div className="bg-muted/30 p-4 rounded-lg border">
      <h3 className="text-lg font-semibold mb-4 text-center">{title}</h3>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-5 gap-3">
        {Array.from({ length: 25 }, (_, i) => (
          <div key={i} className="p-2 rounded-md bg-background/60 border flex flex-col items-center space-y-2">
            <span className="font-bold text-sm text-muted-foreground">{i + 1}</span>
            <div className="flex justify-center gap-1 w-full">
              {['A', 'B', 'C', 'D', 'E'].map(option => (
                <Button
                  key={option}
                  size="sm"
                  variant={answers[i] === option ? 'default' : 'outline'}
                  onClick={() => onSelect(i, option)}
                  className="w-7 h-7 p-0 text-xs transition-all duration-150 ease-in-out transform hover:scale-110"
                >
                  {option}
                </Button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {renderGrid('Your Answers', localUserAnswers, handleUserAnswerSelect)}
      {renderGrid('Official Answer Key', localAnswerKey, handleAnswerKeySelect)}
    </div>
  );
};
