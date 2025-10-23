import { useEffect } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useWallet } from '../contexts/WalletContext';

const NewDashboardLayout = () => {
  const { accounts, selectedAccount, connectWallet, selectAccount, disconnectWallet } = useWallet();
  const navigate = useNavigate();

  useEffect(() => {
    // Mouse follower effect
    const handleMouseMove = (e) => {
      const follower = document.getElementById('mouse-follower');
      if (follower) {
        follower.style.left = `${e.clientX}px`;
        follower.style.top = `${e.clientY}px`;
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col overflow-x-hidden bg-background-dark font-body text-white/90">
      {/* Mouse Follower */}
      <div
        id="mouse-follower"
        className="fixed top-0 left-0 w-24 h-24 bg-primary/20 rounded-full pointer-events-none blur-3xl z-0 -translate-x-1/2 -translate-y-1/2"
      />

      {/* Background Gradient */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[200%] h-[200%] pointer-events-none">
        <div className="absolute inset-0 bg-background-dark bg-[radial-gradient(circle_at_center,rgba(238,43,140,0.1)_0%,transparent_30%)] animate-pulse-slow" />
      </div>

      {/* Main Layout Container */}
      <div className="layout-container flex h-full grow flex-col z-10">
        {/* Header */}
        <header className="sticky top-0 z-50 flex items-center justify-between whitespace-nowrap px-10 py-4 border-b border-white/10 backdrop-blur-md bg-background-dark/50">
          <div className="flex items-center gap-3 text-white">
            <Link to="/" className="flex items-center gap-3">
              <svg
                className="text-primary size-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
                <circle cx="12" cy="12" fill="currentColor" r="4" />
              </svg>
              <h2 className="text-white text-2xl font-bold font-display">DotNation</h2>
            </Link>
          </div>

          <div className="flex flex-1 justify-end gap-8 items-center">
            <nav className="flex items-center gap-8 text-sm font-medium">
               <NavLink
                 to="/dashboard"
                 className={({ isActive }) =>
                   isActive
                     ? "text-white font-bold"
                     : "text-white/80 hover:text-white transition-colors duration-300"
                 }
               >
                 Dashboard
               </NavLink>
               <NavLink
                 to="/campaigns"
                 className={({ isActive }) =>
                   isActive
                     ? "text-white font-bold"
                     : "text-white/80 hover:text-white transition-colors duration-300"
                 }
               >
                 Projects
               </NavLink>
               <NavLink
                 to="/my-campaigns"
                 className={({ isActive }) =>
                   isActive
                     ? "text-white font-bold"
                     : "text-white/80 hover:text-white transition-colors duration-300"
                 }
               >
                 My Campaigns
               </NavLink>
               <NavLink
                 to="/about"
                 className={({ isActive }) =>
                   isActive
                     ? "text-white font-bold"
                     : "text-white/80 hover:text-white transition-colors duration-300"
                 }
               >
                 About
               </NavLink>
             </nav>

            <div className="flex gap-4">
              <Link
                to="/create-campaign"
                className="flex items-center justify-center rounded-full h-10 px-6 bg-primary text-white text-sm font-bold tracking-wide hover:bg-primary/90 transition-all transform hover:scale-105 duration-300"
              >
                <span>Create Project</span>
              </Link>

              {selectedAccount ? (
                <div className="relative group">
                  <button className="flex items-center gap-2 rounded-full h-10 px-4 bg-white/10 text-white text-sm font-medium hover:bg-white/20 transition-colors duration-300">
                    <span className="w-6 h-6 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500" />
                    <span>{formatAddress(selectedAccount.address)}</span>
                    <svg
                      className="w-4 h-4 text-white/70"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                    </svg>
                  </button>

                  {/* Dropdown Menu */}
                  <div className="absolute right-0 mt-2 w-64 rounded-xl border border-white/10 bg-background-dark/95 backdrop-blur-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <div className="p-4">
                      <p className="text-xs text-white/50 mb-2">Connected Account</p>
                      <p className="text-xs text-white font-mono mb-4 break-all">{selectedAccount.address}</p>
                      
                      {accounts.length > 1 && (
                        <div className="mb-4">
                          <p className="text-xs text-white/50 mb-2">Switch Account</p>
                          <div className="space-y-1">
                            {accounts.map((account) => (
                              <button
                                key={account.address}
                                onClick={() => selectAccount(account)}
                                className={`w-full text-left px-3 py-2 rounded-lg text-sm ${
                                  account.address === selectedAccount.address
                                    ? 'bg-primary/20 text-primary'
                                    : 'text-white/70 hover:bg-white/10'
                                } transition-colors`}
                              >
                                {account.meta.name || formatAddress(account.address)}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="space-y-2">
                        <button
                          onClick={() => navigate('/my-campaigns')}
                          className="w-full px-4 py-2 rounded-lg bg-white/5 text-white text-sm font-medium hover:bg-white/10 transition-colors"
                        >
                          My Campaigns
                        </button>
                        <button
                          onClick={() => navigate('/my-donations')}
                          className="w-full px-4 py-2 rounded-lg bg-white/5 text-white text-sm font-medium hover:bg-white/10 transition-colors"
                        >
                          My Donations
                        </button>
                        <button
                          onClick={disconnectWallet}
                          className="w-full px-4 py-2 rounded-lg bg-white/10 text-white text-sm font-medium hover:bg-white/20 transition-colors"
                        >
                          Disconnect
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  onClick={connectWallet}
                  className="flex items-center gap-2 rounded-full h-10 px-4 bg-white/10 text-white text-sm font-medium hover:bg-white/20 transition-colors duration-300"
                >
                  Connect Wallet
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex flex-col items-center">
          <Outlet />
        </main>

        {/* Footer */}
        <footer className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-auto">
          <div className="py-6 border-t border-white/10">
            <div className="flex flex-col md:flex-row justify-between items-center gap-8">
              <div className="flex items-center gap-6">
                <a href="#terms" className="text-white/60 hover:text-white transition-colors text-sm">
                  Terms of Service
                </a>
                <a href="#privacy" className="text-white/60 hover:text-white transition-colors text-sm">
                  Privacy Policy
                </a>
                <a href="#contact" className="text-white/60 hover:text-white transition-colors text-sm">
                  Contact Us
                </a>
              </div>

              <div className="flex gap-4">
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-white transition-colors">
                  <svg fill="currentColor" height="24" viewBox="0 0 256 256" width="24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M247.39,68.94A8,8,0,0,0,240,64H209.57A48.66,48.66,0,0,0,168.1,40a46.91,46.91,0,0,0-33.75,13.7A47.9,47.9,0,0,0,120,88v6.09C79.74,83.47,46.81,50.72,46.46,50.37a8,8,0,0,0-13.65,4.92c-4.31,47.79,9.57,79.77,22,98.18a110.93,110.93,0,0,0,21.88,24.2c-15.23,17.53-39.21,26.74-39.47,26.84a8,8,0,0,0-3.85,11.93c.75,1.12,3.75,5.05,11.08,8.72C53.51,229.7,65.48,232,80,232c70.67,0,129.72-54.42,135.75-124.44l29.91-29.9A8,8,0,0,0,247.39,68.94Zm-45,29.41a8,8,0,0,0-2.32,5.14C196,166.58,143.28,216,80,216c-10.56,0-18-1.4-23.22-3.08,11.51-6.25,27.56-17,37.88-32.48A8,8,0,0,0,92,169.08c-.47-.27-43.91-26.34-44-96,16,13,45.25,33.17,78.67,38.79A8,8,0,0,0,136,104V88a32,32,0,0,1,9.6-22.92A30.94,30.94,0,0,1,167.9,56c12.66.16,24.49,7.88,29.44,19.21A8,8,0,0,0,204.67,80h16Z" />
                  </svg>
                </a>
                <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-white transition-colors">
                  <svg fill="currentColor" height="24" viewBox="0 0 256 256" width="24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M208.31,75.68A59.78,59.78,0,0,0,202.93,28,8,8,0,0,0,196,24a59.75,59.75,0,0,0-48,24H124A59.75,59.75,0,0,0,76,24a8,8,0,0,0-6.93,4,59.78,59.78,0,0,0-5.38,47.68A58.14,58.14,0,0,0,56,104v8a56.06,56.06,0,0,0,48.44,55.47A39.8,39.8,0,0,0,96,192v8H72a24,24,0,0,1-24-24A40,40,0,0,0,8,136a8,8,0,0,0,0,16,24,24,0,0,1,24,24,40,40,0,0,0,40,40H96v16a8,8,0,0,0,16,0V192a24,24,0,0,1,48,0v40a8,8,0,0,0,16,0V192a39.8,39.8,0,0,0-8.44-24.53A56.06,56.06,0,0,0,216,112v-8A58.14,58.14,0,0,0,208.31,75.68ZM200,112a40,40,0,0,1-40,40H112a40,40,0,0,1-40-40v-8a41.74,41.74,0,0,1,6.9-22.48A8,8,0,0,0,80,73.83a43.81,43.81,0,0,1,.79-33.58,43.88,43.88,0,0,1,32.32,20.06A8,8,0,0,0,119.82,64h32.35a8,8,0,0,0,6.74-3.69,43.87,43.87,0,0,1,32.32-20.06A43.81,43.81,0,0,1,192,73.83a8.09,8.09,0,0,0,1,7.65A41.72,41.72,0,0,1,200,104Z" />
                  </svg>
                </a>
              </div>

              <p className="text-white/60 text-sm">© 2024 DotNation. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default NewDashboardLayout;
