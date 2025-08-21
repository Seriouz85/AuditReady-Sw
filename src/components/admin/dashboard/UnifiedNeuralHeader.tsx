import { Badge } from '@/components/ui/badge';
import { CheckSquare, Brain, Sparkles, Rocket, RefreshCw } from 'lucide-react';

interface UnifiedNeuralHeaderProps {
  type: 'requirements' | 'guidance';
  title: string;
  subtitle: string;
  description: string;
  isLoading?: boolean;
  badges?: Array<{
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
  }>;
  stats?: {
    quality?: number;
    coverage?: number;
    progress?: number;
  };
}

export function UnifiedNeuralHeader({
  type,
  title,
  subtitle,
  description,
  isLoading = false,
  badges = [],
  stats
}: UnifiedNeuralHeaderProps) {
  const getIcon = () => {
    return type === 'requirements' ? CheckSquare : Brain;
  };

  const getIconGradient = () => {
    return type === 'requirements' 
      ? 'from-purple-500 to-pink-600' 
      : 'from-purple-500 via-pink-500 to-blue-500';
  };

  const Icon = getIcon();

  const defaultBadges = type === 'requirements' 
    ? [
        { label: 'VALIDATION', icon: CheckSquare, color: 'from-purple-500 to-pink-500' },
        { label: 'LIVE', icon: Rocket, color: 'from-green-500 to-emerald-500' }
      ]
    : [
        { label: 'NEURAL', icon: Sparkles, color: 'from-purple-500 to-pink-500' },
        { label: 'LIVE', icon: Rocket, color: 'from-blue-500 to-cyan-500' }
      ];

  const displayBadges = badges.length > 0 ? badges : defaultBadges;

  return (
    <div className="relative group mb-8">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>
      <div className="relative bg-black/60 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 bg-gradient-to-r ${getIconGradient()} rounded-2xl flex items-center justify-center shadow-xl relative`}>
              {isLoading ? (
                <RefreshCw className="w-8 h-8 text-white animate-spin" />
              ) : (
                <Icon className="w-8 h-8 text-white" />
              )}
              {type === 'guidance' && !isLoading && (
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                  <Sparkles className="w-3 h-3 text-white animate-pulse" />
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-white mb-2">
                  {title}
                </h1>
                <div className="flex gap-2">
                  {displayBadges.map((badge, index) => (
                    <Badge 
                      key={index}
                      className={`bg-gradient-to-r ${badge.color} text-white border-0 shadow-lg`}
                    >
                      <badge.icon className="w-3 h-3 mr-1" />
                      {badge.label}
                    </Badge>
                  ))}
                </div>
              </div>
              <p className="text-purple-300 mb-2 text-lg font-medium">{subtitle}</p>
              <p className="text-gray-300 text-sm max-w-2xl">{description}</p>
            </div>
          </div>

          {/* Stats Panel */}
          {stats && (
            <div className="flex flex-col gap-2">
              {stats.quality !== undefined && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-black/40 rounded-lg border border-green-500/20">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-green-300 font-medium">
                    Quality: {stats.quality}%
                  </span>
                </div>
              )}
              {stats.coverage !== undefined && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-black/40 rounded-lg border border-purple-500/20">
                  <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-purple-300 font-medium">
                    Coverage: {stats.coverage}%
                  </span>
                </div>
              )}
              {stats.progress !== undefined && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-black/40 rounded-lg border border-blue-500/20">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-blue-300 font-medium">
                    Progress: {stats.progress}%
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Neural Network Visualization for Guidance type */}
        {type === 'guidance' && (
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full animate-ping"></div>
                <span className="text-xs text-purple-300 font-medium">Guidance → </span>
              </div>
              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-blue-400 animate-spin" />
                <span className="text-xs text-blue-300 font-medium">AI Validation → </span>
              </div>
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-pink-400 animate-pulse" />
                <span className="text-xs text-pink-300 font-medium">Enhancement → </span>
              </div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-green-400 animate-bounce" />
                <span className="text-xs text-green-300 font-medium">Unified Guidance</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}