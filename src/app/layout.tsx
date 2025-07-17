import '@fontsource/lato/400.css';
import '@fontsource/lato/700.css';
import './globals.css';
import type { Metadata } from 'next';
import { ReactNode } from 'react';
import Providers from './providers';

export const metadata: Metadata = {
  title: 'WhatsApp SaaS',
  description: 'Scalable WhatsApp API client with subscription management',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans bg-background min-h-screen">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
