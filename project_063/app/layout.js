import './globals.css';
export const metadata = { title: 'Aurora Bio — Link-in-bio', description: 'Página de links pessoal em Next.js com contador de cliques e editor.' };
export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Young+Serif&family=Gabarito:wght@400;600;800&display=swap" rel="stylesheet" />
        <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Ccircle cx='16' cy='16' r='15' fill='%23ff5d8f'/%3E%3C/svg%3E" />
      </head>
      <body>{children}</body>
    </html>
  );
}
