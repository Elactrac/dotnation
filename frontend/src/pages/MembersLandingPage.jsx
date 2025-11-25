import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiMenu, FiX, FiUsers, FiAnchor, FiLayers, FiShield } from 'react-icons/fi';
import '../styles/light-theme.css';

// Mock data for creators
const mockCreators = [
    { name: 'Sarah Chen', category: 'Content Creator', supporters: 1243, image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&q=80' },
    { name: 'Marcus Johnson', category: 'Artist', supporters: 892, image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&q=80' },
    { name: 'Emily Rodriguez', category: 'Musician', supporters: 2156, image: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400&h=400&fit=crop&q=80' },
    { name: 'Alex Kim', category: 'Developer', supporters: 567, image: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=400&fit=crop&q=80' }
];

const MembersLandingPage = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <div className="min-h-screen bg-[var(--bg-color)] text-[var(--primary-text)] font-sans selection:bg-white/20 selection:text-white overflow-x-hidden">
            {/* Ambient Background Glow */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-900/20 rounded-full blur-[120px] opacity-40"></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-900/20 rounded-full blur-[120px] opacity-40"></div>
            </div>

            {/* Navigation */}
            <nav className="sticky top-0 w-full z-50 border-b border-[var(--glass-border)] bg-[var(--bg-color)]/80 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 bg-white text-black rounded-lg flex items-center justify-center font-serif text-xl font-bold group-hover:scale-105 transition-transform shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                            P
                        </div>
                        <span className="font-serif text-2xl tracking-tight text-white">Paperweight</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-8">
                        <Link to="/" className="text-sm font-medium text-[var(--secondary-text)] hover:text-white transition-colors">Campaigns</Link>
                        <Link to="/members" className="text-sm font-medium text-white border-b border-white pb-0.5">Members</Link>
                        <Link to="/about" className="text-sm font-medium text-[var(--secondary-text)] hover:text-white transition-colors">About</Link>
                    </div>

                    {/* Desktop CTA */}
                    <div className="hidden md:flex items-center gap-4">
                        <Link to="/login" className="text-sm font-medium text-[var(--secondary-text)] hover:text-white transition-colors">
                            Log in
                        </Link>
                        <Link to="/members/browse" className="px-6 py-2.5 bg-white text-black text-sm font-semibold rounded-lg hover:bg-gray-200 transition-all hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                            Get Started
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden p-2 text-[var(--secondary-text)] hover:text-white transition-colors"
                    >
                        {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
                    </button>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden bg-[var(--bg-color)] border-t border-[var(--glass-border)]">
                        <div className="px-4 py-4 space-y-3">
                            <Link to="/" className="block text-base font-medium text-[var(--secondary-text)] hover:text-white py-2">Campaigns</Link>
                            <Link to="/members" className="block text-base font-medium text-white py-2">Members</Link>
                            <Link to="/about" className="block text-base font-medium text-[var(--secondary-text)] hover:text-white py-2">About</Link>
                            <Link to="/login" className="block text-base font-medium text-[var(--secondary-text)] hover:text-white py-2">Log in</Link>
                            <Link to="/members/browse" className="block w-full text-center px-6 py-3 bg-white text-black text-base font-semibold rounded-lg hover:bg-gray-200 transition-all">
                                Get Started
                            </Link>
                        </div>
                    </div>
                )}
            </nav>

            {/* Hero Section */}
            <section className="relative w-full py-20 lg:py-32 overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center max-w-4xl mx-auto mb-16">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel mb-8 animate-fade-in-up">
                            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                            <span className="text-sm font-medium text-[var(--secondary-text)] tracking-wide uppercase">The New Standard</span>
                        </div>

                        <h1 className="font-serif text-5xl sm:text-7xl lg:text-8xl leading-[0.9] tracking-tight text-white mb-8 text-balance drop-shadow-2xl">
                            Anchor your <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40">value.</span>
                        </h1>

                        <p className="text-lg sm:text-xl text-[var(--secondary-text)] max-w-2xl mx-auto leading-relaxed mb-10 text-balance font-light">
                            Substance in a digital world. Build a community that lasts with the premium membership platform for serious creators.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link to="/members/browse" className="w-full sm:w-auto px-8 py-4 bg-white text-black text-lg font-semibold rounded-lg hover:bg-gray-100 transition-all hover:scale-105 shadow-[0_0_40px_rgba(255,255,255,0.2)]">
                                Start Creating
                            </Link>
                            <Link to="/about" className="w-full sm:w-auto px-8 py-4 glass-panel text-white text-lg font-medium rounded-lg hover:bg-white/10 transition-all">
                                Learn More
                            </Link>
                        </div>
                    </div>

                    {/* Glass Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mt-20">
                        {/* Card 1 */}
                        <div className="glass-panel rounded-2xl p-8 hover:-translate-y-2 transition-transform duration-500 group">
                            <div className="w-14 h-14 bg-white/5 rounded-xl flex items-center justify-center mb-6 group-hover:bg-white/10 transition-colors border border-white/10">
                                <FiAnchor className="w-7 h-7 text-white" />
                            </div>
                            <h3 className="font-serif text-2xl text-white mb-3">Permanent</h3>
                            <p className="text-[var(--secondary-text)] leading-relaxed">
                                Your content and community aren&apos;t fleeting. We provide the infrastructure to make them last forever on the blockchain.
                            </p>
                        </div>

                        {/* Card 2 */}
                        <div className="glass-panel rounded-2xl p-8 hover:-translate-y-2 transition-transform duration-500 group">
                            <div className="w-14 h-14 bg-white/5 rounded-xl flex items-center justify-center mb-6 group-hover:bg-white/10 transition-colors border border-white/10">
                                <FiLayers className="w-7 h-7 text-white" />
                            </div>
                            <h3 className="font-serif text-2xl text-white mb-3">Transparent</h3>
                            <p className="text-[var(--secondary-text)] leading-relaxed">
                                Clear glass, clear value. See exactly where every dollar goes with our fully transparent revenue model.
                            </p>
                        </div>

                        {/* Card 3 */}
                        <div className="glass-panel rounded-2xl p-8 hover:-translate-y-2 transition-transform duration-500 group">
                            <div className="w-14 h-14 bg-white/5 rounded-xl flex items-center justify-center mb-6 group-hover:bg-white/10 transition-colors border border-white/10">
                                <FiShield className="w-7 h-7 text-white" />
                            </div>
                            <h3 className="font-serif text-2xl text-white mb-3">Protected</h3>
                            <p className="text-[var(--secondary-text)] leading-relaxed">
                                A heavy weight against censorship. Your platform, your rules. No one can take it away from you.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Quote Section */}
            <section className="w-full py-24 relative">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="glass-panel p-12 rounded-3xl relative">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-black border border-[var(--glass-border)] rounded-full flex items-center justify-center shadow-2xl">
                            <span className="font-serif text-4xl text-white">&quot;</span>
                        </div>
                        <blockquote className="font-serif text-3xl sm:text-4xl leading-relaxed text-white mb-8 pt-6">
                            Paperweight gave my work the gravity it deserved. It&apos;s not just a platform; it&apos;s a statement.
                        </blockquote>
                        <div className="flex flex-col items-center gap-2">
                            <cite className="not-italic font-semibold text-white tracking-wide uppercase text-sm">Sarah Jenkins</cite>
                            <span className="text-[var(--secondary-text)] text-sm">Digital Artist & Curator</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Creators */}
            <section className="w-full py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-end justify-between mb-12">
                        <div>
                            <h2 className="font-serif text-4xl sm:text-5xl text-white mb-4">Curated Creators</h2>
                            <p className="text-[var(--secondary-text)] text-lg">Join the few who are building the future.</p>
                        </div>
                        <Link to="/members/browse" className="hidden sm:inline-block text-white border-b border-white/30 pb-1 hover:border-white transition-colors">
                            View Directory →
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {mockCreators.map((creator, index) => (
                            <div key={index} className="group relative aspect-[3/4] overflow-hidden rounded-xl bg-gray-900">
                                <img
                                    src={creator.image}
                                    alt={creator.name}
                                    className="w-full h-full object-cover object-center opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700 grayscale group-hover:grayscale-0"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent">
                                    <div className="absolute bottom-0 left-0 w-full p-6 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                                        <h3 className="font-serif text-2xl text-white mb-1">{creator.name}</h3>
                                        <p className="text-white/70 text-sm mb-3">{creator.category}</p>
                                        <div className="flex items-center gap-2 text-xs font-medium text-white/50 uppercase tracking-wider">
                                            <FiUsers className="w-3 h-3" />
                                            <span>{creator.supporters.toLocaleString()} Supporters</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="w-full py-32 relative overflow-hidden">
                <div className="absolute inset-0 bg-white/5"></div>
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                    <h2 className="font-serif text-5xl sm:text-6xl lg:text-7xl text-white mb-8">
                        Ready to anchor?
                    </h2>
                    <p className="text-xl text-[var(--secondary-text)] mb-12 max-w-2xl mx-auto font-light">
                        Join Paperweight today. No noise. No algorithms. Just you and your value.
                    </p>
                    <Link to="/members/browse" className="inline-block px-12 py-5 bg-white text-black text-lg font-semibold rounded-lg hover:bg-gray-100 transition-all hover:scale-105 shadow-[0_0_50px_rgba(255,255,255,0.2)]">
                        Begin Your Journey
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-[var(--glass-border)] bg-[var(--bg-color)]">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-white text-black rounded flex items-center justify-center font-serif font-bold">P</div>
                        <span className="font-serif text-xl text-white">Paperweight</span>
                    </div>
                    <div className="text-sm text-[var(--secondary-text)]">
                        © 2025 Paperweight. All rights reserved.
                    </div>
                    <div className="flex gap-8">
                        <a href="#" className="text-[var(--secondary-text)] hover:text-white transition-colors text-sm">Twitter</a>
                        <a href="#" className="text-[var(--secondary-text)] hover:text-white transition-colors text-sm">Discord</a>
                        <a href="#" className="text-[var(--secondary-text)] hover:text-white transition-colors text-sm">Manifesto</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default MembersLandingPage;
