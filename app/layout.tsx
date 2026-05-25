import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kizuna - Read Manga With Someone',
  description: 'Match with fellow manga readers in realtime.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  );
}
