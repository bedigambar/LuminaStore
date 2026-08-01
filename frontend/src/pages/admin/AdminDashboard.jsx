import React, { useState, useEffect } from 'react';
import { DollarSign, ShoppingBag, Package, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import AdminLayout from './AdminLayout';
import API from '../../api/axios';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Admin Dashboard LuminaStore';
    const fetchStats = async () => {
      try {
        const { data } = await API.get('/orders/stats');
        setStats(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return (
    <AdminLayout title="Dashboard">
      <div className="loading-page"><div className="spinner spinner-lg" /></div>
    </AdminLayout>
  );

  const formatCurrency = (val) => `$${(val || 0).toFixed(2)}`;

  const chartData = stats?.monthlyRevenue?.map(item => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return {
      name: `${months[item._id.month - 1]}`,
      revenue: item.revenue,
    };
  }) || [];

  return (
    <AdminLayout title="Dashboard Overview">
      <div className="stats-grid" style={{ marginBottom: 'var(--space-3xl)' }}>
        <div className="stat-card" style={{ '--gradient': 'linear-gradient(90deg, var(--primary), var(--primary-light))' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p className="stat-label">Total Revenue</p>
              <h3 className="stat-value">{formatCurrency(stats?.stats?.totalRevenue)}</h3>
            </div>
            <div className="stat-icon" style={{ background: 'rgba(108,99,255,0.1)', color: 'var(--primary)' }}>
              <DollarSign size={24} />
            </div>
          </div>
        </div>

        <div className="stat-card" style={{ '--gradient': 'linear-gradient(90deg, var(--success), #4ade80)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p className="stat-label">Total Orders</p>
              <h3 className="stat-value">{stats?.stats?.totalOrders || 0}</h3>
            </div>
            <div className="stat-icon" style={{ background: 'rgba(34,197,94,0.1)', color: 'var(--success)' }}>
              <ShoppingBag size={24} />
            </div>
          </div>
        </div>

        <div className="stat-card" style={{ '--gradient': 'linear-gradient(90deg, var(--accent), var(--warning))' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <p className="stat-label">Avg. Order Value</p>
              <h3 className="stat-value">{formatCurrency(stats?.stats?.avgOrderValue)}</h3>
            </div>
            <div className="stat-icon" style={{ background: 'rgba(255,107,107,0.1)', color: 'var(--accent)' }}>
              <TrendingUp size={24} />
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 'var(--space-2xl)' }}>
        <div className="card">
          <h3 style={{ marginBottom: 'var(--space-lg)' }}>Revenue Overview</h3>
          <div style={{ height: 300 }}>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3e" vertical={false} />
                  <XAxis dataKey="name" stroke="#a0a0c0" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#a0a0c0" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `$${val}`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#16161f', borderColor: '#2a2a3e', borderRadius: '8px' }}
                    itemStyle={{ color: '#f0f0ff' }}
                    formatter={(val) => [`$${val.toFixed(2)}`, 'Revenue']}
                  />
                  <Bar dataKey="revenue" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                No revenue data available yet
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <h3 style={{ marginBottom: 'var(--space-lg)' }}>Orders by Status</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            {stats?.statusCounts?.map((s) => (
              <div key={s._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span className={`status-badge status-${s._id}`}>{s._id}</span>
                <span style={{ fontWeight: 600 }}>{s.count}</span>
              </div>
            ))}
            {!stats?.statusCounts?.length && (
              <p className="text-muted text-center py-4">No orders yet</p>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
