import React, { useState, useEffect } from 'react';
import styles from './Layout.module.css';
import { FiHome, FiMessageSquare, FiFolder, FiSettings, FiLayers } from 'react-icons/fi';
import { authService } from '../../services/authService';

const Layout = ({ children, onPromptSelect, currentView, onNavigate, externalUser, onUserRefresh, isAuthOpen, setIsAuthOpen, onOpenUpgrade, useEnhancer, setUseEnhancer, latestResult }) => {
    // Initialize based on screen width
    const [isSidebarOpen, setIsSidebarOpen] = useState(typeof window !== 'undefined' ? window.innerWidth > 768 : true);

    // Auth State
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);
    // isAuthOpen is now a prop
    const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
    const [isLoading, setIsLoading] = useState(false);

    // Form State
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [headerCopied, setHeaderCopied] = useState(false);

    // Sync with external user
    useEffect(() => {
        if (externalUser) {
            setIsAuthenticated(true);
            setCurrentUser(externalUser);
        } else if (externalUser === null && authService.getCurrentUser()) {
            // If external is null (not yet fetched or empty) but authService has user
            // Wait for app fetch? OR use authService fallback
            // Better: if App passes user=null but we have token, App is likely loading or failed.
            // If App passes user=null vs user=undefined?
            // Let's assume externalUser drives the state if passed.
            // Actually, if externalUser is null, it means no authenticated user from App's perspective

            // BUT App initializes with null.
            // Let's stick to: if externalUser updates, we update.
        }
    }, [externalUser]);

    // Check for existing session - Initial Mount
    useEffect(() => {
        // If App manages usage, we rely on it.
        // But Layout also did its own fetch.
        // Let's defer to onUserRefresh if present.
        if (onUserRefresh) {
            onUserRefresh();
        }
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
            } else {
                await authService.register({ email, password });
                await authService.login({ email, password });
            }

            // Sync via App
            if (onUserRefresh) await onUserRefresh();

            // We can locally update too, but App's effects will trigger setCurrentUser via props
            // We can locally update too, but App's effects will trigger setCurrentUser via props
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
                                {[...Array(currentUser.plan === 'dev' ? 50 : 5)].map((_, i) => (
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
                                <div className={styles.redCircle}>
                                    <span className={styles.pipe}>|</span>
                                </div>
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
                                {authMode === 'login' ? 'Welcome Back' : 'Create Account'}
                            </h2>
                            <p className={styles.modalSubtitle}>
                                {authMode === 'login'
                                    ? 'Enter your details to access your workspace.'
                                    : 'Join us to start building better prompts.'}
                            </p>

                            {error && <div style={{ color: 'red', marginBottom: '1rem', fontSize: '0.9rem' }}>{error}</div>}

                            <div key={authMode} className={styles.formFade}>
                                <div className={styles.inputGroup}>
                                    <input
                                        type="email"
                                        placeholder="Email Address"
                                        className={styles.loginInput}
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
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

                                <button
                                    className={styles.loginBtn}
                                    onClick={handleAuthSubmit}
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Processing...' : (authMode === 'login' ? 'Sign In' : 'Create Account')}
                                </button>
                            </div>

                            <div className={styles.authSwitch}>
                                {authMode === 'login' ? (
                                    <>
                                        Don't have an account?{' '}
                                        <span onClick={() => {
                                            setAuthMode('register');
                                            setError('');
                                        }}>Sign up</span>
                                    </>
                                ) : (
                                    <>
                                        Already have an account?{' '}
                                        <span onClick={() => {
                                            setAuthMode('login');
                                            setError('');
                                        }}>Sign in</span>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default Layout;
