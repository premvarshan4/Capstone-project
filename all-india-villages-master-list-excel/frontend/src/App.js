import React, { useState } from 'react';
import SearchBox from './components/SearchBox';
import BrowserView from './components/BrowserView';
import AdminPanel from './components/AdminPanel';
import B2BPortal from './components/B2BPortal';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('search');

  return (
    <div className="app-container">
      <nav className="navbar">
        <div className="nav-brand"> 🇮🇳 Bharat Villages</div>
        <div className="nav-tabs">
          <button className={`nav-tab ${activeTab === 'search' ? 'active' : ''}`} onClick={() => setActiveTab('search')}>🔍 Search</button>
          <button className={`nav-tab ${activeTab === 'browse' ? 'active' : ''}`} onClick={() => setActiveTab('browse')}>🗂️ Browse</button>
          <button className={`nav-tab ${activeTab === 'b2b' ? 'active' : ''}`} onClick={() => setActiveTab('b2b')}>🏢 B2B Portal</button>
          <button className={`nav-tab ${activeTab === 'admin' ? 'active' : ''}`} onClick={() => setActiveTab('admin')}>⚙️ Admin</button>
        </div>
      </nav>

      <main className="main-content">
        {activeTab === 'search' && <SearchBox />}
        {activeTab === 'browse' && <BrowserView />}
        {activeTab === 'b2b' && <B2BPortal />}
        {activeTab === 'admin' && <AdminPanel />}
      </main>

      <footer className="footer">
        <p>Village-level geographical data for all Indian states</p>
      </footer>
    </div>
  );
}

export default App;