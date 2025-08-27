import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios'; // Assuming axios is available for API calls

const RewriteBar = ({ selectedText, position, onAccept, onClose }) => {
    const [rewritePrompt, setRewritePrompt] = useState('');
    const [rewrittenText, setRewrittenText] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

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
            setError('Please provide both selected text and a rewrite prompt.');
            return;
        }

        setLoading(true);
        setError('');
        setRewrittenText('');

        try {
            const response = await axios.post('/api/ai/rewrite', {
                selectedText,
                rewritePrompt
            });
            setRewrittenText(response.data.rewrittenText);
        } catch (err) {
            console.error('Error rewriting text:', err);
            setError('Failed to rewrite text. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            ref={barRef}
            className="rewrite-bar"
            onMouseDown={(e) => e.stopPropagation()} // NEW: Stop propagation of click events
            style={{
                position: 'absolute',
                left: position.left,
                top: position.top,
                // Add more styling here or in CSS
                background: 'white',
                border: '1px solid #ccc',
                borderRadius: '4px',
                padding: '10px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                zIndex: 1000,
                minWidth: '300px',
                maxWidth: '400px'
            }}
        >
            <h3>文本重写</h3>
            <p>原始文本: "{selectedText.substring(0, 50)}..."</p> {/* Show a snippet */}
            <input
                type="text"
                placeholder="输入重写要求 (例如: 更简洁, 更正式)"
                value={rewritePrompt}
                onChange={(e) => setRewritePrompt(e.target.value)}
                style={{ width: '100%', padding: '8px', marginBottom: '10px', border: '1px solid #ddd', borderRadius: '3px' }}
            />
            <button
                onClick={handleRewrite}
                disabled={loading}
                style={{
                    padding: '8px 15px',
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '3px',
                    cursor: 'pointer',
                    marginRight: '10px'
                }}
            >
                {loading ? '重写中...' : '重写'}
            </button>
            <button
                onClick={onClose}
                style={{
                    padding: '8px 15px',
                    backgroundColor: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '3px',
                    cursor: 'pointer'
                }}
            >
                取消
            </button>

            {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}

            {rewrittenText && (
                <div style={{ marginTop: '15px', borderTop: '1px solid #eee', paddingTop: '10px' }}>
                    <h4>重写结果:</h4>
                    <p style={{ whiteSpace: 'pre-wrap', background: '#f8f9fa', padding: '10px', borderRadius: '3px' }}>
                        {rewrittenText}
                    </p>
                    <button
                        onClick={() => onAccept(rewrittenText)}
                        style={{
                            padding: '8px 15px',
                            backgroundColor: '#28a745',
                            color: 'white',
                            border: 'none',
                            borderRadius: '3px',
                            cursor: 'pointer'
                        }}
                    >
                        替换原文
                    </button>
                </div>
            )}
        </div>
    );
};

export default RewriteBar;