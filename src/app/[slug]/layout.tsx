
import type { ReactNode } from 'react';
import MarketingLayout from '@/app/(marketing)/layout';

export default function SlugPageLayout({ children }: { children: ReactNode }) {
  return <MarketingLayout>{children}</MarketingLayout>;
}
