import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Package, MapPin, CreditCard } from 'lucide-react';
import API from '../api/axios';
import toast from 'react-hot-toast';

export default function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = `Order Details LuminaStore`;
    const fetchOrder = async () => {
      try {
        const { data } = await API.get(`/orders/${id}`);
        setOrder(data.order);
      } catch (err) {
        toast.error('Order not found');
        navigate('/orders');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id, navigate]);

  if (loading) return <div className="loading-page"><div className="spinner spinner-lg" /></div>;
  if (!order) return null;

  return (
    <div className="page-content" style={{ paddingTop: 'calc(var(--navbar-h) + var(--space-2xl))' }}>
      <div className="container" style={{ maxWidth: 1000 }}>
        <button className="btn btn-ghost btn-sm mb-4" onClick={() => navigate(-1)} style={{ marginBottom: 'var(--space-md)' }}>
          <ArrowLeft size={16} /> Back
        </button>
        <h1 style={{ marginBottom: 'var(--space-2xl)' }}>Order Details</h1>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 'var(--space-2xl)', alignItems: 'start' }}>
          <div>
            {}
            <div className="card" style={{ marginBottom: 'var(--space-lg)' }}>
              <h3 style={{ marginBottom: 'var(--space-md)' }}>Status</h3>
              <p style={{ marginBottom: 'var(--space-sm)' }}>
                Order ID: <span style={{ fontFamily: 'monospace' }}>{order._id}</span>
              </p>
              <p style={{ marginBottom: 'var(--space-sm)' }}>Placed on: {new Date(order.createdAt).toLocaleDateString()}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 'var(--space-md)' }}>
                Status: <span className={`status-badge status-${order.status}`}>{order.status}</span>
              </div>
            </div>

            {}
            <div className="card">
              <h3 style={{ marginBottom: 'var(--space-md)' }}>Items</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                {order.orderItems.map((item) => (
                  <div key={item.product._id} style={{ display: 'flex', gap: 'var(--space-md)' }}>
                    <img src={item.image} alt={item.name} style={{ width: 64, height: 64, borderRadius: 'var(--radius-sm)', objectFit: 'cover' }} />
                    <div style={{ flex: 1 }}>
                      <Link to={`/products/${item.product._id}`} style={{ fontWeight: 500 }}>{item.name}</Link>
                      <p className="text-muted" style={{ fontSize: '0.85rem' }}>Qty: {item.quantity}</p>
                    </div>
                    <div style={{ fontWeight: 600 }}>${(item.price * item.quantity).toFixed(2)}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
            {}
            <div className="card">
              <h3 style={{ marginBottom: 'var(--space-md)' }}>Order Summary</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Items</span><span>${order.itemsPrice.toFixed(2)}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Shipping</span><span>${order.shippingPrice.toFixed(2)}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Tax</span><span>${order.taxPrice.toFixed(2)}</span></div>
                <hr className="divider" style={{ margin: '8px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold' }}><span>Total</span><span>${order.totalPrice.toFixed(2)}</span></div>
              </div>
            </div>

            {}
            <div className="card">
              <h3 style={{ marginBottom: 'var(--space-md)', display: 'flex', alignItems: 'center', gap: 8 }}><MapPin size={18} /> Shipping</h3>
              <p>{order.shippingAddress.name || order.user.name}</p>
              <p>{order.shippingAddress.street}</p>
              <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zip}</p>
              <p>{order.shippingAddress.country}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
