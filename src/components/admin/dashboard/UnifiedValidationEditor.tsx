import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  X, 
  RefreshCw, 
  Sparkles, 
  Brain 
} from 'lucide-react';

interface ValidationItem {
  id: string;
  label: string;
  content: string;
  aiEnhanced?: string;
  status?: 'pending' | 'approved' | 'rejected';
  suggestions?: any[];
}

interface UnifiedValidationEditorProps {
  type: 'requirements' | 'guidance';
  title: string;
  subtitle: string;
  items: ValidationItem[];
  activeCategory?: { name: string } | null;
  isLoading?: boolean;
  onItemAction?: (itemId: string, action: 'apply' | 'reject' | 'reset' | 'enhance') => void;
  onBulkApply?: () => void;
  onBulkRegenerate?: () => void;
  emptyStateMessage?: string;
  emptyStateSubtitle?: string;
  generateEnhancedContent?: (content: string, categoryName: string) => string;
  suggestions?: any[];
}

export function UnifiedValidationEditor({
  type,
  title,
  subtitle,
  items,
  activeCategory,
  isLoading = false,
  onItemAction,
  onBulkApply,
  onBulkRegenerate,
  emptyStateMessage,
  emptyStateSubtitle,
  generateEnhancedContent,
  suggestions = []
}: UnifiedValidationEditorProps) {
  
  const getIcon = () => {
    return type === 'requirements' ? CheckCircle : Sparkles;
  };

  const getGradient = () => {
    return type === 'requirements' 
      ? 'from-blue-600 via-purple-600 to-blue-600'
      : 'from-pink-600 via-purple-600 to-blue-600';
  };

  const getIconGradient = () => {
    return type === 'requirements' 
      ? 'from-blue-500 to-purple-600'
      : 'from-pink-500 to-purple-600';
  };

  const Icon = getIcon();

  const getEnhancedContent = (item: ValidationItem) => {
    // Check if there's a custom ai_enhanced version
    if (item.aiEnhanced) {
      return item.aiEnhanced;
    }
    
    // Look for AI suggestions for this item
    const itemSuggestions = suggestions.filter(s => 
      s.item_id === item.id || s.highlighted_text === item.content
    );
    
    if (itemSuggestions.length > 0 && itemSuggestions[0]?.suggestion) {
      return itemSuggestions[0].suggestion;
    }
    
    // Fallback: Generate enhanced content if function provided
    if (generateEnhancedContent && activeCategory) {
      return generateEnhancedContent(item.content, activeCategory.name);
    }
    
    // Default fallback
    return `Enhanced version of: ${item.content}`;
  };

  const defaultEmptyMessage = type === 'requirements' 
    ? 'Select a category to begin unified requirements validation'
    : 'Select a category to begin unified guidance validation';

  const defaultEmptySubtitle = type === 'requirements' 
    ? 'Categories will load with AI requirements enhancement preview'
    : 'Categories will load with AI guidance enhancement preview';

  return (
    <div className="relative group">
      <div className={`absolute -inset-0.5 bg-gradient-to-r ${getGradient()} rounded-2xl blur opacity-20`}></div>
      <div className="relative bg-black/60 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-6 min-h-[800px]">
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-10 h-10 bg-gradient-to-r ${getIconGradient()} rounded-xl flex items-center justify-center shadow-lg`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-white">{title}</h3>
            <p className="text-xs text-purple-300">{subtitle}</p>
          </div>
          <div className="text-xs text-gray-400">
            {activeCategory ? `${activeCategory.name} ${type === 'requirements' ? 'Requirements' : 'Guidance'}` : 'Select Category'}
          </div>
        </div>
        
        {/* Interactive Editor */}
        {isLoading ? (
          <div className="text-center py-8">
            <RefreshCw className="w-12 h-12 text-purple-400 mx-auto mb-3 animate-spin" />
            <p className="text-gray-400 text-sm">Loading validation items...</p>
          </div>
        ) : activeCategory && items.length > 0 ? (
          <div className="space-y-6">
            {/* Items Editor */}
            <div className="space-y-4 max-h-[500px] overflow-y-auto">
              {items.map((item, index) => (
                <div key={item.id || index} className="p-4 bg-gray-900/50 border border-gray-600/30 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-purple-400 font-bold text-sm">{item.label}</span>
                      <Badge variant="outline" className="text-xs">
                        {item.content.length} chars
                      </Badge>
                      {item.status && (
                        <Badge 
                          className={`text-xs ${
                            item.status === 'approved' ? 'bg-green-500/20 text-green-300 border-green-500/30' :
                            item.status === 'rejected' ? 'bg-red-500/20 text-red-300 border-red-500/30' :
                            'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
                          }`}
                        >
                          {item.status}
                        </Badge>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="text-xs h-6"
                        onClick={() => onItemAction?.(item.id, 'enhance')}
                      >
                        <Sparkles className="w-3 h-3 mr-1" />
                        AI Enhance
                      </Button>
                    </div>
                  </div>
                  
                  {/* Original Content */}
                  <div className="mb-3">
                    <div className="text-xs text-red-300 mb-1 font-medium">
                      {type === 'requirements' ? 'Current:' : 'Original:'}
                    </div>
                    <div className="text-xs text-gray-400 p-2 bg-red-900/10 border border-red-500/20 rounded">
                      {item.content}
                    </div>
                  </div>
                  
                  {/* AI Enhanced Content */}
                  <div className="mb-3">
                    <div className="text-xs text-green-300 mb-1 font-medium">AI Enhanced:</div>
                    <div className="text-xs bg-green-900/10 border-green-500/20 text-gray-300 p-3 rounded min-h-[80px] max-h-32 overflow-y-auto">
                      {getEnhancedContent(item)}
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2 border-t border-gray-600/30">
                    <Button 
                      size="sm" 
                      className="bg-green-600 hover:bg-green-700 text-white text-xs h-6"
                      onClick={() => onItemAction?.(item.id, 'apply')}
                    >
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Apply
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="text-red-300 hover:bg-red-500/10 text-xs h-6"
                      onClick={() => onItemAction?.(item.id, 'reject')}
                    >
                      <X className="w-3 h-3 mr-1" />
                      Reject
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="text-blue-300 hover:bg-blue-500/10 text-xs h-6 ml-auto"
                      onClick={() => onItemAction?.(item.id, 'reset')}
                    >
                      <RefreshCw className="w-3 h-3 mr-1" />
                      Reset
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Bulk Actions */}
            <div className="flex gap-2 pt-4 border-t border-gray-600/30">
              <Button 
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white"
                onClick={onBulkApply}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Apply All Enhancements
              </Button>
              <Button 
                variant="outline" 
                className="border-purple-500/30 text-purple-300 hover:bg-purple-500/10"
                onClick={onBulkRegenerate}
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Regenerate All
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <Brain className="w-12 h-12 text-purple-500/30 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">{emptyStateMessage || defaultEmptyMessage}</p>
            <p className="text-xs text-gray-500 mt-2">{emptyStateSubtitle || defaultEmptySubtitle}</p>
          </div>
        )}
      </div>
    </div>
  );
}