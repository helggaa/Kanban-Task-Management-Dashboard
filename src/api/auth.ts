import api from './axios';

export const login = (username: string, password: string) =>
  api.post('/auth/login', { username, password, expiresInMins: 30 });

export const getMe = () => api.get('/auth/me');

export const refreshAuth = (refreshToken: string) =>
  api.post('/auth/refresh', { refreshToken, expiresInMins: 30 });
