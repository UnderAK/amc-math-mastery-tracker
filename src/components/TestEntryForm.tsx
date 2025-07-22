import { useState } from "react";
import { BookOpen, Sparkles, CheckCircle } from "lucide-react";
import { AchievementPopup } from "@/components/AchievementPopup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TopicInputPopup } from "@/components/TopicInputPopup";
import { useToast } from "@/hooks/use-toast";
import { TestScore } from "@/types/TestScore";

// TestScore interface is now imported from shared types


// Function to determine default topic for question initialization - all questions default to "Other"
const getTopicForQuestion = (questionNum: number): string => {
  // All questions default to "Other" as per requirements
  return "Other";
};

export const TestEntryForm = () => {
  const [showAchievementPopup, setShowAchievementPopup] = useState(false);
  const [newAchievements, setNewAchievements] = useState<{
    emoji: string;
    title: string;
    description: string;
  }[]>([]);
  const [savedTests, setSavedTests] = useState<TestScore[]>(() => {
    const saved = localStorage.getItem("scores");
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
  const [isGrading, setIsGrading] = useState(false);
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
    // Validate input lengths
    if (userAnswers.length !== 25 || answerKey.length !== 25) {
      setResult("❌ You must enter exactly 25 characters in both fields (A–E only).");
      toast({
        title: "Invalid Input",
        description: `User answers: ${userAnswers.length}/25, Answer key: ${answerKey.length}/25 characters`,
        variant: "destructive",
      });
      return;
    }
    
    // Validate that test type and year are selected
    if (!testType || !testYear) {
      setResult("❌ Please select a test type and enter a year.");
      toast({
        title: "Missing Information",
        description: "Test type and year are required",
        variant: "destructive",
      });
      return;
    }
    
    // Validate year is reasonable
    const year = parseInt(testYear);
    if (isNaN(year) || year < 2000 || year > 2030) {
      setResult("❌ Please enter a valid year between 2000 and 2030.");
      toast({
        title: "Invalid Year",
        description: "Year must be between 2000 and 2030",
        variant: "destructive",
      });
      return;
    }

    setIsGrading(true);
    setResult("📝 Please assign topics to each question to complete grading...");
    
    // Show initial feedback
    toast({
      title: "Starting Test Grading 📝",
      description: "Please assign topics to each question in the popup that will appear",
    });

    // Initialize allQuestionTopics with default topics for all 25 questions
    const initialTopics: { [key: number]: string } = {};
    // Pre-fill all questions with "Other" as default to ensure popup shows selections
    for (let i = 1; i <= 25; i++) {
      initialTopics[i] = "Other";
    }
    console.log('DEBUG TestEntryForm: Setting initial topics:', initialTopics);
    setAllQuestionTopics(initialTopics);
    setIsTopicInputForAllOpen(true); // Open the popup to get topics for all questions

    // The rest of the grading and saving will happen after the topic popup is closed
  };

  const handleSaveAllTopics = (topics: { [key: number]: string }) => {
    // --- Achievement check logic ---
    // Import badge logic from BadgesPanel (duplicated here for popup)
    const scores: TestScore[] = [...savedTests];
    const streak = parseInt(localStorage.getItem("streak") || "0");
    const xp = parseInt(localStorage.getItem("xp") || "0");
    const dailyBonus = JSON.parse(localStorage.getItem("dailyBonus") || '{"streak": 0, "totalBonusClaimed": 0}');
    const latestScore = (scores.length > 0 ? scores[scores.length - 1].score : 0) + 0;
    const bestScore = scores.length > 0 ? Math.max(...scores.map(s => s.score)) : 0;
    const totalTests = scores.length + 1; // This test is about to be saved
    // List of badge checks (simplified, only show newly earned)
    const prevBadges = JSON.parse(localStorage.getItem("earnedBadges") || "[]");
    const badgeChecks = [
      { emoji: "🌟", title: "First Steps", description: "Take your first test", earned: scores.length === 0 },
      { emoji: "🎯", title: "Sharp Shooter", description: "Score 15+ on any test", earned: bestScore < 15 && (latestScore >= 15) },
      { emoji: "🧠", title: "High Achiever", description: "Score 20+ on any test", earned: bestScore < 20 && (latestScore >= 20) },
      { emoji: "💯", title: "Perfect Score", description: "Score 25/25 on any test", earned: bestScore < 25 && (latestScore === 25) },
      { emoji: "⏫", title: "New Personal Best", description: "Beat your previous best score", earned: latestScore > bestScore },
      { emoji: "📚", title: "Dedicated Student", description: "Complete 5 tests", earned: totalTests === 5 },
      { emoji: "📝", title: "Test Master", description: "Complete 10 tests", earned: totalTests === 10 },
      { emoji: "🧪", title: "Research Scholar", description: "Complete 25 tests", earned: totalTests === 25 },
      { emoji: "🎓", title: "Graduate", description: "Complete 50 tests", earned: totalTests === 50 },
      { emoji: "🏛️", title: "Professor", description: "Complete 100 tests", earned: totalTests === 100 },
      { emoji: "⚡", title: "Power User", description: "Reach 500 XP", earned: xp < 500 && (xp + latestScore >= 500) },
      { emoji: "🌟", title: "Rising Star", description: "Reach Level 10", earned: Math.floor(xp / 100) + 1 < 10 && (Math.floor((xp + latestScore) / 100) + 1 >= 10) },
      { emoji: "🚀", title: "Math Champion", description: "Reach Level 25", earned: Math.floor(xp / 100) + 1 < 25 && (Math.floor((xp + latestScore) / 100) + 1 >= 25) },
      { emoji: "👑", title: "Math Royalty", description: "Reach Level 50", earned: Math.floor(xp / 100) + 1 < 50 && (Math.floor((xp + latestScore) / 100) + 1 >= 50) },
    ];
    const newlyEarned = badgeChecks.filter(b => b.earned && !prevBadges.includes(b.title));
    if (newlyEarned.length > 0) {
      setNewAchievements(newlyEarned);
      setShowAchievementPopup(true);
      // Save the earned badges
      localStorage.setItem("earnedBadges", JSON.stringify([...prevBadges, ...newlyEarned.map(b => b.title)]));
    }
    // --- End achievement check logic ---
    try {
      console.log('DEBUG TestEntryForm: handleSaveAllTopics called with:', topics);
      
      // Validate topics object
      if (!topics || typeof topics !== 'object') {
        console.error('ERROR: Invalid topics object received');
        setIsGrading(false);
        toast({
          title: "Error Saving Topics",
          description: "Invalid topic data received. Please try again.",
          variant: "destructive",
        });
        return;
      }
      
      // Validate we have exactly 25 topics
      const topicKeys = Object.keys(topics).map(k => parseInt(k)).sort((a, b) => a - b);
      if (topicKeys.length !== 25) {
        console.error('ERROR: Expected 25 topics, got:', topicKeys.length);
        setIsGrading(false);
        toast({
          title: "Error Saving Topics",
          description: `Expected 25 topics, but received ${topicKeys.length}. Please try again.`,
          variant: "destructive",
        });
        return;
      }
      
      setAllQuestionTopics(topics);
      setIsTopicInputForAllOpen(false);

      // Now that we have topics for all questions, finalize grading and save the score
    let correct = 0;
    const questionCorrectness: { [questionNum: number]: boolean } = {};

    for (let i = 0; i < 25; i++) {
      const questionNum = i + 1;
      const userAnswer = userAnswers[i];
      const correctAnswer = answerKey[i];
      
      // Treat space as always wrong (no answer provided)
      const isCorrect = userAnswer !== ' ' && userAnswer === correctAnswer;
      questionCorrectness[questionNum] = isCorrect;
      
      if (isCorrect) {
        correct++;
      }
      
      console.log(`DEBUG: Q${questionNum}: User='${userAnswer}' Correct='${correctAnswer}' Match=${isCorrect}`);
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
    localStorage.setItem("scores", JSON.stringify(updatedTests));
    
    console.log('DEBUG TestEntryForm: Saved to localStorage. Total scores:', updatedTests.length);
    console.log('DEBUG TestEntryForm: New score object:', newScore);
    console.log('DEBUG TestEntryForm: All saved tests:', updatedTests);
    
    // Verify the data was actually saved
    const verifyData = localStorage.getItem("scores");
    console.log('DEBUG TestEntryForm: Verification - localStorage "scores":', verifyData);
    
    if (verifyData) {
      const parsedData = JSON.parse(verifyData);
      console.log('DEBUG TestEntryForm: Verification - Parsed data length:', parsedData.length);
      console.log('DEBUG TestEntryForm: Verification - Last saved test:', parsedData[parsedData.length - 1]);
    }
    
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
    
    // Award coins for completing the test
    const coinsEarned = Math.floor(Math.random() * 11) + 5; // 5-15 coins
    const currentCoins = parseInt(localStorage.getItem("coins") || "0");
    const newCoins = currentCoins + coinsEarned;
    localStorage.setItem("coins", newCoins.toString());
    
    toast({
      title: "Test Graded Successfully! 🎉",
      description: `Score: ${correct}/25 (${percent}%) | +${xpEarned} XP | +${coinsEarned} coins`,
    });
    
    // Show additional success feedback
    setTimeout(() => {
      toast({
        title: "Test Saved! ✅",
        description: "Your test results have been saved to your progress history",
      });
    }, 1500);

    const newLevel = Math.floor(newXp / 250) + 1;
    const currentLevel = Math.floor(currentXp / 250) + 1;
    if (newLevel > currentLevel) {
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('levelUp', { detail: { newLevel } }));
      }, 1000);
    }

    setIsGrading(false);
    setUserAnswers("");
    setAnswerKey("");
    setLabel("");
    setAllQuestionTopics({}); // Clear topics for the next test
    
    console.log('DEBUG TestEntryForm: About to dispatch dataUpdate event');
    window.dispatchEvent(new CustomEvent('dataUpdate'));
    console.log('DEBUG TestEntryForm: dataUpdate event dispatched');
    
    // Dispatch coin update event
    console.log('DEBUG TestEntryForm: About to dispatch coinUpdate event');
    window.dispatchEvent(new CustomEvent('coinUpdate'));
    console.log('DEBUG TestEntryForm: coinUpdate event dispatched');
    
    // Add a small delay and then verify the data is still there
    setTimeout(() => {
      const finalVerification = localStorage.getItem("scores");
      console.log('DEBUG TestEntryForm: Final verification after events - localStorage "scores":', finalVerification);
      if (finalVerification) {
        const finalParsed = JSON.parse(finalVerification);
        console.log('DEBUG TestEntryForm: Final verification - Data length:', finalParsed.length);
      }
    }, 100);
    } catch (error) {
      console.error('ERROR in handleSaveAllTopics:', error);
      setIsGrading(false);
      toast({
        title: "Error Grading Test",
        description: "An error occurred while grading your test. Please try again.",
        variant: "destructive",
      });
    }
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
            disabled={userAnswers.length !== 25 || answerKey.length !== 25 || isGrading}
          >
            {isGrading ? (
              <>
                <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Grading...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Grade Test
              </>
            )}
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

    {/* Achievement Popup */}
    <AchievementPopup
      achievements={newAchievements}
      visible={showAchievementPopup}
      onClose={() => setShowAchievementPopup(false)}
    />
    </section>
  );
};
