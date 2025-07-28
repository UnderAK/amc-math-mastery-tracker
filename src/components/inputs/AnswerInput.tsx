import { useState, useEffect } from 'react';
import { useDebounce } from '@/hooks/use-debounce';
import { TypingInput } from './TypingInput';
import { McqInput } from './McqInput';

export type InputMode = 'typing' | 'mcq';

interface AnswerInputProps {
  mode: InputMode;
  userAnswers: string;
  answerKey: string;
  onUserAnswersChange: React.Dispatch<React.SetStateAction<string>>;
  onAnswerKeyChange: React.Dispatch<React.SetStateAction<string>>;
}

export const AnswerInput = ({
  mode,
  userAnswers: initialUserAnswers,
  answerKey: initialAnswerKey,
  onUserAnswersChange,
  onAnswerKeyChange,
}: AnswerInputProps) => {
  const [userAnswers, setUserAnswers] = useState(initialUserAnswers);
  const [answerKey, setAnswerKey] = useState(initialAnswerKey);

  const debouncedUserAnswers = useDebounce(userAnswers, 300);
  const debouncedAnswerKey = useDebounce(answerKey, 300);

  useEffect(() => {
    onUserAnswersChange(debouncedUserAnswers);
  }, [debouncedUserAnswers, onUserAnswersChange]);

  useEffect(() => {
    onAnswerKeyChange(debouncedAnswerKey);
  }, [debouncedAnswerKey, onAnswerKeyChange]);

  useEffect(() => {
    setUserAnswers(initialUserAnswers);
  }, [initialUserAnswers]);

  useEffect(() => {
    setAnswerKey(initialAnswerKey);
  }, [initialAnswerKey]);

  const inputProps = {
    userAnswers,
    answerKey,
    onUserAnswersChange: setUserAnswers,
    onAnswerKeyChange: setAnswerKey,
  };

  if (mode === 'mcq') {
    return <McqInput {...inputProps} />;
  }
  return <TypingInput {...inputProps} />;
};
