import React, { useState, useRef, useEffect } from 'react';
import styles from './Dashboard.module.css';
import ProjectForm from '../../components/ProjectForm/ProjectForm';

const Dashboard = ({ autoPrompt, onPromptHandled, onUsageUpdate }) => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const messagesEndRef = useRef(null);
    const [useEnhancer, setUseEnhancer] = useState(true);
    const [lastFormData, setLastFormData] = useState(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages.length, loading]);

    useEffect(() => {
        if (autoPrompt) {
            handleFormSubmit({ additionalInstructions: autoPrompt, type: 'Web Application', backendStack: ['FastAPI'], complexity: 'Medium', frontendStack: [], database: 'None', aiControl: 'Strict' });
            onPromptHandled();
        }
    }, [autoPrompt]);

    // Effect to trigger enhancement when toggling "Enhanced" on
    useEffect(() => {
        if (useEnhancer && messages.length > 0 && lastFormData) {
            // Get the last message (which is expected to be the generated prompt, edited or not)
            const lastMessage = messages[messages.length - 1];
            if (lastMessage.role === 'ai' && lastMessage.content) {
                // Use the CURRENT content (including edits) as the input instruction
                const enhancedFormData = {
                    ...lastFormData,
                    additionalInstructions: lastMessage.content
                };
                handleFormSubmit(enhancedFormData);
            }
        }
    }, [useEnhancer]);

    const handleFormSubmit = async (formData) => {
        // Display representation for user
        const displayGoal = formData.additionalInstructions;

        // Store this valid submission
        setLastFormData(formData);

        const userMessage = { role: 'user', content: displayGoal };
        setMessages([userMessage]); // Only show latest generation
        setLoading(true);

        const token = localStorage.getItem('token');
        if (!token) {
            setMessages(prev => [...prev, { role: 'ai', content: 'Authentication error. Please log in.' }]);
            setLoading(false);
            return;
        }

        try {
            const response = await fetch('http://localhost:8000/api/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    user_intent: formData.additionalInstructions,
                    target_tool: 'PromptOps',
                    project_title: formData.title,
                    project_type: formData.type,
                    frontend_stack: formData.frontendStack,
                    backend_stack: formData.backendStack,
                    database: formData.database,
                    complexity: formData.complexity,
                    ai_control: formData.aiControl,
                    enhance_prompt: useEnhancer
                }),
            });
            if (response.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('userEmail');
                setMessages(prev => [...prev, { role: 'ai', content: 'Session expired. Please log in again.' }]);
                setLoading(false);
                return;
            }

            if (response.status === 403) {
                const errData = await response.json().catch(() => ({}));
                const msg = errData.detail || 'Usage limit reached. Please upgrade to the Dev plan in Settings.';
                setMessages(prev => [...prev, { role: 'ai', content: msg }]);
                setLoading(false);
                return;
            }

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.detail || 'Generation failed');
            }

            const data = await response.json();

            // Trigger usage update in parent
            if (onUsageUpdate) onUsageUpdate();

            const aiMessage = { role: 'ai', content: data.generated_instruction };
            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'ai', content: error.message || 'Connection error. Please ensure the backend is running.' }]);
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = async (text) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    return (
        <div className={styles.dashboardContainer}>
            <div className={styles.splitGrid}>
                {/* Left Section: Form */}
                <div className={styles.formSection}>
                    <ProjectForm onSubmit={handleFormSubmit} />
                </div>

                {/* Right Section: Results */}
                <div className={styles.chatSection}>
                    <div className={styles.resultsHeader}>
                        <div className={styles.segmentedControl}>
                            <div className={`${styles.slidingBackground} ${useEnhancer ? styles.slideRight : styles.slideLeft}`}></div>
                            <button
                                className={`${styles.segmentOption} ${!useEnhancer ? styles.textActive : ''}`}
                                onClick={() => setUseEnhancer(false)}
                            >
                                Template
                            </button>
                            <button
                                className={`${styles.segmentOption} ${useEnhancer ? styles.textActive : ''}`}
                                onClick={() => setUseEnhancer(true)}
                            >
                                Enhanced
                            </button>
                        </div>
                    </div>

                    <div className={styles.outputArea}>
                        {messages.length === 0 && !loading ? (
                            <div className={styles.outputPlaceholder}>
                                <div className={styles.placeholderIcon}>🔍</div>
                                <div className={styles.placeholderText}>Generate your project prompt</div>
                                <div className={styles.placeholderSub}>Configure your project settings to generate a professional prompt</div>
                            </div>
                        ) : (
                            <div className={styles.messagesList}>
                                {messages.map((msg, index) => {
                                    if (msg.role !== 'ai') return null;

                                    return (
                                        <div key={index} className={styles.message}>
                                            <div className={styles.messageContent}>
                                                <button
                                                    className={styles.copyBtn}
                                                    onClick={() => handleCopy(msg.content)}
                                                >
                                                    {copied ? 'COPIED' : 'COPY'}
                                                </button>
                                                <AutoResizeTextarea
                                                    value={msg.content}
                                                    onChange={(newText) => {
                                                        setMessages(prev => prev.map((m, i) =>
                                                            i === index ? { ...m, content: newText } : m
                                                        ));
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    );
                                })}
                                {loading && (
                                    <div className={styles.loadingContainer}>
                                        <div className={styles.loadingBarBox}>
                                            <div className={styles.loadingBarFill}></div>
                                        </div>
                                        <div className={styles.loadingText}>Generating intelligent prompt...</div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const AutoResizeTextarea = ({ value, onChange }) => {
    const textareaRef = useRef(null);
    const shadowRef = useRef(null);

    useEffect(() => {
        if (textareaRef.current && shadowRef.current) {
            // content update -> update shadow value -> measure shadow -> set real height
            shadowRef.current.value = value;
            const newHeight = shadowRef.current.scrollHeight;
            textareaRef.current.style.height = `${newHeight}px`;
        }
    }, [value]);

    return (
        <div style={{ position: 'relative', width: '100%' }}>
            {/* Shadow textarea for height calculation */}
            <textarea
                ref={shadowRef}
                className={styles.codeEditor}
                value={value}
                readOnly
                tabIndex={-1}
                aria-hidden="true"
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    visibility: 'hidden',
                    height: '0',
                    overflow: 'hidden',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    zIndex: -100
                }}
            />
            {/* Visible textarea */}
            <textarea
                ref={textareaRef}
                className={styles.codeEditor}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                rows={1}
                style={{ overflow: 'hidden' }}
            />
        </div>
    );
};

export default Dashboard;
// HMR Trigger 4
