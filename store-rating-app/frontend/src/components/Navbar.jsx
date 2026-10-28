import React, { useState, useEffect, useRef } from 'react';
import { Store, LogOut, Key, User, Shield, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UpdatePasswordModal } from './UpdatePasswordModal';

export function Navbar() {
  const { user, logout } = useAuth();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [menuOpen]);

  if (!user) return null;

  const roleLabels = {
    ADMIN: 'System Admin',
    STORE_OWNER: 'Store Owner',
    USER: 'Normal User',
  };

  return (
    <>
      <header className="navbar">
        <div className="nav-container">
          <div className="brand-logo">
            <div className="brand-icon">
              <Store size={22} />
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span>StoreRate</span>
              <span className="brand-tag">Community</span>
            </div>
          </div>

          <div className="nav-user-actions">
            <div className="user-profile-badge">
              <div className="avatar-circle">
                {user.role === 'ADMIN' ? (
                  <Shield size={15} />
                ) : (
                  user.name ? user.name.charAt(0).toUpperCase() : 'U'
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span className="user-name-text" style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-main)' }}>
                  {user.name}
                </span>
                <span style={{ fontSize: '0.73rem', color: 'var(--text-dim)' }}>
                  {user.email}
                </span>
              </div>
              <span className={`badge-role ${user.role}`}>
                {user.role === 'ADMIN' && <Shield size={12} />}
                {user.role === 'STORE_OWNER' && <Store size={12} />}
                {user.role === 'USER' && <User size={12} />}
                {roleLabels[user.role] || user.role}
              </span>
            </div>

            <div className="nav-dropdown-wrapper" ref={menuRef}>
              <button
                type="button"
                className={`nav-account-btn ${menuOpen ? 'open' : ''}`}
                onClick={() => setMenuOpen(!menuOpen)}
                aria-expanded={menuOpen}
                title="Password & Security Options"
              >
                <Shield size={14} color="var(--primary)" />
                <span className="btn-label">Password & Security</span>
                <ChevronDown size={14} className="chevron-icon" />
              </button>

              {menuOpen && (
                <div className="nav-dropdown-menu">
                  <div className="nav-dropdown-header">
                    <div className="nav-dropdown-user-name">{user.name}</div>
                    <div className="nav-dropdown-user-email">{user.email}</div>
                    <span className={`badge-role ${user.role}`}>
                      {user.role === 'ADMIN' && <Shield size={11} />}
                      {user.role === 'STORE_OWNER' && <Store size={11} />}
                      {user.role === 'USER' && <User size={11} />}
                      {roleLabels[user.role] || user.role}
                    </span>
                  </div>

                  <button
                    type="button"
                    className="nav-dropdown-item"
                    onClick={() => {
                      setMenuOpen(false);
                      setShowPasswordModal(true);
                    }}
                  >
                    <Key size={15} color="var(--primary)" />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span>Change Password</span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)', fontWeight: 400 }}>
                        Update security credentials
                      </span>
                    </div>
                  </button>

                  <div className="nav-dropdown-divider" />

                  <button
                    type="button"
                    className="nav-dropdown-item danger"
                    onClick={() => {
                      setMenuOpen(false);
                      logout();
                    }}
                  >
                    <LogOut size={15} />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <UpdatePasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
      />
    </>
  );
}
