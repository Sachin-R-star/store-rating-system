import React, { useState, useEffect } from 'react';
import { Users, Store, Star, Plus, Search, Shield, User, ShoppingBag, X, Check, AlertCircle, ChevronRight, Activity } from 'lucide-react';
import { apiRequest } from '../../api/client';
import { TableSortHeader } from '../../components/TableSortHeader';
import { StarRating } from '../../components/StarRating';

export function AdminDashboard() {
  const [stats, setStats] = useState({ totalUsers: 0, totalStores: 0, totalRatings: 0 });
  const [activeTab, setActiveTab] = useState('users'); // 'users' or 'stores'

  // Users state
  const [users, setUsers] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('');
  const [userSortBy, setUserSortBy] = useState('name');
  const [userSortOrder, setUserSortOrder] = useState('ASC');

  // Stores state
  const [stores, setStores] = useState([]);
  const [storeSearch, setStoreSearch] = useState('');
  const [storeSortBy, setStoreSortBy] = useState('name');
  const [storeSortOrder, setStoreSortOrder] = useState('ASC');

  // Modals state
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showAddStoreModal, setShowAddStoreModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadStats = async () => {
    try {
      const data = await apiRequest('/admin/dashboard');
      setStats(data);
    } catch (err) {
      console.error('Error fetching admin stats:', err);
    }
  };

  const loadUsers = async () => {
    try {
      const params = new URLSearchParams({
        sortBy: userSortBy,
        sortOrder: userSortOrder,
      });
      if (userSearch.trim()) params.append('search', userSearch.trim());
      if (userRoleFilter) params.append('role', userRoleFilter);

      const data = await apiRequest(`/admin/users?${params.toString()}`);
      setUsers(data);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const loadStores = async () => {
    try {
      const params = new URLSearchParams({
        sortBy: storeSortBy,
        sortOrder: storeSortOrder,
      });
      if (storeSearch.trim()) params.append('search', storeSearch.trim());

      const data = await apiRequest(`/admin/stores?${params.toString()}`);
      setStores(data);
    } catch (err) {
      console.error('Error fetching stores:', err);
    }
  };

  useEffect(() => {
    Promise.all([loadStats(), loadUsers(), loadStores()]).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadUsers();
  }, [userSearch, userRoleFilter, userSortBy, userSortOrder]);

  useEffect(() => {
    loadStores();
  }, [storeSearch, storeSortBy, storeSortOrder]);

  const handleUserSort = (field) => {
    if (userSortBy.toLowerCase() === field.toLowerCase()) {
      setUserSortOrder(userSortOrder === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setUserSortBy(field);
      setUserSortOrder('ASC');
    }
  };

  const handleStoreSort = (field) => {
    if (storeSortBy.toLowerCase() === field.toLowerCase()) {
      setStoreSortOrder(storeSortOrder === 'ASC' ? 'DESC' : 'ASC');
    } else {
      setStoreSortBy(field);
      setStoreSortOrder('ASC');
    }
  };

  return (
    <div>
      {/* Context Breadcrumbs */}
      <div className="context-bar">
        <div className="breadcrumbs">
          <span>Administrator</span>
          <ChevronRight size={14} />
          <span>Platform Overview</span>
          <ChevronRight size={14} />
          <span className="current">System Control Panel</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-plum)', fontSize: '0.8rem', fontWeight: 700 }}>
          <Shield size={14} />
          <span>Full Access Granted</span>
        </div>
      </div>

      {/* Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1.25rem' }}>
        <div>
          <h1 style={{ fontSize: '2.1rem', marginBottom: '0.25rem' }}>System Administration</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.925rem' }}>
            Central operations hub for user registries, store assignments, and submitted reviews
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-primary" onClick={() => setShowAddUserModal(true)}>
            <Plus size={16} />
            <span>Create User</span>
          </button>
          <button className="btn btn-secondary" onClick={() => setShowAddStoreModal(true)}>
            <Plus size={16} />
            <span>Register Store</span>
          </button>
        </div>
      </div>

      {/* Integrated Executive Metric Ribbon */}
      <div className="metric-ribbon">
        <div
          className="ribbon-cell"
          onClick={() => setActiveTab('users')}
          style={{ cursor: 'pointer', transition: 'transform 0.15s ease' }}
          title="Click to view Users Directory"
        >
          <div className="ribbon-icon-box" style={{ background: 'var(--accent-plum-bg)', color: 'var(--accent-plum)' }}>
            <Users size={22} />
          </div>
          <div className="ribbon-data">
            <h5>Registered Users</h5>
            <div className="ribbon-num">{stats.totalUsers}</div>
          </div>
        </div>

        <div
          className="ribbon-cell"
          onClick={() => setActiveTab('stores')}
          style={{ cursor: 'pointer', transition: 'transform 0.15s ease' }}
          title="Click to view Stores Directory"
        >
          <div className="ribbon-icon-box" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
            <Store size={22} />
          </div>
          <div className="ribbon-data">
            <h5>Active Stores ({stores.length})</h5>
            <div className="ribbon-num">{stats.totalStores}</div>
          </div>
        </div>

        <div className="ribbon-cell">
          <div className="ribbon-icon-box" style={{ background: 'var(--accent-cinnamon-bg)', color: 'var(--accent-cinnamon)' }}>
            <Star size={22} />
          </div>
          <div className="ribbon-data">
            <h5>Total Ratings Logged</h5>
            <div className="ribbon-num">{stats.totalRatings}</div>
          </div>
        </div>
      </div>

      {/* Segmented View Tabs */}
      <div className="tabs-header">
        <button
          className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          Users Management ({users.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'stores' ? 'active' : ''}`}
          onClick={() => setActiveTab('stores')}
        >
          Stores Directory ({stores.length})
        </button>
      </div>

      {/* Tab 1: Users View */}
      {activeTab === 'users' && (
        <div className="card" style={{ padding: '1.5rem' }}>
          {/* Filter Bar */}
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: '0.85rem', flex: 1, minWidth: 'min(100%, 280px)', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Search size={16} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                <input
                  type="text"
                  className="form-input"
                  style={{ paddingLeft: '2.5rem' }}
                  placeholder="Filter users by name, email, or address..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                />
              </div>

              <select
                className="form-select"
                style={{ width: 'auto', minWidth: '170px' }}
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
              >
                <option value="">All Roles</option>
                <option value="ADMIN">System Admins</option>
                <option value="USER">Normal Users</option>
                <option value="STORE_OWNER">Store Owners</option>
              </select>
            </div>
          </div>

          {/* Users Table */}
          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <TableSortHeader
                    label="User Name"
                    field="name"
                    currentSortBy={userSortBy}
                    currentSortOrder={userSortOrder}
                    onSort={handleUserSort}
                  />
                  <TableSortHeader
                    label="Email Address"
                    field="email"
                    currentSortBy={userSortBy}
                    currentSortOrder={userSortOrder}
                    onSort={handleUserSort}
                  />
                  <TableSortHeader
                    label="Address"
                    field="address"
                    currentSortBy={userSortBy}
                    currentSortOrder={userSortOrder}
                    onSort={handleUserSort}
                  />
                  <TableSortHeader
                    label="Role"
                    field="role"
                    currentSortBy={userSortBy}
                    currentSortOrder={userSortOrder}
                    onSort={handleUserSort}
                  />
                  <th>Store Rating (If Owner)</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-dim)' }}>
                      No users match the current search or filter criteria.
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u.id}>
                      <td style={{ fontWeight: 700, color: 'var(--text-main)' }}>{u.name}</td>
                      <td style={{ color: 'var(--text-muted)' }}>{u.email}</td>
                      <td style={{ maxWidth: '280px', color: 'var(--text-muted)' }}>{u.address}</td>
                      <td>
                        <span className={`badge-role ${u.role}`}>
                          {u.role === 'ADMIN' && <Shield size={12} />}
                          {u.role === 'STORE_OWNER' && <Store size={12} />}
                          {u.role === 'USER' && <User size={12} />}
                          {u.role === 'ADMIN' ? 'Admin' : u.role === 'STORE_OWNER' ? 'Store Owner' : 'Normal User'}
                        </span>
                      </td>
                      <td>
                        {u.role === 'STORE_OWNER' ? (
                          u.store_rating ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                              <StarRating rating={u.store_rating} size={15} />
                              <span style={{ fontWeight: 700, color: '#ca8a04', fontSize: '0.85rem' }}>
                                {u.store_rating} / 5
                              </span>
                              <span style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>
                                ({u.store_rating_count} reviews)
                              </span>
                            </div>
                          ) : (
                            <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem', fontStyle: 'italic' }}>
                              {u.store_name ? 'No ratings yet' : 'No store assigned'}
                            </span>
                          )
                        ) : (
                          <span style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>—</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Stores View */}
      {activeTab === 'stores' && (
        <div className="card" style={{ padding: '1.5rem' }}>
          <div style={{ marginBottom: '1.5rem', position: 'relative', maxWidth: '420px' }}>
            <Search size={16} style={{ position: 'absolute', left: '0.9rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '2.5rem' }}
              placeholder="Filter stores by name, email, or address..."
              value={storeSearch}
              onChange={(e) => setStoreSearch(e.target.value)}
            />
          </div>

          <div className="table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <TableSortHeader
                    label="Store Name"
                    field="name"
                    currentSortBy={storeSortBy}
                    currentSortOrder={storeSortOrder}
                    onSort={handleStoreSort}
                  />
                  <TableSortHeader
                    label="Email"
                    field="email"
                    currentSortBy={storeSortBy}
                    currentSortOrder={storeSortOrder}
                    onSort={handleStoreSort}
                  />
                  <TableSortHeader
                    label="Address"
                    field="address"
                    currentSortBy={storeSortBy}
                    currentSortOrder={storeSortOrder}
                    onSort={handleStoreSort}
                  />
                  <th>Assigned Owner</th>
                  <TableSortHeader
                    label="Overall Rating"
                    field="rating"
                    currentSortBy={storeSortBy}
                    currentSortOrder={storeSortOrder}
                    onSort={handleStoreSort}
                  />
                </tr>
              </thead>
              <tbody>
                {stores.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-dim)' }}>
                      No stores found matching your query.
                    </td>
                  </tr>
                ) : (
                  stores.map((s) => (
                    <tr key={s.id}>
                      <td style={{ fontWeight: 700, color: 'var(--text-main)' }}>{s.name}</td>
                      <td style={{ color: 'var(--text-muted)' }}>{s.email}</td>
                      <td style={{ color: 'var(--text-muted)' }}>{s.address}</td>
                      <td>
                        {s.owner_name ? (
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-main)' }}>{s.owner_name}</span>
                            <span style={{ fontSize: '0.74rem', color: 'var(--text-dim)' }}>{s.owner_email}</span>
                          </div>
                        ) : (
                          <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem', fontStyle: 'italic' }}>Unassigned</span>
                        )}
                      </td>
                      <td>
                        {s.rating ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <StarRating rating={s.rating} size={15} />
                            <span style={{ fontWeight: 700, color: '#ca8a04', fontSize: '0.85rem' }}>
                              {s.rating}
                            </span>
                            <span style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>
                              ({s.rating_count} reviews)
                            </span>
                          </div>
                        ) : (
                          <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem', fontStyle: 'italic' }}>No ratings yet</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAddUserModal && (
        <AddUserModal
          isOpen={showAddUserModal}
          onClose={() => setShowAddUserModal(false)}
          onSuccess={() => {
            loadUsers();
            loadStats();
          }}
        />
      )}

      {/* Add Store Modal */}
      {showAddStoreModal && (
        <AddStoreModal
          isOpen={showAddStoreModal}
          owners={users.filter((u) => u.role === 'STORE_OWNER')}
          onClose={() => setShowAddStoreModal(false)}
          onSuccess={() => {
            loadStores();
            loadStats();
          }}
        />
      )}
    </div>
  );
}

function AddUserModal({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    address: '',
    role: 'USER',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const nameLen = formData.name.trim().length;
  const isNameValid = nameLen >= 20 && nameLen <= 60;
  const isAddressValid = formData.address.trim().length > 0 && formData.address.trim().length <= 400;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      setSubmitting(true);
      await apiRequest('/admin/users', {
        method: 'POST',
        body: formData,
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Error adding new user.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Create User Account</h3>
          <button className="modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && (
              <div className="alert alert-danger">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Role</label>
              <select
                className="form-select"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              >
                <option value="USER">Normal User</option>
                <option value="ADMIN">System Administrator</option>
                <option value="STORE_OWNER">Store Owner</option>
              </select>
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <label className="form-label">Full Name</label>
                <span style={{ fontSize: '0.75rem', color: isNameValid ? 'var(--success)' : 'var(--text-dim)', fontWeight: 600 }}>
                  {nameLen}/60 (min 20)
                </span>
              </div>
              <input
                type="text"
                className="form-input"
                placeholder="Full Name (20 to 60 characters)"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-input"
                placeholder="user@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="8-16 chars, 1 uppercase, 1 special character"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <label className="form-label">Address</label>
                <span style={{ fontSize: '0.75rem', color: isAddressValid ? 'var(--text-dim)' : 'var(--danger)', fontWeight: 600 }}>
                  Max 400 chars
                </span>
              </div>
              <textarea
                className="form-textarea"
                placeholder="Physical address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                rows={2}
                required
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AddStoreModal({ isOpen, owners, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    ownerId: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      setSubmitting(true);
      await apiRequest('/admin/stores', {
        method: 'POST',
        body: {
          ...formData,
          ownerId: formData.ownerId ? Number(formData.ownerId) : null,
        },
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Error creating store.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Register New Store</h3>
          <button className="modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {error && (
              <div className="alert alert-danger">
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Store Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Artisanal Market Central"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Contact Email</label>
              <input
                type="email"
                className="form-input"
                placeholder="contact@storename.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Store Address (max 400 chars)</label>
              <textarea
                className="form-textarea"
                placeholder="Full street address and city"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                rows={2}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Assign Store Owner (Optional)</label>
              <select
                className="form-select"
                value={formData.ownerId}
                onChange={(e) => setFormData({ ...formData, ownerId: e.target.value })}
              >
                <option value="">-- No Owner Assigned --</option>
                {owners.map((owner) => (
                  <option key={owner.id} value={owner.id}>
                    {owner.name} ({owner.email})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Registering...' : 'Register Store'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
