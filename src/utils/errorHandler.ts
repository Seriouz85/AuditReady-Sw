import { toast } from '@/utils/toast';

export interface ErrorDetails {
  code?: string;
  message: string;
  context?: Record<string, any>;
  stack?: string;
  timestamp: string;
}

export class ErrorHandler {
  private static instance: ErrorHandler;
  private errorLog: ErrorDetails[] = [];

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  /**
   * Handle different types of errors with appropriate user feedback
   */
  handleError(error: unknown, context?: Record<string, any>): ErrorDetails {
    const errorDetails = this.parseError(error, context);
    
    // Log error
    this.logError(errorDetails);
    
    // Show user-friendly message
    this.showUserFeedback(errorDetails);
    
    return errorDetails;
  }

  /**
   * Parse different error types into a consistent format
   */
  private parseError(error: unknown, context?: Record<string, any>): ErrorDetails {
    const timestamp = new Date().toISOString();
    
    if (error instanceof Error) {
      return {
        code: (error as any).code || 'UNKNOWN_ERROR',
        message: error.message,
        context,
        stack: error.stack,
        timestamp
      };
    }
    
    if (typeof error === 'string') {
      return {
        message: error,
        context,
        timestamp
      };
    }
    
    if (error && typeof error === 'object') {
      const obj = error as any;
      return {
        code: obj.code || obj.statusCode || obj.status,
        message: obj.message || obj.error || obj.description || 'An unknown error occurred',
        context: { ...context, originalError: obj },
        timestamp
      };
    }
    
    return {
      message: 'An unexpected error occurred',
      context,
      timestamp
    };
  }

  /**
   * Show appropriate user feedback based on error type
   */
  private showUserFeedback(errorDetails: ErrorDetails): void {
    const { code, message } = errorDetails;
    
    // Network/Connection errors
    if (this.isNetworkError(code, message)) {
      toast.error('Connection problem. Please check your internet and try again.');
      return;
    }
    
    // Authentication errors
    if (this.isAuthError(code, message)) {
      toast.error('Authentication failed. Please log in again.');
      return;
    }
    
    // Permission errors
    if (this.isPermissionError(code, message)) {
      toast.error('You don\'t have permission to perform this action.');
      return;
    }
    
    // Validation errors
    if (this.isValidationError(code, message)) {
      toast.error(`Invalid input: ${message}`);
      return;
    }
    
    // Rate limiting
    if (this.isRateLimitError(code, message)) {
      toast.error('Too many requests. Please wait a moment and try again.');
      return;
    }
    
    // Server errors
    if (this.isServerError(code)) {
      toast.error('Server error. Our team has been notified.');
      return;
    }
    
    // Generic user-friendly message
    const userMessage = this.getUserFriendlyMessage(message);
    toast.error(userMessage);
  }

  /**
   * Log error for debugging/monitoring
   */
  private logError(errorDetails: ErrorDetails): void {
    console.error('Application Error:', errorDetails);
    
    // Add to in-memory log (for demo/debug)
    this.errorLog.push(errorDetails);
    
    // Keep only last 50 errors in memory
    if (this.errorLog.length > 50) {
      this.errorLog = this.errorLog.slice(-50);
    }
    
    // In production, send to monitoring service
    if (import.meta.env.PROD) {
      this.sendToMonitoring(errorDetails);
    }
  }

  /**
   * Send error to monitoring service (Sentry, etc.)
   */
  private sendToMonitoring(errorDetails: ErrorDetails): void {
    // Integration with monitoring service would go here
    // For now, just log to console in production
    if (errorDetails.code && ['NETWORK_ERROR', 'SERVER_ERROR', 'AUTHENTICATION_ERROR'].includes(errorDetails.code)) {
      console.error('Critical error logged:', errorDetails);
    }
  }

  /**
   * Error type detection methods
   */
  private isNetworkError(code?: string, message?: string): boolean {
    return !!(
      code?.includes('NETWORK') ||
      code?.includes('FETCH') ||
      message?.includes('fetch') ||
      message?.includes('network') ||
      message?.includes('connection')
    );
  }

