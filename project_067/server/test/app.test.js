const request = require('supertest');
const { createApp } = require('../src/app');
const { openDb } = require('../src/db');

let app;
beforeEach(() => { app = createApp(openDb(':memory:')); });

test('cria link com slug aleatório e lista', async () => {
  const r = await request(app).post('/api/links').send({ url: 'https://example.com/x' }).expect(201);
  expect(r.body.slug).toMatch(/^[a-zA-Z0-9]{6}$/);
  expect(r.body.clicks).toBe(0);
  const l = await request(app).get('/api/links').expect(200);
  expect(l.body).toHaveLength(1);
});

test('slug customizado, duplicado e inválido', async () => {
  await request(app).post('/api/links').send({ url: 'https://a.com', slug: 'meu-link' }).expect(201);
  await request(app).post('/api/links').send({ url: 'https://b.com', slug: 'meu-link' }).expect(409);
  await request(app).post('/api/links').send({ url: 'https://b.com', slug: 'api' }).expect(400);
  await request(app).post('/api/links').send({ url: 'https://b.com', slug: 'a b' }).expect(400);
});

test('rejeita URL inválida', async () => {
  await request(app).post('/api/links').send({ url: 'javascript:alert(1)' }).expect(400);
  await request(app).post('/api/links').send({}).expect(400);
});

test('redireciona e conta cliques', async () => {
  await request(app).post('/api/links').send({ url: 'https://example.com', slug: 'abc' });
  const r = await request(app).get('/abc').set('Referer', 'https://t.co').expect(302);
  expect(r.headers.location).toBe('https://example.com');
  await request(app).get('/abc').expect(302);
  const s = await request(app).get('/api/links/abc').expect(200);
  expect(s.body.clicks).toBe(2);
  expect(s.body.recent[1].referrer).toBe('https://t.co');
});

test('404 e delete', async () => {
  await request(app).get('/nope').expect(404);
  await request(app).post('/api/links').send({ url: 'https://a.com', slug: 'del' });
  await request(app).delete('/api/links/del').expect(204);
  await request(app).delete('/api/links/del').expect(404);
});
