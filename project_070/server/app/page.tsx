import Link from 'next/link';
import { getDb } from '@/lib/db';
import { listPosts } from '@/lib/posts';
export const dynamic = 'force-dynamic';

export default function Home() {
  const posts = listPosts(getDb());
  return (<>
    <h1>Últimos posts</h1>
    {posts.length === 0 && <p>Nenhum post publicado ainda. Crie o primeiro no <Link href="/admin">painel</Link>.</p>}
    {posts.map((p) => (
      <article key={p.id} className="card">
        <h2><Link href={`/posts/${p.slug}`}>{p.title}</Link></h2>
        <p>{p.excerpt}</p><small>{new Date(p.createdAt.replace(' ', 'T') + 'Z').toLocaleDateString('pt-BR')}</small>
      </article>
    ))}
  </>);
}
