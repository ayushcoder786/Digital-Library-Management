import { useState, useEffect } from 'react';
import { FiAlertCircle, FiRotateCcw } from 'react-icons/fi';
import { borrowAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const FINE_PER_DAY = 2;

const toLocalDate = value => {
  if (!value) return null;
  return new Date(`${value}T00:00:00`);
};

const getFineAmount = borrow => {
  if (Number(borrow.fineAmount) > 0) {
    return Number(borrow.fineAmount);
  }

  if (borrow.status !== 'OVERDUE') {
    return 0;
  }

  const dueDate = toLocalDate(borrow.dueDate);
  if (!dueDate) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const overdueDays = Math.max(0, Math.floor((today - dueDate) / 86400000));
  return overdueDays * FINE_PER_DAY;
};

export default function MyBorrows() {
  const { user } = useAuth();
  const [borrows, setBorrows]         = useState([]);
  const [loading, setLoading]         = useState(true);
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [toast, setToast]             = useState(null);

  useEffect(() => {
    if (user?.id) fetchBorrows();
  }, [user]);

  const fetchBorrows = async () => {
    setLoading(true);
    try {
      const res = await borrowAPI.getByUser(user.id);
      setBorrows(res.data);
    } catch (e) {
      showToast(e.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleReturn = async (borrowId) => {
    if (!window.confirm('Confirm return of this book?')) return;
    try {
      await borrowAPI.returnBook(borrowId);
      showToast('Book returned successfully!');
      fetchBorrows();
    } catch (e) {
      showToast(e.message, 'error');
    }
  };

  const statusConfig = {
    ALL:      { label: 'All',      color: 'var(--text-secondary)' },
    BORROWED: { label: 'Active',   color: 'var(--info)' },
    OVERDUE:  { label: 'Overdue',  color: 'var(--danger)' },
    RETURNED: { label: 'Returned', color: 'var(--success)' },
  };

  const filtered = activeFilter === 'ALL' ? borrows : borrows.filter(b => b.status === activeFilter);

  const statusBadge = status => {
    const map = { BORROWED: 'badge-info', RETURNED: 'badge-success', OVERDUE: 'badge-danger', LOST: 'badge-warning' };
    return <span className={`badge ${map[status] || 'badge-info'}`}>{status}</span>;
  };

  const active  = borrows.filter(b => b.status === 'BORROWED').length;
  const overdue = borrows.filter(b => b.status === 'OVERDUE').length;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">My Borrows</h1>
          <p className="page-subtitle">Track your borrowed books and return history</p>
        </div>
        <div className="stats-inline">
          {active  > 0 && <span className="stat-pill">{active} Active</span>}
          {overdue > 0 && <span className="stat-pill danger">{overdue} Overdue</span>}
        </div>
      </div>

      {overdue > 0 && (
        <div className="alert-banner">
          <FiAlertCircle />
          <div>
            <strong>You have {overdue} overdue book{overdue > 1 ? 's' : ''}!</strong>
            <span> Please return them to avoid additional fines.</span>
          </div>
        </div>
      )}

      {/* Filter tabs */}
      <div className="filter-tabs">
        {Object.entries(statusConfig).map(([key, cfg]) => (
          <button
            key={key}
            className={`filter-tab ${activeFilter === key ? 'active' : ''}`}
            onClick={() => setActiveFilter(key)}
            style={{ '--tab-color': cfg.color }}
          >
            {cfg.label}
            <span className="tab-count">
              {key === 'ALL' ? borrows.length : borrows.filter(b => b.status === key).length}
            </span>
          </button>
        ))}
      </div>

      <div className="card" style={{ padding: 0 }}>
        {loading ? (
          <div className="loading-container"><div className="spinner" /></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📋</div>
            <h3>No borrow records</h3>
            <p>Browse books and borrow some!</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Book</th>
                  <th>Borrowed On</th>
                  <th>Due Date</th>
                  <th>Returned On</th>
                  <th>Fine</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(b => (
                  <tr key={b.id}>
                    <td>#{b.id}</td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{b.book?.title}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{b.book?.author}</div>
                    </td>
                    <td>{b.borrowDate}</td>
                    <td style={{ color: b.status === 'OVERDUE' ? 'var(--danger)' : 'inherit' }}>
                      {b.dueDate}
                      {b.status === 'OVERDUE' && <FiAlertCircle style={{ marginLeft: 4, verticalAlign: 'middle' }} />}
                    </td>
                    <td>{b.returnDate || '—'}</td>
                    <td>
                      {getFineAmount(b) > 0
                        ? <span className="badge badge-danger">₹{getFineAmount(b).toFixed(2)}{b.status !== 'RETURNED' ? ' (est.)' : ''}</span>
                        : <span className="badge badge-success">₹0.00</span>}
                    </td>
                    <td>{statusBadge(b.status)}</td>
                    <td>
                      {b.status === 'BORROWED' || b.status === 'OVERDUE' ? (
                        <button className="btn btn-success btn-sm" onClick={() => handleReturn(b.id)}>
                          <FiRotateCcw /> Return
                        </button>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {toast && <div className={`toast ${toast.type}`}>{toast.type === 'success' ? '✅' : '❌'} {toast.msg}</div>}
    </div>
  );
}
