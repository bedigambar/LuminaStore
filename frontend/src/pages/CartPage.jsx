import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Minus, Plus, Trash2, ArrowRight, Tag } from 'lucide-react';
import { useCart } from '../context/CartContext';

const SHIPPING_THRESHOLD = 50;
const SHIPPING_RATE = 9.99;
const TAX_RATE = 0.08;

export default function CartPage() {
  const navigate = useNavigate();
  const { items, totalPrice, updateQty, removeItem, clearCart } = useCart();

  const shipping = totalPrice >= SHIPPING_THRESHOLD ? 0 : SHIPPING_RATE;
  const tax = totalPrice * TAX_RATE;
  const total = totalPrice + shipping + tax;

  useEffect(() => {
    document.title = 'Shopping Cart LuminaStore';
  }, []);

  if (items.length === 0) return (
    <div className="page-content" style={{ paddingTop: 'calc(var(--navbar-h) + var(--space-3xl))' }}>
      <div className="container">
        <div className="empty-state animate-fadeIn">
          <div className="empty-icon animate-float">🛍️</div>
          <h2>Your cart is empty</h2>
          <p className="text-muted">Looks like you haven't added anything yet</p>
          <Link to="/products" className="btn btn-primary btn-lg" id="empty-cart-shop-btn">
            Start Shopping <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <div className="page-content" style={{ paddingTop: 'calc(var(--navbar-h) + var(--space-2xl))' }}>
      <div className="container">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2xl)' }}>
          <h1 style={{ fontSize: 'clamp(1.4rem, 3vw, 2rem)' }}>Shopping Cart</h1>
          <button className="btn btn-ghost btn-sm" onClick={clearCart} style={{ color: 'var(--error)' }} id="clear-all-cart-btn">
            <Trash2 size={14} /> Clear All
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 'var(--space-2xl)', alignItems: 'start' }}>
          {/* Cart Items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            {items.map((item, i) => (
              <div
                key={item.product}
                className="card animate-fadeIn"
                style={{ animationDelay: `${i * 50}ms`, display: 'grid', gridTemplateColumns: '90px 1fr', gap: 'var(--space-lg)' }}
              >
                <img
                  src={item.image || 'https://via.placeholder.com/90'}
                  alt={item.name}
                  style={{ width: 90, height: 90, objectFit: 'cover', borderRadius: 'var(--radius-md)' }}
                  onError={(e) => { e.target.src = 'https://via.placeholder.com/90'; }}
                />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Link
                      to={`/products/${item.product}`}
                      style={{ fontWeight: 600, fontSize: '0.95rem', lineHeight: 1.4 }}
                      onMouseEnter={e => e.target.style.color = 'var(--primary)'}
                      onMouseLeave={e => e.target.style.color = 'var(--text-primary)'}
                    >
                      {item.name}
                    </Link>
                    <button
                      className="btn btn-ghost btn-icon"
                      onClick={() => removeItem(item.product)}
                      id={`remove-cart-item-${item.product}`}
                      style={{ padding: 6, color: 'var(--error)' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div className="qty-controls">
                      <button className="qty-btn" onClick={() => updateQty(item.product, item.quantity - 1)} id={`cart-decrease-${item.product}`}>
                        <Minus size={12} />
                      </button>
                      <span className="qty-value">{item.quantity}</span>
                      <button className="qty-btn" onClick={() => updateQty(item.product, item.quantity + 1)} id={`cart-increase-${item.product}`}>
                        <Plus size={12} />
                      </button>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontWeight: 700, fontSize: '1rem' }}>${(item.price * item.quantity).toFixed(2)}</p>
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>${item.price.toFixed(2)} each</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="card" style={{ position: 'sticky', top: 'calc(var(--navbar-h) + var(--space-lg))' }}>
            <h3 style={{ fontSize: '1.1rem', marginBottom: 'var(--space-lg)' }}>Order Summary</h3>

            {totalPrice < SHIPPING_THRESHOLD && (
              <div className="alert alert-info" style={{ marginBottom: 'var(--space-md)', fontSize: '0.82rem' }}>
                <Tag size={14} /> Add ${(SHIPPING_THRESHOLD - totalPrice).toFixed(2)} more for free shipping!
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 'var(--space-lg)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                <span className="text-secondary">Subtotal</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                <span className="text-secondary">Shipping</span>
                <span style={{ color: shipping === 0 ? 'var(--success)' : 'var(--text-primary)' }}>
                  {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                <span className="text-secondary">Tax (8%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <hr className="divider" />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1.1rem' }}>
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            <button
              id="proceed-to-checkout-btn"
              className="btn btn-primary btn-full btn-lg"
              onClick={() => navigate('/checkout')}
            >
              Proceed to Checkout <ArrowRight size={16} />
            </button>
            <Link to="/products" className="btn btn-ghost btn-full" style={{ marginTop: 8, textAlign: 'center' }} id="continue-shopping-btn">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// Missing import
import { useEffect } from 'react';
