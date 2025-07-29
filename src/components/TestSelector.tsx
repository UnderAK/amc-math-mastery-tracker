import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from 'lucide-react';

interface DbTest {
  id: string;
  name: string;
  competition: string;
  year: number;
}

interface TestSelectorProps {
  onTestSelect: (test: DbTest | null) => void;
}

export const TestSelector: React.FC<TestSelectorProps> = ({ onTestSelect }) => {
  const [tests, setTests] = useState<DbTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTests = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('tests')
          .select('id, name, competition, year')
          .order('competition', { ascending: true })
          .order('year', { ascending: false });

        if (error) {
          throw error;
        }

        if (data) {
          setTests(data);
        }
      } catch (err: any) {
        setError('Failed to load tests. Please try again later.');
        console.error("Error fetching tests:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTests();
  }, []);

  return (
    <div>
      <h2 className="text-xl font-semibold text-primary mb-3">Select a Test</h2>
      
      {loading && (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Loading tests...</span>
        </div>
      )}

      {error && <p className="text-destructive">{error}</p>}

      {!loading && !error && (
                <Select onValueChange={(value) => {
          const selectedTest = tests.find(t => t.id === value);
          onTestSelect(selectedTest || null);
        }}>

          <SelectTrigger aria-label="Select a test to practice">
            <SelectValue placeholder="Choose a test..." />
          </SelectTrigger>
          <SelectContent>
            {tests.map(test => (
              <SelectItem key={test.id} value={test.id}>
                {test.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
};
