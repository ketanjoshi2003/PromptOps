const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const healthService = {
    async wakeUp() {
        try {
            // Simple GET request to root to wake up the backend
            // Using fetch directly to avoid auth headers or other interceptors logic
            // that might complicate this simple "ping"
            await fetch(`${API_URL}/`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });
            console.log('Backend wake-up signal sent');
        } catch (error) {
            // Silently fail - if backend is down, main app logic will handle errors
            // We just want to trigger a cold start if possible
            console.warn('Backend wake-up signal failed:', error);
        }
    }
};
