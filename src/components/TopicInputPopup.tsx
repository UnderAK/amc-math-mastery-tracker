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
  questionsToTopic: number[] | undefined; // Allow undefined
  initialTopics: { [questionNum: number]: string } | undefined; // Allow undefined
  onSaveTopics: (topics: { [questionNum: number]: string }) => void;
  topicOptions: string[];
  incorrectQuestions?: Array<{ questionNum: number; userAnswer: string; correctAnswer: string }>; // Add incorrectQuestions prop back

}

export const TopicInputPopup: React.FC<TopicInputPopupProps> = ({
  isOpen,
  onClose,
  questionsToTopic,
  initialTopics,
  onSaveTopics,
  topicOptions,
  incorrectQuestions // Receive incorrectQuestions
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  // Use initialTopics to set the initial state, handle undefined case
  const [topics, setTopics] = useState<{ [questionNum: number]: string }>(initialTopics || {});

  // Add a robust check at the very beginning
  if (!isOpen || !questionsToTopic || !Array.isArray(questionsToTopic) || questionsToTopic.length === 0) {
      return null;
  }

  // Reset state when the popup opens or initialTopics change
   useEffect(() => {
    if (isOpen && questionsToTopic && Array.isArray(questionsToTopic) && questionsToTopic.length > 0) {
       // Initialize topics state with initialTopics when popup opens and questions are available
      setTopics(initialTopics || {});
      setCurrentQuestionIndex(0);
    } else if (!isOpen) {
      // Reset when closed
      setTopics({});
      setCurrentQuestionIndex(0);
    }
  }, [isOpen, questionsToTopic, initialTopics]);



  const totalQuestions = questionsToTopic.length;
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
    handleTopicChange("Other"); // Default skipped to 'Other'
    moveToNextQuestion();
  };

  const handleSkipAll = () => {
    const updatedTopics = { ...topics };
    // Set all remaining incorrect questions to 'Other'
    if (incorrectQuestions && Array.isArray(incorrectQuestions)) {
        for (let i = currentQuestionIndex; i < totalQuestions; i++) {
          const qNum = questionsToTopic[i];
           // Find the corresponding incorrect question data
           const incorrectQData = incorrectQuestions.find(q => q.questionNum === qNum);
           if(incorrectQData) {
              updatedTopics[qNum] = "Other";
           }
        }
         setTopics(updatedTopics);

          // Use a timeout to allow state to update before saving and closing
        setTimeout(() => {
            onSaveTopics(updatedTopics);
            onClose();
        }, 0);
    } else {
        // If incorrectQuestions is not available, just close
         onClose();
    }

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

  // Determine the topic currently selected for the current question
  const currentSelectedTopic = topics[currentQuestionNumber] || "";

  // Find the incorrect question data for the current question to display details
  const currentIncorrectQuestionData = incorrectQuestions?.find(q => q.questionNum === currentQuestionNumber);


  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>Enter Topic for Incorrect Questions</AlertDialogTitle>
          <AlertDialogDescription>
            Review your incorrect answers and select the topic for each question.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4">
          <p className="text-sm font-medium">
            Question {currentQuestionIndex + 1} of {totalQuestions}
            {currentIncorrectQuestionData && (
                <span> - Your Answer: {currentIncorrectQuestionData.userAnswer || 'Unanswered'}, Correct Answer: {currentIncorrectQuestionData.correctAnswer}</span>
            )}
          </p>
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
