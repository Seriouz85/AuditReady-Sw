import { Button } from '@/components/ui/button';
import { RefreshCw, Sparkles, CheckSquare } from 'lucide-react';

interface ActiveCategoryHeaderProps {
  type: 'requirements' | 'guidance';
  category: {
    name: string;
    icon?: string;
  };
  isAnalyzing?: boolean;
  onAnalyze?: () => void;
  className?: string;
}

export function ActiveCategoryHeader({ 
  type, 
  category, 
  isAnalyzing = false, 
  onAnalyze,
  className = "" 
}: ActiveCategoryHeaderProps) {
  const getTitle = () => {
    return type === 'requirements'
      ? 'Validating unified requirements for conciseness and framework coverage'
      : 'Validating unified guidance for clarity and compliance alignment';
  };

  const getButtonText = () => {
    return type === 'requirements'
      ? 'AI Quality Analysis'
      : 'AI Guidance Analysis';
  };

  const getIcon = () => {
    return type === 'requirements' ? CheckSquare : Sparkles;
  };

  const Icon = getIcon();

  return (
    <div className={`relative group ${className}`}>
      <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl blur opacity-20"></div>
      <div className="relative bg-black/60 backdrop-blur-xl border border-emerald-500/20 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="text-3xl">{category.icon || '📁'}</div>
            <div>
              <h3 className="text-xl font-bold text-white">{category.name}</h3>
              <p className="text-emerald-300 text-sm">
                {getTitle()}
              </p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={onAnalyze}
              disabled={isAnalyzing}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
            >
              {isAnalyzing ? (
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  AI Analyzing...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4" />
                  {getButtonText()}
                </div>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}