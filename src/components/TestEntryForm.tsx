import { useState } from "react";
import { BookOpen, Sparkles, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface TestScore {
  date: string;
  score: number;
  testType: string;
  year: number;
  input: string;
  key: string;
  incorrectQuestions?: number[]; // Track which questions were wrong
}

export const TestEntryForm = () => {
  const [testType, setTestType] = useState("amc8");
  const [testYear, setTestYear] = useState(new Date().getFullYear().toString());
  const [userAnswers, setUserAnswers] = useState("");
  const [answerKey, setAnswerKey] = useState("");
  const [result, setResult] = useState("");
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
    const incorrectQuestions: number[] = [];
    
    for (let i = 0; i < 25; i++) {
      if (userAnswers[i] === answerKey[i]) {
        correct++;
      } else {
        incorrectQuestions.push(i + 1); // Store 1-indexed question numbers
      }
    }

    const incorrect = 25 - correct;
    const percent = Math.round((correct / 25) * 100);
    const date = new Date().toISOString().split("T")[0];

    // Save score
    const scores: TestScore[] = JSON.parse(localStorage.getItem("scores") || "[]");
    const newScore: TestScore = {
      date,
      score: correct,
      testType,
      year: parseInt(testYear),
      input: userAnswers,
      key: answerKey,
      incorrectQuestions
    };
    scores.push(newScore);
    localStorage.setItem("scores", JSON.stringify(scores));

    // Update XP and streak
    const currentXp = parseInt(localStorage.getItem("xp") || "0");
    const newXp = currentXp + 10 + correct; // Base 10 XP + 1 per correct answer
    localStorage.setItem("xp", newXp.toString());

    // Update streak
    const today = new Date().toISOString().split("T")[0];
    const lastDate = localStorage.getItem("lastPracticeDate");
    let streak = parseInt(localStorage.getItem("streak") || "0");

    if (lastDate !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yStr = yesterday.toISOString().split("T")[0];
      streak = lastDate === yStr ? streak + 1 : 1;
      localStorage.setItem("lastPracticeDate", today);
      localStorage.setItem("streak", streak.toString());
    }

    setResult(`✅ You scored ${correct} out of 25. ✔️ Correct: ${correct} | ❌ Incorrect: ${incorrect} | 📈 ${percent}%`);
    
    toast({
      title: "Test Graded! 🎉",
      description: `Score: ${correct}/25 (${percent}%) | +${10 + correct} XP`,
    });

    // Check for level up
    const newLevel = Math.floor(newXp / 100) + 1;
    const currentLevel = Math.floor(currentXp / 100) + 1;
    if (newLevel > currentLevel) {
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('levelUp', { detail: { newLevel } }));
      }, 1000);
    }

    // Clear form
    setUserAnswers("");
    setAnswerKey("");
    
    // Trigger data refresh
    window.dispatchEvent(new CustomEvent('dataUpdate'));
  };

  const autoExtractAnswers = () => {
    const matches = answerKey.match(/[ABCDE]/g);
    if (matches && matches.length >= 25) {
      setAnswerKey(matches.slice(0, 25).join(""));
      toast({
        title: "✅ Answer key extracted successfully!",
        description: "Found 25 valid answers",
      });
    } else {
      toast({
        title: "❌ Extraction failed",
        description: "Couldn't extract 25 valid answers from input",
        variant: "destructive",
      });
    }
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
    </section>
  );
};