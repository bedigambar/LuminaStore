import React, { useState, useEffect } from 'react';
import { Eye, Edit } from 'lucide-react';
import AdminLayout from './AdminLayout';
import API from '../../api/axios';
import toast from 'react-hot-toast';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [status, setStatus] = useState('');
  const [tracking, setTracking] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, [page]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data } = await API.get(`/orders?page=${page}&limit=10`);
      setOrders(data.orders);
      setTotalPages(data.pages);
    } catch (err) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (order) => {
    setEditingOrder(order);
    setStatus(order.status);
    setTracking(order.trackingNumber || '');
    setShowModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      await API.put(`/orders/${editingOrder._id}/status`, { status, trackingNumber: tracking });
      toast.success('Order status updated');
      setShowModal(false);
      fetchOrders();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update order');
    } finally {
      setUpdating(false);
    }
  };

  if (loading && orders.length === 0) return <AdminLayout title="Orders"><div className="spinner spinner-lg" /></AdminLayout>;

  return (
    <AdminLayout title="Orders Management">
      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: 'var(--space-md) var(--space-lg)', borderBottom: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: '1rem' }}>All Orders</h3>
        </div>

        <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Date</th>
                <th>Customer</th>
                <th>Total</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o._id}>
                  <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{o._id.substring(18)}</td>
                  <td>{new Date(o.createdAt).toLocaleDateString()}</td>
                  <td>
                    <p style={{ fontWeight: 500, fontSize: '0.9rem' }}>{o.user?.name}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{o.user?.email}</p>
                  </td>
                  <td style={{ fontWeight: 600 }}>${o.totalPrice.toFixed(2)}</td>
                  <td><span className={`status-badge status-${o.status}`}>{o.status}</span></td>
                  <td style={{ textAlign: 'right' }}>
                    <button className="btn btn-ghost btn-icon" onClick={() => handleEdit(o)} style={{ padding: 6 }} id={`edit-order-${o._id}`}><Edit size={14} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div style={{ padding: 'var(--space-md)', display: 'flex', justifyContent: 'center', borderTop: '1px solid var(--border)' }}>
            <div className="pagination">
              <button className="page-btn" disabled={page === 1} onClick={() => setPage(page - 1)}>‹</button>
              <span style={{ fontSize: '0.85rem', padding: '0 10px' }}>Page {page} of {totalPages}</span>
              <button className="page-btn" disabled={page === totalPages} onClick={() => setPage(page + 1)}>›</button>
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 400 }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.1rem' }}>Update Order Status</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}><Edit size={18} /></button>
            </div>
            <form onSubmit={handleUpdate}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Order ID: <span style={{ fontFamily: 'monospace' }}>{editingOrder._id}</span>
                </p>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select className="form-select" value={status} onChange={e => setStatus(e.target.value)}>
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Tracking Number (Optional)</label>
                  <input type="text" className="form-input" value={tracking} onChange={e => setTracking(e.target.value)} placeholder="e.g. 1Z9999999999999999" />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={updating}>
                  {updating ? 'Updating...' : 'Update Status'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
