import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Zap, Shield, Truck, RefreshCw, Star } from 'lucide-react';
import API from '../api/axios';
import ProductCard from '../components/ProductCard';

const CATEGORIES = [
  { name: 'Electronics', icon: '💻', slug: 'Electronics' },
  { name: 'Clothing', icon: '👕', slug: 'Clothing' },
  { name: 'Books', icon: '📚', slug: 'Books' },
  { name: 'Sports', icon: '⚽', slug: 'Sports' },
  { name: 'Home', icon: '🏠', slug: 'Home' },
  { name: 'Beauty', icon: '💄', slug: 'Beauty' },
  { name: 'Toys', icon: '🧸', slug: 'Toys' },
  { name: 'Other', icon: '🎁', slug: 'Other' },
];

const FEATURES = [
  { icon: <Truck size={24} />, title: 'Free Shipping', desc: 'On orders over $50' },
  { icon: <Shield size={24} />, title: 'Secure Payment', desc: '100% protected' },
  { icon: <RefreshCw size={24} />, title: 'Easy Returns', desc: '30-day return policy' },
  { icon: <Zap size={24} />, title: 'Fast Delivery', desc: '2-5 business days' },
];

export default function HomePage() {
  const navigate = useNavigate();
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'LuminaStore Premium Online Store';
    fetchFeatured();
  }, []);

  const fetchFeatured = async () => {
    try {
      const { data } = await API.get('/products?featured=true&limit=8');
      setFeatured(data.products || []);
    } catch {
      // Show demo cards if API not connected
      setFeatured([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-content">
      {/* ── Hero ── */}
      <section className="hero">
        <div className="hero-bg" />
        <div className="hero-grid-bg" />
        <div className="container">
          <div className="hero-content animate-fadeIn">
            <div className="hero-tag">
              <Zap size={14} />
              New Collection 2026 Up to 40% Off
            </div>
            <h1 className="hero-title">
              Shop the{' '}
              <span className="gradient-text">Future</span>{' '}
              of Retail
            </h1>
            <p className="hero-subtitle">
              Discover curated premium products across electronics, fashion, home essentials, and more all in one place with unbeatable prices.
            </p>
            <div className="hero-actions">
              <button
                id="hero-shop-now-btn"
                className="btn btn-primary btn-lg"
                onClick={() => navigate('/products')}
              >
                Shop Now <ArrowRight size={18} />
              </button>
              <button
                id="hero-featured-btn"
                className="btn btn-ghost btn-lg"
                onClick={() => document.getElementById('featured-section').scrollIntoView({ behavior: 'smooth' })}
              >
                View Featured
              </button>
            </div>
            <div className="hero-stats">
              <div>
                <div className="hero-stat-value">50K+</div>
                <div className="hero-stat-label">Happy Customers</div>
              </div>
              <div>
                <div className="hero-stat-value">1200+</div>
                <div className="hero-stat-label">Products</div>
              </div>
              <div>
                <div className="hero-stat-value">4.9★</div>
                <div className="hero-stat-label">Avg Rating</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section style={{ padding: 'var(--space-2xl) 0', background: 'var(--bg-surface)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-lg)' }}>
            {FEATURES.map((f) => (
              <div key={f.title} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 'var(--radius-md)',
                  background: 'rgba(108,99,255,0.12)', border: '1px solid rgba(108,99,255,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--primary)', flexShrink: 0
                }}>
                  {f.icon}
                </div>
                <div>
                  <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{f.title}</p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Categories ── */}
      <section className="section" id="categories-section">
        <div className="container">
          <h2 className="section-title">Shop by Category</h2>
          <p className="section-subtitle">Find exactly what you're looking for</p>
          <div className="categories-grid">
            {CATEGORIES.map((cat) => (
              <div
                key={cat.slug}
                className="category-card animate-fadeIn"
                onClick={() => navigate(`/products?category=${cat.slug}`)}
                id={`category-${cat.slug.toLowerCase()}`}
              >
                <span className="category-icon">{cat.icon}</span>
                <span className="category-name">{cat.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Products ── */}
      <section className="section" id="featured-section" style={{ background: 'var(--bg-surface)', borderTop: '1px solid var(--border)' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 'var(--space-2xl)' }}>
            <div>
              <h2 className="section-title">Featured Products</h2>
              <p style={{ color: 'var(--text-secondary)' }}>Handpicked favorites just for you</p>
            </div>
            <Link to="/products" className="btn btn-outline btn-sm" id="view-all-products-btn">
              View All <ArrowRight size={14} />
            </Link>
          </div>

          {loading ? (
            <div className="products-grid">
              {[...Array(8)].map((_, i) => (
                <div key={i} style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
                  <div className="skeleton" style={{ aspectRatio: '1' }} />
                  <div style={{ padding: 'var(--space-md)', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div className="skeleton" style={{ height: 12, width: '60%' }} />
                    <div className="skeleton" style={{ height: 16, width: '90%' }} />
                    <div className="skeleton" style={{ height: 20, width: '40%' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : featured.length > 0 ? (
            <div className="products-grid">
              {featured.map((p) => <ProductCard key={p._id} product={p} />)}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">🛍️</div>
              <h3>Products loading...</h3>
              <p className="text-muted">Connect your MongoDB to see products here</p>
              <Link to="/products" className="btn btn-primary">Browse All Products</Link>
            </div>
          )}
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="section">
        <div className="container">
          <h2 className="section-title text-center">What Customers Say</h2>
          <p className="section-subtitle text-center" style={{ margin: '0 auto var(--space-2xl)' }}>
            Trusted by thousands of happy shoppers
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-lg)' }}>
            {[
              { name: 'Sarah M.', review: 'Amazing products and super fast delivery! The quality exceeded my expectations. Will definitely shop again.', rating: 5, avatar: '👩' },
              { name: 'James K.', review: 'Best online shopping experience I\'ve had. The customer service is top-notch and prices are very competitive.', rating: 5, avatar: '👨' },
              { name: 'Emily R.', review: 'Love the variety of products. Found everything I needed in one place. Highly recommend LuminaStore!', rating: 4, avatar: '👩‍💼' },
            ].map((t, i) => (
              <div key={i} className="card animate-fadeIn" style={{ animationDelay: `${i * 100}ms` }}>
                <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                  {[1,2,3,4,5].map((s) => (
                    <Star key={s} size={14} fill={s <= t.rating ? 'var(--warning)' : 'none'} color={s <= t.rating ? 'var(--warning)' : 'var(--border)'} />
                  ))}
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.7, marginBottom: 16 }}>"{t.review}"</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: '1.5rem' }}>{t.avatar}</span>
                  <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{t.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section style={{ padding: 'var(--space-3xl) 0', background: 'linear-gradient(135deg, rgba(108,99,255,0.15), rgba(255,107,107,0.1))', borderTop: '1px solid var(--border)' }}>
        <div className="container text-center">
          <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', marginBottom: 'var(--space-md)' }}>
            Ready to start shopping?
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-xl)', maxWidth: 500, margin: '0 auto var(--space-xl)' }}>
            Join 50,000+ happy customers. New deals every day.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-primary btn-lg" onClick={() => navigate('/products')} id="cta-shop-btn">
              Start Shopping <ArrowRight size={18} />
            </button>
            <Link to="/register" className="btn btn-outline btn-lg" id="cta-register-btn">
              Create Account
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: 'var(--bg-surface)', borderTop: '1px solid var(--border)', padding: 'var(--space-2xl) 0' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-2xl)', marginBottom: 'var(--space-2xl)' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: 'var(--space-md)' }} className="gradient-text">LuminaStore</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.7 }}>
                Your premium destination for quality products at unbeatable prices.
              </p>
            </div>
            <div>
              <h4 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: 'var(--space-md)', color: 'var(--text-secondary)' }}>Shop</h4>
              {['Electronics', 'Clothing', 'Books', 'Sports'].map((c) => (
                <div key={c} style={{ marginBottom: 8 }}>
                  <Link to={`/products?category=${c}`} style={{ color: 'var(--text-muted)', fontSize: '0.875rem', transition: 'color 0.15s' }}
                    onMouseEnter={e => e.target.style.color = 'var(--text-primary)'}
                    onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}
                  >{c}</Link>
                </div>
              ))}
            </div>
            <div>
              <h4 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: 'var(--space-md)', color: 'var(--text-secondary)' }}>Account</h4>
              {[['Login', '/login'], ['Register', '/register'], ['My Orders', '/orders'], ['Profile', '/profile']].map(([label, path]) => (
                <div key={label} style={{ marginBottom: 8 }}>
                  <Link to={path} style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{label}</Link>
                </div>
              ))}
            </div>
          </div>
          <div style={{ borderTop: '1px solid var(--border)', paddingTop: 'var(--space-lg)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
              © 2026 LuminaStore. All rights reserved.
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
              
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
