import { rpc, anonIp, geo } from './_lib.js';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ ok: false });
  const body = req.body || {};
  if (body.site) return res.status(200).json({ ok: true });           // piège à robots
  const message = String(body.message || '').trim();
  if (message.length < 5) return res.status(400).json({ ok: false, erreur: 'Message trop court.' });
  const anonyme = body.anonyme === true || body.anonyme === 'true';
  try {
    const g = geo(req);
    const id = await rpc('sud_msg', {
      p_nom: anonyme ? null : String(body.nom || '').trim().slice(0, 120),
      p_contact: anonyme ? null : String(body.contact || '').trim().slice(0, 180),
      p_sujet: String(body.sujet || '').trim().slice(0, 160),
      p_message: message.slice(0, 5000),
      p_anonyme: anonyme,
      p_chemin: String(body.chemin || '').slice(0, 300),
      p_ville: g.ville,
      p_pays: g.pays,
      p_ip_anon: anonIp(req)
    });
    res.status(200).json({ ok: true, id });
  } catch (e) {
    const m = String(e.message || '');
    if (m.includes('trop de messages')) {
      return res.status(429).json({ ok: false, erreur: "Plusieurs messages ont déjà été envoyés. Réessayez dans quelques minutes." });
    }
    res.status(500).json({ ok: false, erreur: "Envoi impossible pour le moment. Écrivez à lahouaria.ameurmessaoud@sud-indigo.com" });
  }
}
