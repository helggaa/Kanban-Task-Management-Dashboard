import React, { useState } from 'react';
import { Form, Input, Button, Alert } from 'antd';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';

const LoginPage: React.FC = () => {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  // ponytail: Local state error ceiling; upgrade to shared notification provider if multi-step auth added.
  const onFinish = async (values: { username: string; password: string }) => {
    setError(null);
    try {
      await login(values.username, values.password);
      navigate('/');
    } catch (err: unknown) {
      const isNetwork = (err as { code?: string })?.code === 'ERR_NETWORK';
      setError(
        isNetwork
          ? 'Network error: Unable to reach the server. Please check your internet connection and try again.'
          : 'Invalid credentials. Please verify your username and password.'
      );
    }
  };

  return (
    <div className="login-split">
      {/* Left — form */}
      <div className="login-left">
        <div className="login-form-wrap">
          <div className="login-logo">
            <div className="login-logo-mark">K</div>
            <span className="login-logo-name">KanbanFlow</span>
          </div>

          <h1 className="login-heading">Welcome back</h1>
          <p className="login-sub">Sign in to your workspace</p>

          {error && (
            <Alert
              message="Authentication Error"
              description={error}
              type="error"
              showIcon
              closable
              onClose={() => setError(null)}
              style={{ marginBottom: 20, borderRadius: 8 }}
            />
          )}

          <Form layout="vertical" onFinish={onFinish} disabled={loading}>
            <Form.Item
              name="username"
              label="Username"
              rules={[{ required: true, whitespace: true, message: 'Please enter your username' }]}
            >
              <Input placeholder="emilys" autoComplete="username" />
            </Form.Item>
            <Form.Item
              name="password"
              label="Password"
              rules={[{ required: true, message: 'Please enter your password' }]}
            >
              <Input.Password placeholder="••••••••" autoComplete="current-password" />
            </Form.Item>
            <Form.Item style={{ marginBottom: 0 }}>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                className="login-submit-btn"
              >
                Continue
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>

      {/* Right — decorative */}
      <div className="login-right">
        <div className="login-right-pattern" />
        <div className="login-right-content">
          <div className="login-right-icon">📋</div>
          <div className="login-right-title">Organize your work</div>
          <div className="login-right-desc">
            A focused kanban board for teams that want clarity, not complexity.
          </div>
          <div className="login-features">
            <div className="login-feature"><span className="login-feature-dot" />Drag &amp; drop task management</div>
            <div className="login-feature"><span className="login-feature-dot" />Priority and status tracking</div>
            <div className="login-feature"><span className="login-feature-dot" />Search and filter across all tasks</div>
            <div className="login-feature"><span className="login-feature-dot" />Works offline with local storage</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
