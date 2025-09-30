
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    default: 'QAWala - Expert QA & Testing Resources',
    template: '%s | QAWala',
  },
  description: 'The #1 destination for QA professionals and aspirants. Enhance your skills with our courses and tools.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&family=Space+Grotesk:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased" suppressHydrationWarning>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
