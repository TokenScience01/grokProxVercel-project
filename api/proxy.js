// api/proxy.js
const XAI_API_URL = 'https://api.x.ai/v1/chat/completions';

/**
 * 处理请求并转发到 xAI API
 * @param {Object} req - Vercel 请求对象
 * @param {Object} res - Vercel 响应对象
 */
export default async function handler(req, res) {
    // 从请求头中提取客户端提供的 Authorization（API 密钥）
    const clientAuth = req.headers['authorization'];

    // 打印授权头部信息，用于调试
    console.log('Client Authorization:', clientAuth);

    // 检查是否提供了有效的 Bearer 密钥
    if (!clientAuth || !clientAuth.startsWith('Bearer ')) {
        console.log('Authorization header is missing or invalid');
        return res.status(401).json({
            error: 'Missing or invalid Authorization header. Please provide a valid Bearer token.',
        });
    }

    // 复制客户端请求的头部，并确保 Content-Type 为 JSON
    const headers = {
        ...req.headers,
        'Content-Type': 'application/json'
    };

    // 获取请求体（JSON 格式）
    const body = req.body;

    // 打印请求体信息，用于调试
    console.log('Request Body:', body);

    // 构造转发请求，保持原始方法、头和体
    const proxyRequest = new Request(XAI_API_URL, {
        method: req.method,
        headers: headers,
        body: JSON.stringify(body),
    });

    try {
        // 转发请求到 xAI API 并获取响应
        const response = await fetch(proxyRequest);

        // 打印响应状态和响应头，用于调试
        console.log('Response Status:', response.status);
        console.log('Response Headers:', response.headers);

        // 检查请求是否要求流式响应
        let stream = false;
        try {
            const requestData = JSON.parse(JSON.stringify(body));
            stream = requestData.stream || false;
        } catch (e) {
            // 如果 JSON 解析失败，默认非流式
            console.log('Failed to parse request body:', e);
        }

        // 根据 stream 参数返回流式或非流式响应
        if (stream) {
            // 流式响应：直接返回原始响应流
            const streamResponse = await response.text();
            res.setHeader('Content-Type', response.headers.get('Content-Type'));
            return res.status(response.status).send(streamResponse);
        } else {
            // 非流式响应：等待完整响应后返回
            const responseData = await response.text();
            res.setHeader('Content-Type', 'application/json');
            return res.status(response.status).json(JSON.parse(responseData));
        }
    } catch (error) {
        // 错误处理并打印日志
        console.error('Error forwarding request to xAI:', error);
        return res.status(500).json({ error: 'Failed to forward request to xAI' });

    }
}
