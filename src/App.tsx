import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { App as AntdApp, ConfigProvider } from 'antd';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';

// ponytail: Static dark-neutral theme token ceiling; upgrade to ThemeContext for user-toggled dark mode.
const antdTheme = {
  token: {
    colorPrimary: '#1a1a1a',
    colorBgBase: '#ffffff',
    colorTextBase: '#1a1a1a',
    borderRadius: 7,
    fontFamily: "'Inter', -apple-system, sans-serif",
    fontSize: 16,
    colorBorder: '#e4e4e4',
    colorBorderSecondary: '#f0f0ef',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
  },
};

const App: React.FC = () => (
  <ConfigProvider theme={antdTheme}>
    <AntdApp>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </AntdApp>
  </ConfigProvider>
);

export default App;
