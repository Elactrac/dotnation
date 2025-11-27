import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useWallet } from './WalletContext';
import { ContractPromise } from '@polkadot/api-contract';
import PropTypes from 'prop-types';
import nftAbi from '../contracts/donation_nft.json';

const NftContext = createContext();

export const useNft = () => {
  const context = useContext(NftContext);
  if (!context) {
    throw new Error('useNft must be used within an NftProvider');
  }
  return context;
};

export const NftProvider = ({ children }) => {
  const { api, selectedAccount } = useWallet();
  const [nftContract, setNftContract] = useState(null);
  const [nftContractAddress, setNftContractAddress] = useState(null);
  const [nftEnabled, setNftEnabled] = useState(false);
  const [userNfts, setUserNfts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Initialize NFT contract instance
  useEffect(() => {
    const initNftContract = async () => {
      // Get NFT contract address from environment variable
      const contractAddress = import.meta.env.VITE_NFT_CONTRACT_ADDRESS;
      
      if (!api || !contractAddress) {
        console.log('[NFT] Waiting for API or contract address...', { 
          hasApi: !!api, 
          contractAddress 
        });
        return;
      }
      
      try {
        console.log('[NFT] Initializing contract at:', contractAddress);
        const contract = new ContractPromise(api, nftAbi, contractAddress);
        setNftContract(contract);
        setNftContractAddress(contractAddress);
        console.log('[NFT] Contract initialized successfully');
      } catch (err) {
        console.error('[NFT] Failed to initialize NFT contract:', err);
        setError(err.message);
      }
    };

    initNftContract();
  }, [api]);

  // Fetch user's NFTs
  const fetchUserNfts = useCallback(async () => {
    if (!nftContract || !selectedAccount) {
      setUserNfts([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('[NFT] Fetching NFTs for:', selectedAccount.address);
      
      // Call contract to get user's NFTs with metadata
      const { result, output } = await nftContract.query.tokensOfOwnerWithMetadata(
        selectedAccount.address,
        { value: 0, gasLimit: -1 },
        selectedAccount.address
      );

      if (result.isOk && output) {
        const nfts = output.toHuman();
        console.log('[NFT] Fetched NFTs:', nfts);
        setUserNfts(Array.isArray(nfts) ? nfts : []);
      } else {
        console.log('[NFT] No NFTs found or query failed');
        setUserNfts([]);
      }
    } catch (err) {
      console.error('[NFT] Error fetching NFTs:', err);
      setError(err.message);
      setUserNfts([]);
    } finally {
      setLoading(false);
    }
  }, [nftContract, selectedAccount]);

  // Mint NFT receipt after donation
  // NOTE: This method is for reference only. NFT minting MUST be called by the platform contract,
  // not directly from the frontend, as the NFT contract only allows minting from the authorized
  // platform_contract address. This function currently does nothing and just refreshes NFTs.
  const mintNftReceipt = useCallback(async (campaignId, campaignTitle, amount, timestamp) => {
    if (!nftContract || !selectedAccount || !nftEnabled) {
      console.log('[NFT] Mint skipped - contract not ready or NFT disabled');
      return null;
    }

    try {
      console.log('[NFT] Checking for new NFT after donation...', {
        campaignId,
        campaignTitle,
        amount,
        timestamp
      });
      
      // IMPORTANT: The actual minting happens on-chain via the platform contract
      // calling nft_contract.mint_donation_receipt(). This is a cross-contract call
      // that needs to be implemented in the platform contract's donate() method.
      //
      // The platform contract is the only authorized minter, so we cannot mint directly
      // from the frontend. Instead, we just refresh the user's NFTs to show newly minted ones.
      
      // Refresh user's NFTs to show any newly minted NFT
      await fetchUserNfts();
      
      // Return the most recent token ID (highest number)
      const tokenIds = userNfts.map(nft => nft.tokenId || 0);
      const latestTokenId = tokenIds.length > 0 ? Math.max(...tokenIds) : 0;
      
      return latestTokenId;
    } catch (err) {
      console.error('[NFT] Error checking NFT after donation:', err);
      throw err;
    }
  }, [nftContract, selectedAccount, nftEnabled, fetchUserNfts, userNfts]);

  // Get NFT metadata by token ID
  const getNftMetadata = useCallback(async (tokenId) => {
    if (!nftContract || !selectedAccount) return null;

    try {
      console.log('[NFT] Fetching metadata for token:', tokenId);
      
      const { result, output } = await nftContract.query.getTokenMetadata(
        selectedAccount.address,
        { value: 0, gasLimit: -1 },
        tokenId
      );

      if (result.isOk && output) {
        const metadata = output.toHuman();
        console.log('[NFT] Metadata fetched:', metadata);
        return metadata;
      } else {
        console.log('[NFT] Failed to fetch metadata:', result);
        return null;
      }
    } catch (err) {
      console.error('[NFT] Error fetching metadata:', err);
      return null;
    }
  }, [nftContract, selectedAccount]);

  // Get donation statistics for the current user
  const getDonationStats = useCallback(async () => {
    if (!nftContract || !selectedAccount) return { totalDonations: 0, totalAmount: 0 };

    try {
      console.log('[NFT] Fetching donation stats for:', selectedAccount.address);
      
      const { result, output } = await nftContract.query.getDonationStats(
        selectedAccount.address,
        { value: 0, gasLimit: -1 },
        selectedAccount.address
      );

      if (result.isOk && output) {
        const stats = output.toHuman();
        console.log('[NFT] Donation stats:', stats);
        // Stats returns (count: u32, total: Balance)
        return {
          totalDonations: parseInt(stats[0]?.replace(/,/g, '') || '0'),
          totalAmount: parseInt(stats[1]?.replace(/,/g, '') || '0')
        };
      } else {
        console.log('[NFT] No stats found');
        return { totalDonations: 0, totalAmount: 0 };
      }
    } catch (err) {
      console.error('[NFT] Error fetching donation stats:', err);
      return { totalDonations: 0, totalAmount: 0 };
    }
  }, [nftContract, selectedAccount]);

  // Check if NFT feature is enabled on the platform
  const checkNftEnabled = useCallback(async (platformContract) => {
    if (!platformContract) return;

    try {
      // This would call the platform contract's is_nft_enabled method
      // const { result } = await platformContract.query.isNftEnabled(
      //   selectedAccount?.address || '5C4hrfjw9DjXZTzV3MwzrrAr9P1MJhSrvWGWqi1eSuyUpnhM',
      //   { value: 0, gasLimit: -1 }
      // );
      
      // For development, set to true to test UI
      setNftEnabled(true); // Change to true when contracts are deployed
    } catch (err) {
      console.error('Error checking NFT status:', err);
      setNftEnabled(false);
    }
  }, []);

  // Transfer NFT to another address
  const transferNft = useCallback(async (toAddress, tokenId) => {
    if (!nftContract || !selectedAccount || !api) {
      throw new Error('Contract not initialized or no active account');
    }

    try {
      console.log('[NFT] Transferring token:', { toAddress, tokenId });
      
      const gasLimit = api.registry.createType('WeightV2', {
        refTime: 10000000000,
        proofSize: 131072,
      });
      
      return new Promise((resolve, reject) => {
        nftContract.tx.transfer(
          { value: 0, gasLimit },
          toAddress,
          tokenId
        ).signAndSend(selectedAccount.address, ({ status, dispatchError }) => {
          if (status.isInBlock) {
            console.log('[NFT] Transfer in block:', status.asInBlock.toHex());
          } else if (status.isFinalized) {
            if (dispatchError) {
              console.error('[NFT] Transfer failed:', dispatchError.toString());
              reject(new Error(dispatchError.toString()));
            } else {
              console.log('[NFT] Transfer finalized');
              // Refresh user's NFTs after transfer
              fetchUserNfts().then(() => {
                resolve({ success: true });
              });
            }
          }
        }).catch(reject);
      });
    } catch (err) {
      console.error('[NFT] Error transferring NFT:', err);
      throw err;
    }
  }, [nftContract, selectedAccount, api, fetchUserNfts]);

  // Get leaderboard of top donors
  const getLeaderboard = useCallback(async (limit = 10) => {
    if (!nftContract || !selectedAccount) return [];

    try {
      console.log('[NFT] Fetching leaderboard with limit:', limit);
      
      const { result, output } = await nftContract.query.getLeaderboard(
        selectedAccount.address,
        { value: 0, gasLimit: -1 },
        limit
      );

      if (result.isOk && output) {
        const leaderboard = output.toHuman();
        console.log('[NFT] Leaderboard fetched:', leaderboard);
        return Array.isArray(leaderboard) ? leaderboard : [];
      } else {
        console.log('[NFT] No leaderboard data');
        return [];
      }
    } catch (err) {
      console.error('[NFT] Error fetching leaderboard:', err);
      return [];
    }
  }, [nftContract, selectedAccount]);

  // Get NFTs filtered by rarity tier
  const getNftsByRarity = useCallback(async (rarity) => {
    if (!nftContract || !selectedAccount) return [];

    try {
      console.log('[NFT] Fetching NFTs by rarity:', rarity);
      
      const { result, output } = await nftContract.query.getNftsByRarity(
        selectedAccount.address,
        { value: 0, gasLimit: -1 },
        selectedAccount.address,
        rarity
      );

      if (result.isOk && output) {
        const nfts = output.toHuman();
        console.log('[NFT] NFTs by rarity fetched:', nfts);
        return Array.isArray(nfts) ? nfts : [];
      } else {
        console.log('[NFT] No NFTs found for rarity:', rarity);
        return [];
      }
    } catch (err) {
      console.error('[NFT] Error fetching NFTs by rarity:', err);
      return [];
    }
  }, [nftContract, selectedAccount]);

  // Get rarity distribution for user
  const getRarityDistribution = useCallback(async () => {
    if (!nftContract || !selectedAccount) return { Common: 0, Uncommon: 0, Rare: 0, Epic: 0, Legendary: 0 };

    try {
      console.log('[NFT] Fetching rarity distribution for:', selectedAccount.address);
      
      const { result, output } = await nftContract.query.getRarityDistribution(
        selectedAccount.address,
        { value: 0, gasLimit: -1 },
        selectedAccount.address
      );

      if (result.isOk && output) {
        const distribution = output.toHuman();
        console.log('[NFT] Rarity distribution fetched:', distribution);
        // Distribution is returned as an object with counts per rarity
        return distribution || { Common: 0, Uncommon: 0, Rare: 0, Epic: 0, Legendary: 0 };
      } else {
        console.log('[NFT] No distribution data');
        return { Common: 0, Uncommon: 0, Rare: 0, Epic: 0, Legendary: 0 };
      }
    } catch (err) {
      console.error('[NFT] Error fetching rarity distribution:', err);
      return { Common: 0, Uncommon: 0, Rare: 0, Epic: 0, Legendary: 0 };
    }
  }, [nftContract, selectedAccount]);

  // Get total amount donated by user
  const getTotalDonated = useCallback(async () => {
    if (!nftContract || !selectedAccount) return 0;

    try {
      console.log('[NFT] Fetching total donated for:', selectedAccount.address);
      
      const { result, output } = await nftContract.query.getTotalDonated(
        selectedAccount.address,
        { value: 0, gasLimit: -1 },
        selectedAccount.address
      );

      if (result.isOk && output) {
        const total = output.toHuman();
        console.log('[NFT] Total donated:', total);
        // Parse the balance string (removes commas)
        return parseInt(total?.replace(/,/g, '') || '0');
      } else {
        console.log('[NFT] No donation total found');
        return 0;
      }
    } catch (err) {
      console.error('[NFT] Error fetching total donated:', err);
      return 0;
    }
  }, [nftContract, selectedAccount]);

  // Get achievements for user
  const getAchievements = useCallback(async () => {
    if (!nftContract || !selectedAccount) return [];

    try {
      console.log('[NFT] Fetching achievements for:', selectedAccount.address);
      
      const { result, output } = await nftContract.query.getAchievements(
        selectedAccount.address,
        { value: 0, gasLimit: -1 },
        selectedAccount.address
      );

      if (result.isOk && output) {
        const achievements = output.toHuman();
        console.log('[NFT] Achievements fetched:', achievements);
        return Array.isArray(achievements) ? achievements : [];
      } else {
        console.log('[NFT] No achievements found');
        return [];
      }
    } catch (err) {
      console.error('[NFT] Error fetching achievements:', err);
      return [];
    }
  }, [nftContract, selectedAccount]);

  // Check if transfers are enabled
  const areTransfersEnabled = useCallback(async () => {
    if (!nftContract) return false;

    try {
      console.log('[NFT] Checking if transfers are enabled');
      
      const { result, output } = await nftContract.query.areTransfersEnabled(
        selectedAccount?.address || '5C4hrfjw9DjXZTzV3MwzrrAr9P1MJhSrvWGWqi1eSuyUpnhM',
        { value: 0, gasLimit: -1 }
      );

      if (result.isOk && output) {
        const enabled = output.toHuman();
        console.log('[NFT] Transfers enabled:', enabled);
        return enabled === true || enabled === 'true';
      } else {
        console.log('[NFT] Could not determine transfer status');
        return false;
      }
    } catch (err) {
      console.error('[NFT] Error checking transfer status:', err);
      return false;
    }
  }, [nftContract, selectedAccount]);

  // Fetch NFTs when account changes
  useEffect(() => {
    if (selectedAccount && nftContract) {
      fetchUserNfts();
    }
  }, [selectedAccount, nftContract, fetchUserNfts]);

  const value = {
    nftContract,
    nftContractAddress,
    setNftContractAddress,
    nftEnabled,
    setNftEnabled,
    userNfts,
    loading,
    error,
    fetchUserNfts,
    mintNftReceipt,
    getNftMetadata,
    getDonationStats,
    checkNftEnabled,
    transferNft,
    getLeaderboard,
    getNftsByRarity,
    getRarityDistribution,
    getTotalDonated,
    getAchievements,
    areTransfersEnabled,
  };

  return <NftContext.Provider value={value}>{children}</NftContext.Provider>;
};

NftProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default NftContext;
