import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import './AuthPage.css';

export default function AuthPage() {
  const { login } = useAuth();
  const [mode, setMode] = useState('signin'); // 'signin' | 'signup'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Sign In form
  const [signInForm, setSignInForm] = useState({ username: '', password: '' });

  // Sign Up form
  const [signUpForm, setSignUpForm] = useState({
    username: '', firstName: '', lastName: '',
    email: '', phoneNumber: '', address: '',
    role: 'MEMBER', maxBorrowLimit: 5, password: ''
  });

  const clearMessages = () => { setError(''); setSuccess(''); };

  const handleSignIn = async (e) => {
    e.preventDefault();
    clearMessages();
    if (!signInForm.username.trim() || !signInForm.password.trim()) {
      setError('Please fill in all fields.');
      return;
    }
    setLoading(true);
    try {
      const res = await authAPI.login(signInForm.username.trim(), signInForm.password);
      login(res.data.user);
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    clearMessages();
    if (!signUpForm.username || !signUpForm.firstName || !signUpForm.email || !signUpForm.password) {
      setError('Please fill in all required fields.');
      return;
    }
    if (signUpForm.password.length < 4) {
      setError('Password must be at least 4 characters.');
      return;
    }
    setLoading(true);
    try {
      const { password, ...payload } = signUpForm;
      await authAPI.register({ ...payload, maxBorrowLimit: Number(payload.maxBorrowLimit) });
      setSuccess('Account created! You can now sign in with your username.');
      setMode('signin');
      setSignInForm({ username: signUpForm.username, password: '' });
    } catch (err) {
      setError(err.message || 'Registration failed. Username or email may already exist.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-root">
      {/* Animated background */}
      <div className="auth-bg">
        <div className="auth-orb orb-1" />
        <div className="auth-orb orb-2" />
        <div className="auth-orb orb-3" />
      </div>

      <div className="auth-container">
        {/* Left panel — branding */}
        <div className="auth-brand">
          <div className="brand-logo">
            <span className="brand-icon">📚</span>
          </div>
          <h1 className="brand-title">DigiLib</h1>
          <p className="brand-tagline">Your Digital Library, Reimagined</p>
          <div className="brand-features">
            <div className="brand-feature">
              <span className="bf-icon">🔍</span>
              <div>
                <div className="bf-title">Smart Catalog</div>
                <div className="bf-sub">Search thousands of books instantly</div>
              </div>
            </div>
            <div className="brand-feature">
              <span className="bf-icon">📋</span>
              <div>
                <div className="bf-title">Easy Borrowing</div>
                <div className="bf-sub">Borrow & return with one click</div>
              </div>
            </div>
            <div className="brand-feature">
              <span className="bf-icon">🛡️</span>
              <div>
                <div className="bf-title">Role-Based Access</div>
                <div className="bf-sub">Admin, Librarian & Member portals</div>
              </div>
            </div>
          </div>
          <div className="brand-demo-hint">
            <div className="demo-title">Demo Accounts</div>
            <div className="demo-accounts">
              <div className="demo-account">
                <span className="demo-role admin">ADMIN</span>
                <code>admin</code>
              </div>
              <div className="demo-account">
                <span className="demo-role librarian">LIBRARIAN</span>
                <code>librarian1</code>
              </div>
              <div className="demo-account">
                <span className="demo-role member">MEMBER</span>
                <code>john_doe</code>
              </div>
            </div>
            <div className="demo-note">Use any password to log in</div>
          </div>
        </div>

        {/* Right panel — form */}
        <div className="auth-form-panel">
          {/* Tab switcher */}
          <div className="auth-tabs">
            <button
              className={`auth-tab ${mode === 'signin' ? 'active' : ''}`}
              onClick={() => { setMode('signin'); clearMessages(); }}
            >
              Sign In
            </button>
            <button
              className={`auth-tab ${mode === 'signup' ? 'active' : ''}`}
              onClick={() => { setMode('signup'); clearMessages(); }}
            >
              Sign Up
            </button>
            <div className={`auth-tab-indicator ${mode === 'signup' ? 'right' : ''}`} />
          </div>

          {/* Messages */}
          {error   && <div className="auth-alert auth-alert-error">⚠️ {error}</div>}
          {success && <div className="auth-alert auth-alert-success">✅ {success}</div>}

          {/* ── SIGN IN ── */}
          {mode === 'signin' && (
            <form className="auth-form" onSubmit={handleSignIn} noValidate>
              <div className="auth-welcome">
                <h2>Welcome back!</h2>
                <p>Sign in to access your library portal</p>
              </div>

              <div className="auth-field">
                <label htmlFor="signin-username">Username</label>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon">👤</span>
                  <input
                    id="signin-username"
                    type="text"
                    placeholder="Enter your username"
                    value={signInForm.username}
                    onChange={e => setSignInForm({ ...signInForm, username: e.target.value })}
                    autoFocus
                    autoComplete="username"
                  />
                </div>
              </div>

              <div className="auth-field">
                <label htmlFor="signin-password">Password</label>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon">🔒</span>
                  <input
                    id="signin-password"
                    type="password"
                    placeholder="Enter your password"
                    value={signInForm.password}
                    onChange={e => setSignInForm({ ...signInForm, password: e.target.value })}
                    autoComplete="current-password"
                  />
                </div>
              </div>

              <button type="submit" className="auth-submit-btn" disabled={loading} id="signin-btn">
                {loading ? <span className="auth-spinner" /> : ''}
                {loading ? 'Signing in…' : 'Sign In →'}
              </button>

              <p className="auth-switch-text">
                Don't have an account?{' '}
                <button type="button" className="auth-link" onClick={() => { setMode('signup'); clearMessages(); }}>
                  Create one
                </button>
              </p>
            </form>
          )}

          {/* ── SIGN UP ── */}
          {mode === 'signup' && (
            <form className="auth-form" onSubmit={handleSignUp} noValidate>
              <div className="auth-welcome">
                <h2>Create Account</h2>
                <p>Join the digital library community</p>
              </div>

              <div className="auth-grid-2">
                <div className="auth-field">
                  <label htmlFor="su-firstname">First Name *</label>
                  <div className="auth-input-wrap">
                    <span className="auth-input-icon">✏️</span>
                    <input
                      id="su-firstname"
                      type="text"
                      placeholder="First name"
                      value={signUpForm.firstName}
                      onChange={e => setSignUpForm({ ...signUpForm, firstName: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="auth-field">
                  <label htmlFor="su-lastname">Last Name</label>
                  <div className="auth-input-wrap">
                    <span className="auth-input-icon">✏️</span>
                    <input
                      id="su-lastname"
                      type="text"
                      placeholder="Last name"
                      value={signUpForm.lastName}
                      onChange={e => setSignUpForm({ ...signUpForm, lastName: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="auth-field">
                <label htmlFor="su-username">Username *</label>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon">👤</span>
                  <input
                    id="su-username"
                    type="text"
                    placeholder="Choose a username"
                    value={signUpForm.username}
                    onChange={e => setSignUpForm({ ...signUpForm, username: e.target.value })}
                    required
                    autoComplete="username"
                  />
                </div>
              </div>

              <div className="auth-field">
                <label htmlFor="su-email">Email *</label>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon">📧</span>
                  <input
                    id="su-email"
                    type="email"
                    placeholder="your@email.com"
                    value={signUpForm.email}
                    onChange={e => setSignUpForm({ ...signUpForm, email: e.target.value })}
                    required
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="auth-grid-2">
                <div className="auth-field">
                  <label htmlFor="su-phone">Phone</label>
                  <div className="auth-input-wrap">
                    <span className="auth-input-icon">📱</span>
                    <input
                      id="su-phone"
                      type="tel"
                      placeholder="Phone number"
                      value={signUpForm.phoneNumber}
                      onChange={e => setSignUpForm({ ...signUpForm, phoneNumber: e.target.value })}
                    />
                  </div>
                </div>
                <div className="auth-field">
                  <label htmlFor="su-role">Role</label>
                  <div className="auth-input-wrap">
                    <span className="auth-input-icon">🎭</span>
                    <select
                      id="su-role"
                      value={signUpForm.role}
                      onChange={e => setSignUpForm({ ...signUpForm, role: e.target.value })}
                    >
                      <option value="MEMBER">Member (Student)</option>
                      <option value="LIBRARIAN">Librarian</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="auth-field">
                <label htmlFor="su-password">Password *</label>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon">🔒</span>
                  <input
                    id="su-password"
                    type="password"
                    placeholder="Create a password (min 4 chars)"
                    value={signUpForm.password}
                    onChange={e => setSignUpForm({ ...signUpForm, password: e.target.value })}
                    required
                    autoComplete="new-password"
                  />
                </div>
              </div>

              <button type="submit" className="auth-submit-btn" disabled={loading} id="signup-btn">
                {loading ? <span className="auth-spinner" /> : ''}
                {loading ? 'Creating account…' : 'Create Account →'}
              </button>

              <p className="auth-switch-text">
                Already have an account?{' '}
                <button type="button" className="auth-link" onClick={() => { setMode('signin'); clearMessages(); }}>
                  Sign in
                </button>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
