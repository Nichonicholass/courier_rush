import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Courier Rush — Graph Algorithm Delivery Game',
  description: 'A graph-based delivery game implementing Dijkstra\'s shortest path and Kruskal\'s MST algorithms.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
