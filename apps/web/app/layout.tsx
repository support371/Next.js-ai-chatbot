import type { ReactNode } from 'react';

export const metadata = {
  title: 'OpenGuardians AI Platform',
  description: 'AI-powered cybersecurity operations dashboard'
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
