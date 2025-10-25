import { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useWallet } from '../contexts/WalletContext';

const NewLandingPage = () => {
  const { accounts, selectedAccount, connectWallet, switchAccount, disconnectWallet } = useWallet();
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    // Mouse follower effect
    const follower = document.getElementById('mouse-follower');
    const handleMouseMove = (e) => {
      if (follower) {
        follower.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
      }
    };

    document.addEventListener('mousemove', handleMouseMove);

    // Intersection Observer for fade-in sections
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('section').forEach(section => {
      section.classList.add('fade-in-section');
      observer.observe(section);
    });

    // Header hide/show on scroll
    let lastScroll = 0;
    const header = document.querySelector('header');
    const handleScroll = () => {
      const currentScroll = window.pageYOffset;
      if (currentScroll > lastScroll && currentScroll > header.offsetHeight) {
        header.classList.add('-translate-y-full');
      } else {
        header.classList.remove('-translate-y-full');
      }
      lastScroll = currentScroll <= 0 ? 0 : currentScroll;
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleFilterClick = (filter) => {
    setActiveFilter(filter);
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col overflow-x-hidden bg-background-dark">
      {/* Mouse Follower */}
      <div
        id="mouse-follower"
        className="fixed top-0 left-0 w-96 h-96 bg-primary/10 rounded-full pointer-events-none blur-3xl z-0 -translate-x-1/2 -translate-y-1/2 transition-transform duration-300"
      />

      {/* Background Gradient */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[200%] h-[200%] pointer-events-none">
        <div className="absolute inset-0 bg-background-dark bg-[radial-gradient(circle_at_center,rgba(238,43,140,0.05)_0%,transparent_30%)] animate-pulse-slow" />
      </div>

      {/* Main Content */}
      <div className="layout-container flex h-full grow flex-col z-10">
        {/* Header */}
        <header className="sticky top-0 z-50 flex items-center justify-between whitespace-nowrap px-10 py-4 border-b border-white/10 backdrop-blur-md bg-background-dark/50 transition-transform duration-300">
          <div className="flex items-center gap-3 text-white">
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
          </div>

          <div className="flex flex-1 justify-end gap-8 items-center">
            <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
               <a className="text-white/80 hover:text-white transition-colors duration-300" href="#features">Features</a>
               <a className="text-white/80 hover:text-white transition-colors duration-300" href="#how-it-works">How It Works</a>
               <a className="text-white/80 hover:text-white transition-colors duration-300" href="#built-for-polkadot">For Polkadot</a>
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
               <NavLink
                 to="/login"
                 className={({ isActive }) =>
                   isActive
                     ? "text-white font-bold"
                     : "text-white/80 hover:text-white transition-colors duration-300"
                 }
               >
                 Login
               </NavLink>
               <NavLink
                 to="/signup"
                 className={({ isActive }) =>
                   isActive
                     ? "text-white font-bold"
                     : "text-white/80 hover:text-white transition-colors duration-300"
                 }
               >
                 Signup
               </NavLink>
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
             </nav>

            <div className="flex gap-4">
              <Link
                to="/create-campaign"
                className="flex items-center justify-center rounded-full h-10 px-6 bg-primary text-white text-sm font-bold tracking-wide hover:bg-primary/90 transition-all transform hover:scale-105 duration-300"
              >
                <span>Start Funding</span>
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

                  {/* Dropdown */}
                  <div className="absolute right-0 mt-2 w-64 rounded-xl border border-white/10 bg-background-dark/95 backdrop-blur-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <div className="p-4">
                      <p className="text-xs text-white/50 mb-2">Connected Account</p>
                      <p className="text-sm text-white font-medium mb-4">{selectedAccount.address}</p>
                      {accounts.length > 1 && (
                        <div className="mb-4">
                          <p className="text-xs text-white/50 mb-2">Switch Account</p>
                          {accounts.map((account) => (
                            <button
                              key={account.address}
                              onClick={() => switchAccount(account)}
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
                      )}
                      <button
                        onClick={disconnectWallet}
                        className="w-full px-4 py-2 rounded-lg bg-white/10 text-white text-sm font-medium hover:bg-white/20 transition-colors"
                      >
                        Disconnect
                      </button>
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

        {/* Hero Section */}
        <main className="flex-1 flex flex-col">
          <section className="py-32 sm:py-40 lg:py-48">
            <div className="relative isolate px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
              <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,rgba(238,43,140,0.2)_0%,transparent_50%)] animate-subtle-float"></div>
              <div className="text-center">
                <h1 className="text-6xl md:text-8xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-white/70 font-display">
                  Trustless Funding for Visionary Ideas.
                </h1>
                <p className="mt-6 max-w-3xl mx-auto text-lg text-white/70 font-body">
                  DotNation is the decentralized crowdfunding protocol for the Polkadot ecosystem. Launch your project, rally your community, and fund the future, completely on-chain.
                </p>
                <div className="mt-12 flex items-center justify-center gap-4">
                  <Link
                    to="/dashboard"
                    className="flex mx-auto items-center justify-center rounded-full h-14 px-10 bg-primary text-white text-lg font-bold tracking-wide hover:bg-primary/90 transition-all transform hover:scale-105 duration-300"
                  >
                    Explore Campaigns
                  </Link>
                  <Link
                    to="/create-campaign"
                    className="flex mx-auto items-center justify-center rounded-full h-14 px-10 bg-primary/20 text-white text-lg font-bold tracking-wide hover:bg-primary/30 transition-colors duration-300"
                  >
                    Launch App
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* Trust Signals Section */}
          <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white/5">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold font-display mb-4 text-white">Trusted by Innovators Worldwide</h2>
                <div className="flex justify-center items-center gap-8 mt-8">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-primary font-display">$2.4M+</div>
                    <div className="text-white/60 text-sm">Funds Raised</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-secondary font-display">1,200+</div>
                    <div className="text-white/60 text-sm">Successful Campaigns</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-400 font-display">15,000+</div>
                    <div className="text-white/60 text-sm">Community Members</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-400 font-display">98%</div>
                    <div className="text-white/60 text-sm">Success Rate</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section id="features" className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-bold tracking-tight font-display">Built for Real People, Real Impact</h2>
              <p className="mt-4 max-w-2xl mx-auto text-lg text-white/70 font-body">
                We believe crowdfunding should be simple, secure, and human-centered. That&apos;s why we built DotNation on principles of transparency, community, and trust.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="card flex flex-col gap-4 rounded-xl border border-white/10 bg-white/5 p-8 backdrop-blur-lg hover:border-primary/30 transition-all duration-300">
                <div className="flex-shrink-0 size-12 flex items-center justify-center rounded-full bg-primary/20 text-primary">
                  <svg fill="currentColor" height="28" viewBox="0 0 256 256" width="28">
                    <path d="M208,40H48A16,16,0,0,0,32,56v58.78c0,89.61,75.82,119.34,91,124.39a15.53,15.53,0,0,0,10,0c15.2-5.05,91-34.78,91-124.39V56A16,16,0,0,0,208,40Zm0,74.79c0,78.42-66.35,104.62-80,109.18-13.53-4.51-80-30.69-80-109.18V56H208ZM82.34,141.66a8,8,0,0,1,11.32-11.32L112,148.68l50.34-50.34a8,8,0,0,1,11.32,11.32l-56,56a8,8,0,0,1-11.32,0Z"/>
                  </svg>
                </div>
                <h3 className="text-xl font-bold font-display">On-Chain Escrow</h3>
                <p className="text-white/60 font-body">Funds are locked in the smart contract, not our bank account. Withdrawals are only possible when campaign rules are met.</p>
              </div>
              <div className="card flex flex-col gap-4 rounded-xl border border-white/10 bg-white/5 p-8 backdrop-blur-lg hover:border-primary/30 transition-all duration-300">
                <div className="flex-shrink-0 size-12 flex items-center justify-center rounded-full bg-primary/20 text-primary">
                  <svg fill="currentColor" height="28" viewBox="0 0 256 256" width="28">
                    <path d="M215.6,83.2l-80-64a8,8,0,0,0-9.2,0l-80,64A8,8,0,0,0,40,88V192a16,16,0,0,0,16,16H200a16,16,0,0,0,16-16V88A8,8,0,0,0,215.6,83.2ZM128,42.21,194.81,96H61.19ZM200,192H56V112H200Z"/>
                  </svg>
                </div>
                <h3 className="text-xl font-bold font-display">Radical Transparency</h3>
                <p className="text-white/60 font-body">Every donation, withdrawal, and campaign creation is a public transaction on the blockchain, verifiable by anyone.</p>
              </div>
              <div className="card flex flex-col gap-4 rounded-xl border border-white/10 bg-white/5 p-8 backdrop-blur-lg hover:border-primary/30 transition-all duration-300">
                <div className="flex-shrink-0 size-12 flex items-center justify-center rounded-full bg-primary/20 text-primary">
                  <svg fill="currentColor" height="28" viewBox="0 0 256 256" width="28">
                    <path d="M244.8,150.4a8,8,0,0,1-11.2-1.6A51.6,51.6,0,0,0,192,128a8,8,0,0,1-7.37-4.89,8,8,0,0,1,0-6.22A8,8,0,0,1,192,112a24,24,0,1,0-23.24-30,8,8,0,1,1-15.5-4A40,40,0,1,1,219,117.51a67.94,67.94,0,0,1,27.43,21.68A8,8,0,0,1,244.8,150.4ZM190.92,212a8,8,0,1,1-13.84,8,57,57,0,0,0-98.16,0,8,8,0,1,1-13.84-8,72.06,72.06,0,0,1,33.74-29.92,48,48,0,1,1,58.36,0A72.06,72.06,0,0,1,190.92,212ZM128,176a32,32,0,1,0-32-32A32,32,0,0,0,128,176ZM72,120a8,8,0,0,0-8-8A24,24,0,1,1,87.24,82a8,8,0,0,0,15.5-4A40,40,0,1,0,37,117.51,67.94,67.94,0,0,0,9.6,139.19a8,8,0,0,0,12.8,9.61A51.6,51.6,0,0,1,64,128,8,8,0,0,0,72,120Z"/>
                  </svg>
                </div>
                <h3 className="text-xl font-bold font-display">Community Governed</h3>
                <p className="text-white/60 font-body">Designed to be a public good, the protocol&apos;s future will be guided by its community of users, not a central corporation.</p>
              </div>
            </div>
          </section>

          {/* How It Works Section */}
          <section id="how-it-works" className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-bold tracking-tight font-display">Simple & Secure by Design</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="flex flex-col items-center">
                <div className="flex-shrink-0 size-20 flex items-center justify-center rounded-full bg-primary/20 text-primary border-2 border-primary/30 mb-4">
                  <span className="text-2xl font-bold font-display">1</span>
                </div>
                <h3 className="text-xl font-bold font-display">Creator Launches Campaign</h3>
                <p className="text-white/60 mt-2 font-body">A creator defines their goal, deadline, and beneficiary. The rules are locked into the smart contract.</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="flex-shrink-0 size-20 flex items-center justify-center rounded-full bg-primary/20 text-primary border-2 border-primary/30 mb-4">
                  <span className="text-2xl font-bold font-display">2</span>
                </div>
                <h3 className="text-xl font-bold font-display">Community Donates Funds</h3>
                <p className="text-white/60 mt-2 font-body">Donors send funds directly to the contract. The contract acts as a neutral escrow, holding the funds securely.</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="flex-shrink-0 size-20 flex items-center justify-center rounded-full bg-primary/20 text-primary border-2 border-primary/30 mb-4">
                  <span className="text-2xl font-bold font-display">3</span>
                </div>
                <h3 className="text-xl font-bold font-display">Funds are Released</h3>
                <p className="text-white/60 mt-2 font-body">If the goal is met, the creator can withdraw. If not, donors can claim a refund. The rules are enforced automatically.</p>
              </div>
            </div>
          </section>

          {/* Projects Section */}
          <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-bold tracking-tight font-display">Powering the Polkadot Ecosystem</h2>
              <div id="project-filters" className="flex justify-center gap-2 mt-8">
                <button
                  className={`filter-btn ${activeFilter === 'all' ? 'active' : ''} bg-primary/20 text-white/80 hover:bg-primary/30 font-bold py-2 px-4 rounded-full transition-colors duration-300`}
                  onClick={() => handleFilterClick('all')}
                >
                  All
                </button>
                <button
                  className={`filter-btn ${activeFilter === 'defi' ? 'active' : ''} bg-primary/20 text-white/80 hover:bg-primary/30 font-bold py-2 px-4 rounded-full transition-colors duration-300`}
                  onClick={() => handleFilterClick('defi')}
                >
                  DeFi
                </button>
                <button
                  className={`filter-btn ${activeFilter === 'infra' ? 'active' : ''} bg-primary/20 text-white/80 hover:bg-primary/30 font-bold py-2 px-4 rounded-full transition-colors duration-300`}
                  onClick={() => handleFilterClick('infra')}
                >
                  Infrastructure
                </button>
                <button
                  className={`filter-btn ${activeFilter === 'community' ? 'active' : ''} bg-primary/20 text-white/80 hover:bg-primary/30 font-bold py-2 px-4 rounded-full transition-colors duration-300`}
                  onClick={() => handleFilterClick('community')}
                >
                  Community
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-8">
              <div className={`project-card card flex flex-col gap-4 rounded-xl overflow-hidden group p-6 items-center justify-center transition-all duration-300 ${activeFilter !== 'all' && activeFilter !== 'defi' ? 'filtered-out' : ''}`} data-category="defi">
                <svg className="h-12 w-auto text-white opacity-70 group-hover:opacity-100 transition-opacity" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M64 128C99.3462 128 128 99.3462 128 64C128 28.6538 99.3462 0 64 0C28.6538 0 0 28.6538 0 64C0 99.3462 28.6538 128 64 128Z" fill="currentColor"/>
                  <path d="M64.0001 114.24C45.2427 114.24 29.4118 98.4091 29.4118 79.6517C29.4118 60.8943 45.2427 45.0634 64.0001 45.0634C82.7575 45.0634 98.5883 60.8943 98.5883 79.6517C98.5883 98.4091 82.7575 114.24 64.0001 114.24ZM32.4049 22.8105L45.0833 35.4889C38.9912 40.4281 34.4069 46.9088 32.1883 54.349C22.6942 53.6449 13.76 64 13.76 64L18.4236 49.9167L13.76 35.4889L32.4049 22.8105Z" fill="#111"/>
                </svg>
                <div className="text-center">
                  <h3 className="text-lg font-bold text-white font-display">Acala</h3>
                  <p className="text-white/60 mt-1 font-body text-sm">DeFi Hub</p>
                </div>
              </div>
              <div className={`project-card card flex flex-col gap-4 rounded-xl overflow-hidden group p-6 items-center justify-center transition-all duration-300 ${activeFilter !== 'all' && activeFilter !== 'infra' ? 'filtered-out' : ''}`} data-category="infra">
                <svg className="h-12 w-auto text-white opacity-70 group-hover:opacity-100 transition-opacity" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M512 256C512 397.385 397.385 512 256 512C114.615 512 0 397.385 0 256C0 114.615 114.615 0 256 0C397.385 0 512 114.615 512 256Z" fill="currentColor"/>
                  <path d="M256 439.467C198.533 439.467 151.467 392.4 151.467 334.933C151.467 277.467 198.533 230.4 256 230.4C313.467 230.4 360.533 277.467 360.533 334.933C360.533 392.4 313.467 439.467 256 439.467ZM116 118.8C136.667 122.533 150.267 141.867 153.2 161.2C158.267 154.8 164.8 150.267 172.067 146.533C154.8 102.267 121.2 72.5333 116 72.5333C110.8 72.5333 102.267 101.533 116 118.8Z" fill="#111"/>
                </svg>
                <div className="text-center">
                  <h3 className="text-lg font-bold text-white font-display">Moonbeam</h3>
                  <p className="text-white/60 mt-1 font-body text-sm">Smart Contracts</p>
                </div>
              </div>
              <div className={`project-card card flex flex-col gap-4 rounded-xl overflow-hidden group p-6 items-center justify-center transition-all duration-300 ${activeFilter !== 'all' && activeFilter !== 'community' ? 'filtered-out' : ''}`} data-category="community">
                <svg className="h-12 w-auto text-white opacity-70 group-hover:opacity-100 transition-opacity" viewBox="0 0 1024 1024" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M226.68 769.76L93.32 501.84L226.68 233.92L360.04 501.84L226.68 769.76ZM257.48 718.4L324.2 501.84L257.48 285.28L190.76 501.84L257.48 718.4Z" fill="currentColor"/>
                  <path d="M411.32 935.92L277.96 668L411.32 400.08L544.68 668L411.32 935.92ZM442.12 884.56L508.84 668L442.12 451.44L375.4 668L442.12 884.56Z" fill="currentColor"/>
                  <path d="M796.68 935.92L663.32 668L796.68 400.08L930.04 668L796.68 935.92ZM827.48 884.56L894.2 668L827.48 451.44L760.76 668L827.48 884.56Z" fill="currentColor"/>
                  <path d="M605.32 501.84L471.96 233.92L605.32 -34L738.68 233.92L605.32 501.84ZM636.12 450.48L702.84 233.92L636.12 17.36L569.4 233.92L636.12 450.48Z" fill="currentColor"/>
                  <path d="M663.32 233.92L530 -34L396.68 233.92L530 501.84L663.32 233.92Z" fill="currentColor"/>
                </svg>
                <div className="text-center">
                  <h3 className="text-lg font-bold text-white font-display">Astar</h3>
                  <p className="text-white/60 mt-1 font-body text-sm">Community Events</p>
                </div>
              </div>
              <div className={`project-card card flex flex-col gap-4 rounded-xl overflow-hidden group p-6 items-center justify-center transition-all duration-300 ${activeFilter !== 'all' && activeFilter !== 'infra' ? 'filtered-out' : ''}`} data-category="infra">
                <svg className="h-12 w-auto text-white opacity-70 group-hover:opacity-100 transition-opacity" viewBox="0 0 100 100" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M50,0A50,50,0,1,0,50,100A50,50,0,0,0,50,0Zm0,94A44,44,0,1,1,94,50,44,44,0,0,1,50,94Z"/>
                  <path d="M50,22A28,28,0,1,0,78,50,28,28,0,0,0,50,22Zm0,50A22,22,0,1,1,72,50,22,22,0,0,1,50,72Z"/>
                  <path d="M50,38A12,12,0,1,0,62,50,12,12,0,0,0,50,38Z"/>
                </svg>
                <div className="text-center">
                  <h3 className="text-lg font-bold text-white font-display">Phala Network</h3>
                  <p className="text-white/60 mt-1 font-body text-sm">Public Goods</p>
                </div>
              </div>
              <div className={`project-card card flex flex-col gap-4 rounded-xl overflow-hidden group p-6 items-center justify-center transition-all duration-300 ${activeFilter !== 'all' && activeFilter !== 'defi' ? 'filtered-out' : ''}`} data-category="defi">
                <svg className="h-12 w-auto text-white opacity-70 group-hover:opacity-100 transition-opacity" viewBox="0 0 256 256" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                  <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm48-96.52v.52h-32v-40a8,8,0,0,0-16,0v40H96v-24a8,8,0,0,0-16,0v24H80a8,8,0,0,0,0,16H80v32H96v24a8,8,0,0,0,16,0v-24h32v40a8,8,0,0,0,16,0v-40h16a8,8,0,0,0,0-16Zm-32,32H96v-32h48Z"/>
                </svg>
                <div className="text-center">
                  <h3 className="text-lg font-bold text-white font-display">Parallel Finance</h3>
                  <p className="text-white/60 mt-1 font-body text-sm">Liquid Staking</p>
                </div>
              </div>
              <div className={`project-card card flex flex-col gap-4 rounded-xl overflow-hidden group p-6 items-center justify-center transition-all duration-300 ${activeFilter !== 'all' && activeFilter !== 'community' ? 'filtered-out' : ''}`} data-category="community">
                <svg className="h-12 w-auto text-white opacity-70 group-hover:opacity-100 transition-opacity" fill="currentColor" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
                  <path d="M512 0C229.2 0 0 229.2 0 512s229.2 512 512 512 512-229.2 512-512S794.8 0 512 0zm259.4 685.3H611.2V513.7h160.2v-109H611.2V262.3l-193.3 92.5v50.2h193.3v109H417.9v-50.2L257.4 371.3v314h403.2c44.2 0 80.1-35.9 80.1-80.1V605c0-44.2-35.8-19.7-80-19.7z"/>
                </svg>
                <div className="text-center">
                  <h3 className="text-lg font-bold text-white font-display">Subsocial</h3>
                  <p className="text-white/60 mt-1 font-body text-sm">Social Platforms</p>
                </div>
              </div>
            </div>
          </section>

          {/* Built for Polkadot Section */}
          <section id="built-for-polkadot" className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
              <div className="text-center md:text-left">
                <h2 className="text-4xl lg:text-5xl font-bold tracking-tight font-display">Natively Integrated with Polkadot</h2>
                <p className="mt-4 max-w-2xl text-lg text-white/70 font-body">
                  DotNation isn&apos;t just built on Polkadot; it&apos;s designed to leverage its unique strengths. We utilize shared security, interoperability, and on-chain governance to create a fundraising platform that is more secure, scalable, and future-proof.
                </p>
              </div>
              <div className="flex justify-center">
                <svg className="w-64 h-64 opacity-80 text-white" fill="currentColor" viewBox="0 0 118 118" xmlns="http://www.w3.org/2000/svg">
                  <path d="M59 118C91.5686 118 118 91.5685 118 59C118 26.4315 91.5686 0 59 0C26.4314 0 0 26.4315 0 59C0 91.5685 26.4314 118 59 118ZM59 108.8C86.5157 108.8 108.8 86.5157 108.8 59C108.8 31.4843 86.5157 9.19999 59 9.19999C31.4843 9.19999 9.19999 31.4843 9.19999 59C9.19999 86.5157 31.4843 108.8 59 108.8ZM88.8029 48.6016C88.8029 49.9675 87.6974 51.0729 86.3314 51.0729C84.9654 51.0729 83.8599 49.9675 83.8599 48.6016C83.8599 47.2356 84.9654 46.1302 86.3314 46.1302C87.6974 46.1302 88.8029 47.2356 88.8029 48.6016ZM71.1643 30.296C72.5303 30.296 73.6357 29.1906 73.6357 27.8246C73.6357 26.4586 72.5303 25.3532 71.1643 25.3532C69.7984 25.3532 68.6929 26.4586 68.6929 27.8246C68.6929 29.1906 69.7984 30.296 71.1643 30.296ZM45.6029 30.296C46.9688 30.296 48.0743 29.1906 48.0743 27.8246C48.0743 26.4586 46.9688 25.3532 45.6029 25.3532C44.2369 25.3532 43.1314 26.4586 43.1314 27.8246C43.1314 29.1906 44.2369 30.296 45.6029 30.296ZM28.0214 48.6016C28.0214 49.9675 26.916 51.0729 25.55 51.0729C24.184 51.0729 23.0786 49.9675 23.0786 48.6016C23.0786 47.2356 24.184 46.1302 25.55 46.1302C26.916 46.1302 28.0214 47.2356 28.0214 48.6016ZM86.3314 66.904C87.6974 66.904 88.8029 68.0094 88.8029 69.3754C88.8029 70.7414 87.6974 71.8468 86.3314 71.8468C84.9654 71.8468 83.8599 70.7414 83.8599 69.3754C83.8599 68.0094 84.9654 66.904 86.3314 66.904ZM71.1643 85.1408C72.5303 85.1408 73.6357 86.2462 73.6357 87.6122C73.6357 88.9781 72.5303 100.084 71.1643 100.084C69.7984 100.084 68.6929 88.9781 68.6929 87.6122C68.6929 86.2462 69.7984 85.1408 71.1643 85.1408ZM45.6029 85.1408C46.9688 85.1408 48.0743 86.2462 48.0743 87.6122C48.0743 88.9781 46.9688 100.084 45.6029 100.084C44.2369 100.084 43.1314 88.9781 43.1314 87.6122C43.1314 86.2462 44.2369 85.1408 45.6029 85.1408ZM25.55 66.904C26.916 66.904 28.0214 68.0094 28.0214 69.3754C28.0214 70.7414 26.916 71.8468 25.55 71.8468C24.184 71.8468 23.0786 70.7414 23.0786 69.3754C23.0786 68.0094 24.184 66.904 25.55 66.904Z"/>
                </svg>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
            <div className="relative rounded-xl overflow-hidden bg-primary/10 backdrop-blur-lg border border-primary/20 px-8 py-16">
              <div className="absolute -inset-2 bg-[radial-gradient(circle_at_50%_50%,rgba(238,43,140,0.1)_0%,transparent_70%)] opacity-50 animate-pulse-slow"></div>
              <div className="text-center relative">
                <h2 className="text-4xl font-bold tracking-tight font-display">Ready to build the future?</h2>
                <p className="mt-4 max-w-xl mx-auto text-lg text-white/70 font-body">
                  Launch your campaign on a platform built for trust, or find and fund the next great idea in the Polkadot ecosystem.
                </p>
                <div className="mt-10">
                  <Link
                    to="/create-campaign"
                    className="flex mx-auto items-center justify-center rounded-full h-12 px-8 bg-primary text-white text-base font-bold tracking-wide hover:bg-primary/90 transition-all transform hover:scale-105 duration-300"
                  >
                    Launch the App
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6 border-t border-white/10">
            <div className="flex flex-col md:flex-row justify-between items-center gap-8">
              <div className="flex items-center gap-3 text-white">
                <svg className="text-primary size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
                  <circle cx="12" cy="12" fill="currentColor" r="4" />
                </svg>
                <h2 className="text-white/80 text-lg font-bold font-display">DotNation</h2>
              </div>
              <div className="flex gap-4">
                <a className="text-white/60 hover:text-white transition-colors" href="#">
                  <svg fill="currentColor" height="24" viewBox="0 0 256 256" width="24">
                    <path d="M247.39,68.94A8,8,0,0,0,240,64H209.57A48.66,48.66,0,0,0,168.1,40a46.91,46.91,0,0,0-33.75,13.7A47.9,47.9,0,0,0,120,88v6.09C79.74,83.47,46.81,50.72,46.46,50.37a8,8,0,0,0-13.65,4.92c-4.31,47.79,9.57,79.77,22,98.18a110.93,110.93,0,0,0,21.88,24.2c-15.23,17.53-39.21,26.74-39.47,26.84a8,8,0,0,0-3.85,11.93c.75,1.12,3.75,5.05,11.08,8.72C53.51,229.7,65.48,232,80,232c70.67,0,129.72-54.42,135.75-124.44l29.91-29.9A8,8,0,0,0,247.39,68.94Zm-45,29.41a8,8,0,0,0-2.32,5.14C196,166.58,143.28,216,80,216c-10.56,0-18-1.4-23.22-3.08,11.51-6.25,27.56-17,37.88-32.48A8,8,0,0,0,92,169.08c-.47-.27-43.91-26.34-44-96,16,13,45.25,33.17,78.67,38.79A8,8,0,0,0,136,104V88a32,32,0,0,1,9.6-22.92A30.94,30.94,0,0,1,167.9,56c12.66.16,24.49,7.88,29.44,19.21A8,8,0,0,0,204.67,80h16Z"/>
                  </svg>
                </a>
                <a className="text-white/60 hover:text-white transition-colors" href="#">
                  <svg fill="currentColor" height="24" viewBox="0 0 256 256" width="24">
                    <path d="M208.3,76.71a8,8,0,0,0-10.23,4.64A128.7,128.7,0,0,1,160,105.15V104a8,8,0,0,0-8-8H104a8,8,0,0,0-8,8v1.15a128.7,128.7,0,0,1,-38.07-23.8A8,8,0,0,0,56.3,86.25a133.24,133.24,0,0,0-15.84,33.56A8,8,0,0,0,48,128v64a8,8,0,0,0,8,8H76.2a8,8,0,0,0,7.88-6.52C87.31,180.23,98.39,176,104,176h48c5.61,0,16.69,4.23,19.92,13.48A8,8,0,0,0,179.8,200H200a8,8,0,0,0,8-8V128a8,8,0,0,0,7.52-7.81A133.24,133.24,0,0,0,200.07,86.25,8,8,0,0,0,208.3,76.71ZM176,136a16,16,0,1,1-16-16A16,16,0,0,1,176,136ZM96,120a16,16,0,1,1,16,16A16,16,0,0,1,96,120Z"/>
                  </svg>
                </a>
              </div>
              <p className="text-white/60 text-sm">&copy; 2024 DotNation. A Public Good.</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default NewLandingPage;