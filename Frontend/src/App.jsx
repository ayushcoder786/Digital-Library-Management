import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import Books from './pages/Books';
import Users from './pages/Users';
import Borrows from './pages/Borrows';
import Categories from './pages/Categories';
import BrowseBooks from './pages/BrowseBooks';
import MyBorrows from './pages/MyBorrows';
import Profile from './pages/Profile';
import './App.css';

// Protected layout with sidebar (used after login)
function AppLayout() {
  const { user, loading, isStaff } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  if (loading) {
    return (
      <div className="loading-container" style={{ height: '100vh' }}>
        <div className="spinner" />
        <p style={{ color: 'var(--text-secondary)' }}>Loading…</p>
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;

  return (
    <div className="app-layout">
      <Sidebar onCollapse={setSidebarCollapsed} />
      <main className={`main-content ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <Routes>
          {/* Admin / Librarian routes */}
          {isStaff() && (
            <>
              <Route path="/dashboard"  element={<Dashboard />} />
              <Route path="/books"      element={<Books />} />
              <Route path="/users"      element={<Users />} />
              <Route path="/borrows"    element={<Borrows />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="*"           element={<Navigate to="/dashboard" replace />} />
            </>
          )}
          {/* Member routes */}
          {!isStaff() && (
            <>
              <Route path="/browse"     element={<BrowseBooks />} />
              <Route path="/my-borrows" element={<MyBorrows />} />
              <Route path="/profile"    element={<Profile />} />
              <Route path="*"           element={<Navigate to="/browse" replace />} />
            </>
          )}
        </Routes>
      </main>
    </div>
  );
}

// Root-level routing (auth guard)
function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-container" style={{ height: '100vh' }}>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/auth"
        element={user ? <Navigate to={user.role === 'MEMBER' ? '/browse' : '/dashboard'} replace /> : <AuthPage />}
      />
      <Route path="/*" element={user ? <AppLayout /> : <Navigate to="/auth" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}
