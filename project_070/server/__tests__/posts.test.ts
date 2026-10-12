import { createDb } from '@/lib/db';
import { createPost, deletePost, getPost, listPosts, slugify, updatePost, ValidationError } from '@/lib/posts';

const mk = () => createDb(':memory:');

test('slugify remove acentos e símbolos', () => {
  expect(slugify('Olá, Mundo! Ação')).toBe('ola-mundo-acao');
});
test('cria, gera slug único e esconde rascunhos do público', () => {
  const db = mk();
  const a = createPost(db, { title: 'Meu post', body: 'texto', published: true });
  const b = createPost(db, { title: 'Meu post', body: 'outro' });
  expect([a.slug, b.slug]).toEqual(['meu-post', 'meu-post-2']);
  expect(listPosts(db)).toHaveLength(1);
  expect(listPosts(db, { all: true })).toHaveLength(2);
  expect(getPost(db, 'meu-post-2')).toBeNull();
  expect(getPost(db, 'meu-post-2', { all: true })).not.toBeNull();
});
test('valida entrada', () => {
  const db = mk();
  expect(() => createPost(db, { title: '', body: 'x' })).toThrow(ValidationError);
  expect(() => createPost(db, { title: 'x', body: 'x', published: 'sim' })).toThrow(ValidationError);
});
test('atualiza parcialmente e exclui', () => {
  const db = mk(); const p = createPost(db, { title: 'A', body: 'b' });
  expect(updatePost(db, p.id, { published: true })!.published).toBe(true);
  expect(updatePost(db, 999, { title: 'x' })).toBeNull();
  expect(deletePost(db, p.id)).toBe(true);
  expect(deletePost(db, p.id)).toBe(false);
});
