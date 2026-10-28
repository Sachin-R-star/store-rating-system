import React, { useState, useEffect } from 'react';
import { Search, Star, Edit3, MapPin, LayoutGrid, List, Check, Sparkles, X, AlertCircle, ChevronRight, Store, Mail, Phone, ExternalLink } from 'lucide-react';
import { apiRequest } from '../../api/client';
import { TableSortHeader } from '../../components/TableSortHeader';
import { StarRating } from '../../components/StarRating';

export function UserDashboard() {
  const [stores, setStores] = useState([]);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('ASC');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'
  const [filterPill, setFilterPill] = useState('all'); // 'all', 'top', 'rated', 'unrated'
  const [loading, setLoading] = useState(true);

  // Master-Detail slide-over drawer state
  const [selectedStore, setSelectedStore] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [ratingValue, setRatingValue] = useState(5);
  const [ratingSubmitting, setRatingSubmitting] = useState(false);
  const [drawerMsg, setDrawerMsg] = useState({ type: '', text: '' });

  const loadStores = async () => {
    try {
      const params = new URLSearchParams({
        sortBy,
        sortOrder,
      });
      if (search.trim()) params.append('search', search.trim());

      const data = await apiRequest(`/stores?${params.toString()}`);
      setStores(data);

      // If a store is currently open in drawer, update its details
      if (selectedStore) {
        const updated = data.find((s) => s.id === selectedStore.id);
        if (updated) {
          setSelectedStore(updated);
          setRatingValue(updated.user_rating || 5);
        }
      }
    } catch (err) {
      console.error('Error fetching stores:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStores();
  }, [search, sortBy, sortOrder]);

  const handleSort = (field) => {
    if (sortBy.toLowerCase() === field.toLowerCase()) {
      setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setSortBy(field);
      setSortOrder('ASC');
    }
  };

  // Open store slide-over detail drawer
  const openStoreDrawer = (store) => {
    setSelectedStore(store);
    setRatingValue(store.user_rating || 5);
    setDrawerMsg({ type: '', text: '' });
    setDrawerOpen(true);
  };

  const closeStoreDrawer = () => {
    setDrawerOpen(false);
    setDrawerMsg({ type: '', text: '' });
  };

  // Submit rating from inside the Master-Detail drawer
  const handleDrawerSubmitRating = async () => {
    if (!selectedStore) return;
    setRatingSubmitting(true);
    setDrawerMsg({ type: '', text: '' });

    try {
      await apiRequest('/ratings', {
        method: 'POST',
        body: {
          storeId: selectedStore.id,
          rating: ratingValue,
        },
      });
      setDrawerMsg({
        type: 'success',
        text: `Rating of ${ratingValue} ★ submitted successfully!`,
      });
      await loadStores();
    } catch (err) {
      setDrawerMsg({
        type: 'danger',
        text: err.message || 'Failed to submit rating.',
      });
    } finally {
      setRatingSubmitting(false);
    }
  };

  // Quick filter pills logic
  const filteredStores = stores.filter((store) => {
    if (filterPill === 'top') {
      return Number(store.overall_rating) >= 4.0;
    }
    if (filterPill === 'rated') {
      return store.user_rating !== null && store.user_rating !== undefined;
    }
    if (filterPill === 'unrated') {
      return store.user_rating === null || store.user_rating === undefined;
    }
    return true;
  });

  return (
    <div>
      {/* Breadcrumb Context Bar */}
      <div className="context-bar">
        <div className="breadcrumbs">
          <span>Community</span>
          <ChevronRight size={14} />
          <span>Stores</span>
          <ChevronRight size={14} />
          <span className="current">Store Explorer</span>
        </div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontWeight: 600 }}>
          {stores.length} Registered Locations
        </div>
      </div>

      {/* Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2.1rem', marginBottom: '0.35rem' }}>Local Store Directory</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.925rem', maxWidth: '640px' }}>
            Click on any store to inspect verified details and submit or adjust your personal rating in the side panel.
          </p>
        </div>

        {/* View Switcher: Grid vs Table */}
        <div className="view-switcher">
          <button
            type="button"
            className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
            onClick={() => setViewMode('grid')}
            title="Card Grid View"
          >
            <LayoutGrid size={15} />
            <span>Cards</span>
          </button>
          <button
            type="button"
            className={`view-btn ${viewMode === 'table' ? 'active' : ''}`}
            onClick={() => setViewMode('table')}
            title="Tabular View"
          >
            <List size={15} />
            <span>Table</span>
          </button>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="card" style={{ padding: '1.25rem 1.5rem', marginBottom: '1.75rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          {/* Search by Store Name and Address */}
          <div className="search-input-wrapper">
            <Search size={17} style={{ position: 'absolute', left: '0.95rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '2.6rem' }}
              placeholder="Search stores by Name or Address..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                style={{ position: 'absolute', right: '0.85rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}
              >
                <X size={15} />
              </button>
            )}
          </div>

          {/* Quick Filter Pills */}
          <div className="filter-pills" style={{ margin: 0 }}>
            <button
              type="button"
              className={`filter-pill ${filterPill === 'all' ? 'active' : ''}`}
              onClick={() => setFilterPill('all')}
            >
              All ({stores.length})
            </button>
            <button
              type="button"
              className={`filter-pill ${filterPill === 'top' ? 'active' : ''}`}
              onClick={() => setFilterPill('top')}
            >
              Top Rated (4.0+ ★)
            </button>
            <button
              type="button"
              className={`filter-pill ${filterPill === 'rated' ? 'active' : ''}`}
              onClick={() => setFilterPill('rated')}
            >
              Rated by Me
            </button>
            <button
              type="button"
              className={`filter-pill ${filterPill === 'unrated' ? 'active' : ''}`}
              onClick={() => setFilterPill('unrated')}
            >
              Unrated
            </button>
          </div>
        </div>
      </div>

      {/* Main Content: Store Cards or Table */}
      {filteredStores.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem' }}>
          <p style={{ color: 'var(--text-dim)', fontSize: '1rem', marginBottom: '0.75rem' }}>
            No registered stores match your search query or filter.
          </p>
          <button type="button" className="btn btn-secondary btn-sm" onClick={() => { setSearch(''); setFilterPill('all'); }}>
            Reset Filters
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* Store Cards Grid with Interactive Drawer Trigger */
        <div className="store-grid">
          {filteredStores.map((store) => {
            const hasUserRated = store.user_rating !== null && store.user_rating !== undefined;
            return (
              <div
                key={store.id}
                className="store-card"
                onClick={() => openStoreDrawer(store)}
                style={{ cursor: 'pointer' }}
              >
                <div>
                  <div className="store-card-header">
                    <h3 className="store-title">{store.name}</h3>
                    {hasUserRated && (
                      <span className="rating-badge" title="Your submitted rating">
                        <Star size={13} fill="currentColor" />
                        <span>You: {store.user_rating}★</span>
                      </span>
                    )}
                  </div>

                  <div className="store-address">
                    <MapPin size={15} style={{ flexShrink: 0, marginTop: '2px', color: 'var(--primary)' }} />
                    <span>{store.address}</span>
                  </div>
                </div>

                <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
                  <div>
                    {store.overall_rating ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                        <StarRating rating={store.overall_rating} size={15} />
                        <span style={{ fontWeight: 800, color: 'var(--text-main)', fontSize: '0.9rem' }}>
                          {store.overall_rating}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                          ({store.total_ratings})
                        </span>
                      </div>
                    ) : (
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontStyle: 'italic' }}>
                        No reviews yet
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    className={`btn btn-sm ${hasUserRated ? 'btn-secondary' : 'btn-primary'}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      openStoreDrawer(store);
                    }}
                  >
                    {hasUserRated ? (
                      <>
                        <Edit3 size={13} />
                        <span>Inspect & Modify</span>
                      </>
                    ) : (
                      <>
                        <Star size={13} />
                        <span>Rate Store</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Detailed Table View with Sorting */
        <div className="card" style={{ padding: '1.25rem' }}>
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <TableSortHeader
                    label="Store Name"
                    field="name"
                    currentSortBy={sortBy}
                    currentSortOrder={sortOrder}
                    onSort={handleSort}
                  />
                  <TableSortHeader
                    label="Address"
                    field="address"
                    currentSortBy={sortBy}
                    currentSortOrder={sortOrder}
                    onSort={handleSort}
                  />
                  <TableSortHeader
                    label="Overall Rating"
                    field="overall_rating"
                    currentSortBy={sortBy}
                    currentSortOrder={sortOrder}
                    onSort={handleSort}
                  />
                  <TableSortHeader
                    label="Your Submitted Rating"
                    field="user_rating"
                    currentSortBy={sortBy}
                    currentSortOrder={sortOrder}
                    onSort={handleSort}
                  />
                  <th style={{ textAlign: 'center' }}>Details & Rate</th>
                </tr>
              </thead>
              <tbody>
                {filteredStores.map((store) => {
                  const hasUserRated = store.user_rating !== null && store.user_rating !== undefined;
                  return (
                    <tr
                      key={store.id}
                      onClick={() => openStoreDrawer(store)}
                      style={{ cursor: 'pointer' }}
                    >
                      <td style={{ fontWeight: 700, color: 'var(--text-main)' }}>{store.name}</td>
                      <td style={{ color: 'var(--text-muted)', maxWidth: '320px' }}>{store.address}</td>
                      <td>
                        {store.overall_rating ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                            <StarRating rating={store.overall_rating} size={15} />
                            <span style={{ fontWeight: 700, color: '#ca8a04', fontSize: '0.85rem' }}>
                              {store.overall_rating}
                            </span>
                            <span style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>
                              ({store.total_ratings})
                            </span>
                          </div>
                        ) : (
                          <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem', fontStyle: 'italic' }}>No reviews</span>
                        )}
                      </td>
                      <td>
                        {hasUserRated ? (
                          <span className="rating-badge">
                            <Star size={13} fill="currentColor" />
                            <span>{store.user_rating} / 5</span>
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem', fontStyle: 'italic' }}>
                            Not rated yet
                          </span>
                        )}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          className={`btn btn-sm ${hasUserRated ? 'btn-secondary' : 'btn-primary'}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            openStoreDrawer(store);
                          }}
                        >
                          {hasUserRated ? (
                            <>
                              <Edit3 size={13} />
                              <span>Modify</span>
                            </>
                          ) : (
                            <>
                              <Star size={13} />
                              <span>Rate</span>
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================
          MASTER-DETAIL SLIDE-OVER DRAWER
          Opens on store click to inspect info and submit ratings
          ======================================================== */}
      {drawerOpen && selectedStore && (
        <div className="drawer-backdrop" onClick={closeStoreDrawer}>
          <div className="detail-drawer" onClick={(e) => e.stopPropagation()}>
            {/* Drawer Header */}
            <div className="drawer-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div style={{ width: '38px', height: '38px', background: 'var(--primary-light)', color: 'var(--primary)', borderRadius: 'var(--radius-xs)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Store size={20} />
                </div>
                <div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Store Details & Rating
                  </span>
                  <h3 style={{ fontSize: '1.25rem', color: 'var(--text-main)', margin: 0 }}>
                    {selectedStore.name}
                  </h3>
                </div>
              </div>
              <button
                type="button"
                className="modal-close"
                onClick={closeStoreDrawer}
                title="Close drawer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Drawer Body */}
            <div className="drawer-body">
              {drawerMsg.text && (
                <div className={`alert alert-${drawerMsg.type}`}>
                  {drawerMsg.type === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
                  <span>{drawerMsg.text}</span>
                </div>
              )}

              {/* Store Location Card */}
              <div style={{ background: '#f8f6f0', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-sm)', padding: '1.25rem', marginBottom: '1.5rem' }}>
                <span style={{ fontSize: '0.74rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700, display: 'block', marginBottom: '0.5rem' }}>
                  Store Information
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.875rem' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
                    <MapPin size={16} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                    <span style={{ color: 'var(--text-main)' }}>{selectedStore.address}</span>
                  </div>
                  {selectedStore.email && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <Mail size={16} color="var(--primary)" />
                      <span style={{ color: 'var(--text-muted)' }}>{selectedStore.email}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Overall Community Rating Card */}
              <div style={{ background: '#ffffff', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-sm)', padding: '1.35rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: 'var(--shadow-sm)' }}>
                <div>
                  <span style={{ fontSize: '0.74rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>
                    Overall Rating
                  </span>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.45rem', marginTop: '0.2rem' }}>
                    <span style={{ fontSize: '2.4rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: 'var(--text-main)', lineHeight: 1 }}>
                      {selectedStore.overall_rating ? Number(selectedStore.overall_rating).toFixed(1) : '0.0'}
                    </span>
                    <span style={{ color: 'var(--text-dim)', fontSize: '0.95rem', fontWeight: 600 }}>/ 5.0</span>
                  </div>
                  <div style={{ marginTop: '0.35rem' }}>
                    <StarRating rating={selectedStore.overall_rating} size={16} />
                  </div>
                </div>

                <div style={{ textAlign: 'right', borderLeft: '1px solid var(--border-light)', paddingLeft: '1.25rem' }}>
                  <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-main)' }}>
                    {selectedStore.total_ratings || 0}
                  </div>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 600 }}>
                    Total Reviews
                  </span>
                </div>
              </div>

              {/* Interactive Rating Area Embedded in Drawer */}
              <div style={{ background: '#ffffff', border: '2px solid var(--primary-border)', borderRadius: 'var(--radius-md)', padding: '1.5rem', textAlign: 'center', boxShadow: 'var(--shadow-sm)' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-main)', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 800, display: 'block', marginBottom: '0.25rem' }}>
                  {selectedStore.user_rating ? 'Your Registered Rating' : 'Rate This Store (1 to 5 Stars)'}
                </span>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.825rem', marginBottom: '0.75rem' }}>
                  {selectedStore.user_rating
                    ? `You previously rated this store ${selectedStore.user_rating} ★. You can change your rating below.`
                    : 'Tap a star below to submit your rating.'}
                </p>

                {/* Tactile Star Selector */}
                <StarRating
                  rating={ratingValue}
                  interactive={true}
                  size={38}
                  onRate={(val) => setRatingValue(val)}
                />

                <button
                  type="button"
                  className="btn btn-primary"
                  style={{ width: '100%', marginTop: '1.25rem', padding: '0.75rem' }}
                  onClick={handleDrawerSubmitRating}
                  disabled={ratingSubmitting || !ratingValue}
                >
                  <Star size={16} />
                  <span>
                    {ratingSubmitting
                      ? 'Saving...'
                      : selectedStore.user_rating
                      ? 'Update My Rating'
                      : 'Submit Rating'}
                  </span>
                </button>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="drawer-footer">
              <button type="button" className="btn btn-secondary btn-sm" onClick={closeStoreDrawer}>
                Close Panel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
