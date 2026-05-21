import { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiTag } from 'react-icons/fi';
import { categoryAPI } from '../services/api';

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [showModal, setShowModal]   = useState(false);
  const [editing, setEditing]       = useState(null);
  const [toast, setToast]           = useState(null);
  const [form, setForm]             = useState({ name: '', description: '' });

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const res = await categoryAPI.getAll();
      setCategories(res.data);
    } catch (e) { showToast(e.message, 'error'); }
    finally { setLoading(false); }
  };

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ name: '', description: '' });
    setShowModal(true);
  };

  const openEdit = (cat) => {
    setEditing(cat);
    setForm({ name: cat.name, description: cat.description || '' });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await categoryAPI.update(editing.id, form);
        showToast('Category updated!');
      } else {
        await categoryAPI.create(form);
        showToast('Category created!');
      }
      setShowModal(false);
      fetchAll();
    } catch (err) { showToast(err.message, 'error'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    try {
      await categoryAPI.delete(id);
      showToast('Category deleted.');
      fetchAll();
    } catch (err) { showToast(err.message, 'error'); }
  };

  const COLORS = ['#7c3aed','#06b6d4','#22c55e','#f59e0b','#ef4444','#ec4899','#8b5cf6','#14b8a6','#f97316','#6366f1'];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Categories</h1>
          <p className="page-subtitle">Manage book categories and genres</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate} id="add-category-btn">
          <FiPlus /> Add Category
        </button>
      </div>

      {loading ? (
        <div className="loading-container"><div className="spinner" /></div>
      ) : categories.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><FiTag /></div>
          <h3>No categories yet</h3>
          <p>Add your first book category to get started.</p>
        </div>
      ) : (
        <div className="cat-grid">
          {categories.map((cat, idx) => (
            <div key={cat.id} className="cat-card" style={{ '--cat-color': COLORS[idx % COLORS.length] }}>
              <div className="cat-icon">
                <FiTag />
              </div>
              <div className="cat-info">
                <div className="cat-name">{cat.name}</div>
                {cat.description && <div className="cat-desc">{cat.description}</div>}
              </div>
              <div className="cat-actions">
                <button className="btn btn-secondary btn-sm" onClick={() => openEdit(cat)} title="Edit">
                  <FiEdit2 />
                </button>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(cat.id)} title="Delete">
                  <FiTrash2 />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <span className="modal-title">{editing ? 'Edit Category' : 'Add Category'}</span>
              <button className="modal-close" onClick={() => setShowModal(false)}><FiX /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Category Name *</label>
                <input
                  required
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Science Fiction"
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  placeholder="Short description of this category..."
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editing ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && <div className={`toast ${toast.type}`}>{toast.type === 'success' ? '✅' : '❌'} {toast.msg}</div>}
    </div>
  );
}
