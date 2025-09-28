import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@/test-utils';
import { GlobalErrorBoundary } from '../GlobalErrorBoundary';
import { ComponentErrorBoundary } from '../ComponentErrorBoundary';
import { AsyncErrorBoundary } from '../AsyncErrorBoundary';
import { FeatureErrorBoundary } from '../FeatureErrorBoundary';
import { suppressConsoleError } from '@/test-utils';

// Mock Sentry service
vi.mock('@/services/monitoring/SentryService', () => ({
  sentryService: {
    captureException: vi.fn(),
    setContext: vi.fn(),
    setTag: vi.fn()
  }
}));

// Component that throws an error for testing
const ThrowError = ({ shouldThrow = false, errorType = 'render' }: { 
  shouldThrow?: boolean; 
  errorType?: 'render' | 'async' | 'component'; 
}) => {
  if (shouldThrow && errorType === 'render') {
    throw new Error('Test render error');
  }
  
  if (shouldThrow && errorType === 'async') {
    Promise.reject(new Error('Test async error'));
  }

  return <div data-testid="working-component">Component working</div>;
};

// Async component that can fail
const AsyncComponent = ({ shouldFail = false }: { shouldFail?: boolean }) => {
  React.useEffect(() => {
    if (shouldFail) {
      throw new Error('Async component error');
    }
  }, [shouldFail]);

  return <div data-testid="async-component">Async component loaded</div>;
};

