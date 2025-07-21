import { useState } from "react";
import { BookOpen, CheckCircle, XCircle } from "lucide-react"; // Import XCircle for incorrect questions
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { BubbleSheetInput } from "./BubbleSheetInput";
import { TopicInputPopup } from "./TopicInputPopup";

interface TestScore {
  date: string;
  score: number;
  testType: string;
  year: number;
  input: string;
  key: string;
  label?: string;
  questionTopics: { [questionNum: number]: string };
  questionCorrectness: { [questionNum: number]: boolean };
  incorrectQuestions?: number[];
}

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
  const [userAnswers, setUserAnswers] = useState<("A" | "B" | "C" | "D" | "E" | "")[]>(Array(25).fill(""));
  const [answerKey, setAnswerKey] = useState("");
  const [label, setLabel] = useState("");
  const [result, setResult] = useState("");
  
  const [incorrectQuestionsData, setIncorrectQuestionsData] = useState<Array<{questionNum: number, userAnswer: string, correctAnswer: string}>>([]);
  const [isTopicPopupOpen, setIsTopicPopupOpen] = useState(false);
  const [topicsFromPopup, setTopicsFromPopup] = useState<{ [key: number]: string }>({});

  const { toast } = useToast();

  const topicOptions = [
    "Algebra",
    "Geometry",
    "Number Theory",
    "Combinatorics",
    "Other"
  ];

  const formatAnswersForStorage = (answers: ("A" | "B" | "C" | "D" | "E" | "")[]): string => {
    return answers.join("");
  };

  const sanitizeAnswerKey = (value: string) => {
    return value.toUpperCase().replace(/[^ABCDE]/g, '').slice(0, 25);
  };

  const handleAnswerKeyChange = (value: string) => {
    setAnswerKey(sanitizeAnswerKey(value));
  };

  const gradeTest = () => {
    const userAnswerString = formatAnswersForStorage(userAnswers);
    const answerKeyString = answerKey;

    if (answerKeyString.length !== 25) {
      setResult("❌ Official Answer Key must contain exactly 25 letters (A–E only).");
      toast({
        title: "Invalid Input",
        description: "Official Answer Key must contain exactly 25 letters (A-E)",
        variant: "destructive",
      });
      return;
    }

    let correct = 0;
    const questionCorrectness: { [questionNum: number]: boolean } = {};
    const incorrectQData: Array<{questionNum: number, userAnswer: string, correctAnswer: string}> = [];
    const questionTopics: { [questionNum: number]: string } = {};

    for (let i = 0; i < 25; i++) {
      const questionNum = i + 1;
      const userAnswer = userAnswers[i];
      const correctAnswer = answerKeyString[i];

      const isCorrect = userAnswer !== "" && userAnswer === correctAnswer;
      questionCorrectness[questionNum] = isCorrect;

      // Assign default topic initially
      questionTopics[questionNum] = getTopicForQuestion(questionNum);

      if (!isCorrect) {
        incorrectQData.push({questionNum, userAnswer, correctAnswer});
      } else {
        correct++;
      }
    }

    setIncorrectQuestionsData(incorrectQData);

    const incorrect = 25 - correct;
    const percent = Math.round((correct / 25) * 100);
    const date = new Date().toISOString().split("T")[0];

    // Prepare the score object with initial data
    const newScore: TestScore = {
      date,
      score: correct,
      testType,
      year: parseInt(testYear),
      input: userAnswerString,
      key: answerKeyString,
      label: label.trim() || undefined,
      questionTopics: questionTopics, // This will be updated after the popup if needed
      questionCorrectness: questionCorrectness,
      incorrectQuestions: incorrectQData.map(q => q.questionNum), // Store incorrect question numbers
    };
    
    // Save score initially (will be updated with specific topics after popup)
    const scores: TestScore[] = JSON.parse(localStorage.getItem("scores") || "[]");
    scores.push(newScore);
    localStorage.setItem("scores", JSON.stringify(scores));

    // Update XP and streak (using the correct count from grading)
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

    // Clear form initially
    setUserAnswers(Array(25).fill(""));
    setAnswerKey("");
    setLabel("");
    
    // If there are incorrect questions, open the topic popup
    if (incorrectQData.length > 0) {
      // Initialize topicsFromPopup with the default topics for incorrect questions
      const initialTopicsForIncorrect: { [key: number]: string } = {};
      incorrectQData.forEach(q => {
        initialTopicsForIncorrect[q.questionNum] = getTopicForQuestion(q.questionNum);
      });
      setTopicsFromPopup(initialTopicsForIncorrect);
      setIsTopicPopupOpen(true);
    } else {
      // If no incorrect questions, just trigger data update
      window.dispatchEvent(new CustomEvent('dataUpdate'));
    }
  };

  // Handler for when topics are saved in the popup
  const handleTopicsSavedInPopup = (topics: { [key: number]: string }) => {
      setIsTopicPopupOpen(false);
      // Update the latest score in localStorage with the topics from the popup
      const scores: TestScore[] = JSON.parse(localStorage.getItem("scores") || "[]");
      if (scores.length > 0) {
          const latestScoreIndex = scores.length - 1;
          const latestScore = scores[latestScoreIndex];
          
          // Update the topics for the incorrect questions with the saved topics from the popup
          latestScore.incorrectQuestions?.forEach(qNum => {
              if (topics[qNum]) {
                  latestScore.questionTopics[qNum] = topics[qNum];
              } else {
                   // If topic was not selected in popup, default to 'Other'
                   latestScore.questionTopics[qNum] = 'Other';
              }
          });

          // Recalculate topicMistakes based on the updated questionTopics for incorrect questions
          const topicMistakes: { [topic: string]: number } = {};
           latestScore.incorrectQuestions?.forEach(qNum => {
               const topic = latestScore.questionTopics[qNum];
               if(topic) {
                   topicMistakes[topic] = (topicMistakes[topic] || 0) + 1;
               }
           });
           latestScore.topicMistakes = topicMistakes;

          scores[latestScoreIndex] = latestScore;
          localStorage.setItem("scores", JSON.stringify(scores));
          
          // Trigger data update to refresh analytics
          window.dispatchEvent(new CustomEvent('dataUpdate'));
      }
      // Clear temporary topics state
      setTopicsFromPopup({});
  };


  // Check if only answer key has 25 characters to enable the Grade Test button
  const isGradeButtonEnabled = answerKey.length === 25;

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

        {/* User Answers Bubble Sheet */}
        <div>
          <label className="text-sm font-medium mb-2 block">Your Answers</label>
          <BubbleSheetInput answers={userAnswers} setAnswers={setUserAnswers} />
        </div>

        {/* Answer Key Textarea */}
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
            disabled={!isGradeButtonEnabled}
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

        {/* Display Incorrect Questions */}
        {incorrectQuestionsData.length > 0 && (
            <div className="mt-4">
                <h3 className="text-lg font-semibold text-red-600 flex items-center gap-2 mb-2">
                    <XCircle className="w-5 h-5" />
                    Incorrect Questions
                </h3>
                <ul className="list-disc list-inside text-sm text-muted-foreground">
                    {incorrectQuestionsData.map(q => (
                        <li key={q.questionNum}>
                            Question {q.questionNum}: Your Answer - {q.userAnswer || 'Unanswered'}, Correct Answer - {q.correctAnswer}
                        </li>
                    ))}
                </ul>
            </div>
        )}

      </div>

      {/* Topic Input Popup */}
      <TopicInputPopup
        isOpen={isTopicPopupOpen}
        onClose={handleTopicsSavedInPopup}
        incorrectQuestions={incorrectQuestionsData} // Pass the list of incorrect questions
        topicOptions={topicOptions}
        initialTopics={topicsFromPopup} // Pass initial topics (default or from previous save)
        onSaveTopics={handleTopicsSavedInPopup} // Pass the handler for when popup is closed
      />

    </section>
  );
};
