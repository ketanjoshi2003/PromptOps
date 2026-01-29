const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/feedback`;
import { authService } from './authService';

export const feedbackService = {
    async sendFeedback(data) {
        try {
            const response = await authService.fetchWithAuth(`${API_URL}/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || 'Failed to send feedback');
            }

            return await response.json();
        } catch (error) {
            console.error('Feedback Error:', error);
            throw error;
        }
    }
};
