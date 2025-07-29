import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface PracticeGeneratorFormProps {
  onGenerate: (competition: string, questionNumber: number) => void;
  isLoading: boolean;
}

import { useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';

// Remove hardcoded competitions array.
const questionNumbers = Array.from({ length: 25 }, (_, i) => i + 1);

export const PracticeGeneratorForm: React.FC<PracticeGeneratorFormProps> = ({ onGenerate, isLoading }) => {
  const [competition, setCompetition] = useState<string>('');
  const [questionNumber, setQuestionNumber] = useState<number | null>(null);
  const [competitions, setCompetitions] = useState<string[]>([]);
  const [loadingCompetitions, setLoadingCompetitions] = useState<boolean>(true);
  const [competitionError, setCompetitionError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompetitions = async () => {
      setLoadingCompetitions(true);
      setCompetitionError(null);
      const { data, error } = await supabase
        .from('tests')
        .select('competition')
        .neq('competition', null);
      if (error) {
        setCompetitionError('Failed to load competitions.');
        setCompetitions([]);
      } else if (data) {
        // Extract base types (e.g. 'AMC 10' from '2021_AMC_10A', 'AHSME' from '1950_AHSME', etc.)
        const allowedTypes = ['AMC 8', 'AMC 10', 'AMC 12', 'AHSME'];
        const baseTypes = Array.from(new Set(
          data.map((d: any) => {
            let comp = d.competition.replace(/^\d{4}[_\s]*/, '').toUpperCase();
            comp = comp.replace(/[_\s]*[AB]$/i, '');
            comp = comp.replace(/_/g, ' ');
            if (comp.startsWith('AMC 8')) return 'AMC 8';
            if (comp.startsWith('AMC 10')) return 'AMC 10';
            if (comp.startsWith('AMC 12')) return 'AMC 12';
            if (comp.startsWith('AHSME')) return 'AHSME';
            return null;
          }).filter(Boolean)
        )).filter(t => allowedTypes.includes(t)).sort();
        setCompetitions(baseTypes);
      }
      setLoadingCompetitions(false);
    };
    fetchCompetitions();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (competition && questionNumber) {
      onGenerate(competition, questionNumber);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <CardHeader>
        <CardTitle>Create a Custom Practice Set</CardTitle>
        <CardDescription>Select a competition and a question number to generate a 25-question practice test.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="competition-select" className="block text-sm font-medium text-muted-foreground mb-2">Competition</label>
            <Select onValueChange={setCompetition} value={competition} disabled={loadingCompetitions || !!competitionError}>
              <SelectTrigger id="competition-select">
                <SelectValue placeholder={loadingCompetitions ? 'Loading...' : (competitionError ? 'Error loading competitions' : 'Select...')} />
              </SelectTrigger>
              <SelectContent>
                {competitionError ? (
                  <div className="p-2 text-red-500">{competitionError}</div>
                ) : (
                  competitions.map(comp => (
                    <SelectItem key={comp} value={comp}>{comp}</SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label htmlFor="question-number-select" className="block text-sm font-medium text-muted-foreground mb-2">Question Number</label>
            <Select onValueChange={(val) => setQuestionNumber(parseInt(val, 10))} value={questionNumber?.toString() || ''}>
              <SelectTrigger id="question-number-select">
                <SelectValue placeholder="Select..." />
              </SelectTrigger>
              <SelectContent>
                {questionNumbers.map(num => (
                  <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <Button type="submit" className="w-full" disabled={!competition || !questionNumber || isLoading}>
          {isLoading ? 'Generating...' : 'Generate Practice Test'}
        </Button>
      </CardContent>
    </form>
  );
};
