import { isAdmin } from '@/lib/auth';
import { getDb } from '@/lib/db';
import { deletePost, getPost, updatePost, ValidationError } from '@/lib/posts';
export const dynamic = 'force-dynamic';
type Ctx = { params: { id: string } };
const key = (id: string) => (/^\d+$/.test(id) ? Number(id) : id);
const nf = () => Response.json({ error: 'Post não encontrado' }, { status: 404 });
const unauth = () => Response.json({ error: 'Não autorizado' }, { status: 401 });

export async function GET(req: Request, { params }: Ctx) {
  const p = getPost(getDb(), key(params.id), { all: isAdmin(req) });
  return p ? Response.json(p) : nf();
}
export async function PUT(req: Request, { params }: Ctx) {
  if (!isAdmin(req)) return unauth();
  try { const p = updatePost(getDb(), Number(params.id), await req.json().catch(() => ({}))); return p ? Response.json(p) : nf(); }
  catch (e) { if (e instanceof ValidationError) return Response.json({ error: e.message }, { status: 400 }); throw e; }
}
export async function DELETE(req: Request, { params }: Ctx) {
  if (!isAdmin(req)) return unauth();
  return deletePost(getDb(), Number(params.id)) ? new Response(null, { status: 204 }) : nf();
}
export const OPTIONS = () => new Response(null, { status: 204 });
