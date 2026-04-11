import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/auth';
import { User, Lock, Mail, ArrowRight, BookOpen } from 'lucide-react';

const RegisterPage = ({ setIsAuthenticated }) => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await authService.register(username, email, password);
      // Automatically login after register
      await authService.login(email, password);
      if (setIsAuthenticated) setIsAuthenticated(true);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng ký thất bại. Email có thể đã tồn tại!');
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
            background: 'linear-gradient(135deg, #f4eee8, #ecddd0)',
            marginBottom: '1.25rem',
          }}>
            <BookOpen size={32} color="var(--ks-terracotta)" />
          </div>

          <h1 style={{
            fontFamily: 'Playfair Display',
            fontSize: '2rem',
            fontWeight: '700',
            color: 'var(--ks-terracotta)',
            marginBottom: '0.4rem',
          }}>
            Bắt Đầu Lưu Giữ
          </h1>
          <p style={{
            fontFamily: 'Montserrat',
            fontSize: '0.78rem',
            letterSpacing: '2px',
            textTransform: 'uppercase',
            color: 'var(--ks-text-muted)',
            opacity: 0.7,
          }}>
            Tạo trang nhật ký của riêng bạn
          </p>
        </div>

        {/* ERROR */}
        {error && (
          <div className="error-message" style={{ marginBottom: '1.5rem' }}>
            {error}
          </div>
        )}

        {/* FORM */}
        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

          {/* USERNAME */}
          <div style={{ position: 'relative' }}>
            <User
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
              id="register-username"
              type="text"
              placeholder="Tên của bạn"
              className="keepsake-auth-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoComplete="name"
            />
          </div>

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
              id="register-email"
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
              id="register-password"
              type="password"
              placeholder="Mật khẩu (tối thiểu 6 ký tự)"
              className="keepsake-auth-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
            />
          </div>

          {/* SUBMIT */}
          <button
            id="register-submit"
            type="submit"
            className="btn-terracotta"
            disabled={isLoading}
            style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}
          >
            {isLoading ? 'ĐANG TẠO TÀI KHOẢN...' : 'TẠO TÀI KHOẢN'}
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

        {/* LOGIN LINK */}
        <p style={{
          textAlign: 'center',
          fontSize: '0.88rem',
          color: 'var(--ks-text-muted)',
          fontFamily: 'Inter',
        }}>
          Đã có tài khoản?{' '}
          <Link
            to="/login"
            style={{
              color: 'var(--ks-terracotta)',
              fontWeight: '600',
              textDecoration: 'none',
            }}
          >
            Đăng nhập ngay
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
