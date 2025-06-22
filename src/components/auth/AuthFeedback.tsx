import { useTheme } from "next-themes";
import { CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";

interface AuthFeedbackProps {
  type: "success" | "error" | "warning" | "info";
  title: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export const AuthFeedback = ({ 
  type, 
  title, 
  message, 
  action, 
  className = "" 
}: AuthFeedbackProps) => {
  const { theme } = useTheme();

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case "info":
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getStyles = () => {
    const baseClasses = "rounded-lg p-4 border-2";
    
    switch (type) {
      case "success":
        return `${baseClasses} ${
          theme === 'light' 
            ? 'bg-green-50 border-green-200' 
            : 'bg-green-900/20 border-green-700'
        }`;
      case "error":
        return `${baseClasses} ${
          theme === 'light' 
            ? 'bg-red-50 border-red-200' 
            : 'bg-red-900/20 border-red-700'
        }`;
      case "warning":
        return `${baseClasses} ${
          theme === 'light' 
            ? 'bg-amber-50 border-amber-200' 
            : 'bg-amber-900/20 border-amber-700'
        }`;
      case "info":
        return `${baseClasses} ${
          theme === 'light' 
            ? 'bg-blue-50 border-blue-200' 
            : 'bg-blue-900/20 border-blue-700'
        }`;
    }
  };

  const getTitleColor = () => {
    switch (type) {
      case "success":
        return theme === 'light' ? 'text-green-800' : 'text-green-300';
      case "error":
        return theme === 'light' ? 'text-red-800' : 'text-red-300';
      case "warning":
        return theme === 'light' ? 'text-amber-800' : 'text-amber-300';
      case "info":
        return theme === 'light' ? 'text-blue-800' : 'text-blue-300';
    }
  };

  const getMessageColor = () => {
    switch (type) {
      case "success":
        return theme === 'light' ? 'text-green-700' : 'text-green-400';
      case "error":
        return theme === 'light' ? 'text-red-700' : 'text-red-400';
      case "warning":
        return theme === 'light' ? 'text-amber-700' : 'text-amber-400';
      case "info":
        return theme === 'light' ? 'text-blue-700' : 'text-blue-400';
    }
  };

  const getActionButtonColor = () => {
    switch (type) {
      case "success":
        return 'text-green-600 hover:text-green-700';
      case "error":
        return 'text-red-600 hover:text-red-700';
      case "warning":
        return 'text-amber-600 hover:text-amber-700';
      case "info":
        return 'text-blue-600 hover:text-blue-700';
    }
  };

  return (
    <div className={`${getStyles()} ${className}`}>
      <div className="flex items-start gap-3">
        {getIcon()}
        <div className="flex-1">
          <h3 className={`font-medium ${getTitleColor()}`}>
            {title}
          </h3>
          <p className={`text-sm mt-1 ${getMessageColor()}`}>
            {message}
          </p>
          {action && (
            <button
              onClick={action.onClick}
              className={`text-sm font-medium mt-2 ${getActionButtonColor()} hover:underline`}
            >
              {action.label}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};