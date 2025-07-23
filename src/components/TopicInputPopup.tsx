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
      console.log('DEBUG TopicInputPopup: Popup opened, initialTopics:', initialTopics);
      setTopics(initialTopics);
      setCurrentQuestionIndex(0); // Always start from question 1
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
      console.log('DEBUG: handleTopicChange - Current question topic set to:', newTopics[currentQuestionNumber]);
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
    moveToNextQuestion();
  };

  const handleSkip = () => {
    handleTopicChange("Other"); // Mark as Other when skipped
    moveToNextQuestion();
  };

  const handleSkipAll = () => {
    // All questions already have a default topic, so just save the current state and close.
    onSaveTopics(topics);
    onClose();
  };

  const handleSaveAllAndClose = () => {
    try {
      const updatedTopics = { ...topics };
      
      console.log('DEBUG: handleSaveAllAndClose - Current topics state:', topics);
      console.log('DEBUG: handleSaveAllAndClose - Current question number:', currentQuestionNumber);
      
      // Validate that we have the expected number of questions
      if (totalQuestions !== 25) {
        console.error('ERROR: Expected 25 questions, got:', totalQuestions);
        return;
      }
      
      // Ensure the current question has a topic before saving all
      const topicForCurrentQuestion = topics[currentQuestionNumber];
      if (!topicForCurrentQuestion || topicForCurrentQuestion.trim() === '') {
        updatedTopics[currentQuestionNumber] = "Other"; // Default to 'Other' if nothing was selected
        console.log('DEBUG: Set current question to Other');
      } else {
        console.log('DEBUG: Current question already has topic:', topicForCurrentQuestion);
      }
      
      // Ensure ALL questions have topics (fill any missing ones with "Other")
      for (let i = 0; i < totalQuestions; i++) {
        const questionNum = questionsToTopic[i];
        if (!updatedTopics[questionNum] || updatedTopics[questionNum].trim() === '') {
          updatedTopics[questionNum] = "Other";
          console.log(`DEBUG: Set question ${questionNum} to Other (was missing/empty)`);
        } else {
          console.log(`DEBUG: Question ${questionNum} already has topic:`, updatedTopics[questionNum]);
        }
      }
      
      // Final validation - ensure we have exactly 25 topics
      const topicKeys = Object.keys(updatedTopics).map(k => parseInt(k)).sort((a, b) => a - b);
      if (topicKeys.length !== 25 || topicKeys[0] !== 1 || topicKeys[24] !== 25) {
        console.error('ERROR: Invalid topic structure. Expected questions 1-25, got:', topicKeys);
        return;
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
    } catch (error) {
      console.error('ERROR in handleSaveAllAndClose:', error);
    }
  };

  // If questionsToTopic is empty (shouldn't happen if called correctly from TestEntryForm), return null
  if (questionsToTopic.length === 0 && isOpen) {
      console.warn("TopicInputPopup opened with no questions.");
      return null;
  }

  // Determine the topic currently selected for the current question
  const currentSelectedTopic = topics[currentQuestionNumber] || "";
  console.log('DEBUG TopicInputPopup: Current question:', currentQuestionNumber, 'Selected topic:', currentSelectedTopic);
  console.log('DEBUG TopicInputPopup: All topics state:', topics);

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="w-full max-w-xl mx-auto p-6">
        {/* Increased max width and padding for better fit */}
        <AlertDialogHeader className="text-center">
          <AlertDialogTitle className="text-xl text-center break-words">📝 Assign Topic - Question {currentQuestionNumber}</AlertDialogTitle>
          <AlertDialogDescription className="text-center break-words">
            <span className="block">Please assign a topic to this question to complete grading.</span>
            <span className="text-sm text-muted-foreground block mt-1">
              ({currentQuestionIndex + 1} of {totalQuestions} questions)
            </span>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Select value={currentSelectedTopic} onValueChange={handleTopicChange}>
              <SelectTrigger className="w-full min-w-[220px] max-w-full text-sm">
                <SelectValue placeholder="Select Topic" />
              </SelectTrigger>
              <SelectContent className="max-w-xl w-full">
                {topicOptions.map(topic => (
                  <SelectItem key={topic} value={topic} className="break-words whitespace-normal text-sm px-2 py-1">
                    {topic}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {currentSelectedTopic && (
              <div className="text-xs text-center text-muted-foreground">
                Selected: {currentSelectedTopic}
              </div>
            )}
          </div>
        </div>

        <AlertDialogFooter className="flex justify-center gap-2">
          <Button variant="outline" onClick={handleSkip} size="sm">
            Skip (Other)
          </Button>
          {currentQuestionIndex < totalQuestions - 1 ? (
            <Button onClick={handleSaveAndNext} size="sm">
              Next Question →
            </Button>
          ) : (
            <Button onClick={handleSaveAllAndClose} className="bg-green-600 hover:bg-green-700" size="sm">
              Complete ✅
            </Button>
          )}
          <Button variant="outline" onClick={handleSkipAll} size="sm">
            Skip All & Finish
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
