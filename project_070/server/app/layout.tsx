import './globals.css';
import Link from 'next/link';
import type { ReactNode } from 'react';

export const metadata = { title: 'Blog Full Stack', description: 'Next.js + SQLite' };
export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR"><body>
      <header className="bar"><Link href="/" className="logo">Tinta&amp;Pixel</Link><Link href="/admin">Painel</Link></header>
      <main>{children}</main>
    </body></html>
  );
}
