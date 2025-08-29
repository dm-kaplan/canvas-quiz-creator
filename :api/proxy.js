// /api/proxy.js

const fetch = require('node-fetch');

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method Not Allowed' });
        return;
    }

    try {
        const { canvasUrl, endpoint, apiToken, method, body } = req.body;

        if (!canvasUrl || !endpoint || !apiToken || !method) {
            return res.status(400).json({ error: 'Missing required parameters in request body.' });
        }
        
        const headers = {
            'Authorization': `Bearer ${apiToken}`,
            'Content-Type': 'application/json'
        };

        const config = {
            method: method,
            headers: headers,
        };

        if (body) {
            config.body = JSON.stringify(body);
        }

        const canvasResponse = await fetch(`${canvasUrl}${endpoint}`, config);

        if (!canvasResponse.ok) {
            const errorData = await canvasResponse.json().catch(() => ({ message: 'Failed to parse Canvas error response.' }));
            return res.status(canvasResponse.status).json(errorData);
        }

        if (canvasResponse.status === 204) {
            return res.status(204).send();
        }

        const data = await canvasResponse.json();
        res.status(200).json(data);

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'An internal server error occurred.' });
    }
};