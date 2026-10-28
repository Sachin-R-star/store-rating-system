import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { UserDashboard } from './pages/user/UserDashboard';
import { OwnerDashboard } from './pages/owner/OwnerDashboard';
import { Store } from 'lucide-react';

export default function App() {
  const { user, loading } = useAuth();
  const [authView, setAuthView] = useState('login'); // 'login' or 'signup'

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-canvas)' }}>
        <div style={{ textAlign: 'center', color: 'var(--text-dim)' }}>
          <div className="brand-icon" style={{ margin: '0 auto 1.25rem auto', width: '48px', height: '48px' }}>
            <Store size={26} />
          </div>
          <p style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-main)' }}>Loading StoreRate...</p>
        </div>
      </div>
    );
  }

  // If not logged in, show Login or Registration page
  if (!user) {
    return (
      <div className="app-layout">
        {authView === 'login' ? (
          <Login onSwitchToRegister={() => setAuthView('signup')} />
        ) : (
          <Signup onSwitchToLogin={() => setAuthView('login')} />
        )}
      </div>
    );
  }

  // Role-based Dashboard routing
  return (
    <div className="app-layout">
      <Navbar />
      <main className="main-content">
        {user.role === 'ADMIN' && <AdminDashboard />}
        {user.role === 'STORE_OWNER' && <OwnerDashboard />}
        {user.role === 'USER' && <UserDashboard />}
      </main>
    </div>
  );
}
