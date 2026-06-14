import { useState, useEffect } from 'react';
import { logAPI } from '../services/api';
import './ActivityLogs.css';

// ── Action config (icon + colour + label) ──────────────────────────────────
const ACTION_CONFIG = {
  BORROW:   { icon: '📖', color: '#3b82f6', bg: 'rgba(59,130,246,0.12)',  label: 'Borrowed a book'   },
  RETURN:   { icon: '✅', color: '#22c55e', bg: 'rgba(34,197,94,0.12)',   label: 'Returned a book'   },
  LOGIN:    { icon: '🔑', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  label: 'Logged in'          },
  REGISTER: { icon: '🎉', color: '#06b6d4', bg: 'rgba(6,182,212,0.12)',   label: 'Registered account' },
  SEARCH:   { icon: '🔍', color: '#a78bfa', bg: 'rgba(167,139,250,0.12)', label: 'Searched books'    },
  CREATE:   { icon: '➕', color: '#22c55e', bg: 'rgba(34,197,94,0.12)',   label: 'Created record'    },
  UPDATE:   { icon: '✏️', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  label: 'Updated record'    },
  DELETE:   { icon: '🗑️', color: '#ef4444', bg: 'rgba(239,68,68,0.12)',   label: 'Deleted record'    },
};


const STAT_ICONS = { BORROW:'📖', RETURN:'✅', LOGIN:'🔑', REGISTER:'🎉', SEARCH:'🔍', CREATE:'➕', UPDATE:'✏️', DELETE:'🗑️' };
const STAT_COLORS = ['purple','cyan','green','orange','purple','cyan','green'];

// ── Helpers ─────────────────────────────────────────────────────────────────
function relativeTime(dateStr) {
  if (!dateStr) return '—';
  const diff = Date.now() - new Date(dateStr).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60)  return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60)  return `${m} min ago`;
  const h = Math.floor(m / 60);
  if (h < 24)  return `${h}h ago`;
  return new Date(dateStr).toLocaleDateString();
}

function fullDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleString();
}

function renderDetails(details, action) {
  if (!details || Object.keys(details).length === 0) return null;
  const cfg = ACTION_CONFIG[action] || {};
  const chips = [];

  if (details.query)       chips.push({ icon: '🔎', text: `"${details.query}"` });
  if (details.title)       chips.push({ icon: '📚', text: details.title });
  if (details.topK)        chips.push({ icon: '🎯', text: `Top ${details.topK}` });
  if (details.resultCount !== undefined) chips.push({ icon: '📊', text: `${details.resultCount} result${details.resultCount !== 1 ? 's' : ''}` });
  if (details.bookId)      chips.push({ icon: '#', text: `Book #${details.bookId}` });
  if (details.dueDate)     chips.push({ icon: '📅', text: `Due: ${details.dueDate}` });
  if (details.fine !== undefined && details.fine > 0) chips.push({ icon: '💰', text: `Fine: ₹${details.fine}` });

  if (chips.length === 0) {
    // Fallback: show first 2 key-value pairs prettily
    Object.entries(details).slice(0, 2).forEach(([k, v]) =>
      chips.push({ icon: '•', text: `${k}: ${v}` })
    );
  }

  return (
    <div className="log-detail-chips">
      {chips.map((c, i) => (
        <span key={i} className="log-chip" style={{ borderColor: cfg.color + '44', color: cfg.color }}>
          <span className="log-chip-icon">{c.icon}</span>
          {c.text}
        </span>
      ))}
    </div>
  );
}

function UserAvatar({ name }) {
  const initials = (name || '?').slice(0, 2).toUpperCase();
  const colors = ['#7c3aed','#06b6d4','#22c55e','#f59e0b','#ef4444','#ec4899'];
  const hue = colors[(name || '').charCodeAt(0) % colors.length];
  return (
    <div className="log-avatar" style={{ background: hue }}>
      {initials}
    </div>
  );
}

