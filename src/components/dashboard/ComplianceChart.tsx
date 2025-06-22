import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { RequirementStatus } from "@/types";
import { Shield } from "lucide-react";

interface ComplianceChartProps {
  data: {
    fulfilled: number;
    partiallyFulfilled: number;
    notFulfilled: number;
    notApplicable: number;
  };
}

interface ChartDataItem {
  name: string;
  value: number;
  color: string;
  gradientStart?: string;
  gradientEnd?: string;
  statusSlug?: RequirementStatus;
}

export function ComplianceChart({ data }: ComplianceChartProps) {
  const [animated, setAnimated] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const { theme } = useTheme();
  const navigate = useNavigate();
  
  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const chartData: ChartDataItem[] = [
    {
      name: "Fulfilled",
      value: data.fulfilled,
      color: "#10B981",
      gradientStart: "#34D399",
      gradientEnd: "#059669",
      statusSlug: "fulfilled" as RequirementStatus
    },
    {
      name: "Partially Fulfilled",
      value: data.partiallyFulfilled,
      color: "#F59E0B",
      gradientStart: "#FBBF24",
      gradientEnd: "#D97706",
      statusSlug: "partially-fulfilled" as RequirementStatus
    },
    {
      name: "Not Fulfilled",
      value: data.notFulfilled,
      color: "#EF4444",
      gradientStart: "#F87171",
      gradientEnd: "#DC2626",
      statusSlug: "not-fulfilled" as RequirementStatus
    },
    {
      name: "Not Applicable",
      value: data.notApplicable || 0,
      color: "#94A3B8",
      gradientStart: "#9CA3AF",
      gradientEnd: "#4B5563",
      statusSlug: "not-applicable" as RequirementStatus
    }
  ].filter(item => item.value > 0 || item.name === "Not Applicable");

  const total = Object.values(data).reduce((acc, curr) => acc + curr, 0);
  const complianceScore = Math.round(
    ((data.fulfilled + data.partiallyFulfilled * 0.5) / (total - data.notApplicable)) * 100
  ) || 0;

  const createGradientId = (index: number) => `gradient-${index}`;

  const handleNavigate = (statusSlug: RequirementStatus) => {
    if (statusSlug) {
      navigate(`/app/requirements?status=${statusSlug}`);
    }
  };

  return (
    <Card className={cn(
      "h-full overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200",
      theme === 'dark' ? 'border border-white/15' : 'border border-border'
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-100 dark:bg-blue-900/50 p-1.5 rounded-lg">
              <Shield className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            <CardTitle className="text-lg font-semibold">Compliance Status</CardTitle>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="px-2 py-1 h-auto text-xs"
            onClick={() => navigate('/app/requirements')}
          >
            View All
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="flex flex-col items-center gap-0 pt-0 px-1 pb-2">
        {/* Pie Chart Section */}
        <div className="relative w-full max-w-[220px] aspect-square">
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-blue-500/10 rounded-full blur-xl" />
          
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <defs>
                {chartData.map((entry, index) => (
                  <linearGradient 
                    key={`grad-${index}`}
                    id={createGradientId(index)} 
                    x1="0%" y1="0%" 
                    x2="100%" y2="100%"
                  >
                    <stop offset="0%" stopColor={entry.gradientStart || entry.color} stopOpacity={1} />
                    <stop offset="100%" stopColor={entry.gradientEnd || entry.color} stopOpacity={0.7} />
                  </linearGradient>
                ))}
              </defs>
              
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={animated ? 45 : 35}
                outerRadius={animated ? 75 : 55}
                paddingAngle={4}
                dataKey="value"
                nameKey="name"
                startAngle={90}
                endAngle={animated ? -270 : 90}
                animationDuration={1500}
                animationBegin={0}
                strokeWidth={2}
                stroke={theme === 'dark' ? '#1f2937' : '#ffffff'}
                onMouseEnter={(_, index) => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color}
                    opacity={activeIndex === index ? 1 : 0.7}
                    onClick={() => entry.statusSlug && handleNavigate(entry.statusSlug)}
                    style={{ cursor: 'pointer' }}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          
          {/* Center score overlay */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-white/90 dark:bg-slate-900/90 rounded-full h-20 w-20 flex items-center justify-center shadow-inner border-3 border-blue-100 dark:border-blue-900">
              <div className="text-center">
                <div className="text-xl font-bold">{complianceScore}%</div>
                <div className="text-[10px] text-muted-foreground font-medium">compliance</div>
              </div>
            </div>
          </div>
        </div>

        {/* Status Legend */}
        <div className="grid grid-cols-2 gap-2 w-full max-w-[320px] mt-[-8px]">
          {chartData.map((item, index) => (
            <div
              key={item.name}
              className={cn(
                "flex items-center px-3 py-2 rounded-lg transition-all duration-200",
                "bg-white dark:bg-slate-900",
                "border border-slate-200/60 dark:border-slate-800/60",
                "hover:scale-[1.02] hover:shadow-sm",
                "cursor-pointer max-w-[150px]",
                activeIndex === index && "ring-1 ring-blue-400 scale-[1.02] shadow-sm"
              )}
              onMouseEnter={() => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
              onClick={() => item.statusSlug && handleNavigate(item.statusSlug)}
            >
              <div className="w-3 h-3 rounded-full mr-2 flex-shrink-0" style={{ backgroundColor: item.color }} />
              <div className="flex flex-col flex-1 min-w-0">
                <span className="text-xs font-medium leading-tight truncate">{item.name}</span>
                <span className="text-xs text-muted-foreground leading-tight">
                  {item.value} ({Math.round((item.value / total) * 100)}%)
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
