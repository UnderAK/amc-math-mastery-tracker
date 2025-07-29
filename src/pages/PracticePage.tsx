import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { TestSelector } from '@/components/TestSelector';
import { QuestionDisplay } from '@/components/QuestionDisplay';
import { AnswerSheet } from '@/components/AnswerSheet';
import { PracticeHistory } from '@/components/PracticeHistory';
import { useToast } from '@/hooks/use-toast';

// Define the Question type here to be used in state
interface Question {
  id: string;
  question_number: number;
  problem_html: string;
  answer: string;
}

// Define the DbTest type to match the one in TestSelector
interface DbTest {
  id: string;
  name: string;
  competition: string;
  year: number;
}

const PracticePage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedTest, setSelectedTest] = useState<DbTest | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [userAnswers, setUserAnswers] = useState<string[]>([]);
  const [score, setScore] = useState<number | null>(null);
  const [isGraded, setIsGraded] = useState(false);

  const handleQuestionsFetched = (fetchedQuestions: Question[]) => {
    setQuestions(fetchedQuestions);
    setUserAnswers(Array(fetchedQuestions.length).fill(''));
    setScore(null);
    setIsGraded(false);
  };

  const handleGradeTest = () => {
    if (!selectedTest) return;

    const correctAnswers = questions.map(q => q.answer);
    let correctCount = 0;
    userAnswers.forEach((answer, index) => {
      if (answer.toUpperCase() === correctAnswers[index]?.toUpperCase()) {
        correctCount++;
      }
    });

    const blankCount = userAnswers.filter(a => a === '').length;
    const incorrectCount = questions.length - correctCount - blankCount;
    const finalScore = (correctCount * 6) + (blankCount * 1.5);
    setScore(finalScore);
    setIsGraded(true);

    const practiceScore = {
      testId: selectedTest.id,
      testName: selectedTest.name,
      score: finalScore,
      date: new Date().toISOString(),
      userAnswers,
      correctAnswers: correctAnswers.map(a => a.toUpperCase()),
    };

    const existingScores = JSON.parse(localStorage.getItem('practiceScores') || '[]');
    const updatedScores = [...existingScores, practiceScore];
    localStorage.setItem('practiceScores', JSON.stringify(updatedScores));

    toast({
      title: "Test Graded!",
      description: `Your score is ${finalScore}. Correct: ${correctCount}, Blank: ${blankCount}, Incorrect: ${incorrectCount}. Score saved.`,
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <header className="glass p-6 rounded-3xl shadow-xl">
          <div className="flex items-center justify-between gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/')}
              className="hover-scale"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
            <div>
              <h1 className="text-3xl font-bold gradient-primary bg-clip-text text-transparent tracking-tight">
                🧠 Practice a Test
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Select a test and start practicing to hone your skills.
              </p>
            </div>
            <div /> {/* Empty div for spacing */}
          </div>
        </header>

        {/* Practice Area */}
        <main className="space-y-6">
          <div className="glass p-6 rounded-3xl shadow-xl">
            <TestSelector onTestSelect={setSelectedTest} />
            {selectedTest && (
              <QuestionDisplay 
                testId={selectedTest.id} 
                onQuestionsFetched={handleQuestionsFetched} 
              />
            )}
            {questions.length > 0 && (
              <>
                <AnswerSheet 
                  numQuestions={questions.length} 
                  onAnswersChange={setUserAnswers} 
                />
                <Button className="mt-6 w-full" onClick={handleGradeTest} disabled={isGraded}>
                  {isGraded ? `Your Score: ${score}` : 'Grade Test'}
                </Button>
              </>
            )}
          </div>
        </main>
        <PracticeHistory />
      </div>
    </div>
  );
};

export default PracticePage;
