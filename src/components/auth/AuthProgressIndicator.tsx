import { useTheme } from "next-themes";
import { Check, Clock, AlertCircle } from "lucide-react";

interface AuthStep {
  id: string;
  label: string;
  status: "pending" | "active" | "completed" | "error";
  description?: string;
}

interface AuthProgressIndicatorProps {
  steps: AuthStep[];
  className?: string;
}

export const AuthProgressIndicator = ({ steps, className = "" }: AuthProgressIndicatorProps) => {
  const { theme } = useTheme();

  const getStepIcon = (step: AuthStep) => {
    switch (step.status) {
      case "completed":
        return <Check className="h-4 w-4 text-white" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-white" />;
      case "active":
        return (
          <div className="h-2 w-2 bg-white rounded-full animate-pulse" />
        );
      default:
        return <Clock className="h-4 w-4 text-slate-400" />;
    }
  };

  const getStepStyles = (step: AuthStep) => {
    const baseClasses = "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300";
    
    switch (step.status) {
      case "completed":
        return `${baseClasses} bg-green-500 text-white`;
      case "error":
        return `${baseClasses} bg-red-500 text-white`;
      case "active":
        return `${baseClasses} ${
          theme === 'light' 
            ? 'bg-blue-500 text-white border-2 border-blue-300' 
            : 'bg-blue-500 text-white border-2 border-blue-400'
        }`;
      default:
        return `${baseClasses} ${
          theme === 'light' 
            ? 'bg-slate-200 text-slate-400' 
            : 'bg-slate-600 text-slate-400'
        }`;
    }
  };

  const getConnectorStyles = (index: number) => {
    const step = steps[index];
    const nextStep = steps[index + 1];
    
    if (step.status === "completed" && nextStep && nextStep.status !== "pending") {
      return theme === 'light' ? 'bg-green-500' : 'bg-green-500';
    } else if (step.status === "active" || step.status === "error") {
      return theme === 'light' ? 'bg-blue-500' : 'bg-blue-500';
    } else {
      return theme === 'light' ? 'bg-slate-200' : 'bg-slate-600';
    }
  };

  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center flex-1">
            <div className="flex flex-col items-center">
              <div className={getStepStyles(step)}>
                {getStepIcon(step)}
              </div>
              <div className="mt-2 text-center">
                <div className={`text-xs font-medium ${
                  step.status === "active" 
                    ? theme === 'light' ? 'text-blue-600' : 'text-blue-400'
                    : step.status === "completed"
                    ? theme === 'light' ? 'text-green-600' : 'text-green-400'
                    : step.status === "error"
                    ? theme === 'light' ? 'text-red-600' : 'text-red-400'
                    : theme === 'light' ? 'text-slate-500' : 'text-slate-400'
                }`}>
                  {step.label}
                </div>
                {step.description && (
                  <div className={`text-xs mt-1 ${theme === 'light' ? 'text-slate-400' : 'text-slate-500'}`}>
                    {step.description}
                  </div>
                )}
              </div>
            </div>
            
            {/* Connector line */}
            {index < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-4 transition-all duration-300 ${getConnectorStyles(index)}`} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};