import React, { useState, useEffect } from 'react';
import styles from './SettingsPage.module.css';
import { FiMoon, FiSun, FiCloud, FiCheck } from 'react-icons/fi';

const SettingsPage = ({ theme, setTheme, onUserRefresh, onOpenAuth, currentUser, onOpenUpgrade }) => {
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showPlanModal, setShowPlanModal] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [password, setPassword] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState('');
    const [userData, setUserData] = useState({ plan: 'free', credits: 5 });

    // Sync with global user state
    useEffect(() => {
        if (currentUser) {
            setIsLoggedIn(true);
            setUserData(currentUser);
        } else {
            // Fallback: check token if currentUser is null (maybe App hasn't fetched yet?)
            // But App fetches on mount. 
            // If currentUser is explicitly null, we might be logged out.
            // Let's rely on fetchUserData ONLY if currentUser is inactive/undefined initially 
            // or we want double check.
            // Actually, best to just rely on props if provided.
            const token = localStorage.getItem('token');
            if (token && !currentUser) {
                // Potential race condition or refresh gap, let's fetch
                fetchUserData();
            } else {
                setIsLoggedIn(false);
                setUserData({ plan: 'free', credits: 5 });
            }
        }
    }, [currentUser]);

    const fetchUserData = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            setIsLoggedIn(false);
            setUserData({ plan: 'free', credits: 5 });
            return;
        }
        // setIsLoggedIn(true); // Don't set true immediately, wait for success

        try {
            const response = await fetch('http://localhost:8000/api/auth/me', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setUserData(data);
                setIsLoggedIn(true);
            } else {
                setIsLoggedIn(false);
            }
        } catch (err) {
            console.error("Failed to fetch user data", err);
            setIsLoggedIn(false);
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
                            Generations Remaining: {userData.credits} / {limit}
                        </span>

                    </div>
                    {!isLoggedIn ? (
                        <button
                            className={styles.themeBtn}
                            style={{ border: '1px solid var(--color-border)' }}
                            onClick={() => {
                                if (onOpenAuth) onOpenAuth();
                            }}
                        >
                            Login to start premium plans
                        </button>
                    ) : (
                        <button
                            className={styles.themeBtn}
                            style={{ border: '1px solid var(--color-border)' }}
                            onClick={() => {
                                if (onOpenUpgrade) onOpenUpgrade();
                            }}
                        >
                            Upgrade Plan
                        </button>
                    )}
                </div>
            </div>

            <div className={`${styles.section} ${styles.dangerZone}`}>
                <h2 className={styles.sectionTitle} style={{ color: '#ff0000' }}>Danger Zone</h2>
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

            {/* Plan Details Modal */}
            {showPlanModal && (
                <div className={styles.modalOverlay} onClick={() => setShowPlanModal(false)}>
                    <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                        <h3 className={styles.modalTitle}>Plan Details: {userData.plan === 'dev' ? 'Dev (Pro)' : 'Free'}</h3>

                        <div className={styles.featureList}>
                            {userData.plan === 'dev' ? (
                                <>
                                    <div className={styles.featureItem}>
                                        <FiCheck className={styles.featureIcon} /> 50 Generations per cycle
                                    </div>
                                    <div className={styles.featureItem}>
                                        <FiCheck className={styles.featureIcon} /> Fast Generation Speed
                                    </div>
                                    <div className={styles.featureItem}>
                                        <FiCheck className={styles.featureIcon} /> Priority Support
                                    </div>
                                    <div className={styles.featureItem}>
                                        <FiCheck className={styles.featureIcon} /> Access to Advanced Models
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className={styles.featureItem}>
                                        <FiCheck className={styles.featureIcon} /> 5 Generations per cycle
                                    </div>
                                    <div className={styles.featureItem}>
                                        <FiCheck className={styles.featureIcon} /> Standard Generation Speed
                                    </div>
                                    <div className={styles.featureItem}>
                                        <FiCheck className={styles.featureIcon} /> Basic Support
                                    </div>
                                </>
                            )}
                        </div>

                        <div className={styles.modalActions}>
                            <button
                                className={styles.cancelBtn}
                                onClick={() => setShowPlanModal(false)}
                                style={{ width: '100%', textAlign: 'center' }}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

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
