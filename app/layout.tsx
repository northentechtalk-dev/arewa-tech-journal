import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Arewa Tech Journal — Northern Nigeria',
    template: '%s | Arewa Tech Journal',
  },
  description:
    'The primary authority on on-the-ground technical milestones, emerging developers, regional innovation hubs, and code academies mapping Northern Nigeria\'s tech landscape.',
  keywords: ['Northern Nigeria', 'tech', 'Kaduna', 'Kano', 'Jos', 'developers', 'software engineering'],
  openGraph: {
    type: 'website',
    locale: 'en_NG',
    siteName: 'Arewa Tech Journal',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
