// /api/proxy.js — pass-through Canvas proxy for Vercel serverless

const fetch = require('node-fetch');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  try {
    const { canvasUrl, endpoint, apiToken, method, body } = req.body || {};

    if (!canvasUrl || !endpoint || !apiToken || !method) {
      return res.status(400).json({ error: 'Missing required parameters in request body.' });
    }

    // Debug: confirm keys like answer_text are present on the server
    try {
      console.log('[proxy] question keys:', Object.keys(body?.question || {}));
      console.log('[proxy] answers keys:', (body?.question?.answers || []).map(a => Object.keys(a)));
    } catch {}

    const resp = await fetch(`${canvasUrl}${endpoint}`, {
      method,
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: body ? JSON.stringify(body) : undefined
    });

    const text = await resp.text();
    let json = null;
    try { json = JSON.parse(text); } catch {}

    if (!resp.ok) {
      return res.status(resp.status).json(json || { message: text || 'Canvas error' });
    }

    return json ? res.status(resp.status).json(json) : res.status(resp.status).end();
  } catch (e) {
    console.error('[proxy] error', e);
    res.status(500).json({ error: e?.message || 'Proxy error' });
  }
};
