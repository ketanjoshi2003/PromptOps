import React, { useState, useEffect } from 'react';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard/Dashboard';
import Projects from './pages/Projects/Projects';
import ChatPage from './pages/ChatPage';
import ChainPage from './pages/ChainPage';
import SettingsPage from './pages/SettingsPage';
import { authService } from './services/authService';
import UpgradeModal from './components/UpgradeModal/UpgradeModal';

function App() {
    const [currentView, setCurrentView] = useState('dashboard');
    const [user, setUser] = useState(null);
    const [autoPrompt, setAutoPrompt] = useState(null);
    const [isAuthOpen, setIsAuthOpen] = useState(false);
    const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
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
            <Layout
                currentView={currentView}
                onNavigate={setCurrentView}
                externalUser={user}
                onUserRefresh={handleUserRefresh}
                isAuthOpen={isAuthOpen}
                setIsAuthOpen={setIsAuthOpen}
                onOpenUpgrade={() => setIsUpgradeModalOpen(true)}
            >
                {currentView === 'dashboard' && (
                    <Dashboard
                        autoPrompt={autoPrompt}
                        onPromptHandled={handlePromptHandled}
                        onUsageUpdate={handleUserRefresh}
                    />
                )}
                {currentView === 'projects' && <Projects isVisible={currentView === 'projects'} />}
                {currentView === 'chat' && <ChatPage />}
                {currentView === 'chain' && <ChainPage />}
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
