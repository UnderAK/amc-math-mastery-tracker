import { TypingInput } from './TypingInput';
import { McqInput } from './McqInput';

export type InputMode = 'typing' | 'mcq';

interface AnswerInputProps {
  mode: InputMode;
  userAnswers: string;
  answerKey: string;
  onUserAnswersChange: (value: string) => void;
  onAnswerKeyChange: (value: string) => void;
}

export const AnswerInput = (props: AnswerInputProps) => {
  if (props.mode === 'mcq') {
    return <McqInput {...props} />;
  }
  return <TypingInput {...props} />;
};
