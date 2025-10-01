import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import HomePage from './page';

// Mock the data fetching module
vi.mock('@/lib/data', () => ({
  getHomepageData: vi.fn(() => Promise.resolve({
    posts: [],
    courses: [],
    testimonials: [],
    settings: {
      heroTitle: 'Welcome to QAWala',
      heroSubtitle: 'Your Testing Companion',
      heroDescription: 'A place to learn and grow.',
      siteName: 'QAWala',
    },
  })),
}));

describe('HomePage', () => {
  it('renders the hero section with settings data', async () => {
    // We need to use a trick to render an async Server Component
    const Page = await HomePage({});
    render(Page);

    // Check for hero title
    expect(screen.getByRole('heading', { name: /Welcome to QAWala/i })).toBeInTheDocument();

    // Check for hero subtitle
    expect(screen.getByText(/Your Testing Companion/i)).toBeInTheDocument();
    
    // Check for hero description
    expect(screen.getByText(/A place to learn and grow./i)).toBeInTheDocument();
  });
});
