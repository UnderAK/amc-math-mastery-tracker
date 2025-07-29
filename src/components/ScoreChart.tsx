import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useScoringMode } from '@/context/ScoringModeContext';
import { getCorrectCount, getTotalQuestions, getMaxPoints } from '@/lib/scoring';
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { TestScore } from "@/types/TestScore";

interface ScoreChartProps {
  filterType?: string;
}

export const ScoreChart = ({ filterType = "all" }: ScoreChartProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [allScores, setAllScores] = useState<TestScore[]>([]);

  const updateScores = useCallback(() => {
    const savedScores: TestScore[] = JSON.parse(localStorage.getItem("scores") || "[]");
    setAllScores(savedScores);
  }, []);

  useEffect(() => {
    updateScores();
    window.addEventListener('dataUpdate', updateScores);
    return () => {
      window.removeEventListener('dataUpdate', updateScores);
    };
  }, [updateScores]);

  const filteredScores = useMemo(() => {
    return filterType === "all"
      ? allScores
      : allScores.filter(s => s.testType === filterType);
  }, [allScores, filterType]);

  const scoresWithData = useMemo(() => {
    return filteredScores.map(s => {
      const totalQuestions = 
        (s.questionCorrectness && Object.keys(s.questionCorrectness).length > 0) 
        ? Object.keys(s.questionCorrectness).length 
        : (s.key && s.key.length > 0) ? s.key.length : 25;
      const percentage = totalQuestions > 0 ? (s.score / totalQuestions) * 100 : 0;
      return { ...s, totalQuestions, percentage };
    });
  }, [filteredScores]);

  const trend = useMemo(() => {
    if (scoresWithData.length < 2) return "stable";
    
    const recent = scoresWithData.slice(-5).map(s => s.percentage);
    const firstHalf = recent.slice(0, Math.ceil(recent.length / 2));
    const secondHalf = recent.slice(Math.floor(recent.length / 2));
    
    if (firstHalf.length > 0 && secondHalf.length > 0) {
      const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
      
      if (secondAvg > firstAvg + 2) return "up";
      if (secondAvg < firstAvg - 2) return "down";
    }
    return "stable";
  }, [scoresWithData]);

  useEffect(() => {
    drawChart(scoresWithData);
  }, [scoresWithData]);

  const drawChart = useCallback((data: (TestScore & { totalQuestions: number; percentage: number })[]) => {
    const canvas = canvasRef.current;
    if (!canvas || data.length === 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * window.devicePixelRatio;
    canvas.height = rect.height * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const width = rect.width;
    const height = rect.height;
    const padding = 40;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    if (data.length === 0) {
      // Draw placeholder
      ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--muted-foreground').trim();
      ctx.font = "14px Inter, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("No data yet", width / 2, height / 2);
      return;
    }

    // Get theme colors
    const isDark = document.documentElement.classList.contains('dark');
    const primaryColor = isDark ? '#60a5fa' : '#3b82f6';
    const gridColor = isDark ? '#334155' : '#e5e7eb';
    const textColor = isDark ? '#f8fafc' : '#1e293b';

    // Set up data
    const scores = data.map(d => d.percentage);
    const maxScore = 100;
    const minScore = 0;

    // Calculate positions
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;
    const stepX = chartWidth / Math.max(scores.length - 1, 1);

    // Draw grid lines
    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 1;
    ctx.setLineDash([2, 2]);

    // Horizontal grid lines
    for (let i = 0; i <= 5; i++) {
      const y = padding + (chartHeight * i) / 5;
      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(width - padding, y);
      ctx.stroke();

      // Y-axis labels
      ctx.fillStyle = textColor;
      ctx.font = "12px Inter, sans-serif";
      ctx.textAlign = "right";
      ctx.fillText(`${100 - (i * 20)}%`, padding - 10, y + 4);
    }

    // Draw the line chart
    ctx.setLineDash([]);
    ctx.lineWidth = 3;
    ctx.strokeStyle = primaryColor;
    ctx.fillStyle = primaryColor + '20';

    if (scores.length === 1) {
      // Single point
      const x = padding + chartWidth / 2;
      const y = padding + chartHeight - ((scores[0] / maxScore) * chartHeight);
      
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, 2 * Math.PI);
      ctx.fillStyle = primaryColor;
      ctx.fill();
    } else {
      // Multiple points - draw line
      ctx.beginPath();
      scores.forEach((score, index) => {
        const x = padding + index * stepX;
        const y = padding + chartHeight - ((score / maxScore) * chartHeight);
        
        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      ctx.stroke();

      // Draw area under curve
      ctx.lineTo(padding + (scores.length - 1) * stepX, padding + chartHeight);
      ctx.lineTo(padding, padding + chartHeight);
      ctx.closePath();
      ctx.fill();

      // Draw points
      ctx.fillStyle = primaryColor;
      scores.forEach((score, index) => {
        const x = padding + index * stepX;
        const y = padding + chartHeight - ((score / maxScore) * chartHeight);
        
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, 2 * Math.PI);
        ctx.fill();
      });
    }

    // X-axis labels (dates)
    ctx.fillStyle = textColor;
    ctx.font = "10px Inter, sans-serif";
    ctx.textAlign = "center";
    data.forEach((test, index) => {
      if (data.length <= 8 || index % Math.ceil(data.length / 6) === 0) {
        const x = padding + index * stepX;
        const shortDate = test.date.split('-').slice(1).join('/'); // MM/DD format
        ctx.fillText(shortDate, x, height - 10);
      }
    });
  }, []);

  const getTrendIcon = () => {
    switch (trend) {
      case "up": return <TrendingUp className="w-4 h-4 text-green-500" />;
      case "down": return <TrendingDown className="w-4 h-4 text-red-500" />;
      default: return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTrendText = () => {
    switch (trend) {
      case "up": return "📈 Improving";
      case "down": return "📉 Declining";
      default: return "📊 Stable";
    }
  };

  return (
    <div className="relative">
      {scoresWithData.length > 0 && (
        <div className="absolute top-2 right-2 flex items-center gap-2 text-sm text-muted-foreground bg-background/80 px-2 py-1 rounded-lg">
          {getTrendIcon()}
          <span>{getTrendText()}</span>
        </div>
      )}
      
      <canvas
        ref={canvasRef}
        className="w-full h-64 rounded-lg"
        style={{ background: 'transparent' }}
      />
      
      {scoresWithData.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <div className="text-4xl mb-2">📊</div>
            <p>Take your first test to see progress!</p>
          </div>
        </div>
      )}
    </div>
  );
};