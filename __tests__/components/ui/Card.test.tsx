import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/Card';

describe('Card', () => {
  it('should render children', () => {
    render(<Card>Card content</Card>);
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('should have correct base classes', () => {
    render(<Card data-testid="card">Test</Card>);
    const card = screen.getByTestId('card');

    expect(card).toHaveClass('rounded-xl', 'border', 'border-ink-200', 'bg-white');
    expect(card).toHaveClass('text-ink-900', 'shadow-sm');
  });

  it('should apply custom className', () => {
    render(<Card data-testid="card" className="custom-card">Test</Card>);
    expect(screen.getByTestId('card')).toHaveClass('custom-card');
  });

  it('should pass through additional props', () => {
    render(<Card data-testid="test-card">Test</Card>);
    expect(screen.getByTestId('test-card')).toBeInTheDocument();
  });

  it('should enable hover lift styles when hover is true', () => {
    render(<Card data-testid="card" hover>Hover card</Card>);
    expect(screen.getByTestId('card')).toHaveClass('card-lift', 'cursor-pointer');
  });
});

describe('CardHeader', () => {
  it('should render children', () => {
    render(<CardHeader>Header content</CardHeader>);
    expect(screen.getByText('Header content')).toBeInTheDocument();
  });

  it('should have correct base classes', () => {
    const { container } = render(<CardHeader>Test</CardHeader>);
    const header = container.querySelector('div');

    expect(header).toHaveClass('flex', 'flex-col', 'space-y-1.5', 'p-6');
  });

  it('should apply custom className', () => {
    const { container } = render(<CardHeader className="custom-header">Test</CardHeader>);
    const header = container.querySelector('div');

    expect(header).toHaveClass('custom-header');
  });
});

describe('CardTitle', () => {
  it('should render children', () => {
    render(<CardTitle>Card Title</CardTitle>);
    expect(screen.getByText('Card Title')).toBeInTheDocument();
  });

  it('should render as h3 element', () => {
    render(<CardTitle>Title</CardTitle>);
    expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument();
  });

  it('should have correct base classes', () => {
    const { container } = render(<CardTitle>Test</CardTitle>);
    const title = container.querySelector('h3');

    expect(title).toHaveClass('font-serif', 'font-medium', 'leading-tight', 'tracking-tight');
  });

  it('should apply custom className', () => {
    const { container } = render(<CardTitle className="custom-title">Test</CardTitle>);
    const title = container.querySelector('h3');

    expect(title).toHaveClass('custom-title');
  });
});

describe('CardContent', () => {
  it('should render children', () => {
    render(<CardContent>Content area</CardContent>);
    expect(screen.getByText('Content area')).toBeInTheDocument();
  });

  it('should have correct base classes', () => {
    const { container } = render(<CardContent>Test</CardContent>);
    const content = container.querySelector('div');

    expect(content).toHaveClass('p-6', 'pt-0');
  });

  it('should apply custom className', () => {
    const { container } = render(<CardContent className="custom-content">Test</CardContent>);
    const content = container.querySelector('div');

    expect(content).toHaveClass('custom-content');
  });
});

describe('CardFooter', () => {
  it('should render children', () => {
    render(<CardFooter>Footer content</CardFooter>);
    expect(screen.getByText('Footer content')).toBeInTheDocument();
  });

  it('should have correct base classes', () => {
    const { container } = render(<CardFooter>Test</CardFooter>);
    const footer = container.querySelector('div');

    expect(footer).toHaveClass('flex', 'items-center', 'p-6', 'pt-0');
  });

  it('should apply custom className', () => {
    const { container } = render(<CardFooter className="custom-footer">Test</CardFooter>);
    const footer = container.querySelector('div');

    expect(footer).toHaveClass('custom-footer');
  });
});

describe('Card composition', () => {
  it('should render complete card structure', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Card Title</CardTitle>
        </CardHeader>
        <CardContent>Card content goes here</CardContent>
        <CardFooter>Card footer</CardFooter>
      </Card>
    );

    expect(screen.getByText('Card Title')).toBeInTheDocument();
    expect(screen.getByText('Card content goes here')).toBeInTheDocument();
    expect(screen.getByText('Card footer')).toBeInTheDocument();
  });
});
