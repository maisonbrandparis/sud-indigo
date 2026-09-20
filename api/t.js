import { rpc, anonIp, visiteurId, geo, appareil, navigateur } from './_lib.js';

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ ok: false });
  try {
    const body = req.body || {};
    const ip = anonIp(req);
    const ua = req.headers['user-agent'] || '';
    const g = geo(req);
    await rpc('sud_track', {
      p_visiteur: visiteurId(req),
      p_session: String(body.session || '').slice(0, 64),
      p_chemin: String(body.chemin || '/').slice(0, 300),
      p_referent: String(body.referent || '').slice(0, 300),
      p_ville: g.ville,
      p_region: g.region,
      p_pays: g.pays,
      p_ip_anon: ip,
      p_appareil: appareil(ua),
      p_navigateur: navigateur(ua),
      p_langue: String(req.headers['accept-language'] || '').split(',')[0].slice(0, 20)
    });
    res.status(200).json({ ok: true });
  } catch (e) {
    res.status(200).json({ ok: false });
  }
}
