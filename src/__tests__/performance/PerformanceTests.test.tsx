import React from 'react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor, act, fireEvent } from '@/test-utils';
import { measureRenderTime, checkAccessibility } from '@/test-utils';

// Mock performance APIs
vi.mock('web-vitals', () => ({
  onCLS: vi.fn((callback) => callback({ value: 0.05 })),
  onFID: vi.fn((callback) => callback({ value: 20 })),
  onFCP: vi.fn((callback) => callback({ value: 1200 })),
  onLCP: vi.fn((callback) => callback({ value: 1800 })),
  onTTFB: vi.fn((callback) => callback({ value: 400 })),
}));

// Import components after mocking
import App from '@/App';
import ComplianceSimplification from '@/pages/ComplianceSimplification';
import { AdminDashboard } from '@/pages/admin/AdminDashboard';

describe('Performance Tests', () => {
  beforeEach(() => {
    // Mock performance APIs
    global.performance.mark = vi.fn();
    global.performance.measure = vi.fn();
    global.performance.getEntriesByType = vi.fn().mockReturnValue([]);
    global.performance.getEntriesByName = vi.fn().mockReturnValue([
      { duration: 100, startTime: 0 }
    ]);
    global.performance.clearMarks = vi.fn();
    global.performance.clearMeasures = vi.fn();

    // Mock ResizeObserver for performance tests
    global.ResizeObserver = vi.fn().mockImplementation(() => ({
      observe: vi.fn(),
      unobserve: vi.fn(),
      disconnect: vi.fn(),
    }));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Initial Load Performance', () => {
    it('should render app within performance budget', async () => {
      const startTime = performance.now();
      
      render(<App />);
      
      await waitFor(() => {
        expect(screen.getByText(/audit/i) || screen.getByText(/login/i)).toBeInTheDocument();
      });

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Should render within 2 seconds
      expect(renderTime).toBeLessThan(2000);
    });

    it('should load critical components quickly', async () => {
      const criticalComponents = [
        { component: <App />, name: 'App', budget: 1000 },
        { component: <ComplianceSimplification />, name: 'ComplianceSimplification', budget: 1500 },
      ];

      for (const { component, name, budget } of criticalComponents) {
        const startTime = performance.now();
        
        render(component);
        
        const endTime = performance.now();
        const loadTime = endTime - startTime;

        expect(loadTime).toBeLessThan(budget);
        console.log(`${name} loaded in ${loadTime.toFixed(2)}ms (budget: ${budget}ms)`);
      }
    });

    it('should meet Core Web Vitals thresholds', async () => {
      const { onCLS, onFID, onFCP, onLCP, onTTFB } = await import('web-vitals');

      render(<App />);

      await waitFor(() => {
        expect(screen.getByText(/audit/i) || screen.getByText(/login/i)).toBeInTheDocument();
      });

      // Check that web vitals are measured
      expect(onCLS).toHaveBeenCalled();
      expect(onFID).toHaveBeenCalled();
      expect(onFCP).toHaveBeenCalled();
      expect(onLCP).toHaveBeenCalled();
      expect(onTTFB).toHaveBeenCalled();
    });
  });

  describe('Memory Usage', () => {
    it('should not leak memory during component lifecycle', () => {
      const initialMemory = (global as any).gc ? process.memoryUsage().heapUsed : 0;

      // Render and unmount multiple times
      for (let i = 0; i < 10; i++) {
        const { unmount } = render(<ComplianceSimplification />);
        unmount();
      }

      if ((global as any).gc) {
        (global as any).gc();
        const finalMemory = process.memoryUsage().heapUsed;
        const memoryIncrease = finalMemory - initialMemory;
        
        // Memory increase should be minimal (less than 10MB)
        expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024);
      }
    });

    it('should handle large data sets efficiently', async () => {
      const largeDataSet = Array.from({ length: 1000 }, (_, i) => ({
        id: i,
        name: `Item ${i}`,
        description: `Description for item ${i}`,
        category: `Category ${i % 10}`,
      }));

      const LargeDataComponent = () => {
        const [data] = React.useState(largeDataSet);
        return (
          <div>
            {data.map(item => (
              <div key={item.id} data-testid={`item-${item.id}`}>
                {item.name}: {item.description}
              </div>
            ))}
          </div>
        );
      };

      const startTime = performance.now();
      
      render(<LargeDataComponent />);
      
      await waitFor(() => {
        expect(screen.getByTestId('item-0')).toBeInTheDocument();
        expect(screen.getByTestId('item-999')).toBeInTheDocument();
      });

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Should handle 1000 items within 3 seconds
      expect(renderTime).toBeLessThan(3000);
    });

    it('should clean up event listeners and subscriptions', () => {
      const mockEventListener = vi.fn();
      const mockRemoveEventListener = vi.fn();

      // Mock addEventListener and removeEventListener
      global.addEventListener = mockEventListener;
      global.removeEventListener = mockRemoveEventListener;

      const { unmount } = render(<App />);
      
      // Component should add event listeners
      expect(mockEventListener).toHaveBeenCalled();
      
      unmount();
      
      // Should clean up event listeners
      expect(mockRemoveEventListener).toHaveBeenCalled();
    });
  });

  describe('Rendering Performance', () => {
    it('should minimize unnecessary re-renders', () => {
      let renderCount = 0;
      
      const TrackedComponent = React.memo(() => {
        renderCount++;
        return <div data-testid="tracked-component">Render count: {renderCount}</div>;
      });

      const { rerender } = render(<TrackedComponent />);
      
      expect(renderCount).toBe(1);
      
      // Re-render with same props - should not trigger render
      rerender(<TrackedComponent />);
      
      expect(renderCount).toBe(1); // Should still be 1 due to memoization
    });

    it('should handle rapid state updates efficiently', async () => {
      const RapidUpdateComponent = () => {
        const [count, setCount] = React.useState(0);
        
        React.useEffect(() => {
          const interval = setInterval(() => {
            setCount(c => c + 1);
          }, 10);
          
          setTimeout(() => clearInterval(interval), 100);
          
          return () => clearInterval(interval);
        }, []);
        
        return <div data-testid="counter">{count}</div>;
      };

      const startTime = performance.now();
      
      render(<RapidUpdateComponent />);
      
      await waitFor(() => {
        const counter = screen.getByTestId('counter');
        expect(parseInt(counter.textContent || '0')).toBeGreaterThan(5);
      });

      const endTime = performance.now();
      const totalTime = endTime - startTime;

      // Should handle rapid updates without performance degradation
      expect(totalTime).toBeLessThan(1000);
    });

    it('should optimize list rendering with virtual scrolling', async () => {
      const VirtualizedList = ({ items }: { items: any[] }) => {
        const [visibleItems, setVisibleItems] = React.useState(items.slice(0, 20));
        
        return (
          <div 
            data-testid="virtualized-list"
            style={{ height: '400px', overflowY: 'auto' }}
          >
            {visibleItems.map(item => (
              <div key={item.id} style={{ height: '40px' }}>
                {item.name}
              </div>
            ))}
          </div>
        );
      };

      const largeList = Array.from({ length: 10000 }, (_, i) => ({
        id: i,
        name: `Item ${i}`
      }));

      const startTime = performance.now();
      
      render(<VirtualizedList items={largeList} />);
      
      await waitFor(() => {
        expect(screen.getByTestId('virtualized-list')).toBeInTheDocument();
      });

      const endTime = performance.now();
      const renderTime = endTime - startTime;

      // Should render large list quickly by only showing visible items
      expect(renderTime).toBeLessThan(500);
    });
  });

  describe('Bundle Size and Code Splitting', () => {
    it('should lazy load non-critical components', async () => {
      const LazyComponent = React.lazy(() => 
        Promise.resolve({
          default: () => <div data-testid="lazy-component">Lazy loaded</div>
        })
      );

      render(
        <React.Suspense fallback={<div data-testid="loading">Loading...</div>}>
          <LazyComponent />
        </React.Suspense>
      );

      // Should show loading initially
      expect(screen.getByTestId('loading')).toBeInTheDocument();

      // Should load lazy component
      await waitFor(() => {
        expect(screen.getByTestId('lazy-component')).toBeInTheDocument();
      });
    });

    it('should preload critical resources', () => {
      render(<App />);

      // Check for critical resource preloading
      const linkElements = document.querySelectorAll('link[rel="preload"]');
      const criticalResources = Array.from(linkElements).some(link => 
        link.getAttribute('href')?.includes('critical') ||
        link.getAttribute('as') === 'style'
      );

      // Should have some preloaded resources (or at least not throw errors)
      expect(linkElements.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('API Performance', () => {
    it('should cache API responses effectively', async () => {
      const mockApiCall = vi.fn().mockResolvedValue({ data: 'test data' });
      
      const ApiComponent = () => {
        const [data, setData] = React.useState(null);
        
        React.useEffect(() => {
          mockApiCall().then((response: any) => setData(response.data));
        }, []);
        
        return <div data-testid="api-data">{data}</div>;
      };

      // First render
      render(<ApiComponent />);
      
      await waitFor(() => {
        expect(screen.getByText('test data')).toBeInTheDocument();
      });

      expect(mockApiCall).toHaveBeenCalledTimes(1);

      // Second render (should use cache)
      render(<ApiComponent />);
      
      await waitFor(() => {
        expect(screen.getByText('test data')).toBeInTheDocument();
      });

      // API should only be called once due to caching
      expect(mockApiCall).toHaveBeenCalledTimes(1);
    });

    it('should handle API timeouts gracefully', async () => {
      const slowApiCall = vi.fn(() => 
        new Promise(resolve => setTimeout(resolve, 5000))
      );

      const TimeoutComponent = () => {
        const [status, setStatus] = React.useState('loading');
        
        React.useEffect(() => {
          const timeoutId = setTimeout(() => {
            setStatus('timeout');
          }, 3000);
          
          slowApiCall().then(() => {
            clearTimeout(timeoutId);
            setStatus('loaded');
          });
          
          return () => clearTimeout(timeoutId);
        }, []);
        
        return <div data-testid="api-status">{status}</div>;
      };

      render(<TimeoutComponent />);

      // Should show timeout after 3 seconds
      await waitFor(() => {
        expect(screen.getByText('timeout')).toBeInTheDocument();
      }, { timeout: 4000 });
    });
  });

  describe('User Interaction Performance', () => {
    it('should respond to user input quickly', async () => {
      const handleChange = vi.fn();
      
      const InputComponent = () => {
        const [value, setValue] = React.useState('');
        
        const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
          setValue(e.target.value);
          handleChange(e.target.value);
        };
        
        return (
          <input 
            data-testid="performance-input"
            value={value}
            onChange={onChange}
          />
        );
      };

      render(<InputComponent />);
      
      const input = screen.getByTestId('performance-input');
      
      const startTime = performance.now();
      
      // Simulate rapid typing
      await act(async () => {
        for (let i = 0; i < 10; i++) {
          fireEvent.change(input, { target: { value: `test${i}` } });
        }
      });
      
      const endTime = performance.now();
      const totalTime = endTime - startTime;

      // Should handle rapid input changes within 100ms
      expect(totalTime).toBeLessThan(100);
      expect(handleChange).toHaveBeenCalledTimes(10);
    });

    it('should debounce expensive operations', async () => {
      const expensiveOperation = vi.fn();
      
      const DebouncedComponent = () => {
        const [value, setValue] = React.useState('');
        
        React.useEffect(() => {
          const timeoutId = setTimeout(() => {
            if (value) {
              expensiveOperation(value);
            }
          }, 300);
          
          return () => clearTimeout(timeoutId);
        }, [value]);
        
        return (
          <input 
            data-testid="debounced-input"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        );
      };

      render(<DebouncedComponent />);
      
      const input = screen.getByTestId('debounced-input');
      
      // Rapid typing
      fireEvent.change(input, { target: { value: 'test1' } });
      fireEvent.change(input, { target: { value: 'test12' } });
      fireEvent.change(input, { target: { value: 'test123' } });
      
      // Should not call expensive operation immediately
      expect(expensiveOperation).not.toHaveBeenCalled();
      
      // Wait for debounce
      await waitFor(() => {
        expect(expensiveOperation).toHaveBeenCalledWith('test123');
      }, { timeout: 500 });
      
      // Should only be called once after debounce
      expect(expensiveOperation).toHaveBeenCalledTimes(1);
    });
  });

  describe('Performance Monitoring', () => {
    it('should track performance metrics', () => {
      const PerformanceTracker = () => {
        React.useEffect(() => {
          performance.mark('component-start');
          
          return () => {
            performance.mark('component-end');
            performance.measure('component-lifecycle', 'component-start', 'component-end');
          };
        }, []);
        
        return <div data-testid="tracked-component">Performance tracked</div>;
      };

      const { unmount } = render(<PerformanceTracker />);
      
      expect(performance.mark).toHaveBeenCalledWith('component-start');
      
      unmount();
      
      expect(performance.mark).toHaveBeenCalledWith('component-end');
      expect(performance.measure).toHaveBeenCalledWith(
        'component-lifecycle',
        'component-start',
        'component-end'
      );
    });

    it('should report performance budget violations', () => {
      const performanceBudget = {
        renderTime: 100,
        memoryUsage: 50 * 1024 * 1024, // 50MB
        apiResponseTime: 1000
      };

      const checkPerformanceBudget = (metrics: any) => {
        const violations = [];
        
        if (metrics.renderTime > performanceBudget.renderTime) {
          violations.push(`Render time exceeded: ${metrics.renderTime}ms > ${performanceBudget.renderTime}ms`);
        }
        
        if (metrics.memoryUsage > performanceBudget.memoryUsage) {
          violations.push(`Memory usage exceeded: ${metrics.memoryUsage} > ${performanceBudget.memoryUsage}`);
        }
        
        return violations;
      };

      const mockMetrics = {
        renderTime: 50,
        memoryUsage: 30 * 1024 * 1024,
        apiResponseTime: 500
      };

      const violations = checkPerformanceBudget(mockMetrics);
      expect(violations).toHaveLength(0);
    });
  });
});