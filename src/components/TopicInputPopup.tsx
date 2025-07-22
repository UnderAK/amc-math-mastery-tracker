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
      // Fill any missing topics with "Other"
      const filledTopics: { [questionNum: number]: string } = {};
      questionsToTopic.forEach(q => {
        filledTopics[q] = topics[q] || "Other";
      });
      onSaveTopics(filledTopics);

      onClose();
    }
  };

  const handleSaveAndNext = () => {
    console.log('DEBUG: handleSaveAndNext - Current question:', currentQuestionNumber);
    console.log('DEBUG: handleSaveAndNext - Current topic:', topics[currentQuestionNumber]);
    
    // Create updated topics - ensure current question has a topic
    const updatedTopics = { ...topics };
    const currentTopic = topics[currentQuestionNumber];
    
    // If no topic selected for current question, set to "Other"
    if (!currentTopic || currentTopic === '' || currentTopic === undefined || currentTopic === null) {
      console.log('DEBUG: handleSaveAndNext - Setting current question to Other');
      updatedTopics[currentQuestionNumber] = "Other";
    }
    
    console.log('DEBUG: handleSaveAndNext - Updated topics:', updatedTopics);
    
    // Update state immediately and synchronously
    setTopics(updatedTopics);
    
    // Move to next question after a brief delay to ensure state update
    setTimeout(() => {
      console.log('DEBUG: handleSaveAndNext - Moving to next question');
      moveToNextQuestion();
    }, 50); // Longer timeout for reliability
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
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>📝 Complete Test Grading - Assign Topics</AlertDialogTitle>
          <AlertDialogDescription>
            To finish grading your test, please assign a topic to each question. This helps track your progress by subject area.
            <br /><br />
            Currently reviewing: <strong>Question {currentQuestionNumber}</strong>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Question {currentQuestionIndex + 1} of {totalQuestions}</p>
            <div className="text-xs text-muted-foreground">
              Progress: {Math.round(((currentQuestionIndex) / totalQuestions) * 100)}%
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${((currentQuestionIndex) / totalQuestions) * 100}%` }}
            ></div>
          </div>
          <div className="space-y-2">
            <div className="text-xs text-muted-foreground">
              Current selection: {currentSelectedTopic || "None"}
            </div>
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
        </div>

        <AlertDialogFooter>
          <Button variant="outline" onClick={handleSkip}>Skip (Use "Other")</Button>
          <Button variant="outline" onClick={handleSkipAll}>Skip All Remaining & Complete Grading</Button>
          {currentQuestionIndex < totalQuestions - 1 ? (
            <Button onClick={handleSaveAndNext}>Save & Next Question</Button>
          ) : (
            <Button onClick={handleSaveAllAndClose} className="bg-green-600 hover:bg-green-700">Complete Test Grading ✅</Button>
          )}
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
