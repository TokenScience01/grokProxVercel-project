const fetch = require('node-fetch');

module.exports = async (req, res) => {
    if (req.method === 'POST') {
        const token = req.headers['authorization']?.split(' ')[1]; // 获取 Bearer 后的 token
        const { messages, model, stream, temperature } = req.body;

        if (!token || !messages || !model || stream === undefined || temperature === undefined) {
            return res.status(400).json({ error: 'Token and body are required' });
        }

        try {
            const headers = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'Cookie': req.headers['cookie'] || '',
            };

            const body = {
                messages,
                model,
                stream,
                temperature,
            };

            const response = await fetch('https://api.x.ai/v1/chat/completions', {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(body),
            });

            const data = await response.json();
            res.status(response.status).json(data);
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    } else {
        res.status(405).json({ error: 'Method Not Allowed' });
    }
};
