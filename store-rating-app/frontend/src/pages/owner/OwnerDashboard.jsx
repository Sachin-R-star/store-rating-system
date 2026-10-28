import React, { useState, useEffect } from 'react';
import { Store, Star, Search, Mail, MapPin, TrendingUp, ChevronRight } from 'lucide-react';
import { apiRequest } from '../../api/client';
import { TableSortHeader } from '../../components/TableSortHeader';
import { StarRating } from '../../components/StarRating';

export function OwnerDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('DESC');
  const [loading, setLoading] = useState(true);

  const loadDashboard = async () => {
    try {
      const params = new URLSearchParams({
        sortBy,
        sortOrder,
      });
      if (search.trim()) params.append('search', search.trim());

      const data = await apiRequest(`/owner/dashboard?${params.toString()}`);
      setDashboardData(data);
    } catch (err) {
      console.error('Error fetching owner dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, [search, sortBy, sortOrder]);

  const handleSort = (field) => {
    if (sortBy.toLowerCase() === field.toLowerCase()) {
      setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortBy(field);
      setSortOrder('ASC');
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem', color: 'var(--text-dim)' }}>
        Loading store metrics...
      </div>
    );
  }

  if (!dashboardData || !dashboardData.hasStore) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '4rem 1.5rem', maxWidth: '580px', margin: '3rem auto' }}>
        <div style={{ width: '60px', height: '60px', background: 'var(--primary-light)', color: 'var(--primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem auto' }}>
          <Store size={30} />
        </div>
        <h2 style={{ marginBottom: '0.5rem', fontSize: '1.65rem' }}>No Store Linked Yet</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.925rem', lineHeight: '1.6' }}>
          Your profile holds the Store Owner role, but the System Administrator hasn't linked a registered store to your account yet.
          Please contact the administrator to assign your store.
        </p>
      </div>
    );
  }

  const { store, averageRating, totalRatings, ratings } = dashboardData;

  // Compute rating distribution breakdown (1-5 stars)
  const starCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  ratings.forEach((r) => {
    if (starCounts[r.rating] !== undefined) starCounts[r.rating]++;
  });

  return (
    <div>
      {/* Context Breadcrumbs */}
      <div className="context-bar">
        <div className="breadcrumbs">
          <span>Store Owner</span>
          <ChevronRight size={14} />
          <span>Analytics</span>
          <ChevronRight size={14} />
          <span className="current">{store.name}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-cinnamon)', fontSize: '0.8rem', fontWeight: 700 }}>
          <TrendingUp size={14} />
          <span>Store Performance Active</span>
        </div>
      </div>

      {/* Header Banner */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.1rem', marginBottom: '0.35rem' }}>Store Owner Portal</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          Real-time performance summary, overall customer score, and verified ratings for your store.
        </p>
      </div>

      {/* Top Cards Grid */}
      <div className="owner-overview-grid">
        {/* Store Profile Card */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '1.75rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.15rem' }}>
              <div style={{ width: '44px', height: '44px', background: 'var(--primary-light)', color: 'var(--primary)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Store size={24} />
              </div>
              <div>
                <span style={{ fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--primary)', fontWeight: 700 }}>
                  Registered Business
                </span>
                <h3 style={{ fontSize: '1.35rem' }}>{store.name}</h3>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Mail size={16} color="var(--primary)" />
                <span>{store.email}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
                <MapPin size={16} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span>{store.address}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Average Rating Score Card with Star Breakdown */}
        <div className="card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 700 }}>
                Average Store Rating
              </span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.25rem' }}>
                <span style={{ fontSize: '2.8rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: 'var(--text-main)', lineHeight: 1 }}>
                  {averageRating ? averageRating.toFixed(1) : '0.0'}
                </span>
                <span style={{ color: 'var(--text-dim)', fontSize: '1.1rem', fontWeight: 700 }}>/ 5.0</span>
              </div>
              <div style={{ marginTop: '0.35rem' }}>
                <StarRating rating={averageRating} size={20} />
              </div>
            </div>

            <div style={{ textAlign: 'right', background: '#f8f6f0', padding: '0.6rem 1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
              <div style={{ fontSize: '1.65rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1 }}>{totalRatings}</div>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                Total Reviews
              </span>
            </div>
          </div>

          {/* Star Distribution Visual Bars */}
          <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            {[5, 4, 3, 2, 1].map((star) => {
              const count = starCounts[star] || 0;
              const percent = totalRatings > 0 ? (count / totalRatings) * 100 : 0;
              return (
                <div key={star} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  <span style={{ width: '28px', fontWeight: 600 }}>{star} ★</span>
                  <div style={{ flex: 1, height: '6px', background: '#f0ece3', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${percent}%`, height: '100%', background: '#eab308', borderRadius: '3px', transition: 'width 0.4s ease' }} />
                  </div>
                  <span style={{ width: '20px', textAlign: 'right', color: 'var(--text-dim)' }}>{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Customer Ratings Table */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.3rem', marginBottom: '0.2rem' }}>Customer Ratings Log</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              Verified individual ratings and timestamps submitted by customers
            </p>
          </div>

          {/* Search reviewer */}
          <div style={{ position: 'relative', width: '280px' }}>
            <Search size={16} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '2.4rem', fontSize: '0.875rem' }}
              placeholder="Search customers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Table */}
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <TableSortHeader
                  label="Customer Name"
                  field="name"
                  currentSortBy={sortBy}
                  currentSortOrder={sortOrder}
                  onSort={handleSort}
                />
                <TableSortHeader
                  label="Email"
                  field="email"
                  currentSortBy={sortBy}
                  currentSortOrder={sortOrder}
                  onSort={handleSort}
                />
                <th>Address</th>
                <TableSortHeader
                  label="Submitted Rating"
                  field="rating"
                  currentSortBy={sortBy}
                  currentSortOrder={sortOrder}
                  onSort={handleSort}
                />
                <TableSortHeader
                  label="Date Submitted"
                  field="date"
                  currentSortBy={sortBy}
                  currentSortOrder={sortOrder}
                  onSort={handleSort}
                />
              </tr>
            </thead>
            <tbody>
              {ratings.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-dim)' }}>
                    No customer ratings found for this store yet.
                  </td>
                </tr>
              ) : (
                ratings.map((r) => (
                  <tr key={r.rating_id}>
                    <td style={{ fontWeight: 700, color: 'var(--text-main)' }}>{r.user_name}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{r.user_email}</td>
                    <td style={{ color: 'var(--text-muted)', maxWidth: '280px' }}>{r.user_address}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                        <StarRating rating={r.rating} size={15} />
                        <span style={{ fontWeight: 700, color: '#ca8a04', fontSize: '0.85rem' }}>
                          {r.rating} / 5
                        </span>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-dim)', fontSize: '0.825rem' }}>
                      {new Date(r.created_at).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