describe('Error Boundary Tests', () => {
  let restoreConsole: () => void;

  beforeEach(() => {
    vi.clearAllMocks();
    restoreConsole = suppressConsoleError();
  });

  afterEach(() => {
    restoreConsole();
    vi.restoreAllMocks();
  });

  describe('GlobalErrorBoundary', () => {
    it('should catch and display render errors', () => {
      render(
        <GlobalErrorBoundary>
          <ThrowError shouldThrow={true} />
        </GlobalErrorBoundary>
      );

      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
      expect(screen.getByText(/test render error/i)).toBeInTheDocument();
    });

    it('should provide retry functionality', async () => {
      let shouldThrow = true;
      const { rerender } = render(
        <GlobalErrorBoundary>
          <ThrowError shouldThrow={shouldThrow} />
        </GlobalErrorBoundary>
      );

      // Error should be displayed
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();

      // Find and click retry button
      const retryButton = screen.getByRole('button', { name: /retry/i });
      expect(retryButton).toBeInTheDocument();

      // Simulate fixing the error
      shouldThrow = false;
      
      // Click retry
      fireEvent.click(retryButton);

      // Re-render with fixed component
      rerender(
        <GlobalErrorBoundary>
          <ThrowError shouldThrow={shouldThrow} />
        </GlobalErrorBoundary>
      );

      await waitFor(() => {
        expect(screen.getByTestId('working-component')).toBeInTheDocument();
      });
    });

    it('should limit retry attempts', () => {
      render(
        <GlobalErrorBoundary>
          <ThrowError shouldThrow={true} />
        </GlobalErrorBoundary>
      );

      const retryButton = screen.getByRole('button', { name: /retry/i });

      // Try to retry multiple times
      for (let i = 0; i < 5; i++) {
        fireEvent.click(retryButton);
      }

      // Should show max retries exceeded message
      expect(screen.getByText(/max.*retries/i) || 
             screen.getByText(/too many.*attempts/i)).toBeInTheDocument();
    });

    it('should provide navigation options', () => {
      render(
        <GlobalErrorBoundary>
          <ThrowError shouldThrow={true} />
        </GlobalErrorBoundary>
      );

      // Should have home button
      const homeButton = screen.getByRole('button', { name: /home/i }) ||
                        screen.getByText(/go.*home/i);
      expect(homeButton).toBeInTheDocument();

      // Should have refresh button
      const refreshButton = screen.getByRole('button', { name: /refresh/i }) ||
                          screen.getByText(/refresh.*page/i);
      expect(refreshButton).toBeInTheDocument();
    });

    it('should report errors to Sentry', () => {
      const { sentryService } = require('@/services/monitoring/SentryService');

      render(
        <GlobalErrorBoundary>
          <ThrowError shouldThrow={true} />
        </GlobalErrorBoundary>
      );

      expect(sentryService.captureException).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({
          tags: expect.any(Object),
          contexts: expect.any(Object)
        })
      );
    });

    it('should display error details in development mode', () => {
      // Mock development environment
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      render(
        <GlobalErrorBoundary>
          <ThrowError shouldThrow={true} />
        </GlobalErrorBoundary>
      );

      // Should show error stack trace or details
      expect(screen.getByText(/error.*details/i) ||
             screen.getByText(/stack.*trace/i)).toBeInTheDocument();

      process.env.NODE_ENV = originalEnv;
    });

    it('should handle network status for offline errors', () => {
      // Mock offline state
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false
      });

      render(
        <GlobalErrorBoundary>
          <ThrowError shouldThrow={true} />
        </GlobalErrorBoundary>
      );

      // Should show offline message
      expect(screen.getByText(/offline/i) ||
             screen.getByText(/network/i)).toBeInTheDocument();
    });
  });

  describe('ComponentErrorBoundary', () => {
    it('should isolate component errors', () => {
      render(
        <div>
          <div data-testid="outside-boundary">Outside boundary</div>
          <ComponentErrorBoundary>
            <ThrowError shouldThrow={true} />
          </ComponentErrorBoundary>
          <div data-testid="also-outside">Also outside</div>
        </div>
      );

      // Outside components should still render
      expect(screen.getByTestId('outside-boundary')).toBeInTheDocument();
      expect(screen.getByTestId('also-outside')).toBeInTheDocument();

      // Error should be caught and displayed
      expect(screen.getByText(/component.*error/i)).toBeInTheDocument();
    });

    it('should provide component-specific recovery options', () => {
      render(
        <ComponentErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ComponentErrorBoundary>
      );

      // Should have reload component option
      const reloadButton = screen.getByRole('button', { name: /reload.*component/i }) ||
                          screen.getByText(/try.*again/i);
      expect(reloadButton).toBeInTheDocument();
    });

    it('should allow hiding broken components', () => {
      render(
        <ComponentErrorBoundary>
          <ThrowError shouldThrow={true} />
        </ComponentErrorBoundary>
      );

      // Should have hide component option
      const hideButton = screen.getByRole('button', { name: /hide/i }) ||
                        screen.getByText(/dismiss/i);
      
      if (hideButton) {
        fireEvent.click(hideButton);

        // Component should be hidden
        expect(screen.queryByText(/component.*error/i)).not.toBeInTheDocument();
      }
    });
  });

  describe('AsyncErrorBoundary', () => {
    it('should catch async errors in useEffect', async () => {
      render(
        <AsyncErrorBoundary>
          <AsyncComponent shouldFail={true} />
        </AsyncErrorBoundary>
      );

      // Wait for async error to be caught
      await waitFor(() => {
        expect(screen.getByText(/async.*error/i) ||
               screen.getByText(/loading.*error/i)).toBeInTheDocument();
      });
    });

    it('should handle Promise rejections', async () => {
      const PromiseRejectComponent = () => {
        React.useEffect(() => {
          Promise.reject(new Error('Promise rejection test'));
        }, []);
        return <div>Promise component</div>;
      };

      render(
        <AsyncErrorBoundary>
          <PromiseRejectComponent />
        </AsyncErrorBoundary>
      );

      await waitFor(() => {
        expect(screen.getByText(/promise.*error/i) ||
               screen.getByText(/async.*error/i)).toBeInTheDocument();
      });
    });

    it('should provide async-specific recovery options', async () => {
      render(
        <AsyncErrorBoundary>
          <AsyncComponent shouldFail={true} />
        </AsyncErrorBoundary>
      );

      await waitFor(() => {
        expect(screen.getByText(/async.*error/i)).toBeInTheDocument();
      });

      // Should have retry async operation option
      const retryAsyncButton = screen.getByRole('button', { name: /retry.*async/i }) ||
                              screen.getByText(/reload.*data/i);
      expect(retryAsyncButton).toBeInTheDocument();
    });
  });

  describe('FeatureErrorBoundary', () => {
    it('should gracefully degrade features', () => {
      render(
        <FeatureErrorBoundary featureName="TestFeature" fallback={<div>Feature unavailable</div>}>
          <ThrowError shouldThrow={true} />
        </FeatureErrorBoundary>
      );

      // Should show fallback instead of error
      expect(screen.getByText('Feature unavailable')).toBeInTheDocument();
      expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
    });

    it('should track feature reliability', () => {
      const { sentryService } = require('@/services/monitoring/SentryService');

      render(
        <FeatureErrorBoundary featureName="CriticalFeature">
          <ThrowError shouldThrow={true} />
        </FeatureErrorBoundary>
      );

      expect(sentryService.setTag).toHaveBeenCalledWith('feature', 'CriticalFeature');
      expect(sentryService.captureException).toHaveBeenCalled();
    });

    it('should provide feature-specific error messages', () => {
      render(
        <FeatureErrorBoundary featureName="ComplianceGenerator">
          <ThrowError shouldThrow={true} />
        </FeatureErrorBoundary>
      );

      // Should mention the specific feature
      expect(screen.getByText(/compliancegenerator/i) ||
             screen.getByText(/feature.*unavailable/i)).toBeInTheDocument();
    });
  });

  describe('Error Recovery Mechanisms', () => {
    it('should clear error state when children change', () => {
      const { rerender } = render(
        <GlobalErrorBoundary>
          <ThrowError shouldThrow={true} />
        </GlobalErrorBoundary>
      );

      // Error should be displayed
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();

      // Render with different children
      rerender(
        <GlobalErrorBoundary>
          <ThrowError shouldThrow={false} />
        </GlobalErrorBoundary>
      );

      // Error should be cleared
      expect(screen.getByTestId('working-component')).toBeInTheDocument();
      expect(screen.queryByText(/something went wrong/i)).not.toBeInTheDocument();
    });

    it('should preserve user data during errors', () => {
      const UserDataComponent = () => {
        const [data, setData] = React.useState('user input');
        
        return (
          <div>
            <input 
              value={data} 
              onChange={(e) => setData(e.target.value)}
              data-testid="user-input"
            />
            <ThrowError shouldThrow={true} />
          </div>
        );
      };

      render(
        <ComponentErrorBoundary>
          <UserDataComponent />
        </ComponentErrorBoundary>
      );

      // Should preserve user input in form fields
      const input = screen.getByTestId('user-input');
      expect(input).toHaveValue('user input');
    });

    it('should handle rapid sequential errors', () => {
      const RapidErrorComponent = ({ errorCount }: { errorCount: number }) => {
        if (errorCount > 0) {
          throw new Error(`Rapid error ${errorCount}`);
        }
        return <div>No errors</div>;
      };

      const { rerender } = render(
        <GlobalErrorBoundary>
          <RapidErrorComponent errorCount={0} />
        </GlobalErrorBoundary>
      );

      // Trigger multiple rapid errors
      for (let i = 1; i <= 3; i++) {
        rerender(
          <GlobalErrorBoundary>
            <RapidErrorComponent errorCount={i} />
          </GlobalErrorBoundary>
        );
      }

      // Should handle gracefully without infinite loops
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
    });
  });

  describe('Error Reporting and Monitoring', () => {
    it('should include component stack in error reports', () => {
      const { sentryService } = require('@/services/monitoring/SentryService');

      render(
        <GlobalErrorBoundary>
          <div data-testid="parent-component">
            <div data-testid="child-component">
              <ThrowError shouldThrow={true} />
            </div>
          </div>
        </GlobalErrorBoundary>
      );

      expect(sentryService.captureException).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({
          contexts: expect.objectContaining({
            react: expect.objectContaining({
              componentStack: expect.any(String)
            })
          })
        })
      );
    });

    it('should set appropriate error severity', () => {
      const { sentryService } = require('@/services/monitoring/SentryService');

      render(
        <GlobalErrorBoundary>
          <ThrowError shouldThrow={true} />
        </GlobalErrorBoundary>
      );

      expect(sentryService.setTag).toHaveBeenCalledWith('severity', 'error');
    });

    it('should include user context in error reports', () => {
      const { sentryService } = require('@/services/monitoring/SentryService');

      render(
        <GlobalErrorBoundary>
          <ThrowError shouldThrow={true} />
        </GlobalErrorBoundary>
      );

      expect(sentryService.setContext).toHaveBeenCalledWith('user', expect.any(Object));
    });
  });

  describe('Accessibility and UX', () => {
    it('should be keyboard accessible', () => {
      render(
        <GlobalErrorBoundary>
          <ThrowError shouldThrow={true} />
        </GlobalErrorBoundary>
      );

      const retryButton = screen.getByRole('button', { name: /retry/i });
      const homeButton = screen.getByRole('button', { name: /home/i });

      // Should be focusable
      retryButton.focus();
      expect(document.activeElement).toBe(retryButton);

      homeButton.focus();
      expect(document.activeElement).toBe(homeButton);
    });

    it('should have proper ARIA labels', () => {
      render(
        <GlobalErrorBoundary>
          <ThrowError shouldThrow={true} />
        </GlobalErrorBoundary>
      );

      // Error message should have proper role
      const errorMessage = screen.getByRole('alert') ||
                          screen.getByLabelText(/error/i);
      expect(errorMessage).toBeInTheDocument();

      // Buttons should have descriptive labels
      const retryButton = screen.getByRole('button', { name: /retry/i });
      expect(retryButton).toHaveAccessibleName();
    });

    it('should provide clear error messages for users', () => {
      render(
        <GlobalErrorBoundary>
          <ThrowError shouldThrow={true} />
        </GlobalErrorBoundary>
      );

      // Should avoid technical jargon
      expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
      expect(screen.queryByText(/uncaught exception/i)).not.toBeInTheDocument();
    });
  });

  describe('Performance Impact', () => {
    it('should not impact performance when no errors occur', () => {
      const performanceMark = `error-boundary-test-${Date.now()}`;
      performance.mark(`${performanceMark}-start`);

      render(
        <GlobalErrorBoundary>
          <ThrowError shouldThrow={false} />
        </GlobalErrorBoundary>
      );

      performance.mark(`${performanceMark}-end`);
      performance.measure(performanceMark, `${performanceMark}-start`, `${performanceMark}-end`);

      const measures = performance.getEntriesByName(performanceMark);
      expect(measures[0].duration).toBeLessThan(100); // Should be very fast

      // Clean up
      performance.clearMarks();
      performance.clearMeasures();
    });

    it('should handle memory efficiently during errors', () => {
      const initialMemory = (global as any).gc ? process.memoryUsage().heapUsed : 0;

      // Render multiple error boundaries
      for (let i = 0; i < 10; i++) {
        const { unmount } = render(
          <GlobalErrorBoundary>
            <ThrowError shouldThrow={true} />
          </GlobalErrorBoundary>
        );
        unmount();
      }

      if ((global as any).gc) {
        (global as any).gc();
        const finalMemory = process.memoryUsage().heapUsed;
        const memoryIncrease = finalMemory - initialMemory;
        
        // Memory increase should be reasonable (less than 50MB)
        expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
      }
    });
  });
});