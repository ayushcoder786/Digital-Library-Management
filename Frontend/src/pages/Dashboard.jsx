import { useState, useEffect } from 'react';
import { FiBookOpen, FiUsers, FiRepeat, FiAlertCircle, FiTrendingUp, FiClock } from 'react-icons/fi';
import { bookAPI, userAPI, borrowAPI } from '../services/api';
import './Dashboard.css';

export default function Dashboard() {
  const [stats, setStats]   = useState({ books: 0, users: 0, borrows: 0, overdue: 0 });
  const [recentBorrows, setRecentBorrows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [booksRes, usersRes, borrowsRes, overdueRes] = await Promise.allSettled([
          bookAPI.getAll(),
          userAPI.getAll(),
          borrowAPI.getAll(),
          borrowAPI.getOverdue(),
        ]);

        setStats({
          books:   booksRes.status   === 'fulfilled' ? booksRes.value.data.length   : 0,
          users:   usersRes.status   === 'fulfilled' ? usersRes.value.data.length   : 0,
          borrows: borrowsRes.status === 'fulfilled' ? borrowsRes.value.data.filter(b => b.status === 'BORROWED').length : 0,
          overdue: overdueRes.status === 'fulfilled' ? overdueRes.value.data.length : 0,
        });

        if (borrowsRes.status === 'fulfilled') {
          setRecentBorrows(borrowsRes.value.data.slice(0, 6));
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const statusBadge = status => {
    const map = {
      BORROWED: 'badge-info',
      RETURNED: 'badge-success',
      OVERDUE:  'badge-danger',
      LOST:     'badge-warning',
    };
    return <span className={`badge ${map[status] || 'badge-info'}`}>{status}</span>;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner" />
        <p style={{ color: 'var(--text-secondary)' }}>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Welcome to Digital Library Management System</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card purple">
          <div className="stat-icon">📚</div>
          <div className="stat-value">{stats.books}</div>
          <div className="stat-label">Total Books</div>
        </div>
        <div className="stat-card cyan">
          <div className="stat-icon">👥</div>
          <div className="stat-value">{stats.users}</div>
          <div className="stat-label">Registered Members</div>
        </div>
        <div className="stat-card green">
          <div className="stat-icon">🔄</div>
          <div className="stat-value">{stats.borrows}</div>
          <div className="stat-label">Active Borrows</div>
        </div>
        <div className="stat-card orange">
          <div className="stat-icon">⚠️</div>
          <div className="stat-value">{stats.overdue}</div>
          <div className="stat-label">Overdue Books</div>
        </div>
      </div>

      {/* Recent Borrows Table */}
      <div className="card">
        <div className="section-header">
          <FiClock className="section-icon" />
          <h2 className="section-title">Recent Borrow Activity</h2>
        </div>
        {recentBorrows.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <h3>No borrow records yet</h3>
            <p>Start by adding books and registering members.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>User</th>
                  <th>Book</th>
                  <th>Borrow Date</th>
                  <th>Due Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentBorrows.map(b => (
                  <tr key={b.id}>
                    <td>#{b.id}</td>
                    <td>{b.user?.firstName} {b.user?.lastName}</td>
                    <td>{b.book?.title}</td>
                    <td>{b.borrowDate}</td>
                    <td>{b.dueDate}</td>
                    <td>{statusBadge(b.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
