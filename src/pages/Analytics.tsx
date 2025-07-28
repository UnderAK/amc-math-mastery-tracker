import { useState } from "react";
import { ArrowLeft, BarChart3, AlertCircle, Filter } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  const [globalFilter, setGlobalFilter] = useState("all");

  // Function to clear all local storage data
  const handleResetData = () => {
    localStorage.clear();
    window.dispatchEvent(new CustomEvent('dataUpdate'));
    // Optionally, you can add a toast notification here to confirm the reset
  };


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
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
              
              <div>
                <h1 className="text-3xl font-bold gradient-primary bg-clip-text text-transparent tracking-tight">
                  Analytics Dashboard
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Detailed insights into your AMC performance
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Global Filter Toggle */}
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-muted-foreground" />
                <Select value={globalFilter} onValueChange={setGlobalFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All AMCs</SelectItem>
                    <SelectItem value="amc8">AMC 8</SelectItem>
                    <SelectItem value="amc10">AMC 10</SelectItem>
                    <SelectItem value="amc12">AMC 12</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Reset Data Button */}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    Reset All Data
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete all your test history, progress, and badges.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleResetData}>Continue</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
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
              <TopicBreakdown key={`topic-${globalFilter}`} filterType={globalFilter} />
            </div>
            <div>
              <WeaknessReport key={`weakness-${globalFilter}`} filterType={globalFilter} />
            </div>
          </div>

          {/* Test History */}
          <div>
            <TestHistoryTable key={`history-${globalFilter}`} filterType={globalFilter} />
          </div>

          {/* Score Progress Chart */}
          <div>
            <div className="glass p-6 rounded-2xl shadow-xl">
              <h2 className="text-xl font-semibold text-primary mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Score Progress Over Time
              </h2>
              <ScoreChart key={`score-chart-${globalFilter}`} filterType={globalFilter} />
            </div>
          </div>

          {/* Question Accuracy Analysis */}
          <div>
            <QuestionAccuracyTable key={`accuracy-${globalFilter}`} filterType={globalFilter} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Analytics;