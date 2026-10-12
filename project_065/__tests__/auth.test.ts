import request from 'supertest';
import jwt from 'jsonwebtoken';
import { createApp } from '../src/app';
import { UserStore } from '../src/store';

const SECRET = 'segredo-de-teste-123456';
const make = (store = new UserStore()) => ({ store, app: createApp({ jwtSecret: SECRET, store, bcryptRounds: 4 }) });
const creds = { email: 'ana@exemplo.com', password: 'senha-forte-1', name: 'Ana' };

describe('POST /api/register', () => {
  it('cria usuário, devolve token e nunca expõe o hash', async () => {
    const { app, store } = make();
    const r = await request(app).post('/api/register').send(creds);
    expect(r.status).toBe(201);
    expect(r.body.token).toBeTruthy();
    expect(JSON.stringify(r.body)).not.toMatch(/passwordHash/);
    const stored = store.findByEmail(creds.email)!;
    expect(stored.passwordHash).not.toBe(creds.password);
    expect(stored.passwordHash).toMatch(/^\$2[aby]\$/);
  });
  it('rejeita e-mail inválido, senha curta e duplicado', async () => {
    const { app } = make();
    expect((await request(app).post('/api/register').send({ ...creds, email: 'x' })).status).toBe(400);
    expect((await request(app).post('/api/register').send({ ...creds, password: '123' })).status).toBe(400);
    await request(app).post('/api/register').send(creds);
    expect((await request(app).post('/api/register').send({ ...creds, email: 'ANA@exemplo.com' })).status).toBe(409);
  });
});

describe('POST /api/login', () => {
  it('autentica com credenciais corretas', async () => {
    const { app } = make();
    await request(app).post('/api/register').send(creds);
    const r = await request(app).post('/api/login').send({ email: creds.email, password: creds.password });
    expect(r.status).toBe(200);
    expect(r.body.user.email).toBe(creds.email);
  });
  it('nega senha errada e usuário inexistente com a mesma mensagem', async () => {
    const { app } = make();
    await request(app).post('/api/register').send(creds);
    const a = await request(app).post('/api/login').send({ email: creds.email, password: 'errada-errada' });
    const b = await request(app).post('/api/login').send({ email: 'x@y.co', password: 'qualquer-coisa' });
    expect(a.status).toBe(401); expect(b.status).toBe(401);
    expect(a.body.error).toBe(b.body.error);
  });
});

describe('GET /api/me', () => {
  it('retorna o usuário com token válido', async () => {
    const { app } = make();
    const { body } = await request(app).post('/api/register').send(creds);
    const r = await request(app).get('/api/me').set('Authorization', `Bearer ${body.token}`);
    expect(r.status).toBe(200);
    expect(r.body.user.name).toBe('Ana');
  });
  it('401 sem token, com token adulterado ou expirado', async () => {
    const { app } = make();
    const { body } = await request(app).post('/api/register').send(creds);
    expect((await request(app).get('/api/me')).status).toBe(401);
    expect((await request(app).get('/api/me').set('Authorization', `Bearer ${body.token}x`)).status).toBe(401);
    const expired = jwt.sign({ sub: '1' }, SECRET, { expiresIn: -10 });
    expect((await request(app).get('/api/me').set('Authorization', `Bearer ${expired}`)).status).toBe(401);
    const other = jwt.sign({ sub: '1' }, 'outro-segredo-qualquer-123');
    expect((await request(app).get('/api/me').set('Authorization', `Bearer ${other}`)).status).toBe(401);
  });
});

it('recusa segredo fraco', () => { expect(() => createApp({ jwtSecret: 'curto' })).toThrow(); });
