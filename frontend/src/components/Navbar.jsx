import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, LogOut, Package, LayoutDashboard, Menu, X, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

const [cartOpen, setCartOpen] = [null, null]; // placeholder managed in CartContext

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully');
    navigate('/');
    setUserMenuOpen(false);
  };

  const openCart = () => {
    window.dispatchEvent(new CustomEvent('open-cart'));
  };

  return (
    <nav
      className={`navbar ${scrolled ? 'glass' : ''}`}
      style={{ borderBottom: scrolled ? '1px solid var(--border)' : 'none' }}
    >
      <div className="container navbar-inner">
        {/* Logo */}
        <Link to="/" className="nav-logo" id="nav-logo">
          <div style={{
            width: 32, height: 32,
            background: 'linear-gradient(135deg, var(--primary), var(--accent))',
            borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Zap size={18} color="#fff" strokeWidth={2.5} />
          </div>
          <span className="gradient-text">LuminaStore</span>
        </Link>

        {/* Desktop Nav */}
        <ul className="nav-links">
          <li><NavLink to="/" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`} end>Home</NavLink></li>
          <li><NavLink to="/products" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>Shop</NavLink></li>
          {isAuthenticated && (
            <li><NavLink to="/orders" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>Orders</NavLink></li>
          )}
          {user?.role === 'admin' && (
            <li><NavLink to="/admin" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>Admin</NavLink></li>
          )}
        </ul>

        {/* Actions */}
        <div className="nav-actions">
          {/* Cart */}
          <button id="open-cart-btn" className="cart-btn" onClick={openCart} aria-label="Open cart">
            <ShoppingCart size={20} />
            {totalItems > 0 && (
              <span className="cart-badge animate-scaleIn">{totalItems > 99 ? '99+' : totalItems}</span>
            )}
          </button>

          {/* Auth */}
          {isAuthenticated ? (
            <div style={{ position: 'relative' }}>
              <button
                id="user-menu-btn"
                className="btn btn-ghost btn-sm"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                style={{ gap: 6 }}
              >
                <div style={{
                  width: 26, height: 26,
                  background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
                  borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.75rem', fontWeight: 700, color: '#fff'
                }}>
                  {user?.name?.[0]?.toUpperCase() || 'U'}
                </div>
                <span style={{ maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user?.name?.split(' ')[0]}
                </span>
              </button>

              {userMenuOpen && (
                <>
                  <div
                    style={{ position: 'fixed', inset: 0, zIndex: 98 }}
                    onClick={() => setUserMenuOpen(false)}
                  />
                  <div className="animate-scaleIn" style={{
                    position: 'absolute', right: 0, top: 'calc(100% + 8px)',
                    background: 'var(--bg-surface)', border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-lg)', padding: '8px', minWidth: 180,
                    zIndex: 99, boxShadow: 'var(--shadow-lg)'
                  }}>
                    <Link
                      to="/profile"
                      id="nav-profile-link"
                      onClick={() => setUserMenuOpen(false)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '9px 12px', borderRadius: 'var(--radius-md)',
                        color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500,
                        transition: 'all 0.15s'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <User size={16} /> Profile
                    </Link>
                    <Link
                      to="/orders"
                      id="nav-orders-link"
                      onClick={() => setUserMenuOpen(false)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '9px 12px', borderRadius: 'var(--radius-md)',
                        color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <Package size={16} /> My Orders
                    </Link>
                    {user?.role === 'admin' && (
                      <Link
                        to="/admin"
                        id="nav-admin-link"
                        onClick={() => setUserMenuOpen(false)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 10,
                          padding: '9px 12px', borderRadius: 'var(--radius-md)',
                          color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-elevated)'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <LayoutDashboard size={16} /> Dashboard
                      </Link>
                    )}
                    <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '6px 0' }} />
                    <button
                      id="nav-logout-btn"
                      onClick={handleLogout}
                      style={{
                        width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                        padding: '9px 12px', borderRadius: 'var(--radius-md)',
                        color: 'var(--error)', fontSize: '0.875rem', fontWeight: 500,
                        background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <LogOut size={16} /> Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 8 }}>
              <Link to="/login" className="btn btn-ghost btn-sm" id="nav-login-btn">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm" id="nav-register-btn">Sign Up</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
