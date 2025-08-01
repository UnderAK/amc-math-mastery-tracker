import { Textarea } from "@/components/ui/textarea";

interface TypingInputProps {
  userAnswers: string;
  answerKey: string;
  onUserAnswersChange: (value: string) => void;
  onAnswerKeyChange: (value: string) => void;
}

export const TypingInput = ({ userAnswers, answerKey, onUserAnswersChange, onAnswerKeyChange }: TypingInputProps) => {
  const sanitizeInput = (value: string) => {
    return value.toUpperCase().replace(/[^A-E\s]/g, '').slice(0, 25);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium mb-2 block">Your Answers</label>
        <Textarea
          value={userAnswers}
          onChange={(e) => onUserAnswersChange(sanitizeInput(e.target.value))}
          placeholder="Enter Your Answers (25 letters A–E only)"
          className="font-mono"
          rows={2}
        />
        <div className="text-xs text-muted-foreground mt-1">
          {userAnswers.length}/25 characters
        </div>
      </div>
      <div>
        <label className="text-sm font-medium mb-2 block">Official Answer Key</label>
        <Textarea
          value={answerKey}
          onChange={(e) => onAnswerKeyChange(sanitizeInput(e.target.value))}
          placeholder="Enter Official Answer Key (25 letters A–E only)"
          className="font-mono"
          rows={2}
        />
        <div className="text-xs text-muted-foreground mt-1">
          {answerKey.length}/25 characters
        </div>
      </div>
    </div>
  );
};
