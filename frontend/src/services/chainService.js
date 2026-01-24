import { authService } from './authService';

const API_URL = 'http://127.0.0.1:8000/api/chain';

export const chainService = {
    async executeChain(chainData) {
        try {
            const response = await authService.fetchWithAuth(`${API_URL}/execute`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(chainData), // chainData now includes mode
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || 'Chain execution failed');
            }

            return await response.json();
        } catch (error) {
            console.error('Chain Execution Error:', error);
            throw error;
        }
    },

    async getChains() {
        const response = await authService.fetchWithAuth(`${API_URL}/`);
        if (!response.ok) throw new Error('Failed to fetch chains');
        return await response.json();
    },

    async getChain(id) {
        const response = await authService.fetchWithAuth(`${API_URL}/${id}`);
        if (!response.ok) throw new Error('Failed to fetch chain');
        return await response.json();
    },

    async createChain(chainData) {
        const response = await authService.fetchWithAuth(`${API_URL}/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(chainData)
        });
        if (!response.ok) throw new Error('Failed to create chain');
        return await response.json();
    },

    async updateChain(id, chainData) {
        const response = await authService.fetchWithAuth(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(chainData)
        });
        if (!response.ok) throw new Error('Failed to update chain');
        return await response.json();
    },

    async deleteChain(id) {
        const response = await authService.fetchWithAuth(`${API_URL}/${id}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error('Failed to delete chain');
        return await response.json();
    }
};
