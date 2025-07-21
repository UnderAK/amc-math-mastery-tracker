import { useState } from "react";
import { BookOpen, Sparkles, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { TopicInputPopup } from "./TopicInputPopup";

interface TestScore {
  date: string;
  score: number;
  testType: string;
  year: number;
  input: string;
  key: string;
  incorrectQuestions?: number[];
  topicMistakes?: { [topic: string]: number };
  label?: string;
  questionTopics?: { [questionNum: number]: string }; // Added field to store topic for all questions
}

// Function to determine topic based on question number (can be refined)
const getTopicForQuestion = (questionNum: number): string => {
  if (questionNum <= 5) return "Algebra";
  if (questionNum <= 10) return "Geometry";
  if (questionNum <= 15) return "Number Theory";
  if (questionNum <= 20) return "Combinatorics";
  return "Other";
};

export const TestEntryForm = () => {
  const [testType, setTestType] = useState("amc8");
  const [testYear, setTestYear] = useState(new Date().getFullYear().toString());
  const [userAnswers, setUserAnswers] = useState("");
  const [answerKey, setAnswerKey] = useState("");
  const [label, setLabel] = useState("");
  const [result, setResult] = useState("");
  const [incorrectQuestionsData, setIncorrectQuestionsData] = useState<Array<{questionNum: number, userAnswer: string, correctAnswer: string}>>([]);
  const [isTopicPopupOpen, setIsTopicPopupOpen] = useState(false);
  const [topicsForIncorrect, setTopicsForIncorrect] = useState<{ [key: number]: string }>({});
  const { toast } = useToast();

  const topicOptions = [
    "Algebra",
    "Geometry",
    "Number Theory",
    "Combinatorics",
    "Other"
  ];

  const sanitizeInput = (value: string) => {
    return value.toUpperCase().replace(/[^ABCDE]/g, '').slice(0, 25);
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

    let correct = 0;
    const incorrectQData: Array<{questionNum: number, userAnswer: string, correctAnswer: string}> = [];
    const questionTopics: { [questionNum: number]: string } = {};
    
    for (let i = 0; i < 25; i++) {
      const questionNum = i + 1;
      const topic = getTopicForQuestion(questionNum);
      questionTopics[questionNum] = topic;

      if (userAnswers[i] === answerKey[i]) {
        correct++;
      } else {
        incorrectQData.push({questionNum, userAnswer: userAnswers[i], correctAnswer: answerKey[i]});
      }
    }

    setIncorrectQuestionsData(incorrectQData);

    const incorrect = 25 - correct;
    const percent = Math.round((correct / 25) * 100);
    const date = new Date().toISOString().split("T")[0];

    const scores: TestScore[] = JSON.parse(localStorage.getItem("scores") || "[]");
    const newScore: TestScore = {
      date,
      score: correct,
      testType,
      year: parseInt(testYear),
      input: userAnswers,
      key: answerKey,
      incorrectQuestions: incorrectQData.map(q => q.questionNum),
      topicMistakes: {}, // Initialize as empty, will be filled after popup
      label: label.trim() || undefined,
      questionTopics: questionTopics, // Store topic for all questions
    };
    scores.push(newScore);
    localStorage.setItem("scores", JSON.stringify(scores));

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
    
    if (incorrectQData.length > 0) {
      setIsTopicPopupOpen(true);
    } else {
      window.dispatchEvent(new CustomEvent('dataUpdate'));
    }
  };

  const handleSaveTopic = (questionNum: number, topic: string) => {
    setTopicsForIncorrect(prevTopics => ({
      ...prevTopics,
      [questionNum]: topic.trim(),
    }));
  };

  const handleCloseTopicPopup = () => {
    setIsTopicPopupOpen(false);


    const scores: TestScore[] = JSON.parse(localStorage.getItem("scores") || "[]");
    if (scores.length > 0) {
      const latestScoreIndex = scores.length - 1;
      const latestScore = scores[latestScoreIndex];
      
      const topicMistakes: { [topic: string]: number } = {};
      latestScore.incorrectQuestions?.forEach(qNum => {
        const topic = topicsForIncorrect[qNum];
        if (topic) {
          topicMistakes[topic] = (topicMistakes[topic] || 0) + 1;
        } else {
           topicMistakes['Other'] = (topicMistakes['Other'] || 0) + 1;
        }
      });
      latestScore.topicMistakes = topicMistakes;
      scores[latestScoreIndex] = latestScore;
      localStorage.setItem("scores", JSON.stringify(scores));
      
      window.dispatchEvent(new CustomEvent('dataUpdate'));
    }
    
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
        topicOptions={topicOptions}
      />

    </section>
  );
};
