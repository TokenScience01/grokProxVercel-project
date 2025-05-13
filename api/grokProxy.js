const fetch = require('node-fetch');

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const token = req.headers['authorization']?.split(' ')[1];
    const { messages, model, stream, temperature } = req.body;

    if (!token || !messages || !model || stream === undefined || temperature === undefined) {
        return res.status(400).json({ error: 'Token and body are required' });
    }

    try {
        const response = await fetch('https://api.x.ai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'Cookie': req.headers['cookie'] || '',
            },
            body: JSON.stringify({ messages, model, stream, temperature }),
        });

        const data = await response.json();
        res.status(response.status).json(data);
    } catch (err) {
        console.error('Proxy Error:', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
