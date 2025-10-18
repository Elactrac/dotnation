import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import WalletConnect from '../components/WalletConnect';
import './LandingPage.css'; // Reusing styles

const DashboardLayout = () => {
  return (
    <div className="content-wrapper">
      <header className="header">
        <nav className="container nav-bar">
          <Link to="/dashboard" className="logo">Dot<span>Nation</span></Link>
          <div className="nav-links">
            <Link to="/dashboard">Campaigns</Link>
            <Link to="/dashboard/create-campaign">Create Campaign</Link>
          </div>
          <div>
            <WalletConnect />
          </div>
        </nav>
      </header>
      <main style={{ padding: '2rem 0'}}>
        <div className="container">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;