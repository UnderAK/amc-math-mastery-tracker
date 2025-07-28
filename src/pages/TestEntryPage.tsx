import { useState } from "react";
import { ArrowLeft, Type, ListChecks } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { TestEntryForm } from "@/components/TestEntryForm";
import { TestHistoryTable } from "@/components/TestHistoryTable";
import { InputMode } from "@/components/inputs/AnswerInput";

const TestEntryPage = () => {
  const navigate = useNavigate();
  const [inputMode, setInputMode] = useState<InputMode>('typing');

  return (
    <div className="min-h-screen bg-background text-foreground p-4 sm:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <header className="glass p-6 rounded-3xl shadow-xl">
          <div className="flex items-center justify-between gap-4">
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
            <div className="flex items-center gap-2 p-1 bg-muted rounded-lg">
              <Button
                variant={inputMode === 'typing' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setInputMode('typing')}
                className="gap-2"
              >
                <Type className="w-4 h-4" />
                Typing
              </Button>
              <Button
                variant={inputMode === 'mcq' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setInputMode('mcq')}
                className="gap-2"
              >
                <ListChecks className="w-4 h-4" />
                MCQ
              </Button>
            </div>
          </div>
        </header>

        {/* Test Entry Form and History */}
        <main className="space-y-6">
          <div>
            <TestEntryForm inputMode={inputMode} />
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