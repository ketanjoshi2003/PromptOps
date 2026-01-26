import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import ReactMarkdown from 'react-markdown';
import { FiMessageSquare, FiSettings, FiRefreshCw, FiArrowUp, FiUser, FiCopy, FiCheck, FiTrash2 } from 'react-icons/fi';
import styles from './ChatPage.module.css';
import { authService } from '../services/authService';
import { chatService } from '../services/chatService';

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

const ChatPage = ({ onUsageUpdate }) => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [sessionId, setSessionId] = useState(null);
    const messagesEndRef = useRef(null);
    const textareaRef = useRef(null);

    // Load latest session on mount
    useEffect(() => {
        if (!localStorage.getItem('token')) return;
        const restoreSession = async () => {
            try {
                const sessions = await chatService.getSessions();
                if (sessions && sessions.length > 0) {
                    // Sort by updated_at? Backend sorts by updated_at desc already.
                    const latest = sessions[0];
                    setSessionId(latest.id);
                    if (latest.messages && latest.messages.length > 0) {
                        setMessages(latest.messages);
                    }
                }
            } catch (err) {
                console.error("Failed to restore session", err);
            }
        };
        restoreSession();
    }, []);

    // If new messages are added, update history
    // Since handleSend is async and adds user -> API -> AI, we can hook into handleSend result to save.
    // Or use useEffect on messages.
    // useEffect approach ensures any change (user or ai) is captured.
    useEffect(() => {
        if (!localStorage.getItem('token') || messages.length === 0) return;

        const saveHistory = async () => {
            try {
                if (sessionId) {
                    await chatService.updateSession(sessionId, null, messages);
                } else {
                    // Create new Only if we have at least one valid exchange or user msg
                    const firstMsg = messages[0];
                    if (firstMsg) {
                        const title = firstMsg.content.slice(0, 30) + (firstMsg.content.length > 30 ? "..." : "");
                        const session = await chatService.createSession(title, messages);
                        setSessionId(session.id);
                    }
                }
            } catch (err) {
                console.error("Failed to auto-save chat:", err);
            }
        };
        // Debounce slightly to catch rapid updates (like user msg + wait + ai msg)
        // Wait, immediate save on user message might race with creation for AI message.
        // If sessionId is null, user message triggers create. 
        // Then AI message comes, triggers update. This is fine.
        // A small timeout helps avoid double save on immediate state updates.
        const timer = setTimeout(saveHistory, 1000);
        return () => clearTimeout(timer);
    }, [messages, sessionId]);

    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto'; // Reset height
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`; // Set to scrollHeight
        }
    }, [input]);

    // Focus on mount
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.focus();
        }
    }, []);

    // Role (System Prompt) State
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

    const handleDeleteSession = async (e, id) => {
        e.stopPropagation(); // Prevent opening the chat
        if (!window.confirm("Delete this chat?")) return;

        try {
            await chatService.deleteSession(id);
            setChatHistory(prev => prev.filter(s => s.id !== id));
            // If deleted active session, clear view
            if (id === sessionId) {
                setMessages([]);
                setSessionId(null);
            }
        } catch (err) {
            console.error("Failed to delete session:", err);
        }
    };

    const handleSend = async (text = input) => {
        if (!text.trim() || loading) return;

        const userMsg = { role: 'user', content: text };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        if (!localStorage.getItem('token')) {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: "Authentication error. Please log in to continue."
            }]);
            setLoading(false);
            return;
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 180000); // 180s timeout

        try {
            // Construct history including system prompt if present
            let history = [...messages, userMsg];

            if (systemPrompt.trim()) {
                history = [{ role: 'system', content: systemPrompt }, ...history];
            }

            const response = await authService.fetchWithAuth(`${import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'}/api/chat/message`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ messages: history }),
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.detail || 'Failed to fetch');
            }

            const data = await response.json();
            const aiMsg = { role: 'assistant', content: data.response };
            setMessages(prev => [...prev, aiMsg]);

            if (onUsageUpdate) onUsageUpdate();

        } catch (error) {
            console.error(error);
            let errorMessage = "Error: Could not connect to AI service.";

            if (error.name === 'AbortError') {
                errorMessage = "Error: Request timed out. The backend might be waking up (cold start) or there is a connection issue. Please try again in a moment.";
            } else if (error.message.includes('expired') || error.message.includes('Authentication')) {
                errorMessage = error.message;
            } else if (error.message.includes('limit') || error.message.includes('Insufficient credits')) {
                errorMessage = "Usage limit reached. Please upgrade your plan or top up credits.";
            } else {
                errorMessage = `Error: ${error.message}`;
            }

            setMessages(prev => [...prev, { role: 'assistant', content: errorMessage }]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        // Prevent sending during IME composition (e.g., Japanese, Chinese input)
        if (e.nativeEvent.isComposing) return;

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

    // History State
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [chatHistory, setChatHistory] = useState([]);

    const openHistory = async () => {
        setIsHistoryOpen(true);
        try {
            const sessions = await chatService.getSessions();
            setChatHistory(sessions);
        } catch (err) {
            console.error("Failed to load history:", err);
        }
    };

    const loadSession = async (id) => {
        try {
            setLoading(true);
            setIsHistoryOpen(false);
            const session = await chatService.getSession(id);
            setSessionId(session.id);
            setMessages(session.messages || []);
        } catch (err) {
            console.error("Failed to load session:", err);
        } finally {
            setLoading(false);
        }
    };

    const suggestions = [
        { title: "SaaS Boilerplate", desc: "FastAPI + React setup with auth" },
        { title: "Portfolio Website", desc: "Modern showcase with galleries" },
        { title: "E-commerce Backend", desc: "Scalable API with proper DB schema" },
        { title: "Interactive Graph", desc: "D3.js visualization dashboard" }
    ];

    return (
        <div className={styles.chatContainer}>
            {/* Portal Actions to Header */}
            {document.getElementById('header-actions-root') && createPortal(
                <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: '8px' }}>
                    <button
                        className={`${styles.headerButton} ${styles.resetBtn}`}
                        onClick={handleReset}
                        title="Reset Chat"
                    >
                        <FiRefreshCw /> Reset
                    </button>
                    <button
                        className={`${styles.headerButton} ${styles.historyBtn}`}
                        onClick={openHistory}
                        title="View Chat History"
                    >
                        <FiMessageSquare /> Chats
                    </button>
                </div>,
                document.getElementById('header-actions-root')
            )
            }

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
                                        <div className={styles.loadingBar}></div>
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
                            ref={textareaRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Send a message..."
                            rows={1}
                            autoFocus
                        />
                    </div>
                    <div className={styles.inputControls}>
                        <button className={styles.inputActionBtn} onClick={openSettings} title="Role">
                            <FiSettings /> Role
                        </button>
                        <div style={{ flex: 1 }}></div>
                        <button className={styles.sendButton} onClick={() => handleSend()} disabled={loading || !input.trim()}>
                            <FiArrowUp size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {/* SETTINGS MODAL */}
            {
                isSettingsOpen && (
                    <div className={styles.modalOverlay} onClick={() => setIsSettingsOpen(false)}>
                        <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                            <h3 className={styles.modalTitle}>Role</h3>
                            <div className={styles.modalBody}>
                                <label className={styles.modalLabel}>
                                    Define the role and behavior of the AI. This is automatically applied to your conversation.
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
                )
            }

            {/* HISTORY MODAL */}
            {isHistoryOpen && (
                <div className={styles.modalOverlay} onClick={() => setIsHistoryOpen(false)}>
                    <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <h3 className={styles.modalTitle}>Your Chats</h3>
                        <div className={styles.historyList}>
                            {Array.isArray(chatHistory) && chatHistory.length === 0 ? (
                                <p className={styles.emptyHistory}>No previous chats found.</p>
                            ) : (
                                (chatHistory || []).map((session) => (
                                    <div
                                        key={session.id}
                                        className={`${styles.historyItem} ${session.id === sessionId ? styles.activeSession : ''}`}
                                        onClick={() => loadSession(session.id)}
                                    >
                                        <div className={styles.historyInfo}>
                                            <span className={styles.historyTitle}>{session.title || 'Untitled Chat'}</span>
                                            <span className={styles.historyDate}>
                                                {new Date(session.updated_at || session.created_at || Date.now()).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <button
                                            onClick={(e) => handleDeleteSession(e, session.id)}
                                            className={styles.deleteChatBtn}
                                            title="Delete Chat"
                                        >
                                            <FiTrash2 size={16} />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                        <div className={styles.modalActions} style={{ justifyContent: 'space-between' }}>
                            <button
                                className={styles.saveBtn}
                                onClick={() => {
                                    setMessages([]);
                                    setSessionId(null);
                                    setIsHistoryOpen(false);
                                }}
                            >
                                + New Chat
                            </button>
                            <button className={styles.cancelBtn} onClick={() => setIsHistoryOpen(false)}>Close</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatPage;
// HMR Trigger 2
