const http = require('node:http');
const { WebSocketServer, WebSocket } = require('ws');

const ROOM_RE = /^[a-z0-9-]{1,24}$/;
const HISTORY = 50;

function createChatServer() {
  const rooms = new Map(); // nome -> { clients:Set<ws>, messages:[] }
  const room = (n) => { if (!rooms.has(n)) rooms.set(n, { clients: new Set(), messages: [] }); return rooms.get(n); };
  const send = (ws, o) => ws.readyState === WebSocket.OPEN && ws.send(JSON.stringify(o));
  const broadcast = (r, o) => r.clients.forEach((c) => send(c, o));
  const presence = (name) => { const r = room(name); broadcast(r, { type: 'presence', room: name, users: [...r.clients].map((c) => c.user) }); };

  const server = http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    if (req.url === '/api/health') { res.setHeader('Content-Type', 'application/json'); return res.end('{"ok":true,"service":"chat"}'); }
    if (req.url === '/api/rooms') {
      res.setHeader('Content-Type', 'application/json');
      return res.end(JSON.stringify([...rooms].map(([name, r]) => ({ name, users: r.clients.size, messages: r.messages.length }))));
    }
    res.statusCode = 404; res.end();
  });
  const wss = new WebSocketServer({ server, path: '/ws' });

  function leave(ws) {
    if (!ws.room) return;
    const old = ws.room; room(old).clients.delete(ws); ws.room = null; presence(old);
  }

  wss.on('connection', (ws) => {
    ws.user = null; ws.room = null;
    ws.on('message', (raw) => {
      let m; try { m = JSON.parse(raw); } catch { return send(ws, { type: 'error', message: 'JSON inválido' }); }
      if (m.type === 'join') {
        const name = String(m.name || '').trim().slice(0, 20); const rn = String(m.room || '');
        if (!name) return send(ws, { type: 'error', message: 'Informe um nome' });
        if (!ROOM_RE.test(rn)) return send(ws, { type: 'error', message: 'Nome de sala inválido (a-z, 0-9, -)' });
        leave(ws); ws.user = name; ws.room = rn;
        const r = room(rn); r.clients.add(ws);
        send(ws, { type: 'history', room: rn, messages: r.messages });
        const sys = { type: 'msg', id: Date.now() + Math.random(), system: true, text: `${name} entrou`, at: Date.now() };
        r.messages.push(sys); r.messages = r.messages.slice(-HISTORY); broadcast(r, sys); presence(rn);
      } else if (m.type === 'msg') {
        if (!ws.room) return send(ws, { type: 'error', message: 'Entre em uma sala primeiro' });
        const text = String(m.text || '').trim().slice(0, 500);
        if (!text) return;
        const r = room(ws.room);
        const msg = { type: 'msg', id: Date.now() + Math.random(), user: ws.user, text, at: Date.now() };
        r.messages.push(msg); r.messages = r.messages.slice(-HISTORY); broadcast(r, msg);
      } else send(ws, { type: 'error', message: 'Tipo desconhecido' });
    });
    ws.on('close', () => leave(ws));
  });
  return server;
}
module.exports = { createChatServer };
