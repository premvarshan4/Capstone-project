import React, { useState } from 'react';
import axios from 'axios';

const API_BASE = 'http://127.0.0.1:8000';
const mono = "'JetBrains Mono', monospace";
const sans = "'Space Grotesk', sans-serif";

export default function B2BPortal() {
  const [screen, setScreen] = useState('home');
  const [token, setToken] = useState(localStorage.getItem('b2bToken'));
  const [user, setUser] = useState(null);
  const [apiKeys, setApiKeys] = useState([]);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [newKey, setNewKey] = useState(null);

  const register = async () => {
    try {
      await axios.post(`${API_BASE}/api/auth/register`, form);
      setSuccess('Account created! You can now login.');
      setScreen('login'); setError('');
    } catch (e) { setError(e.response?.data?.error || 'Registration failed'); }
  };

  const login = async () => {
    try {
      const res = await axios.post(`${API_BASE}/api/auth/login`, form);
      localStorage.setItem('b2bToken', res.data.token);
      setToken(res.data.token); setUser(res.data.user);
      setScreen('dashboard'); loadKeys(res.data.token); setError('');
    } catch { setError('Invalid credentials'); }
  };

  const loadKeys = async (t) => {
    try {
      const res = await axios.get(`${API_BASE}/api/b2b/keys`, { headers: { Authorization: `Bearer ${t || token}` } });
      setApiKeys(res.data);
    } catch {}
  };

  const createKey = async () => {
    try {
      const res = await axios.post(`${API_BASE}/api/b2b/keys`, { name: 'My API Key' }, { headers: { Authorization: `Bearer ${token}` } });
      setNewKey(res.data); loadKeys();
    } catch (e) { setError(e.response?.data?.error || 'Failed to create key'); }
  };

  const logout = () => { localStorage.removeItem('b2bToken'); setToken(null); setUser(null); setScreen('home'); };

  const inputStyle = { width: '100%', padding: '12px 16px', marginBottom: 12, borderRadius: 8, border: '1px solid rgba(0,180,216,0.25)', background: 'rgba(3,4,94,0.6)', color: 'white', fontFamily: sans, fontSize: 14, outline: 'none', boxSizing: 'border-box' };

  if (screen === 'home') return (
    <div style={{ maxWidth: 700, margin: '60px auto', padding: '0 16px' }}>
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <div style={{ fontFamily: mono, fontSize: 11, color: 'rgba(0,180,216,0.6)', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 16 }}>api access plans</div>
        <h1 style={{ fontSize: 52, fontWeight: 700, color: 'white', letterSpacing: -2, marginBottom: 12 }}>Bharat Villages <span style={{ color: '#00B4D8' }}>API</span></h1>
        <p style={{ color: 'rgba(144,224,239,0.5)', fontFamily: mono, fontSize: 13 }}>Production-grade village data for India's builders</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginBottom: 40 }}>
        {[
          { plan: 'Free', price: '$0', req: '5,000 req/day', color: '#52B788' },
          { plan: 'Premium', price: '$49/mo', req: '50,000 req/day', color: '#00B4D8' },
          { plan: 'Pro', price: '$199/mo', req: '3,00,000 req/day', color: '#0077B6' },
          { plan: 'Unlimited', price: '$499/mo', req: '10,00,000 req/day', color: '#FF8C61' },
        ].map(({ plan, price, req, color }) => (
          <div key={plan} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(0,180,216,0.15)', borderRadius: 16, padding: 24, backdropFilter: 'blur(10px)', transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.border = `1px solid ${color}40`; e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; }}
            onMouseLeave={e => { e.currentTarget.style.border = '1px solid rgba(0,180,216,0.15)'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
          >
            <div style={{ fontFamily: mono, fontSize: 11, color: 'rgba(144,224,239,0.5)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>{plan}</div>
            <div style={{ fontSize: 28, fontWeight: 700, color, marginBottom: 6, letterSpacing: -1 }}>{price}</div>
            <div style={{ fontFamily: mono, fontSize: 12, color: 'rgba(144,224,239,0.4)' }}>{req}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
        <button onClick={() => setScreen('register')} style={{ padding: '14px 36px', background: 'linear-gradient(135deg, #0077B6, #00B4D8)', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 700, fontFamily: sans, letterSpacing: 2, textTransform: 'uppercase' }}>Get Started Free</button>
        <button onClick={() => setScreen('login')} style={{ padding: '14px 36px', background: 'transparent', color: '#00B4D8', border: '1px solid rgba(0,180,216,0.4)', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 700, fontFamily: sans, letterSpacing: 2, textTransform: 'uppercase' }}>Login</button>
      </div>
    </div>
  );

  if (screen === 'register' || screen === 'login') return (
    <div style={{ maxWidth: 420, margin: '80px auto', padding: 40, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(0,180,216,0.2)', borderRadius: 20, backdropFilter: 'blur(10px)' }}>
      <div style={{ fontFamily: mono, fontSize: 11, color: 'rgba(0,180,216,0.6)', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 12 }}>// {screen === 'register' ? 'create account' : 'welcome back'}</div>
      <h2 style={{ fontSize: 28, fontWeight: 700, color: 'white', marginBottom: 28, letterSpacing: -1 }}>{screen === 'register' ? 'Register' : 'Login'}</h2>
      {error && <div style={{ background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.3)', color: '#ff8a8a', padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontFamily: mono, fontSize: 12 }}>{error}</div>}
      {success && <div style={{ background: 'rgba(82,183,136,0.1)', border: '1px solid rgba(82,183,136,0.3)', color: '#52B788', padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontFamily: mono, fontSize: 12 }}>{success}</div>}
      {screen === 'register' && <input placeholder="Full Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={inputStyle} />}
      <input placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} style={inputStyle} />
      <input placeholder="Password" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} style={inputStyle} />
      <button onClick={screen === 'register' ? register : login} style={{ width: '100%', padding: 14, background: 'linear-gradient(135deg, #0077B6, #00B4D8)', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 700, fontFamily: sans, letterSpacing: 2, textTransform: 'uppercase', marginTop: 4 }}>
        {screen === 'register' ? 'Create Account' : 'Login'}
      </button>
      <p style={{ textAlign: 'center', marginTop: 16, fontSize: 13, color: 'rgba(144,224,239,0.5)', fontFamily: mono }}>
        {screen === 'register' ? 'Already have an account? ' : 'No account? '}
        <span onClick={() => setScreen(screen === 'register' ? 'login' : 'register')} style={{ color: '#00B4D8', cursor: 'pointer' }}>
          {screen === 'register' ? 'login' : 'register'}
        </span>
      </p>
    </div>
  );

  return (
    <div style={{ maxWidth: 800, margin: '60px auto', padding: '0 16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 36 }}>
        <div>
          <div style={{ fontFamily: mono, fontSize: 11, color: 'rgba(0,180,216,0.6)', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 8 }}>// dashboard</div>
          <h2 style={{ fontSize: 32, fontWeight: 700, color: 'white', letterSpacing: -1 }}>Welcome, <span style={{ color: '#00B4D8' }}>{user?.name || 'User'}</span></h2>
        </div>
        <button onClick={logout} style={{ padding: '10px 20px', background: 'rgba(255,107,107,0.1)', color: '#ff8a8a', border: '1px solid rgba(255,107,107,0.2)', borderRadius: 8, cursor: 'pointer', fontFamily: mono, fontSize: 12, letterSpacing: 1 }}>⊘ logout</button>
      </div>

      <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(0,180,216,0.2)', borderRadius: 16, padding: 28, marginBottom: 24, backdropFilter: 'blur(10px)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ fontFamily: mono, fontSize: 11, color: 'rgba(0,180,216,0.6)', letterSpacing: 2, textTransform: 'uppercase' }}>// api_keys</div>
          <button onClick={createKey} style={{ padding: '10px 20px', background: 'linear-gradient(135deg, #0077B6, #00B4D8)', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontFamily: mono, fontSize: 12, letterSpacing: 1 }}>+ create_key</button>
        </div>

        {newKey && (
          <div style={{ background: 'rgba(82,183,136,0.08)', border: '1px solid rgba(82,183,136,0.25)', borderRadius: 10, padding: 16, marginBottom: 20 }}>
            <div style={{ fontFamily: mono, fontSize: 11, color: '#52B788', letterSpacing: 1, marginBottom: 10 }}>// save secret — shown only once</div>
            <div style={{ fontFamily: mono, fontSize: 13, color: '#90E0EF', marginBottom: 6 }}>key: <span style={{ color: 'white' }}>{newKey.key}</span></div>
            <div style={{ fontFamily: mono, fontSize: 13, color: '#90E0EF' }}>secret: <span style={{ color: '#52B788' }}>{newKey.secret}</span></div>
          </div>
        )}

        {error && <div style={{ background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.3)', color: '#ff8a8a', padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontFamily: mono, fontSize: 12 }}>{error}</div>}

        {apiKeys.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 0', fontFamily: mono, fontSize: 13, color: 'rgba(144,224,239,0.3)', letterSpacing: 1 }}>// no keys yet — create one to get started</div>
        ) : (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 120px 80px', background: 'rgba(0,180,216,0.08)', padding: '10px 16px', borderRadius: 8, fontFamily: mono, fontSize: 11, color: 'rgba(0,180,216,0.6)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>
              {['Key', 'Created', 'Status', 'Actions'].map(h => <div key={h}>{h}</div>)}
            </div>
            {apiKeys.map(k => (
              <div key={k.id} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 120px 80px', padding: '12px 16px', borderBottom: '1px solid rgba(0,180,216,0.08)', fontFamily: mono, fontSize: 12, color: 'rgba(255,255,255,0.7)', alignItems: 'center' }}>
                <div style={{ color: '#90E0EF' }}>{k.key.slice(0, 12)}****</div>
                <div style={{ color: 'rgba(144,224,239,0.4)', fontSize: 11 }}>{new Date(k.createdAt).toLocaleDateString()}</div>
                <div><span style={{ background: 'rgba(82,183,136,0.15)', color: '#52B788', padding: '3px 8px', borderRadius: 4, fontSize: 11 }}>active</span></div>
                <div style={{ color: 'rgba(255,107,107,0.6)', cursor: 'pointer', fontSize: 11 }}>revoke</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(0,180,216,0.2)', borderRadius: 16, padding: 24, backdropFilter: 'blur(10px)' }}>
        <div style={{ fontFamily: mono, fontSize: 11, color: 'rgba(0,180,216,0.6)', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 16 }}>// quick_start</div>
        <pre style={{ background: 'rgba(3,4,94,0.8)', border: '1px solid rgba(0,180,216,0.15)', color: '#90E0EF', padding: 20, borderRadius: 10, fontSize: 13, overflow: 'auto', lineHeight: 1.7 }}>
{`curl -H "X-API-Key: YOUR_KEY" \\
  http://127.0.0.1:8000/api/v1/search?q=Mumbai

# Response:
[{ "village": "Mumbai", "district": "Mumbai", 
   "state": "Maharashtra" }]`}
        </pre>
      </div>
    </div>
  );
}