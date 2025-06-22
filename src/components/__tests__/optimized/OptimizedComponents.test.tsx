import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { 
  OptimizedButton, 
  OptimizedCard, 
  OptimizedListItem,
  OptimizedStatusCard 
} from '@/components/optimized/OptimizedComponents';

describe('OptimizedComponents', () => {
  describe('OptimizedButton', () => {
    it('renders and handles clicks', () => {
      const handleClick = vi.fn();
      render(
        <OptimizedButton onClick={handleClick}>
          Test Button
        </OptimizedButton>
      );

      const button = screen.getByRole('button', { name: 'Test Button' });
      expect(button).toBeInTheDocument();

      fireEvent.click(button);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('can be disabled', () => {
      render(
        <OptimizedButton disabled>
          Disabled Button
        </OptimizedButton>
      );

      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });
  });

  describe('OptimizedCard', () => {
    it('renders children correctly', () => {
      render(
        <OptimizedCard>
          <div>Card content</div>
        </OptimizedCard>
      );

      expect(screen.getByText('Card content')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(
        <OptimizedCard className="custom-class">
          Content
        </OptimizedCard>
      );

      const card = screen.getByText('Content').closest('div');
      expect(card).toHaveClass('custom-class');
    });
  });

  describe('OptimizedListItem', () => {
    it('renders with title and description', () => {
      render(
        <OptimizedListItem
          id="item-1"
          title="Test Item"
          description="Test description"
          status="Active"
        />
      );

      expect(screen.getByText('Test Item')).toBeInTheDocument();
      expect(screen.getByText('Test description')).toBeInTheDocument();
      expect(screen.getByText('Active')).toBeInTheDocument();
    });

    it('handles click events', () => {
      const handleClick = vi.fn();
      render(
        <OptimizedListItem
          id="item-1"
          title="Test Item"
          onClick={handleClick}
        />
      );

      fireEvent.click(screen.getByText('Test Item').closest('div')!);
      expect(handleClick).toHaveBeenCalledWith('item-1');
    });
  });

  describe('OptimizedStatusCard', () => {
    it('renders with title and value', () => {
      render(
        <OptimizedStatusCard
          title="Total Users"
          value={150}
          description="Active users"
          trend="up"
        />
      );

      expect(screen.getByText('Total Users')).toBeInTheDocument();
      expect(screen.getByText('150')).toBeInTheDocument();
      expect(screen.getByText('Active users')).toBeInTheDocument();
      expect(screen.getByText('↗ Trend')).toBeInTheDocument();
    });

    it('handles different trend types', () => {
      const { rerender } = render(
        <OptimizedStatusCard title="Test" value="100" trend="down" />
      );
      expect(screen.getByText('↘ Trend')).toBeInTheDocument();

      rerender(
        <OptimizedStatusCard title="Test" value="100" trend="stable" />
      );
      expect(screen.getByText('→ Trend')).toBeInTheDocument();
    });
  });
});