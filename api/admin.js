import { rpc } from './_lib.js';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ ok: false });
  const body = req.body || {};
  const pass = String(body.pass || '');
  if (!process.env.ADMIN_PASS || pass !== process.env.ADMIN_PASS) {
    await new Promise(r => setTimeout(r, 700));
    return res.status(401).json({ ok: false, erreur: 'Mot de passe incorrect.' });
  }
  try {
    if (body.action === 'statut') {
      await rpc('sud_msg_statut', {
        p_secret: process.env.SUD_SECRET,
        p_id: Number(body.id),
        p_statut: String(body.statut || 'traite').slice(0, 20),
        p_note: body.note == null ? null : String(body.note).slice(0, 2000)
      });
      return res.status(200).json({ ok: true });
    }
    const jours = Math.min(365, Math.max(1, Number(body.jours) || 30));
    const data = await rpc('sud_admin_data', { p_secret: process.env.SUD_SECRET, p_jours: jours });
    res.status(200).json({ ok: true, data });
  } catch (e) {
    res.status(500).json({ ok: false, erreur: String(e.message || '').slice(0, 200) });
  }
}
