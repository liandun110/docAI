import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const RewriteBar = ({ selectedText, position, onClose }) => {
    const [rewritePrompt, setRewritePrompt] = useState('');
    const [rewrittenText, setRewrittenText] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);

    const barRef = useRef(null);

    // Close the bar if clicked outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (barRef.current && !barRef.current.contains(event.target)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [onClose]);

    const handleRewrite = async () => {
        if (!selectedText || !rewritePrompt) {
            setError('请提供选中的文本和重写要求。');
            return;
        }

        setLoading(true);
        setError('');
        setRewrittenText('');
        setCopied(false);

        try {
            const response = await axios.post('/api/ai/rewrite', {
                selectedText,
                rewritePrompt
            });
            setRewrittenText(response.data.rewrittenText);
        } catch (err) {
            console.error('Error rewriting text:', err);
            setError('重写文本失败，请重试。');
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(rewrittenText);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy text:', err);
            setError('复制文本到剪贴板失败。');
        }
    };

    return (
        <div
            ref={barRef}
            className="smart-editor-rewrite-bar"
            onMouseDown={(e) => e.stopPropagation()}
            style={{
                position: 'absolute',
                left: position.left,
                top: position.top,
            }}
        >
            <h3>文本重写</h3>
            <p>原始文本: "{selectedText.substring(0, 50)}..."</p>
            <input
                type="text"
                placeholder="输入重写要求 (例如: 更简洁, 更正式)"
                value={rewritePrompt}
                onChange={(e) => setRewritePrompt(e.target.value)}
                className="smart-editor-rewrite-input"
            />
            <div className="smart-editor-rewrite-button-group">
                <button
                    onClick={handleRewrite}
                    disabled={loading}
                    className={`smart-editor-rewrite-button smart-editor-rewrite-button-primary`}
                >
                    {loading ? '重写中...' : '重写'}
                </button>
                <button
                    onClick={onClose}
                    className="smart-editor-rewrite-button smart-editor-rewrite-button-secondary"
                >
                    取消
                </button>
            </div>

            {error && <p className="smart-editor-rewrite-error">{error}</p>}

            {rewrittenText && (
                <div className="smart-editor-rewrite-result">
                    <h4>重写结果:</h4>
                    <p className="smart-editor-rewrite-result-text">
                        {rewrittenText}
                    </p>
                    <button
                        onClick={handleCopy}
                        className={`smart-editor-rewrite-copy-button ${copied ? 'smart-editor-rewrite-copy-button-copied' : ''}`}
                    >
                        {copied ? '已复制!' : '复制'}
                    </button>
                </div>
            )}
        </div>
    );
};

export default RewriteBar;