/* Demo da API de autenticação. Modo "mock" reimplementa as rotas no navegador
   (PBKDF2 + JWT HS256 via WebCrypto, usuários em localStorage). */
(() => {
  const $ = (s) => document.querySelector(s);
  const enc = new TextEncoder();
  const b64u = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const b64uStr = (s) => b64u(enc.encode(s));
  const fromB64u = (s) => atob(s.replace(/-/g, '+').replace(/_/g, '/'));
  const SECRET = 'segredo-somente-demo-no-navegador';
  const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const DB = 'chave-mestra-users';
  let mode = 'mock', token = null;

  const load = () => { try { return JSON.parse(localStorage.getItem(DB)) || []; } catch { return []; } };
  const save = (u) => { try { localStorage.setItem(DB, JSON.stringify(u)); } catch {} };

  async function hash(password, salt) {
    const key = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']);
    const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: enc.encode(salt), iterations: 100000 }, key, 256);
    return b64u(bits);
  }
  async function hmac(data) {
    const key = await crypto.subtle.importKey('raw', enc.encode(SECRET), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
    return b64u(await crypto.subtle.sign('HMAC', key, enc.encode(data)));
  }
  async function sign(user) {
    const now = Math.floor(Date.now() / 1000);
    const body = b64uStr(JSON.stringify({ alg: 'HS256', typ: 'JWT' })) + '.' + b64uStr(JSON.stringify({ sub: String(user.id), iat: now, exp: now + 3600 }));
    return body + '.' + (await hmac(body));
  }
  async function verify(t) {
    const p = (t || '').split('.');
    if (p.length !== 3 || (await hmac(p[0] + '.' + p[1])) !== p[2]) return null;
    const payload = JSON.parse(fromB64u(p[1]));
    return payload.exp * 1000 > Date.now() ? payload : null;
  }
  const pub = (u) => ({ id: u.id, email: u.email, name: u.name, createdAt: u.createdAt });

  const mock = {
    async register({ email, password, name }) {
      if (typeof email !== 'string' || !EMAIL.test(email)) return [400, { error: 'E-mail inválido' }];
      if (typeof password !== 'string' || password.length < 8) return [400, { error: 'A senha precisa de ao menos 8 caracteres' }];
      if (!name || !name.trim()) return [400, { error: 'Nome obrigatório' }];
      const users = load(), e = email.toLowerCase();
      if (users.some((u) => u.email === e)) return [409, { error: 'E-mail já cadastrado' }];
      const salt = crypto.randomUUID();
      const user = { id: users.length + 1, email: e, name: name.trim(), salt, hash: await hash(password, salt), createdAt: new Date().toISOString() };
      save([...users, user]);
      return [201, { user: pub(user), token: await sign(user) }];
    },
    async login({ email, password }) {
      const user = load().find((u) => u.email === String(email || '').toLowerCase());
      if (!user || (await hash(String(password || ''), user.salt)) !== user.hash) return [401, { error: 'Credenciais inválidas' }];
      return [200, { user: pub(user), token: await sign(user) }];
    },
    async me(t) {
      if (!t) return [401, { error: 'Token ausente' }];
      const payload = await verify(t);
      if (!payload) return [401, { error: 'Token inválido ou expirado' }];
      const user = load().find((u) => String(u.id) === payload.sub);
      return user ? [200, { user: pub(user) }] : [404, { error: 'Usuário não encontrado' }];
    },
  };

  async function call(method, path, body) {
    let status, data;
    try {
      if (mode === 'mock') {
        [status, data] = path === '/api/register' ? await mock.register(body) : path === '/api/login' ? await mock.login(body) : await mock.me(token);
      } else {
        const res = await fetch($('#api-url').value.replace(/\/$/, '') + path, {
          method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) },
          body: body ? JSON.stringify(body) : undefined,
        });
        status = res.status; data = await res.json();
      }
    } catch { status = 0; data = { error: 'Falha de rede: a API está rodando em ' + $('#api-url').value + '?' }; }
    logReq(method, path, status);
    return [status, data];
  }

  function logReq(method, path, status) {
    const ol = $('#log');
    ol.querySelector('.none')?.remove();
    const li = document.createElement('li');
    li.innerHTML = `<span>${new Date().toLocaleTimeString('pt-BR')}</span><b>${method}</b><span>${path}</span><span class="s${String(status)[0]}">${status || 'ERR'}</span>`;
    ol.prepend(li);
  }
  const say = (t, cls) => { const m = $('#msg'); m.textContent = t; m.className = 'msg ' + (cls || ''); };

  function showSession(t) {
    token = t;
    $('#sess').hidden = !t; $('#sess-empty').hidden = !!t;
    if (t) {
      $('#jwt').textContent = t;
      try { $('#payload').textContent = JSON.stringify(JSON.parse(fromB64u(t.split('.')[1])), null, 2); } catch { $('#payload').textContent = '—'; }
      $('#me').textContent = '—';
    }
  }

  async function submit(e, path) {
    e.preventDefault();
    const body = Object.fromEntries(new FormData(e.target));
    say('Enviando…');
    const [status, data] = await call('POST', path, body);
    if (status >= 200 && status < 300) { say(`Bem-vindo(a), ${data.user.name}!`, 'ok'); showSession(data.token); e.target.reset(); }
    else say(data.error || 'Erro', 'err');
  }
  $('#form-reg').addEventListener('submit', (e) => submit(e, '/api/register'));
  $('#form-log').addEventListener('submit', (e) => submit(e, '/api/login'));
  $('#btn-me').addEventListener('click', async () => {
    const [status, data] = await call('GET', '/api/me');
    $('#me').textContent = status + '\n' + JSON.stringify(data, null, 2);
  });
  $('#btn-out').addEventListener('click', () => { showSession(null); say('Sessão encerrada.', 'ok'); });

  function tab(which) {
    const reg = which === 'reg';
    $('#tab-reg').setAttribute('aria-selected', reg); $('#tab-log').setAttribute('aria-selected', !reg);
    $('#form-reg').hidden = !reg; $('#form-log').hidden = reg; say('');
  }
  $('#tab-reg').onclick = () => tab('reg'); $('#tab-log').onclick = () => tab('log');

  function setMode(m) {
    mode = m;
    $('#m-mock').setAttribute('aria-pressed', m === 'mock'); $('#m-api').setAttribute('aria-pressed', m === 'api');
    $('#api-row').hidden = m === 'mock';
    $('#mode-note').textContent = m === 'mock' ? 'Modo mock: tudo roda neste navegador (localStorage). Nenhum dado sai daqui.' : 'API real: rode "JWT_SECRET=... npm run dev" e informe a URL (a API precisa permitir CORS).';
    showSession(null); say('');
  }
  $('#m-mock').onclick = () => setMode('mock'); $('#m-api').onclick = () => setMode('api');
})();
