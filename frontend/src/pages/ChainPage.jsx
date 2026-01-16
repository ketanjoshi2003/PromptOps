import React from 'react';
import styles from './Dashboard/Dashboard.module.css'; // Reusing Dashboard styles for consistency

const ChainPage = () => {
    return (
        <div className={styles.dashboardContainer} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <div style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>
                <h1 style={{ color: 'var(--color-text-primary)' }}>Prompt Chain</h1>
                <p>Chain multiple prompts together for complex workflows. (Coming Soon)</p>
            </div>
        </div>
    );
};

export default ChainPage;
