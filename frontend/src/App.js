import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { WalletProvider } from './contexts/WalletContext';
import { ApiProvider } from './contexts/ApiContext';
import { CampaignProvider } from './contexts/CampaignContext';
import { WalletConnect } from './components/WalletConnect';
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import './App.css';

function App() {
  console.log('App component rendering...');
  
  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <div style={{ background: '#2563eb', color: 'white', padding: '20px' }}>
        <h1>🎉 DotNation is Loading...</h1>
      </div>
      <Router>
        <WalletProvider>
          <ApiProvider>
            <CampaignProvider>
              <div className="app">
                <header className="app-header">
                  <div className="container">
                    <div className="header-content">
                      <Link to="/" className="logo">
                        <h1>DotNation</h1>
                      </Link>
                      <WalletConnect />
                    </div>
                  </div>
                </header>
                <main className="app-main">
                  <div className="container">
                    <div style={{ background: 'white', padding: '20px', borderRadius: '8px', marginTop: '20px' }}>
                      <h2>Welcome to DotNation!</h2>
                      <p>A decentralized donation platform on Polkadot.</p>
                    </div>
                  </div>
                  <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/dashboard" element={<DashboardPage />} />
                  </Routes>
                </main>
              </div>
            </CampaignProvider>
          </ApiProvider>
        </WalletProvider>
      </Router>
    </div>
  );
}

export default App;
