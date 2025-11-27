import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useWallet } from '../contexts/WalletContext';
import { shortenAddress } from '../utils/formatters';

/**
 * Unified NavBar component for consistent navigation across the app
 * @param {Object} props
 * @param {string} props.variant - 'dashboard' | 'landing' | 'members' - styling variant
 * @param {boolean} props.showBatchOps - whether to show batch operations dropdown (dashboard only)
 */
const NavBar = ({ variant = 'dashboard', showBatchOps = true }) => {
  const { accounts, selectedAccount, connectWallet, switchAccount, disconnectWallet } = useWallet();
  const navigate = useNavigate();
  const [isBatchOpsOpen, setIsBatchOpsOpen] = useState(false);
  const [isWalletMenuOpen, setIsWalletMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const batchOpsRef = useRef(null);
  const walletMenuRef = useRef(null);
  const mobileMenuRef = useRef(null);

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
      document.body.style.overflow = 'hidden';
      return () => {
        document.removeEventListener('keydown', handleEscape);
        document.body.style.overflow = 'unset';
      };
    }
  }, [isMobileMenuOpen]);

  // Navigation items based on variant
  const getNavItems = () => {
    const baseItems = [
      { to: '/dashboard', label: 'Dashboard' },
      { to: '/campaigns', label: 'Campaigns' },
      { to: '/members', label: 'Members' },
    ];

    if (variant === 'dashboard') {
      return [
        ...baseItems,
        { to: '/my-campaigns', label: 'My Campaigns' },
        { to: '/leaderboard', label: 'Leaderboard' },
      ];
    }

    if (variant === 'members') {
      return [
        ...baseItems,
        { to: '/about', label: 'About' },
      ];
    }

    // Landing variant
    return [
      { href: '#features', label: 'Features' },
      { href: '#how-it-works', label: 'How it Works' },
      { to: '/dashboard', label: 'Explore' },
    ];
  };

  const navItems = getNavItems();

  // Render logo
  const Logo = () => (
    <Link to="/" className="flex items-center gap-3 group" aria-label="Paperweight home page">
      <div className="w-10 h-10 bg-white text-black rounded-lg flex items-center justify-center font-serif text-xl font-bold group-hover:scale-105 transition-transform shadow-glow">
        P
      </div>
      {variant === 'landing' ? (
        <div className="flex flex-col">
          <span className="font-serif text-2xl tracking-tight text-text-primary leading-none">Paperweight</span>
          <span className="text-[10px] uppercase tracking-widest text-text-muted font-medium">Crowd</span>
        </div>
      ) : (
        <h2 className="text-text-primary text-2xl font-bold font-serif tracking-tight">Paperweight</h2>
      )}
    </Link>
  );

  // Render wallet button/menu for dashboard variant
  const WalletSection = () => {
    if (selectedAccount) {
      return (
        <div
          className="relative"
          ref={walletMenuRef}
          onMouseEnter={() => setIsWalletMenuOpen(true)}
          onMouseLeave={() => setIsWalletMenuOpen(false)}
        >
          <button
            className="flex items-center gap-2 rounded-full h-10 px-4 bg-surface/50 text-text-primary text-sm font-medium hover:bg-surface transition-colors duration-300 border border-border"
            onClick={() => setIsWalletMenuOpen(!isWalletMenuOpen)}
            onKeyDown={handleWalletMenuKeyDown}
            aria-expanded={isWalletMenuOpen}
            aria-haspopup="true"
            aria-label={`Wallet menu for ${formatAddress(selectedAccount.address)}`}
          >
            <span className="w-6 h-6 rounded-full bg-primary/20 border border-border" aria-hidden="true" />
            <span>{formatAddress(selectedAccount.address)}</span>
            <svg
              className={`w-4 h-4 text-text-secondary transition-transform duration-200 ${isWalletMenuOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
            </svg>
          </button>

          {/* Dropdown Menu */}
          {isWalletMenuOpen && (
            <div
              className="absolute right-0 mt-2 w-80 rounded-xl border border-border bg-surface backdrop-blur-xl shadow-2xl overflow-hidden z-[100]"
              role="menu"
              aria-label="Wallet menu"
            >
              <div className="p-4 max-h-[500px] overflow-y-auto overflow-x-hidden">
                <div role="status" aria-label="Connected wallet account">
                  <p className="text-xs text-text-muted mb-2">Connected Account</p>
                  <div className="mb-4">
                    <p className="text-sm text-text-primary font-medium truncate">{selectedAccount.meta.name}</p>
                    <p className="text-xs text-text-secondary font-mono truncate break-all">{shortenAddress(selectedAccount.address)}</p>
                  </div>
                </div>

                {accounts.length > 1 && (
                  <div className="mb-4" role="group" aria-label="Switch wallet account">
                    <p className="text-xs text-text-muted mb-2">Switch Account ({accounts.length})</p>
                    <div className="space-y-1.5 max-h-60 overflow-y-auto overflow-x-hidden" role="radiogroup">
                      {accounts.map((account) => (
                        <button
                          key={account.address}
                          onClick={() => {
                            switchAccount(account);
                            setIsWalletMenuOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2.5 rounded-lg text-sm ${account.address === selectedAccount.address
                            ? 'bg-primary/20 text-text-primary border border-primary/30'
                            : 'text-text-secondary hover:bg-surface/80 border border-transparent'
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

                <div className="space-y-2 border-t border-border pt-4" role="group" aria-label="Wallet actions">
                  <button
                    onClick={() => { navigate('/profile'); setIsWalletMenuOpen(false); }}
                    className="w-full px-4 py-2.5 rounded-lg bg-surface/50 text-text-primary text-sm font-medium hover:bg-surface transition-colors truncate"
                    role="menuitem"
                  >
                    View Profile
                  </button>
                  <button
                    onClick={() => { navigate('/my-campaigns'); setIsWalletMenuOpen(false); }}
                    className="w-full px-4 py-2.5 rounded-lg bg-surface/50 text-text-primary text-sm font-medium hover:bg-surface transition-colors truncate"
                    role="menuitem"
                  >
                    My Campaigns
                  </button>
                  <button
                    onClick={() => { navigate('/my-donations'); setIsWalletMenuOpen(false); }}
                    className="w-full px-4 py-2.5 rounded-lg bg-surface/50 text-text-primary text-sm font-medium hover:bg-surface transition-colors truncate"
                    role="menuitem"
                  >
                    My Donations
                  </button>
                  <button
                    onClick={() => { navigate('/my-nfts'); setIsWalletMenuOpen(false); }}
                    className="w-full px-4 py-2.5 rounded-lg bg-surface/50 text-text-primary text-sm font-medium hover:bg-surface transition-colors truncate"
                    role="menuitem"
                  >
                    My NFTs
                  </button>
                  <button
                    onClick={() => { disconnectWallet(); setIsWalletMenuOpen(false); }}
                    className="w-full px-4 py-2.5 rounded-lg bg-error/10 text-error text-sm font-medium hover:bg-error/20 transition-colors truncate"
                    role="menuitem"
                  >
                    Disconnect
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }

    return (
      <button
        onClick={connectWallet}
        className="flex items-center gap-2 h-10 px-5 bg-white text-black text-sm font-semibold rounded-sm hover:-translate-y-px hover:shadow-btn-hover transition-all duration-600 ease-gravity"
        aria-label="Connect wallet to DotNation"
      >
        Connect Wallet
      </button>
    );
  };

  // Batch operations dropdown - click-based only
  const BatchOpsDropdown = () => (
    <div
      className="relative"
      ref={batchOpsRef}
    >
      <button
        className="text-text-secondary hover:text-text-primary transition-colors duration-300 flex items-center gap-1"
        onClick={() => setIsBatchOpsOpen(!isBatchOpsOpen)}
        onKeyDown={handleBatchOpsKeyDown}
        aria-expanded={isBatchOpsOpen}
        aria-haspopup="true"
        aria-label="Batch operations menu"
      >
        Batch Ops
        <svg className={`w-4 h-4 transition-transform duration-200 ${isBatchOpsOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
        </svg>
      </button>
      {isBatchOpsOpen && (
        <div
          className="absolute top-full left-0 mt-2 w-52 rounded-sm border border-border-subtle bg-background-surface backdrop-blur-glass shadow-glass overflow-hidden z-50"
          role="menu"
          aria-label="Batch operations"
        >
          <NavLink
            to="/batch-create"
            className="block px-4 py-3 text-sm text-text-secondary hover:text-text-primary hover:bg-background-overlay transition-colors"
            role="menuitem"
            onClick={() => setIsBatchOpsOpen(false)}
          >
            Batch Create Campaigns
          </NavLink>
          <NavLink
            to="/batch-withdraw"
            className="block px-4 py-3 text-sm text-text-secondary hover:text-text-primary hover:bg-background-overlay transition-colors"
            role="menuitem"
            onClick={() => setIsBatchOpsOpen(false)}
          >
            Batch Withdraw
          </NavLink>
        </div>
      )}
    </div>
  );

  // Get header styles based on variant
  const getHeaderStyles = () => {
    if (variant === 'landing') {
      return 'sticky top-0 z-50 border-b border-border bg-background-dark/80 backdrop-blur-xl';
    }
    if (variant === 'members') {
      return 'sticky top-0 w-full z-50 border-b border-border bg-background-dark/80 backdrop-blur-xl';
    }
    return 'sticky top-0 z-50 flex items-center justify-between whitespace-nowrap px-4 md:px-10 py-4 border-b border-border backdrop-blur-xl bg-background-dark/90';
  };

  // Render mobile menu
  const MobileMenu = () => (
    <>
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-background-dark/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Menu Drawer */}
      <div
        id="mobile-menu"
        className={`fixed top-0 right-0 h-full w-80 bg-surface backdrop-blur-xl border-l border-border shadow-2xl transform transition-transform duration-300 ease-in-out z-50 lg:hidden ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        role="navigation"
        aria-label="Mobile navigation"
      >
        <div className="flex flex-col h-full overflow-y-auto">
          {/* Mobile Menu Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <h3 className="text-xl font-bold text-text-primary font-serif">Menu</h3>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 text-text-secondary hover:text-text-primary transition-colors"
              aria-label="Close mobile menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Mobile Navigation Links */}
          <nav className="flex flex-col p-6 space-y-2" aria-label="Mobile primary navigation">
            {navItems.map((item) => (
              item.to ? (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `px-4 py-3 rounded-lg text-base font-medium transition-colors ${isActive
                      ? 'bg-primary/20 text-text-primary border border-primary/30'
                      : 'text-text-secondary hover:bg-surface/80 hover:text-text-primary'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              ) : (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="px-4 py-3 rounded-lg text-base font-medium text-text-secondary hover:bg-surface/80 hover:text-text-primary transition-colors"
                >
                  {item.label}
                </a>
              )
            ))}

            {/* Batch Operations - Mobile (dashboard only) */}
            {variant === 'dashboard' && showBatchOps && (
              <div className="pt-2">
                <p className="px-4 pb-2 text-xs text-text-muted font-semibold uppercase tracking-wider">Batch Operations</p>
                <NavLink
                  to="/batch-create"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `px-4 py-3 rounded-lg text-base font-medium transition-colors block ${isActive
                      ? 'bg-primary/20 text-text-primary border border-primary/30'
                      : 'text-text-secondary hover:bg-surface/80 hover:text-text-primary'
                    }`
                  }
                >
                  Batch Create Campaigns
                </NavLink>
                <NavLink
                  to="/batch-withdraw"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `px-4 py-3 rounded-lg text-base font-medium transition-colors block ${isActive
                      ? 'bg-primary/20 text-text-primary border border-primary/30'
                      : 'text-text-secondary hover:bg-surface/80 hover:text-text-primary'
                    }`
                  }
                >
                  Batch Withdraw
                </NavLink>
              </div>
            )}
          </nav>

          {/* Mobile Action Buttons */}
          <div className="mt-auto p-6 space-y-3 border-t border-border">
            <Link
              to="/create-campaign"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center justify-center w-full h-12 px-6 bg-white text-black text-base font-semibold rounded-sm hover:-translate-y-px hover:shadow-btn-hover transition-all duration-600 ease-gravity"
            >
              Create Project
            </Link>

            {selectedAccount ? (
              <div className="space-y-2">
                <div className="px-4 py-3 bg-surface/50 rounded-lg border border-border">
                  <p className="text-xs text-text-muted mb-1">Connected Account</p>
                  <p className="text-sm text-text-primary font-medium truncate">{selectedAccount.meta.name}</p>
                  <p className="text-xs text-text-secondary font-mono truncate">{formatAddress(selectedAccount.address)}</p>
                </div>
                <button
                  onClick={() => { navigate('/profile'); setIsMobileMenuOpen(false); }}
                  className="w-full px-4 py-3 rounded-lg bg-surface/50 text-text-primary text-sm font-medium hover:bg-surface transition-colors border border-border"
                >
                  View Profile
                </button>
                <button
                  onClick={() => { navigate('/my-donations'); setIsMobileMenuOpen(false); }}
                  className="w-full px-4 py-3 rounded-lg bg-surface/50 text-text-primary text-sm font-medium hover:bg-surface transition-colors"
                >
                  My Donations
                </button>
                <button
                  onClick={() => { navigate('/my-nfts'); setIsMobileMenuOpen(false); }}
                  className="w-full px-4 py-3 rounded-lg bg-surface/50 text-text-primary text-sm font-medium hover:bg-surface transition-colors"
                >
                  My NFTs
                </button>
                <button
                  onClick={() => { disconnectWallet(); setIsMobileMenuOpen(false); }}
                  className="w-full px-4 py-3 rounded-lg bg-error/10 text-error text-sm font-medium hover:bg-error/20 transition-colors"
                >
                  Disconnect Wallet
                </button>
              </div>
            ) : (
              <button
                onClick={() => { connectWallet(); setIsMobileMenuOpen(false); }}
                className="w-full flex items-center justify-center gap-2 rounded-full h-12 px-6 bg-surface/50 text-text-primary text-base font-medium hover:bg-surface transition-colors border border-border"
              >
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );

  // Landing variant header
  if (variant === 'landing') {
    return (
      <header className={getHeaderStyles()}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Logo />

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              item.to ? (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
                >
                  {item.label}
                </NavLink>
              ) : (
                <a
                  key={item.href}
                  href={item.href}
                  className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
                >
                  {item.label}
                </a>
              )
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            <Link to="/create-campaign" className="text-sm font-medium text-text-primary hover:text-text-secondary transition-colors">
              Start a Campaign
            </Link>
            <WalletSection />
          </div>

          {/* Mobile Menu Button */}
          <button
            ref={mobileMenuRef}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-text-secondary hover:text-text-primary transition-colors"
            aria-label="Toggle mobile menu"
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        <MobileMenu />
      </header>
    );
  }

  // Members variant header
  if (variant === 'members') {
    return (
      <nav className={getHeaderStyles()}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Logo />

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  isActive
                    ? 'text-text-primary font-bold border-b border-primary pb-0.5'
                    : 'text-text-secondary hover:text-text-primary transition-colors'
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-4">
            <Link to="/login" className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors">
              Log in
            </Link>
            <Link to="/members/browse" className="px-6 py-2.5 bg-white text-black text-sm font-semibold rounded-sm hover:-translate-y-px hover:shadow-btn-hover transition-all duration-600 ease-gravity">
              Get Started
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            ref={mobileMenuRef}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-text-secondary hover:text-text-primary transition-colors"
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        <MobileMenu />
      </nav>
    );
  }

  // Dashboard variant (default)
  return (
    <header className={getHeaderStyles()}>
      <div className="flex items-center gap-3 text-text-primary">
        <Logo />
      </div>

      <div className="flex flex-1 justify-end gap-4 md:gap-8 items-center">
        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-8 text-sm font-medium" aria-label="Primary navigation">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                isActive
                  ? 'text-text-primary font-semibold'
                  : 'text-text-secondary hover:text-text-primary transition-colors duration-300'
              }
              aria-label={item.label}
            >
              {item.label}
            </NavLink>
          ))}
          {showBatchOps && <BatchOpsDropdown />}
        </nav>

        {/* Desktop action buttons */}
        <div className="hidden md:flex gap-4">
          <Link
            to="/create-campaign"
            className="flex items-center justify-center h-10 px-6 bg-white text-black text-sm font-semibold rounded-sm hover:-translate-y-px hover:shadow-btn-hover transition-all duration-600 ease-gravity"
            aria-label="Create a new project"
          >
            <span>Create Project</span>
          </Link>
          <WalletSection />
        </div>

        {/* Mobile Menu Button */}
        <button
          ref={mobileMenuRef}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="lg:hidden p-2 text-text-secondary hover:text-text-primary transition-colors"
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

      <MobileMenu />
    </header>
  );
};

NavBar.propTypes = {
  variant: PropTypes.oneOf(['dashboard', 'landing', 'members']),
  showBatchOps: PropTypes.bool,
};

export default NavBar;
