import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/auth';
import { User, Lock, Mail, ArrowRight, Book } from 'lucide-react';

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
      setIsAuthenticated(true);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng ký thất bại. Email có thể đã tồn tại!');
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
            Start Your Archive
          </h2>
          <p style={{ opacity: 0.5, letterSpacing: '1px', textTransform: 'uppercase', fontSize: '0.8rem' }}>
            Join The Keepsake today
          </p>
        </div>

        {error && <div style={{ color: '#e53e3e', marginBottom: '1rem' }}>{error}</div>}

        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ position: 'relative' }}>
            <User size={18} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', opacity: 0.3 }} />
            <input
              type="text"
              placeholder="Your name"
              className="keepsake-auth-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              style={{ width: '100%', padding: '1.2rem 1.2rem 1.2rem 3rem', borderRadius: '12px', border: '1px solid rgba(141, 85, 85, 0.1)', background: 'white', outline: 'none' }}
            />
          </div>

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
            {isLoading ? 'CREATING...' : 'CREATE ACCOUNT'} <ArrowRight size={18} />
          </button>
        </form>

        <p style={{ marginTop: '2.5rem', fontSize: '0.9rem', color: '#666' }}>
          Already have an archive?{' '}
          <Link to="/login" style={{ color: '#8D5555', fontWeight: '600', textDecoration: 'none' }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
