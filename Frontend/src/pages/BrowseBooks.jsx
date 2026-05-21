import { useState, useEffect } from 'react';
import { FiSearch, FiBookOpen, FiFilter } from 'react-icons/fi';
import { bookAPI, categoryAPI, borrowAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function BrowseBooks() {
  const { user } = useAuth();
  const [books, setBooks]             = useState([]);
  const [categories, setCategories]   = useState([]);
  const [search, setSearch]           = useState('');
  const [selectedCat, setSelectedCat] = useState('');
  const [loading, setLoading]         = useState(true);
  const [toast, setToast]             = useState(null);
  const [borrowing, setBorrowing]     = useState(null);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [bRes, cRes] = await Promise.all([bookAPI.getAll(), categoryAPI.getAll()]);
      setBooks(bRes.data);
      setCategories(cRes.data);
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

  const handleBorrow = async (bookId) => {
    if (!user?.id) { showToast('User not found', 'error'); return; }
    setBorrowing(bookId);
    try {
      await borrowAPI.borrowBook(user.id, bookId, 14);
      showToast('Book borrowed for 14 days! Check "My Borrows" for details.');
      fetchAll();
    } catch (e) {
      showToast(e.message, 'error');
    } finally {
      setBorrowing(null);
    }
  };

  const filtered = books.filter(b => {
    const matchSearch = !search ||
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.author.toLowerCase().includes(search.toLowerCase()) ||
      (b.isbn || '').includes(search);
    const matchCat = !selectedCat || String(b.category?.id) === String(selectedCat);
    return matchSearch && matchCat;
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Browse Books</h1>
          <p className="page-subtitle">Discover and borrow from our digital collection</p>
        </div>
        <div className="stats-inline">
          <span className="stat-pill">{books.filter(b => b.availableCopies > 0).length} Available</span>
          <span className="stat-pill secondary">{books.length} Total</span>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="controls-bar">
        <div className="search-bar" style={{ maxWidth: '420px', flex: 1 }}>
          <FiSearch className="search-icon" />
          <input
            id="browse-search"
            type="text"
            placeholder="Search by title, author, or ISBN…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div style={{ position: 'relative', minWidth: '180px' }}>
          <FiFilter style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
          <select
            id="browse-category-filter"
            value={selectedCat}
            onChange={e => setSelectedCat(e.target.value)}
            style={{ paddingLeft: 36 }}
          >
            <option value="">All Categories</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <span style={{ color: 'var(--text-muted)', fontSize: '13px', marginLeft: 'auto' }}>
          {filtered.length} book{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Books Grid */}
      {loading ? (
        <div className="loading-container"><div className="spinner" /></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">📚</div>
          <h3>No books found</h3>
          <p>Try a different search or category.</p>
        </div>
      ) : (
        <div className="books-grid">
          {filtered.map(b => (
            <div key={b.id} className={`book-card ${b.availableCopies === 0 ? 'unavailable' : ''}`}>
              <div className="book-card-header">
                <div className="book-cover-icon">📖</div>
                {b.category && <span className="badge badge-purple">{b.category.name}</span>}
              </div>
              <div className="book-card-body">
                <h3 className="book-title">{b.title}</h3>
                <p className="book-author">by {b.author}</p>
                {b.description && (
                  <p className="book-desc">{b.description.slice(0, 90)}{b.description.length > 90 ? '…' : ''}</p>
                )}
                <div className="book-meta">
                  {b.publisher && <span>🏢 {b.publisher}</span>}
                  {b.pageCount && <span>📄 {b.pageCount}p</span>}
                  {b.language && <span>🌐 {b.language}</span>}
                </div>
              </div>
              <div className="book-card-footer">
                <div className={`avail-badge ${b.availableCopies > 0 ? 'avail' : 'unavail'}`}>
                  {b.availableCopies > 0
                    ? `✅ ${b.availableCopies} of ${b.totalCopies} available`
                    : '❌ All copies borrowed'}
                </div>
                <button
                  className={`btn ${b.availableCopies > 0 ? 'btn-primary' : 'btn-secondary'} btn-sm`}
                  disabled={b.availableCopies === 0 || borrowing === b.id}
                  onClick={() => handleBorrow(b.id)}
                  id={`borrow-btn-${b.id}`}
                >
                  {borrowing === b.id ? '⏳ Borrowing…' : b.availableCopies > 0 ? '📤 Borrow' : 'Unavailable'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {toast && <div className={`toast ${toast.type}`}>{toast.type === 'success' ? '✅' : '❌'} {toast.msg}</div>}
    </div>
  );
}
