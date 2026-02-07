import React, { useState, useEffect } from 'react';
import styles from './SettingsPage.module.css';
import { FiMoon, FiSun, FiCloud, FiCheck } from 'react-icons/fi';
import { authService } from '../services/authService';
import PrivacyPolicyModal from '../components/PrivacyPolicyModal/PrivacyPolicyModal';

const SettingsPage = ({ theme, setTheme, showBorders, setShowBorders, onUserRefresh, onOpenAuth, currentUser, onOpenUpgrade }) => {
    const [showPlanModal, setShowPlanModal] = useState(false);
    const [showPrivacyModal, setShowPrivacyModal] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
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
            const response = await authService.fetchWithAuth(`${import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'}/api/auth/me`);
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

                <div className={styles.settingItem}>
                    <div className={styles.settingInfo}>
                        <span className={styles.settingName}>Component Borders</span>
                        <span className={styles.settingDescription}>
                            Enable borders for forms, cards, and inputs
                        </span>
                    </div>

                    <div className={styles.toggleContainer}>
                        <button
                            className={`${styles.themeBtn} ${showBorders ? styles.active : ''}`}
                            onClick={() => setShowBorders(true)}
                        >
                            Enable
                        </button>
                        <button
                            className={`${styles.themeBtn} ${!showBorders ? styles.active : ''}`}
                            onClick={() => setShowBorders(false)}
                        >
                            Disable
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

            <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Support</h2>
                <div className={styles.settingItem}>
                    <div className={styles.settingInfo}>
                        <span className={styles.settingName}>Contact Us</span>
                        <span className={styles.settingDescription}>
                            Need help? Get in touch with our team.
                        </span>
                    </div>
                    <a href="mailto:support@promptops.ai" className={styles.themeBtn} style={{ border: '1px solid var(--color-border)', textDecoration: 'none' }}>
                        Email Support
                    </a>
                </div>
            </div>

            <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Legal</h2>
                <div className={styles.settingItem}>
                    <div className={styles.settingInfo}>
                        <span className={styles.settingName}>Privacy Policy</span>
                        <span className={styles.settingDescription}>
                            Read our privacy policy and terms of service.
                        </span>
                    </div>
                    <button
                        className={styles.themeBtn}
                        style={{ border: '1px solid var(--color-border)' }}
                        onClick={() => setShowPrivacyModal(true)}
                    >
                        View Policy
                    </button>
                </div>
            </div>

            {/* FOOTER */}
            <div style={{
                textAlign: 'center',
                marginTop: '1.5rem',
                paddingBottom: '2rem',
                color: 'var(--color-text-muted)',
                fontSize: '0.85rem',
                fontWeight: 500,
                opacity: 0.7
            }}>
                Created By Ketan Joshi
            </div>

            {/* Plan Details Modal */}
            {
                showPlanModal && (
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
                )
            }

            {/* Privacy Policy Modal */}
            {
                showPrivacyModal && (
                    <div className={styles.modalOverlay} onClick={() => setShowPrivacyModal(false)}>
                        <div className={styles.modalContent} onClick={e => e.stopPropagation()} style={{ maxWidth: '700px', maxHeight: '80vh', overflowY: 'auto' }}>
                            <h3 className={styles.modalTitle} style={{ marginBottom: '1.5rem' }}>Privacy Policy</h3>

                            <div style={{ color: 'var(--color-text-secondary)', lineHeight: '1.6', fontSize: '0.95rem' }}>
                                <p><strong>Last updated: January 30, 2026</strong></p>

                                <p>This Privacy Policy explains how PromptOps (“we”, “our”, “us”) collects, uses, and protects your information when you use our application.</p>

                                <h4>1. Information We Collect</h4>
                                <p>We only collect information necessary to authenticate users using Google OAuth.</p>
                                <p>When you sign in with Google, we may receive:</p>
                                <ul>
                                    <li>Your name</li>
                                    <li>Your email address</li>
                                    <li>Your Google profile picture</li>
                                    <li>Your Google account ID</li>
                                </ul>
                                <p>We do not collect passwords.</p>

                                <h4>2. How We Use Your Information</h4>
                                <p>The information we collect is used only for:</p>
                                <ul>
                                    <li>Authenticating users</li>
                                    <li>Creating and managing user accounts</li>
                                    <li>Providing access to our application</li>
                                </ul>
                                <p>We do not use your data for advertising or marketing.</p>

                                <h4>3. Data Sharing</h4>
                                <p>We do not sell, trade, or rent your personal data.</p>
                                <p>Your information is not shared with third parties except where required to operate Google OAuth authentication or comply with legal obligations.</p>

                                <h4>4. Data Storage and Security</h4>
                                <p>We take reasonable measures to protect your information from unauthorized access, loss, misuse, or alteration.</p>
                                <p>Only necessary data is stored, and access is restricted.</p>

                                <h4>5. User Rights</h4>
                                <p>You have the right to request access to your data or request deletion of your account and associated data.</p>
                                <p>You can do this by contacting us at the email address below.</p>

                                <h4>6. Cookies</h4>
                                <p>We may use essential cookies required for authentication and session management. We do not use tracking or advertising cookies.</p>

                                <h4>7. Third-Party Services</h4>
                                <p>Our app uses Google OAuth for authentication. Google’s data handling is governed by their own privacy policies.</p>

                                <h4>8. Changes to This Policy</h4>
                                <p>We may update this Privacy Policy from time to time. Any changes will be posted on this page.</p>

                                <h4>9. Contact Us</h4>
                                <p>If you have any questions about this Privacy Policy, you can contact us at:</p>
                                <p>📧 <a href="mailto:ketanjoshi2003@gmail.com" style={{ color: 'var(--color-accent-primary)' }}>ketanjoshi2003@gmail.com</a></p>
                            </div>

                            <div className={styles.modalActions} style={{ marginTop: '2rem' }}>
                                <button
                                    className={styles.cancelBtn}
                                    onClick={() => setShowPrivacyModal(false)}
                                    style={{ width: '100%', textAlign: 'center' }}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }




        </div >
    );
};

export default SettingsPage;
