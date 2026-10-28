import React, { useState } from 'react';
import { UserPlus, AlertCircle, Check, Store, ShieldCheck, HeartHandshake, Star } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function Signup({ onSwitchToLogin }) {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Real-time validations matching challenge specification
  const nameLen = formData.name.trim().length;
  const isNameValid = nameLen >= 20 && nameLen <= 60;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isEmailValid = emailRegex.test(formData.email.trim());

  const addressLen = formData.address.trim().length;
  const isAddressValid = addressLen > 0 && addressLen <= 400;

  const password = formData.password;
  const isPassLengthValid = password.length >= 8 && password.length <= 16;
  const isPassUpperValid = /[A-Z]/.test(password);
  const isPassSpecialValid = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  const isPasswordValid = isPassLengthValid && isPassUpperValid && isPassSpecialValid;

  const isConfirmValid = formData.password === formData.confirmPassword && formData.confirmPassword.length > 0;

  const isFormComplete = isNameValid && isEmailValid && isAddressValid && isPasswordValid && isConfirmValid;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!isNameValid) {
      setError('Name must be between 20 and 60 characters.');
      return;
    }
    if (!isEmailValid) {
      setError('Please provide a valid email address.');
      return;
    }
    if (!isAddressValid) {
      setError('Address is required and cannot exceed 400 characters.');
      return;
    }
    if (!isPasswordValid) {
      setError('Password must be 8-16 characters and contain at least one uppercase letter and one special character.');
      return;
    }
    if (!isConfirmValid) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setSubmitting(true);
      await register({
        name: formData.name,
        email: formData.email,
        address: formData.address,
        password: formData.password,
      });
    } catch (err) {
      setError(err.message || 'Failed to create account.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-split-wrapper">
      {/* Left Column: Community Onboarding Story */}
      <div className="auth-hero-pane">
        <div>
          <div className="auth-hero-badge">
            <Store size={15} />
            <span>Community Shopper Membership</span>
          </div>

          <h1 className="auth-hero-headline">
            Rate local stores with complete confidence.
          </h1>

          <p className="auth-hero-subtext">
            Join thousands of shoppers making neighborhood stores accountable through transparent, verified 1-to-5 star evaluations.
          </p>

          <div className="hero-features-list">
            <div className="hero-feature-item">
              <div className="hero-feature-icon">
                <Star size={18} />
              </div>
              <div>
                <strong style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-main)', marginBottom: '0.15rem' }}>
                  Your Voice Matters
                </strong>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Submit and modify your store ratings anytime as customer service evolves.
                </span>
              </div>
            </div>

            <div className="hero-feature-item">
              <div className="hero-feature-icon">
                <ShieldCheck size={18} />
              </div>
              <div>
                <strong style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-main)', marginBottom: '0.15rem' }}>
                  Authentic Community Only
                </strong>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Strict name and address criteria ensure genuine community reviews.
                </span>
              </div>
            </div>

            <div className="hero-feature-item">
              <div className="hero-feature-icon">
                <HeartHandshake size={18} />
              </div>
              <div>
                <strong style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-main)', marginBottom: '0.15rem' }}>
                  Support Quality Businesses
                </strong>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Help deserving local owners gain community recognition and new customers.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Community Trust Badge */}
        <div className="hero-quote-card">
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: '0.35rem' }}>
            Privacy & Trust Guarantee
          </span>
          <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
            Your account is secured with salted bcrypt password hashing and parameterized security protocols.
          </p>
        </div>
      </div>

      {/* Right Column: Clean Form Pane */}
      <div className="auth-form-pane">
        <div className="auth-form-card">
          <div style={{ marginBottom: '1.75rem' }}>
            <h2 style={{ fontSize: '1.85rem', marginBottom: '0.35rem', color: 'var(--text-main)' }}>
              Create User Account
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Fill in your details below to register as a Normal User
            </p>
          </div>

          {error && (
            <div className="alert alert-danger">
              <AlertCircle size={17} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Full Name */}
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="form-label">Full Name</label>
                <span style={{ fontSize: '0.76rem', color: isNameValid ? 'var(--success)' : 'var(--text-dim)', fontWeight: 600 }}>
                  {nameLen}/60 chars (min 20)
                </span>
              </div>
              <input
                type="text"
                name="name"
                className="form-input"
                placeholder="e.g. Ramesh Chandra Srivastava"
                value={formData.name}
                onChange={handleChange}
                required
              />
              <div className={`form-hint ${nameLen > 0 && !isNameValid ? 'error' : ''}`}>
                <span>Must be between 20 and 60 characters</span>
              </div>
            </div>

            {/* Email */}
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                name="email"
                className="form-input"
                placeholder="user@example.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            {/* Address */}
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="form-label">Full Physical Address</label>
                <span style={{ fontSize: '0.76rem', color: addressLen > 400 ? 'var(--danger)' : 'var(--text-dim)', fontWeight: 600 }}>
                  {addressLen}/400 chars
                </span>
              </div>
              <textarea
                name="address"
                className="form-textarea"
                placeholder="e.g. Flat 304, Green Glen Layout, Bellandur, Bengaluru - 560103"
                value={formData.address}
                onChange={handleChange}
                rows={2}
                required
              />
            </div>

            {/* Password & Confirm */}
            <div className="form-row-2col">
              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  name="password"
                  className="form-input"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  className="form-input"
                  placeholder="Confirm password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Live Criteria Checklist */}
            <div style={{ background: '#f8f6f0', border: '1px solid var(--border-light)', padding: '0.85rem', borderRadius: 'var(--radius-sm)', fontSize: '0.785rem', marginBottom: '1.4rem' }}>
              <div style={{ fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.35rem' }}>
                Password Security Requirements:
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(135px, 1fr))', gap: '0.35rem 0.75rem' }}>
                <span style={{ color: isPassLengthValid ? 'var(--success)' : 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 500, minWidth: 0 }}>
                  {isPassLengthValid ? <Check size={13} /> : '•'} 8–16 characters
                </span>
                <span style={{ color: isPassUpperValid ? 'var(--success)' : 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 500, minWidth: 0 }}>
                  {isPassUpperValid ? <Check size={13} /> : '•'} 1 uppercase letter
                </span>
                <span style={{ color: isPassSpecialValid ? 'var(--success)' : 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 500, minWidth: 0 }}>
                  {isPassSpecialValid ? <Check size={13} /> : '•'} 1 special char
                </span>
                <span style={{ color: isConfirmValid ? 'var(--success)' : 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 500, minWidth: 0 }}>
                  {isConfirmValid ? <Check size={13} /> : '•'} Passwords match
                </span>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.8rem', fontSize: '0.95rem' }}
              disabled={submitting || !isFormComplete}
            >
              <UserPlus size={18} />
              <span>{submitting ? 'Creating Account...' : 'Sign Up as Normal User'}</span>
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Already have an account?{' '}
            <button
              type="button"
              onClick={onSwitchToLogin}
              style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}
            >
              Sign in here
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
