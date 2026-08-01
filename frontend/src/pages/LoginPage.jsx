import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="container" style={{ maxWidth: 460 }}>
        <div className="card animate-scaleIn">
          <div className="text-center" style={{ marginBottom: 'var(--space-xl)' }}>
            <h1 style={{ fontSize: '2rem', marginBottom: 'var(--space-sm)' }}>Welcome Back</h1>
            <p className="text-muted">Sign in to your LuminaStore account</p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} className="text-muted" style={{ position: 'absolute', left: 14, top: 12 }} />
                <input
                  type="email"
                  className="form-input"
                  style={{ paddingLeft: 42 }}
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} className="text-muted" style={{ position: 'absolute', left: 14, top: 12 }} />
                <input
                  type="password"
                  className="form-input"
                  style={{ paddingLeft: 42 }}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading} id="login-submit-btn">
              {loading ? <><span className="spinner" /> Signing In...</> : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-muted" style={{ marginTop: 'var(--space-xl)', fontSize: '0.9rem' }}>
            Don't have an account? <Link to="/register" className="text-primary font-semibold">Sign Up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
