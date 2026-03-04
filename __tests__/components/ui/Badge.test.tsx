import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge } from '@/components/ui/Badge';

describe('Badge', () => {
  it('should render children', () => {
    render(<Badge>Test Badge</Badge>);
    expect(screen.getByText('Test Badge')).toBeInTheDocument();
  });

  it('should use default variant styles', () => {
    render(<Badge data-testid="badge">Default</Badge>);
    expect(screen.getByTestId('badge')).toHaveClass('bg-ink-900', 'text-white');
  });

  it('should apply selected variant styles', () => {
    render(<Badge data-testid="badge" variant="secondary">Secondary</Badge>);
    expect(screen.getByTestId('badge')).toHaveClass('bg-ink-100', 'text-ink-700');
  });

  it('should support semantic variants', () => {
    render(<Badge data-testid="badge" variant="danger">Danger</Badge>);
    expect(screen.getByTestId('badge')).toHaveClass('bg-red-100', 'text-red-700');
  });

  it('should include base sizing and layout classes', () => {
    render(<Badge data-testid="badge">Base</Badge>);
    expect(screen.getByTestId('badge')).toHaveClass('inline-flex', 'rounded-full', 'px-2.5', 'text-xs');
  });

  it('should apply custom className', () => {
    render(<Badge data-testid="badge" className="custom-badge">Custom</Badge>);
    expect(screen.getByTestId('badge')).toHaveClass('custom-badge');
  });

  it('should forward native span props', () => {
    render(<Badge data-testid="test-badge" aria-label="badge-label">Test</Badge>);
    expect(screen.getByTestId('test-badge')).toBeInTheDocument();
    expect(screen.getByLabelText('badge-label')).toBeInTheDocument();
  });

  it('should render dot and pulse indicators', () => {
    const { container } = render(
      <Badge dot pulse>
        Processing
      </Badge>
    );
    expect(container.querySelector('.animate-ping')).toBeInTheDocument();
  });

  it('should render with complex children', () => {
    render(
      <Badge>
        <span data-testid="icon">*</span>
        <span>With Icon</span>
      </Badge>
    );
    expect(screen.getByTestId('icon')).toBeInTheDocument();
    expect(screen.getByText('With Icon')).toBeInTheDocument();
  });

  it('should render numeric content', () => {
    render(<Badge>{42}</Badge>);
    expect(screen.getByText('42')).toBeInTheDocument();
  });
});
