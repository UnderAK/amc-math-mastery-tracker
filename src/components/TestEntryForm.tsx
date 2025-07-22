import { useState } from "react";
import { BookOpen, Sparkles, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { TopicInputPopup } from "./TopicInputPopup"; // We will modify or replace this

interface TestScore {
  date: string;
  score: number;
  testType: string;
  year: number;
  input: string;
  key: string;
  // Removed incorrectQuestions and topicMistakes as they will be replaced by questionTopics
  label?: string;
  questionTopics: { [questionNum: number]: string }; // Store topic for ALL 25 questions
  questionCorrectness: { [questionNum: number]: boolean }; // Store correctness for ALL 25 questions
}


// Function to determine default topic for question initialization - all questions default to "Other"
const getTopicForQuestion = (questionNum: number): string => {
  // All questions default to "Other" as per requirements
  return "Other";
};

export const TestEntryForm = () => {
  const [savedTests, setSavedTests] = useState<TestScore[]>(() => {
    const saved = localStorage.getItem("testScores");
    return saved ? JSON.parse(saved) : [];
  });
  const [testType, setTestType] = useState("amc8");
  const [testYear, setTestYear] = useState(new Date().getFullYear().toString());
  const [userAnswers, setUserAnswers] = useState("");
  const [answerKey, setAnswerKey] = useState("");
  const [label, setLabel] = useState("");
  const [result, setResult] = useState("");
  // We will now store topics for ALL questions
  const [allQuestionTopics, setAllQuestionTopics] = useState<{ [key: number]: string }>({});
  const [isTopicInputForAllOpen, setIsTopicInputForAllOpen] = useState(false);
  
  const { toast } = useToast();

  const topicOptions = [
    "Algebra",
    "Geometry",
    "Number Theory",
    "Combinatorics",
    "Other"
  ];

  const sanitizeInput = (value: string) => {
    // Allow space to count as wrong answer, then remove it and replace with empty string for processing
    return value.toUpperCase().replace(/[^ABCDE ]/g, '').slice(0, 25);
  };

  const handleUserAnswersChange = (value: string) => {
    setUserAnswers(sanitizeInput(value));
  };

  const handleAnswerKeyChange = (value: string) => {
    setAnswerKey(sanitizeInput(value));
  };

  const gradeTest = () => {
    if (userAnswers.length !== 25 || answerKey.length !== 25) {
      setResult("❌ You must enter exactly 25 characters in both fields (A–E only).");
      toast({
        title: "Invalid Input",
        description: "Both answer fields must contain exactly 25 letters (A-E)",
        variant: "destructive",
      });
      return;
    }

    // Initialize allQuestionTopics with default topics
    const initialTopics: { [key: number]: string } = {};
    // Don't pre-fill topics - let the popup handle topic selection
    // The popup will default unselected questions to "Other" when saving
    setAllQuestionTopics(initialTopics);
    setIsTopicInputForAllOpen(true); // Open the popup to get topics for all questions

    // The rest of the grading and saving will happen after the topic popup is closed
  };

  const handleSaveAllTopics = (topics: { [key: number]: string }) => {
    console.log('DEBUG TestEntryForm: handleSaveAllTopics called with:', topics);
    setAllQuestionTopics(topics);
    setIsTopicInputForAllOpen(false);

    // Now that we have topics for all questions, finalize grading and save the score
    let correct = 0;
    const questionCorrectness: { [questionNum: number]: boolean } = {};

    for (let i = 0; i < 25; i++) {
      const questionNum = i + 1;
      // Treat space as wrong answer, but any other character normally
      const userAnswer = userAnswers[i] === ' ' ? 'WRONG' : userAnswers[i];
      const isCorrect = userAnswer === answerKey[i];
      questionCorrectness[questionNum] = isCorrect;
      if (isCorrect) {
        correct++;
      }
    }

    const incorrect = 25 - correct;
    const percent = Math.round((correct / 25) * 100);
    const date = new Date().toISOString().split("T")[0];

   
    console.log('DEBUG TestEntryForm: allQuestionTopics at save time:', allQuestionTopics);
    console.log('DEBUG TestEntryForm: topics parameter:', topics);
    
    const newScore: TestScore = {
      date,
      score: correct,
      testType,
      year: parseInt(testYear),
      input: userAnswers,
      key: answerKey,
      label: label.trim() || undefined,
      questionTopics: topics, // Use the topics parameter directly instead of allQuestionTopics
      questionCorrectness: questionCorrectness, // Store correctness for all questions
    };
    
    console.log('DEBUG TestEntryForm: newScore being saved:', {
      questionTopics: newScore.questionTopics,
      questionCorrectness: newScore.questionCorrectness
    });
    const updatedTests = [...savedTests, newScore];
    setSavedTests(updatedTests);
    localStorage.setItem("testScores", JSON.stringify(updatedTests));
    
    console.log('DEBUG TestEntryForm: Saved to localStorage. Total scores:', scores.length);
    
    const currentXp = parseInt(localStorage.getItem("xp") || "0");
    let xpEarned = 10 + correct;

    const today = new Date().toISOString().split("T")[0];
    const lastDate = localStorage.getItem("lastPracticeDate");
    let streak = parseInt(localStorage.getItem("streak") || "0");
    let streakBonus = 0;

    if (lastDate !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yStr = yesterday.toISOString().split("T")[0];
      streak = lastDate === yStr ? streak + 1 : 1;
      localStorage.setItem("lastPracticeDate", today);
      localStorage.setItem("streak", streak.toString());
      
      if (streak >= 7) streakBonus = Math.floor(streak / 7) * 5;
      if (streak >= 30) streakBonus += 20;
    }

    let performanceBonus = 0;
    if (percent >= 90) performanceBonus = 15;
    else if (percent >= 80) performanceBonus = 10;
    else if (percent >= 70) performanceBonus = 5;

    xpEarned += streakBonus + performanceBonus;
    const newXp = currentXp + xpEarned;
    localStorage.setItem("xp", newXp.toString());

    let resultText = `✅ You scored ${correct} out of 25. ✔️ Correct: ${correct} | ❌ Incorrect: ${incorrect} | 📈 ${percent}%`;
    if (streakBonus > 0) resultText += ` | 🔥 Streak Bonus: +${streakBonus} XP`;
    if (performanceBonus > 0) resultText += ` | ⭐ Performance Bonus: +${performanceBonus} XP`;
    
    setResult(resultText);
    
    toast({
      title: "Test Graded! 🎉",
      description: `Score: ${correct}/25 (${percent}%) | +${xpEarned} XP`,
    });

    const newLevel = Math.floor(newXp / 250) + 1;
    const currentLevel = Math.floor(currentXp / 250) + 1;
    if (newLevel > currentLevel) {
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('levelUp', { detail: { newLevel } }));
      }, 1000);
    }

    setUserAnswers("");
    setAnswerKey("");
    setLabel("");
    setAllQuestionTopics({}); // Clear topics for the next test
    window.dispatchEvent(new CustomEvent('dataUpdate'));
  };

  // This handler is no longer needed in this form, as we get topics for all questions
  // const handleSaveTopic = (questionNum: number, topic: string) => {
  //   setTopicsForIncorrect(prevTopics => ({
  //     ...prevTopics,
  //     [questionNum]: topic.trim(),
  //   }));
  // };

  // This handler is no longer needed in this form
  // const handleCloseTopicPopup = () => {
  //   setIsTopicPopupOpen(false);


  //   const scores: TestScore[] = JSON.parse(localStorage.getItem("scores") || "[]");
  //   if (scores.length > 0) {
  //     const latestScoreIndex = scores.length - 1;
  //     const latestScore = scores[latestScoreIndex];
      
  //     const topicMistakes: { [topic: string]: number } = {};
  //     latestScore.incorrectQuestions?.forEach(qNum => {
  //       const topic = topicsForIncorrect[qNum];
  //       if (topic) {
  //         topicMistakes[topic] = (topicMistakes[topic] || 0) + 1;
  //       } else {
  //          topicMistakes['Other'] = (topicMistakes['Other'] || 0) + 1;
  //       }
  //     });
  //     latestScore.topicMistakes = topicMistakes;
  //     scores[latestScoreIndex] = latestScore;
  //     localStorage.setItem("scores", JSON.stringify(scores));
      
  //     window.dispatchEvent(new CustomEvent('dataUpdate'));
  //   }
    
  //   setTopicsForIncorrect({});
  // };


  return (
    <section className="glass p-6 rounded-2xl shadow-xl hover-lift animate-slide-in-left">
      <h2 className="text-xl font-semibold text-primary mb-4 flex items-center gap-2">
        <BookOpen className="w-5 h-5 animate-float" />
        New Test Entry
      </h2>
      
      <div className="space-y-4">
        {/* Test Type Selection */}
        <Select value={testType} onValueChange={setTestType}>
          <SelectTrigger>
            <SelectValue placeholder="Select test type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="amc8">AMC 8</SelectItem>
            <SelectItem value="amc10">AMC 10</SelectItem>
            <SelectItem value="amc12">AMC 12</SelectItem>
          </SelectContent>
        </Select>

        {/* Test Year */}
        <Input
          type="number"
          min="2000"
          max="2099"
          value={testYear}
          onChange={(e) => setTestYear(e.target.value)}
          placeholder="Enter Year (e.g., 2025)"
        />

        {/* Label Input */}
        <Input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Label (optional) - e.g., Practice Test, Competition, Review"
        />

        {/* User Answers */}
        <div>
          <label className="text-sm font-medium mb-2 block">Your Answers</label>
          <Textarea
            value={userAnswers}
            onChange={(e) => handleUserAnswersChange(e.target.value)}
            placeholder="Enter Your Answers (25 letters A–E only)"
            className="font-mono"
            rows={2}
          />
          <div className="text-xs text-muted-foreground mt-1">
            {userAnswers.length}/25 characters
          </div>
        </div>

        {/* Answer Key */}
        <div>
          <label className="text-sm font-medium mb-2 block">Official Answer Key</label>
          <Textarea
            value={answerKey}
            onChange={(e) => handleAnswerKeyChange(e.target.value)}
            placeholder="Enter Official Answer Key (25 letters A–E only)"
            className="font-mono"
            rows={2}
          />
          <div className="text-xs text-muted-foreground mt-1">
            {answerKey.length}/25 characters
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end">
          <Button
            onClick={gradeTest}
            className="gradient-primary hover-bounce hover-glow animate-pulse-glow"
            disabled={userAnswers.length !== 25 || answerKey.length !== 25}
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Grade Test
          </Button>
        </div>

        {/* Result */}
        {result && (
          <div className="mt-4 p-3 bg-accent/10 border border-accent/20 rounded-lg">
            <p className="text-sm font-medium text-accent">{result}</p>
          </div>
        )}
      </div>

      {/* Topic Input Popup (Modify or Replace) */}
      {/* We will pass all 25 questions to the popup */}
      <TopicInputPopup
        isOpen={isTopicInputForAllOpen}
        onClose={() => setIsTopicInputForAllOpen(false)}
        // Pass all questions (1-25) and their initial topics
        questionsToTopic={Array.from({length: 25}, (_, i) => i + 1)} // Always pass questions 1-25
        initialTopics={allQuestionTopics}
        onSaveTopics={handleSaveAllTopics}
        topicOptions={topicOptions}
      />

    </section>
  );
};
