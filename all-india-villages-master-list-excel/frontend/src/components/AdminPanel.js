import React, { useState, useEffect } from 'react';
import axios from 'axios';

// ✅ FIXED: Using production Railway URL instead of localhost
const API_BASE = 'https://capstone-backend-maxx-production.up.railway.app';

const mono = "'JetBrains Mono', monospace";
const sans = "'Space Grotesk', sans-serif";

export default function AdminPanel() {
  const [tab, setTab] = useState('dashboard');
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register' | 'forgot'
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('adminToken'));

  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const login = async () => {
    if (!email || !password) { setError('Please fill all fields'); return; }
    setLoading(true); setError('');
    try {
      const res = await axios.post(`${API_BASE}/api/auth/login`, { email, password });
      localStorage.setItem('adminToken', res.data.token);
      setToken(res.data.token);
      setError('');
    } catch { setError('Invalid credentials'); }
    setLoading(false);
  };

  const register = async () => {
    if (!email || !password || !name) { setError('Please fill all fields'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setLoading(true); setError('');
    try {
      const res = await axios.post(`${API_BASE}/api/auth/register`, { email, name, password });
      localStorage.setItem('adminToken', res.data.token);
      setToken(res.data.token);
      setError('');
    } catch (e) {
      setError(e.response?.data?.error || 'Registration failed');
    }
    setLoading(false);
  };

  const forgotPassword = async () => {
    if (!email) { setError('Please enter your email'); return; }
    setLoading(true); setError(''); setSuccess('');
    // Simulate sending reset email (you can integrate an email service later)
    await new Promise(r => setTimeout(r, 1500));
    setSuccess(`If ${email} is registered, you'll receive a reset link shortly. Please contact the admin at premvarshan4@gmail.com to reset your password.`);
    setLoading(false);
  };

  const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

  useEffect(() => {
    if (!token) return;
    axios.get(`${API_BASE}/api/admin/users`, authHeaders).then(r => setUsers(r.data)).catch(() => {});
    axios.get(`${API_BASE}/api/admin/logs`, authHeaders).then(r => setLogs(r.data)).catch(() => {});
    axios.get(`${API_BASE}/api/v1/stats`, { headers: { 'X-API-Key': 'key_5dm3lq4y7eo' } }).then(r => setStats(r.data)).catch(() => {});
  }, [token]);

  const inputStyle = {
    width: '100%', padding: '12px 16px', marginBottom: 12, borderRadius: 8,
    border: '1px solid rgba(0,180,216,0.25)', background: 'rgba(3,4,94,0.6)',
    color: 'white', fontFamily: sans, fontSize: 14, outline: 'none', boxSizing: 'border-box'
  };

  const resetForm = () => {
    setEmail(''); setPassword(''); setName(''); setConfirmPassword('');
    setError(''); setSuccess('');
  };

  const switchMode = (mode) => {
    setAuthMode(mode);
    resetForm();
  };

  // ── Auth Screen ───────────────────────────────────────────────────────────
  if (!token) return (
    <div style={{ maxWidth: 420, margin: '80px auto', padding: 40, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(0,180,216,0.2)', borderRadius: 20, backdropFilter: 'blur(10px)' }}>
      <div style={{ fontFamily: mono, fontSize: 11, color: 'rgba(0,180,216,0.6)', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 12 }}>admin access</div>

      {/* Title */}
      <h2 style={{ fontSize: 28, fontWeight: 700, color: 'white', marginBottom: 28, letterSpacing: -1 }}>
        {authMode === 'login' && <>Admin <span style={{ color: '#00B4D8' }}>Login</span></>}
        {authMode === 'register' && <>Create <span style={{ color: '#00B4D8' }}>Account</span></>}
        {authMode === 'forgot' && <>Reset <span style={{ color: '#00B4D8' }}>Password</span></>}
      </h2>

      {/* Error */}
      {error && (
        <div style={{ background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.3)', color: '#ff8a8a', padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontFamily: mono, fontSize: 12 }}>
          {error}
        </div>
      )}

      {/* Success */}
      {success && (
        <div style={{ background: 'rgba(82,183,136,0.1)', border: '1px solid rgba(82,183,136,0.3)', color: '#52B788', padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontFamily: mono, fontSize: 12 }}>
          {success}
        </div>
      )}

      {/* Register: Name field */}
      {authMode === 'register' && (
        <input placeholder="Full Name" value={name} onChange={e => setName(e.target.value)} style={inputStyle} />
      )}

      {/* Email */}
      <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} />

      {/* Password fields */}
      {authMode !== 'forgot' && (
        <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} style={inputStyle} />
      )}

      {/* Confirm Password for Register */}
      {authMode === 'register' && (
        <input placeholder="Confirm Password" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} style={inputStyle} />
      )}

      {/* Forgot Password link (only on login) */}
      {authMode === 'login' && (
        <div style={{ textAlign: 'right', marginBottom: 12, marginTop: -4 }}>
          <span onClick={() => switchMode('forgot')} style={{ fontFamily: mono, fontSize: 11, color: 'rgba(0,180,216,0.6)', cursor: 'pointer', textDecoration: 'underline' }}>
            Forgot password?
          </span>
        </div>
      )}

      {/* Submit Button */}
      <button
        onClick={authMode === 'login' ? login : authMode === 'register' ? register : forgotPassword}
        disabled={loading}
        style={{ width: '100%', padding: 14, background: loading ? 'rgba(0,119,182,0.4)' : 'linear-gradient(135deg, #0077B6, #00B4D8)', color: 'white', border: 'none', borderRadius: 8, cursor: loading ? 'not-allowed' : 'pointer', fontSize: 13, fontWeight: 700, fontFamily: sans, letterSpacing: 2, textTransform: 'uppercase', marginTop: 4 }}
      >
        {loading ? 'Please wait...' : authMode === 'login' ? 'Login' : authMode === 'register' ? 'Create Account' : 'Send Reset Link'}
      </button>

      {/* Switch between Login / Register */}
      <div style={{ marginTop: 20, textAlign: 'center', fontFamily: mono, fontSize: 12, color: 'rgba(144,224,239,0.5)' }}>
        {authMode === 'login' && (
          <>Don't have an account?{' '}
            <span onClick={() => switchMode('register')} style={{ color: '#00B4D8', cursor: 'pointer', textDecoration: 'underline' }}>Register</span>
          </>
        )}
        {authMode === 'register' && (
          <>Already have an account?{' '}
            <span onClick={() => switchMode('login')} style={{ color: '#00B4D8', cursor: 'pointer', textDecoration: 'underline' }}>Login</span>
          </>
        )}
        {authMode === 'forgot' && (
          <>Remember your password?{' '}
            <span onClick={() => switchMode('login')} style={{ color: '#00B4D8', cursor: 'pointer', textDecoration: 'underline' }}>Login</span>
          </>
        )}
      </div>
    </div>
  );

  // ── Admin Dashboard ───────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', minHeight: '80vh', gap: 24 }}>
      <div style={{ width: 220, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(0,180,216,0.2)', borderRadius: 16, padding: 24, backdropFilter: 'blur(10px)', height: 'fit-content' }}>
        <div style={{ fontFamily: mono, fontSize: 11, color: 'rgba(0,180,216,0.6)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 20 }}>// panel</div>
        {['dashboard', 'users', 'logs'].map(t => (
          <div key={t} onClick={() => setTab(t)} style={{ padding: '10px 14px', borderRadius: 8, marginBottom: 6, cursor: 'pointer', fontFamily: sans, fontSize: 14, fontWeight: 500, textTransform: 'capitalize', color: tab === t ? 'white' : 'rgba(144,224,239,0.6)', background: tab === t ? 'linear-gradient(135deg, rgba(0,119,182,0.4), rgba(0,180,216,0.2))' : 'transparent', border: tab === t ? '1px solid rgba(0,180,216,0.3)' : '1px solid transparent', transition: 'all 0.2s' }}>
            {t === 'dashboard' ? '◈ Dashboard' : t === 'users' ? '◉ Users' : '◎ Logs'}
          </div>
        ))}
        <div onClick={() => { localStorage.removeItem('adminToken'); setToken(null); resetForm(); setAuthMode('login'); }} style={{ padding: '10px 14px', borderRadius: 8, marginTop: 20, cursor: 'pointer', fontFamily: sans, fontSize: 14, color: 'rgba(255,107,107,0.7)', border: '1px solid transparent' }}>
          ⊘ Logout
        </div>
      </div>

      <div style={{ flex: 1 }}>
        {tab === 'dashboard' && (
          <div>
            <div style={{ fontFamily: mono, fontSize: 11, color: 'rgba(0,180,216,0.6)', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 12 }}>// overview</div>
            <h2 style={{ fontSize: 32, fontWeight: 700, color: 'white', letterSpacing: -1, marginBottom: 28 }}>Dashboard</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
              {[
                { label: 'total_villages', value: stats?.villages?.toLocaleString() || '...' },
                { label: 'total_states', value: stats?.states || '...' },
                { label: 'total_districts', value: stats?.districts || '...' },
                { label: 'total_users', value: users.length },
              ].map(card => (
                <div key={card.label} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(0,180,216,0.2)', borderRadius: 12, padding: 20, backdropFilter: 'blur(10px)' }}>
                  <div style={{ fontFamily: mono, fontSize: 11, color: 'rgba(0,180,216,0.6)', letterSpacing: 1, marginBottom: 10 }}>{card.label}</div>
                  <div style={{ fontSize: 28, fontWeight: 700, color: 'white', letterSpacing: -1 }}>{card.value}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'users' && (
          <div>
            <div style={{ fontFamily: mono, fontSize: 11, color: 'rgba(0,180,216,0.6)', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 12 }}>// registered users</div>
            <h2 style={{ fontSize: 32, fontWeight: 700, color: 'white', letterSpacing: -1, marginBottom: 28 }}>Users <span style={{ color: '#00B4D8', fontSize: 20 }}>({users.length})</span></h2>
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(0,180,216,0.2)', borderRadius: 12, overflow: 'hidden' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '60px 1fr 2fr 100px 100px 120px', background: 'rgba(0,180,216,0.08)', padding: '12px 20px', fontFamily: mono, fontSize: 11, color: 'rgba(0,180,216,0.6)', letterSpacing: 1, textTransform: 'uppercase' }}>
                {['ID', 'Name', 'Email', 'Plan', 'Status', 'Created'].map(h => <div key={h}>{h}</div>)}
              </div>
              {users.map((u, i) => (
                <div key={u.id} style={{ display: 'grid', gridTemplateColumns: '60px 1fr 2fr 100px 100px 120px', padding: '14px 20px', borderTop: '1px solid rgba(0,180,216,0.08)', fontFamily: sans, fontSize: 13, color: 'rgba(255,255,255,0.8)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)', alignItems: 'center' }}>
                  <div style={{ fontFamily: mono, color: 'rgba(0,180,216,0.5)' }}>#{u.id}</div>
                  <div style={{ fontWeight: 500, color: 'white' }}>{u.name}</div>
                  <div style={{ color: 'rgba(144,224,239,0.6)', fontFamily: mono, fontSize: 12 }}>{u.email}</div>
                  <div><span style={{ background: 'rgba(0,119,182,0.2)', color: '#00B4D8', padding: '3px 8px', borderRadius: 4, fontSize: 11, fontFamily: mono, border: '1px solid rgba(0,180,216,0.2)' }}>{u.planType}</span></div>
                  <div><span style={{ background: u.active ? 'rgba(82,183,136,0.15)' : 'rgba(255,107,107,0.15)', color: u.active ? '#52B788' : '#ff6b6b', padding: '3px 8px', borderRadius: 4, fontSize: 11, fontFamily: mono }}>{u.active ? 'active' : 'inactive'}</span></div>
                  <div style={{ color: 'rgba(144,224,239,0.4)', fontFamily: mono, fontSize: 11 }}>{new Date(u.createdAt).toLocaleDateString()}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'logs' && (
          <div>
            <div style={{ fontFamily: mono, fontSize: 11, color: 'rgba(0,180,216,0.6)', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 12 }}>// api activity</div>
            <h2 style={{ fontSize: 32, fontWeight: 700, color: 'white', letterSpacing: -1, marginBottom: 28 }}>Logs <span style={{ color: '#00B4D8', fontSize: 20 }}>({logs.length})</span></h2>
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(0,180,216,0.2)', borderRadius: 12, overflow: 'hidden' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '160px 2fr 80px 80px 100px', background: 'rgba(0,180,216,0.08)', padding: '12px 20px', fontFamily: mono, fontSize: 11, color: 'rgba(0,180,216,0.6)', letterSpacing: 1, textTransform: 'uppercase' }}>
                {['Time', 'Endpoint', 'Method', 'Status', 'Response'].map(h => <div key={h}>{h}</div>)}
              </div>
              {logs.map((l, i) => (
                <div key={l.id} style={{ display: 'grid', gridTemplateColumns: '160px 2fr 80px 80px 100px', padding: '12px 20px', borderTop: '1px solid rgba(0,180,216,0.08)', fontFamily: mono, fontSize: 12, color: 'rgba(255,255,255,0.7)', background: i % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.02)', alignItems: 'center' }}>
                  <div style={{ color: 'rgba(144,224,239,0.4)', fontSize: 11 }}>{new Date(l.createdAt).toLocaleString()}</div>
                  <div style={{ color: '#90E0EF' }}>{l.endpoint}</div>
                  <div style={{ color: 'rgba(0,180,216,0.7)' }}>{l.method}</div>
                  <div><span style={{ background: l.statusCode < 400 ? 'rgba(82,183,136,0.15)' : 'rgba(255,107,107,0.15)', color: l.statusCode < 400 ? '#52B788' : '#ff6b6b', padding: '2px 8px', borderRadius: 4, fontSize: 11 }}>{l.statusCode}</span></div>
                  <div style={{ color: 'rgba(144,224,239,0.5)' }}>{l.responseTime}ms</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
