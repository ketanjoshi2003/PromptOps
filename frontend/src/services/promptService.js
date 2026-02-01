import { authService } from './authService';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const promptService = {
    generatePrompt: async (data) => {
        return authService.fetchWithAuth(`${API_URL}/api/prompt/generate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
    },
};
