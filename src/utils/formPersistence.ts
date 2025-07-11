import React, { useState, useEffect, useCallback } from 'react';

interface FormPersistenceOptions {
  key: string;
  storage?: 'localStorage' | 'sessionStorage';
  debounceMs?: number;
  excludeFields?: string[];
  clearOnSubmit?: boolean;
}

interface PersistedFormData {
  data: Record<string, any>;
  timestamp: number;
  version: string;
}

const FORM_VERSION = '1.0';
const DEFAULT_DEBOUNCE_MS = 500;

/**
 * Form persistence utility class
 */
export class FormPersistence {
  private static getStorage(storageType: 'localStorage' | 'sessionStorage') {
    return storageType === 'localStorage' ? localStorage : sessionStorage;
  }

  /**
   * Save form data to storage
   */
  static saveFormData(
    key: string, 
    data: Record<string, any>, 
    storageType: 'localStorage' | 'sessionStorage' = 'localStorage',
    excludeFields: string[] = []
  ): void {
    try {
      const storage = this.getStorage(storageType);
      
      // Filter out excluded fields
      const filteredData = Object.keys(data).reduce((acc, field) => {
        if (!excludeFields.includes(field)) {
          acc[field] = data[field];
        }
        return acc;
      }, {} as Record<string, any>);

      const persistedData: PersistedFormData = {
        data: filteredData,
        timestamp: Date.now(),
        version: FORM_VERSION
      };

      storage.setItem(`form_${key}`, JSON.stringify(persistedData));
    } catch (error) {
      console.warn('Failed to save form data:', error);
    }
  }

  /**
   * Load form data from storage
   */
  static loadFormData(
    key: string,
    storageType: 'localStorage' | 'sessionStorage' = 'localStorage'
  ): Record<string, any> | null {
    try {
      const storage = this.getStorage(storageType);
      const stored = storage.getItem(`form_${key}`);
      
      if (!stored) return null;

      const persistedData: PersistedFormData = JSON.parse(stored);
      
      // Check version compatibility
      if (persistedData.version !== FORM_VERSION) {
        this.clearFormData(key, storageType);
        return null;
      }

      // Check if data is not too old (24 hours)
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours
      if (Date.now() - persistedData.timestamp > maxAge) {
        this.clearFormData(key, storageType);
        return null;
      }

      return persistedData.data;
    } catch (error) {
      console.warn('Failed to load form data:', error);
      return null;
    }
  }

  /**
   * Clear form data from storage
   */
  static clearFormData(
    key: string,
    storageType: 'localStorage' | 'sessionStorage' = 'localStorage'
  ): void {
    try {
      const storage = this.getStorage(storageType);
      storage.removeItem(`form_${key}`);
    } catch (error) {
      console.warn('Failed to clear form data:', error);
    }
  }

  /**
   * Get all saved form keys
   */
  static getSavedFormKeys(storageType: 'localStorage' | 'sessionStorage' = 'localStorage'): string[] {
    try {
      const storage = this.getStorage(storageType);
      const keys: string[] = [];
      
      for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i);
        if (key?.startsWith('form_')) {
          keys.push(key.replace('form_', ''));
        }
      }
      
      return keys;
    } catch (error) {
      console.warn('Failed to get saved form keys:', error);
      return [];
    }
  }

  /**
   * Clear all saved forms
   */
  static clearAllForms(storageType: 'localStorage' | 'sessionStorage' = 'localStorage'): void {
    const keys = this.getSavedFormKeys(storageType);
    keys.forEach(key => this.clearFormData(key, storageType));
  }
}

/**
 * React hook for automatic form persistence
 */
