import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/auth';
import { Book, Lock, Mail, ArrowRight } from 'lucide-react';

const LoginPage = ({ setIsAuthenticated }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await authService.login(email, password);
      setIsAuthenticated(true);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi đăng nhập. Vui lòng kiểm tra lại!');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-keepsake-sunlight">
      <div className="auth-keepsake-card animate-slide-up">

        {/* HEADER */}
        <div style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '72px',
            height: '72px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #e8f4f4, #d4e8e8)',
            marginBottom: '1.25rem',
          }}>
            <Book size={32} color="var(--ks-teal)" />
          </div>

          <h1 style={{
            fontFamily: 'Playfair Display',
            fontSize: '2rem',
            fontWeight: '700',
            color: 'var(--ks-terracotta)',
            marginBottom: '0.4rem',
          }}>
            Welcome Back
          </h1>
          <p style={{
            fontFamily: 'Montserrat',
            fontSize: '0.78rem',
            letterSpacing: '2px',
            textTransform: 'uppercase',
            color: 'var(--ks-text-muted)',
            opacity: 0.7,
          }}>
            Mở lại trang nhật ký của bạn
          </p>
        </div>

        {/* ERROR */}
        {error && (
          <div className="error-message" style={{ marginBottom: '1.5rem' }}>
            {error}
          </div>
        )}

        {/* FORM */}
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* EMAIL */}
          <div style={{ position: 'relative' }}>
            <Mail
              size={16}
              style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--ks-text-muted)',
                opacity: 0.5,
                pointerEvents: 'none',
              }}
            />
            <input
              id="login-email"
              type="email"
              placeholder="Địa chỉ email"
              className="keepsake-auth-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>

          {/* PASSWORD */}
          <div style={{ position: 'relative' }}>
            <Lock
              size={16}
              style={{
                position: 'absolute',
                left: '14px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--ks-text-muted)',
                opacity: 0.5,
                pointerEvents: 'none',
              }}
            />
            <input
              id="login-password"
              type="password"
              placeholder="Mật khẩu"
              className="keepsake-auth-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          {/* SUBMIT */}
          <button
            id="login-submit"
            type="submit"
            className="btn-terracotta"
            disabled={isLoading}
            style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}
          >
            {isLoading ? 'ĐANG ĐĂNG NHẬP...' : 'ĐĂNG NHẬP'}
            {!isLoading && <ArrowRight size={16} />}
          </button>
        </form>

        {/* DIVIDER */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          margin: '2rem 0 1.5rem',
        }}>
          <div style={{ flex: 1, height: '1px', background: '#e8e2d4' }} />
          <span style={{ fontSize: '0.75rem', color: '#bbb', fontFamily: 'Montserrat' }}>hoặc</span>
          <div style={{ flex: 1, height: '1px', background: '#e8e2d4' }} />
        </div>

        {/* REGISTER LINK */}
        <p style={{
          textAlign: 'center',
          fontSize: '0.88rem',
          color: 'var(--ks-text-muted)',
          fontFamily: 'Inter',
        }}>
          Chưa có tài khoản?{' '}
          <Link
            to="/register"
            style={{
              color: 'var(--ks-terracotta)',
              fontWeight: '600',
              textDecoration: 'none',
              borderBottom: '1px solid transparent',
              transition: 'border-color 0.2s',
            }}
          >
            Tạo tài khoản mới
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
