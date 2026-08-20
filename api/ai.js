// Proxy IA — garde la clé API Anthropic uniquement côté serveur.
// Le navigateur envoie juste le texte du prompt ; cette fonction ajoute
// la clé secrète (jamais visible côté client) et transmet la réponse.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  const API_KEY = process.env.ANTHROPIC_API_KEY;
  if (!API_KEY) {
    return res.status(500).json({ error: "Clé API non configurée sur le serveur (variable ANTHROPIC_API_KEY manquante)" });
  }

  const { prompt } = req.body || {};
  if (!prompt) {
    return res.status(400).json({ error: 'prompt manquant' });
  }

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1500,
        messages: [{ role: 'user', content: prompt }]
      })
    });
    const data = await r.json();
    if (!r.ok) {
      return res.status(r.status).json({ error: data });
    }
    return res.status(200).json(data);
  } catch (e) {
    return res.status(500).json({ error: e.message || 'Erreur inconnue' });
  }
}
