import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import API from '../api/axios';
import ProductCard from '../components/ProductCard';

const CATEGORIES = ['Electronics', 'Clothing', 'Books', 'Home', 'Sports', 'Beauty', 'Toys', 'Other'];
const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'popular', label: 'Most Popular' },
];

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  // Filter state
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [sort, setSort] = useState('newest');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minRating, setMinRating] = useState('');

  useEffect(() => {
    document.title = 'Shop All Products LuminaStore';
    fetchProducts();
  }, [page, category, sort, minPrice, maxPrice, minRating]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 12, sort });
      if (search) params.set('search', search);
      if (category) params.set('category', category);
      if (minPrice) params.set('minPrice', minPrice);
      if (maxPrice) params.set('maxPrice', maxPrice);
      if (minRating) params.set('minRating', minRating);

      const { data } = await API.get(`/products?${params}`);
      setProducts(data.products || []);
      setTotalPages(data.pages || 1);
      setTotal(data.total || 0);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchProducts();
  };

  const clearFilters = () => {
    setCategory('');
    setMinPrice('');
    setMaxPrice('');
    setMinRating('');
    setSearch('');
    setSort('newest');
    setPage(1);
  };

  const hasFilters = category || minPrice || maxPrice || minRating || search;

  return (
    <div className="page-content" style={{ paddingTop: 'calc(var(--navbar-h) + var(--space-2xl))' }}>
      <div className="container">
        {/* Header */}
        <div style={{ marginBottom: 'var(--space-2xl)' }}>
          <h1 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', marginBottom: 6 }}>All Products</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            {loading ? 'Loading...' : `${total} products found`}
          </p>
        </div>

        {/* Search + Sort bar */}
        <div style={{ display: 'flex', gap: 'var(--space-md)', marginBottom: 'var(--space-xl)', flexWrap: 'wrap' }}>
          <form onSubmit={handleSearch} style={{ flex: 1, minWidth: 200 }}>
            <div className="search-bar">
              <Search size={16} className="search-icon" />
              <input
                id="product-search-input"
                type="text"
                className="form-input search-input"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </form>

          <div style={{ position: 'relative' }}>
            <select
              id="sort-select"
              className="form-select"
              value={sort}
              onChange={(e) => { setSort(e.target.value); setPage(1); }}
              style={{ paddingRight: 36 }}
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          <button
            id="toggle-filters-btn"
            className={`btn btn-ghost ${showFilters ? 'btn-outline' : ''}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal size={16} />
            Filters
            {hasFilters && <span className="badge badge-primary" style={{ marginLeft: 4 }}>Active</span>}
          </button>

          {hasFilters && (
            <button className="btn btn-ghost btn-sm" onClick={clearFilters} id="clear-filters-btn">
              <X size={14} /> Clear
            </button>
          )}
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-xl)', alignItems: 'flex-start' }}>
          {/* Filters Sidebar */}
          {showFilters && (
            <aside className="filter-sidebar animate-slideInLeft">
              <div className="card">
                {/* Categories */}
                <div className="filter-section">
                  <p className="filter-title">Category</p>
                  <label className="filter-checkbox">
                    <input type="radio" name="cat" checked={category === ''} onChange={() => { setCategory(''); setPage(1); }} />
                    All Categories
                  </label>
                  {CATEGORIES.map((c) => (
                    <label key={c} className="filter-checkbox">
                      <input type="radio" name="cat" checked={category === c} onChange={() => { setCategory(c); setPage(1); }} />
                      {c}
                    </label>
                  ))}
                </div>

                {/* Price Range */}
                <div className="filter-section">
                  <p className="filter-title">Price Range</p>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input
                      id="min-price-input"
                      type="number"
                      className="form-input"
                      placeholder="Min"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      min="0"
                    />
                    <input
                      id="max-price-input"
                      type="number"
                      className="form-input"
                      placeholder="Max"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      min="0"
                    />
                  </div>
                  <button className="btn btn-primary btn-sm btn-full" style={{ marginTop: 8 }} onClick={() => setPage(1)}>
                    Apply
                  </button>
                </div>

                {/* Min Rating */}
                <div className="filter-section" style={{ borderBottom: 'none' }}>
                  <p className="filter-title">Min Rating</p>
                  {[4, 3, 2, 1].map((r) => (
                    <label key={r} className="filter-checkbox">
                      <input type="radio" name="rating" checked={minRating === String(r)} onChange={() => { setMinRating(String(r)); setPage(1); }} />
                      {'★'.repeat(r)} & above
                    </label>
                  ))}
                  {minRating && (
                    <button className="btn btn-ghost btn-sm" onClick={() => setMinRating('')}>Clear rating</button>
                  )}
                </div>
              </div>
            </aside>
          )}

          {/* Products */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Active Filter Tags */}
            {hasFilters && (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 'var(--space-md)' }}>
                {category && (
                  <span className="badge badge-primary" style={{ cursor: 'pointer' }} onClick={() => setCategory('')}>
                    {category} <X size={10} />
                  </span>
                )}
                {(minPrice || maxPrice) && (
                  <span className="badge badge-primary" style={{ cursor: 'pointer' }} onClick={() => { setMinPrice(''); setMaxPrice(''); }}>
                    ${minPrice || '0'} – ${maxPrice || '∞'} <X size={10} />
                  </span>
                )}
                {minRating && (
                  <span className="badge badge-primary" style={{ cursor: 'pointer' }} onClick={() => setMinRating('')}>
                    {minRating}+ Stars <X size={10} />
                  </span>
                )}
              </div>
            )}

            {loading ? (
              <div className="products-grid">
                {[...Array(12)].map((_, i) => (
                  <div key={i} style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', border: '1px solid var(--border)' }}>
                    <div className="skeleton" style={{ aspectRatio: '1' }} />
                    <div style={{ padding: 'var(--space-md)', display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <div className="skeleton" style={{ height: 12, width: '60%' }} />
                      <div className="skeleton" style={{ height: 16, width: '90%' }} />
                      <div className="skeleton" style={{ height: 20, width: '40%' }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="empty-state animate-fadeIn">
                <div className="empty-icon">🔍</div>
                <h3>No products found</h3>
                <p className="text-muted">Try adjusting your filters or search term</p>
                <button className="btn btn-primary" onClick={clearFilters}>Clear Filters</button>
              </div>
            ) : (
              <>
                <div className="products-grid">
                  {products.map((p) => <ProductCard key={p._id} product={p} />)}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="pagination">
                    <button
                      className="page-btn"
                      disabled={page === 1}
                      onClick={() => setPage(page - 1)}
                      id="prev-page-btn"
                    >
                      ‹
                    </button>
                    {[...Array(totalPages)].map((_, i) => {
                      const p = i + 1;
                      if (p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1)) {
                        return (
                          <button
                            key={p}
                            className={`page-btn ${p === page ? 'active' : ''}`}
                            onClick={() => setPage(p)}
                            id={`page-${p}-btn`}
                          >
                            {p}
                          </button>
                        );
                      }
                      if (p === 2 || p === totalPages - 1) return <span key={p} style={{ color: 'var(--text-muted)' }}>…</span>;
                      return null;
                    })}
                    <button
                      className="page-btn"
                      disabled={page === totalPages}
                      onClick={() => setPage(page + 1)}
                      id="next-page-btn"
                    >
                      ›
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
