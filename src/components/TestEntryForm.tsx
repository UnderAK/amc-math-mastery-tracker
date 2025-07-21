import { useState } from "react";
import { BookOpen, Sparkles, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { TopicInputPopup } from "./TopicInputPopup"; // Import the new component

interface TestScore {
  date: string;
  score: number;
  testType: string;
  year: number;
  input: string;
  key: string;
  incorrectQuestions?: number[]; // Track which questions were wrong
  topicMistakes?: { [topic: string]: number }; // Track mistakes by topic
  label?: string;
}
export const TestEntryForm = () => {
  const [testType, setTestType] = useState("amc8");
  const [testYear, setTestYear] = useState(new Date().getFullYear().toString());
  const [userAnswers, setUserAnswers] = useState("");
  const [answerKey, setAnswerKey] = useState("");
  const [label, setLabel] = useState("");
  const [result, setResult] = useState("");
  const [incorrectQuestionsData, setIncorrectQuestionsData] = useState<Array<{questionNum: number, userAnswer: string, correctAnswer: string}>>([]);
  const [isTopicPopupOpen, setIsTopicPopupOpen] = useState(false); // State for popup visibility
  const [topicsForIncorrect, setTopicsForIncorrect] = useState<{ [key: number]: string }>({}); // Store topics for incorrect questions
  const { toast } = useToast();

  const sanitizeInput = (value: string) => {
    return value.toUpperCase().replace(/[^ABCDE]/g, '').slice(0, 25);
  };

  const handleUserAnswersChange = (value: string) => {
    setUserAnswers(sanitizeInput(value));
  };

  const handleAnswerKeyChange = (value: string) => {
    setAnswerKey(sanitizeInput(value));
  };

  // Topic mapping for AMC questions (typical distribution) - This will be less relevant now
  const getTopicForQuestion = (questionNum: number, testType: string): string => {
    // Simplified topic mapping based on typical AMC structure
    if (questionNum <= 5) return "Basic Arithmetic";
    if (questionNum <= 10) return "Algebra";
    if (questionNum <= 15) return "Geometry";
    if (questionNum <= 20) return "Number Theory";
    return "Advanced Topics";
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

    let correct = 0;
    const incorrectQData: Array<{questionNum: number, userAnswer: string, correctAnswer: string}> = [];
    // We will calculate topicMistakes after the user inputs topics
    
    for (let i = 0; i < 25; i++) {
      if (userAnswers[i] === answerKey[i]) {
        correct++;
      } else {
        const questionNum = i + 1;
        incorrectQData.push({questionNum, userAnswer: userAnswers[i], correctAnswer: answerKey[i]});
      }
    }

    setIncorrectQuestionsData(incorrectQData);

    const incorrect = 25 - correct;
    const percent = Math.round((correct / 25) * 100);
    const date = new Date().toISOString().split("T")[0];

    // Save score (initially without topicMistakes)
    const scores: TestScore[] = JSON.parse(localStorage.getItem("scores") || "[]");
    const newScore: TestScore = {
      date,
      score: correct,
      testType,
      year: parseInt(testYear),
      input: userAnswers,
      key: answerKey,
      incorrectQuestions: incorrectQData.map(q => q.questionNum),
      label: label.trim() || undefined
    };
    scores.push(newScore);
    localStorage.setItem("scores", JSON.stringify(scores));

    // Update XP and streak
    const currentXp = parseInt(localStorage.getItem("xp") || "0");
    let xpEarned = 10 + correct; // Base 10 XP + 1 per correct answer
    
    // Update streak and bonus calculations
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
      
      // Streak bonuses
      if (streak >= 7) streakBonus = Math.floor(streak / 7) * 5; // 5 XP per week streak
      if (streak >= 30) streakBonus += 20; // Monthly streak bonus
    }

    // Performance bonuses
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

    // Check for level up
    const newLevel = Math.floor(newXp / 250) + 1; // Changed from 100 to 250 XP per level
    const currentLevel = Math.floor(currentXp / 250) + 1;
    if (newLevel > currentLevel) {
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('levelUp', { detail: { newLevel } }));
      }, 1000);
    }

    // Clear form
    setUserAnswers("");
    setAnswerKey("");
    setLabel("");
    
    // Open Topic Input Popup if there are incorrect questions
    if (incorrectQData.length > 0) {
      setIsTopicPopupOpen(true);
    } else {
      // Trigger data refresh if no incorrect questions
      window.dispatchEvent(new CustomEvent('dataUpdate'));
    }
  };

  const handleSaveTopic = (questionNum: number, topic: string) => {
    setTopicsForIncorrect(prevTopics => ({
      ...prevTopics,
      [questionNum]: topic,
    }));
  };

  const handleCloseTopicPopup = () => {
    setIsTopicPopupOpen(false);
    // Now that the popup is closed, calculate topicMistakes and update the latest score entry
    const scores: TestScore[] = JSON.parse(localStorage.getItem("scores") || "[]");
    if (scores.length > 0) {
      const latestScoreIndex = scores.length - 1;
      const latestScore = scores[latestScoreIndex];
      
      const topicMistakes: { [topic: string]: number } = {};
      latestScore.incorrectQuestions?.forEach(qNum => {
        const topic = topicsForIncorrect[qNum];
        if (topic) {
          topicMistakes[topic] = (topicMistakes[topic] || 0) + 1;
        }
      });
      latestScore.topicMistakes = topicMistakes;
      scores[latestScoreIndex] = latestScore; // Update the score in the array
      localStorage.setItem("scores", JSON.stringify(scores));
      
      // Trigger data refresh after updating with topics
      window.dispatchEvent(new CustomEvent('dataUpdate'));
    }
    
    // Clear the temporary topics state
    setTopicsForIncorrect({});
  };


  return (
    <section className="glass p-6 rounded-2xl shadow-xl">
      <h2 className="text-xl font-semibold text-primary mb-4 flex items-center gap-2">
        <BookOpen className="w-5 h-5" />
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
            className="gradient-primary hover-bounce"
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

      {/* Topic Input Popup */}
      <TopicInputPopup
        isOpen={isTopicPopupOpen}
        onClose={handleCloseTopicPopup}
        incorrectQuestions={incorrectQuestionsData}
        onSaveTopic={handleSaveTopic}
      />

    </section>
  );
};