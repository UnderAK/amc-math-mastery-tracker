import { useState, useEffect, useMemo, useCallback } from "react";
import { useScoringMode } from '@/context/SettingsContext';
import { getCorrectCount, getTotalQuestions, getMaxPoints } from '@/lib/scoring';
import { BookOpen, Filter, Calendar, AlertCircle } from "lucide-react";
import { format } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { TestScore } from "@/types/TestScore";

// TestScore interface is now imported from shared types

interface TestHistoryTableProps {
  filterType?: string;
}

export const TestHistoryTable = ({ filterType = "all" }: TestHistoryTableProps) => {
  const [scores, setScores] = useState<TestScore[]>([]);
  const [filterLabel, setFilterLabel] = useState("all");
  const { scoringMode } = useScoringMode();

  const updateScores = useCallback(() => {
    const savedScores: Omit<TestScore, 'id'>[] = JSON.parse(localStorage.getItem("scores") || "[]");
    const scoresWithIds = savedScores.map((score, index) => ({...score, id: `${score.date}-${index}`}));
    setScores(scoresWithIds);
  }, []);

  useEffect(() => {
    updateScores();
    window.addEventListener('dataUpdate', updateScores);
    return () => {
      window.removeEventListener('dataUpdate', updateScores);
    };
  }, [updateScores]);

  const uniqueLabels = useMemo(() => 
    [...new Set(scores.filter(s => s.label).map(s => s.label))]
  , [scores]);
  
  const filteredScores = useMemo(() => 
    scores.filter(s => {
      const typeMatch = filterType === "all" || s.testType === filterType;
      const labelMatch = filterLabel === "all" || s.label === filterLabel || (filterLabel === "unlabeled" && !s.label);
      return typeMatch && labelMatch;
    })
  , [scores, filterType, filterLabel]);

  const getScoreColor = (score: number, mode: 'points' | 'questions') => {
    const threshold = mode === 'points' ? 150 : 25;
    if (score / threshold >= 0.9) return "text-green-600 font-semibold";
    if (score / threshold >= 0.8) return "text-blue-600 font-medium";
    if (score / threshold >= 0.6) return "text-yellow-600";
    return "text-red-600";
  };

  if (scores.length === 0) {
    return (
      <section className="glass p-6 rounded-2xl shadow-xl">
        <h2 className="text-xl font-semibold text-primary mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          Past Tests
        </h2>
        <div className="text-center py-12">
          <div className="text-4xl mb-3">📭</div>
          <p className="text-muted-foreground">No tests yet — start solving!</p>
          <p className="text-sm text-muted-foreground mt-1">Your test history will appear here.</p>
        </div>
      </section>
    );
  }
  
  return (
    <section className="glass p-6 rounded-2xl shadow-xl bg-pink-50/50">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-primary flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          Past Tests
        </h2>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <Select value={filterLabel} onValueChange={setFilterLabel}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Labels</SelectItem>
              <SelectItem value="unlabeled">Unlabeled</SelectItem>
              {uniqueLabels.map(label => (
                <SelectItem key={label} value={label}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <TooltipProvider>
        <div className="overflow-x-auto rounded-lg border">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-secondary/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Date</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Score</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Percentage</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Type</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Year</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Label</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Missed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredScores.map((test) => {
                const correctCount = getCorrectCount((test.input || "").split(''), (test.key || "").split(''));
                const totalQuestions = getTotalQuestions(test.testType);
                const maxPoints = getMaxPoints(test.testType);
                const score = test.score;
                
                const percent = scoringMode === 'questions'
                  ? totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0
                  : maxPoints > 0 ? Math.round((score / maxPoints) * 100) : 0;

                const displayScore = scoringMode === 'questions' ? correctCount : score;
                const displayTotal = scoringMode === 'questions' ? totalQuestions : maxPoints;

                return (
                  <tr key={test.id} className="hover:bg-secondary/30 transition-colors">
                    <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">
                      {format(new Date(test.date), 'MMM d, yyyy')}
                    </td>
                    <td className={`px-4 py-3 text-sm font-medium ${getScoreColor(displayScore, scoringMode)}`}>
                      {displayScore} / {displayTotal}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex items-center gap-2">
                        <span className={getScoreColor(displayScore, scoringMode)}>{percent}%</span>
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
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                        {test.testType.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{test.year}</td>
                    <td className="px-4 py-3">
                      {test.label ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                          {test.label}
                        </span>
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {correctCount < totalQuestions ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button className="flex items-center gap-1 text-red-500 hover:text-red-600 transition-colors" aria-label="Show missed questions">
                              <AlertCircle className="w-4 h-4" />
                              <span className="text-sm font-medium">{totalQuestions - correctCount}</span>
                            </button>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <div className="text-center">
                              <div className="font-medium mb-2">Missed Questions:</div>
                              <div className="grid grid-cols-5 gap-1 text-xs">
                                {test.incorrectQuestions && test.incorrectQuestions.length > 0 ? (
                                  test.incorrectQuestions.map((q) => (
                                    <span key={q} className="bg-red-100 text-red-800 px-1 py-0.5 rounded">
                                      {q}
                                    </span>
                                  ))
                                ) : (
                                  <span className="col-span-5 text-muted-foreground">
                                    Question details not available
                                  </span>
                                )}
                              </div>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      ) : (
                        <span className="text-green-500 font-medium">Perfect!</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </TooltipProvider>

      {filteredScores.length === 0 && (filterType !== "all" || filterLabel !== "all") && (
        <div className="text-center py-8 text-muted-foreground">
          <p>No tests found matching the selected filters</p>
        </div>
      )}
    </section>
  );
};