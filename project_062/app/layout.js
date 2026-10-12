import './globals.css';
export const metadata = { title: 'Faísca — SaaS Landing e Preços', description: 'Landing page de SaaS com preços e checkout em modo demonstração (sem Stripe real).' };
export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Unbounded:wght@500;700&family=Figtree:wght@400;500;700&display=swap" rel="stylesheet" />
        <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='8' fill='%235b3df5'/%3E%3Ccircle cx='16' cy='16' r='6' fill='%23c9f31d'/%3E%3C/svg%3E" />
      </head>
      <body>{children}</body>
    </html>
  );
}
