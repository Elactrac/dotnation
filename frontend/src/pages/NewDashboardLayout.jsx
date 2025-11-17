import { useEffect, useState, useRef } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useWallet } from '../contexts/WalletContext';
import { shortenAddress } from '../utils/formatters';
import VersionBanner from '../components/VersionBanner';

const NewDashboardLayout = () => {
  const { accounts, selectedAccount, connectWallet, switchAccount, disconnectWallet } = useWallet();
  const navigate = useNavigate();
  const [isBatchOpsOpen, setIsBatchOpsOpen] = useState(false);
  const [isWalletMenuOpen, setIsWalletMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const batchOpsRef = useRef(null);
  const walletMenuRef = useRef(null);
  const mobileMenuRef = useRef(null);

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

  // Handle keyboard navigation for Batch Ops dropdown
  const handleBatchOpsKeyDown = (e) => {
    if (e.key === 'Escape') {
      setIsBatchOpsOpen(false);
      batchOpsRef.current?.focus();
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsBatchOpsOpen(!isBatchOpsOpen);
    }
  };

  // Handle keyboard navigation for wallet menu
  const handleWalletMenuKeyDown = (e) => {
    if (e.key === 'Escape') {
      setIsWalletMenuOpen(false);
      walletMenuRef.current?.focus();
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setIsWalletMenuOpen(!isWalletMenuOpen);
    }
  };

  // Click outside to close menus
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Only close if clicking outside and menus are open
      if (isBatchOpsOpen && batchOpsRef.current && !batchOpsRef.current.contains(event.target)) {
        setIsBatchOpsOpen(false);
      }
      if (isWalletMenuOpen && walletMenuRef.current && !walletMenuRef.current.contains(event.target)) {
        setIsWalletMenuOpen(false);
      }
      if (isMobileMenuOpen && mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setIsMobileMenuOpen(false);
      }
    };

    // Only add listener if at least one menu is open
    if (isBatchOpsOpen || isWalletMenuOpen || isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isBatchOpsOpen, isWalletMenuOpen, isMobileMenuOpen]);

  // Close mobile menu on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };
    
    if (isMobileMenuOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when mobile menu is open
      document.body.style.overflow = 'hidden';
      return () => {
        document.removeEventListener('keydown', handleEscape);
        document.body.style.overflow = 'unset';
      };
    }
  }, [isMobileMenuOpen]);

  return (
    <div className="relative min-h-screen w-full flex flex-col overflow-x-hidden bg-background-dark font-body text-white/90">
      {/* Skip to Main Content Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-[1000] focus:top-4 focus:left-4 focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:rounded-lg focus:font-medium focus:outline-none focus:ring-2 focus:ring-white"
      >
        Skip to main content
      </a>

      {/* Mouse Follower */}
      <div
        id="mouse-follower"
        className="fixed top-0 left-0 w-24 h-24 bg-primary/20 rounded-full pointer-events-none blur-3xl z-0 -translate-x-1/2 -translate-y-1/2"
        aria-hidden="true"
      />

      {/* Background Gradient */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(56,116,255,0.1)_0%,transparent_50%)] animate-pulse-slow" />
      </div>

      {/* Main Layout Container */}
      <div className="relative flex flex-col min-h-screen z-10">
        {/* Header */}
        <header className="sticky top-0 z-50 flex items-center justify-between whitespace-nowrap px-4 md:px-10 py-4 border-b border-white/10 backdrop-blur-md bg-background-dark/50">
          <div className="flex items-center gap-3 text-white">
            <Link to="/" className="flex items-center gap-3" aria-label="DotNation home page">
              <svg
                className="text-primary size-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
                <circle cx="12" cy="12" fill="currentColor" r="4" />
              </svg>
              <h2 className="text-white text-xl md:text-2xl font-bold font-display">DotNation</h2>
            </Link>
          </div>

          <div className="flex flex-1 justify-end gap-4 md:gap-8 items-center">
            {/* Desktop Navigation - Hidden on mobile */}
            <nav className="hidden lg:flex items-center gap-8 text-sm font-medium" aria-label="Primary navigation">
               <NavLink
                 to="/dashboard"
                 className={({ isActive }) =>
                   isActive
                     ? "text-white font-bold"
                     : "text-white/80 hover:text-white transition-colors duration-300"
                 }
                 aria-label="Dashboard"
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
                 aria-label="Browse all projects"
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
                 aria-label="My campaigns"
               >
                 My Campaigns
               </NavLink>
               <NavLink
                 to="/leaderboard"
                 className={({ isActive }) =>
                   isActive
                     ? "text-white font-bold"
                     : "text-white/80 hover:text-white transition-colors duration-300"
                 }
                 aria-label="View leaderboard"
               >
                 Leaderboard
               </NavLink>
               <div
                 className="relative"
                 ref={batchOpsRef}
                 onMouseEnter={() => setIsBatchOpsOpen(true)}
                 onMouseLeave={() => setIsBatchOpsOpen(false)}
               >
                 <button
                   className="text-white/80 hover:text-white transition-colors duration-300 flex items-center gap-1"
                   onClick={() => setIsBatchOpsOpen(!isBatchOpsOpen)}
                   onKeyDown={handleBatchOpsKeyDown}
                   aria-expanded={isBatchOpsOpen}
                   aria-haspopup="true"
                   aria-label="Batch operations menu"
                 >
                   Batch Ops
                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                     <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                   </svg>
                 </button>
                 {isBatchOpsOpen && (
                   <div
                     className="absolute top-full left-0 mt-2 w-48 rounded-lg bg-background-dark/95 backdrop-blur-lg border border-white/10 shadow-xl transition-all duration-200 z-50"
                     role="menu"
                     aria-label="Batch operations"
                   >
                     <NavLink
                       to="/batch-create"
                       className="block px-4 py-2 text-sm text-white/80 hover:text-white hover:bg-white/5 rounded-t-lg transition-colors"
                       role="menuitem"
                       onClick={() => setIsBatchOpsOpen(false)}
                     >
                       Batch Create Campaigns
                     </NavLink>
                     <NavLink
                       to="/batch-withdraw"
                       className="block px-4 py-2 text-sm text-white/80 hover:text-white hover:bg-white/5 rounded-b-lg transition-colors"
                       role="menuitem"
                       onClick={() => setIsBatchOpsOpen(false)}
                     >
                       Batch Withdraw
                     </NavLink>
                   </div>
                 )}
                </div>
             </nav>

            {/* Desktop action buttons - Hidden on mobile */}
            <div className="hidden md:flex gap-4">
              <Link
                to="/create-campaign"
                className="flex items-center justify-center rounded-full h-10 px-6 bg-primary text-white text-sm font-bold tracking-wide hover:bg-primary/90 transition-all transform hover:scale-105 duration-300"
                aria-label="Create a new project"
              >
                <span>Create Project</span>
              </Link>

              {selectedAccount ? (
                <div
                  className="relative"
                  ref={walletMenuRef}
                  onMouseEnter={() => setIsWalletMenuOpen(true)}
                  onMouseLeave={() => setIsWalletMenuOpen(false)}
                >
                  <button
                    className="flex items-center gap-2 rounded-full h-10 px-4 bg-white/10 text-white text-sm font-medium hover:bg-white/20 transition-colors duration-300"
                    onClick={() => setIsWalletMenuOpen(!isWalletMenuOpen)}
                    onKeyDown={handleWalletMenuKeyDown}
                    aria-expanded={isWalletMenuOpen}
                    aria-haspopup="true"
                    aria-label={`Wallet menu for ${formatAddress(selectedAccount.address)}`}
                  >
                    <span className="w-6 h-6 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-500" aria-hidden="true" />
                    <span>{formatAddress(selectedAccount.address)}</span>
                    <svg
                      className="w-4 h-4 text-white/70"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                    >
                      <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                    </svg>
                  </button>

                  {/* Dropdown Menu */}
                  {isWalletMenuOpen && (
                  <div
                    className="absolute right-0 mt-2 w-80 rounded-xl border border-white/10 bg-background-dark/95 backdrop-blur-lg shadow-xl transition-all duration-200 overflow-hidden z-[100]"
                    role="menu"
                    aria-label="Wallet menu"
                  >
                    <div className="p-4 max-h-[500px] overflow-y-auto overflow-x-hidden">
                      <div role="status" aria-label="Connected wallet account">
                        <p className="text-xs text-white/50 mb-2">Connected Account</p>
                        <div className="mb-4">
                          <p className="text-sm text-white font-medium truncate">{selectedAccount.meta.name}</p>
                          <p className="text-xs text-white/60 font-mono truncate break-all">{shortenAddress(selectedAccount.address)}</p>
                        </div>
                      </div>
                      
                      {accounts.length > 1 && (
                        <div className="mb-4" role="group" aria-label="Switch wallet account">
                          <p className="text-xs text-white/50 mb-2">Switch Account ({accounts.length})</p>
                          <div className="space-y-1.5 max-h-60 overflow-y-auto overflow-x-hidden" role="radiogroup">
                            {accounts.map((account) => (
                              <button
                                key={account.address}
                                onClick={() => {
                                  switchAccount(account);
                                  setIsWalletMenuOpen(false);
                                }}
                                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm ${
                                  account.address === selectedAccount.address
                                    ? 'bg-primary/20 text-primary border border-primary/30'
                                    : 'text-white/70 hover:bg-white/10 border border-transparent'
                                } transition-all`}
                                role="menuitemradio"
                                aria-checked={account.address === selectedAccount.address}
                                aria-label={`Switch to ${account.meta.name || shortenAddress(account.address)}`}
                              >
                                <div className="flex items-center justify-between gap-2 min-w-0">
                                  <div className="min-w-0 flex-1 overflow-hidden">
                                    <div className="font-medium truncate">{account.meta.name || shortenAddress(account.address)}</div>
                                    <div className="text-xs opacity-60 truncate font-mono">{shortenAddress(account.address)}</div>
                                  </div>
                                  {account.address === selectedAccount.address && (
                                    <span className="flex-shrink-0 text-primary ml-2">✓</span>
                                  )}
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="space-y-2" role="group" aria-label="Wallet actions">
                        <button
                          onClick={() => {
                            navigate('/profile');
                            setIsWalletMenuOpen(false);
                          }}
                          className="w-full px-4 py-2 rounded-lg bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors border border-primary/30 truncate"
                          role="menuitem"
                          aria-label="View profile"
                        >
                          <span aria-hidden="true">👤</span> View Profile
                        </button>
                        <button
                          onClick={() => {
                            navigate('/my-campaigns');
                            setIsWalletMenuOpen(false);
                          }}
                          className="w-full px-4 py-2 rounded-lg bg-white/5 text-white text-sm font-medium hover:bg-white/10 transition-colors truncate"
                          role="menuitem"
                          aria-label="View my campaigns"
                        >
                          My Campaigns
                        </button>
                        <button
                          onClick={() => {
                            navigate('/my-donations');
                            setIsWalletMenuOpen(false);
                          }}
                          className="w-full px-4 py-2 rounded-lg bg-white/5 text-white text-sm font-medium hover:bg-white/10 transition-colors truncate"
                          role="menuitem"
                          aria-label="View my donations"
                        >
                          My Donations
                        </button>
                        <button
                          onClick={() => {
                            navigate('/my-nfts');
                            setIsWalletMenuOpen(false);
                          }}
                          className="w-full px-4 py-2 rounded-lg bg-white/5 text-white text-sm font-medium hover:bg-white/10 transition-colors truncate"
                          role="menuitem"
                          aria-label="View my NFTs"
                        >
                          My NFTs
                        </button>
                        <button
                          onClick={() => {
                            disconnectWallet();
                            setIsWalletMenuOpen(false);
                          }}
                          className="w-full px-4 py-2 rounded-lg bg-white/10 text-white text-sm font-medium hover:bg-white/20 transition-colors truncate"
                          role="menuitem"
                          aria-label="Disconnect wallet"
                        >
                          Disconnect
                        </button>
                      </div>
                    </div>
                  </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={connectWallet}
                  className="flex items-center gap-2 rounded-full h-10 px-4 bg-white/10 text-white text-sm font-medium hover:bg-white/20 transition-colors duration-300"
                  aria-label="Connect wallet to DotNation"
                >
                  Connect Wallet
                 </button>
               )}
             </div>

            {/* Mobile Menu Button */}
            <button
              ref={mobileMenuRef}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-white hover:text-primary transition-colors"
              aria-label="Toggle mobile menu"
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu"
            >
              {isMobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </header>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Mobile Menu Drawer */}
        <div
          id="mobile-menu"
          className={`fixed top-0 right-0 h-full w-80 bg-background-dark/98 backdrop-blur-lg border-l border-white/10 shadow-2xl transform transition-transform duration-300 ease-in-out z-50 lg:hidden ${
            isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
          role="navigation"
          aria-label="Mobile navigation"
        >
          <div className="flex flex-col h-full overflow-y-auto">
            {/* Mobile Menu Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h3 className="text-xl font-bold text-white font-display">Menu</h3>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 text-white/70 hover:text-white transition-colors"
                aria-label="Close mobile menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Mobile Navigation Links */}
            <nav className="flex flex-col p-6 space-y-2" aria-label="Mobile primary navigation">
              <NavLink
                to="/dashboard"
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                    isActive
                      ? 'bg-primary/20 text-primary border border-primary/30'
                      : 'text-white/80 hover:bg-white/5 hover:text-white'
                  }`
                }
              >
                Dashboard
              </NavLink>
              <NavLink
                to="/campaigns"
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                    isActive
                      ? 'bg-primary/20 text-primary border border-primary/30'
                      : 'text-white/80 hover:bg-white/5 hover:text-white'
                  }`
                }
              >
                Projects
              </NavLink>
              <NavLink
                to="/my-campaigns"
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                    isActive
                      ? 'bg-primary/20 text-primary border border-primary/30'
                      : 'text-white/80 hover:bg-white/5 hover:text-white'
                  }`
                }
              >
                My Campaigns
              </NavLink>
              <NavLink
                to="/leaderboard"
                onClick={() => setIsMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                    isActive
                      ? 'bg-primary/20 text-primary border border-primary/30'
                      : 'text-white/80 hover:bg-white/5 hover:text-white'
                  }`
                }
              >
                Leaderboard
              </NavLink>

              {/* Batch Operations - Mobile */}
              <div className="pt-2">
                <p className="px-4 pb-2 text-xs text-white/50 font-semibold uppercase tracking-wider">Batch Operations</p>
                <NavLink
                  to="/batch-create"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                      isActive
                        ? 'bg-primary/20 text-primary border border-primary/30'
                        : 'text-white/80 hover:bg-white/5 hover:text-white'
                    }`
                  }
                >
                  Batch Create Campaigns
                </NavLink>
                <NavLink
                  to="/batch-withdraw"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                      isActive
                        ? 'bg-primary/20 text-primary border border-primary/30'
                        : 'text-white/80 hover:bg-white/5 hover:text-white'
                    }`
                  }
                >
                  Batch Withdraw
                </NavLink>
              </div>
            </nav>

            {/* Mobile Action Buttons */}
            <div className="mt-auto p-6 space-y-3 border-t border-white/10">
              <Link
                to="/create-campaign"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-center w-full rounded-full h-12 px-6 bg-primary text-white text-base font-bold tracking-wide hover:bg-primary/90 transition-all"
              >
                Create Project
              </Link>

              {selectedAccount ? (
                <div className="space-y-2">
                  <div className="px-4 py-3 bg-white/5 rounded-lg">
                    <p className="text-xs text-white/50 mb-1">Connected Account</p>
                    <p className="text-sm text-white font-medium truncate">{selectedAccount.meta.name}</p>
                    <p className="text-xs text-white/60 font-mono truncate">{formatAddress(selectedAccount.address)}</p>
                  </div>
                  <button
                    onClick={() => {
                      navigate('/profile');
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full px-4 py-3 rounded-lg bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors border border-primary/30"
                  >
                    <span aria-hidden="true">👤</span> View Profile
                  </button>
                  <button
                    onClick={() => {
                      navigate('/my-donations');
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full px-4 py-3 rounded-lg bg-white/5 text-white text-sm font-medium hover:bg-white/10 transition-colors"
                  >
                    My Donations
                  </button>
                  <button
                    onClick={() => {
                      navigate('/my-nfts');
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full px-4 py-3 rounded-lg bg-white/5 text-white text-sm font-medium hover:bg-white/10 transition-colors"
                  >
                    My NFTs
                  </button>
                  <button
                    onClick={() => {
                      disconnectWallet();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full px-4 py-3 rounded-lg bg-white/10 text-white text-sm font-medium hover:bg-white/20 transition-colors"
                  >
                    Disconnect Wallet
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    connectWallet();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 rounded-full h-12 px-6 bg-white/10 text-white text-base font-medium hover:bg-white/20 transition-colors"
                >
                  Connect Wallet
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Version Banner */}
        <VersionBanner />

        {/* Main Content */}
        <main id="main-content" className="flex-1 flex flex-col items-center pb-16" tabIndex="-1">
          <Outlet />
        </main>

        {/* Footer */}
        <footer className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-auto pt-8" role="contentinfo">
          <div className="py-6 border-t border-white/10">
            <div className="flex flex-col md:flex-row justify-between items-center gap-8">
              <nav className="flex items-center gap-6" aria-label="Footer navigation">
                <a href="#terms" className="text-white/60 hover:text-white transition-colors text-sm" aria-label="Terms of Service">
                  Terms of Service
                </a>
                <a href="/privacy" className="text-white/60 hover:text-white transition-colors text-sm" aria-label="Privacy Policy">
                  Privacy Policy
                </a>
                <a href="/about" className="text-white/60 hover:text-white transition-colors text-sm" aria-label="About DotNation">
                  About
                </a>
                <a href="/contact" className="text-white/60 hover:text-white transition-colors text-sm" aria-label="Contact us">
                  Contact Us
                </a>
              </nav>

              <div className="flex gap-4" role="group" aria-label="Social media links">
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-white transition-colors" aria-label="Follow us on Twitter">
                  <svg fill="currentColor" height="24" viewBox="0 0 256 256" width="24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <path d="M247.39,68.94A8,8,0,0,0,240,64H209.57A48.66,48.66,0,0,0,168.1,40a46.91,46.91,0,0,0-33.75,13.7A47.9,47.9,0,0,0,120,88v6.09C79.74,83.47,46.81,50.72,46.46,50.37a8,8,0,0,0-13.65,4.92c-4.31,47.79,9.57,79.77,22,98.18a110.93,110.93,0,0,0,21.88,24.2c-15.23,17.53-39.21,26.74-39.47,26.84a8,8,0,0,0-3.85,11.93c.75,1.12,3.75,5.05,11.08,8.72C53.51,229.7,65.48,232,80,232c70.67,0,129.72-54.42,135.75-124.44l29.91-29.9A8,8,0,0,0,247.39,68.94Zm-45,29.41a8,8,0,0,0-2.32,5.14C196,166.58,143.28,216,80,216c-10.56,0-18-1.4-23.22-3.08,11.51-6.25,27.56-17,37.88-32.48A8,8,0,0,0,92,169.08c-.47-.27-43.91-26.34-44-96,16,13,45.25,33.17,78.67,38.79A8,8,0,0,0,136,104V88a32,32,0,0,1,9.6-22.92A30.94,30.94,0,0,1,167.9,56c12.66.16,24.49,7.88,29.44,19.21A8,8,0,0,0,204.67,80h16Z" />
                  </svg>
                </a>
                <a href="https://github.com/Elactrac/dotnation" target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-white transition-colors" aria-label="View source code on GitHub">
                  <svg fill="currentColor" height="24" viewBox="0 0 256 256" width="24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
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
