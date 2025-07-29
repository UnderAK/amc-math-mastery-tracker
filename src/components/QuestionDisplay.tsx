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
  questions: Question[];
}

export const QuestionDisplay: React.FC<QuestionDisplayProps> = ({ questions }) => {

  return (
    <div className="mt-6 space-y-6">
      {questions.map((question) => (
        <div key={question.id} className="glass p-6 rounded-2xl shadow-lg animate-fade-in-up">
          <p className="font-bold text-primary mb-3">Question {question.question_number}</p>
          <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: question.problem_html.replace(/^<p>|<\/p>$/g, '') }} />
        </div>
      ))}
    </div>
  );
};
