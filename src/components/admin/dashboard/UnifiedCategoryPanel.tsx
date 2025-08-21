import { Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CategoryStats {
  total_requirements?: number;
  suggestions_generated?: number;
  quality_score?: number;
  validated_requirements?: number;
  coverage_percentage?: number;
  frameworks_included?: string[];
}

interface UnifiedCategory {
  id: string;
  name: string;
  description?: string;
  sort_order?: number;
  icon?: string;
  is_active: boolean;
  stats?: CategoryStats;
  status?: 'approved' | 'pending_review' | 'analyzing' | 'completed' | 'pending';
}

interface UnifiedCategoryPanelProps {
  type: 'requirements' | 'guidance';
  title: string;
  subtitle: string;
  categories: UnifiedCategory[];
  activeCategory?: UnifiedCategory | null;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filterValue: string;
  setFilterValue: (value: string) => void;
  onCategoryClick: (category: UnifiedCategory) => void;
  isLoading?: boolean;
  maxHeight?: string;
  showFrameworks?: boolean;
}

const frameworkColors = {
  'ISO 27001': { bg: 'bg-blue-500/20', text: 'text-blue-300', border: 'border-blue-500/30' },
  'ISO 27002': { bg: 'bg-cyan-500/20', text: 'text-cyan-300', border: 'border-cyan-500/30' },
  'CIS Controls': { bg: 'bg-purple-500/20', text: 'text-purple-300', border: 'border-purple-500/30' },
  'NIS2': { bg: 'bg-orange-500/20', text: 'text-orange-300', border: 'border-orange-500/30' },
  'GDPR': { bg: 'bg-pink-500/20', text: 'text-pink-300', border: 'border-pink-500/30' }
};

const getCategoryIcon = (categoryName: string): string => {
  const name = categoryName?.toLowerCase() || '';
  if (name.includes('governance') || name.includes('leadership')) return '👑';
  if (name.includes('access') || name.includes('identity')) return '🔐';
  if (name.includes('asset') || name.includes('information')) return '📋';
  if (name.includes('crypto') || name.includes('encryption')) return '🔒';
  if (name.includes('physical') || name.includes('environmental')) return '🏢';
  if (name.includes('operations') || name.includes('security')) return '⚙️';
  if (name.includes('communications') || name.includes('network')) return '🌐';
  if (name.includes('acquisition') || name.includes('development')) return '💻';
  if (name.includes('supplier') || name.includes('relationship')) return '🤝';
  if (name.includes('incident') || name.includes('management')) return '🚨';
  if (name.includes('continuity') || name.includes('availability')) return '🔄';
  if (name.includes('compliance') || name.includes('audit')) return '📊';
  return '📁';
};

const getStatusIndicator = (status?: string) => {
  switch (status) {
    case 'approved':
    case 'completed':
      return <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>;
    case 'pending_review':
    case 'pending':
      return <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>;
    case 'analyzing':
      return <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>;
    default:
      return null;
  }
};

export function UnifiedCategoryPanel({
  type,
  title,
  subtitle,
  categories,
  activeCategory,
  searchTerm,
  setSearchTerm,
  filterValue,
  setFilterValue,
  onCategoryClick,
  isLoading = false,
  maxHeight = "650px",
  showFrameworks = true
}: UnifiedCategoryPanelProps) {
  
  // Filter categories based on search and filter
  const filteredCategories = categories.filter(category => {
    const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase());
    let matchesFilter = true;
    
    if (type === 'requirements') {
      if (filterValue === 'validated') {
        matchesFilter = category.status === 'approved';
      } else if (filterValue === 'pending') {
        matchesFilter = category.status === 'pending_review';
      } else if (filterValue === 'analyzing') {
        matchesFilter = category.status === 'analyzing';
      }
    } else if (type === 'guidance') {
      if (filterValue === 'with_guidance') {
        matchesFilter = !!category.stats;
      } else if (filterValue === 'pending_suggestions') {
        matchesFilter = !category.stats;
      }
    }
    
    return matchesSearch && matchesFilter;
  });

  const borderColor = type === 'requirements' ? 'border-purple-500/20' : 'border-purple-500/20';
  const gradientBg = type === 'requirements' ? 'from-blue-600 to-purple-600' : 'from-purple-600 to-blue-600';

  return (
    <div className="space-y-6">
      {/* Search and Filter */}
      <div className="relative group">
        <div className={`absolute -inset-0.5 bg-gradient-to-r ${gradientBg} rounded-2xl blur opacity-15`}></div>
        <div className={`relative bg-black/40 backdrop-blur-xl border ${borderColor} rounded-2xl p-4`}>
          <div className="flex items-center gap-3 mb-4">
            <Search className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-bold text-white">Find & Filter Categories</h3>
          </div>
          <div className="space-y-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder={`Search ${type} categories...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-black/50 border-gray-600 text-white placeholder-gray-400 focus:border-blue-400 focus:ring-blue-400/20"
              />
            </div>
            {/* Filter Dropdown */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <Select value={filterValue} onValueChange={setFilterValue}>
                <SelectTrigger className="bg-black/50 border-gray-600 text-white">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent className="bg-black/90 border-gray-600">
                  <SelectItem value="all" className="text-white">All Categories</SelectItem>
                  {type === 'requirements' && (
                    <>
                      <SelectItem value="validated" className="text-white">Validated</SelectItem>
                      <SelectItem value="pending" className="text-white">Pending Review</SelectItem>
                      <SelectItem value="analyzing" className="text-white">Currently Analyzing</SelectItem>
                    </>
                  )}
                  {type === 'guidance' && (
                    <>
                      <SelectItem value="with_guidance" className="text-white">With Guidance</SelectItem>
                      <SelectItem value="pending_suggestions" className="text-white">Pending Suggestions</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Category List */}
      <div className="relative group">
        <div className={`absolute -inset-0.5 bg-gradient-to-r ${gradientBg} rounded-2xl blur opacity-15`}></div>
        <div className={`relative bg-black/40 backdrop-blur-xl border ${borderColor} rounded-2xl`}>
          {/* Header */}
          <div className="p-4 border-b border-purple-500/20">
            <div className="flex items-center justify-between">
              <h4 className="text-lg font-bold text-white">{title}</h4>
              <div className="text-xs text-purple-300">
                {subtitle}
              </div>
            </div>
          </div>
          
          {/* Scrollable Categories */}
          <div 
            className="p-4 space-y-3 overflow-y-auto scrollbar-thin scrollbar-thumb-purple-500/50 scrollbar-track-transparent"
            style={{ maxHeight }}
          >
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-400">Loading categories...</p>
              </div>
            ) : filteredCategories.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-400">No categories found matching your criteria</p>
              </div>
            ) : (
              filteredCategories.map((category) => (
                <div key={category.id} className="relative group">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 rounded-2xl blur opacity-15 group-hover:opacity-30 transition duration-1000"></div>
                  <div 
                    className={`relative bg-black/50 backdrop-blur-xl border rounded-2xl p-4 cursor-pointer transition-all duration-300 ${
                      activeCategory?.id === category.id
                        ? 'border-purple-400/60 bg-purple-500/10'
                        : 'border-purple-500/20 hover:border-purple-500/40'
                    }`}
                    onClick={() => onCategoryClick(category)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{category.icon || getCategoryIcon(category.name)}</div>
                        <div>
                          <h5 className="font-semibold text-white text-sm">{category.name}</h5>
                          <p className="text-xs text-purple-300">
                            {type === 'requirements' ? 'Unified requirements validation' : 'Unified guidance validation'}
                          </p>
                        </div>
                      </div>
                      
                      {category.status && (
                        <div className="flex items-center gap-2">
                          {getStatusIndicator(category.status)}
                        </div>
                      )}
                    </div>

                    {/* Stats Grid */}
                    {category.stats && (
                      <>
                        <div className="grid grid-cols-3 gap-2 text-xs mb-2">
                          <div className="text-center p-2 bg-black/30 rounded-lg">
                            <div className="text-white font-semibold">
                              {type === 'requirements' 
                                ? category.stats.total_requirements || 0
                                : category.stats.total_requirements || 0
                              }
                            </div>
                            <div className="text-purple-300">Requirements</div>
                          </div>
                          <div className="text-center p-2 bg-black/30 rounded-lg">
                            <div className="text-blue-400 font-semibold">
                              {type === 'requirements' 
                                ? category.stats.suggestions_generated || 0
                                : Math.min((category.stats.frameworks_included?.length || 0) * 3, 19)
                              }
                            </div>
                            <div className="text-blue-300">Suggestions</div>
                          </div>
                          <div className="text-center p-2 bg-black/30 rounded-lg">
                            <div className="text-green-400 font-semibold">
                              {type === 'requirements' 
                                ? Math.round((category.stats.quality_score || 0) * 100)
                                : Math.round(category.stats.coverage_percentage || 0)
                              }%
                            </div>
                            <div className="text-green-300">
                              {type === 'requirements' ? 'Quality' : 'Quality'}
                            </div>
                          </div>
                        </div>
                        
                        {/* Framework Coverage Preview */}
                        {showFrameworks && (
                          <div className="flex flex-wrap gap-1 text-xs">
                            {['ISO 27001', 'ISO 27002', 'CIS Controls', 'NIS2', 'GDPR'].slice(0, 3).map(framework => {
                              const colors = frameworkColors[framework as keyof typeof frameworkColors];
                              return (
                                <div key={framework} className={`px-2 py-1 rounded ${colors.bg} ${colors.text} border ${colors.border}`}>
                                  {framework}
                                </div>
                              );
                            })}
                            {['ISO 27001', 'ISO 27002', 'CIS Controls', 'NIS2', 'GDPR'].length > 3 && (
                              <div className="px-2 py-1 rounded bg-gray-500/20 text-gray-400 border border-gray-500/30">
                                +{['ISO 27001', 'ISO 27002', 'CIS Controls', 'NIS2', 'GDPR'].length - 3} more
                              </div>
                            )}
                          </div>
                        )}
                      </>
                    )}
                    
                    {/* Active indicator */}
                    {activeCategory?.id === category.id && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full animate-pulse"></div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}