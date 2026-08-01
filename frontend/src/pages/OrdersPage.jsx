import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Eye } from 'lucide-react';
import API from '../api/axios';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'My Orders LuminaStore';
    const fetchOrders = async () => {
      try {
        const { data } = await API.get('/orders/mine');
        setOrders(data.orders);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) return (
    <div className="loading-page">
      <div className="spinner spinner-lg" />
    </div>
  );

  return (
    <div className="page-content" style={{ paddingTop: 'calc(var(--navbar-h) + var(--space-2xl))' }}>
      <div className="container" style={{ maxWidth: 1000 }}>
        <h1 style={{ marginBottom: 'var(--space-2xl)' }}>My Orders</h1>

        {orders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📦</div>
            <h3>No orders yet</h3>
            <p className="text-muted">You haven't placed any orders yet.</p>
            <Link to="/products" className="btn btn-primary mt-4">Start Shopping</Link>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Date</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id}>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{order._id.substring(18)}</td>
                    <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td>{order.orderItems.reduce((acc, item) => acc + item.quantity, 0)} items</td>
                    <td style={{ fontWeight: 600 }}>${order.totalPrice.toFixed(2)}</td>
                    <td>
                      <span className={`status-badge status-${order.status}`}>
                        {order.status}
                      </span>
                    </td>
                    <td>
                      <Link to={`/orders/${order._id}`} className="btn btn-ghost btn-sm">
                        <Eye size={14} /> View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
