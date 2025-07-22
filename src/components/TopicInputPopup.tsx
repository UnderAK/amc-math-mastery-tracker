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
  questionsToTopic: number[]; // Array of question numbers (1-25)
  initialTopics: { [questionNum: number]: string };
  onSaveTopics: (topics: { [questionNum: number]: string }) => void;
  topicOptions: string[];
}

export const TopicInputPopup: React.FC<TopicInputPopupProps> = ({
  isOpen,
  onClose,
  questionsToTopic,
  initialTopics,
  onSaveTopics,
  topicOptions,
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [topics, setTopics] = useState<{ [questionNum: number]: string }>({});

  // Initialize topics state when the popup opens or initialTopics change
  useEffect(() => {
  if (isOpen) {
    const defaultedTopics: { [questionNum: number]: string } = {};

    for (const q of questionsToTopic) {
      defaultedTopics[q] = "Other";
    }

    setTopics(defaultedTopics);
  } else {
    setTopics({});
    setCurrentQuestionIndex(0);
  }
}, [isOpen, questionsToTopic]);



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
      handleTopicChange("Other"); // Default to 'Other' if nothing was selected
    }
    moveToNextQuestion();
  };

  const handleSkip = () => {
    handleTopicChange("Other"); // Mark as skipped
    moveToNextQuestion();
  };

  const handleSkipAll = () => {
    const updatedTopics = { ...topics };
    // Set all remaining questions to 'Skipped/Other'
    for (let i = currentQuestionIndex; i < totalQuestions; i++) {
      updatedTopics[questionsToTopic[i]] = "Other";
    }
    setTopics(updatedTopics);
    // Use a timeout to allow state to update before saving and closing
    setTimeout(() => {
        onSaveTopics(updatedTopics);
        onClose();
    }, 0);
  };

  const handleSaveAllAndClose = () => {
    // Ensure the current question has a topic before saving all
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
  const currentSelectedTopic = topics[currentQuestionNumber] || "Other";

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
          <Button variant="outline" onClick={handleSkip}>Skip</Button>
          <Button variant="outline" onClick={handleSkipAll}>Skip All</Button>
          {currentQuestionIndex < totalQuestions - 1 ? (
            <Button onClick={handleSaveAndNext}>Save & Next</Button>
          ) : (
            <Button onClick={handleSaveAllAndClose}>Save All Topics & Finish</Button>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
