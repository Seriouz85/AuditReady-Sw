import { LucideIcon } from 'lucide-react';

interface BasicStat {
  label: string;
  value: string | number;
  color: string; // e.g., 'purple', 'emerald', 'blue'
}

interface ElaborateStat {
  label: string;
  value: string | number;
  subtitle: string;
  icon: LucideIcon;
  gradient: string; // e.g., 'from-purple-600 to-purple-400'
  borderColor: string; // e.g., 'border-purple-500/20'
  additionalInfo?: string;
  progressWidth?: string; // for progress bars
  animate?: boolean;
}

interface UnifiedStatsGridProps {
  type: 'basic' | 'elaborate';
  stats: BasicStat[] | ElaborateStat[];
  columns?: 4 | 5;
  className?: string;
}

export function UnifiedStatsGrid({ 
  type, 
  stats, 
  columns = 4, 
  className = "" 
}: UnifiedStatsGridProps) {
  const gridCols = columns === 5 ? 'md:grid-cols-5' : 'md:grid-cols-4';
  const gap = type === 'elaborate' ? 'gap-6' : 'gap-4';
  const marginBottom = type === 'elaborate' ? 'mb-8' : 'mb-6';

  if (type === 'basic') {
    const basicStats = stats as BasicStat[];
    
    return (
      <div className={`grid grid-cols-1 ${gridCols} ${gap} ${marginBottom} ${className}`}>
        {basicStats.map((stat, index) => (
          <div 
            key={index}
            className={`text-center p-3 bg-black/40 rounded-xl border border-${stat.color}-500/10`}
          >
            <div className={`text-2xl font-bold text-${stat.color === 'white' ? 'white' : `${stat.color}-400`}`}>
              {stat.value}
            </div>
            <div className={`text-xs text-${stat.color}-300`}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Elaborate stats (like guidance dashboard)
  const elaborateStats = stats as ElaborateStat[];
  
  return (
    <div className={`grid grid-cols-1 ${gridCols} ${gap} ${marginBottom} ${className}`}>
      {elaborateStats.map((stat, index) => {
        const Icon = stat.icon;
        
        return (
          <div key={index} className="relative group">
            <div className={`absolute -inset-0.5 bg-gradient-to-r ${stat.gradient} rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000`}></div>
            <div className={`relative bg-black/60 backdrop-blur-xl border ${stat.borderColor} rounded-2xl p-6 hover:border-opacity-40 transition-all duration-300`}>
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 bg-gradient-to-r ${stat.gradient.replace('to-', 'to-').replace('-400', '-600')} rounded-xl flex items-center justify-center shadow-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="text-right">
                  <div className="text-3xl font-black text-white">{stat.value}</div>
                  <div className="text-xs text-gray-300 font-medium uppercase tracking-wider">
                    {stat.label}
                  </div>
                </div>
              </div>
              
              {/* Progress bar or additional info */}
              {stat.progressWidth && (
                <div className="h-1 bg-gradient-to-r from-gray-500/30 to-gray-600/30 rounded-full">
                  <div 
                    className={`h-full bg-gradient-to-r ${stat.gradient.replace('600', '500').replace('400', '600')} rounded-full ${stat.animate ? 'animate-pulse' : ''} transition-all duration-1000`}
                    style={{ width: stat.progressWidth }}
                  ></div>
                </div>
              )}
              
              {stat.additionalInfo && (
                <div className="flex items-center gap-2 text-xs mt-2">
                  <div className={`w-2 h-2 bg-${stat.gradient.includes('purple') ? 'purple' : 'blue'}-400 rounded-full ${stat.animate ? 'animate-pulse' : ''}`}></div>
                  <span className="text-gray-300">{stat.additionalInfo}</span>
                </div>
              )}
              
              {stat.subtitle && (
                <div className="text-xs text-gray-400 mt-1">
                  {stat.subtitle}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}