const express = require('express');
const router = express.Router();
const axios = require('axios');

// This function should be refactored to be shared across the app
async function callBailianApplication(prompt) {
    const DASHSCOPE_API_KEY = process.env.DASHSCOPE_API_KEY;
    if (!DASHSCOPE_API_KEY) {
        throw new Error('DASHSCOPE_API_KEY is not set in environment variables.');
    }

    const APP_ID = '523cb9ada1d943ba95f71c8122ffaa69'; // Using the same app as in server.js
    const url = `https://dashscope.aliyuncs.com/api/v1/apps/${APP_ID}/completion`;

    const payload = {
        input: { prompt },
        parameters: {},
        debug: {}
    };

    try {
        const response = await axios.post(url, payload, {
            headers: {
                'Authorization': `Bearer ${DASHSCOPE_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data.output.text;
    } catch (error) {
        console.error('调用百炼应用时出错:');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        }
        throw error;
    }
}


router.post('/generate-clause', async (req, res) => {
    const { topic, clauseType } = req.body;

    if (!topic || !clauseType) {
        return res.status(400).json({ error: 'Topic and clauseType are required.' });
    }

    let prompt;
    switch (clauseType) {
        case 'scope':
            prompt = `你是一位专门编写技术标准的AI专家。请为一个关于“${topic}”的标准，生成“范围”部分的条款内容。内容应简洁、明确，准确界定标准的适用对象和边界。`;
            break;
        case 'definitions':
            prompt = `你是一位专门编写技术标准的AI专家。请为一个关于“${topic}”的标准，生成“术语和定义”部分的条款内容。请列出与该主题相关的核心术语，并给出符合GB/T 1.1规范的定义。`;
            break;
        case 'requirements':
            prompt = `你是一位专门编写技术标准的AI专家。请为一个关于“${topic}”的标准，生成“要求”部分的核心条款内容。请从功能、性能、安全等方面，提出具体、可量化、可验证的技术要求。`;
            break;
        case 'test_methods':
            prompt = `你是一位专门编写技术标准的AI专家。请为一个关于“${topic}”的标准，生成“试验方法”部分的条款内容。内容应与“要求”部分的条款相对应，提供具体、可操作的测试步骤、环境和判定准则。`;
            break;
        default:
            return res.status(400).json({ error: 'Invalid clauseType.' });
    }

    try {
        const generatedText = await callBailianApplication(prompt);
        res.json({ generatedText });
    } catch (err) {
        res.status(500).json({ error: 'Failed to generate text from AI: ' + err.message });
    }
});

module.exports = router;
