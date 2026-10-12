/** Normaliza e valida URLs; só aceita http/https (bloqueia javascript:, data: etc). */
export function normalizeUrl(input) {
  let v = (input || '').trim();
  if (!v) return null;
  if (!/^[a-z][a-z0-9+.-]*:/i.test(v)) v = 'https://' + v;
  try {
    const u = new URL(v);
    if (!['http:', 'https:'].includes(u.protocol) || !u.hostname.includes('.')) return null;
    return u.href;
  } catch { return null; }
}
export function addLink(links, { title, url }) {
  const href = normalizeUrl(url);
  const t = (title || '').trim();
  if (!t) return { error: 'Dê um título ao link.' };
  if (!href) return { error: 'URL inválida (use http ou https).' };
  if (links.some((l) => l.url === href)) return { error: 'Esse link já existe.' };
  return { links: [...links, { id: 'l' + Date.now().toString(36) + links.length, title: t.slice(0, 40), url: href, clicks: 0 }] };
}
export const removeLink = (links, id) => links.filter((l) => l.id !== id);
export const registerClick = (links, id) => links.map((l) => (l.id === id ? { ...l, clicks: l.clicks + 1 } : l));
export const totalClicks = (links) => links.reduce((s, l) => s + l.clicks, 0);
export const host = (url) => new URL(url).hostname.replace(/^www\./, '');
