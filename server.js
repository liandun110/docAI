require('dotenv').config(); // 加载.env文件中的环境变量

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const axios = require('axios'); // 使用axios发送HTTP请求
const mammoth = require('mammoth'); // 添加mammoth库
const standardDocumentsRouter = require('./routes/standardDocuments');
const aiRouter = require('./routes/ai'); // Import the new AI router

const app = express();
const port = 5000;

// Middleware to parse JSON bodies
app.use(express.json());

// 添加CORS支持
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  next();
});

// 创建 uploads 目录（如果不存在）
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir);
}

// 配置multer用于处理文件上传
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // 添加时间戳避免重名
  }
});
const upload = multer({ storage: storage });

// 调用百炼应用处理文档内容
async function callBailianApplication(content) {
  const DASHSCOPE_API_KEY = process.env.DASHSCOPE_API_KEY;
  if (!DASHSCOPE_API_KEY) {
    throw new Error('DASHSCOPE_API_KEY is not set in environment variables.');
  }

  const APP_ID = '523cb9ada1d943ba95f71c8122ffaa69';
  const url = `https://dashscope.aliyuncs.com/api/v1/apps/${APP_ID}/completion`;

  const payload = {
    input: {
      prompt: `你是一位专门审核公安技术标准的AI专家，精通中国国家标准（GB）和公安行业标准（GA）的编写规范，特别是GB/T 1.1-2020《标准化工作导则 第1部分：标准化文件的结构和起草规则》。

请对以下提交的公安标准报批稿进行全面、细致的智能审核，并利用你的知识库进行核对。重点关注以下方面：
1.  **格式合规性**: 依据GB/T 1.1-2020检查文档结构是否完整、规范。
2.  **术语一致性**: 检查全文术语使用是否统一、准确。
3.  **规范性语言**: 检查助动词（如‘应’、‘宜’、‘可’）的使用是否符合标准编写要求。
4.  **内容逻辑性**: 审查技术要求的逻辑是否严密，是否存在矛盾。
5.  **引用文件准确性**: 检查所引用的标准文件是否现行有效。

请将审核结果严格按照以下JSON格式输出，不要包含任何额外说明文字：
{
  "standard_name": "标准名称（如果能识别）",
  "standard_type": "标准类型（国家标准/行业标准）",
  "overall_assessment": "对标准的总体评价和核心问题摘要",
  "overall_score": "综合评分（0-100）",
  "detailed_checks": {
    "format_compliance": { "score": "评分（0-10）", "findings": "具体发现和评价" },
    "terminology_consistency": { "score": "评分（0-10）", "findings": "具体发现和评价" },
    "normative_language": { "score": "评分（0-10）", "findings": "具体发现和评价" },
    "content_logic": { "score": "评分（0-10）", "findings": "具体发现和评价" },
    "reference_accuracy": { "score": "评分（0-10）", "findings": "具体发现和评价" }
  },
  "issues_and_suggestions": [
    {
      "clause": "问题所在条款号",
      "original_text": "有问题的原文",
      "issue_description": "问题描述",
      "suggestion": "修改建议",
      "severity": "严重程度（严重/一般/建议）"
    }
  ]
}

请审核以下文档内容:

${content}`
    },
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

    const aiResponse = response.data.output.text;

    try {
      const aiResult = JSON.parse(aiResponse);
      return aiResult;
    } catch (parseError) {
      console.warn('AI返回的不是有效的JSON格式:', aiResponse);
      return {
        format_check: "未知",
        logic_check: "未知",
        content_check: "未知",
        overall_score: 0,
        issues: [],
        suggestions: [],
        rawResponse: aiResponse
      };
    }
  } catch (error) {
    console.error('调用百炼应用时出错:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);
      console.error('Data:', error.response.data);
    } else if (error.request) {
      console.error('Request:', error.request);
    } else {
      console.error('Message:', error.message);
    }
    throw error;
  }
}

// 处理文件上传和AI调用的端点
app.post('/api/upload', upload.single('document'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded.' });
  }

  try {
    const filePath = req.file.path;
    let fileContent;

    if (path.extname(req.file.originalname).toLowerCase() === '.docx') {
      const result = await mammoth.extractRawText({ path: filePath });
      fileContent = result.value;
    } else {
      fileContent = fs.readFileSync(filePath, 'utf-8');
    }

    const aiResult = await callBailianApplication(fileContent);

    // fs.unlinkSync(filePath);

    res.json({
      message: 'Document processed successfully by Bailian Application',
      data: aiResult,
      fileName: req.file.originalname
    });
  } catch (err) {
    console.error('Bailian processing error:', err);
    res.status(500).json({ error: 'Bailian processing failed: ' + err.message });
  }
});

// 使用标准文档路由
app.use('/api/standards', standardDocumentsRouter);
// 使用AI功能路由
app.use('/api/ai', aiRouter);

app.listen(port, '0.0.0.0', () => {
  console.log(`Backend server running on http://0.0.0.0:${port}`);
});