import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Loader2 } from 'lucide-react';

interface Question {
  id: string;
  question_number: number;
  problem_html: string;
  answer: string;
}

interface QuestionDisplayProps {
  testId: string;
  onQuestionsFetched: (questions: Question[]) => void;
}

export const QuestionDisplay: React.FC<QuestionDisplayProps> = ({ testId, onQuestionsFetched }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!testId) return;

    const fetchQuestions = async () => {
      try {
        setLoading(true);
        setError(null);
        const { data, error } = await supabase
          .from('questions')
          .select('id, question_number, problem_html, answer')
          .eq('test_id', testId)
          .order('question_number', { ascending: true });

        if (error) {
          throw error;
        }

        if (data) {
          setQuestions(data);
          onQuestionsFetched(data);
        }
      } catch (err: any) {
        setError('Failed to load questions. Please try again.');
        console.error("Error fetching questions:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [testId, onQuestionsFetched]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground mt-6">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span>Loading questions...</span>
      </div>
    );
  }

  if (error) {
    return <p className="text-destructive mt-6">{error}</p>;
  }

  return (
    <div className="mt-6 space-y-6">
      {questions.map((question) => (
        <div key={question.id} className="glass p-6 rounded-2xl shadow-lg animate-fade-in-up">
          <p className="font-bold text-primary mb-3">Question {question.question_number}</p>
          <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: question.problem_html }} />
        </div>
      ))}
    </div>
  );
};
