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
    <section className="glass p-6 rounded-2xl shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-primary flex items-center gap-2">
          <span className="text-2xl">📝</span>
          Practice History
        </h2>
        <Button variant="destructive" size="sm" onClick={clearHistory}>Clear History</Button>
      </div>
      {history.length > 0 ? (
        <div className="max-h-64 overflow-y-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-secondary/50 sticky top-0">
              <tr>
                <th className="px-4 py-3 text-left font-medium">Test</th>
                <th className="px-4 py-3 text-left font-medium">Score</th>
                <th className="px-4 py-3 text-left font-medium">Percent</th>
                <th className="px-4 py-3 text-left font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {history.map((item, index) => {
                const totalQuestions = 25;
                const percent = Math.round((item.score / totalQuestions) * 100);
                const getScoreColor = (score: number) => {
                  if (score >= 23) return "text-green-600 font-semibold";
                  if (score >= 20) return "text-blue-600 font-medium";
                  if (score >= 15) return "text-yellow-600";
                  return "text-red-600";
                };
                return (
                  <tr key={index} className="border-b last:border-none hover:bg-muted/50 transition-colors">
                    <td className="px-4 py-3 text-muted-foreground">{item.testName}</td>
                    <td className={`px-4 py-3 ${getScoreColor(item.score)}`}>{item.score} / {totalQuestions}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className={getScoreColor(item.score)}>{percent}%</span>
                        <div className="w-16 h-2 bg-secondary rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-500 ${
                              percent >= 90 ? 'bg-green-500' :
                              percent >= 75 ? 'bg-blue-500' :
                              percent >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{new Date(item.date).toLocaleDateString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-4xl mb-3">📭</div>
          <p className="text-muted-foreground">No practice history found. Take a test to see your results here!</p>
        </div>
      )}
    </section>
  );
}
