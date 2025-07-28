import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { TestHistoryTable } from "@/components/TestHistoryTable";

const History = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <header className="glass p-6 rounded-3xl shadow-xl">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/')}
              className="hover-scale"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
            <div>
              <h1 className="text-3xl font-bold gradient-primary bg-clip-text text-transparent tracking-tight">
                📜 Test History
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Review your past test results and performance.
              </p>
            </div>
          </div>
        </header>

        <main>
          <TestHistoryTable />
        </main>
      </div>
    </div>
  );
};

export default History;
