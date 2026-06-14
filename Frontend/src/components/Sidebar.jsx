import { NavLink, useNavigate } from 'react-router-dom';
import {
  FiGrid, FiBookOpen, FiUsers, FiRepeat,
  FiTag, FiBook, FiClock, FiUser,
  FiLogOut, FiChevronLeft, FiChevronRight, FiBookmark,
  FiSearch, FiActivity, FiSun, FiMoon
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useState } from 'react';
import './Sidebar.css';

// Menu items per role
const ADMIN_MENU = [
  { to: '/dashboard',   icon: <FiGrid />,     label: 'Dashboard',     badge: null },
  { to: '/books',       icon: <FiBookOpen />, label: 'Books',         badge: null },
  { to: '/users',       icon: <FiUsers />,    label: 'Users',         badge: null },
  { to: '/borrows',     icon: <FiRepeat />,   label: 'Borrows',       badge: null },
  { to: '/categories',  icon: <FiTag />,      label: 'Categories',    badge: null },
  // ── MongoDB / Node.js features ──────────────────────────────────────────
  { to: '/search',      icon: <FiSearch />,   label: 'Semantic Search', badge: 'AI' },
  { to: '/logs',        icon: <FiActivity />, label: 'Activity Logs', badge: null },
];

const LIBRARIAN_MENU = [
  { to: '/dashboard',   icon: <FiGrid />,     label: 'Dashboard',     badge: null },
  { to: '/books',       icon: <FiBookOpen />, label: 'Books',         badge: null },
  { to: '/users',       icon: <FiUsers />,    label: 'Members',       badge: null },
  { to: '/borrows',     icon: <FiRepeat />,   label: 'Borrows',       badge: null },
  { to: '/categories',  icon: <FiTag />,      label: 'Categories',    badge: null },
  // ── MongoDB / Node.js features ──────────────────────────────────────────
  { to: '/search',      icon: <FiSearch />,   label: 'Semantic Search', badge: 'AI' },
  { to: '/logs',        icon: <FiActivity />, label: 'Activity Logs', badge: null },
];

const MEMBER_MENU = [
  { to: '/browse',      icon: <FiBook />,     label: 'Browse Books',  badge: null },
  { to: '/my-borrows',  icon: <FiClock />,    label: 'My Borrows',    badge: null },
  { to: '/profile',     icon: <FiUser />,     label: 'My Profile',    badge: null },
  { to: '/search',      icon: <FiSearch />,   label: 'Semantic Search', badge: 'AI' },
];

const ROLE_META = {
  ADMIN:     { label: 'Administrator', color: '#ef4444', bg: 'rgba(239,68,68,0.12)'  },
  LIBRARIAN: { label: 'Librarian',     color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
  MEMBER:    { label: 'Member',        color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
};

export default function Sidebar() {
  const { user, logout, isAdmin, isLibrarian } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const isDark = theme === 'dark';

  const menuItems = isAdmin()
    ? ADMIN_MENU
    : isLibrarian()
      ? LIBRARIAN_MENU
      : MEMBER_MENU;

  const roleMeta = ROLE_META[user?.role] || ROLE_META.MEMBER;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const initials = user
    ? `${(user.firstName || user.username || '?')[0]}${(user.lastName || '')[0] || ''}`.toUpperCase()
    : '?';

  return (
    <nav className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="logo-icon-wrap">
          <FiBookmark className="logo-icon" />
        </div>
        {!collapsed && (
          <div className="logo-text">
            <div className="logo-title">DigiLib</div>
            <div className="logo-subtitle">Library System</div>
          </div>
        )}
      </div>

      {/* Collapse toggle */}
      <button
        className="sidebar-collapse-btn"
        onClick={() => setCollapsed(!collapsed)}
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <FiChevronRight /> : <FiChevronLeft />}
      </button>

      <div className="sidebar-divider" />

      {/* User badge */}
      <div className="sidebar-user">
        <div className="user-avatar" style={{ background: `linear-gradient(135deg, ${roleMeta.color}, ${roleMeta.color}88)` }}>
          {initials}
        </div>
        {!collapsed && (
          <div className="user-info">
            <div className="user-name">{user?.firstName} {user?.lastName}</div>
            <div
              className="user-role-badge"
              style={{ color: roleMeta.color, background: roleMeta.bg }}
            >
              {roleMeta.label}
            </div>
          </div>
        )}
      </div>

      <div className="sidebar-divider" />

      {/* Section label */}
      {!collapsed && (
        <div className="sidebar-section-label">
          {isAdmin() || isLibrarian() ? 'Management' : 'My Library'}
        </div>
      )}

      {/* Nav links */}
      <ul className="sidebar-nav">
        {menuItems.map(item => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              title={collapsed ? item.label : ''}
            >
              <span className="nav-icon">{item.icon}</span>
              {!collapsed && <span className="nav-label">{item.label}</span>}
              {!collapsed && item.badge && (
                <span className="nav-badge">{item.badge}</span>
              )}
            </NavLink>
          </li>
        ))}
      </ul>

      {/* Footer */}
      <div className="sidebar-footer">
        <div className="sidebar-divider" />

        {/* Theme toggle */}
        <button
          className={`theme-toggle-btn ${collapsed ? 'collapsed' : ''}`}
          onClick={toggleTheme}
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          id="theme-toggle-btn"
        >
          <span className="theme-toggle-track">
            <span className="theme-toggle-thumb">
              {isDark ? <FiMoon size={10} /> : <FiSun size={10} />}
            </span>
          </span>
          {!collapsed && (
            <span className="theme-toggle-label">
              {isDark ? 'Dark Mode' : 'Light Mode'}
            </span>
          )}
        </button>

        <button
          className="nav-link logout-btn"
          onClick={handleLogout}
          title={collapsed ? 'Logout' : ''}
          id="logout-btn"
        >
          <span className="nav-icon"><FiLogOut /></span>
          {!collapsed && <span className="nav-label">Logout</span>}
        </button>
        {!collapsed && (
          <div className="footer-version">DigiLib v1.0.0</div>
        )}
      </div>
    </nav>
  );
}
