import React, { useState } from 'react';
import { Store, LogIn, AlertCircle, Shield, User, ShoppingBag, Sparkles, CheckCircle2, Award, HeartHandshake } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function Login({ onSwitchToRegister }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    try {
      setSubmitting(true);
      await login(email, password);
    } catch (err) {
      setError(err.message || 'Login failed. Please verify your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickDemoLogin = async (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
    try {
      setSubmitting(true);
      await login(demoEmail, demoPassword);
    } catch (err) {
      setError(err.message || 'Login failed. Please verify your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-split-wrapper">
      {/* Left Column: Artisanal Story & Platform Highlights */}
      <div className="auth-hero-pane">
        <div>
          <div className="auth-hero-badge">
            <Store size={15} />
            <span>Community Verified Stores</span>
          </div>

          <h1 className="auth-hero-headline">
            Honest ratings for neighborhood shops.
          </h1>

          <p className="auth-hero-subtext">
            StoreRate connects shoppers with local businesses through a reliable 1-to-5 star evaluation system with zero sponsored bias.
          </p>

          <div className="hero-features-list">
            <div className="hero-feature-item">
              <div className="hero-feature-icon">
                <CheckCircle2 size={18} />
              </div>
              <div>
                <strong style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-main)', marginBottom: '0.15rem' }}>
                  Verified 1 to 5 Star Reviews
                </strong>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Each customer can submit and modify authentic ratings for registered shops.
                </span>
              </div>
            </div>

            <div className="hero-feature-item">
              <div className="hero-feature-icon">
                <Award size={18} />
              </div>
              <div>
                <strong style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-main)', marginBottom: '0.15rem' }}>
                  Dedicated Role Portals
                </strong>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Tailored dashboards for System Administrators, Store Owners, and Normal Users.
                </span>
              </div>
            </div>

            <div className="hero-feature-item">
              <div className="hero-feature-icon">
                <HeartHandshake size={18} />
              </div>
              <div>
                <strong style={{ display: 'block', fontSize: '0.9rem', color: 'var(--text-main)', marginBottom: '0.15rem' }}>
                  Transparent Shop Performance
                </strong>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Store owners access instant customer feedback and rating distribution analytics.
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tactile Review Quote Card */}
        <div className="hero-quote-card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: 'var(--star-gold)', marginBottom: '0.45rem' }}>
            {'★'.repeat(5)}
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-main)', fontStyle: 'italic', marginBottom: '0.5rem' }}>
            "The easiest way to check how local stores treat their customers before visiting."
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 700 }}>
              S
            </div>
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              Verified Shopper · Community Member
            </span>
          </div>
        </div>
      </div>

      {/* Right Column: Clean Form Pane */}
      <div className="auth-form-pane">
        <div className="auth-form-card">
          <div style={{ marginBottom: '1.75rem' }}>
            <h2 style={{ fontSize: '1.85rem', marginBottom: '0.35rem', color: 'var(--text-main)' }}>
              Sign in to your account
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Select a demo role below or enter your credentials
            </p>
          </div>

          {error && (
            <div className="alert alert-danger">
              <AlertCircle size={17} />
              <span>{error}</span>
            </div>
          )}

          {/* Quick 1-Click Role Switcher */}
          <div style={{ background: '#f8f6f0', border: '1px solid var(--border-light)', padding: '1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.5rem' }}>
            <span style={{ fontSize: '0.74rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 700, display: 'block', marginBottom: '0.65rem' }}>
              One-Click Demo Access
            </span>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(95px, 1fr))', gap: '0.5rem' }}>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                disabled={submitting}
                onClick={() => handleQuickDemoLogin('admin.rajesh@storerating.in', 'Admin@1234')}
                style={{ fontSize: '0.78rem', padding: '0.55rem 0.2rem', borderColor: 'var(--accent-plum-border)', background: 'var(--accent-plum-bg)' }}
              >
                <Shield size={13} color="var(--accent-plum)" />
                <span style={{ color: 'var(--accent-plum)', fontWeight: 700 }}>Admin</span>
              </button>

              <button
                type="button"
                className="btn btn-secondary btn-sm"
                disabled={submitting}
                onClick={() => handleQuickDemoLogin('owner.vikram@kiranamart.in', 'Owner@1234')}
                style={{ fontSize: '0.78rem', padding: '0.55rem 0.2rem', borderColor: 'var(--accent-cinnamon-border)', background: 'var(--accent-cinnamon-bg)' }}
              >
                <ShoppingBag size={13} color="var(--accent-cinnamon)" />
                <span style={{ color: 'var(--accent-cinnamon)', fontWeight: 700 }}>Store Owner</span>
              </button>

              <button
                type="button"
                className="btn btn-secondary btn-sm"
                disabled={submitting}
                onClick={() => handleQuickDemoLogin('ananya.venkatesh@gmail.com', 'User@1234')}
                style={{ fontSize: '0.78rem', padding: '0.55rem 0.2rem', borderColor: 'var(--accent-olive-border)', background: 'var(--accent-olive-bg)' }}
              >
                <User size={13} color="var(--accent-olive)" />
                <span style={{ color: 'var(--accent-olive)', fontWeight: 700 }}>Shopper</span>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-input"
                placeholder="user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.8rem', fontSize: '0.95rem' }}
              disabled={submitting}
            >
              <LogIn size={18} />
              <span>{submitting ? 'Authenticating...' : 'Sign In'}</span>
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.6rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Need an account?{' '}
            <button
              type="button"
              onClick={onSwitchToRegister}
              style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}
            >
              Register here as a Normal User
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
