import { Manrope } from 'next/font/google';
import './globals.css';

const font = Manrope({ subsets: ['latin'] });

export const metadata = {
  title: 'WishXI | Football jerseys',
  description: 'Browse jerseys by club, size and season. Order on WhatsApp.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={font.className}>{children}</body>
    </html>
  );
}