export function useFormPersistence<T extends Record<string, any>>(
  initialValues: T,
  options: FormPersistenceOptions
): {
  values: T;
  updateValue: (field: keyof T, value: any) => void;
  updateValues: (newValues: Partial<T>) => void;
  clearPersistedData: () => void;
  hasPersistedData: boolean;
  resetForm: () => void;
} {
  const {
    key,
    storage = 'localStorage',
    debounceMs = DEFAULT_DEBOUNCE_MS,
    excludeFields = [],
    clearOnSubmit = false
  } = options;

  // Load persisted data on mount
  const [values, setValues] = useState<T>(() => {
    const persistedData = FormPersistence.loadFormData(key, storage);
    return persistedData ? { ...initialValues, ...persistedData } : initialValues;
  });

  const [hasPersistedData, setHasPersistedData] = useState(() => {
    return FormPersistence.loadFormData(key, storage) !== null;
  });

  // Debounced save function
  const debouncedSave = useCallback(
    debounce((data: T) => {
      FormPersistence.saveFormData(key, data, storage, excludeFields);
    }, debounceMs),
    [key, storage, excludeFields, debounceMs]
  );

  // Save to storage whenever values change
  useEffect(() => {
    debouncedSave(values);
  }, [values, debouncedSave]);

  const updateValue = useCallback((field: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [field]: value }));
  }, []);

  const updateValues = useCallback((newValues: Partial<T>) => {
    setValues(prev => ({ ...prev, ...newValues }));
  }, []);

  const clearPersistedData = useCallback(() => {
    FormPersistence.clearFormData(key, storage);
    setHasPersistedData(false);
  }, [key, storage]);

  const resetForm = useCallback(() => {
    setValues(initialValues);
    clearPersistedData();
  }, [initialValues, clearPersistedData]);

  return {
    values,
    updateValue,
    updateValues,
    clearPersistedData,
    hasPersistedData,
    resetForm
  };
}

/**
 * Utility function for debouncing
 */
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) {
  let timeout: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout);
    }
    
    timeout = setTimeout(() => {
      func(...args);
      timeout = null;
    }, wait);
  };
}

/**
 * Higher-order component for automatic form persistence
 */
export function withFormPersistence(
  Component: React.ComponentType<any>,
  persistenceOptions: FormPersistenceOptions
) {
  return function PersistedFormComponent(props: any) {
    const { initialValues = {}, ...restProps } = props;
    
    const {
      values,
      updateValue,
      updateValues,
      clearPersistedData,
      hasPersistedData,
      resetForm
    } = useFormPersistence(initialValues, persistenceOptions);

    return React.createElement(Component, {
      ...restProps,
      formValues: values,
      updateFormValue: updateValue,
      updateFormValues: updateValues,
      clearPersistedFormData: clearPersistedData,
      hasPersistedFormData: hasPersistedData,
      resetFormData: resetForm
    });
  };
}

/**
 * Component to display form persistence status
 */
interface FormPersistenceIndicatorProps {
  hasPersistedData: boolean;
  onRestore?: () => void;
  onClear?: () => void;
  className?: string;
}

export function FormPersistenceIndicator({
  hasPersistedData,
  onRestore,
  onClear,
  className = ''
}: FormPersistenceIndicatorProps) {
  if (!hasPersistedData) return null;

  const containerClass = `flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-sm ${className}`;
  
  return React.createElement('div', { className: containerClass },
    React.createElement('div', { className: 'flex-1' },
      React.createElement('p', { className: 'text-blue-800 dark:text-blue-200' },
        '📝 Draft saved automatically'
      )
    ),
    React.createElement('div', { className: 'flex gap-2' },
      onRestore && React.createElement('button', {
        onClick: onRestore,
        className: 'text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 underline'
      }, 'Restore'),
      onClear && React.createElement('button', {
        onClick: onClear,
        className: 'text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 underline'
      }, 'Clear')
    )
  );
}

/**
 * Auto-save status component
 */
interface AutoSaveStatusProps {
  isSaving?: boolean;
  lastSaved?: Date;
  className?: string;
}

export function AutoSaveStatus({
  isSaving = false,
  lastSaved,
  className = ''
}: AutoSaveStatusProps) {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const containerClass = `flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 ${className}`;
  
  return React.createElement('div', { className: containerClass },
    isSaving 
      ? [
          React.createElement('div', { 
            key: 'dot', 
            className: 'w-2 h-2 bg-yellow-500 rounded-full animate-pulse' 
          }),
          React.createElement('span', { key: 'text' }, 'Saving...')
        ]
      : lastSaved 
        ? [
            React.createElement('div', { 
              key: 'dot', 
              className: 'w-2 h-2 bg-green-500 rounded-full' 
            }),
            React.createElement('span', { key: 'text' }, `Saved at ${formatTime(lastSaved)}`)
          ]
        : [
            React.createElement('div', { 
              key: 'dot', 
              className: 'w-2 h-2 bg-gray-400 rounded-full' 
            }),
            React.createElement('span', { key: 'text' }, 'Not saved')
          ]
  );
}

// Export for use in components
export default FormPersistence;