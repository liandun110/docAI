const express = require('express');
const router = express.Router();
const multer = require('multer');
const mammoth = require('mammoth');
const OSS = require('ali-oss');

// Initialize OSS client from .env variables
const client = new OSS({
  region: process.env.OSS_REGION, // Use the new REGION variable
  accessKeyId: process.env.OSS_ACCESS_KEY_ID,
  accessKeySecret: process.env.OSS_ACCESS_KEY_SECRET,
  bucket: process.env.OSS_BUCKET,
});

// Configure multer for in-memory storage
const upload = multer({ storage: multer.memoryStorage() });

// POST /api/standards/upload - Handle document upload to OSS
router.post('/upload', upload.single('document'), async (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    try {
        // Fix for garbled Chinese filenames by correcting the encoding
        const originalname = Buffer.from(req.file.originalname, 'latin1').toString('utf8');
        // 移除时间戳，直接使用原始文件名
        const objectName = originalname;
        
        // Upload the file buffer to OSS
        const result = await client.put(objectName, req.file.buffer);

        res.status(201).send({ message: 'File uploaded successfully', filename: objectName });
    } catch (error) {
        console.error('OSS upload error:', error);
        res.status(500).send('Failed to upload file to OSS.');
    }
});

// GET /api/standards - Get list of documents from OSS
router.get('/', async (req, res) => {
    const { search } = req.query;
    try {
        // 获取所有文件
        const result = await client.list();
        let files = result.objects ? result.objects.map(obj => obj.name) : [];
        
        // 如果有搜索词，进行过滤
        if (search) {
            // 解码搜索词以正确处理中文
            const decodedSearch = decodeURIComponent(search);
            // 过滤包含搜索词的文件（不区分大小写）
            files = files.filter(file => {
                const decodedFileName = decodeURIComponent(file);
                return decodedFileName.toLowerCase().includes(decodedSearch.toLowerCase());
            });
        }
        
        res.json(files);
    } catch (error) {
        console.error('OSS list error:', error);
        res.status(500).send('Unable to scan documents directory from OSS.');
    }
});

// GET /api/standards/content/:filename - Get document content from OSS for preview
router.get('/content/:filename', async (req, res) => {
    const { filename } = req.params;
    try {
        const result = await client.get(filename);
        const buffer = result.content;

        const ext = require('path').extname(filename).toLowerCase();
        if (ext === '.docx') {
            const mammothResult = await mammoth.convertToHtml({ buffer });
            res.json({ type: 'html', content: mammothResult.value });
        } else {
            const content = buffer.toString('utf8');
            res.json({ type: 'text', content: content });
        }
    } catch (error) {
        console.error('OSS preview generation error:', error);
        if (error.code === 'NoSuchKey') {
            return res.status(404).send('File not found.');
        }
        res.status(500).send('Error generating file preview from OSS.');
    }
});

// GET /api/standards/:filename - Get a download URL for a specific document from OSS
router.get('/:filename', (req, res) => {
    const { filename } = req.params;
    try {
        // Generate a signed URL for download that expires in 60 minutes.
        const url = client.signatureUrl(filename, {
            expires: 3600, // 1 hour
            response: {
                'content-disposition': `attachment; filename="${filename}"`
            }
        });
        // Redirect the user to the signed URL
        res.redirect(url);
    } catch (error) {
        console.error('OSS signature URL error:', error);
        res.status(500).send('Error generating download link.');
    }
});

module.exports = router;