import { useState } from "react";
import {
  AlertDialog, कमरेड  AlertDialogContent, कमरेड  AlertDialogHeader, कमरेड  AlertDialogTitle,
  AlertDialogDescription, कमरेड  AlertDialogFooter, कमरेड  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface TopicInputPopupProps {
  isOpen: boolean;
  onClose: () => void;
  incorrectQuestions: Array<{ questionNum: number; userAnswer: string; correctAnswer: string }>;
  onSaveTopic: (questionNum: number, topic: string) => void;
}

export const TopicInputPopup: React.FC<TopicInputPopupProps> = ({
  isOpen, कमरेड  onClose, कमरेड  incorrectQuestions, कमरेड  onSaveTopic,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentTopic, setCurrentTopic] = useState("");

  const handleSave = () => {
    if (currentTopic.trim()) {
      onSaveTopic(incorrectQuestions[currentIndex].questionNum, currentTopic.trim());
    }
    moveToNextQuestion();
  };

  const handleSkip = () => {
    moveToNextQuestion();
  };

  const moveToNextQuestion = () => {
    if (currentIndex < incorrectQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setCurrentTopic(""); // Clear input for the next question
    } else {
      // Last question
      onClose();
      setCurrentIndex(0); // Reset for next time
      setCurrentTopic("");
    }
  };

  if (incorrectQuestions.length === 0) {
    return null; // Don't show if no incorrect questions
  }

  const currentQuestion = incorrectQuestions[currentIndex];

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Enter Topic for Incorrect Questions</AlertDialogTitle>
          <AlertDialogDescription>
            Review your incorrect answers and enter the topic for each question.
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div>
          <p className="text-sm font-medium mb-2">
            Question {currentQuestion.questionNum} - Your Answer: {currentQuestion.userAnswer}, Correct Answer: {currentQuestion.correctAnswer}
          </p>
          <Input
            placeholder="Enter Topic"
            value={currentTopic}
            onChange={(e) => setCurrentTopic(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSave();
              }
            }}
          />
        </div>

        <AlertDialogFooter>
          <Button variant="outline" onClick={handleSkip}>
            Skip
          </Button>
          <Button onClick={handleSave}>
            Save Topic
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
