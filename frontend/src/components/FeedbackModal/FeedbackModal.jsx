import React, { useState } from 'react';
import styles from './FeedbackModal.module.css';
import { FiX } from 'react-icons/fi';

const FeedbackModal = ({ isOpen, onClose, onSubmit }) => {
    const [message, setMessage] = useState('');
    const [rating, setRating] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!message.trim()) return;

        setIsSubmitting(true);
        try {
            await onSubmit({ message, rating });
            setMessage('');
            setRating(null);
            onClose();
        } catch (error) {
            console.error("Failed to submit feedback", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={e => e.stopPropagation()}>
                <div className={styles.header}>
                    <h2 className={styles.title}>Send Feedback</h2>
                    <button className={styles.closeBtn} onClick={onClose}>
                        <FiX />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className={styles.formGroup}>
                        <label className={styles.label}>How was your experience?</label>
                        <div className={styles.ratingContainer}>
                            {[1, 2, 3, 4, 5].map((num) => (
                                <button
                                    key={num}
                                    type="button"
                                    className={`${styles.ratingBtn} ${rating === num ? styles.selected : ''}`}
                                    onClick={() => setRating(num)}
                                >
                                    {num}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className={styles.formGroup}>
                        <label className={styles.label}>Message</label>
                        <textarea
                            className={styles.textarea}
                            placeholder="Tell us what you like or what could be better..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className={styles.submitBtn}
                        disabled={isSubmitting || !message.trim()}
                    >
                        {isSubmitting ? 'Sending...' : 'Send Feedback'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default FeedbackModal;
