import React, { useState, useEffect } from 'react';
import { Shield, Trash2, Edit } from 'lucide-react';
import AdminLayout from './AdminLayout';
import API from '../../api/axios';
import toast from 'react-hot-toast';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchUsers();
  }, [page]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await API.get(`/users?page=${page}&limit=10`);
      setUsers(data.users);
      setTotalPages(data.pages);
    } catch (err) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleRole = async (user) => {
    try {
      const newRole = user.role === 'admin' ? 'user' : 'admin';
      await API.put(`/users/${user._id}`, { role: newRole });
      toast.success('User role updated');
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update user');
    }
  };

  const handleToggleStatus = async (user) => {
    try {
      await API.put(`/users/${user._id}`, { isActive: !user.isActive });
      toast.success(`User ${!user.isActive ? 'activated' : 'deactivated'}`);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update user');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user? This cannot be undone.')) {
      try {
        await API.delete(`/users/${id}`);
        toast.success('User deleted');
        fetchUsers();
      } catch (err) {
        toast.error('Failed to delete user');
      }
    }
  };

  if (loading && users.length === 0) return <AdminLayout title="Users"><div className="spinner spinner-lg" /></AdminLayout>;

  return (
    <AdminLayout title="Users Management">
      <div className="card" style={{ padding: 0 }}>
        <div style={{ padding: 'var(--space-md) var(--space-lg)', borderBottom: '1px solid var(--border)' }}>
          <h3 style={{ fontSize: '1rem' }}>Registered Users</h3>
        </div>

        <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id}>
                  <td style={{ fontWeight: 500 }}>{u.name}</td>
                  <td>{u.email}</td>
                  <td>
                    {u.role === 'admin' ? (
                      <span className="badge badge-primary"><Shield size={10} style={{ marginRight: 4 }} /> Admin</span>
                    ) : (
                      <span className="badge" style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}>User</span>
                    )}
                  </td>
                  <td>
                    {u.isActive ? (
                      <span className="badge badge-success">Active</span>
                    ) : (
                      <span className="badge badge-error">Inactive</span>
                    )}
                  </td>
                  <td style={{ fontSize: '0.85rem' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => handleToggleRole(u)}
                      style={{ marginRight: 8, fontSize: '0.75rem' }}
                      id={`toggle-role-${u._id}`}
                    >
                      Make {u.role === 'admin' ? 'User' : 'Admin'}
                    </button>
                    <button
                      className={`btn btn-sm ${u.isActive ? 'btn-outline' : 'btn-primary'}`}
                      onClick={() => handleToggleStatus(u)}
                      style={{ marginRight: 8, fontSize: '0.75rem' }}
                      id={`toggle-status-${u._id}`}
                    >
                      {u.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      className="btn btn-ghost btn-icon"
                      onClick={() => handleDelete(u._id)}
                      style={{ padding: 6, color: 'var(--error)' }}
                      id={`delete-user-${u._id}`}
                    >
                      <Trash2 size={14} />
                    </button>
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
    </AdminLayout>
  );
}
