import { useState } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TopicInputPopupProps {
  isOpen: boolean;
  onClose: () => void;
  incorrectQuestions: Array<{ questionNum: number; userAnswer: string; correctAnswer: string }>;
  onSaveTopic: (questionNum: number, topic: string) => void;
  topicOptions: string[];
}

export const TopicInputPopup: React.FC<TopicInputPopupProps> = ({
  isOpen,
  onClose,
  incorrectQuestions,
  onSaveTopic,
  topicOptions,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedTopic, setSelectedTopic] = useState("");

  const totalQuestions = incorrectQuestions.length;
  const currentQuestionNumber = incorrectQuestions[currentIndex]?.questionNum;

  const handleSave = () => {
    const topicToSave = selectedTopic || "Other"; // Default to 'Other' if no topic is selected
    onSaveTopic(incorrectQuestions[currentIndex].questionNum, topicToSave);
    moveToNextQuestion();
  };

  const handleSkip = () => {
     // If skipped, treat as 'Other'
    onSaveTopic(incorrectQuestions[currentIndex].questionNum, "Other");
    moveToNextQuestion();
  };

  const moveToNextQuestion = () => {
    if (currentIndex < incorrectQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedTopic(""); // Clear selection for the next question
    } else {
      // Last question
      onClose();
      setCurrentIndex(0); // Reset for next time
      setSelectedTopic("");
    }
  };

  if (incorrectQuestions.length === 0) {
    return null;
  }

  const currentQuestion = incorrectQuestions[currentIndex];

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Enter Topic for Incorrect Questions</AlertDialogTitle>
          <AlertDialogDescription>
            Review your incorrect answers and select the topic for each question.
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="space-y-4">
          <p className="text-sm font-medium">
            Question {currentQuestionNumber} of {totalQuestions} - Your Answer: {currentQuestion.userAnswer}, Correct Answer: {currentQuestion.correctAnswer}
          </p>
          <Select value={selectedTopic} onValueChange={setSelectedTopic}>
            <SelectTrigger>
              <SelectValue placeholder="Select Topic" />
            </SelectTrigger>
            <SelectContent>
              {topicOptions.map(topic => (
                <SelectItem key={topic} value={topic}>{topic}</SelectItem>
              ))}
            </SelectContent>
          </Select>
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
