import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import useSWR from 'swr';
import { Navbar } from '@/components/layout/Navbar';

vi.mock('swr', () => ({
  default: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  usePathname: vi.fn(() => '/directory/technology/react'),
}));

const mockSearchBar = vi.fn(({ ariaLabel }: { ariaLabel?: string }) => (
  <input aria-label={ariaLabel} readOnly value="" />
));

vi.mock('@/components/site/SearchBar', () => ({
  SearchBar: (props: { ariaLabel?: string }) => mockSearchBar(props),
}));

describe('Navbar auth navigation', () => {
  const assign = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useSWR).mockReturnValue({
      data: { authenticated: false, plan: 'anonymous' },
      error: undefined,
      isLoading: false,
      isValidating: false,
      mutate: vi.fn(),
    } as ReturnType<typeof useSWR>);
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { assign },
    });
  });

  it('uses full-page navigation for unauthenticated login CTAs', async () => {
    render(<Navbar />);

    await userEvent.click(screen.getByRole('button', { name: 'GitHub Login' }));
    expect(assign).toHaveBeenCalledWith('/api/auth/github/start');

    await userEvent.click(screen.getByRole('button', { name: 'Get API Key' }));
    expect(assign).toHaveBeenCalledWith('/api/auth/github/start');
  });

  it('uses full-page navigation for authenticated logout', async () => {
    vi.mocked(useSWR).mockReturnValue({
      data: { authenticated: true, plan: 'free', user: { login: 'alice' } },
      error: undefined,
      isLoading: false,
      isValidating: false,
      mutate: vi.fn(),
    } as ReturnType<typeof useSWR>);

    render(<Navbar />);

    await userEvent.click(screen.getByRole('button', { name: 'Logout' }));
    expect(assign).toHaveBeenCalledWith('/api/auth/logout');
    expect(screen.getByRole('link', { name: 'Dashboard' })).toHaveAttribute('href', '/dashboard');
  });

  it('exposes mobile menu state and passes an accessible label to search', async () => {
    render(<Navbar />);

    expect(screen.getByLabelText('Search for a domain report')).toBeInTheDocument();

    const toggle = screen.getByRole('button', { name: 'Open menu' });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(toggle).toHaveAttribute('aria-controls', 'primary-mobile-menu');

    await userEvent.click(toggle);

    expect(screen.getByRole('button', { name: 'Close menu' })).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getAllByRole('link', { name: 'API Docs' })).toHaveLength(2);
    expect(screen.getAllByLabelText('Search for a domain report')).toHaveLength(2);
  });
});
