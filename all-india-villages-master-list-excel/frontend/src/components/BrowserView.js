import React, { useState, useEffect } from 'react';
import { villageAPI } from '../services/villageAPI';

function BrowserView() {
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [subdistricts, setSubdistricts] = useState([]);
  const [villages, setVillages] = useState([]);
  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedSubdistrict, setSelectedSubdistrict] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try { const data = await villageAPI.getStates(); setStates(data); }
      catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  useEffect(() => {
    if (!selectedState) { setDistricts([]); return; }
    const load = async () => {
      setLoading(true);
      try { const data = await villageAPI.getDistricts(selectedState); setDistricts(data); setSelectedDistrict(''); setSubdistricts([]); setVillages([]); }
      catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, [selectedState]);

  useEffect(() => {
    if (!selectedState || !selectedDistrict) { setSubdistricts([]); return; }
    const load = async () => {
      setLoading(true);
      try { const data = await villageAPI.getSubdistricts(selectedState, selectedDistrict); setSubdistricts(data); setSelectedSubdistrict(''); setVillages([]); }
      catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, [selectedState, selectedDistrict]);

  useEffect(() => {
    if (!selectedState || !selectedDistrict || !selectedSubdistrict) { setVillages([]); return; }
    const load = async () => {
      setLoading(true);
      try { const data = await villageAPI.getVillages(selectedState, selectedDistrict, selectedSubdistrict); setVillages(data); }
      catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, [selectedState, selectedDistrict, selectedSubdistrict]);

  const selectStyle = {
    width: '100%',
    padding: '12px 16px',
    border: '1px solid rgba(0,180,216,0.25)',
    borderRadius: 8,
    fontFamily: "'Space Grotesk', sans-serif",
    fontSize: 14,
    color: 'white',
    background: 'rgba(3,4,94,0.6)',
    cursor: 'pointer',
    outline: 'none',
  };

  return (
    <div style={{ maxWidth: 900, margin: '60px auto', padding: '0 16px' }}>

      <div style={{ textAlign: 'center', marginBottom: 48 }}>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: 'rgba(0,180,216,0.6)', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 16 }}>
         hierarchical explorer
        </div>
        <h1 style={{ fontSize: 52, fontWeight: 700, color: 'white', letterSpacing: -2, lineHeight: 1, marginBottom: 12 }}>
          Browse <span style={{ color: '#00B4D8' }}>Villages</span>
        </h1>
        <p style={{ color: 'rgba(144,224,239,0.5)', fontFamily: "'JetBrains Mono', monospace", fontSize: 13 }}>
          Navigate state → district → subdistrict → village
        </p>
      </div>

      <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(0,180,216,0.2)', borderRadius: 16, padding: 28, backdropFilter: 'blur(10px)', marginBottom: 24 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
          {[
            { label: 'State', value: selectedState, onChange: e => setSelectedState(e.target.value), options: states, disabled: false, placeholder: 'Select state...' },
            { label: 'District', value: selectedDistrict, onChange: e => setSelectedDistrict(e.target.value), options: districts, disabled: !selectedState, placeholder: 'Select district...' },
            { label: 'Subdistrict', value: selectedSubdistrict, onChange: e => setSelectedSubdistrict(e.target.value), options: subdistricts, disabled: !selectedDistrict, placeholder: 'Select subdistrict...' },
          ].map(({ label, value, onChange, options, disabled, placeholder }) => (
            <div key={label}>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: '#00B4D8', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 8 }}>
                {label}
              </div>
              <select value={value} onChange={onChange} disabled={disabled} style={{ ...selectStyle, opacity: disabled ? 0.4 : 1 }}>
                <option value="">{placeholder}</option>
                {options.map(opt => (
                  <option key={opt.code || opt.name} value={opt.name}>{opt.name}</option>
                ))}
              </select>
            </div>
          ))}
        </div>
      </div>

      {loading && (
        <div style={{ textAlign: 'center', color: '#00B4D8', fontFamily: "'JetBrains Mono', monospace", fontSize: 13, padding: 20, letterSpacing: 2 }}>
          // loading data...
        </div>
      )}

      {villages.length > 0 && (
        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(0,180,216,0.2)', borderRadius: 16, padding: 24, backdropFilter: 'blur(10px)' }}>
          <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: '#00B4D8', letterSpacing: 1, marginBottom: 20, opacity: 0.8 }}>
            // {villages.length} villages in {selectedSubdistrict}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
            {villages.map((v, i) => (
              <div key={i} style={{ background: 'rgba(0,180,216,0.07)', border: '1px solid rgba(0,180,216,0.15)', padding: '10px 14px', borderRadius: 8, fontSize: 13, color: '#90E0EF', fontFamily: "'JetBrains Mono', monospace", transition: 'background 0.15s', cursor: 'default' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,180,216,0.15)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,180,216,0.07)'}
              >
                {v.name || v}
                {v.code && <div style={{ fontSize: 10, color: 'rgba(144,224,239,0.3)', marginTop: 3 }}>{v.code}</div>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default BrowserView;