// ── Component ────────────────────────────────────────────────────────────────
export default function ActivityLogs() {
  const [logs, setLogs]       = useState([]);
  const [stats, setStats]     = useState([]);
  const [page, setPage]       = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');
  const SIZE = 15;

  const loadLogs = async (p = 1) => {
    setLoading(true);
    setError('');
    try {
      const [logsRes, statsRes] = await Promise.allSettled([
        logAPI.getAll(p, SIZE),
        logAPI.getStats(),
      ]);
      if (logsRes.status === 'fulfilled') {
        const data = logsRes.value.data;
        setLogs(data.logs || []);
        setTotalPages(data.totalPages || 1);
        setTotalRecords(data.totalRecords || 0);
      }
      if (statsRes.status === 'fulfilled') {
        setStats(statsRes.value.data.stats || []);
      }
    } catch {
      setError('Failed to load logs. Make sure the Node.js service is running on port 8002.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadLogs(page); }, [page]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner" />
        <p style={{ color: 'var(--text-secondary)' }}>Loading activity logs…</p>
      </div>
    );
  }

  return (
    <div className="al-page">

      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Activity Logs</h1>
          <p className="page-subtitle">
            MongoDB collection — every user action recorded as an event
          </p>
        </div>
      </div>

      {/* ── Error ──────────────────────────────────────────────── */}
      {error && (
        <div className="al-error">⚠️ {error}</div>
      )}

      {/* ── Stats Bar ──────────────────────────────────────────── */}
      {stats.length > 0 && (
        <div className="al-stats-grid">
          {stats.slice(0, 4).map((s, i) => (
            <div key={s._id} className={`stat-card ${STAT_COLORS[i % STAT_COLORS.length]}`}>
              <div className="stat-icon">{STAT_ICONS[s._id] || '📊'}</div>
              <div className="stat-value">{s.count}</div>
              <div className="stat-label">{s._id} events</div>
            </div>
          ))}
        </div>
      )}

      {/* ── Log Feed ───────────────────────────────────────────── */}
      <div className="al-feed-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '1.1rem' }}>📋</span>
          <h2 className="section-title">Event Feed</h2>
          {totalRecords > 0 && (
            <span className="al-total-badge">{totalRecords} total</span>
          )}
        </div>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
          Page {page} of {totalPages}
        </span>
      </div>

      {logs.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">📭</div>
            <h3>No activity logs yet</h3>
            <p>Logs appear here as users borrow books, log in, search, and more.</p>
          </div>
        </div>
      ) : (
        <>
          <div className="al-feed">
            {logs.map((log, idx) => {
              const cfg = ACTION_CONFIG[log.action] || { icon: '📌', color: '#94a3b8', bg: 'rgba(148,163,184,0.1)', label: log.action };
              return (
                <div key={log._id} className="al-entry" style={{ animationDelay: `${idx * 0.04}s` }}>

                  {/* Left: action icon */}
                  <div className="al-icon-col">
                    <div className="al-action-icon" style={{ background: cfg.bg, color: cfg.color }}>
                      {cfg.icon}
                    </div>
                    {idx < logs.length - 1 && <div className="al-connector" />}
                  </div>

                  {/* Right: card */}
                  <div className="al-card">
                    <div className="al-card-top">

                      {/* User avatar + name */}
                      <div className="al-user">
                        <UserAvatar name={log.userName} />
                        <div>
                          <div className="al-username">{log.userName || 'Unknown'}</div>
                          <div className="al-uid">UID #{log.userId}</div>
                        </div>
                      </div>

                      {/* Action badge */}
                      <span className="al-action-badge" style={{ background: cfg.bg, color: cfg.color, borderColor: cfg.color + '55' }}>
                        {cfg.icon} {log.action}
                      </span>

                      {/* Time */}
                      <div className="al-time" title={fullDate(log.createdAt)}>
                        {relativeTime(log.createdAt)}
                      </div>
                    </div>

                    {/* Description + entity */}
                    <div className="al-card-mid">
                      <span className="al-action-label">{cfg.label}</span>
                      {log.entity && (
                        <span className="al-entity">
                          — {log.entity}{log.entityId ? ` #${log.entityId}` : ''}
                        </span>
                      )}
                    </div>

                    {/* Details chips (no raw JSON!) */}
                    {log.details && renderDetails(log.details, log.action)}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          <div className="al-pagination">
            <button className="btn btn-secondary" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>
              ← Prev
            </button>
            <div className="al-page-dots">
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(n => (
                <button
                  key={n}
                  className={`al-dot-btn ${n === page ? 'active' : ''}`}
                  onClick={() => setPage(n)}
                >
                  {n}
                </button>
              ))}
            </div>
            <button className="btn btn-secondary" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
              Next →
            </button>
          </div>
        </>
      )}
    </div>
  );
}
