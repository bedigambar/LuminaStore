import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Image as ImageIcon } from 'lucide-react';
import AdminLayout from './AdminLayout';
import API from '../../api/axios';
import toast from 'react-hot-toast';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    name: '', description: '', price: '', comparePrice: '', category: 'Electronics',
    brand: '', stock: '', featured: false, isActive: true
  });
  const [images, setImages] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, [page]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data } = await API.get(`/products/admin?page=${page}&limit=10`);
      setProducts(data.products);
      setTotalPages(data.pages);
    } catch (err) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (product = null) => {
    if (product) {
      setEditingId(product._id);
      setFormData({
        name: product.name, description: product.description, price: product.price,
        comparePrice: product.comparePrice, category: product.category, brand: product.brand,
        stock: product.stock, featured: product.featured, isActive: product.isActive
      });
    } else {
      setEditingId(null);
      setFormData({
        name: '', description: '', price: '', comparePrice: '', category: 'Electronics',
        brand: '', stock: '', featured: false, isActive: true
      });
    }
    setImages(null);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const data = new FormData();
    Object.keys(formData).forEach(key => data.append(key, formData[key]));
    if (images) {
      for (let i = 0; i < images.length; i++) {
        data.append('images', images[i]);
      }
    }

    try {
      if (editingId) {
        await API.put(`/products/${editingId}`, data);
        toast.success('Product updated');
      } else {
        await API.post('/products', data);
        toast.success('Product created');
      }
      setShowModal(false);
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving product');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await API.delete(`/products/${id}`);
        toast.success('Product deleted');
        fetchProducts();
      } catch (err) {
        toast.error('Failed to delete');
      }
    }
  };

  if (loading && products.length === 0) return <AdminLayout title="Products"><div className="spinner spinner-lg" /></AdminLayout>;

  return (
    <AdminLayout title="Products Management">
      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: 'var(--space-md) var(--space-lg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: '1rem' }}>All Products</h3>
          <button className="btn btn-primary btn-sm" onClick={() => handleOpenModal()} id="admin-add-product-btn">
            <Plus size={16} /> Add Product
          </button>
        </div>

        <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
          <table>
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p._id}>
                  <td style={{ width: 60 }}>
                    <img src={p.images[0]?.url || 'https://via.placeholder.com/40'} alt={p.name} style={{ width: 40, height: 40, borderRadius: 'var(--radius-sm)', objectFit: 'cover' }} />
                  </td>
                  <td>
                    <p style={{ fontWeight: 500, fontSize: '0.9rem' }}>{p.name}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.category}</p>
                  </td>
                  <td>${p.price.toFixed(2)}</td>
                  <td>{p.stock}</td>
                  <td>
                    {p.isActive ? <span className="badge badge-success">Active</span> : <span className="badge badge-error">Inactive</span>}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button className="btn btn-ghost btn-icon" onClick={() => handleOpenModal(p)} style={{ padding: 6, marginRight: 8 }} id={`edit-prod-${p._id}`}><Edit size={14} /></button>
                    <button className="btn btn-ghost btn-icon" onClick={() => handleDelete(p._id)} style={{ padding: 6, color: 'var(--error)' }} id={`del-prod-${p._id}`}><Trash2 size={14} /></button>
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
          <div className="modal">
            <div className="modal-header">
              <h3 style={{ fontSize: '1.2rem' }}>{editingId ? 'Edit Product' : 'Add Product'}</h3>
              <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}><Trash2 size={18} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
                <div className="form-group">
                  <label className="form-label">Name</label>
                  <input type="text" className="form-input" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                  <div className="form-group">
                    <label className="form-label">Price</label>
                    <input type="number" step="0.01" className="form-input" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} required />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Compare Price</label>
                    <input type="number" step="0.01" className="form-input" value={formData.comparePrice} onChange={e => setFormData({ ...formData, comparePrice: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select className="form-select" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>
                      {['Electronics', 'Clothing', 'Books', 'Home', 'Sports', 'Beauty', 'Toys', 'Other'].map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Stock</label>
                    <input type="number" className="form-input" value={formData.stock} onChange={e => setFormData({ ...formData, stock: e.target.value })} required />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea className="form-textarea" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} required rows={3}></textarea>
                </div>
                <div className="form-group">
                  <label className="form-label">Images</label>
                  <div style={{ border: '1px dashed var(--border)', padding: 'var(--space-md)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                    <input type="file" multiple accept="image/*" onChange={e => setImages(e.target.files)} style={{ display: 'block', width: '100%' }} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-lg)' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.875rem' }}>
                    <input type="checkbox" checked={formData.featured} onChange={e => setFormData({ ...formData, featured: e.target.checked })} /> Featured
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.875rem' }}>
                    <input type="checkbox" checked={formData.isActive} onChange={e => setFormData({ ...formData, isActive: e.target.checked })} /> Active
                  </label>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Saving...' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
