import React from 'react';

const PrivacyPolicyPage = () => {
    return (
        <div className="privacy-page-wrapper">
            <style>{`
                body {
                    margin: 0;
                }
                .privacy-page-wrapper {
                    min-height: 100vh;
                    padding: 2rem;
                    background-color: #ffffff;
                    color: #1a1a1a;
                    font-family: system-ui, -apple-system, sans-serif;
                    line-height: 1.6;
                }
                .privacy-page-wrapper h1, 
                .privacy-page-wrapper h2 {
                    color: #000000;
                }
                .privacy-page-wrapper a {
                    color: #2563eb;
                }
                
                @media (prefers-color-scheme: dark) {
                    .privacy-page-wrapper {
                        background-color: #111111;
                        color: #e5e5e5;
                    }
                    .privacy-page-wrapper h1, 
                    .privacy-page-wrapper h2 {
                        color: #ffffff;
                    }
                    .privacy-page-wrapper a {
                        color: #60a5fa;
                    }
                }
            `}</style>

            <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                <h1 style={{ marginBottom: '2rem' }}>Privacy Policy</h1>

                <p><strong>Last updated: January 30, 2026</strong></p>

                <p>This Privacy Policy explains how PromptOps (“we”, “our”, “us”) collects, uses, and protects your information when you use our application.</p>

                <h2 style={{ marginTop: '2rem' }}>1. Information We Collect</h2>
                <p>We only collect information necessary to authenticate users using Google OAuth.</p>
                <p>When you sign in with Google, we may receive:</p>
                <ul style={{ marginBottom: '1rem' }}>
                    <li>Your name</li>
                    <li>Your email address</li>
                    <li>Your Google profile picture</li>
                    <li>Your Google account ID</li>
                </ul>
                <p>We do not collect passwords.</p>

                <h2 style={{ marginTop: '2rem' }}>2. How We Use Your Information</h2>
                <p>The information we collect is used only for:</p>
                <ul>
                    <li>Authenticating users</li>
                    <li>Creating and managing user accounts</li>
                    <li>Providing access to our application</li>
                </ul>
                <p>We do not use your data for advertising or marketing.</p>

                <h2 style={{ marginTop: '2rem' }}>3. Data Sharing</h2>
                <p>We do not sell, trade, or rent your personal data.</p>
                <p>Your information is not shared with third parties except where required to operate Google OAuth authentication or comply with legal obligations.</p>

                <h2 style={{ marginTop: '2rem' }}>4. Data Storage and Security</h2>
                <p>We take reasonable measures to protect your information from unauthorized access, loss, misuse, or alteration.</p>
                <p>Only necessary data is stored, and access is restricted.</p>

                <h2 style={{ marginTop: '2rem' }}>5. User Rights</h2>
                <p>You have the right to request access to your data or request deletion of your account and associated data.</p>
                <p>You can do this by contacting us at the email address below.</p>

                <h2 style={{ marginTop: '2rem' }}>6. Cookies</h2>
                <p>We may use essential cookies required for authentication and session management. We do not use tracking or advertising cookies.</p>

                <h2 style={{ marginTop: '2rem' }}>7. Third-Party Services</h2>
                <p>Our app uses Google OAuth for authentication. Google’s data handling is governed by their own privacy policies.</p>

                <h2 style={{ marginTop: '2rem' }}>8. Changes to This Policy</h2>
                <p>We may update this Privacy Policy from time to time. Any changes will be posted on this page.</p>

                <h2 style={{ marginTop: '2rem' }}>9. Contact Us</h2>
                <p>If you have any questions about this Privacy Policy, you can contact us at:</p>
                <p>📧 <a href="mailto:ketanjoshi2003@gmail.com">ketanjoshi2003@gmail.com</a></p>
            </div>
        </div>
    );
};

export default PrivacyPolicyPage;
