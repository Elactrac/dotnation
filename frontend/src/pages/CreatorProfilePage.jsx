import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useWallet } from '../contexts/WalletContext';
import { 
    FiCheck, FiClock, FiUsers, FiStar, FiHeart, 
    FiShare2, FiLock, FiPlay, FiDownload, FiArrowLeft 
} from 'react-icons/fi';

const CreatorProfilePage = () => {
    const { creatorId } = useParams();
    const navigate = useNavigate();
    const { setLightTheme } = useTheme();
    const { selectedAccount } = useWallet();
    
    const [selectedTier, setSelectedTier] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showSubscribeModal, setShowSubscribeModal] = useState(false);
    const [isSubscribed, setIsSubscribed] = useState(false);

    useEffect(() => {
        setLightTheme();
    }, [setLightTheme]);

    // Mock creator data based on ID
    const creators = {
        '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY': {
            name: 'Alice - Tech Creator',
            tagline: 'Building the future of Web3, one tutorial at a time',
            description: 'I create in-depth technical content about Polkadot, Substrate, and Web3 development. With 5+ years in blockchain development, I help developers navigate the decentralized ecosystem through detailed tutorials, code reviews, and hands-on projects.',
            avatar: '👩‍💻',
            category: 'Technology',
            subscribers: 142,
            postsCount: 87,
            rating: 4.9,
            memberSince: 'Jan 2023',
            tiers: [
                {
                    id: 'bronze',
                    name: 'Bronze',
                    price: '5 DOT',
                    priceValue: 5,
                    description: 'Perfect for getting started',
                    perks: [
                        'Access to all public posts',
                        'Weekly newsletter',
                        'Community Discord access',
                        'Vote on content topics'
                    ]
                },
                {
                    id: 'silver',
                    name: 'Silver',
                    price: '10 DOT',
                    priceValue: 10,
                    description: 'Most popular tier',
                    popular: true,
                    perks: [
                        'All Bronze benefits',
                        'Early access to videos',
                        'Monthly Q&A sessions',
                        'Source code repository access',
                        'Exclusive Discord channels'
                    ]
                },
                {
                    id: 'gold',
                    name: 'Gold',
                    price: '18 DOT',
                    priceValue: 18,
                    description: 'Ultimate supporter package',
                    perks: [
                        'All Silver benefits',
                        '1-on-1 mentorship (1hr/month)',
                        'Code review sessions',
                        'Exclusive NFT collection',
                        'Priority support',
                        'Name in video credits'
                    ]
                }
            ],
            recentPosts: [
                {
                    id: '1',
                    title: 'Advanced Substrate Runtime Development',
                    type: 'Video Tutorial',
                    duration: '45 min',
                    views: 234,
                    likes: 89,
                    postedDate: '2 days ago',
                    thumbnail: '🎬',
                    locked: false,
                    requiredTier: 'silver'
                },
                {
                    id: '2',
                    title: 'Building Your First Parachain',
                    type: 'Article',
                    readTime: '12 min read',
                    views: 412,
                    likes: 156,
                    postedDate: '5 days ago',
                    thumbnail: '📄',
                    locked: false,
                    requiredTier: 'bronze'
                },
                {
                    id: '3',
                    title: 'Smart Contract Security Best Practices',
                    type: 'PDF Guide',
                    pages: '28 pages',
                    downloads: 178,
                    likes: 234,
                    postedDate: '1 week ago',
                    thumbnail: '📚',
                    locked: false,
                    requiredTier: 'silver'
                },
                {
                    id: '4',
                    title: 'Exclusive: Runtime Optimization Deep Dive',
                    type: 'Video',
                    duration: '90 min',
                    views: 0,
                    likes: 0,
                    postedDate: '2 weeks ago',
                    thumbnail: '🔒',
                    locked: true,
                    requiredTier: 'gold'
                }
            ],
            stats: {
                totalViews: '45.2K',
                totalHours: '230+ hours',
                responseTime: '< 24 hours'
            }
        }
    };

    const creator = creators[creatorId] || {
        name: 'CodeMaster Pro',
        tagline: 'Advanced Rust and Substrate tutorials',
        description: 'Professional blockchain developer creating comprehensive tutorials and courses for Web3 developers.',
        avatar: '⚡',
        category: 'Technology',
        subscribers: 387,
        postsCount: 124,
        rating: 4.8,
        memberSince: 'Mar 2023',
        tiers: [
            {
                id: 'basic',
                name: 'Basic',
                price: '8 DOT',
                priceValue: 8,
                description: 'Essential access',
                perks: [
                    'Weekly tutorials',
                    'Community access',
                    'Newsletter'
                ]
            },
            {
                id: 'pro',
                name: 'Pro',
                price: '18 DOT',
                priceValue: 18,
                description: 'Professional tier',
                popular: true,
                perks: [
                    'All Basic benefits',
                    'Premium content',
                    'Monthly live sessions',
                    'Code repository access'
                ]
            }
        ],
        recentPosts: [
            {
                id: '1',
                title: 'Getting Started with Rust',
                type: 'Video',
                duration: '30 min',
                views: 567,
                likes: 189,
                postedDate: '3 days ago',
                thumbnail: '🎥',
                locked: false,
                requiredTier: 'basic'
            }
        ],
        stats: {
            totalViews: '78.5K',
            totalHours: '400+ hours',
            responseTime: '< 12 hours'
        }
    };

    const handleSubscribe = (tier) => {
        if (!selectedAccount) {
            alert('Please connect your wallet first');
            return;
        }
        setSelectedTier(tier);
        setShowSubscribeModal(true);
    };

    const confirmSubscription = async () => {
        setLoading(true);
        try {
            // TODO: Integrate with subscription_manager contract
            await new Promise(resolve => setTimeout(resolve, 2000));
            setIsSubscribed(true);
            setShowSubscribeModal(false);
            alert(`Successfully subscribed to ${selectedTier.name} tier!`);
            // Redirect to member dashboard
            setTimeout(() => navigate('/members/dashboard'), 1500);
        } catch (error) {
            console.error('Subscription error:', error);
            alert('Subscription failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white text-gray-900">
            {/* Navigation */}
            <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center font-serif text-xl font-bold group-hover:scale-105 transition-transform">
                            D
                        </div>
                        <span className="font-serif text-2xl tracking-tight">DotNation</span>
                    </Link>

                    <div className="flex items-center gap-4">
                        <Link to="/members/browse" className="text-sm font-medium text-gray-600 hover:text-black transition-colors">
                            Browse Creators
                        </Link>
                        <Link to="/members/dashboard" className="px-6 py-2.5 bg-black text-white text-sm font-medium rounded-full hover:bg-gray-800 transition-all">
                            My Subscriptions
                        </Link>
                    </div>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
                {/* Back Button */}
                <button 
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-600 hover:text-black mb-6 transition-colors"
                >
                    <FiArrowLeft className="w-5 h-5" />
                    <span className="text-sm font-medium">Back to Browse</span>
                </button>

                {/* Creator Header */}
                <div className="bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-3xl p-8 mb-8 shadow-sm">
                    <div className="flex flex-col lg:flex-row gap-8">
                        <div className="flex-shrink-0">
                            <div className="text-8xl mb-4">{creator.avatar}</div>
                            <div className="text-center lg:text-left space-y-2">
                                <div className="flex items-center justify-center lg:justify-start gap-2">
                                    <FiStar className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                                    <span className="font-serif text-xl">{creator.rating}</span>
                                </div>
                                <p className="text-sm text-gray-500">{creator.subscribers} subscribers</p>
                            </div>
                        </div>

                        <div className="flex-1">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h1 className="text-4xl font-serif mb-2">{creator.name}</h1>
                                    <p className="text-xl text-gray-600 mb-4">{creator.tagline}</p>
                                    <span className="inline-block px-4 py-1 bg-blue-50 text-blue-600 text-sm font-medium rounded-full">
                                        {creator.category}
                                    </span>
                                </div>
                                <div className="flex gap-2">
                                    <button className="p-3 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-all">
                                        <FiHeart className="w-5 h-5" />
                                    </button>
                                    <button className="p-3 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 transition-all">
                                        <FiShare2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            <p className="text-gray-700 mb-6 leading-relaxed">{creator.description}</p>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="bg-white border border-gray-200 rounded-xl p-4">
                                    <p className="text-2xl font-serif text-gray-900">{creator.postsCount}</p>
                                    <p className="text-sm text-gray-500">Posts</p>
                                </div>
                                <div className="bg-white border border-gray-200 rounded-xl p-4">
                                    <p className="text-2xl font-serif text-gray-900">{creator.stats.totalViews}</p>
                                    <p className="text-sm text-gray-500">Views</p>
                                </div>
                                <div className="bg-white border border-gray-200 rounded-xl p-4">
                                    <p className="text-2xl font-serif text-gray-900">{creator.stats.totalHours}</p>
                                    <p className="text-sm text-gray-500">Content</p>
                                </div>
                                <div className="bg-white border border-gray-200 rounded-xl p-4">
                                    <p className="text-2xl font-serif text-gray-900">{creator.stats.responseTime}</p>
                                    <p className="text-sm text-gray-500">Response</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Membership Tiers */}
                <div className="mb-12">
                    <h2 className="text-3xl font-serif mb-6">Choose Your Tier</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {creator.tiers.map((tier) => (
                            <div 
                                key={tier.id}
                                className={`bg-white border-2 rounded-2xl p-6 transition-all hover:shadow-lg ${
                                    tier.popular 
                                        ? 'border-blue-500 ring-4 ring-blue-100 relative' 
                                        : 'border-gray-200'
                                }`}
                            >
                                {tier.popular && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                        <span className="px-4 py-1 bg-blue-600 text-white text-sm font-medium rounded-full shadow-lg">
                                            Most Popular
                                        </span>
                                    </div>
                                )}

                                <div className="text-center mb-6">
                                    <h3 className="text-2xl font-serif mb-2">{tier.name}</h3>
                                    <p className="text-sm text-gray-500 mb-4">{tier.description}</p>
                                    <div className="mb-4">
                                        <span className="text-4xl font-serif">{tier.priceValue}</span>
                                        <span className="text-xl text-gray-600"> DOT</span>
                                        <span className="text-sm text-gray-500 block">per month</span>
                                    </div>
                                </div>

                                <ul className="space-y-3 mb-6">
                                    {tier.perks.map((perk, index) => (
                                        <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                                            <FiCheck className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                            <span>{perk}</span>
                                        </li>
                                    ))}
                                </ul>

                                <button
                                    onClick={() => handleSubscribe(tier)}
                                    className={`w-full px-6 py-3 rounded-xl font-medium transition-all ${
                                        tier.popular
                                            ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200'
                                            : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                                    }`}
                                >
                                    Subscribe Now
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Content */}
                <div>
                    <h2 className="text-3xl font-serif mb-6">Recent Content</h2>
                    <div className="grid grid-cols-1 gap-4">
                        {creator.recentPosts.map((post) => (
                            <div 
                                key={post.id}
                                className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="text-5xl flex-shrink-0">{post.thumbnail}</div>
                                    
                                    <div className="flex-1">
                                        <div className="flex items-start justify-between mb-2">
                                            <div>
                                                <h3 className="text-xl font-serif text-gray-900 mb-1">
                                                    {post.title}
                                                    {post.locked && <FiLock className="inline w-4 h-4 ml-2 text-gray-400" />}
                                                </h3>
                                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                                    <span className="px-3 py-1 bg-gray-100 rounded-full font-medium">{post.type}</span>
                                                    <span className="flex items-center gap-1">
                                                        <FiClock className="w-4 h-4" />
                                                        {post.duration || post.readTime || post.pages}
                                                    </span>
                                                    <span>{post.postedDate}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-6 text-sm text-gray-600 mb-4">
                                            {post.views !== undefined && (
                                                <span className="flex items-center gap-1">
                                                    <FiUsers className="w-4 h-4" />
                                                    {post.views} views
                                                </span>
                                            )}
                                            {post.downloads !== undefined && (
                                                <span className="flex items-center gap-1">
                                                    <FiDownload className="w-4 h-4" />
                                                    {post.downloads} downloads
                                                </span>
                                            )}
                                            <span className="flex items-center gap-1">
                                                <FiHeart className="w-4 h-4" />
                                                {post.likes} likes
                                            </span>
                                            <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-medium rounded-full">
                                                {post.requiredTier} tier
                                            </span>
                                        </div>

                                        {post.locked ? (
                                            <div className="flex items-center gap-3 p-4 bg-orange-50 border border-orange-200 rounded-xl">
                                                <FiLock className="w-5 h-5 text-orange-600 flex-shrink-0" />
                                                <p className="text-sm text-orange-800">
                                                    Subscribe to {post.requiredTier} tier or higher to access this content
                                                </p>
                                            </div>
                                        ) : (
                                            <button className="px-6 py-2 bg-black text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-all">
                                                <FiPlay className="inline w-4 h-4 mr-2" />
                                                View Content
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Subscribe Modal */}
            {showSubscribeModal && selectedTier && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => !loading && setShowSubscribeModal(false)} />
                    <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
                        <h3 className="text-2xl font-serif mb-4">Confirm Subscription</h3>
                        
                        <div className="bg-gray-50 rounded-xl p-6 mb-6">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="text-4xl">{creator.avatar}</div>
                                <div>
                                    <p className="font-medium text-gray-900">{creator.name}</p>
                                    <p className="text-sm text-gray-500">{selectedTier.name} Tier</p>
                                </div>
                            </div>
                            
                            <div className="border-t border-gray-200 pt-4">
                                <div className="flex justify-between mb-2">
                                    <span className="text-gray-600">Monthly Price:</span>
                                    <span className="font-medium text-gray-900">{selectedTier.price}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">First Billing:</span>
                                    <span className="font-medium text-gray-900">Today</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                            <p className="text-sm text-blue-800">
                                You&apos;ll be charged {selectedTier.price} every month. Cancel anytime from your dashboard.
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => !loading && setShowSubscribeModal(false)}
                                disabled={loading}
                                className="flex-1 px-6 py-3 bg-gray-100 text-gray-900 rounded-xl font-medium hover:bg-gray-200 transition-all disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmSubscription}
                                disabled={loading}
                                className="flex-1 px-6 py-3 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-all disabled:opacity-50"
                            >
                                {loading ? 'Processing...' : 'Confirm & Pay'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CreatorProfilePage;
