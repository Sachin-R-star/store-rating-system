import React, { useState } from 'react';
import { X, Key, Check, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function UpdatePasswordModal({ isOpen, onClose }) {
  const { updatePassword } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  // Validation checks: 8-16 chars, 1 uppercase, 1 special character
  const hasValidLength = newPassword.length >= 8 && newPassword.length <= 16;
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword);
  const isFormValid = hasValidLength && hasUppercase && hasSpecialChar && newPassword === confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    if (!hasValidLength || !hasUppercase || !hasSpecialChar) {
      setError('Password must meet all requirement criteria listed below.');
      return;
    }

    try {
      setSubmitting(true);
      await updatePassword(currentPassword, newPassword);
      setSuccess('Your password has been updated successfully!');
      setTimeout(() => {
        onClose();
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setSuccess('');
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to update password.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ padding: '0.4rem', background: 'var(--primary-light)', borderRadius: 'var(--radius-xs)', color: 'var(--primary)' }}>
              <Key size={18} />
            </div>
            <h3>Change Password</h3>
          </div>
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
            {success && (
              <div className="alert alert-success">
                <Check size={16} />
                <span>{success}</span>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Current Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="Enter current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">New Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="Re-type new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            {/* Password Criteria Checklist */}
            <div style={{ background: '#f8f6f0', border: '1px solid var(--border-light)', padding: '0.9rem', borderRadius: 'var(--radius-sm)', fontSize: '0.8rem' }}>
              <div style={{ fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.45rem' }}>
                Password Security Requirements:
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <span style={{ color: hasValidLength ? 'var(--success)' : 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 500 }}>
                  {hasValidLength ? <Check size={14} /> : '•'} 8 to 16 characters in length
                </span>
                <span style={{ color: hasUppercase ? 'var(--success)' : 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 500 }}>
                  {hasUppercase ? <Check size={14} /> : '•'} At least 1 uppercase letter (A-Z)
                </span>
                <span style={{ color: hasSpecialChar ? 'var(--success)' : 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 500 }}>
                  {hasSpecialChar ? <Check size={14} /> : '•'} At least 1 special character (!@#$%^&*...)
                </span>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting || !isFormValid || !currentPassword}>
              {submitting ? 'Updating...' : 'Save New Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
