import { useState } from "react";
import { ArrowLeft, BarChart3, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { GamificationPanel } from "@/components/GamificationPanel";
import { StatsPanel } from "@/components/StatsPanel";
import { BadgesPanel } from "@/components/BadgesPanel";
import { ScoreChart } from "@/components/ScoreChart";
import { QuestionAccuracyTable } from "@/components/QuestionAccuracyTable";
import { TestHistoryTable } from "@/components/TestHistoryTable";
import { TopicBreakdown } from "@/components/TopicBreakdown";
import { WeaknessReport } from "@/components/WeaknessReport";
import { AdvancedFeatures } from "@/components/AdvancedFeatures";

const Analytics = () => {
  const navigate = useNavigate();
  // Separate state for exam filter and chart mode
  const [examFilter, setExamFilter] = useState("combined");
  const [chartMode, setChartMode] = useState("combined");

  // Defensive localStorage access
  let xp = 0;
  try {
    xp = parseInt(localStorage.getItem("xp") || "0");
  } catch (e) {
    xp = 0;
  }
  const userLevel = Math.floor(xp / 250) + 1;

  // Function to clear all local storage data
  const handleResetData = () => {
    if (window.confirm("Are you sure you want to reset all your progress data? This action cannot be undone.")) {
      localStorage.clear();
      window.dispatchEvent(new CustomEvent('dataUpdate'));
      console.log("All data reset.");
    }
  };


  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <header className="glass p-6 rounded-3xl shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/')}
                className="hover-scale"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Tests
              </Button>
              <div>
                <h1 className="text-3xl font-bold gradient-primary bg-clip-text text-transparent tracking-tight">
                  📊 Analytics Dashboard
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Detailed insights into your AMC performance
                </p>
              </div>
            </div>
            {/* AMC Toggle */}
            <div className="flex items-center gap-2">
              <label htmlFor="exam-filter" className="font-medium text-sm">Exam:</label>
              <select
                id="exam-filter"
                className="border rounded-lg px-3 py-1 text-base focus:outline-none focus:ring-2 focus:ring-primary/40 bg-background"
                value={examFilter}
                onChange={e => setExamFilter(e.target.value)}
                aria-label="Exam Filter"
              >
                <option value="amc8">AMC 8</option>
                <option value="amc10">AMC 10</option>
                <option value="amc12">AMC 12</option>
                <option value="combined">All</option>
              </select>
            </div>
            {/* Reset Data Button - aligned with header */}
            <div className="flex items-center gap-2">
              <Button
                variant="destructive"
                size="sm"
                onClick={handleResetData}
                className="hover-scale"
              >
                <AlertCircle className="w-4 h-4 mr-2" />
                Reset All Data
              </Button>
            </div>
          </div>
        </header>

        {/* Analytics Content */}
        <main className="space-y-6">
          {/* Top Row - Core Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-full">
              <GamificationPanel />
            </div>
            <div className="h-full">
              <StatsPanel />
            </div>
          </div>

          {/* Badges Row */}
          <div>
            <BadgesPanel />
          </div>

          {/* Advanced Features for Level 10+ Users */}
          <AdvancedFeatures userLevel={userLevel} userXP={xp} />

          {/* Topic Performance and Weakness Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <TopicBreakdown />
            </div>
            <div>
              <WeaknessReport />
            </div>
          </div>

          {/* Test History */}
          <div>
            <TestHistoryTable />
          </div>

          {/* Score Progress Chart */}
          <div>
            <div className="glass p-6 rounded-2xl shadow-xl">
              <h2 className="text-xl font-semibold text-primary mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Score Progress Over Time
              </h2>
              <div className="mb-4 flex items-center gap-2">
                <label htmlFor="chart-mode" className="text-sm font-medium">Chart Mode:</label>
                <select 
                  id="chart-mode"
                  className="bg-secondary/30 border border-border rounded px-2 py-1 text-sm"
                  onChange={(e) => setChartMode(e.target.value)}
                  value={chartMode}
                  aria-label="Chart Mode"
                >
                  <option value="combined">Combined View</option>
                  <option value="separate">Separate Lines (AMC 8/10/12)</option>
                </select>
              </div>
              <ScoreChart showAllTestTypes={chartMode === 'separate'} examFilter={examFilter} />
            </div>
          </div>

          {/* Question Accuracy Analysis */}
          <div>
            <QuestionAccuracyTable />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Analytics;