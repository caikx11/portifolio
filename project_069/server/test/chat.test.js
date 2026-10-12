const WebSocket = require('ws');
const { createChatServer } = require('../src/chat');

let server, url;
beforeEach((done) => { server = createChatServer(); server.listen(0, () => { url = `ws://localhost:${server.address().port}/ws`; done(); }); });
afterEach((done) => { server.closeAllConnections?.(); server.close(done); });

// cliente de teste: guarda mensagens recebidas e permite aguardar um predicado
function client() {
  const ws = new WebSocket(url); const got = [];
  const waiters = [];
  ws.on('message', (d) => { const m = JSON.parse(d); got.push(m); waiters.splice(0).forEach((w) => w()); });
  const until = (pred) => new Promise((ok, no) => {
    const t = setTimeout(() => no(new Error('timeout: ' + JSON.stringify(got))), 2000);
    const check = () => { const f = got.find(pred); if (f) { clearTimeout(t); ok(f); } else waiters.push(check); };
    check();
  });
  const opened = new Promise((r) => ws.on('open', r));
  return { ws, got, until, opened, send: (o) => ws.send(JSON.stringify(o)) };
}

test('mensagens chegam só para quem está na mesma sala', async () => {
  const a = client(), b = client(), c = client();
  await Promise.all([a.opened, b.opened, c.opened]);
  a.send({ type: 'join', room: 'geral', name: 'Ana' });
  b.send({ type: 'join', room: 'geral', name: 'Beto' });
  c.send({ type: 'join', room: 'outra', name: 'Cris' });
  await b.until((m) => m.type === 'presence' && m.users.length === 2);
  a.send({ type: 'msg', text: 'olá!' });
  const m = await b.until((m) => m.type === 'msg' && m.text === 'olá!');
  expect(m.user).toBe('Ana');
  await c.until((m) => m.type === 'presence');
  expect(c.got.some((x) => x.text === 'olá!')).toBe(false);
  [a, b, c].forEach((x) => x.ws.close());
});

test('novo membro recebe histórico e presença atualiza ao sair', async () => {
  const a = client(); await a.opened;
  a.send({ type: 'join', room: 'dev', name: 'Ana' }); a.send({ type: 'msg', text: 'primeira' });
  await a.until((m) => m.text === 'primeira');
  const b = client(); await b.opened; b.send({ type: 'join', room: 'dev', name: 'Beto' });
  const h = await b.until((m) => m.type === 'history');
  expect(h.messages.some((x) => x.text === 'primeira')).toBe(true);
  await a.until((m) => m.type === 'presence' && m.users.length === 2);
  b.ws.close();
  await a.until((m) => m.type === 'presence' && m.users.length === 1);
  a.ws.close();
});

test('valida sala, nome e estado', async () => {
  const a = client(); await a.opened;
  a.send({ type: 'msg', text: 'x' }); await a.until((m) => m.type === 'error' && /sala/.test(m.message));
  a.send({ type: 'join', room: 'Sala Ruim!', name: 'Ana' }); await a.until((m) => m.type === 'error' && /inválido/.test(m.message));
  a.send({ type: 'join', room: 'ok', name: '  ' }); await a.until((m) => m.type === 'error' && /nome/.test(m.message));
  a.ws.send('nao-json'); await a.until((m) => m.message === 'JSON inválido');
  a.ws.close();
});

test('trocar de sala sai da anterior', async () => {
  const a = client(), b = client(); await Promise.all([a.opened, b.opened]);
  a.send({ type: 'join', room: 'r1', name: 'Ana' }); b.send({ type: 'join', room: 'r1', name: 'Beto' });
  await b.until((m) => m.type === 'presence' && m.users.length === 2);
  a.send({ type: 'join', room: 'r2', name: 'Ana' });
  await b.until((m) => m.type === 'presence' && m.users.length === 1);
  a.ws.close(); b.ws.close();
});

test('GET /api/health', async () => {
  const r = await fetch(`http://localhost:${server.address().port}/api/health`);
  expect(await r.json()).toEqual({ ok: true, service: 'chat' });
});
