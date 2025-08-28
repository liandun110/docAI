const express = require('express');
const router = express.Router();
const axios = require('axios');
const multer = require('multer');
const FormData = require('form-data');
const fs = require('fs');

// Configure multer for temporary in-memory storage
const upload = multer({ storage: multer.memoryStorage() });

// This function remains for legacy features like generate-clause and rewrite
async function callBailianApplication(prompt, parameters = {}) {
    const DASHSCOPE_API_KEY = process.env.DASHSCOPE_API_KEY;
    if (!DASHSCOPE_API_KEY) {
        throw new Error('DASHSCOPE_API_KEY is not set in environment variables.');
    }
    const APP_ID = '523cb9ada1d943ba95f71c8122ffaa69';
    const url = `https://dashscope.aliyuncs.com/api/v1/apps/${APP_ID}/completion`;
    const defaultParameters = { max_tokens: 1500, temperature: 0.7 };
    const mergedParameters = { ...defaultParameters, ...parameters };
    const payload = { input: { prompt }, parameters: mergedParameters, debug: {} };

    try {
        const response = await axios.post(url, payload, {
            headers: {
                'Authorization': `Bearer ${DASHSCOPE_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data.output.text;
    } catch (error) {
        console.error('调用百炼应用时出错:', error.response ? error.response.data : error.message);
        throw error;
    }
}

// --- Start of Refactoring for File ID based conversation ---

// NEW: Endpoint to upload a file and get a file ID
router.post('/upload-for-chat', upload.single('document'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded.' });
    }

    const DASHSCOPE_API_KEY = process.env.DASHSCOPE_API_KEY;
    if (!DASHSCOPE_API_KEY) {
        return res.status(500).json({ error: 'DASHSCOPE_API_KEY is not set.' });
    }

    try {
        const form = new FormData();
        // Use the buffer from multer's memory storage
        form.append('file', req.file.buffer, req.file.originalname);
        form.append('purpose', 'file-extract');

        const response = await axios.post('https://dashscope.aliyuncs.com/compatible-mode/v1/files', form, {
            headers: {
                ...form.getHeaders(),
                'Authorization': `Bearer ${DASHSCOPE_API_KEY}`
            }
        });

        // Return the file ID from the response
        res.json({ fileId: response.data.id });

    } catch (error) {
        console.error('Error uploading file to Aliyun for chat:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Failed to upload file and get file ID.' });
    }
});

// REFACTORED: Chat endpoint now uses file ID and chat history for context caching
router.post('/chat', async (req, res) => {
    // Now receiving the whole chat history
    const { history, fileId } = req.body;

    if (!history || history.length === 0) {
        return res.status(400).json({ error: 'History is required.' });
    }

    const DASHSCOPE_API_KEY = process.env.DASHSCOPE_API_KEY;
    if (!DASHSCOPE_API_KEY) {
        return res.status(500).json({ error: 'DASHSCOPE_API_KEY is not set.' });
    }

    try {
        // Start with the system prompt
        const messages = [
            { "role": "system", "content": "You are a helpful assistant." },
        ];

        // Add fileId context if it exists
        if (fileId) {
            messages.push({ "role": "system", "content": `fileid://${fileId}` });
        }
        
        // Transform and add the chat history from the client
        history.forEach(message => {
            if (message.sender === 'user') {
                messages.push({ role: 'user', content: message.text });
            } else if (message.sender === 'ai') {
                messages.push({ role: 'assistant', content: message.text });
            }
            // System messages from the client are ignored for the API call
        });

        const payload = {
            model: "qwen-plus", // Use a model that supports context caching
            messages: messages
        };

        const response = await axios.post('https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions', payload, {
            headers: {
                'Authorization': `Bearer ${DASHSCOPE_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });
        
        const aiResponse = response.data.choices[0].message.content;
        // For debugging cache hits
        const usage = response.data.usage;

        res.json({ response: aiResponse, usage: usage });

    } catch (error) {
        console.error('Error calling qwen-plus chat service:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Failed to get AI response.', details: error.response ? error.response.data : null });
    }
});


// --- End of Refactoring ---


// Legacy endpoints below, unchanged as per request
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

router.post('/rewrite', async (req, res) => {
    const { selectedText, rewritePrompt } = req.body;

    if (!selectedText || !rewritePrompt) {
        return res.status(400).json({ message: 'Selected text and rewrite prompt are required.' });
    }

    try {
        const prompt = `请根据以下要求重写这段文本：
要求: "${rewritePrompt}"
原始文本: "${selectedText}"`;
        const rewrittenText = await callBailianApplication(prompt);
        res.json({ rewrittenText });
    } catch (error) {
        console.error('Error calling AI rewrite service:', error.message);
        res.status(500).json({ message: 'Failed to get AI rewrite.', error: error.message });
    }
});

module.exports = router;