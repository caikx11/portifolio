import { renderMarkdown, readingTime, filterPosts, inline } from '../lib/markdown.js';

test('renderiza títulos, listas e ênfase', () => {
  const html = renderMarkdown('# Oi\n\nTexto **forte** e *itálico*\n\n- a\n- b');
  expect(html).toContain('<h2>Oi</h2>');
  expect(html).toContain('<strong>forte</strong>');
  expect(html).toContain('<em>itálico</em>');
  expect(html).toContain('<ul><li>a</li><li>b</li></ul>');
});
test('escapa HTML perigoso e bloqueia javascript: em links', () => {
  expect(inline('<script>x</script>')).not.toContain('<script>');
  expect(inline('[x](javascript:alert(1))')).not.toContain('<a ');
});
test('blocos de código preservam conteúdo', () => {
  expect(renderMarkdown('```\n<b>&\n```')).toContain('<pre><code>&lt;b&gt;&amp;</code></pre>');
});
test('tempo de leitura mínimo 1 min', () => { expect(readingTime('oi')).toBe(1); expect(readingTime('a '.repeat(600))).toBe(3); });
test('filtra por tag e busca', () => {
  const posts = [{ title: 'A', excerpt: '', body: 'next', tags: ['x'] }, { title: 'B', excerpt: '', body: 'react', tags: ['y'] }];
  expect(filterPosts(posts, { tag: 'y' })).toHaveLength(1);
  expect(filterPosts(posts, { query: 'NEXT' })[0].title).toBe('A');
});
