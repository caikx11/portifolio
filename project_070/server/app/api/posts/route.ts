import { isAdmin } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { createPost, listPosts, ValidationError } from '@/lib/posts';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const all = new URL(req.url).searchParams.get('all') === '1';
  if (all && !isAdmin(req)) return Response.json({ error: 'Não autorizado' }, { status: 401 });
  return Response.json(listPosts(getDb(), { all }));
}
export async function POST(req: Request) {
  if (!isAdmin(req)) return Response.json({ error: 'Não autorizado' }, { status: 401 });
  try { return Response.json(createPost(getDb(), await req.json().catch(() => ({}))), { status: 201 }); }
  catch (e) { if (e instanceof ValidationError) return Response.json({ error: e.message }, { status: 400 }); throw e; }
}
