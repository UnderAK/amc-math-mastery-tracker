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
  incorrectQuestions?: number[];
  label?: string;
  maxQuestions?: number; // Track max questions for the test type
}

export const TestEntryForm = () => {
  const [testType, setTestType] = useState("amc8");
  const [testYear, setTestYear] = useState(new Date().getFullYear().toString());
  const [userAnswers, setUserAnswers] = useState("");
  const [answerKey, setAnswerKey] = useState("");
  const [label, setLabel] = useState("");
  const [result, setResult] = useState("");
  const { toast } = useToast();

  // Get question count based on test type
  const getQuestionCount = (type: string) => {
    switch (type) {
      case "mathcounts-sprint": return 30;
      case "mathcounts-target": return 8;
      case "mathcounts-team": return 10;
      default: return 25; // AMC tests
    }
  };

  const currentQuestionCount = getQuestionCount(testType);

  const sanitizeInput = (value: string, maxLength: number) => {
    if (testType.startsWith("mathcounts")) {
      // For Mathcounts, allow numbers and letters
      return value.toUpperCase().replace(/[^ABCDE0-9]/g, "").slice(0, maxLength);
    } else {
      // For AMC, only A-E
      return value.toUpperCase().replace(/[^ABCDE]/g, "").slice(0, maxLength);
    }
  };

  const handleUserAnswersChange = (value: string) => {
    setUserAnswers(sanitizeInput(value, currentQuestionCount));
  };

  const handleAnswerKeyChange = (value: string) => {
    setAnswerKey(sanitizeInput(value, currentQuestionCount));
  };

  const gradeTest = () => {
    const expectedLength = currentQuestionCount;
    
    if (userAnswers.length !== expectedLength || answerKey.length !== expectedLength) {
      const inputType = testType.startsWith("mathcounts") ? "answers" : "letters (A-E)";
      setResult(`❌ You must enter exactly ${expectedLength} ${inputType} in both fields.`);
      toast({
        title: "Invalid Input",
        description: `Both answer fields must contain exactly ${expectedLength} ${inputType}`,
        variant: "destructive",
      });
      return;
    }

    let correct = 0;
    const incorrectQuestions: number[] = [];
    
    for (let i = 0; i < expectedLength; i++) {
      if (userAnswers[i] === answerKey[i]) {
        correct++;
      } else {
        incorrectQuestions.push(i + 1);
      }
    }

    const incorrect = expectedLength - correct;
    const percent = Math.round((correct / expectedLength) * 100);
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
      incorrectQuestions,
      label: label.trim() || undefined,
      maxQuestions: expectedLength
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

    setResult(`✅ You scored ${correct} out of ${expectedLength}. ✔️ Correct: ${correct} | ❌ Incorrect: ${incorrect} | 📈 ${percent}%`);
    
    toast({
      title: "Test Graded! 🎉",
      description: `Score: ${correct}/${expectedLength} (${percent}%) | +${10 + correct} XP`,
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
    
    // Trigger data refresh
    window.dispatchEvent(new CustomEvent('dataUpdate'));
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
            <SelectItem value="mathcounts-sprint">MATHCOUNTS Sprint</SelectItem>
            <SelectItem value="mathcounts-target">MATHCOUNTS Target</SelectItem>
            <SelectItem value="mathcounts-team">MATHCOUNTS Team</SelectItem>
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
            placeholder={testType.startsWith("mathcounts") 
              ? `Enter Your Answers (${currentQuestionCount} answers)` 
              : `Enter Your Answers (${currentQuestionCount} letters A–E only)`}
            className="font-mono"
            rows={2}
          />
          <div className="text-xs text-muted-foreground mt-1">
            {userAnswers.length}/{currentQuestionCount} characters
          </div>
        </div>

        {/* Answer Key */}
        <div>
          <label className="text-sm font-medium mb-2 block">Official Answer Key</label>
          <Textarea
            value={answerKey}
            onChange={(e) => handleAnswerKeyChange(e.target.value)}
            placeholder={testType.startsWith("mathcounts") 
              ? `Enter Official Answer Key (${currentQuestionCount} answers)` 
              : `Enter Official Answer Key (${currentQuestionCount} letters A–E only)`}
            className="font-mono"
            rows={2}
          />
          <div className="text-xs text-muted-foreground mt-1">
            {answerKey.length}/{currentQuestionCount} characters
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end">
          <Button
            onClick={gradeTest}
            className="gradient-primary hover-bounce"
            disabled={userAnswers.length !== currentQuestionCount || answerKey.length !== currentQuestionCount}
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