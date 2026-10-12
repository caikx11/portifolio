import { createApp } from './app';
const secret = process.env.JWT_SECRET;
if (!secret) { console.error('Defina JWT_SECRET (>= 16 caracteres). Ex.: JWT_SECRET=troque-esta-chave-123 npm run dev'); process.exit(1); }
const port = Number(process.env.PORT) || 3000;
createApp({ jwtSecret: secret }).listen(port, () => console.log(`API em http://localhost:${port}`));
