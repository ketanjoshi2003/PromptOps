import React from 'react';
import styles from './PrivacyPolicyModal.module.css';

const PrivacyPolicyModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                <h3 className={styles.modalTitle}>Privacy Policy</h3>

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

                <div className={styles.modalActions}>
                    <button
                        className={styles.cancelBtn}
                        onClick={onClose}
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicyModal;
