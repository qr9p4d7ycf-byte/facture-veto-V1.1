// Proxy IA — garde la clé API secrète côté serveur.
// Utilise Groq (gratuit, sans carte bancaire, console.groq.com) au lieu
// d'Anthropic. L'API de Groq est compatible OpenAI ; on renvoie la réponse
// normalisée au même format que l'API Anthropic pour ne rien changer côté
// front-end (index.html attend toujours { content: [{ type:'text', text }] }).

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  const API_KEY = process.env.GROQ_API_KEY;
  if (!API_KEY) {
    return res.status(500).json({ error: "Clé API non configurée sur le serveur (variable GROQ_API_KEY manquante)" });
  }

  const { prompt } = req.body || {};
  if (!prompt) {
    return res.status(400).json({ error: 'prompt manquant' });
  }

  try {
    const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 1500,
        temperature: 0.2,
        messages: [{ role: 'user', content: prompt }]
      })
    });
    const data = await r.json();
    if (!r.ok) {
      return res.status(r.status).json({ error: data });
    }
    const text = data.choices?.[0]?.message?.content || '';
    return res.status(200).json({ content: [{ type: 'text', text }] });
  } catch (e) {
    return res.status(500).json({ error: e.message || 'Erreur inconnue' });
  }
}

