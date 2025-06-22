import React from 'react';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
}

export function LoadingSpinner({ size = 'md', className, text }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6', 
    lg: 'w-8 h-8'
  };

  return (
    <div className={cn('flex items-center justify-center space-x-2', className)}>
      <Loader2 className={cn('animate-spin', sizeClasses[size])} />
      {text && <span className="text-sm text-gray-600 dark:text-gray-400">{text}</span>}
    </div>
  );
}

interface LoadingOverlayProps {
  isLoading: boolean;
  text?: string;
  children: React.ReactNode;
}

export function LoadingOverlay({ isLoading, text = 'Loading...', children }: LoadingOverlayProps) {
  return (
    <div className="relative">
      {children}
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 flex items-center justify-center z-50">
          <LoadingSpinner text={text} />
        </div>
      )}
    </div>
  );
}

interface ProgressLoadingProps {
  progress: number;
  text?: string;
  className?: string;
}

export function ProgressLoading({ progress, text, className }: ProgressLoadingProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex justify-between text-sm">
        <span>{text || 'Loading...'}</span>
        <span>{Math.round(progress)}%</span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div 
          className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
    </div>
  );
}

interface LoadingStateProps {
  state: 'loading' | 'error' | 'success' | 'idle';
  loadingText?: string;
  errorText?: string;
  successText?: string;
  children?: React.ReactNode;
  onRetry?: () => void;
}

export function LoadingState({ 
  state, 
  loadingText = 'Loading...', 
  errorText = 'Something went wrong',
  successText = 'Success!',
  children,
  onRetry 
}: LoadingStateProps) {
  switch (state) {
    case 'loading':
      return (
        <div className="flex flex-col items-center justify-center p-8 space-y-4">
          <LoadingSpinner size="lg" />
          <p className="text-gray-600 dark:text-gray-400">{loadingText}</p>
        </div>
      );
    
    case 'error':
      return (
        <div className="flex flex-col items-center justify-center p-8 space-y-4">
          <AlertCircle className="w-12 h-12 text-red-500" />
          <p className="text-gray-600 dark:text-gray-400">{errorText}</p>
          {onRetry && (
            <button 
              onClick={onRetry}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          )}
        </div>
      );
    
    case 'success':
      return (
        <div className="flex flex-col items-center justify-center p-8 space-y-4">
          <CheckCircle2 className="w-12 h-12 text-green-500" />
          <p className="text-gray-600 dark:text-gray-400">{successText}</p>
        </div>
      );
    
    default:
      return <>{children}</>;
  }
}

interface PageLoadingProps {
  title?: string;
  description?: string;
}

export function PageLoading({ title = 'Loading page...', description }: PageLoadingProps) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <LoadingSpinner size="lg" />
        <div>
          <h2 className="text-xl font-semibold">{title}</h2>
          {description && (
            <p className="text-gray-600 dark:text-gray-400 mt-2">{description}</p>
          )}
        </div>
      </div>
    </div>
  );
}

interface InlineLoadingProps {
  isLoading: boolean;
  text?: string;
  children: React.ReactNode;
}

export function InlineLoading({ isLoading, text, children }: InlineLoadingProps) {
  if (isLoading) {
    return (
      <div className="flex items-center space-x-2">
        <LoadingSpinner size="sm" />
        {text && <span className="text-sm">{text}</span>}
      </div>
    );
  }
  
  return <>{children}</>;
}

interface ButtonLoadingProps {
  isLoading: boolean;
  children: React.ReactNode;
  className?: string;
}

export function ButtonLoading({ isLoading, children, className }: ButtonLoadingProps) {
  return (
    <div className={cn('flex items-center space-x-2', className)}>
      {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
      {children}
    </div>
  );
}