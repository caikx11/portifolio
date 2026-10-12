import './globals.css';
export const metadata = { title: 'Trilha Docs — Docs Site', description: 'Site de documentação em Next.js com sidebar, busca e sumário.' };
export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Red+Hat+Display:wght@500;700;900&family=Red+Hat+Mono:wght@400;500&display=swap" rel="stylesheet" />
        <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='6' fill='%230e1726'/%3E%3Cpath d='M8 22l8-12 8 12z' fill='%23ff7a1a'/%3E%3C/svg%3E" />
      </head>
      <body>{children}</body>
    </html>
  );
}
