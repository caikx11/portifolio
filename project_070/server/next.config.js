/** @type {import('next').NextConfig} */
module.exports = {
  experimental: { serverComponentsExternalPackages: ['better-sqlite3'] },
  // CORS para a demo estática (GitHub Pages / localhost:8080) detectar e usar esta API
  async headers() {
    return [{ source: '/api/:path*', headers: [
      { key: 'Access-Control-Allow-Origin', value: '*' },
      { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,OPTIONS' },
      { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
    ] }];
  },
};
