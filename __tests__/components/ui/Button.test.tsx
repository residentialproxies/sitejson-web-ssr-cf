import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '@/components/ui/Button';

describe('Button', () => {
  it('should render button with children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('should apply base interaction classes', () => {
    render(<Button data-testid="btn">Default</Button>);
    expect(screen.getByTestId('btn')).toHaveClass('inline-flex', 'rounded-lg', 'font-medium');
  });

  it('should render primary variant by default', () => {
    render(<Button data-testid="btn">Primary</Button>);
    expect(screen.getByTestId('btn')).toHaveClass('bg-ink-900', 'text-white');
  });

  it('should render secondary variant', () => {
    render(<Button data-testid="btn" variant="secondary">Secondary</Button>);
    expect(screen.getByTestId('btn')).toHaveClass('bg-clay-100', 'text-ink-800');
  });

  it('should render outline variant', () => {
    render(<Button data-testid="btn" variant="outline">Outline</Button>);
    expect(screen.getByTestId('btn')).toHaveClass('border-2', 'border-ink-200', 'bg-transparent');
  });

  it('should render ghost variant', () => {
    render(<Button data-testid="btn" variant="ghost">Ghost</Button>);
    expect(screen.getByTestId('btn')).toHaveClass('text-ink-600', 'hover:bg-ink-100');
  });

  it('should render small size', () => {
    render(<Button data-testid="btn" size="sm">Small</Button>);
    expect(screen.getByTestId('btn')).toHaveClass('h-9', 'px-4', 'text-sm');
  });

  it('should render medium size by default', () => {
    render(<Button data-testid="btn">Medium</Button>);
    expect(screen.getByTestId('btn')).toHaveClass('h-11', 'px-6', 'text-base');
  });

  it('should render large size', () => {
    render(<Button data-testid="btn" size="lg">Large</Button>);
    expect(screen.getByTestId('btn')).toHaveClass('h-14', 'px-8', 'text-lg');
  });

  it('should render icon size', () => {
    render(<Button data-testid="btn" size="icon">+</Button>);
    expect(screen.getByTestId('btn')).toHaveClass('h-11', 'w-11', 'p-0');
  });

  it('should handle click events', async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click</Button>);

    await userEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('should apply custom className', () => {
    render(<Button data-testid="btn" className="custom-class">Custom</Button>);
    expect(screen.getByTestId('btn')).toHaveClass('custom-class');
  });

  it('should pass through additional HTML attributes', () => {
    render(<Button data-testid="test-button" aria-label="Test button">Test</Button>);
    expect(screen.getByTestId('test-button')).toBeInTheDocument();
    expect(screen.getByLabelText('Test button')).toBeInTheDocument();
  });

  it('should render as button type by default', () => {
    render(<Button>Submit</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'button');
  });

  it('should support submit type', () => {
    render(<Button type="submit">Submit</Button>);
    expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
  });
});
