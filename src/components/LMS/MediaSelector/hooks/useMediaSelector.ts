import { useState, useCallback, useEffect } from 'react';
import { MediaItem } from '../types';

interface UseMediaSelectorOptions {
  allowMultiple?: boolean;
  maxSelections?: number;
  allowedTypes?: ('image' | 'video' | 'document' | 'audio')[];
  onSelect?: (media: MediaItem | MediaItem[]) => void;
}

interface UseMediaSelectorReturn {
  isOpen: boolean;
  selectedItems: MediaItem[];
  searchQuery: string;
  selectedCategory: string;
  viewMode: 'grid' | 'list';
  activeTab: 'stock' | 'uploads';
  loading: boolean;
  openSelector: () => void;
  closeSelector: () => void;
  selectItem: (item: MediaItem) => void;
  clearSelection: () => void;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: string) => void;
  setViewMode: (mode: 'grid' | 'list') => void;
  setActiveTab: (tab: 'stock' | 'uploads') => void;
  confirmSelection: () => void;
}

export const useMediaSelector = (options: UseMediaSelectorOptions = {}): UseMediaSelectorReturn => {
  const {
    allowMultiple = false,
    maxSelections = 1,
    allowedTypes = ['image', 'video', 'document', 'audio'],
    onSelect
  } = options;

  const [isOpen, setIsOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState<MediaItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeTab, setActiveTab] = useState<'stock' | 'uploads'>('stock');
  const [loading, setLoading] = useState(false);

  // Open selector
  const openSelector = useCallback(() => {
    setIsOpen(true);
  }, []);

  // Close selector and clear state
  const closeSelector = useCallback(() => {
    setIsOpen(false);
    setSelectedItems([]);
    setSearchQuery('');
    setSelectedCategory('all');
  }, []);

  // Select/deselect item
  const selectItem = useCallback((item: MediaItem) => {
    setSelectedItems(prev => {
      const isSelected = prev.some(selected => selected.id === item.id);
      
      if (allowMultiple) {
        if (isSelected) {
          return prev.filter(selected => selected.id !== item.id);
        } else if (prev.length < maxSelections) {
          return [...prev, item];
        }
        return prev;
      } else {
        return isSelected ? [] : [item];
      }
    });
  }, [allowMultiple, maxSelections]);

  // Clear all selections
  const clearSelection = useCallback(() => {
    setSelectedItems([]);
  }, []);

  // Confirm selection and close
  const confirmSelection = useCallback(() => {
    if (selectedItems.length > 0 && onSelect) {
      onSelect(allowMultiple ? selectedItems : selectedItems[0]);
    }
    closeSelector();
  }, [selectedItems, allowMultiple, onSelect, closeSelector]);

  // Save view preferences to localStorage
  useEffect(() => {
    const preferences = {
      viewMode,
      activeTab,
      selectedCategory: selectedCategory === 'all' ? undefined : selectedCategory
    };
    localStorage.setItem('mediaSelector.preferences', JSON.stringify(preferences));
  }, [viewMode, activeTab, selectedCategory]);

  // Load view preferences from localStorage
  useEffect(() => {
    const savedPreferences = localStorage.getItem('mediaSelector.preferences');
    if (savedPreferences) {
      try {
        const preferences = JSON.parse(savedPreferences);
        if (preferences.viewMode) setViewMode(preferences.viewMode);
        if (preferences.activeTab) setActiveTab(preferences.activeTab);
        if (preferences.selectedCategory) setSelectedCategory(preferences.selectedCategory);
      } catch (error) {
        console.warn('Failed to load media selector preferences:', error);
      }
    }
  }, []);

  return {
    isOpen,
    selectedItems,
    searchQuery,
    selectedCategory,
    viewMode,
    activeTab,
    loading,
    openSelector,
    closeSelector,
    selectItem,
    clearSelection,
    setSearchQuery,
    setSelectedCategory,
    setViewMode,
    setActiveTab,
    confirmSelection
  };
};