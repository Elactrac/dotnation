
import { Outlet, Link } from 'react-router-dom';
import WalletConnect from '../components/WalletConnect.jsx';
import './Dashboard.css';

const DashboardLayout = () => {
  return (
    <div className="dashboard-layout">
      <header className="header">
        <nav className="container nav-bar">
          <Link to="/dashboard" className="logo">Dot<span>Nation</span></Link>
           <div className="nav-links">
             <Link to="/dashboard">Campaigns</Link>
             <Link to="/dashboard/browse">Browse</Link>
             <Link to="/dashboard/create-campaign">Create</Link>
             <Link to="/dashboard/my-campaigns">My Campaigns</Link>
             <Link to="/dashboard/my-donations">My Donations</Link>
             <Link to="/dashboard/profile">Profile</Link>
           </div>
          <WalletConnect />
        </nav>
      </header>
      <main className="dashboard-main">
        <div className="container">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;