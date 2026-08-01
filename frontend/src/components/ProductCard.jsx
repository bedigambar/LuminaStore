import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Eye, Star } from 'lucide-react';
import { useCart } from '../context/CartContext';
import toast from 'react-hot-toast';

const StarRating = ({ rating, size = 12 }) => (
  <div className="stars">
    {[1,2,3,4,5].map((s) => (
      <Star
        key={s}
        size={size}
        fill={s <= Math.round(rating) ? 'var(--warning)' : 'none'}
        color={s <= Math.round(rating) ? 'var(--warning)' : 'var(--border)'}
      />
    ))}
  </div>
);

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const { addItem } = useCart();

  const discount = product.comparePrice > product.price
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0;

  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (product.stock === 0) return;
    addItem({
      product: product._id,
      name: product.name,
      image: product.images?.[0]?.url || '',
      price: product.price,
      quantity: 1,
    });
    toast.success(`${product.name.substring(0, 30)}... added to cart!`);
  };

  return (
    <div
      className="product-card animate-fadeIn"
      onClick={() => navigate(`/products/${product._id}`)}
      id={`product-card-${product._id}`}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && navigate(`/products/${product._id}`)}
    >
      {}
      <div className="product-img-wrap">
        <img
          src={product.images?.[0]?.url || 'https://via.placeholder.com/300'}
          alt={product.name}
          className="product-img"
          loading="lazy"
          onError={(e) => { e.target.src = 'https://via.placeholder.com/300x300/16161f/6c63ff?text=Product'; }}
        />

        {}
        {product.stock === 0 && (
          <span className="out-of-stock-badge">Out of Stock</span>
        )}
        {product.featured && product.stock > 0 && (
          <span className="featured-badge">⭐ Featured</span>
        )}
        {discount > 0 && (
          <div style={{
            position: 'absolute', bottom: 8, left: 8,
            background: 'var(--accent)', color: '#fff',
            fontSize: '0.72rem', fontWeight: 700,
            padding: '3px 8px', borderRadius: 'var(--radius-full)'
          }}>
            -{discount}%
          </div>
        )}

        {}
        <div className="product-img-overlay">
          <button
            className="btn btn-primary btn-sm"
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            id={`add-to-cart-${product._id}`}
          >
            <ShoppingCart size={14} />
            Add
          </button>
          <button
            className="btn btn-ghost btn-sm"
            onClick={(e) => { e.stopPropagation(); navigate(`/products/${product._id}`); }}
            id={`view-product-${product._id}`}
          >
            <Eye size={14} />
            View
          </button>
        </div>
      </div>

      {}
      <div className="product-info">
        <span className="product-category">{product.category}</span>
        <p className="product-name">{product.name}</p>

        {}
        {product.numReviews > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <StarRating rating={product.rating} />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              ({product.numReviews})
            </span>
          </div>
        )}

        {}
        <div className="product-price-row">
          <span className="product-price">${product.price.toFixed(2)}</span>
          {product.comparePrice > product.price && (
            <span className="product-compare-price">${product.comparePrice.toFixed(2)}</span>
          )}
        </div>

        {}
        <p style={{ fontSize: '0.75rem', color: product.stock > 5 ? 'var(--success)' : product.stock > 0 ? 'var(--warning)' : 'var(--error)' }}>
          {product.stock === 0 ? 'Out of stock' : product.stock <= 5 ? `Only ${product.stock} left!` : `In stock`}
        </p>
      </div>
    </div>
  );
}