  private isAuthError(code?: string, message?: string): boolean {
    return !!(
      code?.includes('AUTH') ||
      code?.includes('UNAUTHORIZED') ||
      code === '401' ||
      message?.includes('unauthorized') ||
      message?.includes('authentication')
    );
  }

  private isPermissionError(code?: string, message?: string): boolean {
    return !!(
      code?.includes('PERMISSION') ||
      code?.includes('FORBIDDEN') ||
      code === '403' ||
      message?.includes('forbidden') ||
      message?.includes('permission')
    );
  }

  private isValidationError(code?: string, message?: string): boolean {
    return !!(
      code?.includes('VALIDATION') ||
      code?.includes('INVALID') ||
      code === '400' ||
      message?.includes('validation') ||
      message?.includes('invalid')
    );
  }

  private isRateLimitError(code?: string, message?: string): boolean {
    return !!(
      code?.includes('RATE_LIMIT') ||
      code?.includes('TOO_MANY') ||
      code === '429' ||
      message?.includes('rate limit') ||
      message?.includes('too many')
    );
  }

  private isServerError(code?: string): boolean {
    return !!(
      code?.startsWith('5') ||
      code?.includes('SERVER') ||
      code?.includes('INTERNAL')
    );
  }

  /**
   * Convert technical error messages to user-friendly ones
   */
  private getUserFriendlyMessage(message: string): string {
    const friendlyMessages: Record<string, string> = {
      'duplicate key': 'This item already exists',
      'not found': 'The requested item was not found',
      'timeout': 'The request timed out. Please try again',
      'cancelled': 'The request was cancelled',
      'invalid json': 'Invalid data format received',
      'failed to fetch': 'Unable to connect to the server',
    };

    const lowerMessage = message.toLowerCase();
    for (const [key, friendly] of Object.entries(friendlyMessages)) {
      if (lowerMessage.includes(key)) {
        return friendly;
      }
    }

    // If message is too technical, provide generic message
    if (message.length > 100 || message.includes('stack trace') || message.includes('function')) {
      return 'An error occurred. Please try again or contact support.';
    }

    return message;
  }

  /**
   * Get recent errors for debugging
   */
  getRecentErrors(limit = 10): ErrorDetails[] {
    return this.errorLog.slice(-limit);
  }

  /**
   * Clear error log
   */
  clearErrorLog(): void {
    this.errorLog = [];
  }

  /**
   * Handle async operation with automatic error handling
   */
  async handleAsync<T>(
    operation: () => Promise<T>,
    context?: Record<string, any>,
    customErrorMessage?: string
  ): Promise<T | null> {
    try {
      return await operation();
    } catch (error) {
      const errorDetails = this.handleError(error, context);
      
      if (customErrorMessage) {
        toast.error(customErrorMessage);
      }
      
      return null;
    }
  }

  /**
   * Retry mechanism for failed operations
   */
  async retryOperation<T>(
    operation: () => Promise<T>,
    maxRetries = 3,
    delayMs = 1000,
    context?: Record<string, any>
  ): Promise<T | null> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        if (attempt === maxRetries) {
          this.handleError(error, { ...context, attempts: attempt });
          return null;
        }
        
        // Wait before retry (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, delayMs * attempt));
      }
    }
    
    return null;
  }
}

// Global error handler instance
export const errorHandler = ErrorHandler.getInstance();

// Global error boundary for unhandled errors
window.addEventListener('error', (event) => {
  errorHandler.handleError(event.error, {
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno
  });
});

window.addEventListener('unhandledrejection', (event) => {
  errorHandler.handleError(event.reason, {
    type: 'unhandled_promise_rejection'
  });
});

// Helper functions for common patterns
export const handleApiError = (error: unknown, operation: string) => {
  return errorHandler.handleError(error, { operation, type: 'api_error' });
};

export const handleFormError = (error: unknown, formName: string) => {
  return errorHandler.handleError(error, { formName, type: 'form_error' });
};

export const handleFileError = (error: unknown, fileName: string) => {
  return errorHandler.handleError(error, { fileName, type: 'file_error' });
};