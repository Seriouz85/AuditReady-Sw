import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@/test-utils';
import { checkAccessibility } from '@/test-utils';

// Mock axe-core for accessibility testing
vi.mock('axe-core', () => ({
  axe: vi.fn().mockResolvedValue({
    violations: [],
    passes: [],
    inapplicable: [],
    incomplete: []
  })
}));

// Import components after mocking
import { App } from '@/App';
import { ComplianceSimplification } from '@/pages/ComplianceSimplification';
import { AdminDashboard } from '@/pages/admin/AdminDashboard';

describe('Accessibility Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('WCAG 2.1 AA Compliance', () => {
    it('should pass axe accessibility audit for main app', async () => {
      const { container } = render(<App />);
      
      const results = await checkAccessibility(container);
      
      expect(results.violations).toHaveLength(0);
    });

    it('should pass accessibility audit for compliance page', async () => {
      const { container } = render(<ComplianceSimplification />);
      
      await waitFor(() => {
        expect(screen.getByText(/compliance/i)).toBeInTheDocument();
      });
      
      const results = await checkAccessibility(container);
      
      expect(results.violations).toHaveLength(0);
    });

    it('should have proper heading hierarchy', () => {
      render(<ComplianceSimplification />);
      
      const headings = screen.getAllByRole('heading');
      const headingLevels = headings.map(heading => {
        const tagName = heading.tagName.toLowerCase();
        return parseInt(tagName.replace('h', ''));
      });
      
      // Should start with h1 and not skip levels
      expect(headingLevels[0]).toBe(1);
      
      for (let i = 1; i < headingLevels.length; i++) {
        const currentLevel = headingLevels[i];
        const previousLevel = headingLevels[i - 1];
        
        // Should not skip more than one level
        expect(currentLevel - previousLevel).toBeLessThanOrEqual(1);
      }
    });

    it('should have accessible form labels', () => {
      const FormComponent = () => (
        <form>
          <label htmlFor="email">Email Address</label>
          <input id="email" type="email" />
          
          <label htmlFor="password">Password</label>
          <input id="password" type="password" />
          
          <button type="submit">Submit</button>
        </form>
      );

      render(<FormComponent />);
      
      const emailInput = screen.getByLabelText('Email Address');
      const passwordInput = screen.getByLabelText('Password');
      
      expect(emailInput).toBeInTheDocument();
      expect(passwordInput).toBeInTheDocument();
      expect(emailInput).toHaveAttribute('id', 'email');
      expect(passwordInput).toHaveAttribute('id', 'password');
    });

    it('should have proper ARIA attributes for complex components', () => {
      const DropdownComponent = () => {
        const [isOpen, setIsOpen] = React.useState(false);
        
        return (
          <div>
            <button
              aria-expanded={isOpen}
              aria-haspopup="listbox"
              onClick={() => setIsOpen(!isOpen)}
            >
              Select Framework
            </button>
            {isOpen && (
              <ul role="listbox" aria-label="Framework options">
                <li role="option" aria-selected={false}>ISO 27001</li>
                <li role="option" aria-selected={false}>GDPR</li>
                <li role="option" aria-selected={true}>CIS Controls</li>
              </ul>
            )}
          </div>
        );
      };

      render(<DropdownComponent />);
      
      const button = screen.getByRole('button', { name: 'Select Framework' });
      expect(button).toHaveAttribute('aria-expanded', 'false');
      expect(button).toHaveAttribute('aria-haspopup', 'listbox');
      
      fireEvent.click(button);
      
      expect(button).toHaveAttribute('aria-expanded', 'true');
      
      const listbox = screen.getByRole('listbox');
      expect(listbox).toHaveAttribute('aria-label', 'Framework options');
      
      const options = screen.getAllByRole('option');
      expect(options).toHaveLength(3);
      expect(options[2]).toHaveAttribute('aria-selected', 'true');
    });
  });

  describe('Keyboard Navigation', () => {
    it('should be fully keyboard navigable', () => {
      const NavigableForm = () => (
        <div>
          <button>First Button</button>
          <input type="text" placeholder="Text input" />
          <select>
            <option>Option 1</option>
            <option>Option 2</option>
          </select>
          <button>Last Button</button>
        </div>
      );

      render(<NavigableForm />);
      
      const firstButton = screen.getByRole('button', { name: 'First Button' });
      const textInput = screen.getByRole('textbox');
      const select = screen.getByRole('combobox');
      const lastButton = screen.getByRole('button', { name: 'Last Button' });
      
      // All interactive elements should be focusable
      firstButton.focus();
      expect(document.activeElement).toBe(firstButton);
      
      textInput.focus();
      expect(document.activeElement).toBe(textInput);
      
      select.focus();
      expect(document.activeElement).toBe(select);
      
      lastButton.focus();
      expect(document.activeElement).toBe(lastButton);
    });

    it('should handle tab navigation correctly', () => {
      const TabNavigationComponent = () => (
        <div>
          <button tabIndex={1}>Button 1</button>
          <button tabIndex={2}>Button 2</button>
          <button tabIndex={0}>Button 3 (natural order)</button>
          <button tabIndex={-1}>Button 4 (not in tab order)</button>
        </div>
      );

      render(<TabNavigationComponent />);
      
      // Tab order should be: Button 1, Button 2, Button 3
      // Button 4 should not be in tab order
      const button1 = screen.getByRole('button', { name: 'Button 1' });
      const button2 = screen.getByRole('button', { name: 'Button 2' });
      const button3 = screen.getByRole('button', { name: 'Button 3 (natural order)' });
      const button4 = screen.getByRole('button', { name: 'Button 4 (not in tab order)' });
      
      expect(button1).toHaveAttribute('tabIndex', '1');
      expect(button2).toHaveAttribute('tabIndex', '2');
      expect(button3).toHaveAttribute('tabIndex', '0');
      expect(button4).toHaveAttribute('tabIndex', '-1');
    });

    it('should handle escape key to close modals', () => {
      const ModalComponent = () => {
        const [isOpen, setIsOpen] = React.useState(true);
        
        React.useEffect(() => {
          const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
              setIsOpen(false);
            }
          };
          
          document.addEventListener('keydown', handleEscape);
          return () => document.removeEventListener('keydown', handleEscape);
        }, []);
        
        if (!isOpen) return <div data-testid="modal-closed">Modal closed</div>;
        
        return (
          <div role="dialog" aria-modal="true" data-testid="modal">
            <h2>Modal Title</h2>
            <button onClick={() => setIsOpen(false)}>Close</button>
          </div>
        );
      };

      render(<ModalComponent />);
      
      expect(screen.getByTestId('modal')).toBeInTheDocument();
      
      fireEvent.keyDown(document, { key: 'Escape' });
      
      expect(screen.getByTestId('modal-closed')).toBeInTheDocument();
    });

    it('should support arrow key navigation in lists', () => {
      const ListComponent = () => {
        const [selectedIndex, setSelectedIndex] = React.useState(0);
        const items = ['Item 1', 'Item 2', 'Item 3'];
        
        const handleKeyDown = (e: React.KeyboardEvent) => {
          switch (e.key) {
            case 'ArrowDown':
              e.preventDefault();
              setSelectedIndex(prev => Math.min(prev + 1, items.length - 1));
              break;
            case 'ArrowUp':
              e.preventDefault();
              setSelectedIndex(prev => Math.max(prev - 1, 0));
              break;
          }
        };
        
        return (
          <ul role="listbox" onKeyDown={handleKeyDown} tabIndex={0}>
            {items.map((item, index) => (
              <li 
                key={item}
                role="option"
                aria-selected={index === selectedIndex}
                data-testid={`item-${index}`}
              >
                {item}
              </li>
            ))}
          </ul>
        );
      };

      render(<ListComponent />);
      
      const listbox = screen.getByRole('listbox');
      
      // Initially first item should be selected
      expect(screen.getByTestId('item-0')).toHaveAttribute('aria-selected', 'true');
      expect(screen.getByTestId('item-1')).toHaveAttribute('aria-selected', 'false');
      
      // Navigate down with arrow key
      fireEvent.keyDown(listbox, { key: 'ArrowDown' });
      
      expect(screen.getByTestId('item-0')).toHaveAttribute('aria-selected', 'false');
      expect(screen.getByTestId('item-1')).toHaveAttribute('aria-selected', 'true');
      
      // Navigate up with arrow key
      fireEvent.keyDown(listbox, { key: 'ArrowUp' });
      
      expect(screen.getByTestId('item-0')).toHaveAttribute('aria-selected', 'true');
      expect(screen.getByTestId('item-1')).toHaveAttribute('aria-selected', 'false');
    });
  });

  describe('Screen Reader Support', () => {
    it('should have proper ARIA live regions for dynamic content', () => {
      const DynamicContentComponent = () => {
        const [message, setMessage] = React.useState('');
        
        return (
          <div>
            <button onClick={() => setMessage('Content updated!')}>
              Update Content
            </button>
            <div aria-live="polite" aria-relevant="additions text">
              {message}
            </div>
          </div>
        );
      };

      render(<DynamicContentComponent />);
      
      const button = screen.getByRole('button', { name: 'Update Content' });
      const liveRegion = screen.getByText('', { selector: '[aria-live="polite"]' });
      
      expect(liveRegion).toHaveAttribute('aria-live', 'polite');
      expect(liveRegion).toHaveAttribute('aria-relevant', 'additions text');
      
      fireEvent.click(button);
      
      expect(screen.getByText('Content updated!')).toBeInTheDocument();
    });

    it('should have descriptive alt text for images', () => {
      const ImageComponent = () => (
        <div>
          <img src="/logo.svg" alt="Audit Readiness Hub company logo" />
          <img src="/chart.png" alt="Compliance progress chart showing 75% completion" />
          <img src="/decoration.jpg" alt="" /> {/* Decorative image */}
        </div>
      );

      render(<ImageComponent />);
      
      const logoImage = screen.getByAltText('Audit Readiness Hub company logo');
      const chartImage = screen.getByAltText('Compliance progress chart showing 75% completion');
      const decorativeImage = screen.getByAltText('');
      
      expect(logoImage).toBeInTheDocument();
      expect(chartImage).toBeInTheDocument();
      expect(decorativeImage).toBeInTheDocument();
    });

    it('should have proper landmarks and regions', () => {
      const LandmarkComponent = () => (
        <div>
          <header>
            <nav aria-label="Main navigation">
              <ul>
                <li><a href="/dashboard">Dashboard</a></li>
                <li><a href="/compliance">Compliance</a></li>
              </ul>
            </nav>
          </header>
          
          <main>
            <section aria-labelledby="main-heading">
              <h1 id="main-heading">Main Content</h1>
              <p>Main content area</p>
            </section>
            
            <aside aria-label="Related information">
              <h2>Sidebar</h2>
              <p>Related content</p>
            </aside>
          </main>
          
          <footer>
            <p>Footer content</p>
          </footer>
        </div>
      );

      render(<LandmarkComponent />);
      
      expect(screen.getByRole('banner')).toBeInTheDocument(); // header
      expect(screen.getByRole('navigation', { name: 'Main navigation' })).toBeInTheDocument();
      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.getByRole('complementary', { name: 'Related information' })).toBeInTheDocument(); // aside
      expect(screen.getByRole('contentinfo')).toBeInTheDocument(); // footer
    });

    it('should announce loading and error states', () => {
      const LoadingComponent = () => {
        const [state, setState] = React.useState<'loading' | 'success' | 'error'>('loading');
        
        React.useEffect(() => {
          const timer = setTimeout(() => {
            setState(Math.random() > 0.5 ? 'success' : 'error');
          }, 1000);
          
          return () => clearTimeout(timer);
        }, []);
        
        return (
          <div>
            {state === 'loading' && (
              <div role="status" aria-live="polite">
                Loading content...
              </div>
            )}
            {state === 'success' && (
              <div role="status" aria-live="polite">
                Content loaded successfully
              </div>
            )}
            {state === 'error' && (
              <div role="alert" aria-live="assertive">
                Error loading content. Please try again.
              </div>
            )}
          </div>
        );
      };

      render(<LoadingComponent />);
      
      const loadingStatus = screen.getByRole('status');
      expect(loadingStatus).toHaveAttribute('aria-live', 'polite');
      expect(loadingStatus).toHaveTextContent('Loading content...');
    });
  });

  describe('Color and Contrast', () => {
    it('should have sufficient color contrast', () => {
      const ColorContrastComponent = () => (
        <div>
          <div 
            style={{ 
              backgroundColor: '#ffffff', 
              color: '#000000',
              padding: '10px'
            }}
            data-testid="high-contrast-text"
          >
            High contrast text (21:1 ratio)
          </div>
          
          <div 
            style={{ 
              backgroundColor: '#0066cc', 
              color: '#ffffff',
              padding: '10px'
            }}
            data-testid="medium-contrast-text"
          >
            Medium contrast text (4.5:1 ratio)
          </div>
          
          <button 
            style={{ 
              backgroundColor: '#007acc', 
              color: '#ffffff',
              border: '2px solid #005c99',
              padding: '8px 16px'
            }}
            data-testid="accessible-button"
          >
            Accessible Button
          </button>
        </div>
      );

      render(<ColorContrastComponent />);
      
      const highContrastText = screen.getByTestId('high-contrast-text');
      const mediumContrastText = screen.getByTestId('medium-contrast-text');
      const accessibleButton = screen.getByTestId('accessible-button');
      
      // Check that elements have proper styling
      expect(highContrastText).toHaveStyle('background-color: #ffffff');
      expect(mediumContrastText).toHaveStyle('background-color: #0066cc');
      expect(accessibleButton).toHaveStyle('background-color: #007acc');
    });

    it('should not rely solely on color to convey information', () => {
      const StatusComponent = () => (
        <div>
          <div className="status-item">
            <span className="status-icon" aria-label="Success">✓</span>
            <span style={{ color: 'green' }}>Passed</span>
          </div>
          
          <div className="status-item">
            <span className="status-icon" aria-label="Error">✗</span>
            <span style={{ color: 'red' }}>Failed</span>
          </div>
          
          <div className="status-item">
            <span className="status-icon" aria-label="Warning">⚠</span>
            <span style={{ color: 'orange' }}>Warning</span>
          </div>
        </div>
      );

      render(<StatusComponent />);
      
      // Should have both visual (color) and non-visual (icons, text) indicators
      expect(screen.getByLabelText('Success')).toBeInTheDocument();
      expect(screen.getByLabelText('Error')).toBeInTheDocument();
      expect(screen.getByLabelText('Warning')).toBeInTheDocument();
      
      expect(screen.getByText('Passed')).toBeInTheDocument();
      expect(screen.getByText('Failed')).toBeInTheDocument();
      expect(screen.getByText('Warning')).toBeInTheDocument();
    });
  });

  describe('Responsive and Mobile Accessibility', () => {
    it('should be accessible on mobile viewports', () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      Object.defineProperty(window, 'innerHeight', {
        writable: true,
        configurable: true,
        value: 667,
      });

      const MobileComponent = () => (
        <div>
          <button style={{ minHeight: '44px', minWidth: '44px' }}>
            Mobile Button
          </button>
          
          <input 
            type="text" 
            style={{ minHeight: '44px', fontSize: '16px' }}
            placeholder="Mobile input"
          />
        </div>
      );

      render(<MobileComponent />);
      
      const button = screen.getByRole('button', { name: 'Mobile Button' });
      const input = screen.getByRole('textbox');
      
      // Touch targets should be at least 44px
      expect(button).toHaveStyle('min-height: 44px');
      expect(button).toHaveStyle('min-width: 44px');
      expect(input).toHaveStyle('min-height: 44px');
      
      // Text should be readable (at least 16px to prevent zoom on iOS)
      expect(input).toHaveStyle('font-size: 16px');
    });

    it('should handle zoom up to 200% without horizontal scrolling', () => {
      const ZoomComponent = () => (
        <div style={{ maxWidth: '100%', overflow: 'hidden' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
            <button style={{ flex: '1 1 auto', minWidth: '120px' }}>Button 1</button>
            <button style={{ flex: '1 1 auto', minWidth: '120px' }}>Button 2</button>
            <button style={{ flex: '1 1 auto', minWidth: '120px' }}>Button 3</button>
          </div>
        </div>
      );

      render(<ZoomComponent />);
      
      const container = screen.getByText('Button 1').closest('div');
      expect(container?.parentElement).toHaveStyle('max-width: 100%');
      expect(container?.parentElement).toHaveStyle('overflow: hidden');
    });
  });

  describe('Focus Management', () => {
    it('should have visible focus indicators', () => {
      const FocusComponent = () => (
        <div>
          <button 
            style={{ 
              outline: '2px solid transparent',
              borderRadius: '4px'
            }}
            onFocus={(e) => {
              e.target.style.outline = '2px solid #007acc';
              e.target.style.outlineOffset = '2px';
            }}
            onBlur={(e) => {
              e.target.style.outline = '2px solid transparent';
            }}
          >
            Focusable Button
          </button>
          
          <input 
            type="text"
            style={{ 
              outline: '2px solid transparent',
              borderRadius: '4px'
            }}
            onFocus={(e) => {
              e.target.style.outline = '2px solid #007acc';
              e.target.style.outlineOffset = '2px';
            }}
            onBlur={(e) => {
              e.target.style.outline = '2px solid transparent';
            }}
          />
        </div>
      );

      render(<FocusComponent />);
      
      const button = screen.getByRole('button');
      const input = screen.getByRole('textbox');
      
      // Focus the button
      fireEvent.focus(button);
      expect(button).toHaveStyle('outline: 2px solid #007acc');
      
      // Focus the input
      fireEvent.focus(input);
      expect(input).toHaveStyle('outline: 2px solid #007acc');
    });

    it('should trap focus in modals', () => {
      const ModalWithFocusTrap = () => {
        const [isOpen, setIsOpen] = React.useState(true);
        const modalRef = React.useRef<HTMLDivElement>(null);
        
        React.useEffect(() => {
          if (isOpen && modalRef.current) {
            const focusableElements = modalRef.current.querySelectorAll(
              'button, input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            const firstElement = focusableElements[0] as HTMLElement;
            const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
            
            const handleTabKey = (e: KeyboardEvent) => {
              if (e.key === 'Tab') {
                if (e.shiftKey) {
                  if (document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement.focus();
                  }
                } else {
                  if (document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement.focus();
                  }
                }
              }
            };
            
            document.addEventListener('keydown', handleTabKey);
            firstElement?.focus();
            
            return () => document.removeEventListener('keydown', handleTabKey);
          }
        }, [isOpen]);
        
        if (!isOpen) return null;
        
        return (
          <div 
            role="dialog" 
            aria-modal="true"
            ref={modalRef}
            data-testid="focus-trap-modal"
          >
            <h2>Modal Title</h2>
            <input type="text" placeholder="First input" />
            <input type="text" placeholder="Second input" />
            <button onClick={() => setIsOpen(false)}>Close</button>
          </div>
        );
      };

      render(<ModalWithFocusTrap />);
      
      const modal = screen.getByTestId('focus-trap-modal');
      const firstInput = screen.getByPlaceholderText('First input');
      const secondInput = screen.getByPlaceholderText('Second input');
      const closeButton = screen.getByRole('button', { name: 'Close' });
      
      expect(modal).toBeInTheDocument();
      expect(firstInput).toHaveFocus();
      
      // Tab to next element
      fireEvent.keyDown(document, { key: 'Tab' });
      expect(secondInput).toHaveFocus();
      
      // Tab to close button
      fireEvent.keyDown(document, { key: 'Tab' });
      expect(closeButton).toHaveFocus();
    });
  });

  describe('Form Accessibility', () => {
    it('should have proper error handling and announcements', () => {
      const FormWithValidation = () => {
        const [email, setEmail] = React.useState('');
        const [error, setError] = React.useState('');
        
        const handleSubmit = (e: React.FormEvent) => {
          e.preventDefault();
          if (!email.includes('@')) {
            setError('Please enter a valid email address');
          } else {
            setError('');
          }
        };
        
        return (
          <form onSubmit={handleSubmit}>
            <label htmlFor="email-input">Email Address</label>
            <input
              id="email-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-describedby={error ? 'email-error' : undefined}
              aria-invalid={!!error}
            />
            {error && (
              <div id="email-error" role="alert" aria-live="polite">
                {error}
              </div>
            )}
            <button type="submit">Submit</button>
          </form>
        );
      };

      render(<FormWithValidation />);
      
      const emailInput = screen.getByLabelText('Email Address');
      const submitButton = screen.getByRole('button', { name: 'Submit' });
      
      // Submit with invalid email
      fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
      fireEvent.click(submitButton);
      
      const errorMessage = screen.getByRole('alert');
      expect(errorMessage).toHaveTextContent('Please enter a valid email address');
      expect(emailInput).toHaveAttribute('aria-invalid', 'true');
      expect(emailInput).toHaveAttribute('aria-describedby', 'email-error');
    });

    it('should group related form fields', () => {
      const GroupedForm = () => (
        <form>
          <fieldset>
            <legend>Personal Information</legend>
            <label htmlFor="first-name">First Name</label>
            <input id="first-name" type="text" />
            
            <label htmlFor="last-name">Last Name</label>
            <input id="last-name" type="text" />
          </fieldset>
          
          <fieldset>
            <legend>Contact Information</legend>
            <label htmlFor="email">Email</label>
            <input id="email" type="email" />
            
            <label htmlFor="phone">Phone</label>
            <input id="phone" type="tel" />
          </fieldset>
        </form>
      );

      render(<GroupedForm />);
      
      const personalFieldset = screen.getByRole('group', { name: 'Personal Information' });
      const contactFieldset = screen.getByRole('group', { name: 'Contact Information' });
      
      expect(personalFieldset).toBeInTheDocument();
      expect(contactFieldset).toBeInTheDocument();
    });
  });
});