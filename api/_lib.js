import { createHash } from 'node:crypto';

const URL_BASE = process.env.SUPA_URL;
const KEY = process.env.SUPA_KEY;

export async function rpc(fn, args) {
  const r = await fetch(`${URL_BASE}/rest/v1/rpc/${fn}`, {
    method: 'POST',
    headers: {
      apikey: KEY,
      Authorization: `Bearer ${KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(args)
  });
  const txt = await r.text();
  if (!r.ok) throw new Error(txt.slice(0, 300));
  return txt ? JSON.parse(txt) : null;
}

function ipBrute(req) {
  const h = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || '';
  return String(h).split(',')[0].trim();
}

export function anonIp(req) {
  const ip = ipBrute(req);
  if (!ip) return '';
  if (ip.includes(':')) return ip.split(':').slice(0, 4).join(':') + '::';
  const p = ip.split('.');
  return p.length === 4 ? `${p[0]}.${p[1]}.${p[2]}.0` : '';
}

export function visiteurId(req) {
  const mois = new Date().toISOString().slice(0, 7);
  const base = ipBrute(req) + '|' + (req.headers['user-agent'] || '') + '|' + mois + '|' + (process.env.SUD_SEL || 'sud');
  return createHash('sha256').update(base).digest('hex').slice(0, 32);
}

function dec(v) {
  try { return decodeURIComponent(String(v || '')); } catch { return String(v || ''); }
}

export function geo(req) {
  return {
    ville: dec(req.headers['x-vercel-ip-city']).slice(0, 120),
    region: dec(req.headers['x-vercel-ip-country-region']).slice(0, 120),
    pays: dec(req.headers['x-vercel-ip-country']).slice(0, 8)
  };
}

export function appareil(ua) {
  const s = (ua || '').toLowerCase();
  if (/ipad|tablet/.test(s)) return 'tablette';
  if (/mobi|iphone|android/.test(s)) return 'mobile';
  if (/bot|crawl|spider|preview|monitor/.test(s)) return 'robot';
  return 'ordinateur';
}

export function navigateur(ua) {
  const s = ua || '';
  if (/Edg\//.test(s)) return 'Edge';
  if (/OPR\//.test(s)) return 'Opera';
  if (/Chrome\//.test(s)) return 'Chrome';
  if (/Firefox\//.test(s)) return 'Firefox';
  if (/Safari\//.test(s)) return 'Safari';
  return 'autre';
}
