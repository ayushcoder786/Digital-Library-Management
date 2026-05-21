import { useState } from 'react';
import { FiUser, FiMail, FiPhone, FiMapPin, FiEdit2, FiX, FiSave } from 'react-icons/fi';
import { userAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user, login } = useAuth();
  const [editing, setEditing]   = useState(false);
  const [toast, setToast]       = useState(null);
  const [form, setForm]         = useState({
    firstName:   user?.firstName   || '',
    lastName:    user?.lastName    || '',
    phoneNumber: user?.phoneNumber || '',
    address:     user?.address     || '',
  });

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const res = await userAPI.update(user.id, { ...user, ...form });
      login(res.data);
      showToast('Profile updated successfully!');
      setEditing(false);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const ROLE_META = {
    ADMIN:     { label: 'Administrator', color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
    LIBRARIAN: { label: 'Librarian',     color: '#f59e0b', bg: 'rgba(245,158,11,0.12)' },
    MEMBER:    { label: 'Member',        color: '#3b82f6', bg: 'rgba(59,130,246,0.12)' },
  };

  const roleMeta = ROLE_META[user?.role] || ROLE_META.MEMBER;
  const initials = `${(user?.firstName || '?')[0]}${(user?.lastName || '')[0] || ''}`.toUpperCase();

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">My Profile</h1>
          <p className="page-subtitle">Manage your account information</p>
        </div>
        {!editing && (
          <button className="btn btn-secondary" onClick={() => setEditing(true)} id="edit-profile-btn">
            <FiEdit2 /> Edit Profile
          </button>
        )}
      </div>

      <div className="profile-layout">
        {/* Avatar Card */}
        <div className="card profile-avatar-card">
          <div
            className="profile-avatar"
            style={{ background: `linear-gradient(135deg, ${roleMeta.color}, ${roleMeta.color}88)` }}
          >
            {initials}
          </div>
          <h2 className="profile-name">{user?.firstName} {user?.lastName}</h2>
          <span className="profile-username">@{user?.username}</span>
          <div
            className="profile-role-badge"
            style={{ color: roleMeta.color, background: roleMeta.bg }}
          >
            {roleMeta.label}
          </div>
          <div className="profile-stats">
            <div className="profile-stat">
              <div className="ps-value">{user?.maxBorrowLimit || 5}</div>
              <div className="ps-label">Borrow Limit</div>
            </div>
            <div className="profile-stat">
              <div className="ps-value">{user?.membershipDate ? new Date(user.membershipDate).getFullYear() : '—'}</div>
              <div className="ps-label">Member Since</div>
            </div>
          </div>
        </div>

        {/* Details Card */}
        <div className="card profile-details-card">
          {editing ? (
            <form onSubmit={handleSave}>
              <div className="profile-section-title">✏️ Edit Information</div>
              <div className="grid-2">
                <div className="form-group">
                  <label>First Name</label>
                  <input value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Last Name</label>
                  <input value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input value={form.phoneNumber} onChange={e => setForm({ ...form, phoneNumber: e.target.value })} placeholder="9876543210" />
              </div>
              <div className="form-group">
                <label>Address</label>
                <textarea rows={3} value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="Your address..." />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setEditing(false)}>
                  <FiX /> Cancel
                </button>
                <button type="submit" className="btn btn-primary" id="save-profile-btn">
                  <FiSave /> Save Changes
                </button>
              </div>
            </form>
          ) : (
            <>
              <div className="profile-section-title">👤 Account Information</div>
              <div className="profile-info-grid">
                <div className="profile-info-item">
                  <FiUser className="pi-icon" />
                  <div>
                    <div className="pi-label">Full Name</div>
                    <div className="pi-value">{user?.firstName} {user?.lastName}</div>
                  </div>
                </div>
                <div className="profile-info-item">
                  <FiUser className="pi-icon" />
                  <div>
                    <div className="pi-label">Username</div>
                    <div className="pi-value">@{user?.username}</div>
                  </div>
                </div>
                <div className="profile-info-item">
                  <FiMail className="pi-icon" />
                  <div>
                    <div className="pi-label">Email</div>
                    <div className="pi-value">{user?.email}</div>
                  </div>
                </div>
                <div className="profile-info-item">
                  <FiPhone className="pi-icon" />
                  <div>
                    <div className="pi-label">Phone</div>
                    <div className="pi-value">{user?.phoneNumber || '—'}</div>
                  </div>
                </div>
                <div className="profile-info-item" style={{ gridColumn: '1 / -1' }}>
                  <FiMapPin className="pi-icon" />
                  <div>
                    <div className="pi-label">Address</div>
                    <div className="pi-value">{user?.address || '—'}</div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {toast && <div className={`toast ${toast.type}`}>{toast.type === 'success' ? '✅' : '❌'} {toast.msg}</div>}
    </div>
  );
}
