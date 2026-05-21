import { useState, useEffect } from 'react';
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiX } from 'react-icons/fi';
import { bookAPI, categoryAPI } from '../services/api';

export default function Books() {
  const [books, setBooks]           = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch]         = useState('');
  const [loading, setLoading]       = useState(true);
  const [showModal, setShowModal]   = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [toast, setToast]           = useState(null);
  const [form, setForm]             = useState({
    title: '', author: '', isbn: '', description: '',
    publisher: '', totalCopies: 1, availableCopies: 1,
    language: 'English', pageCount: '', category: { id: '' }
  });

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [bRes, cRes] = await Promise.all([bookAPI.getAll(), categoryAPI.getAll()]);
      setBooks(bRes.data);
      setCategories(cRes.data);
    } catch (e) {
      showToast(e.message, 'error');
    } finally { setLoading(false); }
  };

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const openCreate = () => {
    setEditingBook(null);
    setForm({ title: '', author: '', isbn: '', description: '', publisher: '',
      totalCopies: 1, availableCopies: 1, language: 'English', pageCount: '', category: { id: '' } });
    setShowModal(true);
  };

  const openEdit = book => {
    setEditingBook(book);
    setForm({
      title: book.title, author: book.author, isbn: book.isbn,
      description: book.description || '', publisher: book.publisher || '',
      totalCopies: book.totalCopies, availableCopies: book.availableCopies,
      language: book.language || 'English', pageCount: book.pageCount || '',
      category: { id: book.category?.id || '' }
    });
    setShowModal(true);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const payload = {
      ...form,
      totalCopies: Number(form.totalCopies),
      availableCopies: Number(form.availableCopies),
      pageCount: form.pageCount ? Number(form.pageCount) : null,
      category: form.category.id ? { id: Number(form.category.id) } : null,
    };
    try {
      if (editingBook) {
        await bookAPI.update(editingBook.id, payload);
        showToast('Book updated successfully!');
      } else {
        await bookAPI.create(payload);
        showToast('Book created successfully!');
      }
      setShowModal(false);
      fetchAll();
    } catch (e) { showToast(e.message, 'error'); }
  };

  const handleDelete = async id => {
    if (!window.confirm('Deactivate this book?')) return;
    try {
      await bookAPI.delete(id);
      showToast('Book deactivated.');
      fetchAll();
    } catch (e) { showToast(e.message, 'error'); }
  };

  const handleSearch = async e => {
    const val = e.target.value;
    setSearch(val);
    if (val.trim().length >= 2) {
      try {
        const res = await bookAPI.search(val);
        setBooks(res.data);
      } catch {}
    } else if (val.trim().length === 0) {
      fetchAll();
    }
  };

  const filtered = books.filter(b =>
    b.title.toLowerCase().includes(search.toLowerCase()) ||
    b.author.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Books</h1>
          <p className="page-subtitle">Manage your library collection</p>
        </div>
        <button className="btn btn-primary" id="add-book-btn" onClick={openCreate}>
          <FiPlus /> Add Book
        </button>
      </div>

      <div className="controls-bar">
        <div className="search-bar">
          <FiSearch className="search-icon" />
          <input
            id="book-search-input"
            type="text"
            placeholder="Search by title or author..."
            value={search}
            onChange={handleSearch}
          />
        </div>
        <span style={{ color: 'var(--text-muted)', fontSize: '13px', marginLeft: 'auto' }}>
          {filtered.length} book{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="card" style={{ padding: 0 }}>
        {loading ? (
          <div className="loading-container"><div className="spinner" /></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📚</div>
            <h3>No books found</h3>
            <p>Try a different search or add a new book.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Author</th>
                  <th>ISBN</th>
                  <th>Category</th>
                  <th>Available</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(b => (
                  <tr key={b.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{b.title}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{b.language} · {b.pageCount}p</div>
                    </td>
                    <td>{b.author}</td>
                    <td><code style={{ fontSize: '12px', color: 'var(--accent2)' }}>{b.isbn}</code></td>
                    <td>
                      {b.category
                        ? <span className="badge badge-purple">{b.category.name}</span>
                        : <span className="badge badge-info">—</span>}
                    </td>
                    <td>
                      <span className={`badge ${b.availableCopies > 0 ? 'badge-success' : 'badge-danger'}`}>
                        {b.availableCopies}/{b.totalCopies}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => openEdit(b)} title="Edit">
                          <FiEdit2 />
                        </button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(b.id)} title="Delete">
                          <FiTrash2 />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <span className="modal-title">{editingBook ? 'Edit Book' : 'Add New Book'}</span>
              <button className="modal-close" onClick={() => setShowModal(false)}><FiX /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="grid-2">
                <div className="form-group">
                  <label>Title *</label>
                  <input required value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="Book title" />
                </div>
                <div className="form-group">
                  <label>Author *</label>
                  <input required value={form.author} onChange={e => setForm({...form, author: e.target.value})} placeholder="Author name" />
                </div>
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label>ISBN *</label>
                  <input required value={form.isbn} onChange={e => setForm({...form, isbn: e.target.value})} placeholder="978-..." />
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <select value={form.category.id} onChange={e => setForm({...form, category: { id: e.target.value }})}>
                    <option value="">-- None --</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Short description..." />
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label>Publisher</label>
                  <input value={form.publisher} onChange={e => setForm({...form, publisher: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Language</label>
                  <input value={form.language} onChange={e => setForm({...form, language: e.target.value})} />
                </div>
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label>Total Copies</label>
                  <input type="number" min="1" value={form.totalCopies} onChange={e => setForm({...form, totalCopies: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Available Copies</label>
                  <input type="number" min="0" value={form.availableCopies} onChange={e => setForm({...form, availableCopies: e.target.value})} />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editingBook ? 'Update' : 'Create'} Book</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <div className={`toast ${toast.type}`}>{toast.type === 'success' ? '✅' : '❌'} {toast.msg}</div>}
    </div>
  );
}
