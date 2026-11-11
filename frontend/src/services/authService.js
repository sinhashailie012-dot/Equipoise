import apiClient, { USE_MOCK } from './api';

const DEMO_USER = {
  id: 'emma-chen',
  name: 'Emma Chen',
  email: 'emma.chen@forma.studio',
  role: 'MANAGER',
  title: 'Design manager',
  initials: 'EC',
  workspace: 'Forma Studio',
  department: 'People Operations / Design Team',
};

export const authService = {
  async login(email, password) {
    if (!USE_MOCK) {
      const response = await apiClient.post('/auth/login', { email, password });
      const { token, refreshToken, user } = response.data;
      localStorage.setItem('equipoise_token', token);
      localStorage.setItem('equipoise_refresh_token', refreshToken);
      localStorage.setItem('equipoise_user', JSON.stringify(user));
      return { token, refreshToken, user };
    }

    // Simulate async network delay
    await new Promise((resolve) => setTimeout(resolve, 350));

    // Basic validation
    if (!email || !password) {
      throw new Error('Please enter both email and password.');
    }

    const normalizedEmail = email.trim().toLowerCase();
    const isValidDemo =
      (normalizedEmail === 'manager@equipoise.com' && password === 'Password@123') ||
      (normalizedEmail === 'emma.chen@forma.studio') ||
      (normalizedEmail.includes('@') && password.length >= 6);

    if (!isValidDemo) {
      throw new Error('Invalid email or password. Please use manager@equipoise.com / Password@123');
    }

    const user = {
      ...DEMO_USER,
      email: normalizedEmail,
    };
    const token = 'mock_jwt_token_' + Date.now();

    localStorage.setItem('equipoise_token', token);
    localStorage.removeItem('equipoise_refresh_token');
    localStorage.setItem('equipoise_user', JSON.stringify(user));

    return { token, user };
  },

  async logout() {
    if (!USE_MOCK) {
      try {
        await apiClient.post('/auth/logout');
      } catch (e) {
        // Ignore logout errors
      }
    }
    localStorage.removeItem('equipoise_token');
    localStorage.removeItem('equipoise_refresh_token');
    localStorage.removeItem('equipoise_user');
    return Promise.resolve();
  },

  async getCurrentUser() {
    const token = localStorage.getItem('equipoise_token');
    if (!token) return null;
    if (!USE_MOCK) {
      const response = await apiClient.get('/auth/me');
      localStorage.setItem('equipoise_user', JSON.stringify(response.data));
      return response.data;
    }
    const cached = localStorage.getItem('equipoise_user');
    if (cached) {
      try {
        return Promise.resolve(JSON.parse(cached));
      } catch (e) {
        // ignore parse error
      }
    }
    return DEMO_USER;
  },

  isAuthenticated() {
    return !!localStorage.getItem('equipoise_token');
  },
};

export default authService;
