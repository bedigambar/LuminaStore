import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, Star, ArrowLeft, Minus, Plus, Package, Shield } from 'lucide-react';
import API from '../api/axios';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const StarRating = ({ rating, interactive = false, onRate }) => (
  <div className="stars" style={{ gap: 3 }}>
    {[1,2,3,4,5].map((s) => (
      <Star
        key={s}
        size={interactive ? 20 : 16}
        fill={s <= Math.round(rating) ? 'var(--warning)' : 'none'}
        color={s <= Math.round(rating) ? 'var(--warning)' : 'var(--border)'}
        style={{ cursor: interactive ? 'pointer' : 'default', transition: 'all 0.15s' }}
        onClick={() => interactive && onRate && onRate(s)}
      />
    ))}
  </div>
);

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { isAuthenticated, user } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [review, setReview] = useState({ rating: 5, comment: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchProduct();
    window.scrollTo(0, 0);
  }, [id]);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const { data } = await API.get(`/products/${id}`);
      setProduct(data.product);
      document.title = `${data.product.name} LuminaStore`;
    } catch {
      toast.error('Product not found');
      navigate('/products');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!product || product.stock === 0) return;
    addItem({
      product: product._id,
      name: product.name,
      image: product.images?.[0]?.url || '',
      price: product.price,
      quantity: qty,
    });
    toast.success(`Added ${qty}x ${product.name.substring(0, 25)}... to cart!`);
    window.dispatchEvent(new CustomEvent('open-cart'));
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!review.comment.trim()) { toast.error('Please write a comment'); return; }
    setSubmitting(true);
    try {
      await API.post(`/products/${id}/reviews`, review);
      toast.success('Review submitted!');
      setReview({ rating: 5, comment: '' });
      fetchProduct();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const discount = product?.comparePrice > product?.price
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0;

  if (loading) return (
    <div className="loading-page" style={{ minHeight: 'calc(100vh - var(--navbar-h))' }}>
      <div className="spinner spinner-lg" />
    </div>
  );

  if (!product) return null;

  return (
    <div className="page-content" style={{ paddingTop: 'calc(var(--navbar-h) + var(--space-2xl))' }}>
      <div className="container">
        {/* Back */}
        <button
          id="back-to-products-btn"
          className="btn btn-ghost btn-sm"
          onClick={() => navigate(-1)}
          style={{ marginBottom: 'var(--space-xl)' }}
        >
          <ArrowLeft size={16} /> Back
        </button>

        {/* Product Details */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3xl)', marginBottom: 'var(--space-3xl)' }}>
          {/* Images */}
          <div>
            <div style={{ borderRadius: 'var(--radius-xl)', overflow: 'hidden', background: 'var(--bg-elevated)', aspectRatio: '1', marginBottom: 'var(--space-md)' }}>
              <img
                src={product.images?.[activeImg]?.url || 'https://via.placeholder.com/500'}
                alt={product.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'all 0.3s' }}
                onError={(e) => { e.target.src = 'https://via.placeholder.com/500x500/16161f/6c63ff?text=Product'; }}
              />
            </div>
            {product.images?.length > 1 && (
              <div style={{ display: 'flex', gap: 10 }}>
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    style={{
                      width: 70, height: 70, borderRadius: 'var(--radius-md)',
                      overflow: 'hidden', border: `2px solid ${i === activeImg ? 'var(--primary)' : 'var(--border)'}`,
                      padding: 0, cursor: 'pointer', transition: 'border-color 0.15s'
                    }}
                  >
                    <img src={img.url} alt={`${i}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            <div>
              <span className="badge badge-primary" style={{ marginBottom: 10 }}>{product.category}</span>
              {product.brand && <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 6 }}>{product.brand}</p>}
              <h1 style={{ fontSize: 'clamp(1.4rem, 3vw, 2rem)', marginBottom: 'var(--space-sm)' }}>{product.name}</h1>
            </div>

            {/* Rating */}
            {product.numReviews > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <StarRating rating={product.rating} />
                <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  {product.rating.toFixed(1)} ({product.numReviews} reviews)
                </span>
              </div>
            )}

            {/* Price */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                ${product.price.toFixed(2)}
              </span>
              {product.comparePrice > product.price && (
                <>
                  <span style={{ fontSize: '1.1rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                    ${product.comparePrice.toFixed(2)}
                  </span>
                  <span className="badge badge-accent">-{discount}% OFF</span>
                </>
              )}
            </div>

            <hr className="divider" style={{ margin: '4px 0' }} />

            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8, fontSize: '0.95rem' }}>
              {product.description}
            </p>

            {/* Stock */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Package size={16} color={product.stock > 0 ? 'var(--success)' : 'var(--error)'} />
              <span style={{ fontSize: '0.875rem', color: product.stock > 0 ? 'var(--success)' : 'var(--error)', fontWeight: 500 }}>
                {product.stock === 0 ? 'Out of Stock' : product.stock <= 5 ? `Only ${product.stock} left!` : `${product.stock} in stock`}
              </span>
            </div>

            {/* Qty + Add */}
            {product.stock > 0 && (
              <div style={{ display: 'flex', gap: 'var(--space-md)', alignItems: 'center' }}>
                <div className="qty-controls" style={{ padding: 4 }}>
                  <button className="qty-btn" onClick={() => setQty(Math.max(1, qty - 1))} id="decrease-qty-btn">
                    <Minus size={14} />
                  </button>
                  <span className="qty-value" style={{ minWidth: 40, textAlign: 'center' }}>{qty}</span>
                  <button className="qty-btn" onClick={() => setQty(Math.min(product.stock, qty + 1))} id="increase-qty-btn">
                    <Plus size={14} />
                  </button>
                </div>
                <button
                  id="add-to-cart-detail-btn"
                  className="btn btn-primary btn-lg"
                  style={{ flex: 1 }}
                  onClick={handleAddToCart}
                >
                  <ShoppingCart size={18} /> Add to Cart
                </button>
              </div>
            )}

            {/* Trust Badges */}
            <div style={{ display: 'flex', gap: 'var(--space-lg)', flexWrap: 'wrap', marginTop: 4 }}>
              {[['🚚', 'Free shipping over $50'], ['🔒', 'Secure checkout'], ['↩️', '30-day returns']].map(([icon, text]) => (
                <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {icon} {text}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Reviews */}
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 'var(--space-2xl)' }}>
          <h2 style={{ marginBottom: 'var(--space-xl)', fontSize: '1.4rem' }}>
            Customer Reviews ({product.numReviews})
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: product.reviews?.length > 0 ? '1fr 340px' : '1fr', gap: 'var(--space-2xl)' }}>
            {/* Review List */}
            {product.reviews?.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                {product.reviews.map((r) => (
                  <div key={r._id} className="card animate-fadeIn">
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 36, height: 36, borderRadius: '50%',
                          background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '0.85rem', fontWeight: 700, color: '#fff'
                        }}>
                          {r.name?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p style={{ fontWeight: 600, fontSize: '0.875rem' }}>{r.name}</p>
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {new Date(r.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <StarRating rating={r.rating} />
                    </div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.7 }}>{r.comment}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state" style={{ padding: 'var(--space-2xl) 0' }}>
                <div className="empty-icon">💬</div>
                <h3>No reviews yet</h3>
                <p className="text-muted">Be the first to review this product!</p>
              </div>
            )}

            {/* Write Review */}
            {isAuthenticated ? (
              <div className="card" style={{ height: 'fit-content' }}>
                <h3 style={{ fontSize: '1rem', marginBottom: 'var(--space-md)' }}>Write a Review</h3>
                <form onSubmit={handleSubmitReview} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                  <div>
                    <p className="form-label" style={{ marginBottom: 8 }}>Your Rating</p>
                    <StarRating
                      rating={review.rating}
                      interactive
                      onRate={(r) => setReview(prev => ({ ...prev, rating: r }))}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Your Review</label>
                    <textarea
                      id="review-comment-input"
                      className="form-textarea"
                      placeholder="Share your thoughts about this product..."
                      value={review.comment}
                      onChange={(e) => setReview(prev => ({ ...prev, comment: e.target.value }))}
                      rows={4}
                      required
                    />
                  </div>
                  <button
                    id="submit-review-btn"
                    type="submit"
                    className="btn btn-primary"
                    disabled={submitting}
                  >
                    {submitting ? <><span className="spinner" /> Submitting...</> : 'Submit Review'}
                  </button>
                </form>
              </div>
            ) : (
              <div className="card text-center" style={{ height: 'fit-content' }}>
                <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-md)' }}>
                  Login to write a review
                </p>
                <button className="btn btn-primary" onClick={() => navigate('/login')}>Login</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
