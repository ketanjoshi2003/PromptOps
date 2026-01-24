import { authService } from './authService';

const API_URL = 'http://127.0.0.1:8000/api/chat/sessions';

export const chatService = {
    async getSessions() {
        const response = await authService.fetchWithAuth(`${API_URL}`);
        if (!response.ok) throw new Error('Failed to fetch sessions');
        return await response.json();
    },

    async getSession(id) {
        const response = await authService.fetchWithAuth(`${API_URL}/${id}`);
        if (!response.ok) throw new Error('Failed to fetch session');
        return await response.json();
    },

    async createSession(title, messages) {
        const response = await authService.fetchWithAuth(`${API_URL}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, messages })
        });
        if (!response.ok) throw new Error('Failed to create session');
        return await response.json();
    },

    async updateSession(id, title, messages) {
        const payload = {};
        if (title) payload.title = title;
        if (messages) payload.messages = messages;

        const response = await authService.fetchWithAuth(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (!response.ok) throw new Error('Failed to update session');
        return await response.json();
    },

    async deleteSession(id) {
        const response = await authService.fetchWithAuth(`${API_URL}/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Failed to delete session');
        return await response.json();
    }
};
