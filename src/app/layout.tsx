import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Courier Rush — Dijkstra Delivery Game',
  description: 'A graph-based delivery game implementing Dijkstra\'s shortest path algorithm.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
