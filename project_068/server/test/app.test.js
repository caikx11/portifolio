const request = require('supertest');
const { createApp } = require('../src/app');
const { openDb } = require('../src/db');

let app;
beforeEach(() => { app = createApp(openDb(':memory:'), { secret: 'teste' }); });
const signup = async (email = 'a@b.com') => (await request(app).post('/api/auth/register').send({ email, password: 'segredo1' })).body.token;
const bearer = (t) => ({ Authorization: `Bearer ${t}` });

test('registro valida e impede duplicidade', async () => {
  await request(app).post('/api/auth/register').send({ email: 'x', password: 'segredo1' }).expect(400);
  await request(app).post('/api/auth/register').send({ email: 'a@b.com', password: '123' }).expect(400);
  await signup();
  await request(app).post('/api/auth/register').send({ email: 'A@b.com', password: 'segredo1' }).expect(409);
});

test('login e /me', async () => {
  await signup();
  await request(app).post('/api/auth/login').send({ email: 'a@b.com', password: 'errada!' }).expect(401);
  const r = await request(app).post('/api/auth/login').send({ email: 'a@b.com', password: 'segredo1' }).expect(200);
  await request(app).get('/api/auth/me').set(bearer(r.body.token)).expect(200, { email: 'a@b.com' });
});

test('rotas de notas exigem token', async () => {
  await request(app).get('/api/notes').expect(401);
  await request(app).get('/api/notes').set(bearer('lixo')).expect(401);
});

test('CRUD de notas e busca', async () => {
  const t = await signup();
  const c = await request(app).post('/api/notes').set(bearer(t)).send({ title: 'Compras', body: 'leite e pão' }).expect(201);
  await request(app).post('/api/notes').set(bearer(t)).send({ title: '' }).expect(400);
  await request(app).put(`/api/notes/${c.body.id}`).set(bearer(t)).send({ body: 'leite, pão e café' }).expect(200);
  const l = await request(app).get('/api/notes?q=café').set(bearer(t)).expect(200);
  expect(l.body).toHaveLength(1);
  await request(app).get('/api/notes?q=zzz').set(bearer(t)).expect(200, []);
  await request(app).delete(`/api/notes/${c.body.id}`).set(bearer(t)).expect(204);
  await request(app).get(`/api/notes/${c.body.id}`).set(bearer(t)).expect(404);
});

test('usuário não acessa notas de outro', async () => {
  const a = await signup('a@b.com'); const b = await signup('b@b.com');
  const n = await request(app).post('/api/notes').set(bearer(a)).send({ title: 'privada' });
  await request(app).get(`/api/notes/${n.body.id}`).set(bearer(b)).expect(404);
  await request(app).delete(`/api/notes/${n.body.id}`).set(bearer(b)).expect(404);
  await request(app).get('/api/notes').set(bearer(b)).expect(200, []);
});
