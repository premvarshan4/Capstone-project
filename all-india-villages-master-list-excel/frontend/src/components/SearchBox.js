import React, { useState } from 'react';
import { villageAPI } from '../services/villageAPI';

function SearchBox() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) { setError('Please enter a village name'); return; }
    setLoading(true); setError(null); setResults([]);
    try {
      const data = await villageAPI.searchVillages(query);
      setResults(data);
      if (data.length === 0) setError('No villages found');
    } catch (err) {
      setError('Error connecting to server: ' + (err.message || 'Unknown error'));
    } finally { setLoading(false); }
  };

  return (
    <div style={{ maxWidth: 720, margin: '60px auto', padding: '0 16px' }}>
      
      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: 'rgba(0,180,216,0.6)', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 16 }}>
          india village database
        </div>
        <h1 style={{ fontSize: 52, fontWeight: 700, color: 'white', letterSpacing: -2, lineHeight: 1, marginBottom: 12 }}>
          Village <span style={{ color: '#00B4D8' }}>Search</span>
        </h1>
        <p style={{ color: 'rgba(144,224,239,0.5)', fontFamily: "'JetBrains Mono', monospace", fontSize: 13 }}>
          Query across 462,876 villages in India
        </p>
      </div>

      <form onSubmit={handleSearch} style={{ display: 'flex', gap: 0, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(0,180,216,0.3)', borderRadius: 12, overflow: 'hidden', backdropFilter: 'blur(10px)', marginBottom: 24 }}>
        <input
          type="text"
          placeholder="Search village name..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          style={{ flex: 1, border: 'none', outline: 'none', padding: '18px 24px', fontSize: 16, fontFamily: "'Space Grotesk', sans-serif", background: 'transparent', color: 'white' }}
        />
        <button type="submit" disabled={loading} style={{ background: 'linear-gradient(135deg, #0077B6, #00B4D8)', color: 'white', border: 'none', padding: '18px 36px', cursor: 'pointer', fontSize: 13, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", letterSpacing: 2, textTransform: 'uppercase', transition: 'opacity 0.2s' }}>
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {error && (
        <div style={{ background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.3)', color: '#ff8a8a', padding: '12px 16px', borderRadius: 8, marginBottom: 16, fontFamily: "'JetBrains Mono', monospace", fontSize: 13 }}>
          {error}
        </div>
      )}

      {results.length > 0 && (
        <div>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: '#00B4D8', letterSpacing: 1, marginBottom: 16, opacity: 0.8 }}>
            // found {results.length} results
          </div>
          {results.map((item, index) => (
            <div key={index} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(0,180,216,0.15)', borderRadius: 10, padding: '14px 20px', marginBottom: 8, cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,180,216,0.08)'; e.currentTarget.style.borderColor = 'rgba(0,180,216,0.4)'; e.currentTarget.style.transform = 'translateX(6px)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(0,180,216,0.15)'; e.currentTarget.style.transform = 'translateX(0)'; }}
            >
              <div style={{ fontSize: 16, fontWeight: 600, color: 'white', marginBottom: 8 }}>{item.village}</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {[item.subdistrict, item.district, item.state].filter(Boolean).map((tag, i) => (
                  <span key={i} style={{ background: 'rgba(0,180,216,0.12)', color: '#90E0EF', padding: '3px 10px', borderRadius: 4, fontSize: 12, border: '1px solid rgba(0,180,216,0.2)', fontFamily: "'JetBrains Mono', monospace" }}>
                    {tag}
                  </span>
                ))}
              </div>
              {item.code && <div style={{ fontSize: 11, color: 'rgba(144,224,239,0.3)', marginTop: 6, fontFamily: "'JetBrains Mono', monospace" }}>code: {item.code}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SearchBox;