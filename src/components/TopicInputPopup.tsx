import { useState, useEffect } from "react";
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
  // Renamed from incorrectQuestions to questionsToTopic to reflect that we now get topics for all questions
  questionsToTopic: number[]; // Array of question numbers (1-25)
  // Added initialTopics to pre-populate with default or previously entered topics
  initialTopics: { [questionNum: number]: string };
  // Renamed from onSaveTopic to onSaveTopics to reflect saving topics for all questions at once
  onSaveTopics: (topics: { [questionNum: number]: string }) => void;
  topicOptions: string[];
}
export const TopicInputPopup: React.FC<TopicInputPopupProps> = ({
  isOpen,
  onClose,
  questionsToTopic, // Now an array of all 25 question numbers
  initialTopics,
  onSaveTopics,
  topicOptions,
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [topics, setTopics] = useState<{ [questionNum: number]: string }>({});

  // Initialize topics state when the popup opens or initialTopics change
  useEffect(() => {
    if (isOpen) {
      setTopics(initialTopics);
    } else {
        // Reset when closed
        setTopics({});
        setCurrentQuestionIndex(0);
    }
  }, [isOpen, initialTopics]);

  const totalQuestions = questionsToTopic.length; // Should be 25
  const currentQuestionNumber = questionsToTopic[currentQuestionIndex];

  const handleTopicChange = (topic: string) => {
    setTopics(prevTopics => ({
      ...prevTopics,
      [currentQuestionNumber]: topic.trim(),
    }));
  };

  const moveToNextQuestion = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // Last question, save all topics and close
      onSaveTopics(topics);
      onClose();
    }
  };

  const handleSaveAndNext = () => {
    // Ensure a topic is selected/entered for the current question before moving on
    const topicForCurrentQuestion = topics[currentQuestionNumber];
    if (!topicForCurrentQuestion || topicForCurrentQuestion.trim() === "") {
        // Optionally show a toast or highlight the field if a topic is required
        // For now, we'll default to 'Other' if empty on save, but prompting might be better UX.
        handleTopicChange("Other"); // Default to 'Other' if nothing was selected
    }
    moveToNextQuestion();
  };

  const handleSaveAllAndClose = () => {
      // Before saving all, ensure the current question has a topic
      const topicForCurrentQuestion = topics[currentQuestionNumber];
      if (!topicForCurrentQuestion || topicForCurrentQuestion.trim() === "") {
          handleTopicChange("Other"); // Default to 'Other' if nothing was selected
      }
       // Use a timeout to allow state to update before saving
       setTimeout(() => {
            onSaveTopics(topics);
            onClose();
       }, 0);
  };

  // If questionsToTopic is empty (shouldn't happen if called correctly from TestEntryForm), return null
  if (questionsToTopic.length === 0 && isOpen) {
      console.warn("TopicInputPopup opened with no questions.");
      return null;
  }

   // Determine the topic currently selected for the current question
   const currentSelectedTopic = topics[currentQuestionNumber] || "";

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>Enter Topic for Each Question</AlertDialogTitle>
          <AlertDialogDescription>
            Select the topic for question {currentQuestionNumber}.
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="space-y-4">
          <p className="text-sm font-medium">Question {currentQuestionIndex + 1} of {totalQuestions}</p>
          <Select value={currentSelectedTopic} onValueChange={handleTopicChange}>
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
          {currentQuestionIndex < totalQuestions - 1 ? (
             <Button onClick={handleSaveAndNext}>
               Save & Next
            </Button>
          ) : (
            <Button onClick={handleSaveAllAndClose}>
              Save All Topics & Finish
            </Button>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
