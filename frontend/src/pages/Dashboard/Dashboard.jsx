import React, { useState, useRef, useEffect } from 'react';
import styles from './Dashboard.module.css';
import ProjectForm from '../../components/ProjectForm/ProjectForm';
import PipedLoading from '../../components/PipedLoading/PipedLoading';

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
                                            style={{ cursor: 'default', resize: 'none' }}
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
