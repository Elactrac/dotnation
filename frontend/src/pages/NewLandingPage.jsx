import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiTrendingUp, FiShield, FiGlobe, FiCpu, FiLayers, FiChevronDown } from 'react-icons/fi';
import Footer from '../components/Footer';
import NavBar from '../components/NavBar';
import Button from '../components/Button';

const NewLandingPage = () => {
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

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
    <div className="min-h-screen bg-background-dark text-text-primary font-sans selection:bg-primary/20 selection:text-white overflow-x-hidden">
      {/* Ambient Background Glow (Dark Mode) */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-900/20 rounded-full blur-[120px] opacity-20"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-900/20 rounded-full blur-[120px] opacity-20"></div>
        <div className="absolute top-[20%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[30%] h-[30%] bg-white/5 rounded-full blur-[100px] opacity-10"></div>
      </div>

      {/* Header */}
      <NavBar variant="landing" />

      {/* Hero Section (Compact Collage - Above the Fold) */}
      <section className="relative w-full py-16 lg:py-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left Content */}
            <div className="text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-surface/50 backdrop-blur-md mb-7">
                <span className="w-1.5 h-1.5 bg-secondary rounded-full animate-pulse"></span>
                <span className="text-xs font-medium text-text-secondary tracking-wide uppercase">Polkadot Crowdfunding</span>
              </div>

              <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl leading-[1.1] tracking-tight text-text-primary mb-7 text-balance">
                Fund the <br />
                <span className="italic text-text-secondary">extraordinary.</span>
              </h1>

              <p className="text-lg sm:text-xl text-text-secondary max-w-lg leading-relaxed mb-10 text-balance font-light">
                The decentralized platform for visionary projects. Launch your campaign, rally your community, and build on-chain.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-4">
                <Button 
                  to="/create-campaign" 
                  variant="primary-light" 
                  icon={<FiArrowRight />}
                >
                  Start a Campaign
                </Button>
                <Button 
                  to="/browse" 
                  variant="secondary-dark"
                >
                  Explore Projects
                </Button>
              </div>
            </div>

            {/* Right Collage (Compact & Dark) */}
            <div className="relative h-[550px] w-full hidden lg:block">
              {/* Card 1: Tech/Hardware */}
              <div className="absolute top-0 right-10 w-72 h-96 bg-surface border border-border rounded-xl overflow-hidden transform rotate-6 hover:rotate-0 transition-all duration-700 hover:scale-105 z-20 shadow-2xl group">
                <img src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600&h=800&fit=crop&q=80" alt="NextGen Hardware Wallet - Tech crowdfunding campaign" className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity" />
                <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-background-dark/50 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-xs font-bold text-secondary uppercase tracking-wider">Tech</span>
                    <span className="text-xs text-text-secondary">85% Funded</span>
                  </div>
                  <p className="text-text-primary font-serif text-lg leading-tight">NextGen Hardware Wallet</p>
                </div>
              </div>

              {/* Card 2: Art/Community */}
              <div className="absolute bottom-10 left-10 w-64 h-80 bg-surface border border-border rounded-xl overflow-hidden transform -rotate-3 hover:rotate-0 transition-all duration-700 hover:scale-105 z-10 shadow-2xl group">
                <img src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&h=800&fit=crop&q=80" alt="Digital Renaissance - Art crowdfunding campaign" className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity" />
                <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-background-dark/50 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-xs font-bold text-primary uppercase tracking-wider">Art</span>
                    <span className="text-xs text-text-secondary">120% Funded</span>
                  </div>
                  <p className="text-text-primary font-serif text-lg leading-tight">Digital Renaissance</p>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100%] h-[100%] bg-gradient-to-tr from-secondary/10 to-primary/10 rounded-full blur-3xl -z-10 animate-pulse-slow"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Signals (Glass Cards) */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-surface/50 border border-border backdrop-blur-sm hover:bg-surface transition-colors group">
            <FiShield className="w-8 h-8 text-primary mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-serif text-text-primary mb-2">Trustless Escrow</h3>
            <p className="text-text-secondary text-sm leading-relaxed">Funds are locked in smart contracts. No intermediaries, just code.</p>
          </div>
          <div className="p-6 rounded-2xl bg-surface/50 border border-border backdrop-blur-sm hover:bg-surface transition-colors group">
            <FiGlobe className="w-8 h-8 text-secondary mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-serif text-text-primary mb-2">Global Access</h3>
            <p className="text-text-secondary text-sm leading-relaxed">Anyone with a wallet can fund or create. No borders, no gatekeepers.</p>
          </div>
          <div className="p-6 rounded-2xl bg-surface/50 border border-border backdrop-blur-sm hover:bg-surface transition-colors group">
            <FiTrendingUp className="w-8 h-8 text-success mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-xl font-serif text-text-primary mb-2">Transparent Growth</h3>
            <p className="text-text-secondary text-sm leading-relaxed">Track every transaction on-chain. Real-time visibility for everyone.</p>
          </div>
        </div>
      </section>

      {/* Featured Campaigns Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-border">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl md:text-4xl font-serif text-text-primary mb-2">Trending Projects</h2>
            <p className="text-text-secondary">Support the most innovative ideas on Polkadot.</p>
          </div>
          <Link to="/browse" className="hidden sm:flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors">
            View All <FiArrowRight />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredCampaigns.map((campaign, index) => (
            <div key={index} className="group rounded-2xl bg-surface border border-border overflow-hidden hover:border-primary/30 transition-all hover:-translate-y-1">
              <div className="relative h-48 overflow-hidden">
                <img src={campaign.image} alt={`${campaign.title} - ${campaign.category} campaign by ${campaign.author}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute top-4 left-4 px-3 py-1 bg-background-dark/60 backdrop-blur-md rounded-full text-xs font-medium text-text-primary border border-border">
                  {campaign.category}
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-serif text-text-primary mb-2">{campaign.title}</h3>
                <p className="text-text-muted text-sm mb-4">by {campaign.author}</p>

                <div className="w-full bg-surface rounded-full h-1.5 mb-4">
                  <div className="bg-primary h-1.5 rounded-full" style={{ width: `${campaign.progress}%` }}></div>
                </div>

                <div className="flex justify-between items-center text-sm mb-6">
                  <span className="text-text-primary font-medium">{campaign.raised}</span>
                  <span className="text-text-muted">of {campaign.goal}</span>
                </div>

                <button className="w-full py-2.5 bg-primary/10 hover:bg-primary text-primary hover:text-white rounded-lg transition-all font-medium text-sm">
                  Fund Project
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center sm:hidden">
          <Link to="/browse" className="inline-flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors">
            View All Projects <FiArrowRight />
          </Link>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-border bg-surface/30">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-serif text-text-primary mb-4">Launch in 3 Steps</h2>
          <p className="text-text-secondary max-w-2xl mx-auto">From idea to funded reality in minutes.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
          {/* Connecting Line (Desktop) */}
          <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-transparent via-border to-transparent"></div>

          {/* Step 1 */}
          <div className="relative flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-2xl bg-surface border border-border flex items-center justify-center mb-6 relative z-10 shadow-xl">
              <span className="text-3xl">👛</span>
              <div className="absolute -top-3 -right-3 w-8 h-8 bg-white text-black rounded-full flex items-center justify-center font-bold text-sm border-4 border-background-dark">1</div>
            </div>
            <h3 className="text-xl font-serif text-text-primary mb-3">Connect Wallet</h3>
            <p className="text-text-secondary text-sm leading-relaxed max-w-xs">
              Link your Polkadot wallet. No sign-ups, no passwords. You own your identity.
            </p>
          </div>

          {/* Step 2 */}
          <div className="relative flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-2xl bg-surface border border-border flex items-center justify-center mb-6 relative z-10 shadow-xl">
              <span className="text-3xl">🎯</span>
              <div className="absolute -top-3 -right-3 w-8 h-8 bg-white text-black rounded-full flex items-center justify-center font-bold text-sm border-4 border-background-dark">2</div>
            </div>
            <h3 className="text-xl font-serif text-text-primary mb-3">Define Milestones</h3>
            <p className="text-text-secondary text-sm leading-relaxed max-w-xs">
              Set clear goals and funding tiers. Build trust by releasing funds as you deliver.
            </p>
          </div>

          {/* Step 3 */}
          <div className="relative flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-2xl bg-surface border border-border flex items-center justify-center mb-6 relative z-10 shadow-xl">
              <span className="text-3xl">🚀</span>
              <div className="absolute -top-3 -right-3 w-8 h-8 bg-white text-black rounded-full flex items-center justify-center font-bold text-sm border-4 border-background-dark">3</div>
            </div>
            <h3 className="text-xl font-serif text-text-primary mb-3">Rally Community</h3>
            <p className="text-text-secondary text-sm leading-relaxed max-w-xs">
              Share your campaign. Backers fund with crypto and receive NFT badges.
            </p>
          </div>
        </div>
      </section>

      {/* Advanced Features (Retained & Restyled) */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-border">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-serif text-text-primary mb-4">Built for the Future</h2>
          <p className="text-text-secondary max-w-2xl mx-auto">Leveraging Polkadot&apos;s advanced architecture for next-gen crowdfunding.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* XCM */}
          <div className="group relative p-8 rounded-2xl border border-border bg-surface overflow-hidden hover:border-secondary/30 transition-colors">
            <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-secondary/20 transition-colors"></div>
            <FiCpu className="w-10 h-10 text-secondary mb-6" />
            <h3 className="text-2xl font-serif text-text-primary mb-3">Cross-Chain (XCM)</h3>
            <p className="text-text-secondary leading-relaxed mb-4">
              Donate from any parachain. Moonbeam, Acala, Astar—assets arrive in seconds without bridges.
            </p>
            <div className="flex items-center gap-2 text-xs font-medium text-secondary uppercase tracking-wider">
              <span>Powered by Polkadot</span>
            </div>
          </div>

          {/* Quadratic Funding */}
          <div className="group relative p-8 rounded-2xl border border-border bg-surface overflow-hidden hover:border-success/30 transition-colors">
            <div className="absolute top-0 right-0 w-32 h-32 bg-success/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-success/20 transition-colors"></div>
            <FiLayers className="w-10 h-10 text-success mb-6" />
            <h3 className="text-2xl font-serif text-text-primary mb-3">Quadratic Funding</h3>
            <p className="text-text-secondary leading-relaxed mb-4">
              Democratic matching pools that favor broad community support over large individual donors.
            </p>
            <div className="flex items-center gap-2 text-xs font-medium text-success uppercase tracking-wider">
              <span>Fair Distribution</span>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto border-t border-border">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-serif text-text-primary mb-4">Frequently Asked Questions</h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="border border-border rounded-xl bg-surface overflow-hidden">
              <button
                onClick={() => toggleFaq(index)}
                className="w-full flex items-center justify-between p-6 text-left hover:bg-surface/80 transition-colors"
              >
                <span className="font-medium text-text-primary">{faq.question}</span>
                <FiChevronDown className={`w-5 h-5 text-text-muted transition-transform duration-300 ${openFaqIndex === index ? 'rotate-180' : ''}`} />
              </button>
              <div className={`overflow-hidden transition-all duration-300 ${openFaqIndex === index ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="p-6 pt-0 text-text-secondary text-sm leading-relaxed border-t border-border">
                  {faq.answer}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <Footer variant="minimal" />
    </div>
  );
};

export default NewLandingPage;