import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';

interface AnswerSheetProps {
  numQuestions: number;
  onAnswersChange: (answers: string[]) => void;
}

export const AnswerSheet: React.FC<AnswerSheetProps> = ({ numQuestions, onAnswersChange }) => {
  const [answers, setAnswers] = useState<string[]>(Array(numQuestions).fill(''));

  useEffect(() => {
    onAnswersChange(answers);
  }, [answers, onAnswersChange]);

  const handleAnswerChange = (index: number, value: string) => {
    const newAnswers = [...answers];
    newAnswers[index] = value.toUpperCase();
    setAnswers(newAnswers);
  };

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold text-primary mb-4">Your Answers</h3>
      <div className="grid grid-cols-5 gap-4">
        {Array.from({ length: numQuestions }, (_, i) => (
          <div key={i} className="flex items-center gap-2">
            <label htmlFor={`q-${i + 1}`} className="font-semibold text-muted-foreground">{i + 1}.</label>
            <Input
              id={`q-${i + 1}`}
              maxLength={1}
              value={answers[i]}
              onChange={(e) => handleAnswerChange(i, e.target.value)}
              className="text-center"
            />
          </div>
        ))}
      </div>
    </div>
  );
};
