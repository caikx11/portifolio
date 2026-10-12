import { notFound } from 'next/navigation';
import { getDb } from '@/lib/db';
import { getPost } from '@/lib/posts';
export const dynamic = 'force-dynamic';

export default function PostPage({ params }: { params: { slug: string } }) {
  const p = getPost(getDb(), params.slug);
  if (!p) notFound();
  return (<article><h1>{p.title}</h1>{p.body.split(/\n{2,}/).map((para, i) => <p key={i}>{para}</p>)}</article>);
}
