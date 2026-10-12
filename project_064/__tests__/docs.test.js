import { docs, searchDocs, neighbors } from '../lib/docs.js';
import { renderMarkdown, headings, slugify } from '../lib/markdown.js';
test('busca prioriza título e ignora acentos', () => {
  const r = searchDocs(docs, 'instalacao');
  expect(r[0].doc.slug).toBe('instalacao');
});
test('exige todos os termos; vazio retorna []', () => {
  expect(searchDocs(docs, '')).toEqual([]);
  expect(searchDocs(docs, 'npm zzzzinexistente')).toEqual([]);
  expect(searchDocs(docs, 'localstorage').length).toBeGreaterThan(0);
});
test('vizinhos prev/next', () => {
  expect(neighbors(docs, docs[0].slug).prev).toBeNull();
  expect(neighbors(docs, docs[1].slug).next.slug).toBe(docs[2].slug);
});
test('títulos ganham id e sumário', () => {
  expect(slugify('Variáveis disponíveis')).toBe('variaveis-disponiveis');
  expect(renderMarkdown('## Olá Mundo')).toContain('id="ola-mundo"');
  expect(headings('# a\n## B c\ntexto')).toEqual([{ text: 'B c', id: 'b-c' }]);
});
