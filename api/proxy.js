const fetch = require('node-fetch');

module.exports = async (req, res) => {
    if (req.method === 'POST') {
        // 从 Authorization header 中提取 token
        const token = req.headers['authorization']?.split(' ')[1]; // 获取 Bearer 后的 token

        // 从请求体中获取 body
        const { messages, model, stream, temperature } = req.body;

        // 如果 token 或 body 缺失，返回 400 错误
        if (!token || !messages || !model || stream === undefined || temperature === undefined) {
            return res.status(400).json({ error: 'Token and body are required' });
        }

        try {
            // 配置请求头
            const headers = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'Cookie': req.headers['cookie'] || '',  // 从请求头中获取 Cookie
            };

            // 组织请求体数据
            const body = {
                messages,
                model,
                stream,
                temperature,
            };

            // 向 Grok API 发送请求
            const response = await fetch('https://api.x.ai/v1/chat/completions', {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(body),
            });

            // 解析响应并返回给客户端
            const data = await response.json();
            res.status(response.status).json(data);
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    } else {
        res.status(405).json({ error: 'Method Not Allowed' }); // 只允许 POST 请求
    }
};
