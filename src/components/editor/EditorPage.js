import React, { useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // import styles

const AiEditor = () => {
    const [topic, setTopic] = useState('警用无人机通用技术规范');
    const [editorHtml, setEditorHtml] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleGenerateClause = async (clauseType) => {
        if (!topic) {
            setError('请输入一个标准主题。');
            return;
        }
        setLoading(true);
        setError('');
        try {
            const response = await fetch('/api/ai/generate-clause', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ topic, clauseType }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            // Append the new content with a title
            const title = `<h3>${getClauseTitle(clauseType)}</h3>`;
            const newContent = `${editorHtml}${title}${data.generatedText}`;
            setEditorHtml(newContent);

        } catch (err) {
            setError(`生成失败: ${err.message}`);
        }
        setLoading(false);
    };

    const getClauseTitle = (clauseType) => {
        switch (clauseType) {
            case 'scope': return '1. 范围';
            case 'definitions': return '2. 术语和定义';
            case 'requirements': return '3. 要求';
            case 'test_methods': return '4. 试验方法';
            default: return ''
        }
    }

    const modules = {
        toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike', 'blockquote'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
            ['link', 'image'],
            ['clean']
        ],
    };

    return (
        <div className="container-fluid mt-4">
            <div className="row">
                {/* AI Tools Sidebar */}
                <div className="col-md-3">
                    <div className="card">
                        <div className="card-body">
                            <h5 className="card-title">AI 助手</h5>
                            <div className="mb-3">
                                <label htmlFor="topicInput" className="form-label">标准主题</label>
                                <input 
                                    type="text" 
                                    className="form-control"
                                    id="topicInput"
                                    value={topic}
                                    onChange={(e) => setTopic(e.target.value)}
                                />
                            </div>
                            <p>生成条款:</p>
                            <div className="d-grid gap-2">
                                <button onClick={() => handleGenerateClause('scope')} className="btn btn-primary" disabled={loading}>范围</button>
                                <button onClick={() => handleGenerateClause('definitions')} className="btn btn-primary" disabled={loading}>术语和定义</button>
                                <button onClick={() => handleGenerateClause('requirements')} className="btn btn-primary" disabled={loading}>要求</button>
                                <button onClick={() => handleGenerateClause('test_methods')} className="btn btn-primary" disabled={loading}>试验方法</button>
                            </div>
                            {loading && (
                                <div className="d-flex align-items-center mt-3">
                                    <strong role="status">正在生成...</strong>
                                    <div className="spinner-border ms-auto" aria-hidden="true"></div>
                                </div>
                            )}
                            {error && <div className="alert alert-danger mt-3">{error}</div>}
                        </div>
                    </div>
                </div>

                {/* Editor */}
                <div className="col-md-9">
                    <div className="card">
                        <div className="card-body">
                             <ReactQuill 
                                theme="snow"
                                value={editorHtml}
                                onChange={setEditorHtml}
                                modules={modules}
                                style={{ height: '60vh' }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AiEditor;
