import '@fontsource/lato/400.css';
import '@fontsource/lato/700.css';
import './globals.css';
import type { Metadata } from 'next';
import { ReactNode } from 'react';
import Providers from './providers';

export const metadata: Metadata = {
  title: 'Geni WhatsApp Proxy',
  description: 'We enable your business to send and receive WhatsApp messages',
  viewport: 'width=device-width, initial-scale=1',
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
