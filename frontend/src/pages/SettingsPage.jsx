import React, { useState, useEffect } from 'react';
import styles from './SettingsPage.module.css';
import { FiMoon, FiSun, FiCloud } from 'react-icons/fi';

const SettingsPage = ({ theme, setTheme, onUserRefresh }) => {
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [password, setPassword] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState('');
    const [userData, setUserData] = useState({ plan: 'free', generation_count: 0 });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchUserData();
    }, []);

    const fetchUserData = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            const response = await fetch('http://localhost:8000/api/auth/me', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setUserData(data);
            }
        } catch (err) {
            console.error("Failed to fetch user data", err);
        }
    };

    const handleUpgrade = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:8000/api/auth/upgrade', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                await fetchUserData(); // Refresh local data
                if (onUserRefresh) onUserRefresh(); // Refresh global app state (Sidebar)
                alert("Successfully upgraded to Dev plan!");
            }
        } catch (err) {
            console.error("Upgrade failed", err);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (!password) return;

        setIsDeleting(true);
        setError('');

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:8000/api/auth/me', {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ password })
            });

            if (response.ok) {
                localStorage.removeItem('token');
                window.location.reload();
            } else {
                const data = await response.json();
                setError(data.detail || "Failed to delete account. Incorrect password.");
                setIsDeleting(false);
            }
        } catch (err) {
            console.error(err);
            setError("Connection error. Please try again.");
            setIsDeleting(false);
        }
    };

    const getLimit = (plan) => plan === 'dev' ? 50 : 5;
    const limit = getLimit(userData.plan);

    return (
        <div className={styles.container}>


            <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Appearance</h2>
                <div className={styles.settingItem}>
                    <div className={styles.settingInfo}>
                        <span className={styles.settingName}>Theme Mode</span>
                        <span className={styles.settingDescription}>
                            Select your preferred interface theme
                        </span>
                    </div>

                    <div className={styles.toggleContainer}>
                        <button
                            className={`${styles.themeBtn} ${theme === 'light' ? styles.active : ''}`}
                            onClick={() => setTheme('light')}
                        >
                            <FiSun /> Light
                        </button>
                        <button
                            className={`${styles.themeBtn} ${theme === 'dark' ? styles.active : ''}`}
                            onClick={() => setTheme('dark')}
                        >
                            <FiMoon /> Dark
                        </button>
                    </div>
                </div>
            </div>

            <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Billing</h2>
                <div className={styles.settingItem}>
                    <div className={styles.settingInfo}>
                        <span className={styles.settingName}>Current Plan: {userData.plan === 'dev' ? 'Dev (Pro)' : 'Free'}</span>
                        <span className={styles.settingDescription}>
                            Usage: {userData.generation_count} / {limit} generations used
                        </span>
                    </div>
                    {userData.plan !== 'dev' && (
                        <button
                            className={styles.themeBtn}
                            style={{ border: '1px solid var(--color-border)' }}
                            onClick={handleUpgrade}
                            disabled={loading}
                        >
                            {loading ? 'Upgrading...' : 'Upgrade to Dev'}
                        </button>
                    )}
                </div>
            </div>

            <div className={`${styles.section} ${styles.dangerZone}`}>
                <h2 className={styles.sectionTitle} style={{ color: '#ef4444' }}>Danger Zone</h2>
                <div className={styles.settingItem}>
                    <div className={styles.settingInfo}>
                        <span className={styles.settingName}>Delete Account</span>
                        <span className={styles.settingDescription}>
                            Permanently delete your account and all data
                        </span>
                    </div>

                    <button
                        className={styles.deleteBtn}
                        onClick={() => setShowDeleteModal(true)}
                    >
                        Delete Account
                    </button>
                </div>
            </div>

            {/* Delete Account Modal */}
            {showDeleteModal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modalContent}>
                        <h3 className={styles.modalTitle}>Confirm Account Deletion</h3>
                        <p className={styles.modalDescription}>
                            Please enter your password to confirm. This action is irreversible and will permanently delete all your projects and data.
                        </p>

                        <input
                            type="password"
                            className={styles.passwordInput}
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleDeleteAccount();
                            }}
                            autoFocus
                        />

                        {error && <div className={styles.errorMessage}>{error}</div>}

                        <div className={styles.modalActions}>
                            <button
                                className={styles.cancelBtn}
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setPassword('');
                                    setError('');
                                }}
                                disabled={isDeleting}
                            >
                                Cancel
                            </button>
                            <button
                                className={styles.confirmDeleteBtn}
                                onClick={handleDeleteAccount}
                                disabled={isDeleting || !password}
                            >
                                {isDeleting ? 'Deleting...' : 'Delete Forever'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SettingsPage;
