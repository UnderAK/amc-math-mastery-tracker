import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { TestEntryForm } from "@/components/TestEntryForm";
import { TestHistoryTable } from "@/components/TestHistoryTable";

const TestEntryPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
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
                ✍️ Enter Test Score
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Add a new AMC test result to track your progress
              </p>
            </div>
          </div>
        </header>

        {/* Test Entry Form and History */}
        <main className="space-y-6">
          <div>
            <TestEntryForm />
          </div>

          {/* Test History Table */}
          <div>
            <TestHistoryTable />
          </div>
        </main>
      </div>
    </div>
  );
};

export default TestEntryPage;