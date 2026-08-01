import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(name, email, password);
      toast.success('Account created successfully!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="container" style={{ maxWidth: 460 }}>
        <div className="card animate-scaleIn">
          <div className="text-center" style={{ marginBottom: 'var(--space-xl)' }}>
            <h1 style={{ fontSize: '2rem', marginBottom: 'var(--space-sm)' }}>Create Account</h1>
            <p className="text-muted">Join LuminaStore today</p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div style={{ position: 'relative' }}>
                <User size={18} className="text-muted" style={{ position: 'absolute', left: 14, top: 12 }} />
                <input
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: 42 }}
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>

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
                  minLength={6}
                />
              </div>
              <p className="text-muted" style={{ fontSize: '0.75rem', marginTop: 4 }}>Must be at least 6 characters</p>
            </div>

            <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading} id="register-submit-btn">
              {loading ? <><span className="spinner" /> Creating Account...</> : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-muted" style={{ marginTop: 'var(--space-xl)', fontSize: '0.9rem' }}>
            Already have an account? <Link to="/login" className="text-primary font-semibold">Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
