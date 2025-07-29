import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface PracticeScore {
  testName: string;
  score: number;
  date: string;
}

export const PracticeHistory: React.FC = () => {
  const [history, setHistory] = useState<PracticeScore[]>([]);

  useEffect(() => {
    const storedScores = localStorage.getItem('practiceScores');
    if (storedScores) {
      setHistory(JSON.parse(storedScores));
    }
  }, []);

  const clearHistory = () => {
    localStorage.removeItem('practiceScores');
    setHistory([]);
  };

  return (
    <Card className="glass mt-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Practice History</CardTitle>
        <Button variant="destructive" size="sm" onClick={clearHistory}>Clear History</Button>
      </CardHeader>
      <CardContent>
        {history.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Test</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{item.testName}</TableCell>
                  <TableCell>{item.score}</TableCell>
                  <TableCell>{new Date(item.date).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p>No practice history found. Take a test to see your results here!</p>
        )}
      </CardContent>
    </Card>
  );
};
