const API_URL = 'http://localhost:8000/api/auth';

export const authService = {
    async register(userData) {
        try {
            const response = await fetch(`${API_URL}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || 'Registration failed');
            }

            return await response.json();
        } catch (error) {
            console.error('Registration Error:', error);
            throw error;
        }
    },

    async login(credentials) {
        try {
            const response = await fetch(`${API_URL}/token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(credentials),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || 'Login failed');
            }

            const data = await response.json();
            if (data.access_token) {
                localStorage.setItem('token', data.access_token);
                // Also store user email for display
                localStorage.setItem('userEmail', credentials.email);
            }

            return data;
        } catch (error) {
            console.error('Login Error:', error);
            throw error;
        }
    },

    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('userEmail');
    },

    async getProfile() {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No token found');

        const response = await fetch(`${API_URL}/me`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch profile');
        }

        return await response.json();
    },

    getCurrentUser() {
        // In a real app, you might decode the token here
        const token = localStorage.getItem('token');
        const email = localStorage.getItem('userEmail');

        if (token && email) {
            return { email };
        }
        return null;
    }
};
