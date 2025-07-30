import { useState, useEffect } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { BookOpen, CheckCircle } from "lucide-react";
import { AchievementPopup } from "@/components/AchievementPopup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { TopicInputPopup } from "@/components/TopicInputPopup";
import { AnswerInput, InputMode } from "@/components/inputs/AnswerInput";
import { useToast } from "@/hooks/use-toast";
import { useTestGrader } from '@/hooks/use-test-grader';
import { TestScore } from "@/types/TestScore";
import { TestType } from "@/types/amc";
import { NUM_QUESTIONS, TEST_TYPES, MIN_YEAR, MAX_YEAR } from "@/config/test-config";
import { TOPICS, Topic } from "@/lib/topics";
import { preloadedTests } from '@/data/tests';


const getTopicForQuestion = (): Topic => {
  return "Other";
};

interface TestEntryFormProps {
  inputMode: InputMode;
  initialAnswerKey?: string;
}

export const TestEntryForm = ({ inputMode, initialAnswerKey }: TestEntryFormProps) => {
  const [showAchievementPopup, setShowAchievementPopup] = useState(false);
  const [newAchievements, setNewAchievements] = useState<any[]>([]);
  const [savedTests, setSavedTests] = useState<TestScore[]>(() => {
    const saved = localStorage.getItem("scores");
    return saved ? JSON.parse(saved) : [];
  });
  const [testType, setTestType] = useState<TestType>("amc8");
  const [testYear, setTestYear] = useState(new Date().getFullYear().toString());
  const [userAnswers, setUserAnswers] = useState("");
  const [answerKey, setAnswerKey] = useState("");
  const [label, setLabel] = useState("");
  const [allQuestionTopics, setAllQuestionTopics] = useState<{ [key: number]: Topic }>({});
  const [isTopicInputForAllOpen, setIsTopicInputForAllOpen] = useState(false);
  const [isGrading, setIsGrading] = useState(false);
  const [result, setResult] = useState("");
  const [selectedTestId, setSelectedTestId] = useState<string>('manual');

  const { toast } = useToast();

  const debouncedUserAnswers = useDebounce(userAnswers, 300);
  const debouncedAnswerKey = useDebounce(answerKey, 300);

  const { gradeTest: performGrading } = useTestGrader({
    debouncedUserAnswers,
    debouncedAnswerKey,
    testType,
    testYear,
    allQuestionTopics,
    savedTests,
    setSavedTests,
    setNewAchievements,
    setShowAchievementPopup
  });

  useEffect(() => {
    if (initialAnswerKey) {
      setAnswerKey(initialAnswerKey);
    }
  }, [initialAnswerKey]);



  useEffect(() => {
    const initialTopics: { [key: number]: Topic } = {};
    for (let i = 1; i <= NUM_QUESTIONS; i++) {
      initialTopics[i] = getTopicForQuestion();
    }
    setAllQuestionTopics(initialTopics);
  }, []);

  const handlePreloadedTestSelect = (testId: string) => {
    setSelectedTestId(testId);
    const test = preloadedTests.find(t => t.id === testId);

    if (test) {
      setTestType(test.competition as TestType);
      setTestYear(test.year.toString());
      const newAnswerKey = test.questions.map(q => q.answer).join('');
      setAnswerKey(newAnswerKey);

      const newTopics = test.questions.reduce((acc: { [key: number]: Topic }, q) => {
        acc[q.questionNumber] = q.topic as Topic;
        return acc;
      }, {});
      setAllQuestionTopics(newTopics);
    } else {
      setAnswerKey('');
      setTestType('amc8');
      setTestYear(new Date().getFullYear().toString());
      const initialTopics: { [key: number]: Topic } = {};
      for (let i = 1; i <= NUM_QUESTIONS; i++) {
        initialTopics[i] = getTopicForQuestion();
      }
      setAllQuestionTopics(initialTopics);
    }
  };

  const getTooltipMessage = () => {
    if (isGrading) return "Grading is in progress...";
    if (debouncedUserAnswers.length !== NUM_QUESTIONS || debouncedAnswerKey.length !== NUM_QUESTIONS) return `Please enter ${NUM_QUESTIONS} answers for both fields.`;
    if (debouncedUserAnswers.length !== NUM_QUESTIONS) return `Your answers are incomplete (${debouncedUserAnswers.length}/${NUM_QUESTIONS}).`;
    if (debouncedAnswerKey.length !== NUM_QUESTIONS) return `The answer key is incomplete (${debouncedAnswerKey.length}/${NUM_QUESTIONS}).`;
    return "";
  };

  const gradeTest = () => {
    if (debouncedUserAnswers.length !== NUM_QUESTIONS || debouncedAnswerKey.length !== NUM_QUESTIONS) {
      toast({
        title: "Invalid Input",
        description: `User answers: ${debouncedUserAnswers.length}/25, Answer key: ${debouncedAnswerKey.length}/25 characters`,
        variant: "destructive",
      });
      return;
    }
    
    if (!testType || !testYear) {
      toast({
        title: "Missing Information",
        description: "Please select a test type and enter a year.",
        variant: "destructive",
      });
      return;
    }
    
    const year = parseInt(testYear);
    if (isNaN(year) || year < MIN_YEAR || year > MAX_YEAR) {
      toast({
        title: "Invalid Year",
        description: `Year must be between ${MIN_YEAR} and ${MAX_YEAR}`,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Starting Test Grading 📝",
      description: "Please assign topics to each question in the popup that will appear",
    });

    setIsTopicInputForAllOpen(true);
  };

  const handleSaveAllTopics = (topics: { [key: number]: Topic }) => {
    setAllQuestionTopics(topics);
    setIsTopicInputForAllOpen(false);
    setIsGrading(true);
    performGrading().then((result) => {
      setIsGrading(false);
      setResult(result);
    });
  };

  return (
    <section className="glass p-6 rounded-2xl shadow-xl hover-lift animate-slide-in-left">
      <h2 className="text-xl font-semibold text-primary mb-4 flex items-center gap-2">
        <BookOpen className="w-5 h-5 animate-float" />
        New Test Entry
      </h2>
      
      <div className="space-y-4">
        <Select value={selectedTestId} onValueChange={handlePreloadedTestSelect}>
          <SelectTrigger aria-label="Select preloaded test">
            <SelectValue placeholder="Select a preloaded test" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="manual">Manual Entry</SelectItem>
            {preloadedTests.map(test => (
              <SelectItem key={test.id} value={test.id}>{test.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="relative flex items-center">
          <div className="flex-grow border-t border-border/50"></div>
          <span className="flex-shrink mx-4 text-xs text-muted-foreground uppercase">Or Enter Manually</span>
          <div className="flex-grow border-t border-border/50"></div>
        </div>
        <Select value={testType} onValueChange={(value) => setTestType(value as TestType)} disabled={selectedTestId !== 'manual'}>
          <SelectTrigger aria-label="Select AMC test type">
            <SelectValue placeholder="Select test type" />
          </SelectTrigger>
          <SelectContent>
            {TEST_TYPES.map(type => (
              <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          type="number"
          min={MIN_YEAR}
          max={MAX_YEAR}
          value={testYear}
          onChange={(e) => setTestYear(e.target.value)}
          placeholder="Enter Year (e.g., 2025)"
          disabled={selectedTestId !== 'manual'}
        />

        <Input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Label (optional) - e.g., Practice Test, Competition, Review"
        />

        <AnswerInput
          mode={inputMode}
          userAnswers={userAnswers}
          answerKey={answerKey}
          onUserAnswersChange={setUserAnswers}
          onAnswerKeyChange={selectedTestId === 'manual' ? setAnswerKey : () => {}}
        />

        <div className="flex justify-end">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="inline-block">
                  <Button
                    onClick={gradeTest}
                    variant="gradient-primary" className="hover-bounce hover-glow animate-pulse-glow"
                    disabled={debouncedUserAnswers.length !== 25 || debouncedAnswerKey.length !== 25 || isGrading}
                    aria-label="Grade Test"
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
              </TooltipTrigger>
              {(debouncedUserAnswers.length !== 25 || debouncedAnswerKey.length !== 25 || isGrading) && (
                <TooltipContent>
                  <p>{getTooltipMessage()}</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        </div>

        {result && (
          <div className="mt-4 p-3 bg-accent/10 border border-accent/20 rounded-lg">
            <p className="text-sm font-medium text-accent">{result}</p>
          </div>
        )}
      </div>

      <TopicInputPopup
        isOpen={isTopicInputForAllOpen}
        onClose={() => setIsTopicInputForAllOpen(false)}
        questionsToTopic={Array.from({length: NUM_QUESTIONS}, (_, i) => i + 1)}
        initialTopics={allQuestionTopics}
        onSaveTopics={handleSaveAllTopics}
        topicOptions={[...TOPICS]}
      />

    <AchievementPopup
      achievements={newAchievements}
      visible={showAchievementPopup}
      onClose={() => setShowAchievementPopup(false)}
    />
    </section>
  );
};
