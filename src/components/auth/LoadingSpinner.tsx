import { useTheme } from "next-themes";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  text?: string;
  className?: string;
}

export const LoadingSpinner = ({ 
  size = "md", 
  text, 
  className = "" 
}: LoadingSpinnerProps) => {
  const { theme } = useTheme();
  
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6", 
    lg: "h-8 w-8"
  };

  const borderClasses = {
    sm: "border-2",
    md: "border-2",
    lg: "border-3"
  };

  return (
    <div className={`flex items-center justify-center gap-2 ${className}`}>
      <div 
        className={`
          ${sizeClasses[size]} 
          ${borderClasses[size]}
          animate-spin 
          rounded-full 
          border-blue-500 
          border-t-transparent
        `}
      />
      {text && (
        <span className={`text-sm ${theme === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>
          {text}
        </span>
      )}
    </div>
  );
};