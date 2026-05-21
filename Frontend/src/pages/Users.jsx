import { useState, useEffect } from 'react';
import { FiPlus, FiSearch, FiEdit2, FiTrash2, FiX } from 'react-icons/fi';
import { userAPI } from '../services/api';

export default function Users() {
  const [users, setUsers]         = useState([]);
  const [search, setSearch]       = useState('');
  const [loading, setLoading]     = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [toast, setToast]         = useState(null);
  const [form, setForm]           = useState({
    username: '', firstName: '', lastName: '', email: '',
    phoneNumber: '', address: '', role: 'MEMBER', maxBorrowLimit: 5
  });

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await userAPI.getAll();
      setUsers(res.data);
    } catch (e) { showToast(e.message, 'error'); }
    finally { setLoading(false); }
  };

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const openCreate = () => {
    setEditingUser(null);
    setForm({ username: '', firstName: '', lastName: '', email: '',
      phoneNumber: '', address: '', role: 'MEMBER', maxBorrowLimit: 5 });
    setShowModal(true);
  };

  const openEdit = user => {
    setEditingUser(user);
    setForm({
      username: user.username, firstName: user.firstName, lastName: user.lastName,
      email: user.email, phoneNumber: user.phoneNumber || '', address: user.address || '',
      role: user.role, maxBorrowLimit: user.maxBorrowLimit
    });
    setShowModal(true);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      if (editingUser) {
        await userAPI.update(editingUser.id, form);
        showToast('User updated!');
      } else {
        await userAPI.create(form);
        showToast('User registered!');
      }
      setShowModal(false);
      fetchUsers();
    } catch (e) { showToast(e.message, 'error'); }
  };

  const handleDelete = async id => {
    if (!window.confirm('Deactivate this user?')) return;
    try {
      await userAPI.delete(id);
      showToast('User deactivated.');
      fetchUsers();
    } catch (e) { showToast(e.message, 'error'); }
  };

  const roleColors = { ADMIN: 'badge-danger', LIBRARIAN: 'badge-warning', MEMBER: 'badge-info' };

  const filtered = users.filter(u =>
    `${u.firstName} ${u.lastName} ${u.email} ${u.username}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Users</h1>
          <p className="page-subtitle">Manage library members and staff</p>
        </div>
        <button className="btn btn-primary" id="add-user-btn" onClick={openCreate}>
          <FiPlus /> Add User
        </button>
      </div>

      <div className="controls-bar">
        <div className="search-bar">
          <FiSearch className="search-icon" />
          <input
            id="user-search-input"
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <span style={{ color: 'var(--text-muted)', fontSize: '13px', marginLeft: 'auto' }}>
          {filtered.length} member{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="card" style={{ padding: 0 }}>
        {loading ? (
          <div className="loading-container"><div className="spinner" /></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">👥</div>
            <h3>No users found</h3>
            <p>Register a new member to get started.</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Role</th>
                  <th>Limit</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(u => (
                  <tr key={u.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{u.firstName} {u.lastName}</div>
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>@{u.username}</td>
                    <td style={{ color: 'var(--accent2)', fontSize: '13px' }}>{u.email}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{u.phoneNumber || '—'}</td>
                    <td><span className={`badge ${roleColors[u.role]}`}>{u.role}</span></td>
                    <td><span className="badge badge-purple">{u.maxBorrowLimit}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => openEdit(u)}><FiEdit2 /></button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(u.id)}><FiTrash2 /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <span className="modal-title">{editingUser ? 'Edit User' : 'Register User'}</span>
              <button className="modal-close" onClick={() => setShowModal(false)}><FiX /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="grid-2">
                <div className="form-group">
                  <label>First Name *</label>
                  <input required value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Last Name *</label>
                  <input required value={form.lastName} onChange={e => setForm({...form, lastName: e.target.value})} />
                </div>
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label>Username *</label>
                  <input required value={form.username} onChange={e => setForm({...form, username: e.target.value})} disabled={!!editingUser} />
                </div>
                <div className="form-group">
                  <label>Email *</label>
                  <input required type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} disabled={!!editingUser} />
                </div>
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label>Phone</label>
                  <input value={form.phoneNumber} onChange={e => setForm({...form, phoneNumber: e.target.value})} placeholder="9876543210" />
                </div>
                <div className="form-group">
                  <label>Role</label>
                  <select value={form.role} onChange={e => setForm({...form, role: e.target.value})}>
                    <option value="MEMBER">Member</option>
                    <option value="LIBRARIAN">Librarian</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Address</label>
                <input value={form.address} onChange={e => setForm({...form, address: e.target.value})} placeholder="Full address" />
              </div>
              <div className="form-group">
                <label>Max Borrow Limit</label>
                <input type="number" min="1" max="20" value={form.maxBorrowLimit} onChange={e => setForm({...form, maxBorrowLimit: Number(e.target.value)})} />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editingUser ? 'Update' : 'Register'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && <div className={`toast ${toast.type}`}>{toast.type === 'success' ? '✅' : '❌'} {toast.msg}</div>}
    </div>
  );
}
