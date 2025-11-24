import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useWallet } from './WalletContext';
import { useApi, createGasLimit } from './ApiContext';
import { ContractPromise } from '@polkadot/api-contract';
// TODO: Add subscription_manager.json when contract is deployed
// import subscriptionAbi from '../contracts/subscription_manager.json';
const subscriptionAbi = null; // Placeholder until contract ABI is available

const MembershipContext = createContext({});

// Mock data for when contract is not available
const mockCreatorData = {
    totalMembers: 1243,
    membersChange: 12.5,
    monthlyRevenue: 4820,
    revenueChange: 8.3,
    activeSubscriptions: 1108,
    subscriptionsChange: -2.1,
    engagement: 78,
    engagementChange: 5.2,
    recentMembers: [
        { id: 1, name: 'Anonymous User 1', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&q=80', tier: 'Gold', joined: '2 hours ago', amount: 50 },
        { id: 2, name: 'Anonymous User 2', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&q=80', tier: 'Silver', joined: '5 hours ago', amount: 25 },
        { id: 3, name: 'Anonymous User 3', avatar: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=100&h=100&fit=crop&q=80', tier: 'Bronze', joined: '1 day ago', amount: 10 },
        { id: 4, name: 'Anonymous User 4', avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=100&h=100&fit=crop&q=80', tier: 'Gold', joined: '2 days ago', amount: 50 }
    ],
    tiers: [
        { 
            id: 1, 
            name: 'Bronze', 
            price: 10, 
            members: 523,
            revenue: 5230,
            benefits: ['Monthly Newsletter', 'Community Access', 'Exclusive Updates']
        },
        { 
            id: 2, 
            name: 'Silver', 
            price: 25, 
            members: 312,
            revenue: 7800,
            benefits: ['All Bronze Benefits', 'Early Content Access', 'Monthly Live Q&A']
        },
        { 
            id: 3, 
            name: 'Gold', 
            price: 50, 
            members: 408,
            revenue: 20400,
            benefits: ['All Silver Benefits', '1-on-1 Sessions', 'Exclusive NFTs', 'Priority Support']
        }
    ],
    recentPosts: [
        { id: 1, title: 'New Course Launch: Advanced React Patterns', date: '2 days ago', views: 1847, likes: 342, comments: 56, published: true },
        { id: 2, title: 'Behind the Scenes: Building DotNation', date: '5 days ago', views: 2134, likes: 489, comments: 78, published: true },
        { id: 3, title: 'Monthly Update & Roadmap Q1 2025', date: '1 week ago', views: 3021, likes: 612, comments: 124, published: true },
        { id: 4, title: 'Draft: Upcoming Tutorial Series', date: '2 weeks ago', views: 0, likes: 0, comments: 0, published: false }
    ]
};

export const MembershipProvider = ({ children }) => {
    const { api, isReady } = useApi();
    const { selectedAccount } = useWallet();
    const [subscriptionContract, setSubscriptionContract] = useState(null);
    const [creatorStats] = useState(mockCreatorData);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Initialize subscription contract
    useEffect(() => {
        const initContract = async () => {
            if (!api || !isReady) return;

            const contractAddress = import.meta.env.VITE_SUBSCRIPTION_CONTRACT_ADDRESS;
            
            if (!contractAddress) {
                console.log('[MembershipContext] No subscription contract address configured, using mock data');
                return;
            }

            try {
                const contract = new ContractPromise(api, subscriptionAbi, contractAddress);
                setSubscriptionContract(contract);
                console.log('[MembershipContext] Subscription contract initialized');
            } catch (err) {
                console.error('[MembershipContext] Failed to initialize subscription contract:', err);
                setError('Failed to load subscription contract');
            }
        };

        initContract();
    }, [api, isReady]);

    // Fetch creator stats
    const fetchCreatorStats = useCallback(async () => {
        if (!selectedAccount) {
            return mockCreatorData;
        }

        if (!subscriptionContract) {
            console.log('[MembershipContext] Using mock data - contract not available');
            return mockCreatorData;
        }

        setIsLoading(true);
        try {
            // Get creator price
            const { result, output } = await subscriptionContract.query.getCreatorPrice(
                selectedAccount.address,
                { gasLimit: createGasLimit(api) },
                selectedAccount.address
            );

            if (result.isOk && output) {
                const price = output.toHuman();
                console.log('[MembershipContext] Creator price:', price);
                // In a real implementation, you'd fetch actual member data here
                // For now, we'll enhance mock data with real price
            }

            return mockCreatorData;
        } catch (err) {
            console.error('[MembershipContext] Error fetching creator stats:', err);
            return mockCreatorData;
        } finally {
            setIsLoading(false);
        }
    }, [subscriptionContract, selectedAccount, api]);

    // Register as creator
    const registerCreator = useCallback(async (monthlyPrice) => {
        if (!subscriptionContract || !selectedAccount) {
            throw new Error('Contract not loaded or wallet not connected');
        }

        try {
            const gasLimit = createGasLimit(api);
            
            // Dry run first
            const { result } = await subscriptionContract.query.registerCreator(
                selectedAccount.address,
                { gasLimit },
                monthlyPrice
            );

            if (result.isErr) {
                throw new Error('Failed to register as creator');
            }

            // Execute transaction
            return new Promise((resolve, reject) => {
                subscriptionContract.tx
                    .registerCreator({ gasLimit }, monthlyPrice)
                    .signAndSend(selectedAccount.address, ({ status }) => {
                        if (status.isInBlock || status.isFinalized) {
                            resolve({ success: true });
                        }
                    })
                    .catch(reject);
            });
        } catch (err) {
            console.error('[MembershipContext] Error registering creator:', err);
            throw new Error(`Failed to register as creator: ${err.message}`);
        }
    }, [subscriptionContract, selectedAccount, api]);

    // Subscribe to creator
    const subscribeToCreator = useCallback(async (creatorAddress, amount) => {
        if (!subscriptionContract || !selectedAccount) {
            throw new Error('Contract not loaded or wallet not connected');
        }

        try {
            const gasLimit = createGasLimit(api);
            
            // Execute subscription transaction
            return new Promise((resolve, reject) => {
                subscriptionContract.tx
                    .subscribe({ gasLimit, value: amount }, creatorAddress)
                    .signAndSend(selectedAccount.address, ({ status }) => {
                        if (status.isInBlock || status.isFinalized) {
                            resolve({ success: true });
                        }
                    })
                    .catch(reject);
            });
        } catch (err) {
            console.error('[MembershipContext] Error subscribing:', err);
            throw new Error(`Failed to subscribe: ${err.message}`);
        }
    }, [subscriptionContract, selectedAccount, api]);

    // Check subscription status
    const checkSubscription = useCallback(async (userAddress, creatorAddress) => {
        if (!subscriptionContract) {
            console.log('[MembershipContext] Contract not available, returning false');
            return false;
        }

        try {
            const { result, output } = await subscriptionContract.query.checkSubscription(
                userAddress,
                { gasLimit: createGasLimit(api) },
                userAddress,
                creatorAddress
            );

            if (result.isOk && output) {
                return output.toHuman() === 'true' || output.toHuman() === true;
            }

            return false;
        } catch (err) {
            console.error('[MembershipContext] Error checking subscription:', err);
            return false;
        }
    }, [subscriptionContract, api]);

    // Get creator price
    const getCreatorPrice = useCallback(async (creatorAddress) => {
        if (!subscriptionContract) {
            return null;
        }

        try {
            const { result, output } = await subscriptionContract.query.getCreatorPrice(
                creatorAddress,
                { gasLimit: createGasLimit(api) },
                creatorAddress
            );

            if (result.isOk && output) {
                const price = output.toHuman();
                return price && price !== 'None' ? price.replace(/,/g, '') : null;
            }

            return null;
        } catch (err) {
            console.error('[MembershipContext] Error getting creator price:', err);
            return null;
        }
    }, [subscriptionContract, api]);

    // ===== NEW TIER MANAGEMENT FUNCTIONS =====

    // Create a new subscription tier
    const createTier = useCallback(async (name, price, benefits) => {
        if (!subscriptionContract || !selectedAccount) {
            throw new Error('Contract not loaded or wallet not connected');
        }

        try {
            const gasLimit = createGasLimit(api);
            
            // Dry run first
            const { result } = await subscriptionContract.query.createTier(
                selectedAccount.address,
                { gasLimit },
                name,
                price,
                benefits
            );

            if (result.isErr) {
                throw new Error('Failed to create tier');
            }

            // Execute transaction
            return new Promise((resolve, reject) => {
                subscriptionContract.tx
                    .createTier({ gasLimit }, name, price, benefits)
                    .signAndSend(selectedAccount.address, ({ status, events }) => {
                        if (status.isInBlock || status.isFinalized) {
                            resolve({ success: true, events });
                        }
                    })
                    .catch(reject);
            });
        } catch (err) {
            console.error('[MembershipContext] Error creating tier:', err);
            throw new Error(`Failed to create tier: ${err.message}`);
        }
    }, [subscriptionContract, selectedAccount, api]);

    // Update an existing tier
    const updateTier = useCallback(async (tierId, newPrice, newBenefits) => {
        if (!subscriptionContract || !selectedAccount) {
            throw new Error('Contract not loaded or wallet not connected');
        }

        try {
            const gasLimit = createGasLimit(api);
            
            // Dry run first
            const { result } = await subscriptionContract.query.updateTier(
                selectedAccount.address,
                { gasLimit },
                tierId,
                newPrice,
                newBenefits
            );

            if (result.isErr) {
                throw new Error('Failed to update tier');
            }

            // Execute transaction
            return new Promise((resolve, reject) => {
                subscriptionContract.tx
                    .updateTier({ gasLimit }, tierId, newPrice, newBenefits)
                    .signAndSend(selectedAccount.address, ({ status }) => {
                        if (status.isInBlock || status.isFinalized) {
                            resolve({ success: true });
                        }
                    })
                    .catch(reject);
            });
        } catch (err) {
            console.error('[MembershipContext] Error updating tier:', err);
            throw new Error(`Failed to update tier: ${err.message}`);
        }
    }, [subscriptionContract, selectedAccount, api]);

    // Delete a tier
    const deleteTier = useCallback(async (tierId) => {
        if (!subscriptionContract || !selectedAccount) {
            throw new Error('Contract not loaded or wallet not connected');
        }

        try {
            const gasLimit = createGasLimit(api);
            
            // Dry run first
            const { result } = await subscriptionContract.query.deleteTier(
                selectedAccount.address,
                { gasLimit },
                tierId
            );

            if (result.isErr) {
                throw new Error('Failed to delete tier');
            }

            // Execute transaction
            return new Promise((resolve, reject) => {
                subscriptionContract.tx
                    .deleteTier({ gasLimit }, tierId)
                    .signAndSend(selectedAccount.address, ({ status }) => {
                        if (status.isInBlock || status.isFinalized) {
                            resolve({ success: true });
                        }
                    })
                    .catch(reject);
            });
        } catch (err) {
            console.error('[MembershipContext] Error deleting tier:', err);
            throw new Error(`Failed to delete tier: ${err.message}`);
        }
    }, [subscriptionContract, selectedAccount, api]);

    // Get all tiers for a creator
    const getCreatorTiers = useCallback(async (creatorAddress) => {
        if (!subscriptionContract) {
            console.log('[MembershipContext] Contract not available, returning mock tiers');
            return mockCreatorData.tiers;
        }

        try {
            const { result, output } = await subscriptionContract.query.getCreatorTiers(
                creatorAddress,
                { gasLimit: createGasLimit(api) },
                creatorAddress
            );

            if (result.isOk && output) {
                const tiers = output.toHuman();
                console.log('[MembershipContext] Fetched tiers:', tiers);
                
                // Transform contract data to match frontend format
                if (Array.isArray(tiers) && tiers.length > 0) {
                    return tiers.map(tier => ({
                        id: tier.tierId || tier.tier_id,
                        name: tier.name,
                        price: parseInt(tier.price?.replace(/,/g, '') || 0),
                        benefits: tier.benefits || [],
                        creator: tier.creator
                    }));
                }
                
                return mockCreatorData.tiers; // Return mock data if no tiers
            }

            return mockCreatorData.tiers;
        } catch (err) {
            console.error('[MembershipContext] Error getting creator tiers:', err);
            return mockCreatorData.tiers;
        }
    }, [subscriptionContract, api]);

    // Get a specific tier
    const getTier = useCallback(async (creatorAddress, tierId) => {
        if (!subscriptionContract) {
            return null;
        }

        try {
            const { result, output } = await subscriptionContract.query.getTier(
                creatorAddress,
                { gasLimit: createGasLimit(api) },
                creatorAddress,
                tierId
            );

            if (result.isOk && output) {
                const tier = output.toHuman();
                if (tier && tier !== 'None') {
                    return {
                        id: tier.tierId || tier.tier_id,
                        name: tier.name,
                        price: parseInt(tier.price?.replace(/,/g, '') || 0),
                        benefits: tier.benefits || [],
                        creator: tier.creator
                    };
                }
            }

            return null;
        } catch (err) {
            console.error('[MembershipContext] Error getting tier:', err);
            return null;
        }
    }, [subscriptionContract, api]);

    // Subscribe to a specific tier
    const subscribeToTier = useCallback(async (creatorAddress, tierId, amount) => {
        if (!subscriptionContract || !selectedAccount) {
            throw new Error('Contract not loaded or wallet not connected');
        }

        try {
            const gasLimit = createGasLimit(api);
            
            // Execute subscription transaction
            return new Promise((resolve, reject) => {
                subscriptionContract.tx
                    .subscribeToTier({ gasLimit, value: amount }, creatorAddress, tierId)
                    .signAndSend(selectedAccount.address, ({ status }) => {
                        if (status.isInBlock || status.isFinalized) {
                            resolve({ success: true });
                        }
                    })
                    .catch(reject);
            });
        } catch (err) {
            console.error('[MembershipContext] Error subscribing to tier:', err);
            throw new Error(`Failed to subscribe to tier: ${err.message}`);
        }
    }, [subscriptionContract, selectedAccount, api]);

    // Get subscriber's current tier
    const getSubscriberTier = useCallback(async (userAddress, creatorAddress) => {
        if (!subscriptionContract) {
            return null;
        }

        try {
            const { result, output } = await subscriptionContract.query.getSubscriberTier(
                userAddress,
                { gasLimit: createGasLimit(api) },
                userAddress,
                creatorAddress
            );

            if (result.isOk && output) {
                const tierId = output.toHuman();
                return tierId && tierId !== 'None' ? parseInt(tierId) : null;
            }

            return null;
        } catch (err) {
            console.error('[MembershipContext] Error getting subscriber tier:', err);
            return null;
        }
    }, [subscriptionContract, api]);

    // Check tier access
    const checkTierAccess = useCallback(async (userAddress, creatorAddress, requiredTierId) => {
        if (!subscriptionContract) {
            return false;
        }

        try {
            const { result, output } = await subscriptionContract.query.checkTierAccess(
                userAddress,
                { gasLimit: createGasLimit(api) },
                userAddress,
                creatorAddress,
                requiredTierId
            );

            if (result.isOk && output) {
                return output.toHuman() === 'true' || output.toHuman() === true;
            }

            return false;
        } catch (err) {
            console.error('[MembershipContext] Error checking tier access:', err);
            return false;
        }
    }, [subscriptionContract, api]);

    return (
        <MembershipContext.Provider
            value={{
                creatorStats,
                isLoading,
                error,
                subscriptionContract,
                fetchCreatorStats,
                registerCreator,
                subscribeToCreator,
                checkSubscription,
                getCreatorPrice,
                // New tier management functions
                createTier,
                updateTier,
                deleteTier,
                getCreatorTiers,
                getTier,
                subscribeToTier,
                getSubscriberTier,
                checkTierAccess,
            }}
        >
            {children}
        </MembershipContext.Provider>
    );
};

MembershipProvider.propTypes = {
    children: PropTypes.node.isRequired,
};

// eslint-disable-next-line react-refresh/only-export-components
export const useMembership = () => {
    const context = useContext(MembershipContext);
    if (context === undefined) {
        throw new Error('useMembership must be used within a MembershipProvider');
    }
    return context;
};
