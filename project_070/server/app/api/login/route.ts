import { checkPassword, makeToken } from '@/lib/auth';
export const dynamic = 'force-dynamic';
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  if (!checkPassword(body.password)) return Response.json({ error: 'Senha incorreta' }, { status: 401 });
  return Response.json({ token: makeToken() });
}
