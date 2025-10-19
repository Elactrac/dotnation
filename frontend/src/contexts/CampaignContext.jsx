import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { ethers } from 'ethers';
import { useWallet } from './WalletContext';
import { useApi } from './ApiContext';
import { metrics } from '../utils/metrics';
import { asyncCache } from '../utils/cache';

// --- Placeholder for EVM Contract ---
// In a real app, this would come from a dedicated file or environment variables.
const EVM_CONTRACT_ADDRESS = '0x...'; // Replace with your deployed Solidity contract address
const EVM_CONTRACT_ABI = [
  // A minimal ABI for the donate function
  "function donate(uint256 campaignId) public payable",
  // Add other function definitions here as needed
];
// ------------------------------------

const CampaignContext = createContext({});

export const CampaignProvider = ({ children }) => {
  const { api, isReady } = useApi();
  const { selectedAccount, walletType } = useWallet();
  const [campaigns, setCampaigns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const retryApiCall = async (fn, retries = 3, delay = 1000) => {
    for (let i = 0; i < retries; i++) {
      try {
        return await fn();
      } catch (err) {
        if (i === retries - 1) throw err;
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
      }
    }
  };

  const fetchCampaigns = useCallback(async () => {
    // For development without deployed contract, use mock data
    const mockCampaigns = [
      {
        id: 1,
        owner: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
        title: 'Decentralized Education Platform',
        description: 'Building the future of learning with blockchain technology.',
        goal: 1000000000000n, // 1000 DOT
        raised: 500000000000n, // 500 DOT
        deadline: Date.now() + 86400000 * 30, // 30 days
        state: 'Active',
        beneficiary: '5FHneW46xGXgs5mUiveU4sbTyGBzmvcE1QP9KG1Yqk5j9',
      },
      {
        id: 2,
        owner: '5FHneW46xGXgs5mUiveU4sbTyGBzmvcE1QP9KG1Yqk5j9',
        title: 'Green Energy Initiative',
        description: 'Funding renewable energy projects for a sustainable future.',
        goal: 2000000000000n, // 2000 DOT
        raised: 800000000000n, // 800 DOT
        deadline: Date.now() + 86400000 * 15, // 15 days
        state: 'Active',
        beneficiary: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
      },
    ];

    setCampaigns(mockCampaigns);
    setIsLoading(false);
  }, []);

  const getCampaignDetails = useCallback(async (campaignId) => {
    if (!api || !isReady) throw new Error('API not connected');
    
    try {
      const details = await api.query.donationPlatform.getCampaignDetails(campaignId);
      if (!details) throw new Error('Campaign not found');
      
      const campaign = details.campaign;
      const donations = details.donations;
      
      return {
        campaign: {
          id: campaign.id.toNumber(),
          owner: campaign.owner.toString(),
          title: campaign.title.toString(),
          description: campaign.description.toString(),
          goal: campaign.goal.toBigInt(),
          raised: campaign.raised.toBigInt(),
          deadline: campaign.deadline.toNumber(),
          state: campaign.state.toString(),
          beneficiary: campaign.beneficiary.toString(),
        },
        donations: donations.map(donation => ({
          donor: donation.donor.toString(),
          amount: donation.amount.toBigInt(),
          timestamp: donation.timestamp.toNumber()
        }))
      };
    } catch (err) {
      throw new Error(`Failed to get campaign details: ${err.message}`);
    }
  }, [api]);

  const mapError = (error) => {
    // Map contract errors to user-friendly messages
    const errorMappings = {
      'InvalidTitle': 'Title must be between 1 and 100 characters.',
      'InvalidDescription': 'Description must be less than 1000 characters.',
      'InvalidGoal': 'Goal must be between 1 and 1,000,000 DOT.',
      'InvalidBeneficiary': 'Invalid beneficiary address.',
      'InvalidDeadline': 'Deadline must be between 1 hour and 1 year from now.',
      'InvalidDonationAmount': 'Donation amount must be greater than 0 and less than 100,000 DOT.',
      'CampaignNotFound': 'Campaign not found.',
      'CampaignNotActive': 'Campaign is not active.',
      'GoalReached': 'Campaign goal has already been reached.',
      'DeadlinePassed': 'Campaign deadline has passed.',
      'NotCampaignOwner': 'Only the campaign owner can perform this action.',
      'GoalNotReached': 'Campaign goal has not been reached.',
      'FundsAlreadyWithdrawn': 'Funds have already been withdrawn.',
      'InsufficientFunds': 'Insufficient funds for withdrawal.',
      'WithdrawalFailed': 'Withdrawal failed.',
    };
    return errorMappings[error] || 'An unexpected error occurred.';
  };

  const createCampaign = useCallback(async (campaignData) => {
    // Mock campaign creation for development
    console.log('Mock creating campaign:', campaignData);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Add to mock campaigns
    const newCampaign = {
      id: Date.now(),
      owner: selectedAccount?.address || 'mock-owner',
      title: campaignData.title,
      description: campaignData.description,
      goal: BigInt(campaignData.goal),
      raised: 0n,
      deadline: campaignData.deadline,
      state: 'Active',
      beneficiary: campaignData.beneficiary || selectedAccount?.address,
    };

    setCampaigns(prev => [...prev, newCampaign]);

    return newCampaign.id;
  }, [selectedAccount]);

  const donateToCampaign = useCallback(async (campaignId, amount) => {
    // Mock donation for development
    console.log('Mock donating to campaign:', campaignId, amount);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Update campaign raised amount
    setCampaigns(prev => prev.map(campaign =>
      campaign.id === campaignId
        ? { ...campaign, raised: campaign.raised + BigInt(amount * 1_000_000_000_000) }
        : campaign
    ));

    return true;
  }, []);

  const withdrawFunds = useCallback(async (campaignId) => {
    if (!api || !isReady || !selectedAccount) {
      throw new Error('API or wallet not connected');
    }

    const startTime = metrics.startTransaction();

    try {
      const tx = api.tx.donationPlatform.withdrawFunds(campaignId);
      await tx.signAndSend(selectedAccount.address);

      // Record successful withdrawal
      metrics.completeTransaction(startTime, true, {
        operation: 'withdrawFunds',
        campaignId
      });

      // Invalidate cache since campaign data changed
      asyncCache.invalidate(`campaigns:*`);

      await fetchCampaigns(); // Refresh the campaign list
    } catch (err) {
      metrics.completeTransaction(startTime, false, {
        operation: 'withdrawFunds',
        campaignId,
        error: err.message
      });
      metrics.recordError(err, 'error', { operation: 'withdrawFunds' });
      throw new Error(`Failed to withdraw funds: ${err.message}`);
    }
  }, [api, selectedAccount, fetchCampaigns]);

  useEffect(() => {
    if (api && isReady) {
      fetchCampaigns();
    } else {
      setIsLoading(false);
    }
  }, [api, isReady, fetchCampaigns]);

  return (
    <CampaignContext.Provider
      value={{
        campaigns,
        isLoading,
        error,
        createCampaign,
        donateToCampaign,
        getCampaignDetails,
        withdrawFunds,
        refreshCampaigns: fetchCampaigns,
      }}
    >
      {children}
    </CampaignContext.Provider>
  );
};

CampaignProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

// eslint-disable-next-line react-refresh/only-export-components
export const useCampaign = () => {
  const context = useContext(CampaignContext);
  if (context === undefined) {
    throw new Error('useCampaign must be used within a CampaignProvider');
  }
  return context;
};