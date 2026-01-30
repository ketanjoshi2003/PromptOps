const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/auth`;

export const authService = {
    // Helper to format validation errors
    formatError(detail) {
        if (typeof detail === 'string') return detail;
        if (Array.isArray(detail)) {
            // Pydantic error list: return the first message or a joined list
            return detail.map(err => err.msg).join(', ');
        }
        if (typeof detail === 'object') {
            return JSON.stringify(detail);
        }
        return 'An unknown error occurred';
    },

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
                throw new Error(this.formatError(error.detail) || 'Registration failed');
            }

            return await response.json();
        } catch (error) {
            console.error('Registration Error:', error);
            throw error;
        }
    },

    async verifyOTP(email, otp) {
        try {
            const response = await fetch(`${API_URL}/verify-otp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, otp }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(this.formatError(error.detail) || 'OTP Verification failed');
            }

            const data = await response.json();
            if (data.access_token) {
                localStorage.setItem('token', data.access_token);
                localStorage.setItem('userEmail', email);
            }
            if (data.refresh_token) {
                localStorage.setItem('refreshToken', data.refresh_token);
            }
            return data;
        } catch (error) {
            console.error('OTP Verification Error:', error);
            throw error;
        }
    },

    async googleLogin(credential) {
        try {
            const response = await fetch(`${API_URL}/google`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ credential }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(this.formatError(error.detail) || 'Google Login failed');
            }

            const data = await response.json();
            if (data.access_token) {
                const decoded = this.parseJwt(data.access_token);
                localStorage.setItem('token', data.access_token);
                if (decoded && decoded.sub) {
                    localStorage.setItem('userEmail', decoded.sub);
                }
            }
            if (data.refresh_token) {
                localStorage.setItem('refreshToken', data.refresh_token);
            }
            return data;
        } catch (error) {
            console.error('Google Login Error:', error);
            throw error;
        }
    },

    parseJwt(token) {
        try {
            return JSON.parse(atob(token.split('.')[1]));
        } catch (e) {
            return null;
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
                throw new Error(this.formatError(error.detail) || 'Login failed');
            }

            const data = await response.json();
            if (data.access_token) {
                localStorage.setItem('token', data.access_token);
                // Also store user email for display
                localStorage.setItem('userEmail', credentials.email);
            }
            if (data.refresh_token) {
                localStorage.setItem('refreshToken', data.refresh_token);
            }

            return data;
        } catch (error) {
            console.error('Login Error:', error);
            throw error;
        }
    },

    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userEmail');
        window.location.href = '/'; // Force redirect
    },

    async refreshToken() {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) throw new Error('No refresh token available');

        try {
            const response = await fetch(`${API_URL}/refresh`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ refresh_token: refreshToken }),
            });

            if (!response.ok) {
                this.logout();
                throw new Error('Failed to refresh token');
            }

            const data = await response.json();
            if (data.access_token) {
                localStorage.setItem('token', data.access_token);
            }
            if (data.refresh_token) {
                localStorage.setItem('refreshToken', data.refresh_token);
            }
            return data;
        } catch (error) {
            console.error('Refresh Token Error:', error);
            this.logout();
            throw error;
        }
    },

    async fetchWithAuth(url, options = {}) {
        let token = localStorage.getItem('token');
        if (!token) throw new Error('No token found');

        const headers = {
            ...options.headers,
            'Authorization': `Bearer ${token}`
        };

        let response = await fetch(url, { ...options, headers });

        if (response.status === 401) {
            try {
                const data = await this.refreshToken();
                // Retry with new token
                const newHeaders = {
                    ...options.headers,
                    'Authorization': `Bearer ${data.access_token}`
                };
                response = await fetch(url, { ...options, headers: newHeaders });
            } catch (error) {
                throw new Error('Session expired. Please login again.');
            }
        }

        return response;
    },

    async getProfile() {
        // Use the new fetchWithAuth for automatic refreshing
        const response = await this.fetchWithAuth(`${API_URL}/me`);

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
