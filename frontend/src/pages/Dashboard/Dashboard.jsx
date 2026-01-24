import React, { useState, useRef, useEffect } from 'react';
import styles from './Dashboard.module.css';
import ProjectForm from '../../components/ProjectForm/ProjectForm';
import PipedLoading from '../../components/PipedLoading/PipedLoading';
import { authService } from '../../services/authService';

const Dashboard = ({ autoPrompt, onPromptHandled, onUsageUpdate, useEnhancer, onResultChange }) => {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);
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

    // Trigger re-generation when enhancer is toggled
    useEffect(() => {
        if (!lastFormData) return;

        if (useEnhancer) {
            // Switching TO Enhanced: Use current edited text if available
            const aiMessages = messages.filter(m => m.role === 'ai');
            const latestContent = aiMessages.length > 0 ? aiMessages[aiMessages.length - 1].content : null;

            if (latestContent) {
                // Use edited content as the seed for enhancement, do NOT overwrite original form data
                handleFormSubmit({
                    ...lastFormData,
                    additionalInstructions: latestContent
                }, false);
            } else {
                handleFormSubmit(lastFormData, false);
            }
        } else {
            // Switching TO Template: Revert to original goal
            handleFormSubmit(lastFormData, false); // Don't need to re-save
        }
    }, [useEnhancer]);

    const PLACEHOLDER_TEXT = "Configure your project parameters and click 'Generate Prompt' to create your tailored technical instruction.";

    // Sync latest results to parent for header copy button
    useEffect(() => {
        if (!onResultChange) return;

        const aiMessages = messages.filter(m => m.role === 'ai');
        const lastAiMessage = aiMessages.length > 0 ? aiMessages[aiMessages.length - 1] : null;

        if (lastAiMessage && lastAiMessage.content.trim().length > 0) {
            onResultChange(lastAiMessage.content);
        } else {
            onResultChange(PLACEHOLDER_TEXT);
        }
    }, [messages, onResultChange]);

    const handleFormSubmit = async (formData, shouldSaveData = true) => {
        if (loading) return; // Prevent double submission

        // Display representation for user
        const displayGoal = formData.additionalInstructions;

        // Store this valid submission only if it's a new form submission
        if (shouldSaveData) {
            setLastFormData(formData);
        }

        const userMessage = { role: 'user', content: displayGoal };
        setMessages([userMessage]); // Only show latest generation
        setLoading(true);

        const token = localStorage.getItem('token');
        if (!token) {
            setMessages(prev => [...prev, { role: 'ai', content: 'Authentication error. Please log in.', type: 'notification' }]);
            setLoading(false);
            return;
        }

        try {
            const response = await authService.fetchWithAuth('http://localhost:8000/api/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
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

            if (response.status === 403) {
                const errData = await response.json().catch(() => ({}));
                const msg = errData.detail || 'Usage limit reached. Please upgrade to the Dev plan in Settings.';
                setMessages(prev => [...prev, { role: 'ai', content: msg, type: 'notification' }]);
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
            setMessages(prev => [...prev, { role: 'ai', content: error.message || 'Connection error. Please ensure the backend is running.', type: 'notification' }]);
        } finally {
            setLoading(false);
        }
    };

    const aiMessages = messages.filter(m => m.role === 'ai');
    const lastAiMessage = aiMessages.length > 0 ? aiMessages[aiMessages.length - 1] : null;
    const hasContent = lastAiMessage && lastAiMessage.content.trim().length > 0;

    return (
        <div className={styles.dashboardContainer}>
            <div className={styles.splitGrid}>
                {/* Left Section: Form */}
                <div className={styles.formSection}>
                    <ProjectForm onSubmit={handleFormSubmit} isSubmitting={loading} />
                </div>

                {/* Right Section: Results */}
                <div className={styles.chatSection}>


                    <div className={styles.outputArea}>
                        {!hasContent && !loading ? (
                            <div className={styles.messagesList}>
                                <div className={styles.message}>
                                    <div className={styles.messageContent}>
                                        <textarea
                                            className={styles.codeEditor}
                                            value={PLACEHOLDER_TEXT}
                                            readOnly
                                            rows={2}
                                            style={{ cursor: 'default', resize: 'none', color: 'var(--color-accent-primary)' }}
                                        />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className={styles.messagesList}>
                                {messages.map((msg, index) => {
                                    if (msg.role !== 'ai') return null;

                                    return (
                                        <div key={index} className={styles.message}>
                                            <div className={styles.messageContent}>
                                                <AutoResizeTextarea
                                                    value={msg.content}
                                                    isNotification={msg.type === 'notification'}
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
                                        <PipedLoading text="Generating intelligent prompt..." />
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


const AutoResizeTextarea = ({ value, onChange, isNotification }) => {
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

    const renderHighlights = (text) => {
        if (!text) return null;
        // Split text into lines to apply highlighting line by line
        const lines = text.split('\n');
        return lines.map((line, i) => {
            const headerMatch = line.match(/^((#+)\s)(.*)/);
            const bulletMatch = line.match(/^(-\s)(.*)/);
            const numberMatch = line.match(/^(\d+[\.\)]\s)(.*)/);

            let content;
            if (headerMatch) {
                content = (
                    <>
                        <span style={{ color: 'var(--color-accent-primary)' }}>{headerMatch[1]}</span>
                        {headerMatch[3]}
                    </>
                );
            } else if (bulletMatch) {
                content = (
                    <>
                        <span style={{ color: 'var(--color-accent-primary)' }}>{bulletMatch[1]}</span>
                        {bulletMatch[2]}
                    </>
                );
            } else if (numberMatch) {
                content = (
                    <>
                        <span style={{ color: 'var(--color-accent-primary)' }}>{numberMatch[1]}</span>
                        {numberMatch[2]}
                    </>
                );
            } else {
                content = line;
            }

            return (
                <React.Fragment key={i}>
                    {content}
                    {i < lines.length - 1 && '\n'}
                </React.Fragment>
            );
        });
    };

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
            {/* Backdrop for highlights */}
            <div
                className={styles.codeEditor}
                aria-hidden="true"
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    color: isNotification ? 'var(--color-accent-primary)' : 'var(--color-text-primary)',
                    background: 'var(--color-bg-secondary)', // Visible background
                    pointerEvents: 'none',
                    borderColor: 'transparent', // Let textarea handle border
                    zIndex: 0,
                    overflow: 'hidden' // Match textarea
                }}
            >
                {renderHighlights(value)}
            </div>

            {/* Visible Input Textarea */}
            <textarea
                ref={textareaRef}
                className={styles.codeEditor}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                rows={1}
                style={{
                    overflow: 'hidden',
                    color: 'transparent',
                    background: 'transparent',
                    caretColor: 'var(--color-text-primary)',
                    position: 'relative',
                    zIndex: 1
                }}
                spellCheck={false}
                autoCorrect="off"
            />
        </div>
    );
};

export default Dashboard;
// HMR Trigger 4
