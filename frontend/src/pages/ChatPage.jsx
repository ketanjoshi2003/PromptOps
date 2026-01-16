import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { FiMessageSquare, FiSettings, FiRefreshCw, FiArrowUp, FiUser, FiCopy, FiCheck } from 'react-icons/fi';
import styles from './ChatPage.module.css';

// Custom Code Block Component
const CodeBlock = ({ inline, className, children, ...props }) => {
    const match = /language-(\w+)/.exec(className || '');
    const [isCopied, setIsCopied] = useState(false);
    const codeText = String(children).replace(/\n$/, '');

    const handleCopyCode = () => {
        navigator.clipboard.writeText(codeText);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    if (!inline && match) {
        return (
            <div className={styles.codeBlockWrapper}>
                <div className={styles.codeHeader}>
                    <span className={styles.codeLanguage}>{match[1]}</span>
                    <button className={styles.codeCopyBtn} onClick={handleCopyCode} title="Copy Code">
                        {isCopied ? <FiCheck /> : <FiCopy />}
                        {isCopied ? 'Copied' : 'Copy'}
                    </button>
                </div>
                <pre className={className}>
                    <code className={className} {...props}>
                        {children}
                    </code>
                </pre>
            </div>
        );
    }

    return (
        <code className={className} {...props}>
            {children}
        </code>
    );
};

const ChatPage = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    // System Prompt State
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [systemPrompt, setSystemPrompt] = useState('');
    const [tempSystemPrompt, setTempSystemPrompt] = useState('');
    const [copiedIndex, setCopiedIndex] = useState(null);

    const handleCopy = (text, index) => {
        navigator.clipboard.writeText(text);
        setCopiedIndex(index);
        setTimeout(() => setCopiedIndex(null), 2000);
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSend = async (text = input) => {
        if (!text.trim()) return;

        const userMsg = { role: 'user', content: text };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout

        try {
            // Construct history with System Prompt if enabled
            let history = [...messages, userMsg];

            if (systemPrompt.trim()) {
                history = [{ role: 'system', content: systemPrompt }, ...history];
            }

            const response = await fetch('http://localhost:8000/api/chat/message', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: history }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) throw new Error('Failed to fetch');

            const data = await response.json();
            const aiMsg = { role: 'assistant', content: data.response };
            setMessages(prev => [...prev, aiMsg]);
        } catch (error) {
            console.error(error);
            const errorMessage = error.name === 'AbortError'
                ? "Error: Request timed out. Please check your backend connection."
                : "Error: Could not connect to AI service.";
            setMessages(prev => [...prev, { role: 'assistant', content: errorMessage }]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleReset = () => {
        if (window.confirm("Clear chat history?")) {
            setMessages([]);
        }
    };

    const openSettings = () => {
        setTempSystemPrompt(systemPrompt);
        setIsSettingsOpen(true);
    };

    const saveSettings = () => {
        setSystemPrompt(tempSystemPrompt);
        setIsSettingsOpen(false);
    };

    const suggestions = [
        { title: "SaaS Boilerplate", desc: "FastAPI + React setup with auth" },
        { title: "Portfolio Website", desc: "Modern showcase with galleries" },
        { title: "E-commerce Backend", desc: "Scalable API with proper DB schema" },
        { title: "Interactive Graph", desc: "D3.js visualization dashboard" }
    ];

    return (
        <div className={styles.chatContainer}>
            <div className={styles.chatHeader}>
                <h1>Chat API</h1>
                <div className={styles.headerActions}>
                    <button className={styles.headerButton} onClick={handleReset} title="Reset Chat">
                        <FiRefreshCw /> Reset Chat
                    </button>
                </div>
            </div>

            <div className={styles.messagesArea}>
                {messages.length === 0 ? (
                    <div className={styles.heroSection}>
                        <h2 className={styles.heroTitle}>Build a professional spec</h2>
                        <p className={styles.heroSubtitle}>
                            Get fast, structured technical plans for your software ideas.
                        </p>

                        <div className={styles.suggestionGrid}>
                            {suggestions.map((s, i) => (
                                <div key={i} className={styles.suggestionCard} onClick={() => handleSend(`Help me create a ${s.title}`)}>
                                    <div className={styles.cardTitle}>{s.title}</div>
                                    <div className={styles.cardDesc}>{s.desc}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <>
                        {messages.map((msg, index) => (
                            <div key={index} className={`${styles.message} ${msg.role === 'user' ? styles.user : styles.ai}`}>
                                {msg.role === 'assistant' && (
                                    <div className={styles.logoMark}>
                                        <div className={styles.redCircle}>
                                            <span className={styles.pipe}>|</span>
                                        </div>
                                    </div>
                                )}
                                <div className={styles.messageContent}>
                                    {msg.role === 'user' ? (
                                        <div className={styles.userWrapper}>
                                            <div className={styles.bubble}>
                                                {msg.content}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className={styles.aiContent}>
                                            <ReactMarkdown
                                                components={{
                                                    code: CodeBlock
                                                }}
                                            >
                                                {msg.content}
                                            </ReactMarkdown>
                                            <button className={styles.copyButton} onClick={() => handleCopy(msg.content, index)} title="Copy Response">
                                                {copiedIndex === index ? <FiCheck /> : <FiCopy />}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className={`${styles.message} ${styles.ai}`}>
                                <div className={styles.logoMark}>
                                    <div className={styles.redCircle}>
                                        <span className={styles.pipe}>|</span>
                                    </div>
                                </div>
                                <div className={styles.messageContent}>
                                    <div className={styles.aiContent}>
                                        <div className={styles.typingIndicator}>Thinking...</div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </>
                )}
            </div>

            <div className={styles.inputArea}>
                <div className={styles.inputWrapper}>
                    <div className={styles.inputMain}>
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Send a message..."
                            rows={1}
                        />
                    </div>
                    <div className={styles.inputControls}>
                        <button className={styles.inputActionBtn} onClick={openSettings} title="System Prompt">
                            <FiSettings /> System Prompt
                        </button>
                        <div style={{ flex: 1 }}></div>
                        <button className={styles.sendButton} onClick={() => handleSend()} disabled={loading || !input.trim()}>
                            <FiArrowUp size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {/* SETTINGS MODAL */}
            {isSettingsOpen && (
                <div className={styles.modalOverlay} onClick={() => setIsSettingsOpen(false)}>
                    <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <h3 className={styles.modalTitle}>System Prompt</h3>
                        <div className={styles.modalBody}>
                            <label className={styles.modalLabel}>
                                Customize how the AI behaves. This prompt is sent with every request.
                            </label>
                            <textarea
                                className={styles.modalTextarea}
                                value={tempSystemPrompt}
                                onChange={(e) => setTempSystemPrompt(e.target.value)}
                                placeholder="e.g., You are a strict code reviewer..."
                            />
                        </div>
                        <div className={styles.modalActions}>
                            <button className={styles.cancelBtn} onClick={() => setIsSettingsOpen(false)}>Cancel</button>
                            <button className={styles.saveBtn} onClick={saveSettings}>Save</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatPage;
// HMR Trigger 2
