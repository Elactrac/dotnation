import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiInstagram, FiTwitter, FiFacebook, FiYoutube, FiMenu, FiX, FiTrendingUp, FiUsers, FiHeart, FiStar } from 'react-icons/fi';
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
        <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-yellow-100 selection:text-black">
            {/* Navigation */}
            <nav className="sticky top-0 w-full z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2 group">
                        <div className="w-9 h-9 bg-black text-white rounded-full flex items-center justify-center font-serif text-lg font-bold group-hover:scale-105 transition-transform">
                            D
                        </div>
                        <span className="font-serif text-xl tracking-tight">DotNation</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-8">
                        <Link to="/" className="text-sm font-medium text-gray-600 hover:text-black transition-colors">Campaigns</Link>
                        <Link to="/members" className="text-sm font-medium text-black border-b-2 border-black pb-1">Members</Link>
                        <Link to="/about" className="text-sm font-medium text-gray-600 hover:text-black transition-colors">About</Link>
                    </div>

                    {/* Desktop CTA */}
                    <div className="hidden md:flex items-center gap-3">
                        <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-black transition-colors">
                            Log in
                        </Link>
                        <Link to="/members/browse" className="px-6 py-2.5 bg-black text-white text-sm font-semibold rounded-full hover:bg-gray-800 transition-all hover:shadow-lg">
                            Get Started
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <button 
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden p-2 text-gray-700 hover:text-black transition-colors"
                    >
                        {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
                    </button>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden bg-white border-t border-gray-200 shadow-lg">
                        <div className="px-4 py-4 space-y-3">
                            <Link to="/" className="block text-base font-medium text-gray-600 hover:text-black py-2">Campaigns</Link>
                            <Link to="/members" className="block text-base font-medium text-black py-2">Members</Link>
                            <Link to="/about" className="block text-base font-medium text-gray-600 hover:text-black py-2">About</Link>
                            <Link to="/login" className="block text-base font-medium text-gray-600 hover:text-black py-2">Log in</Link>
                            <Link to="/members/browse" className="block w-full text-center px-6 py-3 bg-black text-white text-base font-semibold rounded-full hover:bg-gray-800 transition-all">
                                Get Started
                            </Link>
                        </div>
                    </div>
                )}
            </nav>

            {/* Hero Section - Above the fold */}
            <section className="w-full h-[calc(100vh-4rem)] max-h-[750px] min-h-[500px]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 items-center h-full py-4 lg:py-8">
                        {/* Left Column: Content */}
                        <div className="flex flex-col justify-center space-y-3 lg:space-y-4">
                            {/* Arc Graphic */}
                            <div className="w-10 h-5">
                                <svg width="40" height="20" viewBox="0 0 60 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M1 29C1 13.536 13.536 1 29 1H31C46.464 1 59 13.536 59 29" stroke="black" strokeWidth="2" strokeLinecap="round" />
                                    <path d="M10 29C10 18.5066 18.5066 10 29 10H31C41.4934 10 50 18.5066 50 29" stroke="black" strokeWidth="2" strokeLinecap="round" />
                                </svg>
                            </div>

                            {/* Headline */}
                            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl xl:text-7xl leading-tight tracking-tight text-gray-900">
                                Bringing your<br />
                                community<br />
                                together
                            </h1>

                            {/* Subheadline */}
                            <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-lg leading-relaxed">
                                Connect directly with your biggest fans. No algorithms, no ads, just you and your community building together on the blockchain.
                            </p>

                            {/* CTA Button */}
                            <div className="pt-1">
                                <Link to="/members/browse" className="inline-block px-8 py-3.5 bg-black text-white text-base sm:text-lg font-semibold rounded-full hover:bg-gray-800 transition-all hover:shadow-lg">
                                    Get started
                                </Link>
                            </div>

                            {/* Social Icons */}
                            <div className="flex gap-2.5 pt-2">
                                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-black hover:text-white transition-all">
                                    <FiInstagram className="w-4 h-4" />
                                </a>
                                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-black hover:text-white transition-all">
                                    <FiTwitter className="w-4 h-4" />
                                </a>
                                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-black hover:text-white transition-all">
                                    <FiFacebook className="w-4 h-4" />
                                </a>
                                <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-black hover:text-white transition-all">
                                    <FiYoutube className="w-4 h-4" />
                                </a>
                            </div>
                        </div>

                        {/* Right Column: Larger Grid - Fills hero section */}
                        <div className="hidden lg:grid grid-cols-2 gap-3 h-[480px] xl:h-[520px] w-full max-w-full overflow-hidden">
                            {/* Col 1 */}
                            <div className="flex flex-col gap-3 h-full min-h-0">
                                {/* Yellow Circle */}
                                <div className="flex-[1.5] min-h-0 bg-[#E8C547] rounded-xl flex items-center justify-center relative overflow-hidden group">
                                    <svg viewBox="0 0 100 100" className="w-20 h-20 xl:w-24 xl:h-24 animate-spin-slow">
                                        <path id="curve" d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0" fill="transparent" />
                                        <text width="500">
                                            <textPath xlinkHref="#curve" className="text-[10px] font-bold uppercase tracking-widest fill-white">
                                                Love is love • Love is love •
                                            </textPath>
                                        </text>
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <FiHeart className="w-7 h-7 xl:w-8 xl:h-8 text-white" fill="white" />
                                    </div>
                                </div>

                                {/* Portrait 1 - Larger */}
                                <div className="flex-[2] min-h-0 bg-gray-200 rounded-xl relative overflow-hidden group">
                                    <img 
                                        src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&h=500&fit=crop&q=80" 
                                        alt="Creative" 
                                        className="w-full h-full object-cover object-center grayscale group-hover:grayscale-0 transition-all duration-500" 
                                        loading="lazy"
                                        style={{ maxWidth: '100%', maxHeight: '100%' }}
                                    />
                                    <span className="absolute top-3 left-3 bg-white px-3 py-1.5 rounded-full text-xs font-semibold border border-gray-200 shadow-sm">
                                        Creative
                                    </span>
                                </div>

                                {/* Blue Star */}
                                <div className="flex-[1] min-h-0 bg-[#7CB9E8] rounded-xl flex items-center justify-center relative overflow-hidden">
                                    <FiStar className="w-12 h-12 xl:w-14 xl:h-14 text-white animate-spin-slower" fill="white" />
                                    <span className="absolute top-3 right-3 bg-white px-3 py-1.5 rounded-full text-xs font-semibold border border-gray-200 shadow-sm">
                                        Caring
                                    </span>
                                </div>
                            </div>

                            {/* Col 2 */}
                            <div className="flex flex-col gap-3 h-full pt-8 min-h-0">
                                {/* Portrait 2 - Larger */}
                                <div className="flex-[2] min-h-0 bg-gray-200 rounded-xl relative overflow-hidden group">
                                    <img 
                                        src="https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=500&h=500&fit=crop&q=80" 
                                        alt="Inclusive" 
                                        className="w-full h-full object-cover object-center grayscale group-hover:grayscale-0 transition-all duration-500" 
                                        loading="lazy"
                                        style={{ maxWidth: '100%', maxHeight: '100%' }}
                                    />
                                    <span className="absolute top-3 right-3 bg-white px-3 py-1.5 rounded-full text-xs font-semibold border border-gray-200 shadow-sm">
                                        Inclusive
                                    </span>
                                </div>

                                {/* Portrait 3 - Larger */}
                                <div className="flex-[1.5] min-h-0 bg-gray-200 rounded-xl relative overflow-hidden group">
                                    <img 
                                        src="https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=500&h=500&fit=crop&q=80" 
                                        alt="Diverse" 
                                        className="w-full h-full object-cover object-center grayscale group-hover:grayscale-0 transition-all duration-500" 
                                        loading="lazy"
                                        style={{ maxWidth: '100%', maxHeight: '100%' }}
                                    />
                                    <span className="absolute top-3 left-3 bg-white px-3 py-1.5 rounded-full text-xs font-semibold border border-gray-200 shadow-sm">
                                        Diverse
                                    </span>
                                </div>

                                {/* Orange Shape */}
                                <div className="flex-[1] min-h-0 bg-[#FF9500] rounded-xl flex items-center justify-center relative overflow-hidden">
                                    <FiTrendingUp className="w-12 h-12 xl:w-14 xl:h-14 text-white" strokeWidth={2.5} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Quote Section - Below the fold */}
            <section className="w-full bg-gray-50 py-12 lg:py-16 border-t border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="max-w-4xl mx-auto">
                        <div className="relative max-w-2xl mx-auto">
                            <div className="absolute top-2 left-2 w-full h-full bg-gray-900 rounded-sm hidden sm:block"></div>
                            <div className="relative bg-white border-2 border-gray-900 p-6 sm:p-8">
                                <p className="text-base sm:text-lg text-gray-700 italic leading-relaxed mb-4">
                                    "DotNation Members gave me the freedom to create without fear of de-platforming. My community is finally truly mine."
                                </p>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 bg-gray-900 rounded-full"></div>
                                    <span className="text-sm font-bold uppercase tracking-wider text-gray-900">Sarah J., Content Creator</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="w-full bg-gray-50 py-16 lg:py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                            Why Creators Choose DotNation
                        </h2>
                        <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
                            Build authentic connections with your community through blockchain-powered memberships
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
                        <div className="bg-white rounded-xl p-6 sm:p-8 shadow-sm hover:shadow-md transition-all border border-gray-200">
                            <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center mb-4">
                                <FiUsers className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="font-serif text-xl sm:text-2xl font-semibold text-gray-900 mb-3">
                                Direct Connection
                            </h3>
                            <p className="text-gray-600 leading-relaxed">
                                Connect with your community without intermediaries. Your relationship, your rules, built on transparent blockchain technology.
                            </p>
                        </div>

                        <div className="bg-white rounded-xl p-6 sm:p-8 shadow-sm hover:shadow-md transition-all border border-gray-200">
                            <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center mb-4">
                                <FiTrendingUp className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="font-serif text-xl sm:text-2xl font-semibold text-gray-900 mb-3">
                                Sustainable Income
                            </h3>
                            <p className="text-gray-600 leading-relaxed">
                                Build predictable revenue through memberships. Keep more of what you earn with low platform fees and instant settlements.
                            </p>
                        </div>

                        <div className="bg-white rounded-xl p-6 sm:p-8 shadow-sm hover:shadow-md transition-all border border-gray-200">
                            <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center mb-4">
                                <FiHeart className="w-6 h-6 text-white" />
                            </div>
                            <h3 className="font-serif text-xl sm:text-2xl font-semibold text-gray-900 mb-3">
                                Own Your Community
                            </h3>
                            <p className="text-gray-600 leading-relaxed">
                                No platform can take away what you've built. Your community data and relationships are truly yours forever.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Creators Section with Mock Data */}
            <section className="w-full py-16 lg:py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between mb-10">
                        <div>
                            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                                Featured Creators
                            </h2>
                            <p className="text-gray-600">Join thousands of creators building their communities</p>
                        </div>
                        <Link to="/members/browse" className="hidden sm:inline-block text-sm font-semibold text-black hover:underline">
                            View all →
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-full">
                        {mockCreators.map((creator, index) => (
                            <div key={index} className="bg-white rounded-xl overflow-hidden border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all group max-w-full">
                                <div className="aspect-square relative overflow-hidden bg-gray-200 w-full">
                                    <img 
                                        src={creator.image} 
                                        alt={creator.name}
                                        className="w-full h-full object-cover object-center grayscale group-hover:grayscale-0 transition-all duration-500"
                                        loading="lazy"
                                        style={{ maxWidth: '100%', maxHeight: '100%' }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                </div>
                                <div className="p-4">
                                    <h3 className="font-semibold text-gray-900 text-lg mb-1 truncate">{creator.name}</h3>
                                    <p className="text-sm text-gray-600 mb-3 truncate">{creator.category}</p>
                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                        <FiUsers className="w-4 h-4 flex-shrink-0" />
                                        <span className="truncate">{creator.supporters.toLocaleString()} supporters</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="text-center mt-10 sm:hidden">
                        <Link to="/members/browse" className="inline-block px-8 py-3 bg-black text-white text-base font-semibold rounded-full hover:bg-gray-800 transition-all">
                            View all creators
                        </Link>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="w-full bg-gray-900 text-white py-16 lg:py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-12 text-center">
                        <div>
                            <div className="font-serif text-4xl sm:text-5xl font-bold mb-2">10K+</div>
                            <div className="text-gray-400 text-sm sm:text-base">Active Creators</div>
                        </div>
                        <div>
                            <div className="font-serif text-4xl sm:text-5xl font-bold mb-2">$2M+</div>
                            <div className="text-gray-400 text-sm sm:text-base">Paid to Creators</div>
                        </div>
                        <div>
                            <div className="font-serif text-4xl sm:text-5xl font-bold mb-2">50K+</div>
                            <div className="text-gray-400 text-sm sm:text-base">Community Members</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="w-full py-16 lg:py-20 bg-white">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
                        Ready to build your community?
                    </h2>
                    <p className="text-base sm:text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                        Join DotNation today and start earning from your most dedicated supporters. No credit card required.
                    </p>
                    <Link to="/members/browse" className="inline-block px-10 py-4 bg-black text-white text-base sm:text-lg font-semibold rounded-full hover:bg-gray-800 transition-all hover:shadow-xl">
                        Get Started for Free
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-gray-200 bg-gray-50">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="flex items-center gap-2">
                            <div className="w-9 h-9 bg-black text-white rounded-full flex items-center justify-center font-serif font-bold">D</div>
                            <span className="font-serif text-xl">DotNation</span>
                        </div>
                        <div className="text-sm text-gray-600">
                            © 2025 DotNation. Built on Polkadot.
                        </div>
                        <div className="flex gap-6">
                            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-black transition-colors text-sm font-medium">Twitter</a>
                            <a href="https://discord.com" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-black transition-colors text-sm font-medium">Discord</a>
                            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-black transition-colors text-sm font-medium">Github</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default MembersLandingPage;
