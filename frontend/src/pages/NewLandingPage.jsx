import { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useWallet } from '../contexts/WalletContext';
import { FiMenu, FiX, FiArrowRight, FiTrendingUp, FiShield, FiGlobe, FiCpu, FiLayers, FiChevronDown } from 'react-icons/fi';

const NewLandingPage = () => {
  const { accounts, selectedAccount, connectWallet, switchAccount, disconnectWallet } = useWallet();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isDropdownOpen && !event.target.closest('.relative')) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen]);

  const formatAddress = (address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const toggleFaq = (index) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const faqs = [
    {
      question: "How does DotNation ensure security?",
      answer: "We use smart contracts to lock funds in escrow. Funds are only released when campaign creators meet pre-defined milestones, verified by the community."
    },
    {
      question: "What cryptocurrencies are supported?",
      answer: "We support DOT, KSM, and major parachain tokens like GLMR, ACA, and ASTR via XCM (Cross-Consensus Messaging)."
    },
    {
      question: "Is there a fee to start a campaign?",
      answer: "Creating a campaign is free (excluding gas fees). We take a small percentage (2%) only from successful campaigns to support the protocol."
    },
    {
      question: "What is Quadratic Funding?",
      answer: "It's a matching mechanism where a pool of funds is distributed based on the number of contributors rather than the amount donated, favoring broad community support."
    }
  ];

  const featuredCampaigns = [
    {
      title: "PolkaDex Mobile",
      category: "DeFi",
      image: "https://images.unsplash.com/photo-1611974765270-ca12586343bb?w=600&h=400&fit=crop&q=80",
      raised: "12,450 DOT",
      goal: "15,000 DOT",
      progress: 83,
      author: "PolkaDex Team"
    },
    {
      title: "EcoChain Sensors",
      category: "Hardware",
      image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&h=400&fit=crop&q=80",
      raised: "45,200 DOT",
      goal: "50,000 DOT",
      progress: 90,
      author: "GreenTech Labs"
    },
    {
      title: "Web3 Edu Platform",
      category: "Education",
      image: "https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=600&h=400&fit=crop&q=80",
      raised: "5,100 DOT",
      goal: "10,000 DOT",
      progress: 51,
      author: "LearnDAO"
    }
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-white/20 selection:text-white overflow-x-hidden">
      {/* Ambient Background Glow (Dark Mode) */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-900/20 rounded-full blur-[120px] opacity-20"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-900/20 rounded-full blur-[120px] opacity-20"></div>
        <div className="absolute top-[20%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[30%] h-[30%] bg-white/5 rounded-full blur-[100px] opacity-10"></div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-[#050505]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-white text-black rounded-lg flex items-center justify-center font-serif text-xl font-bold group-hover:scale-105 transition-transform shadow-[0_0_20px_rgba(255,255,255,0.2)]">
              P
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-2xl tracking-tight text-white leading-none">Paperweight</span>
              <span className="text-[10px] uppercase tracking-widest text-white/50 font-medium">Crowd</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-white/70 hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="text-sm font-medium text-white/70 hover:text-white transition-colors">How it Works</a>
            <NavLink to="/dashboard" className="text-sm font-medium text-white/70 hover:text-white transition-colors">Explore</NavLink>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            <Link to="/create-campaign" className="text-sm font-medium text-white hover:text-white/80 transition-colors">
              Start a Campaign
            </Link>

            {selectedAccount ? (
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all"
                >
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">{formatAddress(selectedAccount.address)}</span>
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-[#0A0A0A] border border-white/10 rounded-xl shadow-2xl p-2 backdrop-blur-xl z-50">
                    <div className="px-3 py-2 border-b border-white/5 mb-2">
                      <p className="text-xs text-white/50 uppercase tracking-wider">Connected</p>
                      <p className="text-sm font-medium truncate">{selectedAccount.address}</p>
                    </div>
                    {accounts.length > 1 && (
                      <div className="mb-2">
                        <p className="px-3 py-1 text-xs text-white/50 uppercase tracking-wider">Switch Account</p>
                        {accounts.map((acc) => (
                          <button
                            key={acc.address}
                            onClick={() => { switchAccount(acc); setIsDropdownOpen(false); }}
                            className="w-full text-left px-3 py-2 text-sm text-white/70 hover:bg-white/5 rounded-lg transition-colors truncate"
                          >
                            {acc.meta.name || formatAddress(acc.address)}
                          </button>
                        ))}
                      </div>
                    )}
                    <button
                      onClick={disconnectWallet}
                      className="w-full text-left px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      Disconnect
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={connectWallet}
                className="px-6 py-2.5 bg-white text-black text-sm font-semibold rounded-lg hover:bg-gray-200 transition-all hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]"
              >
                Connect Wallet
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-white/70 hover:text-white transition-colors"
          >
            {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#050505] border-t border-white/10">
            <div className="px-4 py-4 space-y-3">
              <a href="#features" className="block text-base font-medium text-white/70 hover:text-white py-2">Features</a>
              <a href="#how-it-works" className="block text-base font-medium text-white/70 hover:text-white py-2">How it Works</a>
              <Link to="/dashboard" className="block text-base font-medium text-white/70 hover:text-white py-2">Explore</Link>
              <Link to="/create-campaign" className="block text-base font-medium text-white py-2">Start a Campaign</Link>
              {selectedAccount ? (
                <button onClick={disconnectWallet} className="block w-full text-left text-base font-medium text-red-400 py-2">Disconnect</button>
              ) : (
                <button onClick={connectWallet} className="block w-full text-center px-6 py-3 bg-white text-black text-base font-semibold rounded-lg hover:bg-gray-200 transition-all">
                  Connect Wallet
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Hero Section (Compact Collage - Above the Fold) */}
      <section className="relative w-full py-12 lg:py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            {/* Left Content */}
            <div className="text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md mb-6">
                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse"></span>
                <span className="text-xs font-medium text-white/80 tracking-wide uppercase">Polkadot Crowdfunding</span>
              </div>

              <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl leading-[1.1] tracking-tight text-white mb-6 text-balance">
                Fund the <br />
                <span className="italic text-white/90">extraordinary.</span>
              </h1>

              <p className="text-lg text-white/60 max-w-lg leading-relaxed mb-8 text-balance font-light">
                The decentralized platform for visionary projects. Launch your campaign, rally your community, and build on-chain.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-4">
                <Link to="/create-campaign" className="w-full sm:w-auto px-8 py-3.5 bg-white text-black text-base font-semibold rounded-lg hover:bg-gray-100 transition-all hover:scale-105 shadow-[0_0_30px_rgba(255,255,255,0.15)] flex items-center justify-center gap-2">
                  Start Funding <FiArrowRight />
                </Link>
                <Link to="/dashboard" className="w-full sm:w-auto px-8 py-3.5 border border-white/10 bg-white/5 text-white text-base font-medium rounded-lg hover:bg-white/10 transition-all flex items-center justify-center backdrop-blur-md">
                  Explore Projects
                </Link>
              </div>
            </div>

            {/* Right Collage (Compact & Dark) */}
            <div className="relative h-[500px] w-full hidden lg:block">
              {/* Card 1: Tech/Hardware */}
              <div className="absolute top-0 right-10 w-64 h-80 bg-[#111] border border-white/10 rounded-xl overflow-hidden transform rotate-6 hover:rotate-0 transition-all duration-700 hover:scale-105 z-20 shadow-2xl group">
                <img src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600&h=800&fit=crop&q=80" alt="Tech Campaign" className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Tech</span>
                    <span className="text-xs text-white/60">85% Funded</span>
                  </div>
                  <p className="text-white font-serif text-lg leading-tight">NextGen Hardware Wallet</p>
                </div>
              </div>

              {/* Card 2: Art/Community */}
              <div className="absolute bottom-10 left-10 w-60 h-72 bg-[#111] border border-white/10 rounded-xl overflow-hidden transform -rotate-3 hover:rotate-0 transition-all duration-700 hover:scale-105 z-10 shadow-2xl group">
                <img src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&h=800&fit=crop&q=80" alt="Art Campaign" className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Art</span>
                    <span className="text-xs text-white/60">120% Funded</span>
                  </div>
                  <p className="text-white font-serif text-lg leading-tight">Digital Renaissance</p>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100%] h-[100%] bg-gradient-to-tr from-blue-500/10 to-purple-500/10 rounded-full blur-3xl -z-10 animate-pulse-slow"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Signals (Glass Cards) */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm hover:bg-white/10 transition-colors group">
            <FiShield className="w-8 h-8 text-white mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-serif text-white mb-2">Trustless Escrow</h3>
            <p className="text-white/60 text-sm leading-relaxed">Funds are locked in smart contracts. No intermediaries, just code.</p>
          </div>
          <div className="p-6 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm hover:bg-white/10 transition-colors group">
            <FiGlobe className="w-8 h-8 text-white mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-serif text-white mb-2">Global Access</h3>
            <p className="text-white/60 text-sm leading-relaxed">Anyone with a wallet can fund or create. No borders, no gatekeepers.</p>
          </div>
          <div className="p-6 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-sm hover:bg-white/10 transition-colors group">
            <FiTrendingUp className="w-8 h-8 text-white mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-serif text-white mb-2">Transparent Growth</h3>
            <p className="text-white/60 text-sm leading-relaxed">Track every transaction on-chain. Real-time visibility for everyone.</p>
          </div>
        </div>
      </section>

      {/* Featured Campaigns Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/5">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-serif text-white mb-2">Trending Projects</h2>
            <p className="text-white/60">Support the most innovative ideas on Polkadot.</p>
          </div>
          <Link to="/dashboard" className="hidden sm:flex items-center gap-2 text-white/70 hover:text-white transition-colors">
            View All <FiArrowRight />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featuredCampaigns.map((campaign, index) => (
            <div key={index} className="group rounded-2xl bg-[#0A0A0A] border border-white/10 overflow-hidden hover:border-white/20 transition-all hover:-translate-y-1">
              <div className="relative h-48 overflow-hidden">
                <img src={campaign.image} alt={campaign.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute top-4 left-4 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-xs font-medium text-white border border-white/10">
                  {campaign.category}
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-serif text-white mb-2">{campaign.title}</h3>
                <p className="text-white/50 text-sm mb-4">by {campaign.author}</p>

                <div className="w-full bg-white/10 rounded-full h-1.5 mb-4">
                  <div className="bg-white h-1.5 rounded-full" style={{ width: `${campaign.progress}%` }}></div>
                </div>

                <div className="flex justify-between items-center text-sm mb-6">
                  <span className="text-white font-medium">{campaign.raised}</span>
                  <span className="text-white/40">of {campaign.goal}</span>
                </div>

                <button className="w-full py-2.5 bg-white/5 hover:bg-white text-white hover:text-black rounded-lg transition-all font-medium text-sm">
                  Fund Project
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center sm:hidden">
          <Link to="/dashboard" className="inline-flex items-center gap-2 text-white/70 hover:text-white transition-colors">
            View All Projects <FiArrowRight />
          </Link>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/5 bg-white/[0.02]">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-serif text-white mb-4">Launch in 3 Steps</h2>
          <p className="text-white/60 max-w-2xl mx-auto">From idea to funded reality in minutes.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
          {/* Connecting Line (Desktop) */}
          <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

          {/* Step 1 */}
          <div className="relative flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-2xl bg-[#0A0A0A] border border-white/10 flex items-center justify-center mb-6 relative z-10 shadow-xl">
              <span className="text-3xl">👛</span>
              <div className="absolute -top-3 -right-3 w-8 h-8 bg-white text-black rounded-full flex items-center justify-center font-bold text-sm border-4 border-[#050505]">1</div>
            </div>
            <h3 className="text-xl font-serif text-white mb-3">Connect Wallet</h3>
            <p className="text-white/60 text-sm leading-relaxed max-w-xs">
              Link your Polkadot wallet. No sign-ups, no passwords. You own your identity.
            </p>
          </div>

          {/* Step 2 */}
          <div className="relative flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-2xl bg-[#0A0A0A] border border-white/10 flex items-center justify-center mb-6 relative z-10 shadow-xl">
              <span className="text-3xl">🎯</span>
              <div className="absolute -top-3 -right-3 w-8 h-8 bg-white text-black rounded-full flex items-center justify-center font-bold text-sm border-4 border-[#050505]">2</div>
            </div>
            <h3 className="text-xl font-serif text-white mb-3">Define Milestones</h3>
            <p className="text-white/60 text-sm leading-relaxed max-w-xs">
              Set clear goals and funding tiers. Build trust by releasing funds as you deliver.
            </p>
          </div>

          {/* Step 3 */}
          <div className="relative flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-2xl bg-[#0A0A0A] border border-white/10 flex items-center justify-center mb-6 relative z-10 shadow-xl">
              <span className="text-3xl">🚀</span>
              <div className="absolute -top-3 -right-3 w-8 h-8 bg-white text-black rounded-full flex items-center justify-center font-bold text-sm border-4 border-[#050505]">3</div>
            </div>
            <h3 className="text-xl font-serif text-white mb-3">Rally Community</h3>
            <p className="text-white/60 text-sm leading-relaxed max-w-xs">
              Share your campaign. Backers fund with crypto and receive NFT badges.
            </p>
          </div>
        </div>
      </section>

      {/* Advanced Features (Retained & Restyled) */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-white/5">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-serif text-white mb-4">Built for the Future</h2>
          <p className="text-white/60 max-w-2xl mx-auto">Leveraging Polkadot&apos;s advanced architecture for next-gen crowdfunding.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* XCM */}
          <div className="group relative p-8 rounded-2xl border border-white/10 bg-[#0A0A0A] overflow-hidden hover:border-blue-500/30 transition-colors">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-blue-500/20 transition-colors"></div>
            <FiCpu className="w-10 h-10 text-blue-400 mb-6" />
            <h3 className="text-2xl font-serif text-white mb-3">Cross-Chain (XCM)</h3>
            <p className="text-white/60 leading-relaxed mb-4">
              Donate from any parachain. Moonbeam, Acala, Astar—assets arrive in seconds without bridges.
            </p>
            <div className="flex items-center gap-2 text-xs font-medium text-blue-400 uppercase tracking-wider">
              <span>Powered by Polkadot</span>
            </div>
          </div>

          {/* Quadratic Funding */}
          <div className="group relative p-8 rounded-2xl border border-white/10 bg-[#0A0A0A] overflow-hidden hover:border-green-500/30 transition-colors">
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-green-500/20 transition-colors"></div>
            <FiLayers className="w-10 h-10 text-green-400 mb-6" />
            <h3 className="text-2xl font-serif text-white mb-3">Quadratic Funding</h3>
            <p className="text-white/60 leading-relaxed mb-4">
              Democratic matching pools that favor broad community support over large individual donors.
            </p>
            <div className="flex items-center gap-2 text-xs font-medium text-green-400 uppercase tracking-wider">
              <span>Fair Distribution</span>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto border-t border-white/5">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-serif text-white mb-4">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="border border-white/10 rounded-xl bg-[#0A0A0A] overflow-hidden">
              <button
                onClick={() => toggleFaq(index)}
                className="w-full flex items-center justify-between p-6 text-left hover:bg-white/5 transition-colors"
              >
                <span className="font-medium text-white">{faq.question}</span>
                <FiChevronDown className={`w-5 h-5 text-white/50 transition-transform duration-300 ${openFaqIndex === index ? 'rotate-180' : ''}`} />
              </button>
              <div className={`overflow-hidden transition-all duration-300 ${openFaqIndex === index ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="p-6 pt-0 text-white/60 text-sm leading-relaxed border-t border-white/5">
                  {faq.answer}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-[#050505] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white text-black rounded flex items-center justify-center font-serif font-bold">P</div>
            <span className="font-serif text-xl text-white">Paperweight</span>
          </div>
          <div className="flex gap-8 text-sm text-white/50">
            <a href="#" className="hover:text-white transition-colors">Twitter</a>
            <a href="#" className="hover:text-white transition-colors">Discord</a>
            <a href="#" className="hover:text-white transition-colors">Docs</a>
          </div>
          <div className="text-white/30 text-sm">
            &copy; 2025 Paperweight. On-chain.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default NewLandingPage;