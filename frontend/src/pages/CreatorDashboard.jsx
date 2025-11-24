import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useTheme } from '../context/ThemeContext';
import { useWallet } from '../contexts/WalletContext';
import { useMembership } from '../contexts/MembershipContext';
import { Link } from 'react-router-dom';
import { 
    FiUsers, 
    FiDollarSign, 
    FiTrendingUp, 
    FiGrid, 
    FiSettings, 
    FiPlus, 
    FiMenu, 
    FiX,
    FiEdit,
    FiEye,
    FiHeart,
    FiMessageCircle,
    FiBarChart2,
    FiCalendar,
    FiClock,
    FiArrowUp,
    FiArrowDown,
    FiSearch,
    FiDownload,
    FiSend,
    FiImage,
    FiTrash2,
    FiCheck,
    FiSave,
    FiBell,
    FiCreditCard
} from 'react-icons/fi';
import '../styles/light-theme.css';

const CreatorDashboard = () => {
    const { setLightTheme } = useTheme();
    const { selectedAccount, connectWallet } = useWallet();
    const { creatorStats, isLoading, fetchCreatorStats } = useMembership();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [activeSection, setActiveSection] = useState('overview');
    
    // Modal states
    const [showPostModal, setShowPostModal] = useState(false);
    const [showTierModal, setShowTierModal] = useState(false);
    const [showMessageModal, setShowMessageModal] = useState(false);
    const [editingPost, setEditingPost] = useState(null);
    const [editingTier, setEditingTier] = useState(null);
    
    // Search and filter states
    const [memberSearch, setMemberSearch] = useState('');
    const [memberFilter, setMemberFilter] = useState('all');
    
    // Form states
    const [postForm, setPostForm] = useState({ title: '', content: '', tier: 'all', media: null });
    const [tierForm, setTierForm] = useState({ name: '', price: '', benefits: [''] });
    const [messageForm, setMessageForm] = useState({ recipients: 'all', subject: '', message: '' });
    const [settingsForm, setSettingsForm] = useState({ displayName: '', bio: '', notifications: true });
    
    // Toast notification
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    useEffect(() => {
        setLightTheme();
    }, [setLightTheme]);

    // Fetch creator stats when account is connected
    useEffect(() => {
        if (selectedAccount) {
            fetchCreatorStats();
        }
    }, [selectedAccount, fetchCreatorStats]);

    // Initialize settings form from account
    useEffect(() => {
        if (selectedAccount?.meta?.name) {
            setSettingsForm(prev => ({ ...prev, displayName: selectedAccount.meta.name }));
        }
    }, [selectedAccount]);

    // Toast helper
    const showToast = (message, type = 'success') => {
        setToast({ show: true, message, type });
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
    };

    // Post handlers
    const handleCreatePost = (e) => {
        e.preventDefault();
        // TODO: Integrate with smart contract
        showToast('Post created successfully!');
        setShowPostModal(false);
        setPostForm({ title: '', content: '', tier: 'all', media: null });
    };

    const handleEditPost = (post) => {
        setEditingPost(post);
        setPostForm({ title: post.title, content: '', tier: 'all', media: null });
        setShowPostModal(true);
    };

    const handleUpdatePost = (e) => {
        e.preventDefault();
        // TODO: Integrate with smart contract
        showToast('Post updated successfully!');
        setShowPostModal(false);
        setEditingPost(null);
        setPostForm({ title: '', content: '', tier: 'all', media: null });
    };

    // Tier handlers
    const handleCreateTier = (e) => {
        e.preventDefault();
        // TODO: Integrate with smart contract
        showToast('Tier created successfully!');
        setShowTierModal(false);
        setTierForm({ name: '', price: '', benefits: [''] });
    };

    const handleEditTier = (tier) => {
        setEditingTier(tier);
        setTierForm({ name: tier.name, price: tier.price, benefits: tier.benefits });
        setShowTierModal(true);
    };

    const handleUpdateTier = (e) => {
        e.preventDefault();
        // TODO: Integrate with smart contract
        showToast('Tier updated successfully!');
        setShowTierModal(false);
        setEditingTier(null);
        setTierForm({ name: '', price: '', benefits: [''] });
    };

    const handleAddBenefit = () => {
        setTierForm(prev => ({ ...prev, benefits: [...prev.benefits, ''] }));
    };

    const handleRemoveBenefit = (index) => {
        setTierForm(prev => ({ ...prev, benefits: prev.benefits.filter((_, i) => i !== index) }));
    };

    const handleBenefitChange = (index, value) => {
        setTierForm(prev => ({
            ...prev,
            benefits: prev.benefits.map((b, i) => i === index ? value : b)
        }));
    };

    // Message handlers
    const handleSendMessage = (e) => {
        e.preventDefault();
        // TODO: Integrate with backend notification system
        showToast('Message sent successfully!');
        setShowMessageModal(false);
        setMessageForm({ recipients: 'all', subject: '', message: '' });
    };

    // Settings handlers
    const handleSaveSettings = (e) => {
        e.preventDefault();
        // TODO: Save to backend/contract
        showToast('Settings saved successfully!');
    };

    // Filter members
    const filteredMembers = creatorStats.recentMembers.filter(member => {
        const matchesSearch = member.name.toLowerCase().includes(memberSearch.toLowerCase());
        const matchesFilter = memberFilter === 'all' || member.tier.toLowerCase() === memberFilter.toLowerCase();
        return matchesSearch && matchesFilter;
    });

    const StatCard = ({ icon: Icon, label, value, change, prefix = '', suffix = '' }) => {
        StatCard.propTypes = {
            icon: PropTypes.elementType.isRequired,
            label: PropTypes.string.isRequired,
            value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
            change: PropTypes.number.isRequired,
            prefix: PropTypes.string,
            suffix: PropTypes.string
        };
        
        return (
        <div className="bg-white p-6 rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all">
            <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center">
                    <Icon className="w-6 h-6 text-gray-900" />
                </div>
                <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-sm font-medium ${
                    change >= 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                }`}>
                    {change >= 0 ? <FiArrowUp className="w-4 h-4" /> : <FiArrowDown className="w-4 h-4" />}
                    {Math.abs(change)}%
                </div>
            </div>
            <div className="text-sm text-gray-600 mb-1">{label}</div>
            <div className="text-3xl font-serif font-bold text-gray-900">
                {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
            </div>
        </div>
        );
    };

    // Modal Component
    const Modal = ({ isOpen, onClose, title, children }) => {
        Modal.propTypes = {
            isOpen: PropTypes.bool.isRequired,
            onClose: PropTypes.func.isRequired,
            title: PropTypes.string.isRequired,
            children: PropTypes.node.isRequired
        };

        if (!isOpen) return null;

        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
                <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                    <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                        <h2 className="text-2xl font-serif font-bold text-gray-900">{title}</h2>
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                            <FiX className="w-6 h-6" />
                        </button>
                    </div>
                    <div className="p-6">
                        {children}
                    </div>
                </div>
            </div>
        );
    };

    // Render section content
    const renderSectionContent = () => {
        switch(activeSection) {
            case 'overview':
                return renderOverviewSection();
            case 'members':
                return renderMembersSection();
            case 'posts':
                return renderPostsSection();
            case 'tiers':
                return renderTiersSection();
            case 'analytics':
                return renderAnalyticsSection();
            case 'settings':
                return renderSettingsSection();
            default:
                return renderOverviewSection();
        }
    };

    const renderOverviewSection = () => (
        <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
                <StatCard 
                    icon={FiUsers}
                    label="Total Members"
                    value={creatorStats.totalMembers}
                    change={creatorStats.membersChange}
                />
                <StatCard 
                    icon={FiDollarSign}
                    label="Monthly Revenue"
                    value={creatorStats.monthlyRevenue}
                    change={creatorStats.revenueChange}
                    prefix="$"
                />
                <StatCard 
                    icon={FiTrendingUp}
                    label="Active Subscriptions"
                    value={creatorStats.activeSubscriptions}
                    change={creatorStats.subscriptionsChange}
                />
                <StatCard 
                    icon={FiHeart}
                    label="Engagement Rate"
                    value={creatorStats.engagement}
                    change={creatorStats.engagementChange}
                    suffix="%"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-serif font-bold text-gray-900">Recent Members</h2>
                        <button onClick={() => setActiveSection('members')} className="text-sm font-medium text-gray-600 hover:text-black transition-colors">
                            View All →
                        </button>
                    </div>
                    <div className="space-y-4">
                        {creatorStats.recentMembers.slice(0, 5).map((member) => (
                            <div key={member.id} className="flex items-center justify-between p-4 hover:bg-gray-50 rounded-xl transition-colors border border-transparent hover:border-gray-200">
                                <div className="flex items-center gap-4">
                                    <img 
                                        src={member.avatar} 
                                        alt={member.name}
                                        className="w-12 h-12 rounded-full object-cover grayscale hover:grayscale-0 transition-all"
                                    />
                                    <div>
                                        <p className="font-semibold text-gray-900">{member.name}</p>
                                        <div className="flex items-center gap-2 text-sm text-gray-500">
                                            <span>{member.tier} Tier</span>
                                            <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                            <span>{member.joined}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-semibold text-green-600">+${member.amount}</div>
                                    <div className="text-xs text-gray-500">DOT</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h2 className="text-xl font-serif font-bold text-gray-900 mb-6">Quick Actions</h2>
                    <div className="space-y-3">
                        <button onClick={() => setShowPostModal(true)} className="w-full flex items-center gap-3 px-4 py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition-all font-medium text-sm">
                            <FiPlus className="w-5 h-5" />
                            Create Post
                        </button>
                        <button onClick={() => setShowMessageModal(true)} className="w-full flex items-center gap-3 px-4 py-3 bg-gray-100 text-gray-900 rounded-xl hover:bg-gray-200 transition-all font-medium text-sm">
                            <FiUsers className="w-5 h-5" />
                            Message Members
                        </button>
                        <button onClick={() => setActiveSection('settings')} className="w-full flex items-center gap-3 px-4 py-3 bg-gray-100 text-gray-900 rounded-xl hover:bg-gray-200 transition-all font-medium text-sm">
                            <FiEdit className="w-5 h-5" />
                            Edit Profile
                        </button>
                        <button onClick={() => setActiveSection('analytics')} className="w-full flex items-center gap-3 px-4 py-3 bg-gray-100 text-gray-900 rounded-xl hover:bg-gray-200 transition-all font-medium text-sm">
                            <FiBarChart2 className="w-5 h-5" />
                            View Analytics
                        </button>
                    </div>

                    <div className="mt-6 pt-6 border-t border-gray-200">
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                            <FiCalendar className="w-4 h-4" />
                            <span className="font-medium">Upcoming</span>
                        </div>
                        <div className="space-y-3">
                            <div className="p-3 bg-[#FF9500]/10 rounded-lg border border-[#FF9500]/20">
                                <div className="flex items-start gap-3">
                                    <div className="w-2 h-2 bg-[#FF9500] rounded-full mt-1.5"></div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">Monthly Q&A</p>
                                        <p className="text-xs text-gray-500 mt-0.5">Tomorrow at 3:00 PM</p>
                                    </div>
                                </div>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-start gap-3">
                                    <div className="w-2 h-2 bg-gray-400 rounded-full mt-1.5"></div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">New Tutorial Release</p>
                                        <p className="text-xs text-gray-500 mt-0.5">Friday at 9:00 AM</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );

    const renderMembersSection = () => (
        <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex-1 max-w-md">
                    <div className="relative">
                        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search members..."
                            value={memberSearch}
                            onChange={(e) => setMemberSearch(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                        />
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <select
                        value={memberFilter}
                        onChange={(e) => setMemberFilter(e.target.value)}
                        className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                    >
                        <option value="all">All Tiers</option>
                        <option value="bronze">Bronze</option>
                        <option value="silver">Silver</option>
                        <option value="gold">Gold</option>
                    </select>
                    <button className="flex items-center gap-2 px-4 py-3 bg-gray-100 text-gray-900 rounded-xl hover:bg-gray-200 transition-all font-medium">
                        <FiDownload className="w-5 h-5" />
                        Export
                    </button>
                    <button onClick={() => setShowMessageModal(true)} className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition-all font-medium">
                        <FiSend className="w-5 h-5" />
                        Message All
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-gray-200 bg-gray-50">
                            <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Member</th>
                            <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Tier</th>
                            <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Joined</th>
                            <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Contribution</th>
                            <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Status</th>
                            <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredMembers.map((member) => (
                            <tr key={member.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <img src={member.avatar} alt={member.name} className="w-10 h-10 rounded-full object-cover" />
                                        <div>
                                            <p className="font-semibold text-gray-900">{member.name}</p>
                                            <p className="text-sm text-gray-500">@{member.name.toLowerCase().replace(' ', '')}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                                        {member.tier}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600">{member.joined}</td>
                                <td className="px-6 py-4">
                                    <span className="font-semibold text-green-600">${member.amount}</span>
                                    <span className="text-sm text-gray-500"> DOT</span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center px-3 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium border border-green-200">
                                        Active
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <button onClick={() => { setMessageForm(prev => ({ ...prev, recipients: member.id })); setShowMessageModal(true); }} className="text-gray-600 hover:text-black transition-colors">
                                        <FiMessageCircle className="w-5 h-5" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderPostsSection = () => (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-serif font-bold text-gray-900">All Posts</h2>
                <button onClick={() => setShowPostModal(true)} className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition-all font-medium">
                    <FiPlus className="w-5 h-5" />
                    Create Post
                </button>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-gray-200 bg-gray-50">
                            <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Title</th>
                            <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Date</th>
                            <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Views</th>
                            <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Engagement</th>
                            <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Status</th>
                            <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {creatorStats.recentPosts.map((post) => (
                            <tr key={post.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4">
                                    <p className="font-medium text-gray-900">{post.title}</p>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2 text-sm text-gray-500">
                                        <FiClock className="w-4 h-4" />
                                        {post.date}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2 text-sm text-gray-700">
                                        <FiEye className="w-4 h-4" />
                                        {post.views.toLocaleString()}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-4 text-sm text-gray-700">
                                        <div className="flex items-center gap-1">
                                            <FiHeart className="w-4 h-4" />
                                            {post.likes}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <FiMessageCircle className="w-4 h-4" />
                                            {post.comments}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                        post.published 
                                            ? 'bg-green-50 text-green-700 border border-green-200' 
                                            : 'bg-gray-100 text-gray-700 border border-gray-200'
                                    }`}>
                                        {post.published ? 'Published' : 'Draft'}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => handleEditPost(post)} className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                                            <FiEdit className="w-4 h-4" />
                                        </button>
                                        <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                                            <FiEye className="w-4 h-4" />
                                        </button>
                                        <button className="p-2 text-red-400 hover:text-red-600 transition-colors">
                                            <FiTrash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderTiersSection = () => (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-serif font-bold text-gray-900">Membership Tiers</h2>
                <button onClick={() => setShowTierModal(true)} className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition-all font-medium">
                    <FiPlus className="w-5 h-5" />
                    Create Tier
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {creatorStats.tiers.map((tier) => (
                    <div key={tier.id} className="bg-white p-6 rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h3 className="text-xl font-serif font-bold text-gray-900 mb-1">{tier.name}</h3>
                                <p className="text-2xl font-bold text-gray-900">${tier.price}<span className="text-sm text-gray-500 font-normal">/month</span></p>
                            </div>
                            <button onClick={() => handleEditTier(tier)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <FiEdit className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b border-gray-200">
                            <div>
                                <div className="text-sm text-gray-600 mb-1">Members</div>
                                <div className="text-xl font-bold text-gray-900">{tier.members}</div>
                            </div>
                            <div>
                                <div className="text-sm text-gray-600 mb-1">Revenue</div>
                                <div className="text-xl font-bold text-green-600">${tier.revenue.toLocaleString()}</div>
                            </div>
                        </div>
                        <div>
                            <div className="text-sm font-medium text-gray-700 mb-2">Benefits</div>
                            <ul className="space-y-2">
                                {tier.benefits.map((benefit, i) => (
                                    <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                                        <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-1.5 flex-shrink-0"></div>
                                        {benefit}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderAnalyticsSection = () => (
        <div className="space-y-6">
            <h2 className="text-2xl font-serif font-bold text-gray-900">Analytics & Insights</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard icon={FiDollarSign} label="Total Revenue" value={creatorStats.monthlyRevenue * 12} change={18} prefix="$" />
                <StatCard icon={FiUsers} label="Total Members" value={creatorStats.totalMembers} change={creatorStats.membersChange} />
                <StatCard icon={FiTrendingUp} label="Growth Rate" value={15} change={8} suffix="%" />
                <StatCard icon={FiHeart} label="Avg Engagement" value={creatorStats.engagement} change={creatorStats.engagementChange} suffix="%" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-serif font-bold text-gray-900 mb-4">Revenue Breakdown by Tier</h3>
                    <div className="space-y-4">
                        {creatorStats.tiers.map((tier) => {
                            const totalRevenue = creatorStats.tiers.reduce((sum, t) => sum + t.revenue, 0);
                            const percentage = ((tier.revenue / totalRevenue) * 100).toFixed(1);
                            return (
                                <div key={tier.id}>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-gray-700">{tier.name} Tier</span>
                                        <span className="text-sm font-semibold text-gray-900">${tier.revenue.toLocaleString()} ({percentage}%)</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div className="bg-black rounded-full h-2 transition-all" style={{ width: `${percentage}%` }}></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-serif font-bold text-gray-900 mb-4">Member Growth (Last 6 Months)</h3>
                    <div className="space-y-4">
                        {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((month, idx) => {
                            const value = 50 + (idx * 15) + Math.floor(Math.random() * 20);
                            const maxValue = 150;
                            const percentage = (value / maxValue) * 100;
                            return (
                                <div key={month}>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-gray-700">{month}</span>
                                        <span className="text-sm font-semibold text-gray-900">+{value} members</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div className="bg-[#FF9500] rounded-full h-2 transition-all" style={{ width: `${percentage}%` }}></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-lg font-serif font-bold text-gray-900 mb-4">Top Performing Posts</h3>
                <div className="space-y-3">
                    {creatorStats.recentPosts.sort((a, b) => b.views - a.views).slice(0, 5).map((post, idx) => (
                        <div key={post.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-4">
                                <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center font-bold text-sm">
                                    {idx + 1}
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">{post.title}</p>
                                    <p className="text-sm text-gray-500">{post.date}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-6 text-sm">
                                <div className="flex items-center gap-2 text-gray-700">
                                    <FiEye className="w-4 h-4" />
                                    {post.views.toLocaleString()}
                                </div>
                                <div className="flex items-center gap-2 text-gray-700">
                                    <FiHeart className="w-4 h-4" />
                                    {post.likes}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderSettingsSection = () => (
        <div className="max-w-3xl space-y-6">
            <h2 className="text-2xl font-serif font-bold text-gray-900">Settings</h2>
            
            <form onSubmit={handleSaveSettings} className="space-y-6">
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-serif font-bold text-gray-900 mb-4">Profile Information</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Display Name</label>
                            <input
                                type="text"
                                value={settingsForm.displayName}
                                onChange={(e) => setSettingsForm(prev => ({ ...prev, displayName: e.target.value }))}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                                placeholder="Your display name"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
                            <textarea
                                value={settingsForm.bio}
                                onChange={(e) => setSettingsForm(prev => ({ ...prev, bio: e.target.value }))}
                                rows={4}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                                placeholder="Tell your members about yourself..."
                            />
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-serif font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <FiBell className="w-5 h-5" />
                        Notifications
                    </h3>
                    <div className="space-y-4">
                        <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                            <div>
                                <p className="font-medium text-gray-900">New Member Notifications</p>
                                <p className="text-sm text-gray-500">Get notified when someone joins your community</p>
                            </div>
                            <input
                                type="checkbox"
                                checked={settingsForm.notifications}
                                onChange={(e) => setSettingsForm(prev => ({ ...prev, notifications: e.target.checked }))}
                                className="w-5 h-5 text-black border-gray-300 rounded focus:ring-black"
                            />
                        </label>
                        <label className="flex items-center justify-between p-4 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                            <div>
                                <p className="font-medium text-gray-900">Revenue Updates</p>
                                <p className="text-sm text-gray-500">Weekly revenue reports and insights</p>
                            </div>
                            <input
                                type="checkbox"
                                checked={true}
                                onChange={() => {}}
                                className="w-5 h-5 text-black border-gray-300 rounded focus:ring-black"
                            />
                        </label>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-serif font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <FiCreditCard className="w-5 h-5" />
                        Billing & Payouts
                    </h3>
                    <div className="space-y-4">
                        <div className="p-4 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-600 mb-2">Connected Wallet</p>
                            <p className="font-mono text-sm font-medium text-gray-900">
                                {selectedAccount?.address ? `${selectedAccount.address.slice(0, 10)}...${selectedAccount.address.slice(-8)}` : 'Not connected'}
                            </p>
                        </div>
                        <button type="button" className="w-full px-4 py-3 bg-gray-100 text-gray-900 rounded-xl hover:bg-gray-200 transition-all font-medium">
                            Change Payout Wallet
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button type="submit" className="flex items-center gap-2 px-8 py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition-all font-medium">
                        <FiSave className="w-5 h-5" />
                        Save Changes
                    </button>
                    <button type="button" className="px-8 py-3 bg-gray-100 text-gray-900 rounded-xl hover:bg-gray-200 transition-all font-medium">
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
            {/* Top Navigation */}
            <nav className="sticky top-0 w-full z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
                <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="lg:hidden p-2 text-gray-700 hover:text-black transition-colors"
                        >
                            {sidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
                        </button>
                        <Link to="/" className="flex items-center gap-2 group">
                            <div className="w-9 h-9 bg-black text-white rounded-full flex items-center justify-center font-serif text-lg font-bold group-hover:scale-105 transition-transform">
                                D
                            </div>
                            <span className="font-serif text-xl tracking-tight hidden sm:block">Creator Studio</span>
                        </Link>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-black transition-colors">
                            View Profile
                        </button>
                        <button onClick={() => setShowPostModal(true)} className="px-6 py-2.5 bg-black text-white text-sm font-semibold rounded-full hover:bg-gray-800 transition-all hover:shadow-lg">
                            <FiPlus className="inline-block mr-1.5 -mt-0.5" />
                            New Post
                        </button>
                    </div>
                </div>
            </nav>

            <div className="flex">
                {/* Sidebar */}
                <aside className={`fixed lg:sticky top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-white border-r border-gray-200 z-40 transition-transform duration-300 ${
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                }`}>
                    <div className="p-6 space-y-1">
                        <button
                            onClick={() => setActiveSection('overview')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                                activeSection === 'overview' 
                                    ? 'bg-black text-white' 
                                    : 'text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                            <FiGrid className="w-5 h-5" />
                            Overview
                        </button>
                        <button
                            onClick={() => setActiveSection('members')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                                activeSection === 'members' 
                                    ? 'bg-black text-white' 
                                    : 'text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                            <FiUsers className="w-5 h-5" />
                            Members
                        </button>
                        <button
                            onClick={() => setActiveSection('posts')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                                activeSection === 'posts' 
                                    ? 'bg-black text-white' 
                                    : 'text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                            <FiEdit className="w-5 h-5" />
                            Posts
                        </button>
                        <button
                            onClick={() => setActiveSection('tiers')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                                activeSection === 'tiers' 
                                    ? 'bg-black text-white' 
                                    : 'text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                            <FiDollarSign className="w-5 h-5" />
                            Tiers
                        </button>
                        <button
                            onClick={() => setActiveSection('analytics')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                                activeSection === 'analytics' 
                                    ? 'bg-black text-white' 
                                    : 'text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                            <FiBarChart2 className="w-5 h-5" />
                            Analytics
                        </button>
                        <button
                            onClick={() => setActiveSection('settings')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                                activeSection === 'settings' 
                                    ? 'bg-black text-white' 
                                    : 'text-gray-600 hover:bg-gray-100'
                            }`}
                        >
                            <FiSettings className="w-5 h-5" />
                            Settings
                        </button>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1600px]">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-gray-900 mb-2">
                            {activeSection === 'overview' && `Good morning${selectedAccount?.meta?.name ? `, ${selectedAccount.meta.name}` : ''}`}
                            {activeSection === 'members' && 'Members'}
                            {activeSection === 'posts' && 'Posts'}
                            {activeSection === 'tiers' && 'Membership Tiers'}
                            {activeSection === 'analytics' && 'Analytics'}
                            {activeSection === 'settings' && 'Settings'}
                        </h1>
                        <p className="text-gray-600">
                            {!selectedAccount && "Connect your wallet to view your creator dashboard"}
                            {selectedAccount && activeSection === 'overview' && "Here's what's happening with your community today"}
                            {selectedAccount && activeSection === 'members' && "Manage your community members"}
                            {selectedAccount && activeSection === 'posts' && "Create and manage your content"}
                            {selectedAccount && activeSection === 'tiers' && "Configure your membership tiers"}
                            {selectedAccount && activeSection === 'analytics' && "Track your performance metrics"}
                            {selectedAccount && activeSection === 'settings' && "Manage your account settings"}
                        </p>
                    </div>

                    {/* Wallet Connection Required */}
                    {!selectedAccount && (
                        <div className="bg-white p-12 rounded-xl border border-gray-200 text-center mb-8">
                            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FiUsers className="w-10 h-10 text-gray-400" />
                            </div>
                            <h2 className="text-2xl font-serif font-bold text-gray-900 mb-2">
                                Connect Your Wallet
                            </h2>
                            <p className="text-gray-600 mb-6 max-w-md mx-auto">
                                Connect your wallet to access your creator dashboard and manage your community
                            </p>
                            <button 
                                onClick={connectWallet}
                                className="px-8 py-3 bg-black text-white rounded-full font-semibold hover:bg-gray-800 transition-all hover:shadow-lg"
                            >
                                Connect Wallet
                            </button>
                        </div>
                    )}

                    {/* Loading State */}
                    {selectedAccount && isLoading && (
                        <div className="flex justify-center items-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
                        </div>
                    )}

                    {/* Section Content */}
                    {selectedAccount && !isLoading && renderSectionContent()}
                </main>
            </div>

            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-30 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                ></div>
            )}

            {/* Post Creation/Edit Modal */}
            <Modal isOpen={showPostModal} onClose={() => { setShowPostModal(false); setEditingPost(null); }} title={editingPost ? 'Edit Post' : 'Create New Post'}>
                <form onSubmit={editingPost ? handleUpdatePost : handleCreatePost} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Post Title</label>
                        <input
                            type="text"
                            value={postForm.title}
                            onChange={(e) => setPostForm(prev => ({ ...prev, title: e.target.value }))}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                            placeholder="Enter post title..."
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
                        <textarea
                            value={postForm.content}
                            onChange={(e) => setPostForm(prev => ({ ...prev, content: e.target.value }))}
                            rows={8}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                            placeholder="Write your post content..."
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Tier Access</label>
                        <select
                            value={postForm.tier}
                            onChange={(e) => setPostForm(prev => ({ ...prev, tier: e.target.value }))}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                        >
                            <option value="all">All Members</option>
                            {creatorStats.tiers.map((tier) => (
                                <option key={tier.id} value={tier.id}>{tier.name} Tier & Above</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Media (Optional)</label>
                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-gray-400 transition-colors cursor-pointer">
                            <FiImage className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                            <p className="text-sm text-gray-600">Click to upload images or videos</p>
                            <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF or MP4 up to 10MB</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 pt-4">
                        <button type="submit" className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition-all font-medium">
                            <FiCheck className="w-5 h-5" />
                            {editingPost ? 'Update Post' : 'Publish Post'}
                        </button>
                        <button type="button" onClick={() => { setShowPostModal(false); setEditingPost(null); }} className="px-6 py-3 bg-gray-100 text-gray-900 rounded-xl hover:bg-gray-200 transition-all font-medium">
                            Cancel
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Tier Creation/Edit Modal */}
            <Modal isOpen={showTierModal} onClose={() => { setShowTierModal(false); setEditingTier(null); }} title={editingTier ? 'Edit Tier' : 'Create New Tier'}>
                <form onSubmit={editingTier ? handleUpdateTier : handleCreateTier} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Tier Name</label>
                        <input
                            type="text"
                            value={tierForm.name}
                            onChange={(e) => setTierForm(prev => ({ ...prev, name: e.target.value }))}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                            placeholder="e.g., Bronze, Silver, Gold"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Price (DOT)</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                            <input
                                type="number"
                                value={tierForm.price}
                                onChange={(e) => setTierForm(prev => ({ ...prev, price: e.target.value }))}
                                className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                                placeholder="0.00"
                                step="0.01"
                                required
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Benefits</label>
                        <div className="space-y-3">
                            {tierForm.benefits.map((benefit, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={benefit}
                                        onChange={(e) => handleBenefitChange(index, e.target.value)}
                                        className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                                        placeholder="Enter a benefit..."
                                        required
                                    />
                                    {tierForm.benefits.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveBenefit(index)}
                                            className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                                        >
                                            <FiTrash2 className="w-5 h-5" />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                        <button
                            type="button"
                            onClick={handleAddBenefit}
                            className="mt-3 flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-black transition-colors"
                        >
                            <FiPlus className="w-4 h-4" />
                            Add Another Benefit
                        </button>
                    </div>
                    <div className="flex items-center gap-4 pt-4">
                        <button type="submit" className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition-all font-medium">
                            <FiCheck className="w-5 h-5" />
                            {editingTier ? 'Update Tier' : 'Create Tier'}
                        </button>
                        <button type="button" onClick={() => { setShowTierModal(false); setEditingTier(null); }} className="px-6 py-3 bg-gray-100 text-gray-900 rounded-xl hover:bg-gray-200 transition-all font-medium">
                            Cancel
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Message Members Modal */}
            <Modal isOpen={showMessageModal} onClose={() => setShowMessageModal(false)} title="Message Members">
                <form onSubmit={handleSendMessage} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Recipients</label>
                        <select
                            value={messageForm.recipients}
                            onChange={(e) => setMessageForm(prev => ({ ...prev, recipients: e.target.value }))}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                        >
                            <option value="all">All Members</option>
                            {creatorStats.tiers.map((tier) => (
                                <option key={tier.id} value={tier.id}>{tier.name} Tier Members</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                        <input
                            type="text"
                            value={messageForm.subject}
                            onChange={(e) => setMessageForm(prev => ({ ...prev, subject: e.target.value }))}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                            placeholder="Message subject..."
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                        <textarea
                            value={messageForm.message}
                            onChange={(e) => setMessageForm(prev => ({ ...prev, message: e.target.value }))}
                            rows={6}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
                            placeholder="Write your message..."
                            required
                        />
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600">
                            <strong>Note:</strong> This message will be sent to {messageForm.recipients === 'all' ? 'all members' : 'members of the selected tier'}
                        </p>
                    </div>
                    <div className="flex items-center gap-4 pt-4">
                        <button type="submit" className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition-all font-medium">
                            <FiSend className="w-5 h-5" />
                            Send Message
                        </button>
                        <button type="button" onClick={() => setShowMessageModal(false)} className="px-6 py-3 bg-gray-100 text-gray-900 rounded-xl hover:bg-gray-200 transition-all font-medium">
                            Cancel
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Toast Notification */}
            {toast.show && (
                <div className="fixed bottom-8 right-8 z-50 animate-slide-up">
                    <div className={`flex items-center gap-3 px-6 py-4 rounded-xl shadow-lg ${
                        toast.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
                    }`}>
                        <FiCheck className="w-5 h-5" />
                        <p className="font-medium">{toast.message}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CreatorDashboard;
