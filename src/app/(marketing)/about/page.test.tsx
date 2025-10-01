import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import AboutPage from './page';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

// Mock Firebase
vi.mock('firebase/firestore', async () => {
  const actual = await vi.importActual('firebase/firestore');
  return {
    ...actual,
    getDoc: vi.fn(),
    doc: vi.fn(),
    getFirestore: vi.fn(),
  };
});

describe('AboutPage', () => {
  it('renders the default about me content when no settings are fetched', async () => {
    // Mock getDoc to return no data
    (getDoc as vi.Mock).mockResolvedValue({ exists: () => false });

    const Page = await AboutPage({});
    render(Page);

    expect(screen.getByRole('heading', { name: /About Me/i })).toBeInTheDocument();
    expect(screen.getByText(/I'm Harsh Sharma, a passionate/i)).toBeInTheDocument();
  });

  it('renders about me content from Firestore when available', async () => {
    // Mock getDoc to return custom data
    (getDoc as vi.Mock).mockResolvedValue({
      exists: () => true,
      data: () => ({
        aboutMeLong: 'This is the custom about me content from Firestore.',
        siteName: 'My Custom Site',
      }),
    });
    
    const Page = await AboutPage({});
    render(Page);

    expect(screen.getByText('This is the custom about me content from Firestore.')).toBeInTheDocument();
  });
});
