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
    <div className="bg-keepsake-sunlight" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="auth-keepsake-card">
        <div style={{ marginBottom: '2.5rem' }}>
          <Book size={60} color="#8D5555" />
          <h2 style={{ fontFamily: 'Playfair Display', fontSize: '2.5rem', marginTop: '1rem', color: '#8D5555' }}>
            Welcome Back
          </h2>
          <p style={{ opacity: 0.5, letterSpacing: '1px', textTransform: 'uppercase', fontSize: '0.8rem' }}>
            To your personal archive
          </p>
        </div>

        {error && <div style={{ color: '#e53e3e', marginBottom: '1rem' }}>{error}</div>}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ position: 'relative' }}>
            <Mail size={18} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', opacity: 0.3 }} />
            <input
              type="email"
              placeholder="Email address"
              className="keepsake-auth-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ width: '100%', padding: '1.2rem 1.2rem 1.2rem 3rem', borderRadius: '12px', border: '1px solid rgba(141, 85, 85, 0.1)', background: 'white', outline: 'none' }}
            />
          </div>

          <div style={{ position: 'relative' }}>
            <Lock size={18} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', opacity: 0.3 }} />
            <input
              type="password"
              placeholder="Password"
              className="keepsake-auth-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ width: '100%', padding: '1.2rem 1.2rem 1.2rem 3rem', borderRadius: '12px', border: '1px solid rgba(141, 85, 85, 0.1)', background: 'white', outline: 'none' }}
            />
          </div>

          <button type="submit" className="btn-terracotta" disabled={isLoading} style={{ width: '100%', justifyContent: 'center', marginTop: '1rem' }}>
            {isLoading ? 'SIGNING IN...' : 'SIGN IN'} <ArrowRight size={18} />
          </button>
        </form>

        <p style={{ marginTop: '2.5rem', fontSize: '0.9rem', color: '#666' }}>
          Don't have an archive?{' '}
          <Link to="/register" style={{ color: '#8D5555', fontWeight: '600', textDecoration: 'none' }}>
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
