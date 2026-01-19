const API_URL = 'http://localhost:8000/api/chain';

export const chainService = {
    async executeChain(chainData) {
        const token = localStorage.getItem('token');
        const headers = {
            'Content-Type': 'application/json',
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        try {
            const response = await fetch(`${API_URL}/execute`, {
                method: 'POST',
                headers: headers,
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
    }
};
