import 'reflect-metadata';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { setupApp } from '../src/setup';

describe('Todos (e2e)', () => {
  let app: INestApplication;
  beforeEach(async () => {
    const mod = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = setupApp(mod.createNestApplication());
    await app.init();
  });
  afterEach(() => app.close());

  it('GET /api/health', () => request(app.getHttpServer()).get('/api/health').expect(200, { ok: true, service: 'todo-api' }));

  it('fluxo CRUD completo', async () => {
    const http = app.getHttpServer();
    const created = await request(http).post('/api/todos').send({ title: 'Comprar café', priority: 'alta' }).expect(201);
    expect(created.body).toMatchObject({ id: 1, title: 'Comprar café', priority: 'alta', done: false });
    await request(http).patch('/api/todos/1').send({ done: true }).expect(200).expect((r) => expect(r.body.done).toBe(true));
    await request(http).get('/api/todos?done=true').expect(200).expect((r) => expect(r.body).toHaveLength(1));
    await request(http).get('/api/todos?done=false').expect(200, []);
    await request(http).delete('/api/todos/1').expect(204);
    await request(http).get('/api/todos/1').expect(404);
  });

  it('valida entrada', async () => {
    const http = app.getHttpServer();
    await request(http).post('/api/todos').send({}).expect(400);
    await request(http).post('/api/todos').send({ title: 'x', priority: 'urgente' }).expect(400);
    await request(http).post('/api/todos').send({ title: 'x', hack: 1 }).expect(400);
    await request(http).patch('/api/todos/abc').send({}).expect(400);
  });
});
