import React, { useState, useEffect } from 'react';
import styles from './Layout.module.css';
import { FiHome, FiMessageSquare, FiFolder, FiSettings, FiLayers, FiMessageCircle, FiMail } from 'react-icons/fi';
import { authService } from '../../services/authService';
import { feedbackService } from '../../services/feedbackService';
import FeedbackModal from '../FeedbackModal/FeedbackModal';

import { GoogleLogin } from '@react-oauth/google';

const Layout = ({ children, onPromptSelect, currentView, onNavigate, externalUser, onUserRefresh, isAuthOpen, setIsAuthOpen, onOpenUpgrade, useEnhancer, setUseEnhancer, latestResult }) => {
    // Initialize based on screen width
    const [isSidebarOpen, setIsSidebarOpen] = useState(typeof window !== 'undefined' ? window.innerWidth > 768 : true);

    // Auth State
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    // isAuthOpen is now a prop
    const [authMode, setAuthMode] = useState('login'); // 'login' | 'register' | 'otp'
    const [isLoading, setIsLoading] = useState(false);
    const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

    // Form State
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [headerCopied, setHeaderCopied] = useState(false);
    const [showEmailForm, setShowEmailForm] = useState(false);

    // Sync with external user
    useEffect(() => {
        if (externalUser) {
            setIsAuthenticated(true);
            setCurrentUser(externalUser);
        } else if (externalUser === null && authService.getCurrentUser()) {
            // Logic handled by App
        }
    }, [externalUser]);

    // Check for existing session - Initial Mount
    useEffect(() => {
        if (onUserRefresh) {
            onUserRefresh();
        }

        // Real-world SaaS: Poll for updates (e.g. credits) and refresh on focus
        const pollInterval = setInterval(() => {
            if (onUserRefresh && !document.hidden) onUserRefresh();
        }, 30000); // 30 seconds

        const handleFocus = () => {
            if (onUserRefresh) onUserRefresh();
        };

        window.addEventListener('focus', handleFocus);

        return () => {
            clearInterval(pollInterval);
            window.removeEventListener('focus', handleFocus);
        };
    }, []);

    // Auto-close on resize to mobile
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth <= 768) {
                setIsSidebarOpen(false);
            } else {
                setIsSidebarOpen(true);
            }
        };
        window.addEventListener('resize', handleResize); // Re-added listener for completeness
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Reset form when opened
    useEffect(() => {
        if (isAuthOpen) {
            setAuthMode('login');
            setError('');
            setEmail('');
            setPassword('');
            setOtp('');
            setShowEmailForm(false);
        }
    }, [isAuthOpen]);

    const handleAuthClick = () => {
        if (isAuthenticated) {
            if (window.confirm("Are you sure you want to sign out?")) {
                authService.logout();
                setIsAuthenticated(false);
                setCurrentUser(null);
                if (onUserRefresh) onUserRefresh(); // Notify App
            }
        } else {
            // Let the effect handle reset
            setIsAuthOpen(true);
        }
    };

    const handleAuthSubmit = async () => {
        setIsLoading(true);
        setError('');

        try {
            if (authMode === 'login') {
                await authService.login({ email, password });
                // Sync via App
                if (onUserRefresh) await onUserRefresh();
                setIsAuthOpen(false);
            } else if (authMode === 'register') {
                await authService.register({ email, password });
                // If success, switch to OTP (don't login yet)
                setAuthMode('otp');
                // Don't close modal
            } else if (authMode === 'otp') {
                await authService.verifyOTP(email, otp);
                if (onUserRefresh) await onUserRefresh();
                setIsAuthOpen(false);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        setIsLoading(true);
        setError('');
        try {
            await authService.googleLogin(credentialResponse.credential);
            if (onUserRefresh) await onUserRefresh();
            setIsAuthOpen(false);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleHeaderCopy = async () => {
        if (!latestResult) return;
        try {
            await navigator.clipboard.writeText(latestResult);
            setHeaderCopied(true);
            setTimeout(() => setHeaderCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
        }
    };

    const handleFeedbackSubmit = async (data) => {
        await feedbackService.sendFeedback(data);
        alert("Thank you for your feedback!");
    };

    return (
        <div className={styles.container}>
            {/* Mobile Overlay Backdrop */}
            <div
                className={`${styles.overlay} ${isSidebarOpen ? styles.overlayOpen : ''}`}
                onClick={() => setIsSidebarOpen(false)}
            />

            <aside className={`${styles.sidebar} ${isSidebarOpen ? styles.sidebarOpen : styles.sidebarClosed}`}>

                <div className={styles.sidebarNav}>
                    <button
                        className={`${styles.navItem} ${currentView === 'dashboard' ? styles.navItemActive : ''}`}
                        onClick={() => {
                            onNavigate('dashboard');
                            if (window.innerWidth <= 768) setIsSidebarOpen(false);
                        }}
                    >
                        <FiHome />
                        Home
                    </button>
                    <button
                        className={`${styles.navItem} ${currentView === 'chain' ? styles.navItemActive : ''}`}
                        onClick={() => {
                            onNavigate('chain');
                            if (window.innerWidth <= 768) setIsSidebarOpen(false);
                        }}
                    >
                        <FiLayers />
                        Chain
                    </button>
                    <button
                        className={`${styles.navItem} ${currentView === 'chat' ? styles.navItemActive : ''}`}
                        onClick={() => {
                            onNavigate('chat');
                            if (window.innerWidth <= 768) setIsSidebarOpen(false);
                        }}
                    >
                        <FiMessageSquare />
                        Chat
                    </button>
                    <button
                        className={`${styles.navItem} ${currentView === 'projects' ? styles.navItemActive : ''}`}
                        onClick={() => {
                            onNavigate('projects');
                            if (window.innerWidth <= 768) setIsSidebarOpen(false);
                        }}
                    >
                        <FiFolder />
                        Projects
                    </button>
                    <button
                        className={`${styles.navItem} ${currentView === 'settings' ? styles.navItemActive : ''}`}
                        onClick={() => {
                            onNavigate('settings');
                            if (window.innerWidth <= 768) setIsSidebarOpen(false);
                        }}
                    >
                        <FiSettings />
                        Settings
                    </button>

                    <button
                        className={`${styles.navItem}`}
                        onClick={() => {
                            setIsFeedbackOpen(true);
                            if (window.innerWidth <= 768) setIsSidebarOpen(false);
                        }}
                    >
                        <FiMessageCircle />
                        Feedback
                    </button>

                </div>

                <div className={styles.bottomNav}>
                    {isAuthenticated && currentUser?.plan && (
                        <div
                            className={styles.usageStats}
                            onClick={() => {
                                if (onOpenUpgrade) onOpenUpgrade();
                                if (window.innerWidth <= 768) setIsSidebarOpen(false);
                            }}
                            title="Click to upgrade plan"
                        >
                            <div className={styles.usageHeader}>
                                <span className={styles.planLabel}>
                                    {currentUser.plan === 'dev' ? 'Dev Plan' : 'Free Plan'}
                                </span>
                                <span className={styles.usageCount}>
                                    {currentUser.credits} <span className={styles.usageUnit}>left</span>
                                </span>
                            </div>
                            <div className={styles.usageBar}>
                                {/* Show max(credits, plan_limit) but cap at 50 visually to prevent overflow */}
                                {[...Array(Math.min(50, Math.max(currentUser.credits, currentUser.plan === 'dev' ? 50 : 5)))].map((_, i) => (
                                    <div
                                        key={i}
                                        className={`${styles.usagePipe} ${i < currentUser.credits ? styles.usagePipeActive : ''}`}
                                    />
                                ))}
                            </div>
                        </div>
                    )}



                    <div className={styles.userProfile} onClick={handleAuthClick}>
                        <div className={styles.avatar}>
                            {isAuthenticated ? (currentUser?.email?.[0]?.toUpperCase() || 'U') : '?'}
                        </div>
                        <div className={styles.userInfo}>
                            <div className={styles.username}>
                                {isAuthenticated ? (currentUser?.email?.split('@')[0] || 'User') : 'Sign In'}
                            </div>
                        </div>
                    </div>
                </div>
            </aside>
            <main className={styles.main}>
                <div className={`${styles.topBar} ${currentView === 'dashboard' ? styles.topBarDashboard : ''}`}>
                    <div className={styles.logoArea}>
                        <div
                            className={styles.logoContainer}
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            title="Toggle Sidebar"
                        >
                            <div className={styles.logoMark}>
                                <img src="/favicon.svg" alt="PromptOps Logo" className={styles.logoImage} />
                            </div>
                            {currentView === 'dashboard' && (
                                <span className={styles.modelName}>PromptOps</span>
                            )}
                            {currentView === 'settings' && (
                                <span className={styles.modelName}>Settings</span>
                            )}
                            {currentView === 'chain' && (
                                <span className={styles.modelName}>Chain</span>
                            )}
                            {currentView === 'chat' && (
                                <span className={styles.modelName}>Chat</span>
                            )}
                            {currentView === 'projects' && (
                                <span className={styles.modelName}>Projects</span>
                            )}
                        </div>
                    </div>

                    <div className={styles.headerActionsArea}>
                        {currentView === 'dashboard' && (
                            <div className={styles.headerToggle}>
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
                        )}
                        <div id="header-actions-root" className={styles.headerActionsRoot}></div>
                        {currentView === 'dashboard' && latestResult && (
                            <button
                                className={styles.headerCopyBtn}
                                onClick={handleHeaderCopy}
                            >
                                {headerCopied ? 'COPIED' : 'COPY'}
                            </button>
                        )}
                    </div>
                </div>
                <div className={styles.contentArea}>
                    {children}
                </div>
            </main >

            {/* Auth Modal */}
            {
                isAuthOpen && (
                    <div className={styles.modalOverlay} onClick={() => setIsAuthOpen(false)}>
                        <div className={styles.loginModal} onClick={e => e.stopPropagation()}>
                            <h2 className={styles.modalTitle}>
                                {authMode === 'login' ? 'Welcome Back' : (authMode === 'register' ? 'Create Account' : 'Verify Email')}
                            </h2>
                            <p className={styles.modalSubtitle}>
                                {authMode === 'login'
                                    ? 'Enter your details to access your workspace.'
                                    : (authMode === 'register' ? 'Join us to start building better prompts.' : 'Enter the OTP sent to your email.')}
                            </p>

                            {error && <div style={{ color: 'red', marginBottom: '1rem', fontSize: '0.9rem' }}>{error}</div>}

                            <div key={authMode} className={styles.formFade}>
                                {authMode !== 'otp' && (
                                    <>
                                        <div style={{ marginBottom: '1rem', marginTop: '0.5rem', width: '100%' }}>
                                            <GoogleLogin
                                                onSuccess={handleGoogleSuccess}
                                                onError={() => {
                                                    console.log('Login Failed');
                                                    setError("Google Login Failed");
                                                }}
                                                theme="filled_black"
                                                size="large"
                                                width="100%"
                                                text="continue_with"
                                            />
                                        </div>

                                        {!showEmailForm && (
                                            <div style={{ margin: '0.5rem 0', width: '100%' }}>
                                                <button
                                                    onClick={() => setShowEmailForm(true)}
                                                    style={{
                                                        width: '100%',
                                                        height: '40px',
                                                        borderRadius: '4px',
                                                        border: '1px solid #303030',
                                                        background: '#131314', // Google Dark
                                                        color: '#e3e3e3',
                                                        cursor: 'pointer',
                                                        fontSize: '14px',
                                                        fontFamily: 'Roboto, arial, sans-serif',
                                                        fontWeight: '500',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center', // Center content
                                                        position: 'relative',
                                                        transition: 'background-color 0.2s'
                                                    }}
                                                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#2d2e2f'}
                                                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#131314'}
                                                >
                                                    <div style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        marginRight: '12px'
                                                    }}>
                                                        <FiMail size={18} />
                                                    </div>
                                                    <span>Continue with Email</span>
                                                </button>
                                            </div>
                                        )}
                                    </>
                                )}

                                {showEmailForm && authMode !== 'otp' && (
                                    <>
                                        <div className={styles.inputGroup}>
                                            <input
                                                type="email"
                                                placeholder="Email Address"
                                                className={styles.loginInput}
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                autoFocus
                                            />
                                        </div>

                                        <div className={styles.inputGroup}>
                                            <input
                                                type="password"
                                                placeholder="Password"
                                                className={styles.loginInput}
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                            />
                                        </div>
                                    </>
                                )}

                                {authMode === 'otp' && (
                                    <div className={styles.inputGroup}>
                                        <input
                                            type="text"
                                            placeholder="Enter 6-digit OTP"
                                            className={styles.loginInput}
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value)}
                                            maxLength={6}
                                            autoFocus
                                        />
                                    </div>
                                )}

                                {(authMode === 'otp' || showEmailForm) && (
                                    <button
                                        className={styles.loginBtn}
                                        onClick={handleAuthSubmit}
                                        disabled={isLoading}
                                    >
                                        {isLoading ? 'Processing...' : (authMode === 'login' ? 'Sign In' : (authMode === 'register' ? 'Create Account' : 'Verify OTP'))}
                                    </button>
                                )}

                            </div>

                            <div className={styles.authSwitch}>
                                {authMode === 'login' ? (
                                    <>
                                        Don't have an account?{' '}
                                        <span onClick={() => {
                                            setAuthMode('register');
                                            setError('');
                                            setShowEmailForm(false);
                                        }}>Sign up</span>
                                    </>
                                ) : (
                                    <>
                                        {authMode === 'register' && (
                                            <>
                                                Already have an account?{' '}
                                                <span onClick={() => {
                                                    setAuthMode('login');
                                                    setError('');
                                                    setShowEmailForm(false);
                                                }}>Sign in</span>
                                            </>
                                        )}
                                        {authMode === 'otp' && (
                                            <span onClick={() => {
                                                setAuthMode('register');
                                                setError('');
                                                setOtp('');
                                            }}>Back to Register</span>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )
            }

            <FeedbackModal
                isOpen={isFeedbackOpen}
                onClose={() => setIsFeedbackOpen(false)}
                onSubmit={handleFeedbackSubmit}
            />
        </div >
    );
};

export default Layout;
