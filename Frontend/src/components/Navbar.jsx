import { NavLink } from 'react-router-dom';
import { FiBookOpen, FiUsers, FiRepeat, FiGrid, FiBookmark } from 'react-icons/fi';
import './Navbar.css';

const navItems = [
  { to: '/',        icon: <FiGrid />,     label: 'Dashboard' },
  { to: '/books',   icon: <FiBookOpen />, label: 'Books' },
  { to: '/users',   icon: <FiUsers />,    label: 'Users' },
  { to: '/borrows', icon: <FiRepeat />,   label: 'Borrows' },
];

export default function Navbar() {
  return (
    <nav className="sidebar">
      <div className="sidebar-logo">
        <FiBookmark className="logo-icon" />
        <div>
          <div className="logo-title">DigiLib</div>
          <div className="logo-subtitle">Library System</div>
        </div>
      </div>

      <div className="sidebar-divider" />

      <ul className="sidebar-nav">
        {navItems.map(item => (
          <li key={item.to}>
            <NavLink
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>

      <div className="sidebar-footer">
        <div className="footer-badge">
          <div className="status-dot" />
          <span>System Online</span>
        </div>
        <div className="footer-version">v1.0.0</div>
      </div>
    </nav>
  );
}
