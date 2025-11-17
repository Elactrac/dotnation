import { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useWallet } from '../contexts/WalletContext';

const NewLandingPage = () => {
  const { accounts, selectedAccount, connectWallet, switchAccount, disconnectWallet } = useWallet();
  const [activeFilter, setActiveFilter] = useState('all');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    let lastScroll = 0;
    
    // Sophisticated mesh grid with mouse interaction
    const canvas = document.getElementById('mesh-canvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    
    const handleMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };
    
    const drawMesh = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const gridSize = 40;
      const maxDistance = 200;
      
      ctx.strokeStyle = 'rgba(56, 116, 255, 0.15)';
      ctx.lineWidth = 1;
      
      // Draw vertical lines
      for (let x = 0; x < canvas.width; x += gridSize) {
        const distX = Math.abs(mouseX - x);
        if (distX < maxDistance) {
          const opacity = (1 - distX / maxDistance) * 0.3;
          ctx.strokeStyle = `rgba(56, 195, 255, ${opacity})`;
        } else {
          ctx.strokeStyle = 'rgba(56, 116, 255, 0.08)';
        }
        
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      
      // Draw horizontal lines
      for (let y = 0; y < canvas.height; y += gridSize) {
        const distY = Math.abs(mouseY - y);
        if (distY < maxDistance) {
          const opacity = (1 - distY / maxDistance) * 0.3;
          ctx.strokeStyle = `rgba(56, 195, 255, ${opacity})`;
        } else {
          ctx.strokeStyle = 'rgba(56, 116, 255, 0.08)';
        }
        
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
      
      requestAnimationFrame(drawMesh);
    };
    
    drawMesh();
    
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleResize);

    // Enhanced Intersection Observer for different animation types
    const observerOptions = { 
      threshold: 0.1,
      rootMargin: '0px 0px -100px 0px' // Trigger slightly before element is in view
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          // Don't unobserve to allow repeat animations if needed
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    // Observe sections with different animation classes
    document.querySelectorAll('section').forEach(section => {
      section.classList.add('fade-in-section');
      observer.observe(section);
    });

    // Observe elements with specific animation classes
    document.querySelectorAll('.fade-in-up, .fade-in-left, .fade-in-right, .scale-in, .stagger-children, .reveal-blur').forEach(element => {
      observer.observe(element);
    });

    // Special observer for "How it Works" steps with staggered reveal
    const stepsObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const steps = entry.target.querySelectorAll('.step-item');
          steps.forEach((step, index) => {
            setTimeout(() => {
              step.classList.add('is-visible');
            }, index * 200); // Stagger by 200ms
          });
          stepsObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });

    const howItWorksSection = document.querySelector('#how-it-works');
    if (howItWorksSection) {
      stepsObserver.observe(howItWorksSection);
    }

    // Parallax effect for background elements on scroll
    const handleScroll = () => {
      const scrolled = window.pageYOffset;
      const header = document.querySelector('header');
      
      // Header hide/show
      if (header) {
        const currentScroll = window.pageYOffset;
        if (currentScroll > lastScroll && currentScroll > header.offsetHeight) {
          header.classList.add('-translate-y-full');
        } else {
          header.classList.remove('-translate-y-full');
        }
        lastScroll = currentScroll <= 0 ? 0 : currentScroll;
      }

      // Parallax effect for decorative elements
      const parallaxElements = document.querySelectorAll('.parallax-slow');
      parallaxElements.forEach((element, index) => {
        const speed = (index + 1) * 0.1;
        const yPos = -(scrolled * speed);
        element.style.transform = `translateY(${yPos}px)`;
      });

      // Subtle parallax for hero background
      const heroSection = document.querySelector('section');
      if (heroSection) {
        const heroParallax = scrolled * 0.5;
        const heroBackground = heroSection.querySelector('.absolute.inset-0');
        if (heroBackground) {
          heroBackground.style.transform = `translateY(${heroParallax}px)`;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll);
      if (observer) observer.disconnect();
      if (stepsObserver) stepsObserver.disconnect();
    };
  }, []);

  // Handle click outside dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isDropdownOpen && !event.target.closest('.relative')) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleFilterClick = (filter) => {
    setActiveFilter(filter);
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col bg-background-dark">
      {/* Interactive Mesh Grid Canvas */}
      <canvas
        id="mesh-canvas"
        className="fixed inset-0 pointer-events-none z-0"
      />

      {/* Static Background Gradients */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(56,116,255,0.03)_0%,transparent_50%)]" />
        <div className="absolute top-1/4 right-0 w-1/2 h-1/2 bg-[radial-gradient(circle_at_center,rgba(56,195,255,0.02)_0%,transparent_50%)]" />
        <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.02)_0%,transparent_50%)]" />
      </div>

      {/* Main Content */}
      <div className="relative flex flex-col min-h-screen z-10">
        {/* Header */}
        <header className="sticky top-0 z-50 flex items-center justify-between px-6 lg:px-10 py-5 border-b border-white/10 backdrop-blur-md bg-background-dark/80 transition-transform duration-300">
           <div className="flex items-center gap-4">
             <Link to="/" className="flex items-center gap-4 group">
               <div className="relative">
                 <svg
                   className="text-primary size-9 group-hover:scale-110 transition-transform duration-300"
                   fill="none"
                   stroke="currentColor"
                   viewBox="0 0 24 24"
                   xmlns="http://www.w3.org/2000/svg"
                 >
                   <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
                   <circle cx="12" cy="12" fill="currentColor" r="4" />
                 </svg>
                 <div className="absolute inset-0 bg-primary/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
               </div>
               <div>
                  <h1 className="text-gray-100 text-2xl font-bold font-display tracking-tight">DotNation</h1>
                  <p className="text-gray-400 text-xs font-medium">Blockchain Crowdfunding</p>
               </div>
             </Link>
           </div>

           <div className="flex flex-1 justify-end gap-6 items-center">
             <nav className="hidden lg:flex items-center gap-1">
                <a className="px-4 py-2 text-gray-300 hover:text-gray-100 hover:bg-gray-800/50 rounded-lg transition-all duration-200 font-medium text-sm" href="#features">Features</a>
                <a className="px-4 py-2 text-gray-300 hover:text-gray-100 hover:bg-gray-800/50 rounded-lg transition-all duration-200 font-medium text-sm" href="#how-it-works">How It Works</a>
                <a className="px-4 py-2 text-gray-300 hover:text-gray-100 hover:bg-gray-800/50 rounded-lg transition-all duration-200 font-medium text-sm" href="#built-for-polkadot">For Polkadot</a>
              </nav>

              <div className="flex items-center gap-3">
                <NavLink
                  to="/login"
                  className={({ isActive }) =>
                    isActive
                      ? "px-4 py-2 text-gray-100 bg-gray-800/70 rounded-lg font-medium text-sm"
                      : "px-4 py-2 text-gray-300 hover:text-gray-100 hover:bg-gray-800/50 rounded-lg transition-all duration-200 font-medium text-sm"
                  }
                >
                  Login
                </NavLink>

                <NavLink
                  to="/dashboard"
                  className="px-4 py-2 text-gray-300 hover:text-gray-100 hover:bg-gray-800/50 rounded-lg transition-all duration-200 font-medium text-sm"
                >
                  Dashboard
                </NavLink>

                <Link
                  to="/create-campaign"
                  className="flex items-center justify-center rounded-full h-11 px-6 bg-gradient-to-r from-primary to-secondary text-gray-100 text-sm font-semibold tracking-wide hover:shadow-lg hover:shadow-primary/25 transition-all duration-300 transform hover:scale-105"
                >
                  <span>Start Campaign</span>
                  <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>

              {selectedAccount ? (
                <div className="relative">
                  <button 
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center gap-2 rounded-full h-10 px-4 bg-gray-800/70 text-gray-200 text-sm font-medium hover:bg-gray-700/80 transition-colors duration-300"
                  >
                    <span className="w-6 h-6 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-500" />
                    <span>{formatAddress(selectedAccount.address)}</span>
                      <svg
                        className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                      <path d="M19 9l-7 7-7-7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                    </svg>
                  </button>

                  {/* Dropdown */}
                  {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 rounded-xl border border-white/10 bg-background-dark/95 backdrop-blur-lg shadow-xl transition-all duration-200">
                    <div className="p-4">
                      <p className="text-xs text-gray-400 mb-2">Connected Account</p>
                      <p className="text-sm text-gray-200 font-medium mb-4">{selectedAccount.address}</p>
                      {accounts.length > 1 && (
                        <div className="mb-4">
                          <p className="text-xs text-gray-400 mb-2">Switch Account</p>
                          {accounts.map((account) => (
                            <button
                              key={account.address}
                              onClick={() => switchAccount(account)}
                              className={`w-full text-left px-3 py-2 rounded-lg text-sm ${
                                  account.address === selectedAccount.address

                                    ? 'bg-primary/20 text-primary'
                                    : 'text-gray-300 hover:bg-gray-800/50'
                              } transition-colors`}
                            >
                              {account.meta.name || formatAddress(account.address)}
                            </button>
                          ))}
                        </div>
                      )}
                      <button
                        onClick={disconnectWallet}
                        className="w-full px-4 py-2 rounded-lg bg-gray-800/70 text-gray-200 text-sm font-medium hover:bg-gray-700/80 transition-colors"
                      >
                        Disconnect
                      </button>
                    </div>
                  </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={connectWallet}
                  className="flex items-center gap-2 rounded-full h-10 px-4 bg-gray-800/70 text-gray-200 text-sm font-medium hover:bg-gray-700/80 transition-colors duration-300"
                >
                  Connect Wallet
                </button>
              )}
            </div>
          </div>
        </header>

          {/* Hero Section */}
         <main className="flex-1 flex flex-col">
            <section className="py-24 sm:py-32 lg:py-36 relative overflow-visible">
              <div className="relative isolate px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-visible">
                 <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,rgba(56,116,255,0.25)_0%,transparent_50%)] animate-subtle-float pointer-events-none" style={{transform: 'scale(1.5)'}}></div>
                 
                 {/* Floating Illustration Elements */}
                 <div className="absolute -top-32 -right-32 w-96 h-96 opacity-20 animate-float-slow pointer-events-none">
                   <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                     <circle cx="100" cy="100" r="80" stroke="currentColor" strokeWidth="2" className="text-primary"/>
                     <circle cx="100" cy="100" r="60" stroke="currentColor" strokeWidth="2" className="text-secondary"/>
                     <circle cx="100" cy="100" r="40" fill="currentColor" className="text-primary/30"/>
                   </svg>
                 </div>
                 
                 <div className="absolute -bottom-32 -left-32 w-80 h-80 opacity-15 animate-float-slower pointer-events-none">
                   <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                     <path d="M100 20L180 100L100 180L20 100Z" stroke="currentColor" strokeWidth="2" className="text-secondary"/>
                     <path d="M100 50L150 100L100 150L50 100Z" fill="currentColor" className="text-secondary/20"/>
                   </svg>
                 </div>

              <div className="grid lg:grid-cols-2 gap-12 items-center">
                {/* Left: Text Content */}
                <div className="text-center lg:text-left fade-in-left">
                  <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter text-white font-display leading-none">
                    Trustless Funding for <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Visionary Ideas</span>
                  </h1>
                  <p className="mt-6 text-xl text-white/70 font-body max-w-2xl lg:mx-0 mx-auto">
                    DotNation is the decentralized crowdfunding protocol for the Polkadot ecosystem. Launch your project, rally your community, and fund the future, completely on-chain.
                  </p>
                  <div className="mt-12 flex items-center justify-center lg:justify-start gap-4 flex-wrap">
                    <Link
                      to="/dashboard"
                      className="flex items-center justify-center rounded-full h-14 px-10 bg-primary text-white text-lg font-bold tracking-wide hover:bg-primary/90 transition-all transform hover:scale-105 duration-300 shadow-lg shadow-primary/30"
                    >
                      Explore Campaigns
                    </Link>
                    <Link
                      to="/create-campaign"
                      className="flex items-center justify-center rounded-full h-14 px-10 border-2 border-primary text-primary text-lg font-bold tracking-wide hover:bg-primary hover:text-white transition-all transform hover:scale-105 duration-300 backdrop-blur-sm"
                    >
                      Launch App
                    </Link>
                  </div>
                </div>

                {/* Right: Hero Illustration */}
                <div className="hidden lg:flex justify-center items-center relative fade-in-right">
                  <div className="relative w-full max-w-lg">
                    {/* Main Illustration */}
                    <svg viewBox="0 0 500 500" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
                      {/* Background circles */}
                      <circle cx="250" cy="250" r="200" fill="url(#grad1)" opacity="0.1"/>
                      <circle cx="250" cy="250" r="150" fill="url(#grad2)" opacity="0.15"/>
                      
                      {/* Central platform illustration */}
                      <g className="animate-pulse-slow">
                        <rect x="150" y="200" width="200" height="120" rx="12" fill="currentColor" className="text-primary" stroke="currentColor" strokeWidth="2"/>
                        <rect x="170" y="220" width="160" height="20" rx="4" fill="currentColor" className="text-primary/30"/>
                        <rect x="170" y="250" width="120" height="12" rx="4" fill="currentColor" className="text-white/20"/>
                        <rect x="170" y="270" width="140" height="12" rx="4" fill="currentColor" className="text-white/20"/>
                      </g>
                      
                      {/* Floating coins/tokens */}
                      <circle cx="120" cy="150" r="25" fill="currentColor" className="text-secondary animate-float-slow" opacity="0.8"/>
                      <text x="120" y="157" textAnchor="middle" className="text-2xl font-bold" fill="white">$</text>
                      
                      <circle cx="380" cy="180" r="30" fill="currentColor" className="text-primary animate-float-slower" opacity="0.8"/>
                      <text x="380" y="188" textAnchor="middle" className="text-2xl font-bold" fill="white">DOT</text>
                      
                      <circle cx="100" cy="350" r="20" fill="currentColor" className="text-green-400 animate-float-slow" opacity="0.8"/>
                      <text x="100" y="357" textAnchor="middle" className="text-xl font-bold" fill="white">✓</text>
                      
                      {/* Network connections */}
                      <line x1="145" y1="160" x2="175" y2="205" stroke="currentColor" strokeWidth="2" className="text-primary/30" strokeDasharray="4 4"/>
                      <line x1="355" y1="195" x2="335" y2="215" stroke="currentColor" strokeWidth="2" className="text-secondary/30" strokeDasharray="4 4"/>
                      <line x1="120" y1="345" x2="160" y2="315" stroke="currentColor" strokeWidth="2" className="text-green-400/30" strokeDasharray="4 4"/>
                      
                      {/* User icons */}
                      <g className="animate-float-slower">
                        <circle cx="400" cy="350" r="35" fill="currentColor" className="text-primary" stroke="currentColor" strokeWidth="2"/>
                        <circle cx="400" cy="340" r="12" fill="currentColor" className="text-primary"/>
                        <path d="M380 370 Q400 355 420 370" stroke="currentColor" strokeWidth="2" className="text-primary" fill="none"/>
                      </g>
                      
                      <defs>
                        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#3874ff" stopOpacity="1"/>
                          <stop offset="100%" stopColor="#00EAD3" stopOpacity="1"/>
                        </linearGradient>
                        <linearGradient id="grad2" x1="100%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#00EAD3" stopOpacity="1"/>
                          <stop offset="100%" stopColor="#3874ff" stopOpacity="1"/>
                        </linearGradient>
                      </defs>
                    </svg>
                    
                    {/* Decorative dots */}
                    <div className="absolute -top-4 -right-4 w-20 h-20 grid grid-cols-4 gap-2 opacity-50">
                      {[...Array(16)].map((_, i) => (
                        <div key={i} className="w-2 h-2 rounded-full bg-primary"></div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Trust Signals Section */}
          <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/5 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(56,116,255,0.1)_0%,transparent_50%)] parallax-slow"></div>
            <div className="max-w-7xl mx-auto relative">
              <div className="text-center mb-16 fade-in-up">
                <h2 className="text-4xl font-bold font-display mb-4 text-white">Trusted by Innovators Worldwide</h2>
                <p className="text-white/60 max-w-2xl mx-auto">Join thousands of creators and backers building the future on Polkadot</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 stagger-children">
                {/* Stat Card 1 */}
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent rounded-2xl blur-xl group-hover:blur-2xl transition-all"></div>
                  <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 text-center hover:border-primary/30 transition-all">
                    <svg className="w-12 h-12 mx-auto mb-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="text-4xl font-bold text-primary font-display mb-2">$2.4M+</div>
                    <div className="text-white/60 text-sm font-medium">Funds Raised</div>
                  </div>
                </div>

                {/* Stat Card 2 */}
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-br from-secondary/20 to-transparent rounded-2xl blur-xl group-hover:blur-2xl transition-all"></div>
                  <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 text-center hover:border-secondary/30 transition-all">
                    <svg className="w-12 h-12 mx-auto mb-4 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="text-4xl font-bold text-secondary font-display mb-2">1,200+</div>
                    <div className="text-white/60 text-sm font-medium">Successful Campaigns</div>
                  </div>
                </div>

                {/* Stat Card 3 */}
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-400/20 to-transparent rounded-2xl blur-xl group-hover:blur-2xl transition-all"></div>
                  <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 text-center hover:border-green-400/30 transition-all">
                    <svg className="w-12 h-12 mx-auto mb-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <div className="text-4xl font-bold text-green-400 font-display mb-2">15,000+</div>
                    <div className="text-white/60 text-sm font-medium">Community Members</div>
                  </div>
                </div>

                {/* Stat Card 4 */}
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 to-transparent rounded-2xl blur-xl group-hover:blur-2xl transition-all"></div>
                  <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 text-center hover:border-purple-400/30 transition-all">
                    <svg className="w-12 h-12 mx-auto mb-4 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    <div className="text-4xl font-bold text-purple-400 font-display mb-2">98%</div>
                    <div className="text-white/60 text-sm font-medium">Success Rate</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section id="features" className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative">
            <div className="text-center mb-16 fade-in-up">
              <h2 className="text-4xl lg:text-5xl font-bold tracking-tight font-display">Built for Real People, Real Impact</h2>
              <p className="mt-4 max-w-2xl mx-auto text-lg text-white/70 font-body">
                We believe crowdfunding should be simple, secure, and human-centered. That&apos;s why we built DotNation on principles of transparency, community, and trust.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 stagger-children">
              {/* Feature Card 1 - Enhanced */}
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-transparent rounded-2xl blur-xl group-hover:blur-2xl transition-all"></div>
                <div className="relative flex flex-col gap-6 rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/20 via-primary/5 to-transparent p-8 backdrop-blur-lg hover:border-primary/50 transition-all duration-300 h-full">
                  <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-md"></div>
                    <div className="relative flex-shrink-0 size-16 flex items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary/80 text-white shadow-lg shadow-primary/30">
                      <svg fill="currentColor" height="32" viewBox="0 0 256 256" width="32">
                        <path d="M208,40H48A16,16,0,0,0,32,56v58.78c0,89.61,75.82,119.34,91,124.39a15.53,15.53,0,0,0,10,0c15.2-5.05,91-34.78,91-124.39V56A16,16,0,0,0,208,40Zm0,74.79c0,78.42-66.35,104.62-80,109.18-13.53-4.51-80-30.69-80-109.18V56H208ZM82.34,141.66a8,8,0,0,1,11.32-11.32L112,148.68l50.34-50.34a8,8,0,0,1,11.32,11.32l-56,56a8,8,0,0,1-11.32,0Z"/>
                      </svg>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold font-display mb-3">On-Chain Escrow</h3>
                    <p className="text-white/60 font-body leading-relaxed">Funds are locked in the smart contract, not our bank account. Withdrawals are only possible when campaign rules are met.</p>
                  </div>
                </div>
              </div>

              {/* Feature Card 2 - Enhanced */}
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-br from-secondary/20 via-transparent to-transparent rounded-2xl blur-xl group-hover:blur-2xl transition-all"></div>
                <div className="relative flex flex-col gap-6 rounded-2xl border border-secondary/30 bg-gradient-to-br from-secondary/20 via-secondary/5 to-transparent p-8 backdrop-blur-lg hover:border-secondary/50 transition-all duration-300 h-full">
                  <div className="relative">
                    <div className="absolute inset-0 bg-secondary/20 rounded-2xl blur-md"></div>
                    <div className="relative flex-shrink-0 size-16 flex items-center justify-center rounded-2xl bg-gradient-to-br from-secondary to-secondary/80 text-white shadow-lg shadow-secondary/30">
                      <svg fill="currentColor" height="32" viewBox="0 0 256 256" width="32">
                        <path d="M247.31,124.76c-.35-.79-8.82-19.58-27.65-38.41C194.57,61.26,162.88,48,128,48S61.43,61.26,36.34,86.35C17.51,105.18,9,124,8.69,124.76a8,8,0,0,0,0,6.5c.35.79,8.82,19.57,27.65,38.4C61.43,194.74,93.12,208,128,208s66.57-13.26,91.66-38.34c18.83-18.83,27.3-37.61,27.65-38.4A8,8,0,0,0,247.31,124.76ZM128,192c-30.78,0-57.67-11.19-79.93-33.25A133.47,133.47,0,0,1,25,128,133.33,133.33,0,0,1,48.07,97.25C70.33,75.19,97.22,64,128,64s57.67,11.19,79.93,33.25A133.46,133.46,0,0,1,231.05,128C223.84,141.46,192.43,192,128,192Zm0-112a48,48,0,1,0,48,48A48.05,48.05,0,0,0,128,80Zm0,80a32,32,0,1,1,32-32A32,32,0,0,1,128,160Z"/>
                      </svg>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold font-display mb-3">Radical Transparency</h3>
                    <p className="text-white/60 font-body leading-relaxed">Every donation, withdrawal, and campaign creation is a public transaction on the blockchain, verifiable by anyone.</p>
                  </div>
                </div>
              </div>

              {/* Feature Card 3 - Enhanced */}
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 via-transparent to-transparent rounded-2xl blur-xl group-hover:blur-2xl transition-all"></div>
                <div className="relative flex flex-col gap-6 rounded-2xl border border-purple-400/30 bg-gradient-to-br from-purple-400/20 via-purple-400/5 to-transparent p-8 backdrop-blur-lg hover:border-purple-400/50 transition-all duration-300 h-full">
                  <div className="relative">
                    <div className="absolute inset-0 bg-purple-400/20 rounded-2xl blur-md"></div>
                    <div className="relative flex-shrink-0 size-16 flex items-center justify-center rounded-2xl bg-gradient-to-br from-purple-400 to-purple-500 text-white shadow-lg shadow-purple-400/30">
                      <svg fill="currentColor" height="32" viewBox="0 0 256 256" width="32">
                        <path d="M244.8,150.4a8,8,0,0,1-11.2-1.6A51.6,51.6,0,0,0,192,128a8,8,0,0,1-7.37-4.89,8,8,0,0,1,0-6.22A8,8,0,0,1,192,112a24,24,0,1,0-23.24-30,8,8,0,1,1-15.5-4A40,40,0,1,1,219,117.51a67.94,67.94,0,0,1,27.43,21.68A8,8,0,0,1,244.8,150.4ZM190.92,212a8,8,0,1,1-13.84,8,57,57,0,0,0-98.16,0,8,8,0,1,1-13.84-8,72.06,72.06,0,0,1,33.74-29.92,48,48,0,1,1,58.36,0A72.06,72.06,0,0,1,190.92,212ZM128,176a32,32,0,1,0-32-32A32,32,0,0,0,128,176ZM72,120a8,8,0,0,0-8-8A24,24,0,1,1,87.24,82a8,8,0,0,0,15.5-4A40,40,0,1,0,37,117.51,67.94,67.94,0,0,0,9.6,139.19a8,8,0,0,0,12.8,9.61A51.6,51.6,0,0,1,64,128,8,8,0,0,0,72,120Z"/>
                      </svg>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold font-display mb-3">Community Governed</h3>
                    <p className="text-white/60 font-body leading-relaxed">Designed to be a public good, the protocol&apos;s future will be guided by its community of users, not a central corporation.</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Advanced Features Section - NEW */}
          <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(56,116,255,0.05)_0%,transparent_50%)] parallax-slow"></div>
            <div className="text-center mb-16 relative fade-in-up">
              <div className="inline-block px-4 py-2 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full border border-blue-500/30 mb-4">
                <span className="text-blue-400 font-bold text-sm">🚀 ADVANCED FEATURES</span>
              </div>
              <h2 className="text-4xl lg:text-5xl font-bold tracking-tight font-display mb-4">The Future of Crowdfunding</h2>
              <p className="mt-4 max-w-2xl mx-auto text-lg text-white/70 font-body">
                Leveraging cutting-edge blockchain technology to create the most advanced crowdfunding platform in Web3
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 stagger-children">
              {/* XCM Cross-Chain Donations */}
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-cyan-500/20 to-transparent rounded-2xl blur-xl group-hover:blur-2xl transition-all"></div>
                <div className="relative flex flex-col gap-6 rounded-2xl border border-blue-500/30 bg-gradient-to-br from-blue-500/10 via-cyan-500/5 to-transparent p-8 backdrop-blur-lg hover:border-blue-500/50 transition-all duration-300 h-full">
                  <div className="flex items-start gap-4">
                    <div className="relative flex-shrink-0">
                      <div className="absolute inset-0 bg-blue-500/20 rounded-2xl blur-md"></div>
                      <div className="relative size-16 flex items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/30">
                        <span className="text-3xl">🌉</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold font-display mb-2 text-white">Cross-Chain Donations (XCM)</h3>
                      <p className="text-blue-400 text-sm font-semibold mb-3">Powered by Polkadot XCM</p>
                    </div>
                  </div>
                  <p className="text-white/70 font-body leading-relaxed">
                    Donate from <strong>ANY Polkadot parachain</strong> - Moonbeam, Acala, Asset Hub, and more! Our XCM integration enables seamless cross-chain transfers without bridges. Assets arrive in seconds with minimal fees.
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-white/60 text-sm">
                      <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Support for 10+ parachains (Moonbeam, Acala, Astar, etc.)</span>
                    </div>
                    <div className="flex items-center gap-2 text-white/60 text-sm">
                      <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>12-24 second cross-chain transfer time</span>
                    </div>
                    <div className="flex items-center gap-2 text-white/60 text-sm">
                      <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>No bridges required - native Polkadot security</span>
                    </div>
                  </div>
                  <div className="mt-auto pt-6 border-t border-white/10">
                    <div className="flex items-center justify-between">
                      <span className="text-blue-400 text-sm font-medium">Available Now</span>
                      <svg className="w-5 h-5 text-blue-400 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quadratic Funding */}
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-br from-green-400/20 via-emerald-500/20 to-transparent rounded-2xl blur-xl group-hover:blur-2xl transition-all"></div>
                <div className="relative flex flex-col gap-6 rounded-2xl border border-green-400/30 bg-gradient-to-br from-green-400/10 via-emerald-500/5 to-transparent p-8 backdrop-blur-lg hover:border-green-400/50 transition-all duration-300 h-full">
                  <div className="flex items-start gap-4">
                    <div className="relative flex-shrink-0">
                      <div className="absolute inset-0 bg-green-400/20 rounded-2xl blur-md"></div>
                      <div className="relative size-16 flex items-center justify-center rounded-2xl bg-gradient-to-br from-green-400 to-emerald-500 text-white shadow-lg shadow-green-400/30">
                        <svg fill="currentColor" height="32" viewBox="0 0 256 256" width="32">
                          <path d="M176,112H152V88a8,8,0,0,0-16,0v24H112a8,8,0,0,0,0,16h24v24a8,8,0,0,0,16,0V128h24a8,8,0,0,0,0-16Zm64,40A104,104,0,1,1,136,48V16a8,8,0,0,1,16,0V48a104,104,0,0,1,88,104Zm-16,0a88,88,0,1,0-88,88A88.1,88.1,0,0,0,224,152Z"/>
                        </svg>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold font-display mb-2 text-white">Quadratic Funding</h3>
                      <p className="text-green-400 text-sm font-semibold mb-3">Democratic Matching Pools</p>
                    </div>
                  </div>
                  <p className="text-white/70 font-body leading-relaxed">
                    <strong>Amplify community support.</strong> Our quadratic funding mechanism gives more weight to the number of contributors than the amount donated, ensuring grassroots projects get fair matching from donor pools.
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-white/60 text-sm">
                      <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Favors projects with broad community support</span>
                    </div>
                    <div className="flex items-center gap-2 text-white/60 text-sm">
                      <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Automatic matching calculation & distribution</span>
                    </div>
                    <div className="flex items-center gap-2 text-white/60 text-sm">
                      <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Used by Gitcoin & other Web3 public goods platforms</span>
                    </div>
                  </div>
                  <div className="mt-auto pt-6 border-t border-white/10">
                    <div className="flex items-center justify-between">
                      <span className="text-green-400 text-sm font-medium">Available Now</span>
                      <svg className="w-5 h-5 text-green-400 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Milestone-Based Funding */}
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-400/20 via-amber-500/20 to-transparent rounded-2xl blur-xl group-hover:blur-2xl transition-all"></div>
                <div className="relative flex flex-col gap-6 rounded-2xl border border-orange-400/30 bg-gradient-to-br from-orange-400/10 via-amber-500/5 to-transparent p-8 backdrop-blur-lg hover:border-orange-400/50 transition-all duration-300 h-full">
                  <div className="flex items-start gap-4">
                    <div className="relative flex-shrink-0">
                      <div className="absolute inset-0 bg-orange-400/20 rounded-2xl blur-md"></div>
                      <div className="relative size-16 flex items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 to-amber-500 text-white shadow-lg shadow-orange-400/30">
                        <svg fill="currentColor" height="32" viewBox="0 0 256 256" width="32">
                          <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm40-68a28,28,0,0,1-28,28h-8v12a8,8,0,0,1-16,0V176H104a8,8,0,0,1,0-16h36a12,12,0,0,0,0-24H116a28,28,0,0,1,0-56h4V68a8,8,0,0,1,16,0V80h12a8,8,0,0,1,0,16H116a12,12,0,0,0,0,24h24A28,28,0,0,1,168,148Z"/>
                        </svg>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold font-display mb-2 text-white">Milestone-Based Releases</h3>
                      <p className="text-orange-400 text-sm font-semibold mb-3">Accountable Fund Management</p>
                    </div>
                  </div>
                  <p className="text-white/70 font-body leading-relaxed">
                    <strong>Build trust with transparency.</strong> Campaign creators set milestones with deliverables. Donors vote to approve fund releases at each stage, ensuring accountability and progress tracking.
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-white/60 text-sm">
                      <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Donors vote on milestone completion before funds release</span>
                    </div>
                    <div className="flex items-center gap-2 text-white/60 text-sm">
                      <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Transparent progress tracking for all stakeholders</span>
                    </div>
                    <div className="flex items-center gap-2 text-white/60 text-sm">
                      <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Optional: Choose traditional or milestone-based funding</span>
                    </div>
                  </div>
                  <div className="mt-auto pt-6 border-t border-white/10">
                    <div className="flex items-center justify-between">
                      <span className="text-orange-400 text-sm font-medium">Available Now</span>
                      <svg className="w-5 h-5 text-orange-400 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* DAO Governance + NFT Rewards */}
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-br from-pink-400/20 via-rose-500/20 to-transparent rounded-2xl blur-xl group-hover:blur-2xl transition-all"></div>
                <div className="relative flex flex-col gap-6 rounded-2xl border border-pink-400/30 bg-gradient-to-br from-pink-400/10 via-rose-500/5 to-transparent p-8 backdrop-blur-lg hover:border-pink-400/50 transition-all duration-300 h-full">
                  <div className="flex items-start gap-4">
                    <div className="relative flex-shrink-0">
                      <div className="absolute inset-0 bg-pink-400/20 rounded-2xl blur-md"></div>
                      <div className="relative size-16 flex items-center justify-center rounded-2xl bg-gradient-to-br from-pink-400 to-rose-500 text-white shadow-lg shadow-pink-400/30">
                        <svg fill="currentColor" height="32" viewBox="0 0 256 256" width="32">
                          <path d="M216,64H176V56a24,24,0,0,0-24-24H104A24,24,0,0,0,80,56v8H40A16,16,0,0,0,24,80V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V80A16,16,0,0,0,216,64ZM96,56a8,8,0,0,1,8-8h48a8,8,0,0,1,8,8v8H96ZM216,200H40V80H216V200Zm-32-68a12,12,0,1,1-12-12A12,12,0,0,1,184,132Z"/>
                        </svg>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold font-display mb-2 text-white">DAO Governance + NFT Rewards</h3>
                      <p className="text-pink-400 text-sm font-semibold mb-3">Community Ownership</p>
                    </div>
                  </div>
                  <p className="text-white/70 font-body leading-relaxed">
                    <strong>Own the platform you use.</strong> DotNation is governed by its community through a DAO. Donors receive commemorative NFTs as proof of support, which can unlock governance rights and special perks.
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-white/60 text-sm">
                      <svg className="w-4 h-4 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Donors receive unique NFT badges for each contribution</span>
                    </div>
                    <div className="flex items-center gap-2 text-white/60 text-sm">
                      <svg className="w-4 h-4 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>DAO treasury funds public goods & platform upgrades</span>
                    </div>
                    <div className="flex items-center gap-2 text-white/60 text-sm">
                      <svg className="w-4 h-4 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Community votes on platform direction & features</span>
                    </div>
                  </div>
                  <div className="mt-auto pt-6 border-t border-white/10">
                    <div className="flex items-center justify-between">
                      <span className="text-pink-400 text-sm font-medium">Available Now</span>
                      <svg className="w-5 h-5 text-pink-400 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature Highlight Banner */}
            <div className="mt-16 relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-green-500/10 to-pink-500/10 rounded-2xl blur-xl"></div>
              <div className="relative bg-gradient-to-r from-blue-500/5 via-green-500/5 to-pink-500/5 backdrop-blur-sm border border-blue-500/20 rounded-2xl p-8 text-center">
                <h3 className="text-2xl font-bold font-display text-white mb-3">
                  The Only Crowdfunding Platform with All These Features
                </h3>
                <p className="text-white/70 font-body max-w-3xl mx-auto">
                  DotNation combines XCM cross-chain donations, quadratic funding, milestone-based releases, DAO governance, and NFT rewards in one unified platform. Built on Polkadot for maximum security, scalability, and interoperability.
                </p>
              </div>
            </div>
          </section>

          {/* How It Works Section */}
          <section id="how-it-works" className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(0,234,211,0.08)_0%,transparent_50%)] parallax-slow"></div>
            <div className="text-center mb-20 relative fade-in-up">
              <h2 className="text-4xl lg:text-5xl font-bold tracking-tight font-display">Simple & Secure by Design</h2>
              <p className="mt-4 max-w-2xl mx-auto text-lg text-white/70 font-body">
                Three steps to transparent, trustless crowdfunding on Polkadot
              </p>
            </div>
            
            <div className="relative stagger-children">
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
                {/* Step 1 */}
                <div className="step-item flex flex-col items-center group opacity-0 translate-y-8 transition-all duration-700 ease-out"
                     style={{transitionProperty: 'opacity, transform'}}>
                  <div className="relative mb-8">
                    {/* Glow effect */}
                    <div className="absolute inset-0 bg-primary/30 rounded-3xl blur-2xl group-hover:blur-3xl transition-all"></div>
                    
                    {/* Step circle */}
                    <div className="relative flex-shrink-0 size-24 flex items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary/80 text-white border-4 border-primary/30 shadow-lg shadow-primary/50 group-hover:scale-110 transition-transform duration-300">
                      <span className="text-3xl font-bold font-display">1</span>
                    </div>
                    
                    {/* Arrow connector - desktop only */}
                    <div className="hidden md:block absolute top-1/2 left-full -translate-y-1/2 w-20 h-0.5">
                      <svg className="w-full h-full" viewBox="0 0 80 2" fill="none">
                        <line x1="0" y1="1" x2="70" y2="1" stroke="url(#gradient1)" strokeWidth="2" strokeDasharray="4 4"/>
                        <polygon points="70,1 65,4 70,1 65,-2" fill="#3874ff" opacity="0.5"/>
                        <defs>
                          <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#3874ff" stopOpacity="0.3"/>
                            <stop offset="100%" stopColor="#3874ff" stopOpacity="0.8"/>
                          </linearGradient>
                        </defs>
                      </svg>
                    </div>
                  </div>
                  
                  {/* Illustration Card */}
                  <div className="relative w-full">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent rounded-2xl blur-xl"></div>
                    <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 group-hover:border-primary/30 transition-all">
                      {/* SVG Illustration - Campaign Creation */}
                      <svg viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-32 mb-4">
                        {/* Document/Form */}
                        <rect x="40" y="20" width="120" height="80" rx="8" fill="currentColor" className="text-primary/50" stroke="currentColor" strokeWidth="2"/>
                        <line x1="60" y1="40" x2="140" y2="40" stroke="currentColor" strokeWidth="3" className="text-primary/70"/>
                        <line x1="60" y1="55" x2="120" y2="55" stroke="currentColor" strokeWidth="2" className="text-white/30"/>
                        <line x1="60" y1="65" x2="110" y2="65" stroke="currentColor" strokeWidth="2" className="text-white/30"/>
                        <line x1="60" y1="75" x2="130" y2="75" stroke="currentColor" strokeWidth="2" className="text-white/30"/>
                        
                        {/* Checkmark */}
                        <circle cx="135" cy="80" r="15" fill="currentColor" className="text-green-400/30"/>
                        <path d="M128 80 L132 84 L142 74" stroke="currentColor" strokeWidth="2.5" fill="none" className="text-green-400" strokeLinecap="round"/>
                        
                        {/* Floating coins */}
                        <circle cx="30" cy="30" r="8" fill="currentColor" className="text-secondary/40 animate-float-slow"/>
                        <text x="30" y="33" textAnchor="middle" className="text-xs font-bold" fill="white">$</text>
                      </svg>
                      
                      <h3 className="text-xl font-bold font-display mb-2">Creator Launches Campaign</h3>
                      <p className="text-white/60 font-body text-sm leading-relaxed">
                        A creator defines their goal, deadline, and beneficiary. The rules are locked into the smart contract.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="step-item flex flex-col items-center group opacity-0 translate-y-8 transition-all duration-700 ease-out"
                     style={{transitionProperty: 'opacity, transform'}}>
                  <div className="relative mb-8">
                    {/* Glow effect */}
                    <div className="absolute inset-0 bg-secondary/30 rounded-3xl blur-2xl group-hover:blur-3xl transition-all"></div>
                    
                    {/* Step circle */}
                    <div className="relative flex-shrink-0 size-24 flex items-center justify-center rounded-full bg-gradient-to-br from-secondary to-secondary/80 text-white border-4 border-secondary/30 shadow-lg shadow-secondary/50 group-hover:scale-110 transition-transform duration-300">
                      <span className="text-3xl font-bold font-display">2</span>
                    </div>
                    
                    {/* Arrow connector - desktop only */}
                    <div className="hidden md:block absolute top-1/2 left-full -translate-y-1/2 w-20 h-0.5">
                      <svg className="w-full h-full" viewBox="0 0 80 2" fill="none">
                        <line x1="0" y1="1" x2="70" y2="1" stroke="url(#gradient2)" strokeWidth="2" strokeDasharray="4 4"/>
                        <polygon points="70,1 65,4 70,1 65,-2" fill="#00EAD3" opacity="0.5"/>
                        <defs>
                          <linearGradient id="gradient2" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#00EAD3" stopOpacity="0.3"/>
                            <stop offset="100%" stopColor="#00EAD3" stopOpacity="0.8"/>
                          </linearGradient>
                        </defs>
                      </svg>
                    </div>
                  </div>
                  
                  {/* Illustration Card */}
                  <div className="relative w-full">
                    <div className="absolute inset-0 bg-gradient-to-br from-secondary/10 to-transparent rounded-2xl blur-xl"></div>
                    <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 group-hover:border-secondary/30 transition-all">
                      {/* SVG Illustration - Donations */}
                      <svg viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-32 mb-4">
                        {/* Central Contract Box */}
                        <rect x="70" y="40" width="60" height="50" rx="8" fill="currentColor" className="text-secondary/50" stroke="currentColor" strokeWidth="2"/>
                        <rect x="80" y="50" width="40" height="8" rx="2" fill="currentColor" className="text-secondary/30"/>
                        <rect x="80" y="62" width="30" height="5" rx="2" fill="currentColor" className="text-white/20"/>
                        <rect x="80" y="71" width="35" height="5" rx="2" fill="currentColor" className="text-white/20"/>
                        
                        {/* Multiple users/donations flowing in */}
                        <circle cx="30" cy="35" r="12" fill="currentColor" className="text-secondary/40" stroke="currentColor" strokeWidth="2"/>
                        <circle cx="30" cy="30" r="5" fill="currentColor" className="text-secondary/50"/>
                        <path d="M45 50 L65 55" stroke="currentColor" strokeWidth="2" className="text-secondary/40" strokeDasharray="3 3" markerEnd="url(#arrowhead2)"/>
                        
                        <circle cx="170" cy="35" r="12" fill="currentColor" className="text-secondary/40" stroke="currentColor" strokeWidth="2"/>
                        <circle cx="170" cy="30" r="5" fill="currentColor" className="text-secondary/50"/>
                        <path d="M155 50 L135 55" stroke="currentColor" strokeWidth="2" className="text-secondary/40" strokeDasharray="3 3" markerEnd="url(#arrowhead2)"/>
                        
                        <circle cx="30" cy="90" r="12" fill="currentColor" className="text-secondary/40" stroke="currentColor" strokeWidth="2"/>
                        <circle cx="30" cy="85" r="5" fill="currentColor" className="text-secondary/50"/>
                        <path d="M45 83 L65 70" stroke="currentColor" strokeWidth="2" className="text-secondary/40" strokeDasharray="3 3" markerEnd="url(#arrowhead2)"/>
                        
                        {/* Coin symbols */}
                        <circle cx="50" cy="20" r="6" fill="currentColor" className="text-secondary animate-float-slow"/>
                        <text x="50" y="23" textAnchor="middle" className="text-xs font-bold" fill="white">$</text>
                        
                        <defs>
                          <marker id="arrowhead2" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                            <polygon points="0 0, 10 3, 0 6" fill="#00EAD3" opacity="0.4"/>
                          </marker>
                        </defs>
                      </svg>
                      
                      <h3 className="text-xl font-bold font-display mb-2">Community Donates Funds</h3>
                      <p className="text-white/60 font-body text-sm leading-relaxed">
                        Donors send funds directly to the contract. The contract acts as a neutral escrow, holding the funds securely.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="step-item flex flex-col items-center group opacity-0 translate-y-8 transition-all duration-700 ease-out"
                     style={{transitionProperty: 'opacity, transform'}}>
                  <div className="relative mb-8">
                    {/* Glow effect */}
                    <div className="absolute inset-0 bg-green-400/30 rounded-3xl blur-2xl group-hover:blur-3xl transition-all"></div>
                    
                    {/* Step circle */}
                    <div className="relative flex-shrink-0 size-24 flex items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-green-500 text-white border-4 border-green-400/30 shadow-lg shadow-green-400/50 group-hover:scale-110 transition-transform duration-300">
                      <span className="text-3xl font-bold font-display">3</span>
                    </div>
                  </div>
                  
                  {/* Illustration Card */}
                  <div className="relative w-full">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-400/10 to-transparent rounded-2xl blur-xl"></div>
                    <div className="relative bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 group-hover:border-green-400/30 transition-all">
                      {/* SVG Illustration - Funds Release */}
                      <svg viewBox="0 0 200 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-32 mb-4">
                        {/* Contract Box */}
                        <rect x="30" y="40" width="60" height="50" rx="8" fill="currentColor" className="text-green-400/50" stroke="currentColor" strokeWidth="2"/>
                        
                        {/* Success checkmark on contract */}
                        <circle cx="60" cy="65" r="15" fill="currentColor" className="text-green-400/30"/>
                        <path d="M52 65 L58 71 L68 61" stroke="currentColor" strokeWidth="2.5" fill="none" className="text-green-400" strokeLinecap="round"/>
                        
                        {/* Arrow to beneficiary */}
                        <path d="M95 65 L130 65" stroke="currentColor" strokeWidth="3" className="text-green-400/60" markerEnd="url(#arrowhead3)"/>
                        
                        {/* Beneficiary wallet */}
                        <rect x="135" y="45" width="50" height="40" rx="8" fill="currentColor" className="text-green-400/50" stroke="currentColor" strokeWidth="2"/>
                        <circle cx="160" cy="65" r="10" fill="currentColor" className="text-green-400/40"/>
                        <path d="M160 60 L160 70 M155 65 L165 65" stroke="white" strokeWidth="2"/>
                        
                        {/* Celebration stars */}
                        <path d="M110 30 L112 35 L117 35 L113 38 L115 43 L110 40 L105 43 L107 38 L103 35 L108 35 Z" fill="currentColor" className="text-yellow-400/60 animate-pulse"/>
                        <path d="M150 25 L151 28 L154 28 L152 30 L153 33 L150 31 L147 33 L148 30 L146 28 L149 28 Z" fill="currentColor" className="text-yellow-400/40 animate-pulse" style={{animationDelay: '0.3s'}}/>
                        
                        {/* Money stack */}
                        <g className="animate-float-slow">
                          <circle cx="160" cy="100" r="8" fill="currentColor" className="text-green-400/50"/>
                          <text x="160" y="103" textAnchor="middle" className="text-xs font-bold" fill="white">$</text>
                        </g>
                        
                        <defs>
                          <marker id="arrowhead3" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                            <polygon points="0 0, 10 3, 0 6" fill="#4ade80"/>
                          </marker>
                        </defs>
                      </svg>
                      
                      <h3 className="text-xl font-bold font-display mb-2">Funds are Released</h3>
                      <p className="text-white/60 font-body text-sm leading-relaxed">
                        If the goal is met, the creator can withdraw. If not, donors can claim a refund. The rules are enforced automatically.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Projects Section */}
          <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(56,116,255,0.05)_0%,transparent_50%)] parallax-slow"></div>
            <div className="text-center mb-16 relative fade-in-up">
              <h2 className="text-4xl lg:text-5xl font-bold tracking-tight font-display">Powering the Polkadot Ecosystem</h2>
              <p className="mt-4 max-w-2xl mx-auto text-lg text-white/70 font-body">
                Join leading projects building on Polkadot and raising funds through DotNation
              </p>
              <div id="project-filters" className="flex justify-center gap-2 mt-8">
                <button
                  className={`filter-btn ${activeFilter === 'all' ? 'active bg-primary text-white shadow-lg shadow-primary/30' : 'bg-white/5 text-white/70 hover:bg-white/10'} font-semibold py-2.5 px-5 rounded-full transition-all duration-300 border border-white/10`}
                  onClick={() => handleFilterClick('all')}
                >
                  All
                </button>
                <button
                  className={`filter-btn ${activeFilter === 'defi' ? 'active bg-primary text-white shadow-lg shadow-primary/30' : 'bg-white/5 text-white/70 hover:bg-white/10'} font-semibold py-2.5 px-5 rounded-full transition-all duration-300 border border-white/10`}
                  onClick={() => handleFilterClick('defi')}
                >
                  DeFi
                </button>
                <button
                  className={`filter-btn ${activeFilter === 'infra' ? 'active bg-primary text-white shadow-lg shadow-primary/30' : 'bg-white/5 text-white/70 hover:bg-white/10'} font-semibold py-2.5 px-5 rounded-full transition-all duration-300 border border-white/10`}
                  onClick={() => handleFilterClick('infra')}
                >
                  Infrastructure
                </button>
                <button
                  className={`filter-btn ${activeFilter === 'community' ? 'active bg-primary text-white shadow-lg shadow-primary/30' : 'bg-white/5 text-white/70 hover:bg-white/10'} font-semibold py-2.5 px-5 rounded-full transition-all duration-300 border border-white/10`}
                  onClick={() => handleFilterClick('community')}
                >
                  Community
                </button>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 relative stagger-children">
              <div className={`project-card group relative transition-all duration-300 ${activeFilter === 'all' || activeFilter === 'defi' ? 'opacity-100 scale-100' : 'opacity-30 scale-95'}`} data-category="defi">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-transparent rounded-2xl blur-xl group-hover:blur-2xl transition-all opacity-0 group-hover:opacity-100"></div>
                <div className="relative bg-gradient-to-br from-primary/20 via-primary/5 to-transparent backdrop-blur-sm border border-primary/30 rounded-2xl overflow-hidden group-hover:border-primary/40 transition-all p-8 flex flex-col items-center justify-center h-full">
                  <div className="relative mb-4">
                    <div className="absolute inset-0 bg-primary/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <svg className="relative h-16 w-auto text-primary/70 group-hover:text-primary transition-colors" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M64 128C99.3462 128 128 99.3462 128 64C128 28.6538 99.3462 0 64 0C28.6538 0 0 28.6538 0 64C0 99.3462 28.6538 128 64 128Z" fill="currentColor"/>
                      <path d="M64.0001 114.24C45.2427 114.24 29.4118 98.4091 29.4118 79.6517C29.4118 60.8943 45.2427 45.0634 64.0001 45.0634C82.7575 45.0634 98.5883 60.8943 98.5883 79.6517C98.5883 98.4091 82.7575 114.24 64.0001 114.24ZM32.4049 22.8105L45.0833 35.4889C38.9912 40.4281 34.4069 46.9088 32.1883 54.349C22.6942 53.6449 13.76 64 13.76 64L18.4236 49.9167L13.76 35.4889L32.4049 22.8105Z" fill="rgba(10, 11, 26, 0.8)"/>
                    </svg>
                  </div>
                  <div className="text-center">
                    <h3 className="text-lg font-bold text-white font-display mb-1">Acala</h3>
                    <p className="text-white/50 text-xs font-medium mb-2">DeFi Hub</p>
                    <div className="flex items-center justify-center gap-1 mt-3 text-xs text-primary font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                      <span>View Campaign</span>
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
              <div className={`project-card group relative transition-all duration-300 ${activeFilter === 'all' || activeFilter === 'infra' ? 'opacity-100 scale-100' : 'opacity-30 scale-95'}`} data-category="infra">
                <div className="absolute inset-0 bg-gradient-to-br from-secondary/20 to-transparent rounded-2xl blur-xl group-hover:blur-2xl transition-all opacity-0 group-hover:opacity-100"></div>
                <div className="relative bg-gradient-to-br from-secondary/20 via-secondary/5 to-transparent backdrop-blur-sm border border-secondary/30 rounded-2xl overflow-hidden group-hover:border-secondary/40 transition-all p-8 flex flex-col items-center justify-center h-full">
                  <div className="relative mb-4">
                    <div className="absolute inset-0 bg-secondary/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <svg className="relative h-16 w-auto text-secondary/70 group-hover:text-secondary transition-colors" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M512 256C512 397.385 397.385 512 256 512C114.615 512 0 397.385 0 256C0 114.615 114.615 0 256 0C397.385 0 512 114.615 512 256Z" fill="currentColor"/>
                      <path d="M256 439.467C198.533 439.467 151.467 392.4 151.467 334.933C151.467 277.467 198.533 230.4 256 230.4C313.467 230.4 360.533 277.467 360.533 334.933C360.533 392.4 313.467 439.467 256 439.467ZM116 118.8C136.667 122.533 150.267 141.867 153.2 161.2C158.267 154.8 164.8 150.267 172.067 146.533C154.8 102.267 121.2 72.5333 116 72.5333C110.8 72.5333 102.267 101.533 116 118.8Z" fill="rgba(10, 11, 26, 0.8)"/>
                    </svg>
                  </div>
                  <div className="text-center">
                    <h3 className="text-lg font-bold text-white font-display mb-1">Moonbeam</h3>
                    <p className="text-white/50 text-xs font-medium mb-2">Smart Contracts</p>
                    <div className="flex items-center justify-center gap-1 mt-3 text-xs text-secondary font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                      <span>View Campaign</span>
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
              <div className={`project-card group relative transition-all duration-300 ${activeFilter === 'all' || activeFilter === 'community' ? 'opacity-100 scale-100' : 'opacity-30 scale-95'}`} data-category="community">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-400/20 to-transparent rounded-2xl blur-xl group-hover:blur-2xl transition-all opacity-0 group-hover:opacity-100"></div>
                <div className="relative bg-gradient-to-br from-purple-400/20 via-purple-400/5 to-transparent backdrop-blur-sm border border-purple-400/30 rounded-2xl overflow-hidden group-hover:border-purple-400/40 transition-all p-8 flex flex-col items-center justify-center h-full">
                  <div className="relative mb-4">
                    <div className="absolute inset-0 bg-purple-400/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <svg className="relative h-16 w-auto text-purple-400/70 group-hover:text-purple-400 transition-colors" viewBox="0 0 1024 1024" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M226.68 769.76L93.32 501.84L226.68 233.92L360.04 501.84L226.68 769.76ZM257.48 718.4L324.2 501.84L257.48 285.28L190.76 501.84L257.48 718.4Z" fill="currentColor"/>
                      <path d="M411.32 935.92L277.96 668L411.32 400.08L544.68 668L411.32 935.92ZM442.12 884.56L508.84 668L442.12 451.44L375.4 668L442.12 884.56Z" fill="currentColor"/>
                      <path d="M796.68 935.92L663.32 668L796.68 400.08L930.04 668L796.68 935.92ZM827.48 884.56L894.2 668L827.48 451.44L760.76 668L827.48 884.56Z" fill="currentColor"/>
                      <path d="M605.32 501.84L471.96 233.92L605.32 -34L738.68 233.92L605.32 501.84ZM636.12 450.48L702.84 233.92L636.12 17.36L569.4 233.92L636.12 450.48Z" fill="currentColor"/>
                      <path d="M663.32 233.92L530 -34L396.68 233.92L530 501.84L663.32 233.92Z" fill="currentColor"/>
                    </svg>
                  </div>
                  <div className="text-center">
                    <h3 className="text-lg font-bold text-white font-display mb-1">Astar</h3>
                    <p className="text-white/50 text-xs font-medium mb-2">Community Events</p>
                    <div className="flex items-center justify-center gap-1 mt-3 text-xs text-purple-400 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                      <span>View Campaign</span>
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
              <div className={`project-card group relative transition-all duration-300 ${activeFilter === 'all' || activeFilter === 'infra' ? 'opacity-100 scale-100' : 'opacity-30 scale-95'}`} data-category="infra">
                <div className="absolute inset-0 bg-gradient-to-br from-green-400/20 to-transparent rounded-2xl blur-xl group-hover:blur-2xl transition-all opacity-0 group-hover:opacity-100"></div>
                <div className="relative bg-gradient-to-br from-green-400/20 via-green-400/5 to-transparent backdrop-blur-sm border border-green-400/30 rounded-2xl overflow-hidden group-hover:border-green-400/40 transition-all p-8 flex flex-col items-center justify-center h-full">
                  <div className="relative mb-4">
                    <div className="absolute inset-0 bg-green-400/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <svg className="relative h-16 w-auto text-green-400/70 group-hover:text-green-400 transition-colors" viewBox="0 0 100 100" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                      <path d="M50,0A50,50,0,1,0,50,100A50,50,0,0,0,50,0Zm0,94A44,44,0,1,1,94,50,44,44,0,0,1,50,94Z"/>
                      <path d="M50,22A28,28,0,1,0,78,50,28,28,0,0,0,50,22Zm0,50A22,22,0,1,1,72,50,22,22,0,0,1,50,72Z"/>
                      <path d="M50,38A12,12,0,1,0,62,50,12,12,0,0,0,50,38Z"/>
                    </svg>
                  </div>
                  <div className="text-center">
                    <h3 className="text-lg font-bold text-white font-display mb-1">Phala Network</h3>
                    <p className="text-white/50 text-xs font-medium mb-2">Public Goods</p>
                    <div className="flex items-center justify-center gap-1 mt-3 text-xs text-green-400 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                      <span>View Campaign</span>
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
              <div className={`project-card group relative transition-all duration-300 ${activeFilter === 'all' || activeFilter === 'defi' ? 'opacity-100 scale-100' : 'opacity-30 scale-95'}`} data-category="defi">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-transparent rounded-2xl blur-xl group-hover:blur-2xl transition-all opacity-0 group-hover:opacity-100"></div>
                <div className="relative bg-gradient-to-br from-blue-400/20 via-blue-400/5 to-transparent backdrop-blur-sm border border-blue-400/30 rounded-2xl overflow-hidden group-hover:border-blue-400/40 transition-all p-8 flex flex-col items-center justify-center h-full">
                  <div className="relative mb-4">
                    <div className="absolute inset-0 bg-blue-400/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <svg className="relative h-16 w-auto text-blue-400/70 group-hover:text-blue-400 transition-colors" viewBox="0 0 256 256" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                      <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm48-96.52v.52h-32v-40a8,8,0,0,0-16,0v40H96v-24a8,8,0,0,0-16,0v24H80a8,8,0,0,0,0,16H80v32H96v24a8,8,0,0,0,16,0v-24h32v40a8,8,0,0,0,16,0v-40h16a8,8,0,0,0,0-16Zm-32,32H96v-32h48Z"/>
                    </svg>
                  </div>
                  <div className="text-center">
                    <h3 className="text-lg font-bold text-white font-display mb-1">Parallel Finance</h3>
                    <p className="text-white/50 text-xs font-medium mb-2">Liquid Staking</p>
                    <div className="flex items-center justify-center gap-1 mt-3 text-xs text-blue-400 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                      <span>View Campaign</span>
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
              <div className={`project-card group relative transition-all duration-300 ${activeFilter === 'all' || activeFilter === 'community' ? 'opacity-100 scale-100' : 'opacity-30 scale-95'}`} data-category="community">
                <div className="absolute inset-0 bg-gradient-to-br from-pink-400/20 to-transparent rounded-2xl blur-xl group-hover:blur-2xl transition-all opacity-0 group-hover:opacity-100"></div>
                <div className="relative bg-gradient-to-br from-pink-400/20 via-pink-400/5 to-transparent backdrop-blur-sm border border-pink-400/30 rounded-2xl overflow-hidden group-hover:border-pink-400/40 transition-all p-8 flex flex-col items-center justify-center h-full">
                  <div className="relative mb-4">
                    <div className="absolute inset-0 bg-pink-400/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <svg className="relative h-16 w-auto text-pink-400/70 group-hover:text-pink-400 transition-colors" fill="currentColor" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
                      <path d="M512 0C229.2 0 0 229.2 0 512s229.2 512 512 512 512-229.2 512-512S794.8 0 512 0zm259.4 685.3H611.2V513.7h160.2v-109H611.2V262.3l-193.3 92.5v50.2h193.3v109H417.9v-50.2L257.4 371.3v314h403.2c44.2 0 80.1-35.9 80.1-80.1V605c0-44.2-35.8-19.7-80-19.7z"/>
                    </svg>
                  </div>
                  <div className="text-center">
                    <h3 className="text-lg font-bold text-white font-display mb-1">Subsocial</h3>
                    <p className="text-white/50 text-xs font-medium mb-2">Social Platforms</p>
                    <div className="flex items-center justify-center gap-1 mt-3 text-xs text-pink-400 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                      <span>View Campaign</span>
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Built for Polkadot Section */}
          <section id="built-for-polkadot" className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_60%_40%,rgba(56,116,255,0.08)_0%,transparent_50%)] parallax-slow"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center relative">
              <div className="text-center md:text-left order-2 md:order-1 fade-in-left">
                <h2 className="text-4xl lg:text-5xl font-bold tracking-tight font-display">Natively Integrated with Polkadot</h2>
                <p className="mt-6 max-w-2xl text-lg text-white/70 font-body leading-relaxed">
                  DotNation isn&apos;t just built on Polkadot; it&apos;s designed to leverage its unique strengths. We utilize shared security, interoperability, and on-chain governance to create a fundraising platform that is more secure, scalable, and future-proof.
                </p>
                <div className="mt-8 grid grid-cols-2 gap-4 stagger-children">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                      <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white font-display mb-1">Shared Security</h3>
                      <p className="text-xs text-white/60 font-body">Enterprise-grade security inherited from Polkadot</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-secondary/20 flex items-center justify-center">
                      <svg className="w-5 h-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white font-display mb-1">High Performance</h3>
                      <p className="text-xs text-white/60 font-body">Fast transactions with low fees</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-green-400/20 flex items-center justify-center">
                      <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white font-display mb-1">Interoperable</h3>
                      <p className="text-xs text-white/60 font-body">Cross-chain compatibility built-in</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-purple-400/20 flex items-center justify-center">
                      <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white font-display mb-1">Governed</h3>
                      <p className="text-xs text-white/60 font-body">Community-driven decision making</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-center items-center order-1 md:order-2 scale-in">
                <div className="relative w-full max-w-lg" style={{overflow: 'visible'}}>
                  {/* Animated Polkadot Ecosystem Illustration */}
                  <svg viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto" style={{overflow: 'visible'}}>
                    <defs>
                      <linearGradient id="gradDot1" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#3874ff" stopOpacity="0.8"/>
                        <stop offset="100%" stopColor="#00EAD3" stopOpacity="0.8"/>
                      </linearGradient>
                      <linearGradient id="gradDot2" x1="100%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#00EAD3" stopOpacity="0.8"/>
                        <stop offset="100%" stopColor="#3874ff" stopOpacity="0.8"/>
                      </linearGradient>
                      <filter id="glow">
                        <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                        <feMerge>
                          <feMergeNode in="coloredBlur"/>
                          <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                      </filter>
                    </defs>
                    
                    {/* Background circles */}
                    <circle cx="200" cy="200" r="180" fill="url(#gradDot1)" opacity="0.05" className="animate-pulse-slow"/>
                    <circle cx="200" cy="200" r="140" fill="url(#gradDot2)" opacity="0.08" className="animate-pulse-slow" style={{animationDelay: '0.5s'}}/>
                    
                    {/* Central Relay Chain (Polkadot Logo) */}
                    <g className="animate-pulse-slow" filter="url(#glow)">
                      {/* Official Polkadot Logo */}
                      <circle cx="200" cy="200" r="35" fill="#E6007A"/>
                      <ellipse cx="200" cy="185" rx="6" ry="8" fill="white"/>
                      <ellipse cx="215" cy="195" rx="6" ry="8" fill="white" transform="rotate(60 200 200)"/>
                      <ellipse cx="215" cy="205" rx="6" ry="8" fill="white" transform="rotate(120 200 200)"/>
                      <ellipse cx="200" cy="215" rx="6" ry="8" fill="white" transform="rotate(180 200 200)"/>
                      <ellipse cx="185" cy="205" rx="6" ry="8" fill="white" transform="rotate(240 200 200)"/>
                      <ellipse cx="185" cy="195" rx="6" ry="8" fill="white" transform="rotate(300 200 200)"/>
                    </g>
                    
                    {/* Parachains - positioned around the center */}
                    {/* Parachain 1 - Top */}
                    <g className="animate-float-slow">
                      <line x1="200" y1="165" x2="200" y2="100" stroke="currentColor" strokeWidth="2" className="text-primary/30" strokeDasharray="4 4"/>
                      <circle cx="200" cy="85" r="20" fill="currentColor" className="text-secondary" opacity="0.8"/>
                      <circle cx="200" cy="85" r="12" fill="currentColor" className="text-white" opacity="0.3"/>
                      <text x="200" y="90" textAnchor="middle" className="text-xs font-bold" fill="white">P1</text>
                    </g>
                    
                    {/* Parachain 2 - Top Right */}
                    <g className="animate-float-slower">
                      <line x1="225" y1="177" x2="270" y2="130" stroke="currentColor" strokeWidth="2" className="text-primary/30" strokeDasharray="4 4"/>
                      <circle cx="285" cy="115" r="20" fill="currentColor" className="text-green-400" opacity="0.8"/>
                      <circle cx="285" cy="115" r="12" fill="currentColor" className="text-white" opacity="0.3"/>
                      <text x="285" y="120" textAnchor="middle" className="text-xs font-bold" fill="white">P2</text>
                    </g>
                    
                    {/* Parachain 3 - Right */}
                    <g className="animate-float-slow" style={{animationDelay: '0.3s'}}>
                      <line x1="235" y1="200" x2="300" y2="200" stroke="currentColor" strokeWidth="2" className="text-primary/30" strokeDasharray="4 4"/>
                      <circle cx="315" cy="200" r="20" fill="currentColor" className="text-purple-400" opacity="0.8"/>
                      <circle cx="315" cy="200" r="12" fill="currentColor" className="text-white" opacity="0.3"/>
                      <text x="315" y="205" textAnchor="middle" className="text-xs font-bold" fill="white">P3</text>
                    </g>
                    
                    {/* Parachain 4 - Bottom Right */}
                    <g className="animate-float-slower" style={{animationDelay: '0.2s'}}>
                      <line x1="225" y1="223" x2="270" y2="270" stroke="currentColor" strokeWidth="2" className="text-primary/30" strokeDasharray="4 4"/>
                      <circle cx="285" cy="285" r="20" fill="currentColor" className="text-yellow-400" opacity="0.8"/>
                      <circle cx="285" cy="285" r="12" fill="currentColor" className="text-white" opacity="0.3"/>
                      <text x="285" y="290" textAnchor="middle" className="text-xs font-bold" fill="white">P4</text>
                    </g>
                    
                    {/* Parachain 5 - Bottom */}
                    <g className="animate-float-slow" style={{animationDelay: '0.4s'}}>
                      <line x1="200" y1="235" x2="200" y2="300" stroke="currentColor" strokeWidth="2" className="text-primary/30" strokeDasharray="4 4"/>
                      <circle cx="200" cy="315" r="20" fill="currentColor" className="text-pink-400" opacity="0.8"/>
                      <circle cx="200" cy="315" r="12" fill="currentColor" className="text-white" opacity="0.3"/>
                      <text x="200" y="320" textAnchor="middle" className="text-xs font-bold" fill="white">P5</text>
                    </g>
                    
                    {/* Parachain 6 - Bottom Left */}
                    <g className="animate-float-slower" style={{animationDelay: '0.5s'}}>
                      <line x1="175" y1="223" x2="130" y2="270" stroke="currentColor" strokeWidth="2" className="text-primary/30" strokeDasharray="4 4"/>
                      <circle cx="115" cy="285" r="20" fill="currentColor" className="text-blue-400" opacity="0.8"/>
                      <circle cx="115" cy="285" r="12" fill="currentColor" className="text-white" opacity="0.3"/>
                      <text x="115" y="290" textAnchor="middle" className="text-xs font-bold" fill="white">P6</text>
                    </g>
                    
                    {/* Parachain 7 - Left */}
                    <g className="animate-float-slow" style={{animationDelay: '0.1s'}}>
                      <line x1="165" y1="200" x2="100" y2="200" stroke="currentColor" strokeWidth="2" className="text-primary/30" strokeDasharray="4 4"/>
                      <circle cx="85" cy="200" r="20" fill="currentColor" className="text-red-400" opacity="0.8"/>
                      <circle cx="85" cy="200" r="12" fill="currentColor" className="text-white" opacity="0.3"/>
                      <text x="85" y="205" textAnchor="middle" className="text-xs font-bold" fill="white">P7</text>
                    </g>
                    
                    {/* Parachain 8 - Top Left */}
                    <g className="animate-float-slower" style={{animationDelay: '0.6s'}}>
                      <line x1="175" y1="177" x2="130" y2="130" stroke="currentColor" strokeWidth="2" className="text-primary/30" strokeDasharray="4 4"/>
                      <circle cx="115" cy="115" r="20" fill="currentColor" className="text-orange-400" opacity="0.8"/>
                      <circle cx="115" cy="115" r="12" fill="currentColor" className="text-white" opacity="0.3"/>
                      <text x="115" y="120" textAnchor="middle" className="text-xs font-bold" fill="white">P8</text>
                    </g>
                    
                    {/* Data flow particles */}
                    <circle cx="200" cy="130" r="3" fill="currentColor" className="text-primary animate-pulse" opacity="0.8">
                      <animateMotion dur="3s" repeatCount="indefinite">
                        <mpath href="#path1"/>
                      </animateMotion>
                    </circle>
                    <path id="path1" d="M 200 130 Q 240 160 200 200" fill="none"/>
                    
                    {/* Labels */}
                    <text x="200" y="370" textAnchor="middle" className="text-xs font-semibold fill-white/60">
                      Relay Chain + Parachains
                    </text>
                  </svg>
                  
                  {/* Decorative grid dots */}
                  <div className="absolute -bottom-8 -left-8 w-24 h-24 grid grid-cols-6 gap-2 opacity-30">
                    {[...Array(36)].map((_, i) => (
                      <div key={i} className="w-1 h-1 rounded-full bg-primary"></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-24 sm:py-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative">
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-primary/20 via-primary/10 to-secondary/20 backdrop-blur-lg border border-primary/30 px-8 py-20 scale-in">
              {/* Animated background effects */}
              <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -inset-2 bg-[radial-gradient(circle_at_50%_50%,rgba(56,116,255,0.2)_0%,transparent_70%)] opacity-50 animate-pulse-slow"></div>
                
                {/* Floating geometric shapes */}
                <div className="absolute top-10 left-10 w-32 h-32 opacity-10">
                  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="animate-float-slow">
                    <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="2" className="text-primary"/>
                    <circle cx="50" cy="50" r="25" fill="currentColor" className="text-primary" opacity="0.3"/>
                  </svg>
                </div>
                
                <div className="absolute top-20 right-20 w-24 h-24 opacity-10">
                  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="animate-float-slower">
                    <path d="M50 10L90 90L10 90Z" stroke="currentColor" strokeWidth="2" className="text-secondary" fill="currentColor" opacity="0.2"/>
                  </svg>
                </div>
                
                <div className="absolute bottom-10 right-10 w-28 h-28 opacity-10">
                  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="animate-float-slow" style={{animationDelay: '0.5s'}}>
                    <rect x="25" y="25" width="50" height="50" stroke="currentColor" strokeWidth="2" className="text-primary" fill="currentColor" opacity="0.2" rx="8"/>
                  </svg>
                </div>
                
                <div className="absolute bottom-20 left-20 w-20 h-20 opacity-10">
                  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="animate-float-slower" style={{animationDelay: '0.3s'}}>
                    <path d="M50 20L70 80L30 80Z" fill="currentColor" className="text-secondary" opacity="0.3"/>
                  </svg>
                </div>
                
                {/* Grid pattern */}
                <div className="absolute inset-0 opacity-5">
                  <div className="w-full h-full" style={{backgroundImage: 'linear-gradient(rgba(56, 116, 255, 0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(56, 116, 255, 0.5) 1px, transparent 1px)', backgroundSize: '50px 50px'}}></div>
                </div>
                
                {/* Glowing orbs */}
                <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse-slow"></div>
                <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-secondary/10 rounded-full blur-3xl animate-pulse-slow" style={{animationDelay: '1s'}}></div>
              </div>
              
              <div className="text-center relative z-10">
                {/* Icon */}
                <div className="flex justify-center mb-6">
                  <div className="relative">
                    <div className="absolute inset-0 bg-primary/30 rounded-full blur-xl"></div>
                    <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/50">
                      <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                  </div>
                </div>
                
                <h2 className="text-4xl md:text-5xl font-bold tracking-tight font-display mb-4">Ready to build the future?</h2>
                <p className="mt-4 max-w-xl mx-auto text-lg text-white/80 font-body leading-relaxed">
                  Launch your campaign on a platform built for trust, or find and fund the next great idea in the Polkadot ecosystem.
                </p>
                
                <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link
                    to="/create-campaign"
                    className="group flex items-center justify-center rounded-full h-14 px-8 bg-gradient-to-r from-primary to-secondary text-white text-base font-bold tracking-wide hover:shadow-2xl hover:shadow-primary/40 transition-all transform hover:scale-105 duration-300"
                  >
                    <span>Launch Your Campaign</span>
                    <svg className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                  
                  <Link
                    to="/dashboard"
                    className="flex items-center justify-center rounded-full h-14 px-8 border-2 border-white/20 text-white text-base font-bold tracking-wide hover:bg-white/10 hover:border-white/30 transition-all transform hover:scale-105 duration-300 backdrop-blur-sm"
                  >
                    Explore Campaigns
                  </Link>
                </div>
                
                {/* Stats bar */}
                <div className="mt-12 pt-8 border-t border-white/10 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
                  <div>
                    <div className="text-2xl font-bold text-primary font-display">$2.4M+</div>
                    <div className="text-xs text-white/60 font-medium mt-1">Total Raised</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-secondary font-display">1,200+</div>
                    <div className="text-xs text-white/60 font-medium mt-1">Campaigns</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-400 font-display">15K+</div>
                    <div className="text-xs text-white/60 font-medium mt-1">Backers</div>
                  </div>
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
              
              <div className="flex items-center gap-6">
                <Link to="/about" className="text-white/60 hover:text-white transition-colors text-sm">
                  About
                </Link>
                <Link to="/privacy" className="text-white/60 hover:text-white transition-colors text-sm">
                  Privacy Policy
                </Link>
                <Link to="/contact" className="text-white/60 hover:text-white transition-colors text-sm">
                  Contact
                </Link>
              </div>

              <div className="flex gap-4">
                <a className="text-white/60 hover:text-white transition-colors" href="https://twitter.com" target="_blank" rel="noopener noreferrer">
                  <svg fill="currentColor" height="24" viewBox="0 0 256 256" width="24">
                    <path d="M247.39,68.94A8,8,0,0,0,240,64H209.57A48.66,48.66,0,0,0,168.1,40a46.91,46.91,0,0,0-33.75,13.7A47.9,47.9,0,0,0,120,88v6.09C79.74,83.47,46.81,50.72,46.46,50.37a8,8,0,0,0-13.65,4.92c-4.31,47.79,9.57,79.77,22,98.18a110.93,110.93,0,0,0,21.88,24.2c-15.23,17.53-39.21,26.74-39.47,26.84a8,8,0,0,0-3.85,11.93c.75,1.12,3.75,5.05,11.08,8.72C53.51,229.7,65.48,232,80,232c70.67,0,129.72-54.42,135.75-124.44l29.91-29.9A8,8,0,0,0,247.39,68.94Zm-45,29.41a8,8,0,0,0-2.32,5.14C196,166.58,143.28,216,80,216c-10.56,0-18-1.4-23.22-3.08,11.51-6.25,27.56-17,37.88-32.48A8,8,0,0,0,92,169.08c-.47-.27-43.91-26.34-44-96,16,13,45.25,33.17,78.67,38.79A8,8,0,0,0,136,104V88a32,32,0,0,1,9.6-22.92A30.94,30.94,0,0,1,167.9,56c12.66.16,24.49,7.88,29.44,19.21A8,8,0,0,0,204.67,80h16Z"/>
                  </svg>
                </a>
                <a className="text-white/60 hover:text-white transition-colors" href="https://github.com/Elactrac/dotnation" target="_blank" rel="noopener noreferrer">
                  <svg fill="currentColor" height="24" viewBox="0 0 256 256" width="24">
                    <path d="M208.3,76.71a8,8,0,0,0-10.23,4.64A128.7,128.7,0,0,1,160,105.15V104a8,8,0,0,0-8-8H104a8,8,0,0,0-8,8v1.15a128.7,128.7,0,0,1,-38.07-23.8A8,8,0,0,0,56.3,86.25a133.24,133.24,0,0,0-15.84,33.56A8,8,0,0,0,48,128v64a8,8,0,0,0,8,8H76.2a8,8,0,0,0,7.88-6.52C87.31,180.23,98.39,176,104,176h48c5.61,0,16.69,4.23,19.92,13.48A8,8,0,0,0,179.8,200H200a8,8,0,0,0,8-8V128a8,8,0,0,0,7.52-7.81A133.24,133.24,0,0,0,200.07,86.25A8,8,0,0,0,208.3,76.71ZM176,136a16,16,0,1,1-16-16A16,16,0,0,1,176,136ZM96,120a16,16,0,1,1,16,16A16,16,0,0,1,96,120Z"/>
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