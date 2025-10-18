import React from 'react';
import './Dashboard.css';

// A reusable card component for the dashboard
const DashboardCard = ({ title, children, ctaText, ctaIcon }) => (
  <div className="dashboard-card">
    <h3>{title}</h3>
    <div className="dashboard-card-content">
      {children}
    </div>
    {ctaText && (
      <a href="#" className="dashboard-card-cta">
        {ctaIcon}
        {ctaText}
      </a>
    )}
  </div>
);

const DashboardPage = () => {
  return (
    <div className="container dashboard-page">
      <div className="dashboard-header">
        <h1>Welcome Back</h1>
        <a href="#" className="btn btn-primary">Create New Campaign</a>
      </div>

      <div className="dashboard-grid">
        <DashboardCard title="My Active Campaigns">
          <p>You have no active campaigns. Start one today to bring your ideas to life.</p>
        </DashboardCard>
        <DashboardCard title="Recent Donations">
          <p>No recent donations to show.</p>
        </DashboardCard>
        <DashboardCard title="Account Overview">
          <p>Connect your wallet to see your account details and manage your funds.</p>
        </DashboardCard>
      </div>
    </div>
  );
};

export default DashboardPage;