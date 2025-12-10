import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
    FiGrid, FiCreditCard, FiCalendar, FiSettings, FiUsers, 
    FiLock, FiPlay, FiHeart, FiX, FiExternalLink,
    FiDownload, FiCheck, FiAlertCircle, FiMoreVertical
} from 'react-icons/fi';

const MembersDashboard = () => {
    const [activeSection, setActiveSection] = useState('subscriptions');
    const [selectedSubscription, setSelectedSubscription] = useState(null);
    const [showCancelModal, setShowCancelModal] = useState(false);

    // Mock subscriber data
    const subscriberStats = {
        activeSubscriptions: 4,
        totalSpent: '156 DOT',
        memberSince: 'Jan 2024',
        savedContent: 23
    };

    // Mock active subscriptions
    const activeSubscriptions = [
        {
            id: '1',
            creator: 'CodeMaster Pro',
            tier: 'Gold',
            price: '18 DOT',
            priceValue: 18,
            nextBilling: '2024-12-15',
            status: 'active',
            avatar: '⚡',
            perks: ['All content access', 'Weekly mentorship', 'Private Discord'],
            joinedDate: 'Nov 2024'
        },
        {
            id: '2',
            creator: 'Digital Dreams Gallery',
            tier: 'Silver',
            price: '7 DOT',
            priceValue: 7,
            nextBilling: '2024-12-10',
            status: 'active',
            avatar: '🖼️',
            perks: ['Monthly NFT drops', 'Early access', 'Behind-the-scenes'],
            joinedDate: 'Oct 2024'
        },
        {
            id: '3',
            creator: 'Charlie - DeFi Educator',
            tier: 'Premium',
            price: '15 DOT',
            priceValue: 15,
            nextBilling: '2024-12-20',
            status: 'active',
            avatar: '📊',
            perks: ['Market analysis', 'Trading signals', 'Weekly reports'],
            joinedDate: 'Sep 2024'
        },
        {
            id: '4',
            creator: 'Polkadot Ambassador',
            tier: 'Basic',
            price: '6 DOT',
            priceValue: 6,
            nextBilling: '2024-12-08',
            status: 'active',
            avatar: '🎯',
            perks: ['Newsletter', 'Community access', 'Event invites'],
            joinedDate: 'Nov 2024'
        }
    ];

    // Mock payment history
    const paymentHistory = [
        { id: '1', date: '2024-11-15', creator: 'CodeMaster Pro', amount: '18 DOT', status: 'completed' },
        { id: '2', date: '2024-11-10', creator: 'Digital Dreams Gallery', amount: '7 DOT', status: 'completed' },
        { id: '3', date: '2024-11-08', creator: 'Polkadot Ambassador', amount: '6 DOT', status: 'completed' },
        { id: '4', date: '2024-10-20', creator: 'Charlie - DeFi Educator', amount: '15 DOT', status: 'completed' },
        { id: '5', date: '2024-10-15', creator: 'CodeMaster Pro', amount: '18 DOT', status: 'completed' },
        { id: '6', date: '2024-10-10', creator: 'Digital Dreams Gallery', amount: '7 DOT', status: 'completed' }
    ];

    // Mock exclusive content feed
    const exclusiveContent = [
        {
            id: '1',
            creator: 'CodeMaster Pro',
            avatar: '⚡',
            title: 'Advanced Substrate Runtime Development',
            type: 'Video',
            duration: '45 min',
            postedDate: '2 days ago',
            views: 234,
            locked: false,
            thumbnail: '🎬'
        },
        {
            id: '2',
            creator: 'Digital Dreams Gallery',
            avatar: '🖼️',
            title: 'November NFT Collection - Behind the Scenes',
            type: 'Article',
            readTime: '8 min read',
            postedDate: '3 days ago',
            views: 189,
            locked: false,
            thumbnail: '📄'
        },
        {
            id: '3',
            creator: 'Charlie - DeFi Educator',
            avatar: '📊',
            title: 'Q4 Market Analysis & 2025 Predictions',
            type: 'PDF Report',
            pages: '24 pages',
            postedDate: '5 days ago',
            downloads: 156,
            locked: false,
            thumbnail: '📊'
        },
        {
            id: '4',
            creator: 'Polkadot Ambassador',
            avatar: '🎯',
            title: 'Weekly Ecosystem Update #47',
            type: 'Newsletter',
            readTime: '5 min read',
            postedDate: '1 week ago',
            views: 423,
            locked: false,
            thumbnail: '📰'
        },
        {
            id: '5',
            creator: 'Security Sensei',
            avatar: '🛡️',
            title: 'Premium Security Audit Training',
            type: 'Video',
            duration: '90 min',
            postedDate: '1 week ago',
            views: 0,
            locked: true,
            thumbnail: '🔒'
        }
    ];

    const handleCancelSubscription = (subscription) => {
        setSelectedSubscription(subscription);
        setShowCancelModal(true);
    };

    const confirmCancel = () => {
        console.log('Cancelling subscription:', selectedSubscription?.id);
        // TODO: Integrate with smart contract to cancel subscription
        setShowCancelModal(false);
        setSelectedSubscription(null);
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

                    <div className="hidden md:flex items-center gap-8">
                        <Link to="/" className="text-sm font-medium text-gray-600 hover:text-black transition-colors">Campaigns</Link>
                        <Link to="/members" className="text-sm font-medium text-black">Members</Link>
                        <Link to="/about" className="text-sm font-medium text-gray-600 hover:text-black transition-colors">About</Link>
                    </div>

                    <div className="flex items-center gap-4">
                        <Link to="/members/browse" className="text-sm font-medium text-gray-600 hover:text-black transition-colors hidden sm:block">
                            Browse Creators
                        </Link>
                        <Link to="/settings" className="px-6 py-2.5 bg-gray-100 text-gray-900 text-sm font-medium rounded-full hover:bg-gray-200 transition-all hover:shadow-lg hover:-translate-y-0.5">
                            Settings
                        </Link>
                    </div>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-5xl font-serif mb-3 text-gray-900">
                        My Subscriptions
                    </h1>
                    <p className="text-lg text-gray-600">Manage your memberships and access exclusive content</p>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                                <FiUsers className="w-5 h-5 text-blue-600" />
                            </div>
                            <span className="text-sm text-gray-500 uppercase tracking-wide font-medium">Active</span>
                        </div>
                        <p className="text-3xl font-serif text-gray-900">{subscriberStats.activeSubscriptions}</p>
                        <p className="text-sm text-gray-500 mt-1">Subscriptions</p>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center">
                                <FiCreditCard className="w-5 h-5 text-green-600" />
                            </div>
                            <span className="text-sm text-gray-500 uppercase tracking-wide font-medium">Total Spent</span>
                        </div>
                        <p className="text-3xl font-serif text-gray-900">{subscriberStats.totalSpent}</p>
                        <p className="text-sm text-gray-500 mt-1">All time</p>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                                <FiCalendar className="w-5 h-5 text-purple-600" />
                            </div>
                            <span className="text-sm text-gray-500 uppercase tracking-wide font-medium">Member Since</span>
                        </div>
                        <p className="text-3xl font-serif text-gray-900">{subscriberStats.memberSince}</p>
                        <p className="text-sm text-gray-500 mt-1">Community member</p>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center">
                                <FiHeart className="w-5 h-5 text-orange-600" />
                            </div>
                            <span className="text-sm text-gray-500 uppercase tracking-wide font-medium">Saved</span>
                        </div>
                        <p className="text-3xl font-serif text-gray-900">{subscriberStats.savedContent}</p>
                        <p className="text-sm text-gray-500 mt-1">Content items</p>
                    </div>
                </div>

                {/* Section Navigation */}
                <div className="flex gap-2 border-b border-gray-200 mb-8 overflow-x-auto">
                    <button
                        onClick={() => setActiveSection('subscriptions')}
                        className={`px-6 py-3 font-medium text-sm whitespace-nowrap transition-colors border-b-2 ${
                            activeSection === 'subscriptions'
                                ? 'border-black text-black'
                                : 'border-transparent text-gray-500 hover:text-gray-900'
                        }`}
                    >
                        <FiGrid className="inline w-4 h-4 mr-2" />
                        My Subscriptions
                    </button>
                    <button
                        onClick={() => setActiveSection('content')}
                        className={`px-6 py-3 font-medium text-sm whitespace-nowrap transition-colors border-b-2 ${
                            activeSection === 'content'
                                ? 'border-black text-black'
                                : 'border-transparent text-gray-500 hover:text-gray-900'
                        }`}
                    >
                        <FiPlay className="inline w-4 h-4 mr-2" />
                        Exclusive Content
                    </button>
                    <button
                        onClick={() => setActiveSection('payments')}
                        className={`px-6 py-3 font-medium text-sm whitespace-nowrap transition-colors border-b-2 ${
                            activeSection === 'payments'
                                ? 'border-black text-black'
                                : 'border-transparent text-gray-500 hover:text-gray-900'
                        }`}
                    >
                        <FiCreditCard className="inline w-4 h-4 mr-2" />
                        Payment History
                    </button>
                    <button
                        onClick={() => setActiveSection('settings')}
                        className={`px-6 py-3 font-medium text-sm whitespace-nowrap transition-colors border-b-2 ${
                            activeSection === 'settings'
                                ? 'border-black text-black'
                                : 'border-transparent text-gray-500 hover:text-gray-900'
                        }`}
                    >
                        <FiSettings className="inline w-4 h-4 mr-2" />
                        Settings
                    </button>
                </div>

                {/* Active Subscriptions Section */}
                {activeSection === 'subscriptions' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-serif text-gray-900">Active Subscriptions</h2>
                            <Link 
                                to="/members/browse"
                                className="px-4 py-2 bg-black text-white rounded-full text-sm font-medium hover:bg-gray-800 transition-all"
                            >
                                Browse Creators
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {activeSubscriptions.map((sub) => (
                                <div key={sub.id} className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-4">
                                            <div className="text-4xl">{sub.avatar}</div>
                                            <div>
                                                <h3 className="text-lg font-serif text-gray-900">{sub.creator}</h3>
                                                <span className="inline-block px-3 py-1 bg-blue-50 text-blue-600 text-xs font-medium rounded-full">
                                                    {sub.tier}
                                                </span>
                                            </div>
                                        </div>
                                        <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                                            <FiMoreVertical className="w-5 h-5" />
                                        </button>
                                    </div>

                                    <div className="space-y-3 mb-4">
                                        {sub.perks.map((perk, index) => (
                                            <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                                                <FiCheck className="w-4 h-4 text-green-500 flex-shrink-0" />
                                                <span>{perk}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="border-t border-gray-100 pt-4 space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Monthly Price:</span>
                                            <span className="font-medium text-gray-900">{sub.price}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Next Billing:</span>
                                            <span className="font-medium text-gray-900">{sub.nextBilling}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Joined:</span>
                                            <span className="font-medium text-gray-900">{sub.joinedDate}</span>
                                        </div>
                                    </div>

                                    <div className="flex gap-3 mt-6">
                                        <Link
                                            to={`/members/${sub.id}`}
                                            className="flex-1 px-4 py-2 bg-gray-100 text-gray-900 rounded-xl text-sm font-medium hover:bg-gray-200 transition-all text-center"
                                        >
                                            View Profile
                                        </Link>
                                        <button
                                            onClick={() => handleCancelSubscription(sub)}
                                            className="flex-1 px-4 py-2 bg-red-50 text-red-600 rounded-xl text-sm font-medium hover:bg-red-100 transition-all"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Exclusive Content Section */}
                {activeSection === 'content' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-serif text-gray-900">Exclusive Content</h2>
                            <select className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 focus:ring-2 focus:ring-blue-500">
                                <option>All Creators</option>
                                <option>CodeMaster Pro</option>
                                <option>Digital Dreams Gallery</option>
                                <option>Charlie - DeFi Educator</option>
                                <option>Polkadot Ambassador</option>
                            </select>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            {exclusiveContent.map((content) => (
                                <div 
                                    key={content.id} 
                                    className={`bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all ${content.locked ? 'opacity-60' : ''}`}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="text-5xl flex-shrink-0">{content.thumbnail}</div>
                                        
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-4 mb-2">
                                                <div>
                                                    <h3 className="text-lg font-serif text-gray-900 mb-1">
                                                        {content.title}
                                                        {content.locked && <FiLock className="inline w-4 h-4 ml-2 text-gray-400" />}
                                                    </h3>
                                                    <div className="flex items-center gap-3 text-sm text-gray-500">
                                                        <span className="flex items-center gap-1">
                                                            {content.avatar} {content.creator}
                                                        </span>
                                                        <span>•</span>
                                                        <span>{content.postedDate}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                                                <span className="px-3 py-1 bg-gray-100 rounded-full font-medium">{content.type}</span>
                                                <span>{content.duration || content.readTime || content.pages}</span>
                                                {content.views && <span>{content.views} views</span>}
                                                {content.downloads && <span>{content.downloads} downloads</span>}
                                            </div>

                                            {content.locked ? (
                                                <div className="flex items-center gap-2 text-sm text-orange-600 bg-orange-50 px-4 py-2 rounded-lg">
                                                    <FiAlertCircle className="w-4 h-4" />
                                                    <span>Upgrade your subscription to access this content</span>
                                                </div>
                                            ) : (
                                                <div className="flex gap-3">
                                                    <button className="px-4 py-2 bg-black text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-all">
                                                        <FiPlay className="inline w-4 h-4 mr-2" />
                                                        View Content
                                                    </button>
                                                    <button className="px-4 py-2 bg-gray-100 text-gray-900 rounded-xl text-sm font-medium hover:bg-gray-200 transition-all">
                                                        <FiDownload className="inline w-4 h-4 mr-2" />
                                                        Download
                                                    </button>
                                                    <button className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                                                        <FiHeart className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Payment History Section */}
                {activeSection === 'payments' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-2xl font-serif text-gray-900">Payment History</h2>
                            <button className="px-4 py-2 bg-gray-100 text-gray-900 rounded-xl text-sm font-medium hover:bg-gray-200 transition-all">
                                <FiDownload className="inline w-4 h-4 mr-2" />
                                Export
                            </button>
                        </div>

                        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b border-gray-200">
                                        <tr>
                                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Creator</th>
                                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {paymentHistory.map((payment) => (
                                            <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{payment.date}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{payment.creator}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{payment.amount}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="px-3 py-1 bg-green-50 text-green-600 text-xs font-medium rounded-full">
                                                        <FiCheck className="inline w-3 h-3 mr-1" />
                                                        {payment.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                    <button className="text-blue-600 hover:text-blue-800 transition-colors">
                                                        <FiExternalLink className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* Settings Section */}
                {activeSection === 'settings' && (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-serif text-gray-900">Subscription Settings</h2>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="bg-white border border-gray-200 rounded-2xl p-6">
                                <h3 className="text-lg font-serif text-gray-900 mb-4">Payment Method</h3>
                                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl mb-4">
                                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold">
                                        W
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">Polkadot Wallet</p>
                                        <p className="text-sm text-gray-500">5GrwvaE...HGKutQY</p>
                                    </div>
                                </div>
                                <button className="w-full px-4 py-2 bg-gray-100 text-gray-900 rounded-xl text-sm font-medium hover:bg-gray-200 transition-all">
                                    Change Wallet
                                </button>
                            </div>

                            <div className="bg-white border border-gray-200 rounded-2xl p-6">
                                <h3 className="text-lg font-serif text-gray-900 mb-4">Notifications</h3>
                                <div className="space-y-4">
                                    <label className="flex items-center justify-between">
                                        <span className="text-sm text-gray-700">New content from creators</span>
                                        <input type="checkbox" defaultChecked className="w-5 h-5 text-blue-600 rounded" />
                                    </label>
                                    <label className="flex items-center justify-between">
                                        <span className="text-sm text-gray-700">Payment reminders</span>
                                        <input type="checkbox" defaultChecked className="w-5 h-5 text-blue-600 rounded" />
                                    </label>
                                    <label className="flex items-center justify-between">
                                        <span className="text-sm text-gray-700">Creator announcements</span>
                                        <input type="checkbox" className="w-5 h-5 text-blue-600 rounded" />
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Cancel Subscription Modal */}
            {showCancelModal && selectedSubscription && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowCancelModal(false)} />
                    <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-2xl font-serif text-gray-900">Cancel Subscription?</h3>
                            <button 
                                onClick={() => setShowCancelModal(false)}
                                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <FiX className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="mb-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="text-3xl">{selectedSubscription.avatar}</div>
                                <div>
                                    <p className="font-medium text-gray-900">{selectedSubscription.creator}</p>
                                    <p className="text-sm text-gray-500">{selectedSubscription.tier} - {selectedSubscription.price}/month</p>
                                </div>
                            </div>
                            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
                                <p className="text-sm text-orange-800">
                                    <FiAlertCircle className="inline w-4 h-4 mr-2" />
                                    You&apos;ll lose access to exclusive content and perks when your current billing period ends on {selectedSubscription.nextBilling}.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowCancelModal(false)}
                                className="flex-1 px-6 py-3 bg-gray-100 text-gray-900 rounded-xl font-medium hover:bg-gray-200 transition-all"
                            >
                                Keep Subscription
                            </button>
                            <button
                                onClick={confirmCancel}
                                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-all"
                            >
                                Cancel Subscription
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MembersDashboard;
