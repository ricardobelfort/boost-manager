export default async function handler(req, res) {
  const { base = 'USD' } = req.query;
  const apiUrl = `https://api.exchangerate.host/latest?base=${base}`;

  try {
    const response = await fetch(apiUrl);
    const data = await response.json();

    // Permitir CORS (opcional)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Se for uma requisição OPTIONS (preflight)
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch rates.' });
  }
}
