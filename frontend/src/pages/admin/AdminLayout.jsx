import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, Users, ArrowLeft } from 'lucide-react';

export default function AdminLayout({ children, title }) {
  return (
    <div className="admin-layout" style={{ paddingTop: 'var(--navbar-h)' }}>
      <aside className="admin-sidebar" style={{ top: 'var(--navbar-h)' }}>
        <div style={{ padding: 'var(--space-lg)', borderBottom: '1px solid var(--border)' }}>
          <h2 style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>ADMIN PANEL</h2>
        </div>
        <nav style={{ padding: 'var(--space-md) 0' }}>
          <NavLink to="/admin" end className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}>
            <LayoutDashboard size={18} /> Dashboard
          </NavLink>
          <NavLink to="/admin/products" className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}>
            <Package size={18} /> Products
          </NavLink>
          <NavLink to="/admin/orders" className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}>
            <ShoppingCart size={18} /> Orders
          </NavLink>
          <NavLink to="/admin/users" className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}>
            <Users size={18} /> Users
          </NavLink>
        </nav>
        <div style={{ marginTop: 'auto', padding: 'var(--space-md)' }}>
          <NavLink to="/" className="btn btn-ghost btn-full" style={{ justifyContent: 'flex-start' }}>
            <ArrowLeft size={16} /> Back to Store
          </NavLink>
        </div>
      </aside>

      <main className="admin-main">
        <div style={{ marginBottom: 'var(--space-2xl)' }}>
          <h1 style={{ fontSize: '2rem' }}>{title}</h1>
        </div>
        {children}
      </main>
    </div>
  );
}
