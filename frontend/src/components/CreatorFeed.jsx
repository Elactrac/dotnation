import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useWallet } from '../contexts/WalletContext';
import { useApi } from '../contexts/ApiContext';
import axios from 'axios';
import '../styles/light-theme.css';

const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

const CreatorFeed = () => {
    const { creatorId } = useParams();
    const { setLightTheme } = useTheme();
    const { selectedAccount } = useWallet();
    const { api } = useApi();

    const [creator, setCreator] = useState(null);
    const [posts, setPosts] = useState([]);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [loading, setLoading] = useState(false);
    const [unlockingPostId, setUnlockingPostId] = useState(null);

    useEffect(() => {
        setLightTheme();
        loadCreatorData();
        loadFeed();
        checkSubscription();
    }, [creatorId, selectedAccount]);

    const loadCreatorData = () => {
        // Mock creator data
        const creators = {
            '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY': {
                name: 'Alice - Tech Creator',
                description: 'Weekly deep dives into Polkadot and Web3 development',
                price: '10000000000000', // 10 DOT in smallest unit
                subscribers: 142,
                avatar: '👩‍💻'
            },
            '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty': {
                name: 'Bob - NFT Artist',
                description: 'Exclusive NFT drops and behind-the-scenes content',
                price: '5000000000000', // 5 DOT
                subscribers: 89,
                avatar: '🎨'
            }
        };
        setCreator(creators[creatorId] || null);
    };

    const loadFeed = async () => {
        try {
            const response = await axios.get(`${API_BASE}/api/members/feed/${creatorId}`);
            setPosts(response.data);
        } catch (error) {
            console.error('Error loading feed:', error);
        }
    };

    const checkSubscription = async () => {
        if (!selectedAccount || !api) return;

        try {
            // TODO: Check contract for active subscription
            // For demo, set to false
            setIsSubscribed(false);
        } catch (error) {
            console.error('Error checking subscription:', error);
        }
    };

    const handleSubscribe = async () => {
        if (!selectedAccount || !creator) {
            alert('Please connect your wallet first');
            return;
        }

        setLoading(true);
        try {
            // TODO: Call subscription_manager contract
            // For demo, just simulate success
            await new Promise(resolve => setTimeout(resolve, 2000));
            setIsSubscribed(true);
            alert('Subscribed successfully! (Demo mode)');
        } catch (error) {
            console.error('Error subscribing:', error);
            alert('Subscription failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleUnlock = async (postId) => {
        if (!selectedAccount) {
            alert('Please connect your wallet first');
            return;
        }

        setUnlockingPostId(postId);
        try {
            // For demo, simulate signing
            const signature = '0x_demo_signature';

            const response = await axios.post(`${API_BASE}/api/members/unlock`, {
                postId,
                userAddress: selectedAccount.address,
                signature
            });

            // Update post in state
            setPosts(prev => prev.map(p =>
                p.id === postId ? { ...p, content: response.data.post.content, locked: false } : p
            ));
        } catch (error) {
            console.error('Error unlocking post:', error);
            alert(error.response?.data?.error || 'Failed to unlock post');
        } finally {
            setUnlockingPostId(null);
        }
    };

    if (!creator) {
        return (
            <div className="members-container min-h-screen flex items-center justify-center">
                <p className="members-text">Creator not found</p>
            </div>
        );
    }

    return (
        <div className="members-container min-h-screen">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Creator Header */}
                <div className="members-card p-8 mb-8">
                    <div className="flex items-start mb-6">
                        <div className="text-7xl mr-6">{creator.avatar}</div>
                        <div className="flex-1">
                            <h1 className="members-title text-3xl md:text-4xl mb-2" style={{ fontFamily: 'var(--font-serif)' }}>
                                {creator.name}
                            </h1>
                            <p className="members-text text-lg mb-4">{creator.description}</p>
                            <div className="flex items-center gap-4 text-sm">
                                <span className="premium-badge">{(parseInt(creator.price) / 1e12).toFixed(0)} DOT/month</span>
                                <span className="text-gray-500">{creator.subscribers} subscribers</span>
                            </div>
                        </div>
                    </div>

                    {!isSubscribed ? (
                        <button
                            onClick={handleSubscribe}
                            disabled={loading}
                            className="members-button w-full text-lg py-4"
                        >
                            {loading ? 'Processing...' : `Subscribe for ${(parseInt(creator.price) / 1e12).toFixed(0)} DOT/month`}
                        </button>
                    ) : (
                        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 text-center">
                            <span className="text-green-700 font-semibold">✓ Active Subscriber</span>
                        </div>
                    )}
                </div>

                {/* Posts Feed */}
                <div className="space-y-6">
                    <h2 className="members-title text-2xl mb-4" style={{ fontFamily: 'var(--font-serif)' }}>
                        Exclusive Content
                    </h2>

                    {posts.length === 0 ? (
                        <div className="members-card p-8 text-center">
                            <p className="members-text">No posts yet. Check back soon!</p>
                        </div>
                    ) : (
                        posts.map((post) => (
                            <div key={post.id} className="members-card p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <h3 className="members-title text-xl flex-1">{post.title}</h3>
                                    {post.locked && <span className="locked-badge">🔒 Locked</span>}
                                </div>

                                {post.locked ? (
                                    <div>
                                        <p className="members-text mb-4 text-gray-400 italic">
                                            This content is exclusive to subscribers. Subscribe to unlock.
                                        </p>
                                        <button
                                            onClick={() => handleUnlock(post.id)}
                                            disabled={unlockingPostId === post.id}
                                            className="members-button"
                                        >
                                            {unlockingPostId === post.id ? 'Unlocking...' : 'Unlock Post'}
                                        </button>
                                    </div>
                                ) : (
                                    <div className="members-text whitespace-pre-wrap">
                                        {post.content}
                                    </div>
                                )}

                                <div className="mt-4 text-sm text-gray-400">
                                    {new Date(post.timestamp).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default CreatorFeed;
