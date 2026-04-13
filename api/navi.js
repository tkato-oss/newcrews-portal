// Vercel Serverless Function - NaviCrew API proxy
// NAVI_API_KEY and NAVI_API_BASE are set in Vercel environment variables (server-side only, never exposed)

const LAMBDA_BASE = process.env.NAVI_API_BASE || "https://kn3dj4dyskmja7ehxdan4kdtmu0konod.lambda-url.ap-northeast-1.on.aws";
const API_KEY = process.env.NAVI_API_KEY || "";

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Extract the sub-path from query parameter
  const action = req.query.action;
  const allowedActions = ['history', 'resolve', 'import', 'delete'];
  if (!action || !allowedActions.includes(action)) {
    return res.status(400).json({ error: 'Invalid action' });
  }

  if (!API_KEY) {
    return res.status(500).json({ error: 'Server configuration error: API key not set' });
  }

  try {
    const response = await fetch(`${LAMBDA_BASE}/api/navi/${action}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': API_KEY,
      },
      body: JSON.stringify(req.body || {}),
    });
    const data = await response.json();
    res.status(response.status).json(data);
  } catch (e) {
    res.status(500).json({ error: 'Proxy error: ' + e.message });
  }
}
