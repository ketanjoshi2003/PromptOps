import React, { useState } from 'react';
import styles from './UpgradeModal.module.css';
import { FiCheck } from 'react-icons/fi';
import { authService } from '../../services/authService';

const UpgradeModal = ({ isOpen, onClose, currentUser, onUpgradeSuccess }) => {
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleUpgrade = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await authService.fetchWithAuth(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/auth/upgrade`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const updatedUser = await response.json();
                if (onUpgradeSuccess) onUpgradeSuccess(updatedUser);
                alert("Successfully upgraded to Dev plan!");
                onClose();
            } else {
                alert("Upgrade failed. Please try again.");
            }
        } catch (err) {
            console.error("Upgrade failed", err);
            alert("Upgrade failed. Please check your connection.");
        } finally {
            setLoading(false);
        }
    };

    const currentPlan = currentUser?.plan || 'free';

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                <h3 className={styles.modalTitle}>Choose Your Plan</h3>

                <div className={styles.planGrid}>
                    {/* Free Plan */}
                    <div className={`${styles.planCard} ${styles.planFree}`}>
                        <div className={styles.planHeader}>
                            <h4 className={styles.planTitle}>Free</h4>
                            <div className={styles.planPrice}>$0<span>/mo</span></div>
                        </div>
                        <div className={styles.planFeatures}>
                            <div className={styles.featureItem}><FiCheck className={styles.featureIcon} /> 5 Gens/cycle</div>
                            <div className={styles.featureItem}><FiCheck className={styles.featureIcon} /> Standard Speed</div>
                            <div className={styles.featureItem}><FiCheck className={styles.featureIcon} /> Basic Support</div>
                        </div>
                        <button className={styles.planBtn} disabled>Current Plan</button>
                    </div>

                    {/* Dev Plan */}
                    <div className={`${styles.planCard} ${styles.planDev} ${currentPlan === 'dev' ? styles.currentPlan : ''}`}>
                        <div className={styles.planHeader}>
                            <h4 className={styles.planTitle}>Dev (Pro)</h4>
                            <div className={styles.planPrice}>$10<span>/mo</span></div>
                        </div>
                        <div className={styles.planFeatures}>
                            <div className={styles.featureItem}><FiCheck className={styles.featureIcon} /> 50 Gens/cycle</div>
                            <div className={styles.featureItem}><FiCheck className={styles.featureIcon} /> Fast Speed</div>
                            <div className={styles.featureItem}><FiCheck className={styles.featureIcon} /> Priority Support</div>
                            <div className={styles.featureItem}><FiCheck className={styles.featureIcon} /> Advanced Models</div>
                        </div>
                        {currentPlan === 'dev' ? (
                            <button className={styles.planBtn} disabled>Current Plan</button>
                        ) : (
                            <button
                                className={styles.planBtn}
                                onClick={handleUpgrade}
                                disabled={loading}
                            >
                                {loading ? 'Upgrading...' : 'Upgrade'}
                            </button>
                        )}
                    </div>

                    {/* Team Plan */}
                    <div className={`${styles.planCard} ${styles.planTeam}`}>
                        <div className={styles.planHeader}>
                            <h4 className={styles.planTitle}>Team</h4>
                            <div className={styles.planPrice}>$50<span>/mo</span></div>
                        </div>
                        <div className={styles.planFeatures}>
                            <div className={styles.featureItem}><FiCheck className={styles.featureIcon} /> Unlimited Gens</div>
                            <div className={styles.featureItem}><FiCheck className={styles.featureIcon} /> Ultra Speed</div>
                            <div className={styles.featureItem}><FiCheck className={styles.featureIcon} /> 24/7 Support</div>
                            <div className={styles.featureItem}><FiCheck className={styles.featureIcon} /> SSO Integration</div>
                        </div>
                        <button
                            className={styles.planBtn}
                            onClick={() => alert("Team plan coming soon!")}
                        >
                            Contact Sales
                        </button>
                    </div>
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

export default UpgradeModal;
