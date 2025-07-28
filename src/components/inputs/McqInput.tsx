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
    <div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <div className="grid grid-cols-5 gap-4">
        {Array.from({ length: 25 }, (_, i) => (
          <div key={i} className="flex flex-col items-center">
            <span className="font-bold text-sm mb-1">{i + 1}</span>
            <div className="flex gap-1">
              {['A', 'B', 'C', 'D', 'E'].map(option => (
                <Button
                  key={option}
                  size="sm"
                  variant={answers[i] === option ? 'default' : 'outline'}
                  onClick={() => onSelect(i, option)}
                  className="w-8 h-8 p-0"
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
