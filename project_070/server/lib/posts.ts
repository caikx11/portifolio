import type Database from 'better-sqlite3';

export interface Post { id: number; slug: string; title: string; excerpt: string; body: string; published: boolean; createdAt: string; updatedAt: string }
export interface PostInput { title?: unknown; excerpt?: unknown; body?: unknown; published?: unknown }

export class ValidationError extends Error {}

export function slugify(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'post';
}

const row = (r: any): Post => ({ id: r.id, slug: r.slug, title: r.title, excerpt: r.excerpt, body: r.body, published: !!r.published, createdAt: r.created_at, updatedAt: r.updated_at });

function check(i: PostInput, partial: boolean) {
  const out: { title?: string; excerpt?: string; body?: string; published?: boolean } = {};
  if (!partial || i.title !== undefined) {
    if (typeof i.title !== 'string' || !i.title.trim() || i.title.length > 120) throw new ValidationError('Título obrigatório (até 120 caracteres)');
    out.title = i.title.trim();
  }
  if (!partial || i.body !== undefined) {
    if (typeof i.body !== 'string' || !i.body.trim()) throw new ValidationError('Texto obrigatório');
    out.body = i.body;
  }
  if (i.excerpt !== undefined) { if (typeof i.excerpt !== 'string' || i.excerpt.length > 300) throw new ValidationError('Resumo inválido (até 300 caracteres)'); out.excerpt = i.excerpt; }
  if (i.published !== undefined) { if (typeof i.published !== 'boolean') throw new ValidationError('published deve ser booleano'); out.published = i.published; }
  return out;
}

export function listPosts(db: Database.Database, opts: { all?: boolean } = {}): Post[] {
  const rows = db.prepare(`SELECT * FROM posts ${opts.all ? '' : 'WHERE published = 1'} ORDER BY created_at DESC, id DESC`).all();
  return rows.map(row);
}
export function getPost(db: Database.Database, key: string | number, opts: { all?: boolean } = {}): Post | null {
  const r = db.prepare(`SELECT * FROM posts WHERE ${typeof key === 'number' ? 'id' : 'slug'} = ?`).get(key);
  const p = r ? row(r) : null;
  return p && (opts.all || p.published) ? p : null;
}
export function createPost(db: Database.Database, input: PostInput): Post {
  const v = check(input, false);
  let slug = slugify(v.title!); const base = slug; let n = 2;
  while (db.prepare('SELECT 1 FROM posts WHERE slug = ?').get(slug)) slug = `${base}-${n++}`;
  const id = db.prepare('INSERT INTO posts (slug, title, excerpt, body, published) VALUES (?,?,?,?,?)')
    .run(slug, v.title, v.excerpt ?? v.body!.slice(0, 140), v.body, v.published ? 1 : 0).lastInsertRowid;
  return getPost(db, Number(id), { all: true })!;
}
export function updatePost(db: Database.Database, id: number, input: PostInput): Post | null {
  const cur = getPost(db, id, { all: true }); if (!cur) return null;
  const v = check(input, true);
  const m = { ...cur, ...v };
  db.prepare("UPDATE posts SET title=?, excerpt=?, body=?, published=?, updated_at=datetime('now') WHERE id=?").run(m.title, m.excerpt, m.body, m.published ? 1 : 0, id);
  return getPost(db, id, { all: true });
}
export function deletePost(db: Database.Database, id: number): boolean {
  return db.prepare('DELETE FROM posts WHERE id = ?').run(id).changes > 0;
}
