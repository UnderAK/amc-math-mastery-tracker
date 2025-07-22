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
    console.log(`DEBUG: handleTopicChange - Question ${currentQuestionNumber}, Topic: ${topic}`);
    setTopics(prevTopics => {
      const newTopics = {
        ...prevTopics,
        [currentQuestionNumber]: topic.trim(),
      };
      console.log('DEBUG: handleTopicChange - Updated topics state:', newTopics);
      return newTopics;
    });
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
    console.log('DEBUG: handleSaveAndNext - Current question:', currentQuestionNumber);
    console.log('DEBUG: handleSaveAndNext - Current topic:', topics[currentQuestionNumber]);
    
    // Ensure a topic is selected/entered for the current question before moving on
    const topicForCurrentQuestion = topics[currentQuestionNumber];
    if (topicForCurrentQuestion === undefined || topicForCurrentQuestion === null || topicForCurrentQuestion === '') {
      console.log('DEBUG: handleSaveAndNext - No topic selected, setting to Other');
      // Update topics state directly and then move to next question
      const updatedTopics = { ...topics };
      updatedTopics[currentQuestionNumber] = "Other";
      setTopics(updatedTopics);
      console.log('DEBUG: handleSaveAndNext - Updated topics:', updatedTopics);
    }
    
    // Use setTimeout to ensure state update completes before moving to next question
    setTimeout(() => {
      moveToNextQuestion();
    }, 0);
  };

  const handleSkip = () => {
    handleTopicChange("Other"); // Mark as Other when skipped
    moveToNextQuestion();
  };

  const handleSkipAll = () => {
    const updatedTopics = { ...topics };
    
    // Ensure the current question has a topic if user was on it
    const topicForCurrentQuestion = topics[currentQuestionNumber];
    if (topicForCurrentQuestion === undefined || topicForCurrentQuestion === null) {
      updatedTopics[currentQuestionNumber] = "Other";
    }
    
    // Set all remaining questions (after current) to 'Other', preserving any existing selections
    for (let i = currentQuestionIndex + 1; i < totalQuestions; i++) {
      const questionNum = questionsToTopic[i];
      // Only set to "Other" if no topic has been selected yet (truly missing)
      if (updatedTopics[questionNum] === undefined || updatedTopics[questionNum] === null) {
        updatedTopics[questionNum] = "Other";
      }
    }
    
    setTopics(updatedTopics);
    // Use a timeout to allow state to update before saving and closing
    setTimeout(() => {
        onSaveTopics(updatedTopics);
        onClose();
    }, 0);
  };

  const handleSaveAllAndClose = () => {
    const updatedTopics = { ...topics };
    
    console.log('DEBUG: handleSaveAllAndClose - Current topics state:', topics);
    console.log('DEBUG: handleSaveAllAndClose - Current question number:', currentQuestionNumber);
    
    // Ensure the current question has a topic before saving all
    const topicForCurrentQuestion = topics[currentQuestionNumber];
    if (topicForCurrentQuestion === undefined || topicForCurrentQuestion === null) {
      updatedTopics[currentQuestionNumber] = "Other"; // Default to 'Other' if nothing was selected
      console.log('DEBUG: Set current question to Other');
    } else {
      console.log('DEBUG: Current question already has topic:', topicForCurrentQuestion);
    }
    
    // Ensure ALL questions have topics (fill any missing ones with "Other")
    // Only set to "Other" if the topic is truly missing (undefined or null)
    for (let i = 0; i < totalQuestions; i++) {
      const questionNum = questionsToTopic[i];
      if (updatedTopics[questionNum] === undefined || updatedTopics[questionNum] === null) {
        updatedTopics[questionNum] = "Other";
        console.log(`DEBUG: Set question ${questionNum} to Other (was undefined/null)`);
      } else {
        console.log(`DEBUG: Question ${questionNum} already has topic:`, updatedTopics[questionNum]);
      }
    }
    
    console.log('DEBUG: Final updatedTopics before saving:', updatedTopics);
    
    // Update state and save
    setTopics(updatedTopics);
    // Use a timeout to allow state to update before saving
    setTimeout(() => {
        console.log('DEBUG: About to call onSaveTopics with:', updatedTopics);
        onSaveTopics(updatedTopics);
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
