import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'quill/dist/quill.snow.css';
import './SmartEditor.css';
import RewriteBar from './RewriteBar';
import { marked } from 'marked';

const AiEditor = () => {
    const [topic, setTopic] = useState('警用无人机通用技术规范');
    const [editorHtml, setEditorHtml] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // State for Rewrite Bar
    const [showRewriteBar, setShowRewriteBar] = useState(false);
    const [selectedText, setSelectedText] = useState('');
    const [selectionPosition, setSelectionPosition] = useState({ top: 0, left: 0 });
    const quillReactRef = useRef(null);
    const editorContainerRef = useRef(null);
    const [isRewriteBarActive, setIsRewriteBarActive] = useState(false);

    // Function to handle selection change
    const handleSelectionChange = useCallback((range, source, editor) => {
        if (range && range.length > 0) {
            const text = editor.getText(range.index, range.length);
            setSelectedText(text);

            const bounds = editor.getBounds(range.index, range.length);

            // Get the bounding rectangle of the ql-editor (Quill's root element)
            const qlEditorRect = quillReactRef.current.getEditor().root.getBoundingClientRect();
            // Get the bounding rectangle of the col-md-9 container
            const containerRect = editorContainerRef.current.getBoundingClientRect();

            // Calculate the position of the selected text relative to the col-md-9 container
            const relativeLeft = bounds.left + qlEditorRect.left - containerRect.left;
            const relativeTop = bounds.top + qlEditorRect.top - containerRect.top;

            const containerWidth = editorContainerRef.current ? editorContainerRef.current.getBoundingClientRect().width : 0;
            const gap = 20; // Desired gap from the right edge of the container

            setSelectionPosition({
                left: containerWidth + gap,
                top: relativeTop - 40
            });
            setShowRewriteBar(true);
            setIsRewriteBarActive(true);
        } else {
            // Only hide if not actively interacting with the bar
            if (!isRewriteBarActive) {
                setShowRewriteBar(false);
                setSelectedText('');
            }
        }
    }, [isRewriteBarActive, editorContainerRef]);

    // Function to close the rewrite bar
    const handleCloseRewriteBar = useCallback(() => {
        setShowRewriteBar(false);
        setIsRewriteBarActive(false);
    }, []);

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
            
            // Convert generated Markdown to HTML
            const generatedHtml = marked.parse(data.generatedText);

            // Append the new content with a title
            const title = `<h3>${getClauseTitle(clauseType)}</h3>`;
            const newContent = `${editorHtml}${title}${generatedHtml}`;
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
            [{ 'header': [1, 2, 3, 4, 5, false] }],
            ['bold', 'italic', 'underline', 'strike', 'blockquote'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
            ['link', 'image'],
            ['clean']
        ],
    };

    return (
        <div className="smart-editor-container">
            <header className="smart-editor-header">
                <h1>智能编写工作室</h1>
                <p>从零开始，在AI的辅助下高效创建、起草和编辑您的标准文档</p>
            </header>
            <div className="smart-editor-row">
                {/* AI Tools Sidebar */}
                <div className="smart-editor-sidebar">
                    <h5 className="smart-editor-sidebar-title">AI 助手</h5>
                    <label htmlFor="topicInput" className="smart-editor-topic-label">标准主题</label>
                    <input 
                        type="text" 
                        className="smart-editor-topic-input"
                        id="topicInput"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                    />
                    <p className="smart-editor-section-title">生成条款:</p>
                    <div className="smart-editor-button-group">
                        <button 
                            onClick={() => handleGenerateClause('scope')} 
                            className="smart-editor-button" 
                            disabled={loading}
                        >
                            范围
                            {loading && (
                                <div className="smart-editor-button-loading">
                                    <div className="smart-editor-spinner"></div>
                                </div>
                            )}
                        </button>
                        <button 
                            onClick={() => handleGenerateClause('definitions')} 
                            className="smart-editor-button" 
                            disabled={loading}
                        >
                            术语和定义
                            {loading && (
                                <div className="smart-editor-button-loading">
                                    <div className="smart-editor-spinner"></div>
                                </div>
                            )}
                        </button>
                        <button 
                            onClick={() => handleGenerateClause('requirements')} 
                            className="smart-editor-button" 
                            disabled={loading}
                        >
                            要求
                            {loading && (
                                <div className="smart-editor-button-loading">
                                    <div className="smart-editor-spinner"></div>
                                </div>
                            )}
                        </button>
                        <button 
                            onClick={() => handleGenerateClause('test_methods')} 
                            className="smart-editor-button" 
                            disabled={loading}
                        >
                            试验方法
                            {loading && (
                                <div className="smart-editor-button-loading">
                                    <div className="smart-editor-spinner"></div>
                                </div>
                            )}
                        </button>
                    </div>
                    {error && <div className="smart-editor-error">{error}</div>}
                </div>

                {/* Editor */}
                <div className="smart-editor-main" ref={editorContainerRef} style={{ position: 'relative' }}>
                    <div className="smart-editor-content">
                        <ReactQuill 
                            ref={quillReactRef}
                            className="flex-grow-1"
                            theme="snow"
                            value={editorHtml}
                            onChange={setEditorHtml}
                            onChangeSelection={handleSelectionChange}
                            modules={modules}
                        />
                    </div>
                    {showRewriteBar && selectedText && (
                        <RewriteBar
                            selectedText={selectedText}
                            position={selectionPosition}
                            onClose={handleCloseRewriteBar}
                        />
                    )}
                </div>
            </div>
        </div>
    );
}

export default AiEditor;
