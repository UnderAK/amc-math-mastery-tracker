import { ArrowLeft, BarChart3 } from "lucide-react";
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

const Analytics = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <header className="glass p-6 rounded-3xl shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
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
              <ScoreChart />
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