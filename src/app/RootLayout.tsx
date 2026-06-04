

import { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import { PropsWithChildren } from 'react';

const poppins = Poppins({
  variable: '--font-poppins',
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'TaskBoard',
  description: 'Real-time Collaborative Task Board',
};

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <title>TaskBoard</title>
      </head>
      <body className={`${poppins.variable} font-sans antialiased`}>{children}</body>
    </html>
  );
}
