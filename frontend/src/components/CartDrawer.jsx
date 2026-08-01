import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, ShoppingBag, Trash2, Plus, Minus } from 'lucide-react';
import { useCart } from '../context/CartContext';

export default function CartDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const { items, totalItems, totalPrice, updateQty, removeItem, clearCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const handler = () => setIsOpen(true);
    window.addEventListener('open-cart', handler);
    return () => window.removeEventListener('open-cart', handler);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCheckout = () => {
    setIsOpen(false);
    navigate('/checkout');
  };

  return (
    <>
      <div className="drawer-overlay" onClick={() => setIsOpen(false)} />
      <div className="cart-drawer">
        {}
        <div className="drawer-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <ShoppingBag size={22} color="var(--primary)" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Your Cart</h3>
            {totalItems > 0 && (
              <span className="badge badge-primary">{totalItems}</span>
            )}
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {items.length > 0 && (
              <button
                onClick={clearCart}
                className="btn btn-ghost btn-sm"
                style={{ color: 'var(--error)', fontSize: '0.75rem' }}
                id="clear-cart-btn"
              >
                Clear All
              </button>
            )}
            <button
              id="close-cart-btn"
              className="btn btn-ghost btn-icon"
              onClick={() => setIsOpen(false)}
              style={{ padding: 6 }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {}
        <div className="drawer-body">
          {items.length === 0 ? (
            <div className="empty-state animate-fadeIn">
              <div className="empty-icon">🛍️</div>
              <h3 style={{ fontSize: '1.1rem' }}>Your cart is empty</h3>
              <p className="text-muted" style={{ fontSize: '0.875rem' }}>
                Add some products to get started
              </p>
              <button className="btn btn-primary" onClick={() => { setIsOpen(false); navigate('/products'); }}>
                Browse Products
              </button>
            </div>
          ) : (
            items.map((item, i) => (
              <div key={item.product} className="cart-item animate-fadeIn" style={{ animationDelay: `${i * 50}ms` }}>
                <img
                  src={item.image || 'https://via.placeholder.com/64'}
                  alt={item.name}
                  className="cart-item-img"
                  onError={(e) => { e.target.src = 'https://via.placeholder.com/64'; }}
                />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <p style={{ fontSize: '0.875rem', fontWeight: 600, lineHeight: 1.3 }}>{item.name}</p>
                  <p style={{ fontSize: '0.875rem', color: 'var(--primary)', fontWeight: 700 }}>
                    ${item.price.toFixed(2)}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div className="qty-controls">
                      <button
                        className="qty-btn"
                        onClick={() => updateQty(item.product, item.quantity - 1)}
                        id={`decrease-qty-${item.product}`}
                      >
                        <Minus size={12} />
                      </button>
                      <span className="qty-value">{item.quantity}</span>
                      <button
                        className="qty-btn"
                        onClick={() => updateQty(item.product, item.quantity + 1)}
                        id={`increase-qty-${item.product}`}
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                    <button
                      className="btn btn-ghost btn-icon"
                      onClick={() => removeItem(item.product)}
                      id={`remove-item-${item.product}`}
                      style={{ padding: 6, color: 'var(--error)' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {}
        {items.length > 0 && (
          <div className="drawer-footer">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span className="text-secondary" style={{ fontSize: '0.875rem' }}>Subtotal</span>
              <span style={{ fontWeight: 700 }}>${totalPrice.toFixed(2)}</span>
            </div>
            <p className="text-muted" style={{ fontSize: '0.75rem', marginBottom: 8 }}>
              Shipping and taxes calculated at checkout
            </p>
            <button
              id="checkout-from-cart-btn"
              className="btn btn-primary btn-full btn-lg"
              onClick={handleCheckout}
            >
              Proceed to Checkout · ${totalPrice.toFixed(2)}
            </button>
            <Link
              to="/cart"
              id="view-full-cart-btn"
              className="btn btn-ghost btn-full"
              onClick={() => setIsOpen(false)}
            >
              View Full Cart
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
