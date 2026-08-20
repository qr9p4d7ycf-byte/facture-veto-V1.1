// Proxy de stockage — remplace window.storage (spécifique à Claude) par une
// vraie base de données Supabase. La clé de service Supabase ne quitte
// jamais ce serveur : le navigateur ne parle qu'à cette fonction.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return res.status(500).json({ error: "Configuration serveur manquante (variables d'environnement Supabase)" });
  }

  const { action, key, value, prefix } = req.body || {};
  const headers = {
    apikey: SUPABASE_KEY,
    Authorization: `Bearer ${SUPABASE_KEY}`,
    'Content-Type': 'application/json'
  };

  try {
    if (action === 'get') {
      if (!key) return res.status(400).json({ error: 'key manquante' });
      const r = await fetch(
        `${SUPABASE_URL}/rest/v1/kv_store?key=eq.${encodeURIComponent(key)}&select=value`,
        { headers }
      );
      if (!r.ok) return res.status(500).json({ error: await r.text() });
      const rows = await r.json();
      return res.status(200).json({ value: Array.isArray(rows) && rows.length ? rows[0].value : null });
    }

    if (action === 'set') {
      if (!key) return res.status(400).json({ error: 'key manquante' });
      const r = await fetch(`${SUPABASE_URL}/rest/v1/kv_store?on_conflict=key`, {
        method: 'POST',
        headers: { ...headers, Prefer: 'resolution=merge-duplicates' },
        body: JSON.stringify([{ key, value: value ?? '', updated_at: new Date().toISOString() }])
      });
      if (!r.ok) return res.status(500).json({ error: await r.text() });
      return res.status(200).json({ ok: true });
    }

    if (action === 'delete') {
      if (!key) return res.status(400).json({ error: 'key manquante' });
      const r = await fetch(`${SUPABASE_URL}/rest/v1/kv_store?key=eq.${encodeURIComponent(key)}`, {
        method: 'DELETE',
        headers
      });
      return res.status(200).json({ ok: r.ok });
    }

    if (action === 'list') {
      const p = prefix || '';
      const r = await fetch(
        `${SUPABASE_URL}/rest/v1/kv_store?key=like.${encodeURIComponent(p)}*&select=key`,
        { headers }
      );
      if (!r.ok) return res.status(500).json({ error: await r.text() });
      const rows = await r.json();
      return res.status(200).json({ keys: Array.isArray(rows) ? rows.map((x) => x.key) : [] });
    }

    return res.status(400).json({ error: 'action inconnue' });
  } catch (e) {
    return res.status(500).json({ error: e.message || 'Erreur inconnue' });
  }
}
