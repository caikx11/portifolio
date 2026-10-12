process.env.DB_FILE = ':memory:';
process.env.ADMIN_PASSWORD = 'segredo';
import { POST as login } from '@/app/api/login/route';
import { GET as list, POST as create } from '@/app/api/posts/route';
import { DELETE, GET as one, PUT } from '@/app/api/posts/[id]/route';

const json = (url: string, init: RequestInit & { token?: string } = {}) =>
  new Request('http://t' + url, { ...init, headers: { 'Content-Type': 'application/json', ...(init.token ? { Authorization: 'Bearer ' + init.token } : {}) } });

test('fluxo: login, criar, publicar, listar público, excluir', async () => {
  expect((await login(json('/api/login', { method: 'POST', body: JSON.stringify({ password: 'x' }) }))).status).toBe(401);
  const { token } = await (await login(json('/api/login', { method: 'POST', body: JSON.stringify({ password: 'segredo' }) }))).json();

  expect((await create(json('/api/posts', { method: 'POST', body: '{}' }))).status).toBe(401);
  expect((await create(json('/api/posts', { method: 'POST', token, body: '{}' }))).status).toBe(400);
  const c = await create(json('/api/posts', { method: 'POST', token, body: JSON.stringify({ title: 'Olá', body: 'corpo' }) }));
  expect(c.status).toBe(201);
  const post = await c.json();

  expect(await (await list(json('/api/posts'))).json()).toEqual([]);
  expect((await list(json('/api/posts?all=1'))).status).toBe(401);
  expect((await (await list(json('/api/posts?all=1', { token }))).json())).toHaveLength(1);

  const up = await PUT(json('/api/posts/1', { method: 'PUT', token, body: JSON.stringify({ published: true }) }), { params: { id: String(post.id) } });
  expect((await up.json()).published).toBe(true);
  expect((await one(json('/api/posts/ola'), { params: { id: 'ola' } })).status).toBe(200);

  expect((await DELETE(json('/api/posts/1', { method: 'DELETE', token }), { params: { id: '1' } })).status).toBe(204);
  expect((await one(json('/api/posts/1'), { params: { id: '1' } })).status).toBe(404);
});
