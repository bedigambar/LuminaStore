import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircle, Package, ArrowRight } from 'lucide-react';
import API from '../api/axios';

export default function OrderSuccessPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Order Successful LuminaStore';
    const fetchOrder = async () => {
      try {
        const { data } = await API.get(`/orders/${id}`);
        setOrder(data.order);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  if (loading) return (
    <div className="loading-page">
      <div className="spinner spinner-lg" />
    </div>
  );

  return (
    <div className="page-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="container" style={{ maxWidth: 600 }}>
        <div className="card text-center animate-scaleIn" style={{ padding: 'var(--space-3xl) var(--space-xl)' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--space-lg)' }}>
            <CheckCircle size={80} color="var(--success)" />
          </div>
          <h1 style={{ marginBottom: 'var(--space-sm)' }}>Order Successful!</h1>
          <p className="text-muted" style={{ marginBottom: 'var(--space-xl)' }}>
            Thank you for your purchase. We've received your order and are getting it ready.
          </p>

          <div style={{ background: 'var(--bg-elevated)', padding: 'var(--space-lg)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-2xl)', textAlign: 'left' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <span className="text-secondary">Order ID:</span>
              <span style={{ fontWeight: 600, fontFamily: 'monospace' }}>{id}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <span className="text-secondary">Date:</span>
              <span style={{ fontWeight: 600 }}>{order ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span className="text-secondary">Total Amount:</span>
              <span style={{ fontWeight: 700, color: 'var(--primary)' }}>${order ? order.totalPrice.toFixed(2) : '0.00'}</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-md)', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to={`/orders/${id}`} className="btn btn-primary" id="view-order-btn">
              <Package size={18} /> View Order Details
            </Link>
            <Link to="/products" className="btn btn-ghost" id="continue-shopping-success-btn">
              Continue Shopping <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
