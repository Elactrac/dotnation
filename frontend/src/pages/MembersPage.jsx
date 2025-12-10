import { useState, useMemo, useEffect } from 'react';
import { FiSearch, FiX, FiSliders } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import CreatorCard from '../components/CreatorCard';

const MembersPage = () => {
    const [isFiltersOpen, setIsFiltersOpen] = useState(false);

    console.log('[MembersPage] Component rendered');

    // Search and filter states
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('subscribers-high');
    const [priceRange, setPriceRange] = useState([0, 50]); // DOT range
    const [selectedCategories, setSelectedCategories] = useState([]);

    // Mock creators data - 30 diverse creators across all categories
    const [creators] = useState([
        // Technology (8 creators)
        {
            id: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
            name: 'Alice - Tech Creator',
            description: 'Weekly deep dives into Polkadot and Web3 development',
            price: '10 DOT',
            priceValue: 10,
            subscribers: 142,
            avatar: '👩‍💻',
            category: 'Technology'
        },
        {
            id: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKut01',
            name: 'CodeMaster Pro',
            description: 'Advanced Rust and Substrate tutorials for blockchain developers',
            price: '18 DOT',
            priceValue: 18,
            subscribers: 387,
            avatar: '⚡',
            category: 'Technology'
        },
        {
            id: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKut02',
            name: 'CryptoDevAcademy',
            description: 'Learn smart contract development from scratch',
            price: '12 DOT',
            priceValue: 12,
            subscribers: 256,
            avatar: '🔧',
            category: 'Technology'
        },
        {
            id: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKut03',
            name: 'Web3 Pioneer',
            description: 'Building the decentralized future with tutorials and insights',
            price: '14 DOT',
            priceValue: 14,
            subscribers: 198,
            avatar: '🚀',
            category: 'Technology'
        },
        {
            id: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKut04',
            name: 'Blockchain Betty',
            description: 'Making complex tech simple for everyone',
            price: '8 DOT',
            priceValue: 8,
            subscribers: 423,
            avatar: '💎',
            category: 'Technology'
        },
        {
            id: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKut05',
            name: 'Parachain Expert',
            description: 'Everything you need to know about Polkadot parachains',
            price: '16 DOT',
            priceValue: 16,
            subscribers: 311,
            avatar: '🔗',
            category: 'Technology'
        },
        {
            id: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKut06',
            name: 'AI & Web3 Fusion',
            description: 'Exploring the intersection of AI and blockchain technology',
            price: '20 DOT',
            priceValue: 20,
            subscribers: 189,
            avatar: '🤖',
            category: 'Technology'
        },
        {
            id: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKut07',
            name: 'Security Sensei',
            description: 'Web3 security audits and best practices',
            price: '22 DOT',
            priceValue: 22,
            subscribers: 267,
            avatar: '🛡️',
            category: 'Technology'
        },

        // Arts (6 creators)
        {
            id: '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty',
            name: 'Bob - NFT Artist',
            description: 'Exclusive NFT drops and behind-the-scenes content',
            price: '5 DOT',
            priceValue: 5,
            subscribers: 89,
            avatar: '🎨',
            category: 'Arts'
        },
        {
            id: '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM69401',
            name: 'Digital Dreams Gallery',
            description: 'Surreal digital art and monthly NFT collections',
            price: '7 DOT',
            priceValue: 7,
            subscribers: 412,
            avatar: '🖼️',
            category: 'Arts'
        },
        {
            id: '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM69402',
            name: 'Pixel Perfectionist',
            description: 'Retro pixel art and game design tutorials',
            price: '4 DOT',
            priceValue: 4,
            subscribers: 324,
            avatar: '🎮',
            category: 'Arts'
        },
        {
            id: '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM69403',
            name: 'Abstract Visions',
            description: 'Contemporary abstract art and creative process insights',
            price: '9 DOT',
            priceValue: 9,
            subscribers: 178,
            avatar: '🌈',
            category: 'Arts'
        },
        {
            id: '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM69404',
            name: 'Music & Blockchain',
            description: 'NFT music releases and Web3 music industry insights',
            price: '6 DOT',
            priceValue: 6,
            subscribers: 256,
            avatar: '🎵',
            category: 'Arts'
        },
        {
            id: '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM69405',
            name: 'Photography DAO',
            description: 'Exclusive photography collections and editing masterclasses',
            price: '11 DOT',
            priceValue: 11,
            subscribers: 201,
            avatar: '📷',
            category: 'Arts'
        },

        // Business (5 creators)
        {
            id: '5FLSigC9HGRKVhB9FiEo4Y3koPsNmBmLJbpXg2mp1hXcS59Y',
            name: 'Charlie - DeFi Educator',
            description: 'Monthly market analysis and trading strategies',
            price: '15 DOT',
            priceValue: 15,
            subscribers: 231,
            avatar: '📊',
            category: 'Business'
        },
        {
            id: '5FLSigC9HGRKVhB9FiEo4Y3koPsNmBmLJbpXg2mp1hXcS501',
            name: 'Startup Accelerator',
            description: 'Web3 startup advice and funding strategies',
            price: '25 DOT',
            priceValue: 25,
            subscribers: 143,
            avatar: '💼',
            category: 'Business'
        },
        {
            id: '5FLSigC9HGRKVhB9FiEo4Y3koPsNmBmLJbpXg2mp1hXcS502',
            name: 'Token Economics Pro',
            description: 'Deep dives into tokenomics and protocol design',
            price: '19 DOT',
            priceValue: 19,
            subscribers: 187,
            avatar: '💰',
            category: 'Business'
        },
        {
            id: '5FLSigC9HGRKVhB9FiEo4Y3koPsNmBmLJbpXg2mp1hXcS503',
            name: 'Marketing Maven',
            description: 'Growth hacking and marketing for Web3 projects',
            price: '13 DOT',
            priceValue: 13,
            subscribers: 298,
            avatar: '📈',
            category: 'Business'
        },
        {
            id: '5FLSigC9HGRKVhB9FiEo4Y3koPsNmBmLJbpXg2mp1hXcS504',
            name: 'Legal Web3 Advisor',
            description: 'Navigating regulations and compliance in crypto',
            price: '28 DOT',
            priceValue: 28,
            subscribers: 156,
            avatar: '⚖️',
            category: 'Business'
        },

        // Community (5 creators)
        {
            id: '5DAAnrj7VHTznn2AWBemMuyBwZWs6FNFjdyVXUeYum3PTXFy',
            name: 'Diana - Community Builder',
            description: 'Building inclusive spaces and fostering connections in Web3',
            price: '8 DOT',
            priceValue: 8,
            subscribers: 167,
            avatar: '🌟',
            category: 'Community'
        },
        {
            id: '5DAAnrj7VHTznn2AWBemMuyBwZWs6FNFjdyVXUeYum3PTX01',
            name: 'DAO Governance Guide',
            description: 'Teaching effective governance and community management',
            price: '10 DOT',
            priceValue: 10,
            subscribers: 234,
            avatar: '🗳️',
            category: 'Community'
        },
        {
            id: '5DAAnrj7VHTznn2AWBemMuyBwZWs6FNFjdyVXUeYum3PTX02',
            name: 'Web3 Events Network',
            description: 'Early access to conferences and exclusive meetups',
            price: '12 DOT',
            priceValue: 12,
            subscribers: 445,
            avatar: '🎉',
            category: 'Community'
        },
        {
            id: '5DAAnrj7VHTznn2AWBemMuyBwZWs6FNFjdyVXUeYum3PTX03',
            name: 'Polkadot Ambassador',
            description: 'Weekly ecosystem updates and community highlights',
            price: '6 DOT',
            priceValue: 6,
            subscribers: 512,
            avatar: '🎯',
            category: 'Community'
        },
        {
            id: '5DAAnrj7VHTznn2AWBemMuyBwZWs6FNFjdyVXUeYum3PTX04',
            name: 'Diversity in Web3',
            description: 'Promoting inclusivity and supporting underrepresented voices',
            price: '7 DOT',
            priceValue: 7,
            subscribers: 289,
            avatar: '🌍',
            category: 'Community'
        },

        // Environment (3 creators)
        {
            id: '5HGjWAeFDfFCWPsjFQdVV2Msvz2XtMktvgocEZcCj68kUMaw',
            name: 'Eve - Environmental Activist',
            description: 'Climate tech innovations and sustainability in blockchain',
            price: '12 DOT',
            priceValue: 12,
            subscribers: 203,
            avatar: '🌱',
            category: 'Environment'
        },
        {
            id: '5HGjWAeFDfFCWPsjFQdVV2Msvz2XtMktvgocEZcCj68kUM01',
            name: 'Green Blockchain Initiative',
            description: 'Carbon-neutral protocols and eco-friendly crypto',
            price: '9 DOT',
            priceValue: 9,
            subscribers: 167,
            avatar: '♻️',
            category: 'Environment'
        },
        {
            id: '5HGjWAeFDfFCWPsjFQdVV2Msvz2XtMktvgocEZcCj68kUM02',
            name: 'Climate Action DAO',
            description: 'Funding environmental projects through Web3',
            price: '15 DOT',
            priceValue: 15,
            subscribers: 234,
            avatar: '🌎',
            category: 'Environment'
        },

        // Health (3 creators)
        {
            id: '5CiPPseXPECbkjWCa6MnjNokrgYjMqmKndv2rSnekmSK2DjL',
            name: 'Frank - Fitness Coach',
            description: 'Daily workout routines and nutrition guidance for Web3 builders',
            price: '6 DOT',
            priceValue: 6,
            subscribers: 95,
            avatar: '💪',
            category: 'Health'
        },
        {
            id: '5CiPPseXPECbkjWCa6MnjNokrgYjMqmKndv2rSnekmSK2D01',
            name: 'Mental Health in Web3',
            description: 'Managing stress and maintaining work-life balance in crypto',
            price: '8 DOT',
            priceValue: 8,
            subscribers: 312,
            avatar: '🧘',
            category: 'Health'
        },
        {
            id: '5CiPPseXPECbkjWCa6MnjNokrgYjMqmKndv2rSnekmSK2D02',
            name: 'Wellness & Longevity',
            description: 'Biohacking tips and healthy lifestyle for crypto enthusiasts',
            price: '10 DOT',
            priceValue: 10,
            subscribers: 189,
            avatar: '🍎',
            category: 'Health'
        }
    ]);

    // Mesh grid canvas effect
    useEffect(() => {
        // Temporarily disable canvas for debugging
        console.log('[MembersPage] Canvas effect skipped for debugging');
        return;


        // const canvas = document.getElementById('mesh-canvas-members');
        // if (!canvas) return;

        // const ctx = canvas.getContext('2d');
        // canvas.width = window.innerWidth;
        // canvas.height = document.documentElement.scrollHeight;

        // let mouseX = window.innerWidth / 2;
        // let mouseY = window.innerHeight / 2;

        // const handleMouseMove = (e) => {
        //     mouseX = e.clientX;
        //     mouseY = e.clientY + window.pageYOffset;
        // };

        // const drawMesh = () => {
        //     ctx.clearRect(0, 0, canvas.width, canvas.height);

        //     const gridSize = 40;
        //     const maxDistance = 200;

        //     // Draw vertical lines
        //     for (let x = 0; x < canvas.width; x += gridSize) {
        //         const distX = Math.abs(mouseX - x);
        //         if (distX < maxDistance) {
        //             const opacity = (1 - distX / maxDistance) * 0.1; // Reduced opacity for light theme
        //             ctx.strokeStyle = `rgba(0, 122, 255, ${opacity})`; // Blue tint
        //         } else {
        //             ctx.strokeStyle = 'rgba(0, 0, 0, 0.03)'; // Very subtle gray
        //         }

        //         ctx.beginPath();
        //         ctx.moveTo(x, 0);
        //         ctx.lineTo(x, canvas.height);
        //         ctx.stroke();
        //     }

        //     // Draw horizontal lines
        //     for (let y = 0; y < canvas.height; y += gridSize) {
        //         const distY = Math.abs(mouseY - y);
        //         if (distY < maxDistance) {
        //             const opacity = (1 - distY / maxDistance) * 0.1;
        //             ctx.strokeStyle = `rgba(0, 122, 255, ${opacity})`;
        //         } else {
        //             ctx.strokeStyle = 'rgba(0, 0, 0, 0.03)';
        //         }

        //         ctx.beginPath();
        //         ctx.moveTo(0, y);
        //         ctx.lineTo(canvas.width, y);
        //         ctx.stroke();
        //     }

        //     requestAnimationFrame(drawMesh);
        // };

        // drawMesh();

        // const handleResize = () => {
        //     canvas.width = window.innerWidth;
        //     canvas.height = document.documentElement.scrollHeight;
        // };

        // document.addEventListener('mousemove', handleMouseMove);
        // window.addEventListener('resize', handleResize);

        // return () => {
        //     document.removeEventListener('mousemove', handleMouseMove);
        //     window.removeEventListener('resize', handleResize);
        // };
    }, []);

    // Available categories
    const availableCategories = useMemo(() => [
        'Technology', 'Arts', 'Business', 'Community', 'Environment', 'Health'
    ], []);

    // Filter and sort creators
    const filteredCreators = useMemo(() => {
        console.log('[MembersPage] Filtering creators, total:', creators.length);
        let filtered = creators.filter(creator => {
            // Search query filter
            if (searchQuery) {
                const query = searchQuery.toLowerCase();
                const matchesName = creator.name.toLowerCase().includes(query);
                const matchesDescription = creator.description.toLowerCase().includes(query);
                if (!matchesName && !matchesDescription) return false;
            }

            // Price range filter
            if (creator.priceValue < priceRange[0] || creator.priceValue > priceRange[1]) {
                return false;
            }

            // Category filter
            if (selectedCategories.length > 0) {
                if (!selectedCategories.includes(creator.category)) {
                    return false;
                }
            }

            return true;
        });

        // Sort creators
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'subscribers-high':
                    return b.subscribers - a.subscribers;
                case 'subscribers-low':
                    return a.subscribers - b.subscribers;
                case 'price-high':
                    return b.priceValue - a.priceValue;
                case 'price-low':
                    return a.priceValue - b.priceValue;
                case 'name-asc':
                    return a.name.localeCompare(b.name);
                case 'name-desc':
                    return b.name.localeCompare(a.name);
                default:
                    return 0;
            }
        });

        console.log('[MembersPage] Filtered creators count:', filtered.length);
        return filtered;
    }, [creators, searchQuery, sortBy, priceRange, selectedCategories]);

    const handleCategoryToggle = (category) => {
        setSelectedCategories(prev =>
            prev.includes(category)
                ? prev.filter(c => c !== category)
                : [...prev, category]
        );
    };

    const clearFilters = () => {
        setSearchQuery('');
        setSortBy('subscribers-high');
        setPriceRange([0, 50]);
        setSelectedCategories([]);
    };

    const activeFiltersCount = useMemo(() => {
        let count = 0;
        if (searchQuery) count++;
        if (sortBy !== 'subscribers-high') count++;
        if (priceRange[0] !== 0 || priceRange[1] !== 50) count++;
        if (selectedCategories.length > 0) count++;
        return count;
    }, [searchQuery, sortBy, priceRange, selectedCategories]);

    return (
        <div className="relative min-h-screen bg-white text-gray-900 font-sans">
            {/* Navigation */}
            <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 transition-all duration-300">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center font-serif text-xl font-bold group-hover:scale-105 transition-transform">
                            D
                        </div>
                        <span className="font-serif text-2xl tracking-tight">DotNation</span>
                    </Link>

                    <div className="hidden md:flex items-center gap-8">
                        <Link to="/" className="text-sm font-medium text-gray-600 hover:text-black transition-colors">Campaigns</Link>
                        <Link to="/members" className="text-sm font-medium text-black">Members</Link>
                        <Link to="/about" className="text-sm font-medium text-gray-600 hover:text-black transition-colors">About</Link>
                    </div>

                    <div className="flex items-center gap-4">
                        <Link to="/login" className="text-sm font-medium text-gray-600 hover:text-black transition-colors hidden sm:block">
                            Log in
                        </Link>
                        <Link to="/members/dashboard" className="px-6 py-2.5 bg-black text-white text-sm font-medium rounded-full hover:bg-gray-800 transition-all hover:shadow-lg hover:-translate-y-0.5">
                            Creator Dashboard
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Interactive Mesh Grid Canvas */}
            <canvas
                id="mesh-canvas-members"
                className="fixed inset-0 pointer-events-none z-0"
            />

            {/* Static Background Gradients - Subtle for Light Theme */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(0,122,255,0.03)_0%,transparent_50%)]" />
                <div className="absolute top-1/4 right-0 w-1/2 h-1/2 bg-[radial-gradient(circle_at_center,rgba(0,199,190,0.02)_0%,transparent_50%)]" />
                <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-[radial-gradient(circle_at_center,rgba(0,122,255,0.02)_0%,transparent_50%)]" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 pt-32">
                <div className="space-y-8">
                    {/* Header */}
                    <div className="text-left">
                        <h1 className="text-5xl font-serif mb-3 text-gray-900">
                            Browse Creators
                        </h1>
                        <p className="text-lg text-gray-600 font-sans">Support your favorite creators with recurring subscriptions</p>
                    </div>

                    {/* Search and Filters */}
                    <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all duration-300">
                        <div className="space-y-4">
                            {/* Search Bar */}
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <FiSearch className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search creators by name or description..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 font-sans focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                                />
                            </div>

                            {/* Filter Toggle and Sort */}
                            <div className="flex justify-between items-center flex-wrap gap-4">
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => setIsFiltersOpen(!isFiltersOpen)}
                                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border font-sans transition-all duration-300 ${activeFiltersCount > 0
                                            ? 'bg-blue-50 border-blue-200 text-blue-600'
                                            : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                                            } md:hidden`}
                                    >
                                        <FiSliders className="w-4 h-4" />
                                        Filters {activeFiltersCount > 0 && `(${activeFiltersCount})`}
                                    </button>

                                    {activeFiltersCount > 0 && (
                                        <button
                                            onClick={clearFilters}
                                            className="px-4 py-2 text-sm text-gray-500 hover:text-gray-900 font-sans transition-all duration-300"
                                        >
                                            Clear All
                                        </button>
                                    )}
                                </div>

                                <div className="flex items-center gap-3">
                                    <span className="text-sm text-gray-500 whitespace-nowrap font-sans font-medium uppercase">Sort by:</span>
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 text-sm font-sans focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                                    >
                                        <option value="subscribers-high">Most Subscribers</option>
                                        <option value="subscribers-low">Least Subscribers</option>
                                        <option value="price-high">Highest Price</option>
                                        <option value="price-low">Lowest Price</option>
                                        <option value="name-asc">Name (A-Z)</option>
                                        <option value="name-desc">Name (Z-A)</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Results Summary */}
                    <div className="flex justify-between items-center flex-wrap gap-4">
                        <p className="text-gray-600 font-sans">
                            Showing <span className="text-gray-900 font-bold">{filteredCreators.length}</span> of <span className="text-gray-900 font-bold">{creators.length}</span> creators
                        </p>
                        {activeFiltersCount > 0 && (
                            <span className="px-4 py-2 bg-blue-50 border border-blue-100 text-blue-600 text-sm rounded-full font-sans font-medium">
                                {activeFiltersCount} filter{activeFiltersCount !== 1 ? 's' : ''} active
                            </span>
                        )}
                    </div>

                    {/* Creators Grid */}
                    {filteredCreators.length === 0 ? (
                        <div className="bg-white/80 backdrop-blur-xl rounded-2xl border border-gray-200 p-12 text-center shadow-sm">
                            <div className="space-y-4">
                                <FiSearch className="w-16 h-16 text-gray-300 mx-auto" />
                                <h3 className="text-2xl font-serif text-gray-900">No Creators Found</h3>
                                <p className="text-gray-500 font-sans max-w-md mx-auto">
                                    {activeFiltersCount > 0
                                        ? "Try adjusting your filters or search terms to find more creators."
                                        : "There are no creators available at the moment. Check back later!"
                                    }
                                </p>
                                {activeFiltersCount > 0 && (
                                    <button
                                        onClick={clearFilters}
                                        className="px-8 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 font-sans font-medium transition-all duration-300 shadow-lg shadow-blue-200"
                                    >
                                        Clear Filters
                                    </button>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredCreators.map((creator) => (
                                <CreatorCard
                                    key={creator.id}
                                    creator={creator}
                                />
                            ))}
                        </div>
                    )}

                    {/* Mobile Filters Panel */}
                    {isFiltersOpen && (
                        <div className="fixed inset-0 z-50 md:hidden">
                            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setIsFiltersOpen(false)} />
                            <div className="absolute right-0 top-0 h-full w-80 bg-white border-l border-gray-200 p-6 overflow-y-auto shadow-2xl">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-2xl font-serif text-gray-900">Filters</h3>
                                    <button
                                        onClick={() => setIsFiltersOpen(false)}
                                        className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-300"
                                    >
                                        <FiX className="w-6 h-6" />
                                    </button>
                                </div>

                                <div className="space-y-6">
                                    {/* Sort Options */}
                                    <div>
                                        <label className="block text-sm font-medium font-sans uppercase text-gray-500 mb-3">Sort By</label>
                                        <select
                                            value={sortBy}
                                            onChange={(e) => setSortBy(e.target.value)}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-sans focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300"
                                        >
                                            <option value="subscribers-high">Most Subscribers</option>
                                            <option value="subscribers-low">Least Subscribers</option>
                                            <option value="price-high">Highest Price</option>
                                            <option value="price-low">Lowest Price</option>
                                            <option value="name-asc">Name (A-Z)</option>
                                            <option value="name-desc">Name (Z-A)</option>
                                        </select>
                                    </div>

                                    {/* Price Range */}
                                    <div>
                                        <label className="block text-sm font-medium font-sans uppercase text-gray-500 mb-3">
                                            Price Range: {priceRange[0]} - {priceRange[1]} DOT
                                        </label>
                                        <input
                                            type="range"
                                            min="0"
                                            max="50"
                                            step="1"
                                            value={priceRange[0]}
                                            onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                        />
                                        <input
                                            type="range"
                                            min="0"
                                            max="50"
                                            step="1"
                                            value={priceRange[1]}
                                            onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600 mt-2"
                                        />
                                    </div>

                                    {/* Categories */}
                                    <div>
                                        <label className="block text-sm font-medium font-sans uppercase text-gray-500 mb-3">Categories</label>
                                        <div className="flex flex-wrap gap-2">
                                            {availableCategories.map((category) => (
                                                <button
                                                    key={category}
                                                    onClick={() => handleCategoryToggle(category)}
                                                    className={`px-4 py-2 text-sm font-sans rounded-full transition-all duration-300 ${selectedCategories.includes(category)
                                                        ? 'bg-blue-600 text-white shadow-md'
                                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                        }`}
                                                >
                                                    {category}
                                                    {selectedCategories.includes(category) && (
                                                        <FiX className="inline w-3 h-3 ml-1" />
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Clear Filters */}
                                    {activeFiltersCount > 0 && (
                                        <button
                                            onClick={clearFilters}
                                            className="w-full px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-sans font-medium transition-all duration-300 shadow-lg shadow-blue-200"
                                        >
                                            Clear All Filters
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MembersPage;
