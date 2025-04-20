import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

export function StatsCard({ 
  title, 
  value, 
  icon, 
  description, 
  trend, 
  className 
}: StatsCardProps) {
  return (
    <Card className={cn("overflow-hidden group", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-1.5 space-y-0">
        <CardTitle className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">
          {title}
        </CardTitle>
        <div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center text-muted-foreground group-hover:scale-110 transition-transform">
          {icon}
        </div>
      </CardHeader>
      <CardContent className="pt-1">
        <div className="text-xl font-bold mb-0.5 group-hover:scale-105 origin-left transition-transform">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mb-1">{description}</p>
        )}
        {trend && (
          <div className="flex items-center mt-1 bg-slate-50 dark:bg-slate-800 p-1 px-1.5 rounded-md w-fit">
            <span
              className={cn(
                "text-xs font-medium flex items-center",
                trend.isPositive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
              )}
            >
              {trend.isPositive ? (
                <ArrowUpIcon size={12} className="mr-0.5" />
              ) : (
                <ArrowDownIcon size={12} className="mr-0.5" />
              )}
              {Math.abs(trend.value)}%
            </span>
            <span className="text-xs text-muted-foreground ml-0.5">from last month</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
