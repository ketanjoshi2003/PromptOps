import React from 'react';
import styles from './PipedLoading.module.css';

const PipedLoading = ({ text = "Loading..." }) => {
    return (
        <div className={styles.loadingContainer}>
            <div className={styles.pipedLoadingContainer}>
                {[...Array(40)].map((_, i) => (
                    <div key={i} className={styles.loadingPipe} style={{ '--i': i }}></div>
                ))}
            </div>
            {text && <div className={styles.loadingText}>{text}</div>}
        </div>
    );
};

export default PipedLoading;
