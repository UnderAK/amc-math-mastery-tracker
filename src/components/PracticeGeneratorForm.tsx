import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface PracticeGeneratorFormProps {
  onGenerate: (competition: string, questionNumber: number) => void;
  isLoading: boolean;
}

const competitions = ['AMC 8', 'AMC 10', 'AMC 12', 'AHSME'];
const questionNumbers = Array.from({ length: 25 }, (_, i) => i + 1);

export const PracticeGeneratorForm: React.FC<PracticeGeneratorFormProps> = ({ onGenerate, isLoading }) => {
  const [competition, setCompetition] = useState<string>('');
  const [questionNumber, setQuestionNumber] = useState<number | null>(null);

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
            <Select onValueChange={setCompetition} value={competition}>
              <SelectTrigger id="competition-select">
                <SelectValue placeholder="Select..." />
              </SelectTrigger>
              <SelectContent>
                {competitions.map(comp => (
                  <SelectItem key={comp} value={comp}>{comp}</SelectItem>
                ))}
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
