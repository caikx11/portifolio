import { createHmac, timingSafeEqual } from 'node:crypto';

const secret = () => process.env.AUTH_SECRET || 'dev-secret-troque';
const password = () => process.env.ADMIN_PASSWORD || 'admin';

export function checkPassword(p: unknown): boolean {
  if (typeof p !== 'string') return false;
  const a = Buffer.from(p), b = Buffer.from(password());
  return a.length === b.length && timingSafeEqual(a, b);
}
export const makeToken = () => createHmac('sha256', secret()).update('admin').digest('hex');
export function isAdmin(req: Request): boolean {
  const t = (req.headers.get('authorization') || '').replace(/^Bearer /, '');
  const e = makeToken();
  return t.length === e.length && timingSafeEqual(Buffer.from(t), Buffer.from(e));
}
