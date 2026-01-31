import React, { useState, useEffect } from 'react';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard/Dashboard';
import Projects from './pages/Projects/Projects';
import ChatPage from './pages/ChatPage';
import ChainPage from './pages/ChainPage';
import SettingsPage from './pages/SettingsPage';
import { authService } from './services/authService';
import UpgradeModal from './components/UpgradeModal/UpgradeModal';
import PipedLoading from './components/PipedLoading/PipedLoading';
import loadingStyles from './components/PipedLoading/PipedLoading.module.css';
import { healthService } from './services/healthService';

import PrivacyPolicyPage from './pages/PrivacyPolicyPage';

function App() {
    // Basic routing check for privacy policy
    if (window.location.pathname === '/privacy-policy') {
        return <PrivacyPolicyPage />;
    }

    const [currentView, setCurrentView] = useState('dashboard');
    const [user, setUser] = useState(null);
    const [autoPrompt, setAutoPrompt] = useState(null);
    const [isAuthOpen, setIsAuthOpen] = useState(false);
    const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
    const [useEnhancer, setUseEnhancer] = useState(true);
    const [latestResult, setLatestResult] = useState('');
    const [isAppLoading, setIsAppLoading] = useState(true);
    // Initialize theme from localStorage or default to 'dark'
    const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');

    const fetchUser = async () => {
        const currentUser = authService.getCurrentUser();
        if (currentUser) {
            setUser(currentUser);
        } else {
            setUser(null);
        }
    };

    useEffect(() => {
        fetchUser();
        // Send wake-up signal to backend
        healthService.wakeUp();

        // Ensure loading shows for a minimum amount of time for smoothness
        const timer = setTimeout(() => {
            setIsAppLoading(false);
        }, 1500);

        return () => clearTimeout(timer);
    }, []);

    // Theme Effect
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    const handleUserRefresh = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setUser(null);
            return;
        }

        try {
            const userData = await authService.getProfile();
            setUser(userData);
        } catch (error) {
            console.error("Failed to refresh user:", error);
            if (error.message.includes('Failed to fetch profile')) {
                // Potentially logout if it's a 401
            }
        }
    };

    const handlePromptHandled = () => setAutoPrompt(null);

    return (
        <>
            {isAppLoading && (
                <div className={loadingStyles.fullPageOverlay}>
                    <PipedLoading text="Initializing PromptOps..." />
                </div>
            )}
            <Layout
                currentView={currentView}
                onNavigate={setCurrentView}
                externalUser={user}
                onUserRefresh={handleUserRefresh}
                isAuthOpen={isAuthOpen}
                setIsAuthOpen={setIsAuthOpen}
                onOpenUpgrade={() => setIsUpgradeModalOpen(true)}
                useEnhancer={useEnhancer}
                setUseEnhancer={setUseEnhancer}
                latestResult={latestResult}
            >
                <div style={{ display: currentView === 'dashboard' ? 'block' : 'none', height: '100%' }}>
                    <Dashboard
                        autoPrompt={autoPrompt}
                        onPromptHandled={handlePromptHandled}
                        onUsageUpdate={handleUserRefresh}
                        useEnhancer={useEnhancer}
                        onResultChange={setLatestResult}
                    />
                </div>
                {currentView === 'projects' && <Projects isVisible={currentView === 'projects'} />}
                {currentView === 'chat' && <ChatPage onUsageUpdate={handleUserRefresh} />}
                {currentView === 'chain' && <ChainPage onUsageUpdate={handleUserRefresh} />}
                {currentView === 'settings' && (
                    <SettingsPage
                        onUserRefresh={handleUserRefresh}
                        theme={theme}
                        setTheme={setTheme}
                        onOpenAuth={() => setIsAuthOpen(true)}
                        currentUser={user}
                        onOpenUpgrade={() => setIsUpgradeModalOpen(true)}
                    />
                )}
            </Layout>

            <UpgradeModal
                isOpen={isUpgradeModalOpen}
                onClose={() => setIsUpgradeModalOpen(false)}
                currentUser={user}
                onUpgradeSuccess={(updatedUser) => {
                    setUser(updatedUser);
                    handleUserRefresh();
                }}
            />
        </>
    );
}

export default App;
