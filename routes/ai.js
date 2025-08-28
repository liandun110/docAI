const express = require('express');
const router = express.Router();
const axios = require('axios');
const multer = require('multer');
const FormData = require('form-data');
const fs = require('fs');
const OSS = require('ali-oss');

// Configure multer for temporary in-memory storage
const upload = multer({ storage: multer.memoryStorage() });

// Initialize OSS client from .env variables (Reusing logic from standardDocuments.js)
const ossClient = new OSS({
    region: process.env.OSS_REGION,
    accessKeyId: process.env.OSS_ACCESS_KEY_ID,
    accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET,
    bucket: process.env.OSS_BUCKET,
});

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

// NEW: Endpoint to list files from OSS for AI chat selection
router.get('/list-oss-files', async (req, res) => {
    try {
        // Reuse logic from standardDocuments.js to list files
        const result = await ossClient.list();
        const files = result.objects ? result.objects.map(obj => obj.name) : [];
        res.json(files);
    } catch (error) {
        console.error('OSS list error (for AI):', error);
        res.status(500).json({ error: 'Unable to list files from OSS for AI.' });
    }
});

// NEW: Endpoint to select an OSS file and get a BaiLian file ID
router.post('/select-oss-file', async (req, res) => {
    const { filename } = req.body; // Filename selected from OSS

    if (!filename) {
        return res.status(400).json({ error: 'Filename is required.' });
    }

    const DASHSCOPE_API_KEY = process.env.DASHSCOPE_API_KEY;
    if (!DASHSCOPE_API_KEY) {
        return res.status(500).json({ error: 'DASHSCOPE_API_KEY is not set.' });
    }

    try {
        // 1. Download the file content from OSS
        const ossResult = await ossClient.get(filename);
        const fileBuffer = ossResult.content; // This is the file's Buffer

        // 2. Upload the file buffer to BaiLian to get a fileId
        const form = new FormData();
        form.append('file', fileBuffer, filename); // Use the original filename
        form.append('purpose', 'file-extract');

        const response = await axios.post('https://dashscope.aliyuncs.com/compatible-mode/v1/files', form, {
            headers: {
                ...form.getHeaders(),
                'Authorization': `Bearer ${DASHSCOPE_API_KEY}`
            }
        });

        // 3. Return the BaiLian fileId and the original filename
        res.json({ fileId: response.data.id, filename: filename });

    } catch (error) {
        console.error('Error selecting OSS file for chat:', error);
        // Differentiate between OSS errors and BaiLian upload errors
        if (error.code === 'NoSuchKey') {
             res.status(404).json({ error: 'File not found in OSS.' });
        } else {
             res.status(500).json({ error: 'Failed to process selected OSS file for chat.' });
        }
    }
});

// REFACTORED: Chat endpoint now uses file ID
router.post('/chat', async (req, res) => {
    const { conversationHistory, fileId } = req.body;

    if (!conversationHistory || !Array.isArray(conversationHistory) || conversationHistory.length === 0) {
        return res.status(400).json({ error: 'Conversation history is required.' });
    }

    const DASHSCOPE_API_KEY = process.env.DASHSCOPE_API_KEY;
    if (!DASHSCOPE_API_KEY) {
        return res.status(500).json({ error: 'DASHSCOPE_API_KEY is not set.' });
    }

    try {
        const messages = [
            { "role": "system", "content": "You are a helpful assistant." },
        ];

        if (fileId) {
            messages.push({ "role": "system", "content": `fileid://${fileId}` });
        }

        // Map frontend conversation history to AI model format
        conversationHistory.forEach(msg => {
            if (msg.sender === 'user') {
                messages.push({ "role": "user", "content": msg.text });
            } else if (msg.sender === 'ai') {
                messages.push({ "role": "assistant", "content": msg.text });
            }
        });

        const payload = {
            model: "qwen-long",
            messages: messages
        };

        const response = await axios.post('https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions', payload, {
            headers: {
                'Authorization': `Bearer ${DASHSCOPE_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });
        
        const aiResponse = response.data.choices[0].message.content;
        res.json({ response: aiResponse });

    } catch (error) {
        console.error('Error calling qwen-long chat service:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Failed to get AI response.', details: error.response ? error.response.data : null });
    }
});


// --- End of Refactoring ---


// Legacy endpoints below, unchanged as per request
router.post('/generate-clause', async (req, res) => {
    const { topic, clauseType, docType } = req.body; // Extract docType

    if (!topic || !clauseType) {
        return res.status(400).json({ error: 'Topic and clauseType are required.' });
    }

    let prompt;
    let aiExpertRole = '你是一位专门编写技术标准的AI专家。从零开始，在AI的辅助下高效创建、起草和编辑您的标准文档'; // Default role

    if (docType === 'patent') {
        aiExpertRole = '你是一位专门编写专利文档的AI专家。从零开始，在AI的辅助下高效创建、起草和编辑您的专利文档';
        switch (clauseType) {
            case 'scope': // Corresponds to '权利要求'
                prompt = `${aiExpertRole}请为一个关于“${topic}”的专利，生成“权利要求”部分的条款内容。内容应清晰、简洁，准确界定专利的保护范围。`;
                break;
            case 'definitions': // Corresponds to '发明背景'
                prompt = `${aiExpertRole}请为一个关于“${topic}”的专利，生成“发明背景”部分的条款内容。请描述相关技术领域，并指出现有技术的不足。`;
                break;
            case 'requirements': // Corresponds to '技术方案'
                prompt = `${aiExpertRole}请为一个关于“${topic}”的专利，生成“技术方案”部分的核心条款内容。请详细描述本发明的技术特征、实现方式和有益效果。`;
                break;
            case 'test_methods': // Corresponds to '附图说明'
                prompt = `${aiExpertRole}请为一个关于“${topic}”的专利，生成“附图说明”部分的条款内容。请简要描述附图所示内容，并指出各附图标记代表的含义。`;
                break;
            default:
                return res.status(400).json({ error: 'Invalid clauseType for patent.' });
        }
    } else { // Default for 'gongan' or other types
        switch (clauseType) {
            case 'scope':
                prompt = `${aiExpertRole}请为一个关于“${topic}”的标准，生成“范围”部分的条款内容。内容应简洁、明确，准确界定标准的适用对象和边界。`;
                break;
            case 'definitions':
                prompt = `${aiExpertRole}请为一个关于“${topic}”的标准，生成“术语和定义”部分的条款内容。请列出与该主题相关的核心术语，并给出符合GB/T 1.1规范的定义。`;
                break;
            case 'requirements':
                prompt = `${aiExpertRole}请为一个关于“${topic}”的标准，生成“要求”部分的核心条款内容。请从功能、性能、安全等方面，提出具体、可量化、可验证的技术要求。`;
                break;
            case 'test_methods':
                prompt = `${aiExpertRole}请为一个关于“${topic}”的标准，生成“试验方法”部分的条款内容。内容应与“要求”部分的条款相对应，提供具体、可操作的测试步骤、环境和判定准则。`;
                break;
            default:
                return res.status(400).json({ error: 'Invalid clauseType.' });
        }
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