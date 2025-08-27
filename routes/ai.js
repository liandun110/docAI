const express = require('express');
const router = express.Router();
const axios = require('axios');

// This function should be refactored to be shared across the app
// Modified to accept parameters
async function callBailianApplication(prompt, parameters = {}) {
    const DASHSCOPE_API_KEY = process.env.DASHSCOPE_API_KEY;
    if (!DASHSCOPE_API_KEY) {
        throw new Error('DASHSCOPE_API_KEY is not set in environment variables.');
    }

    const APP_ID = '523cb9ada1d943ba95f71c8122ffaa69'; // Using the same app as in server.js
    const url = `https://dashscope.aliyuncs.com/api/v1/apps/${APP_ID}/completion`;

    // Merge default parameters with passed parameters
    const defaultParameters = {
        // Set a higher max_tokens limit for clause generation
        max_tokens: 1500, // Adjust this value as needed
        // Optionally, adjust temperature for slightly more deterministic output
        temperature: 0.7
    };
    const mergedParameters = { ...defaultParameters, ...parameters };

    const payload = {
        input: { prompt },
        parameters: mergedParameters, // Use the merged parameters
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
        // Call with default parameters set inside the function
        const generatedText = await callBailianApplication(prompt);
        res.json({ generatedText });
    } catch (err) {
        res.status(500).json({ error: 'Failed to generate text from AI: ' + err.message });
    }
});

router.post('/rewrite', async (req, res) => {
    const { selectedText, rewritePrompt } = req.body;

    if (!selectedText || !rewritePrompt) {
        return res.status(400).json({ message: 'Selected text and rewrite prompt are required.' });
    }

    try {
        // Construct a prompt for the AI service
        const prompt = `请根据以下要求重写这段文本：
要求: "${rewritePrompt}"
原始文本: "${selectedText}"`;

        // Call the AI application
        const rewrittenText = await callBailianApplication(prompt);
        res.json({ rewrittenText });
    } catch (error) {
        console.error('Error calling AI rewrite service:', error.message);
        res.status(500).json({ message: 'Failed to get AI rewrite.', error: error.message });
    }
});

// 添加AI聊天API端点
router.post('/chat', async (req, res) => {
    const { message } = req.body;

    if (!message) {
        return res.status(400).json({ error: 'Message is required.' });
    }

    try {
        // 构建聊天提示
        const prompt = `你是一位专门审核公安技术标准的AI专家，精通中国国家标准（GB）和公安行业标准（GA）的编写规范，特别是GB/T 1.1-2020《标准化工作导则 第1部分：标准化文件的结构和起草规则》。
        
用户的问题是：${message}
        
请以专业、简洁的方式回答用户的问题。`;

        // 调用AI应用
        const response = await callBailianApplication(prompt, { max_tokens: 1000 });
        res.json({ response });
    } catch (error) {
        console.error('Error calling AI chat service:', error.message);
        res.status(500).json({ error: 'Failed to get AI response.', message: error.message });
    }
});

module.exports = router;
