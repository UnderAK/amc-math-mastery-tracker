import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { PracticeGeneratorForm } from '@/components/PracticeGeneratorForm';
import { AnswerSheet } from '@/components/AnswerSheet';
import { QuestionDisplay } from '@/components/QuestionDisplay';
import { supabase } from '@/lib/supabaseClient';

import { PracticeHistory } from '@/components/PracticeHistory';
import { useToast } from '@/hooks/use-toast';

// Define the Question type here to be used in state
interface Question {
  id: string;
  question_number: number;
  problem_html: string;
  answer: string;
}



const PracticePage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [userAnswers, setUserAnswers] = useState<string[]>([]);
  const [practiceParams, setPracticeParams] = useState<{competition: string, questionNumber: number} | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  
  const [score, setScore] = useState<number | null>(null);
  const [isGraded, setIsGraded] = useState(false);

  const handleGradeTest = () => {
    if (!practiceParams) return;

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
      testName: `Practice: ${practiceParams.competition} #${practiceParams.questionNumber}s`,
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
      description: `Your score is ${finalScore}. Correct: ${correctCount}, Blank: ${blankCount}, Incorrect: ${incorrectCount}.`,
    });
  };

  const handleGenerate = async (competitionType: string, questionNumber: number) => {
    setIsLoading(true);
    setQuestions([]);
    setUserAnswers([]);
    setPracticeParams({ competition: competitionType, questionNumber });
    setScore(null);
    setIsGraded(false);

    try {
      // Get all competitions of the selected type (e.g., AMC 10 => AMC 10A, AMC 10B)
      const { data: compData, error: compError } = await supabase
        .from('tests')
        .select('competition, name')
        .neq('competition', null);
      if (compError) throw compError;
      if (!compData || compData.length === 0) {
        toast({
          title: 'No Competitions Found',
          description: `No competitions found for ${competitionType}.`,
          variant: 'destructive',
        });
        return;
      }
      // Filter competitions by type (e.g. AMC 10 matches AMC 10A, AMC 10B)
      // New: AMC 8 matches both AMC 8 and AHSME; AMC 10/12 match any test name containing that string
      const normalizedType = competitionType.replace(/\s/g, '').toUpperCase();
      const matchingCompetitions = Array.from(new Set(compData.filter((d: any) => {
        const comp = d.competition?.replace(/^\d{4}[_\s]*/, '').toUpperCase() || '';
        const name = d.name?.replace(/^\d{4}[_\s]*/, '').toUpperCase() || '';
        if (normalizedType === 'AMC8') {
          return comp.includes('AMC8') || comp.includes('AHSME') || name.includes('AMC8') || name.includes('AHSME');
        } else if (normalizedType === 'AMC10') {
          return comp.includes('AMC10') || name.includes('AMC10');
        } else if (normalizedType === 'AMC12') {
          return comp.includes('AMC12') || name.includes('AMC12');
        }
        return comp.includes(normalizedType) || name.includes(normalizedType);
      }).map((d: any) => d.competition)));

      if (matchingCompetitions.length === 0) {
        toast({
          title: 'No Competitions Found',
          description: `No competitions found for ${competitionType}.`,
          variant: 'destructive',
        });
        return;
      }
      // Get all test IDs for the matching competitions
      const { data: testData, error: testError } = await supabase
        .from('tests')
        .select('id')
        .in('competition', matchingCompetitions);
      if (testError) throw testError;
      if (!testData || testData.length === 0) {
        toast({
          title: 'No Tests Found',
          description: `No tests found for ${competitionType}.`,
          variant: 'destructive',
        });
        return;
      }
      const testIds = testData.map(test => test.id);
      // Get all questions for the selected question number from those tests
      const { data: questionData, error: questionError } = await supabase
        .from('questions')
        .select('id, question_number, problem_html, answer')
        .eq('question_number', questionNumber)
        .in('test_id', testIds)
        .order('id');
      if (questionError) throw questionError;
      if (questionData && questionData.length > 0) {
        let fetchedQuestions = questionData as Question[];
        // Shuffle and pick up to 25 questions
        for (let i = fetchedQuestions.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [fetchedQuestions[i], fetchedQuestions[j]] = [fetchedQuestions[j], fetchedQuestions[i]];
        }
        const selectedQuestions = fetchedQuestions.slice(0, 25).map((q, i) => ({ ...q, question_number: i + 1 }));
        setQuestions(selectedQuestions);
        setUserAnswers(Array(selectedQuestions.length).fill(''));
        toast({
          title: 'Practice Set Generated!',
          description: `Selected ${selectedQuestions.length} random questions for ${competitionType} #${questionNumber}.`,
        });
      } else {
        toast({
          title: 'No Questions Found',
          description: `Could not find any questions for ${competitionType} #${questionNumber}. Please try a different selection.`,
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      console.error('Error generating practice set:', error);
      toast({
        title: 'Error',
        description: 'An error occurred while generating the practice set. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
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
            <PracticeGeneratorForm onGenerate={handleGenerate} isLoading={isLoading} />
            {questions.length > 0 && (
              <div className="mt-6">
                <QuestionDisplay questions={questions} />
                <AnswerSheet 
                  numQuestions={questions.length} 
                  onAnswersChange={setUserAnswers} 
                />
                <Button className="mt-6 w-full" onClick={handleGradeTest} disabled={isGraded}>
                  {isGraded ? `Your Score: ${score}` : 'Grade Test'}
                </Button>
              </div>
            )}
          </div>
        </main>
        <PracticeHistory />
      </div>
    </div>
  );
};

export default PracticePage;
