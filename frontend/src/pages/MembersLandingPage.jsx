import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { FiMenu, FiX, FiAnchor, FiLayers, FiShield, FiArrowRight } from 'react-icons/fi';
import '../styles/light-theme.css';

const MembersLandingPage = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <div className="min-h-screen bg-[var(--bg-color)] text-[var(--primary-text)] font-sans selection:bg-white/20 selection:text-white overflow-x-hidden">
            {/* Ambient Background Glow (Lighter/Hybrid feel) */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-purple-900/10 rounded-full blur-[120px] opacity-30"></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-blue-900/10 rounded-full blur-[120px] opacity-30"></div>
                <div className="absolute top-[40%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[40%] h-[40%] bg-white/5 rounded-full blur-[100px] opacity-20"></div>
            </div>

            {/* Navigation (Matches NewDashboardLayout) */}
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
                        <NavLink to="/dashboard" className={({ isActive }) => isActive ? "text-white font-bold border-b border-white pb-0.5" : "text-[var(--secondary-text)] hover:text-white transition-colors"}>Dashboard</NavLink>
                        <NavLink to="/campaigns" className={({ isActive }) => isActive ? "text-white font-bold border-b border-white pb-0.5" : "text-[var(--secondary-text)] hover:text-white transition-colors"}>Campaigns</NavLink>
                        <NavLink to="/members" className={({ isActive }) => isActive ? "text-white font-bold border-b border-white pb-0.5" : "text-[var(--secondary-text)] hover:text-white transition-colors"}>Members</NavLink>
                        <NavLink to="/about" className={({ isActive }) => isActive ? "text-white font-bold border-b border-white pb-0.5" : "text-[var(--secondary-text)] hover:text-white transition-colors"}>About</NavLink>
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
                            <Link to="/dashboard" className="block text-base font-medium text-[var(--secondary-text)] hover:text-white py-2">Dashboard</Link>
                            <Link to="/campaigns" className="block text-base font-medium text-[var(--secondary-text)] hover:text-white py-2">Campaigns</Link>
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

            {/* Hero Section (Collage Layout) */}
            <section className="relative w-full py-20 lg:py-28 overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                        {/* Left Content */}
                        <div className="text-left animate-fade-in-up">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel mb-8">
                                <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                                <span className="text-sm font-medium text-white tracking-wide uppercase">For Serious Creators</span>
                            </div>

                            <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl leading-[1.1] tracking-tight text-white mb-8 text-balance drop-shadow-2xl">
                                Build your <br />
                                <span className="italic text-white/90">legacy.</span>
                            </h1>

                            <p className="text-lg sm:text-xl text-[var(--secondary-text)] max-w-xl leading-relaxed mb-10 text-balance font-light">
                                Paperweight is the home for creators who value permanence. Anchor your community on the blockchain and own your future.
                            </p>

                            <div className="flex flex-col sm:flex-row items-center gap-4">
                                <Link to="/members/browse" className="w-full sm:w-auto px-8 py-4 bg-white text-black text-lg font-semibold rounded-lg hover:bg-gray-100 transition-all hover:scale-105 shadow-[0_0_30px_rgba(255,255,255,0.2)] flex items-center justify-center gap-2">
                                    Start Creating <FiArrowRight />
                                </Link>
                                <Link to="/about" className="w-full sm:w-auto px-8 py-4 glass-panel text-white text-lg font-medium rounded-lg hover:bg-white/10 transition-all flex items-center justify-center">
                                    Learn More
                                </Link>
                            </div>
                        </div>

                        {/* Right Collage (Glass Paperweight Style) */}
                        <div className="relative h-[600px] w-full hidden lg:block">
                            {/* Floating Glass Cards */}
                            <div className="absolute top-0 right-0 w-72 h-96 glass-panel rounded-2xl overflow-hidden transform rotate-3 hover:rotate-0 transition-all duration-700 hover:scale-105 z-20 shadow-2xl">
                                <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&h=800&fit=crop&q=80" alt="Creator" className="w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity" />
                                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                                    <p className="text-white font-serif text-xl">Sarah Chen</p>
                                    <p className="text-white/70 text-sm">Visual Artist</p>
                                </div>
                            </div>

                            <div className="absolute bottom-10 left-10 w-64 h-80 glass-panel rounded-2xl overflow-hidden transform -rotate-6 hover:rotate-0 transition-all duration-700 hover:scale-105 z-10 shadow-2xl">
                                <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=800&fit=crop&q=80" alt="Creator" className="w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity" />
                                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                                    <p className="text-white font-serif text-xl">Marcus J.</p>
                                    <p className="text-white/70 text-sm">Musician</p>
                                </div>
                            </div>

                            {/* Decorative Elements */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-purple-500/10 to-blue-500/10 rounded-full blur-3xl -z-10 animate-pulse-slow"></div>
                        </div>
                    </div>

                    {/* Glass Cards Grid (Value Props) */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mt-32">
                        {/* Card 1 */}
                        <div className="glass-panel rounded-2xl p-8 hover:-translate-y-2 transition-transform duration-500 group">
                            <div className="w-14 h-14 bg-white/5 rounded-xl flex items-center justify-center mb-6 group-hover:bg-white/10 transition-colors border border-white/10">
                                <FiAnchor className="w-7 h-7 text-white" />
                            </div>
                            <h3 className="font-serif text-2xl text-white mb-3">Permanent</h3>
                            <p className="text-[var(--secondary-text)] leading-relaxed">
                                Your content and community aren&apos;t fleeting. We provide the infrastructure to make them last forever.
                            </p>
                        </div>

                        {/* Card 2 */}
                        <div className="glass-panel rounded-2xl p-8 hover:-translate-y-2 transition-transform duration-500 group">
                            <div className="w-14 h-14 bg-white/5 rounded-xl flex items-center justify-center mb-6 group-hover:bg-white/10 transition-colors border border-white/10">
                                <FiLayers className="w-7 h-7 text-white" />
                            </div>
                            <h3 className="font-serif text-2xl text-white mb-3">Transparent</h3>
                            <p className="text-[var(--secondary-text)] leading-relaxed">
                                Clear glass, clear value. See exactly where every dollar goes with our fully transparent model.
                            </p>
                        </div>

                        {/* Card 3 */}
                        <div className="glass-panel rounded-2xl p-8 hover:-translate-y-2 transition-transform duration-500 group">
                            <div className="w-14 h-14 bg-white/5 rounded-xl flex items-center justify-center mb-6 group-hover:bg-white/10 transition-colors border border-white/10">
                                <FiShield className="w-7 h-7 text-white" />
                            </div>
                            <h3 className="font-serif text-2xl text-white mb-3">Protected</h3>
                            <p className="text-[var(--secondary-text)] leading-relaxed">
                                A heavy weight against censorship. Your platform, your rules. No one can take it away.
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
            <footer className="border-t border-[var(--glass-border)] bg-[var(--bg-color)] py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-white text-black rounded-md flex items-center justify-center font-serif font-bold">P</div>
                        <span className="text-white font-serif text-xl">Paperweight</span>
                    </div>
                    <div className="flex gap-8 text-sm text-[var(--secondary-text)]">
                        <Link to="/about" className="hover:text-white transition-colors">About</Link>
                        <Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link>
                        <Link to="/terms" className="hover:text-white transition-colors">Terms</Link>
                        <Link to="/contact" className="hover:text-white transition-colors">Contact</Link>
                    </div>
                    <div className="text-[var(--secondary-text)] text-sm">
                        &copy; 2024 Paperweight. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default MembersLandingPage;
