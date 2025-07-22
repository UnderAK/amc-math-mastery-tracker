import { useState, useEffect } from "react";
import { BookOpen, Filter, Calendar, AlertCircle } from "lucide-react";
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

  useEffect(() => {
    const updateScores = () => {
      console.log('DEBUG TestHistoryTable: updateScores called');
      const savedScores: TestScore[] = JSON.parse(localStorage.getItem("scores") || "[]");
      console.log('DEBUG TestHistoryTable: Retrieved scores from localStorage:', savedScores);
      console.log('DEBUG TestHistoryTable: Number of scores:', savedScores.length);
      setScores(savedScores);
      console.log('DEBUG TestHistoryTable: State updated with scores');
    };

    console.log('DEBUG TestHistoryTable: Component mounted, calling initial updateScores');
    updateScores();

    // Listen for data updates
    const handleDataUpdate = () => {
      console.log('DEBUG TestHistoryTable: dataUpdate event received!');
      updateScores();
    };
    
    console.log('DEBUG TestHistoryTable: Adding dataUpdate event listener');
    window.addEventListener('dataUpdate', handleDataUpdate);

    return () => {
      console.log('DEBUG TestHistoryTable: Removing dataUpdate event listener');
      window.removeEventListener('dataUpdate', handleDataUpdate);
    };
  }, []);

  const uniqueLabels = [...new Set(scores.filter(s => s.label).map(s => s.label))];
  
  const filteredScores = scores.filter(s => {
    const typeMatch = filterType === "all" || s.testType === filterType;
    const labelMatch = filterLabel === "all" || s.label === filterLabel || (filterLabel === "unlabeled" && !s.label);
    return typeMatch && labelMatch;
  });

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
    <section className="glass p-6 rounded-2xl shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-primary flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          Past Tests
        </h2>
        
        <div className="text-sm text-muted-foreground">
          Filtered by: {filterType === "all" ? "All Tests" : `AMC ${filterType}`}
          
          <Select value={filterLabel} onValueChange={setFilterLabel}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Labels</SelectItem>
              <SelectItem value="unlabeled">Unlabeled</SelectItem>
              {uniqueLabels.map(label => (
                <SelectItem key={label} value={label || ""}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <TooltipProvider>
        <div className="max-h-64 overflow-y-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead className="bg-secondary/50 sticky top-0">
              <tr>
                <th className="px-4 py-3 text-left font-medium">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Date
                  </div>
                </th>
                <th className="px-4 py-3 text-left font-medium">Score</th>
                <th className="px-4 py-3 text-left font-medium">Percent</th>
                <th className="px-4 py-3 text-left font-medium">Test Type</th>
                <th className="px-4 py-3 text-left font-medium">Year</th>
                <th className="px-4 py-3 text-left font-medium">Label</th>
                <th className="px-4 py-3 text-left font-medium">Mistakes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredScores.map((test, index) => {
                const percent = Math.round((test.score / 25) * 100);
                const getScoreColor = (score: number) => {
                  if (score >= 23) return "text-green-600 font-semibold";
                  if (score >= 20) return "text-blue-600 font-medium";
                  if (score >= 15) return "text-yellow-600";
                  return "text-red-600";
                };

                // Calculate incorrect questions from either legacy format or questionCorrectness
                let incorrectQuestions: number[] = [];
                
                if (test.incorrectQuestions && test.incorrectQuestions.length > 0) {
                  // Use legacy format if available
                  incorrectQuestions = test.incorrectQuestions;
                } else if (test.questionCorrectness) {
                  // Extract incorrect questions from questionCorrectness object
                  incorrectQuestions = Object.entries(test.questionCorrectness)
                    .filter(([_, isCorrect]) => !isCorrect)
                    .map(([questionNum, _]) => parseInt(questionNum))
                    .sort((a, b) => a - b);
                }
                
                const incorrectCount = incorrectQuestions.length || (25 - test.score);

                return (
                  <tr 
                    key={index} 
                    className="hover:bg-secondary/30 transition-colors fade-in-up"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <td className="px-4 py-3">{test.date}</td>
                    <td className={`px-4 py-3 ${getScoreColor(test.score)}`}>
                      {test.score} / 25
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className={getScoreColor(test.score)}>{percent}%</span>
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
                      {incorrectCount > 0 ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button className="flex items-center gap-1 text-red-500 hover:text-red-600 transition-colors">
                              <AlertCircle className="w-4 h-4" />
                              <span className="text-sm font-medium">{incorrectCount}</span>
                            </button>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <div className="text-center">
                              <div className="font-medium mb-2">Missed Questions:</div>
                              <div className="grid grid-cols-5 gap-1 text-xs">
                                {incorrectQuestions.length > 0 ? (
                                  incorrectQuestions.map((q) => (
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