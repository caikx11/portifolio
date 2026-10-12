import { normalizeUrl, addLink, removeLink, registerClick, totalClicks } from '../lib/links.js';
test('normaliza e bloqueia protocolos perigosos', () => {
  expect(normalizeUrl('exemplo.com/a')).toBe('https://exemplo.com/a');
  expect(normalizeUrl('javascript:alert(1)')).toBeNull();
  expect(normalizeUrl('semponto')).toBeNull();
});
test('adiciona, evita duplicado e valida título', () => {
  const r = addLink([], { title: 'Site', url: 'a.com' });
  expect(r.links).toHaveLength(1);
  expect(addLink(r.links, { title: 'X', url: 'a.com' }).error).toMatch(/existe/);
  expect(addLink([], { title: '', url: 'a.com' }).error).toBeTruthy();
});
test('cliques e remoção', () => {
  const { links } = addLink([], { title: 'S', url: 'a.com' });
  const c = registerClick(registerClick(links, links[0].id), links[0].id);
  expect(totalClicks(c)).toBe(2);
  expect(removeLink(c, links[0].id)).toEqual([]);
});
