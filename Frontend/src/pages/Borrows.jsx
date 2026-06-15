import { useState, useEffect } from 'react';
import './Borrows.css';
import { FiPlus, FiRotateCcw, FiX, FiAlertCircle } from 'react-icons/fi';
import { borrowAPI, bookAPI, userAPI } from '../services/api';

const FINE_PER_DAY = 2;

const toLocalDate = value => {
  if (!value) return null;
  return new Date(`${value}T00:00:00`);
};

const getFineAmount = borrow => {
  const dueDate = toLocalDate(borrow.dueDate);
  if (!dueDate) return 0;

  if (borrow.status === 'RETURNED') {
    // If backend saved a non-zero fine, trust it
    if (Number(borrow.fineAmount) > 0) return Number(borrow.fineAmount);
    // Otherwise recalculate from actual return date vs due date
    // (covers old records returned before fine calculation was implemented)
    const returnDate = toLocalDate(borrow.returnDate);
    if (!returnDate) return 0;
    const overdueDays = Math.max(0, Math.floor((returnDate - dueDate) / 86400000));
    return overdueDays * FINE_PER_DAY;
  }

  // For active borrows (BORROWED or OVERDUE), estimate from today
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const overdueDays = Math.max(0, Math.floor((today - dueDate) / 86400000));
  return overdueDays * FINE_PER_DAY;
};

const isOverdue = borrow =>
  borrow.status !== 'RETURNED' && toLocalDate(borrow.dueDate) < new Date().setHours(0,0,0,0);

export default function Borrows() {
  const [borrows, setBorrows]     = useState([]);
  const [books, setBooks]         = useState([]);
  const [users, setUsers]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [toast, setToast]         = useState(null);
  const [form, setForm]           = useState({ userId: '', bookId: '', borrowDays: 14 });

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [borRes, bkRes, usRes] = await Promise.all([
        borrowAPI.getAll(), bookAPI.getAvailable(), userAPI.getAll()
      ]);
      setBorrows(borRes.data);
      setBooks(bkRes.data);
      setUsers(usRes.data);
    } catch (e) { showToast(e.message, 'error'); }
    finally { setLoading(false); }
  };

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleBorrow = async e => {
    e.preventDefault();
    try {
      await borrowAPI.borrowBook(form.userId, form.bookId, form.borrowDays);
      showToast('Book borrowed successfully!');
      setShowModal(false);
      fetchAll();
    } catch (e) { showToast(e.message, 'error'); }
  };

  const handleReturn = async id => {
    const borrow = borrows.find(b => b.id === id);
    const fine = getFineAmount(borrow);
    const fineMsg = fine > 0
      ? `\n\n⚠️ A fine of ₹${fine.toFixed(2)} will be imposed (${Math.round(fine / FINE_PER_DAY)} day(s) overdue × ₹${FINE_PER_DAY}/day).`
      : '';
    if (!window.confirm(`Confirm return of "${borrow?.book?.title || 'this book'}"?${fineMsg}`)) return;
    try {
      const res = await borrowAPI.returnBook(id);
      const savedFine = Number(res.data?.fineAmount || 0);
      if (savedFine > 0) {
        showToast(`Book returned. Fine imposed: ₹${savedFine.toFixed(2)}`, 'error');
      } else {
        showToast('Book returned successfully! No fine.');
      }
      fetchAll();
    } catch (e) { showToast(e.message, 'error'); }
  };

  const statusConfig = {
    ALL:      { label: 'All Records', color: 'var(--text-secondary)' },
    BORROWED: { label: 'Active',      color: 'var(--info)' },
    OVERDUE:  { label: 'Overdue',     color: 'var(--danger)' },
    RETURNED: { label: 'Returned',    color: 'var(--success)' },
  };

  const filtered = activeFilter === 'ALL'
    ? borrows
    : borrows.filter(b => b.status === activeFilter);

  const statusBadge = status => {
    const map = {
      BORROWED: 'badge-info',
      RETURNED: 'badge-success',
      OVERDUE:  'badge-danger',
      LOST:     'badge-warning',
    };
    return <span className={`badge ${map[status] || 'badge-info'}`}>{status}</span>;
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Borrow Records</h1>
          <p className="page-subtitle">Track book loans, returns, and overdue items</p>
        </div>
        <button className="btn btn-primary" id="borrow-book-btn" onClick={() => setShowModal(true)}>
          <FiPlus /> Borrow Book
        </button>
      </div>

      {/* Filter Tabs */}
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
            <div className="empty-state-icon">🔄</div>
            <h3>No records found</h3>
            <p>No {activeFilter !== 'ALL' ? activeFilter.toLowerCase() : ''} borrow records exist.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Member</th>
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
                      <div style={{ fontWeight: 600 }}>{b.user?.firstName} {b.user?.lastName}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>@{b.user?.username}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{b.book?.title}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{b.book?.author}</div>
                    </td>
                    <td>{b.borrowDate}</td>
                    <td style={{ color: isOverdue(b) ? 'var(--danger)' : 'inherit' }}>
                      {b.dueDate}
                      {isOverdue(b) && <FiAlertCircle style={{ marginLeft: 4, verticalAlign: 'middle' }} title="Overdue" />}
                    </td>
                    <td>{b.returnDate || '—'}</td>
                    <td>
                      {getFineAmount(b) > 0
                        ? <span className="badge badge-danger" title={b.status !== 'RETURNED' ? 'Estimated fine — will be confirmed on return' : 'Fine charged'}>
                            ₹{getFineAmount(b).toFixed(2)}{b.status !== 'RETURNED' ? ' (est.)' : ''}
                          </span>
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

      {/* Borrow Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <span className="modal-title">Borrow a Book</span>
              <button className="modal-close" onClick={() => setShowModal(false)}><FiX /></button>
            </div>
            <form onSubmit={handleBorrow}>
              <div className="form-group">
                <label>Select Member *</label>
                <select required value={form.userId} onChange={e => setForm({...form, userId: e.target.value})}>
                  <option value="">-- Choose a member --</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.firstName} {u.lastName} (@{u.username})</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Select Book *</label>
                <select required value={form.bookId} onChange={e => setForm({...form, bookId: e.target.value})}>
                  <option value="">-- Choose a book --</option>
                  {books.map(b => (
                    <option key={b.id} value={b.id}>{b.title} — {b.author} ({b.availableCopies} left)</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Borrow Duration (days)</label>
                <input type="number" min="1" max="60" value={form.borrowDays}
                  onChange={e => setForm({...form, borrowDays: Number(e.target.value)})} />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Confirm Borrow</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && <div className={`toast ${toast.type}`}>{toast.type === 'success' ? '✅' : '❌'} {toast.msg}</div>}
    </div>
  );
}
