import axios from 'axios';

const api = axios.create({
  baseURL: 'https://dummyjson.com',
  headers: { 'Content-Type': 'application/json' },
});

// Inject token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 → try refresh token, else logout
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) throw new Error('No refresh token');
        const { data } = await axios.post('https://dummyjson.com/auth/refresh', {
          refreshToken,
          expiresInMins: 30,
        });
        localStorage.setItem('token', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(original);
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(err);
      }
    }
    if (err.response?.status === 403) {
      return Promise.reject(new Error('Access denied (403): You do not have permission to perform this action.'));
    }
    if (err.response?.status >= 500) {
      return Promise.reject(new Error('Server error (500): Please try again later.'));
    }
    return Promise.reject(err);
  }
);

export default api;
