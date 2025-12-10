import { Link } from 'react-router-dom';
import { FiArrowRight, FiLayers, FiShield, FiAnchor } from 'react-icons/fi';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import Button from '../components/Button';

const MembersLandingPage = () => {
    // Featured creators data
    const featuredCreators = [
        {
            name: 'Sarah Chen',
            category: 'Visual Artist',
            description: 'Digital art exploring identity and technology',
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&q=80',
            subscribers: 342,
            price: '8 DOT',
            rating: 4.9,
            id: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKut08'
        },
        {
            name: 'Marcus Johnson',
            category: 'Musician',
            description: 'Electronic music producer and sound designer',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&q=80',
            subscribers: 189,
            price: '12 DOT',
            rating: 4.8,
            id: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKut21'
        },
        {
            name: 'Alex Rivera',
            category: 'Writer',
            description: 'Science fiction and speculative storytelling',
            avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&q=80',
            subscribers: 267,
            price: '6 DOT',
            rating: 4.7,
            id: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKut24'
        }
    ];

    return (
        <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-blue-100 selection:text-blue-900 overflow-x-hidden">
            {/* Ambient Background Glow (Light Mode) */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-blue-100/50 rounded-full blur-[120px] opacity-30"></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-purple-100/50 rounded-full blur-[120px] opacity-30"></div>
                <div className="absolute top-[40%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[40%] h-[40%] bg-gray-100/50 rounded-full blur-[100px] opacity-20"></div>
            </div>

            {/* Navigation */}
            <NavBar variant="landing" />

            {/* Hero Section (Compact Collage - Above the Fold) */}
            <section className="relative w-full py-16 lg:py-24 overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                        {/* Left Content */}
                        <div className="text-left">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 bg-gray-50/50 backdrop-blur-md mb-7">
                                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse"></span>
                                <span className="text-xs font-medium text-gray-700 tracking-wide uppercase">Creator Memberships</span>
                            </div>

                            <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl leading-[1.1] tracking-tight text-gray-900 mb-7 text-balance">
                                Build your <br />
                                <span className="italic text-gray-700">legacy.</span>
                            </h1>

                            <p className="text-lg sm:text-xl text-gray-600 max-w-lg leading-relaxed mb-10 text-balance font-light">
                                The permanent home for creators who value ownership. Launch memberships, build community, and own your future on-chain.
                            </p>

                            <div className="flex flex-col sm:flex-row items-center gap-4">
                                <Button
                                    to="/creator/dashboard"
                                    variant="primary"
                                    icon={<FiArrowRight />}
                                >
                                    Start Creating
                                </Button>
                                <Button
                                    to="/members/browse"
                                    variant="secondary"
                                >
                                    Explore Creators
                                </Button>
                            </div>
                        </div>

                        {/* Right Collage (Compact & Light) */}
                        <div className="relative h-[550px] w-full hidden lg:block">
                            {/* Card 1: Creator Profile */}
                            <div className="absolute top-0 right-10 w-72 h-96 bg-white border border-gray-200 rounded-xl overflow-hidden transform rotate-6 hover:rotate-0 transition-all duration-700 hover:scale-105 z-20 shadow-2xl group">
                                <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&h=800&fit=crop&q=80" alt="Featured creator Sarah Chen - Artist profile" className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent"></div>
                                <div className="absolute bottom-0 left-0 right-0 p-6">
                                    <div className="flex justify-between items-end mb-2">
                                        <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Artist</span>
                                        <span className="text-xs text-white/70">342 Members</span>
                                    </div>
                                    <p className="text-white font-serif text-lg leading-tight">Sarah Chen</p>
                                </div>
                            </div>

                            {/* Card 2: Creator Profile */}
                            <div className="absolute bottom-10 left-10 w-64 h-80 bg-white border border-gray-200 rounded-xl overflow-hidden transform -rotate-3 hover:rotate-0 transition-all duration-700 hover:scale-105 z-10 shadow-2xl group">
                                <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=800&fit=crop&q=80" alt="Featured creator Marcus J. - Musician profile" className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent"></div>
                                <div className="absolute bottom-0 left-0 right-0 p-6">
                                    <div className="flex justify-between items-end mb-2">
                                        <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Musician</span>
                                        <span className="text-xs text-white/70">189 Members</span>
                                    </div>
                                    <p className="text-white font-serif text-lg leading-tight">Marcus J.</p>
                                </div>
                            </div>

                            {/* Floating Elements */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[100%] h-[100%] bg-gradient-to-tr from-blue-100/30 to-purple-100/30 rounded-full blur-3xl -z-10"></div>
                        </div>
                    </div>

                </div>
            </section>

            {/* Trust Signals (Glass Cards) */}
            <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="p-6 rounded-2xl bg-white/50 border border-gray-200 backdrop-blur-sm hover:bg-white transition-colors group">
                        <FiAnchor className="w-8 h-8 text-blue-600 mb-4 group-hover:scale-110 transition-transform" />
                        <h3 className="text-xl font-serif text-gray-900 mb-2">Permanent</h3>
                        <p className="text-gray-600 text-sm leading-relaxed">Your content and community aren&apos;t fleeting. Built on blockchain to last forever.</p>
                    </div>
                    <div className="p-6 rounded-2xl bg-white/50 border border-gray-200 backdrop-blur-sm hover:bg-white transition-colors group">
                        <FiLayers className="w-8 h-8 text-purple-600 mb-4 group-hover:scale-110 transition-transform" />
                        <h3 className="text-xl font-serif text-gray-900 mb-2">Transparent</h3>
                        <p className="text-gray-600 text-sm leading-relaxed">Clear glass, clear value. See exactly where every dollar goes with full transparency.</p>
                    </div>
                    <div className="p-6 rounded-2xl bg-white/50 border border-gray-200 backdrop-blur-sm hover:bg-white transition-colors group">
                        <FiShield className="w-8 h-8 text-green-600 mb-4 group-hover:scale-110 transition-transform" />
                        <h3 className="text-xl font-serif text-gray-900 mb-2">Protected</h3>
                        <p className="text-gray-600 text-sm leading-relaxed">A heavy weight against censorship. Your platform, your rules. Truly owned by you.</p>
                    </div>
                </div>
            </section>

            {/* Featured Creators Section */}
            <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-gray-200">
                <div className="flex justify-between items-end mb-12">
                    <div>
                        <h2 className="text-3xl md:text-4xl font-serif text-gray-900 mb-2">Featured Creators</h2>
                        <p className="text-gray-600">Join the community supporting exceptional creators.</p>
                    </div>
                    <Link to="/members/browse" className="hidden sm:flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
                        View All <FiArrowRight />
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {featuredCreators.map((creator, index) => (
                        <Link
                            key={index}
                            to={`/members/${creator.id}`}
                            className="group rounded-2xl bg-white border border-gray-200 overflow-hidden hover:border-gray-400 transition-all hover:-translate-y-1 hover:shadow-xl"
                        >
                            <div className="relative h-48 overflow-hidden">
                                <img src={creator.avatar} alt={`${creator.name} - ${creator.category} creator profile`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                <div className="absolute top-4 left-4 px-3 py-1 bg-white/80 backdrop-blur-md rounded-full text-xs font-medium text-gray-900 border border-gray-200">
                                    {creator.category}
                                </div>
                                <div className="absolute top-4 right-4 px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-xs font-medium text-white flex items-center gap-1">
                                    ⭐ {creator.rating}
                                </div>
                            </div>
                            <div className="p-6">
                                <h3 className="text-xl font-serif text-gray-900 mb-2">{creator.name}</h3>
                                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{creator.description}</p>

                                <div className="flex justify-between items-center text-sm mb-6">
                                    <span className="text-gray-900 font-medium">{creator.price}/month</span>
                                    <span className="text-gray-600">{creator.subscribers} members</span>
                                </div>

                                <button className="w-full py-2.5 bg-gray-100 hover:bg-black text-gray-900 hover:text-white rounded-lg transition-all font-medium text-sm">
                                    View Profile
                                </button>
                            </div>
                        </Link>
                    ))}
                </div>

                <div className="mt-8 text-center sm:hidden">
                    <Link to="/members/browse" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
                        View All Creators <FiArrowRight />
                    </Link>
                </div>
            </section>

            {/* Quote Section */}
            <section className="w-full py-24 relative">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="bg-gray-50 border border-gray-200 p-12 rounded-3xl relative">
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-lg">
                            <span className="font-serif text-4xl text-gray-900">&quot;</span>
                        </div>
                        <blockquote className="font-serif text-3xl sm:text-4xl leading-relaxed text-gray-900 mb-8 pt-6">
                            Paperweight gave my work the gravity it deserved. It&apos;s not just a platform; it&apos;s a statement.
                        </blockquote>
                        <div className="flex flex-col items-center gap-2">
                            <cite className="not-italic font-semibold text-gray-900 tracking-wide uppercase text-sm">Sarah Jenkins</cite>
                            <span className="text-gray-600 text-sm">Digital Artist & Curator</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="w-full py-24 relative overflow-hidden">
                <div className="absolute inset-0 bg-gray-50"></div>
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                    <h2 className="font-serif text-5xl sm:text-6xl lg:text-7xl text-gray-900 mb-8">
                        Ready to start?
                    </h2>
                    <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto font-light">
                        Join Paperweight today. No noise. No algorithms. Just you and your community.
                    </p>
                    <Button
                        to="/members/browse"
                        variant="primary"
                    >
                        Browse All Creators
                    </Button>
                </div>
            </section>

            {/* Footer */}
            <Footer variant="landing" />
        </div>
    );
};

export default MembersLandingPage;
