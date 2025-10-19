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
  const { api, contract, isReady } = useApi();
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
    if (!contract) {
      // Fallback to mock data if contract not available
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
      return;
    }

    try {
      const { result, output } = await contract.query.getCampaigns(selectedAccount?.address || '', { gasLimit: -1 });

      if (result.isErr) {
        throw new Error(`Contract error: ${result.asErr.toString()}`);
      }

      const campaignsData = output.toHuman() || [];
      const formattedCampaigns = campaignsData.map(campaign => ({
        id: parseInt(campaign.id),
        owner: campaign.owner,
        title: campaign.title,
        description: campaign.description,
        goal: BigInt(campaign.goal.replace(/,/g, '')),
        raised: BigInt(campaign.raised.replace(/,/g, '')),
        deadline: parseInt(campaign.deadline),
        state: campaign.state,
        beneficiary: campaign.beneficiary,
      }));

      setCampaigns(formattedCampaigns);
    } catch (err) {
      console.error('Failed to fetch campaigns:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [contract, selectedAccount]);

  const getCampaignDetails = useCallback(async (campaignId) => {
    if (!contract) {
      throw new Error('Contract not loaded');
    }

    try {
      const { result, output } = await contract.query.getCampaignDetails(selectedAccount?.address || '', { gasLimit: -1 }, campaignId);

      if (result.isErr) {
        throw new Error(`Contract error: ${result.asErr.toString()}`);
      }

      if (!output) throw new Error('Campaign not found');

      const campaign = output.toHuman();
      const donations = campaign.donations || [];

      return {
        campaign: {
          id: parseInt(campaign.id),
          owner: campaign.owner,
          title: campaign.title,
          description: campaign.description,
          goal: BigInt(campaign.goal.replace(/,/g, '')),
          raised: BigInt(campaign.raised.replace(/,/g, '')),
          deadline: parseInt(campaign.deadline),
          state: campaign.state,
          beneficiary: campaign.beneficiary,
        },
        donations: donations.map(donation => ({
          donor: donation.donor,
          amount: BigInt(donation.amount.replace(/,/g, '')),
          timestamp: parseInt(donation.timestamp)
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
    if (!contract || !selectedAccount) {
      throw new Error('Contract not loaded or wallet not connected');
    }

    try {
      const { gasRequired, storageDeposit, result } = await contract.query.createCampaign(
        selectedAccount.address,
        { gasLimit: -1, storageDepositLimit: null },
        campaignData.title,
        campaignData.description,
        campaignData.goal,
        campaignData.deadline,
        campaignData.beneficiary
      );

      if (result.isErr) {
        const error = result.asErr.toString();
        throw new Error(mapError(error) || error);
      }

      // Execute the transaction
      const tx = contract.tx.createCampaign(
        { gasLimit: gasRequired, storageDepositLimit: storageDeposit },
        campaignData.title,
        campaignData.description,
        campaignData.goal,
        campaignData.deadline,
        campaignData.beneficiary
      );

      return tx;
    } catch (err) {
      throw new Error(`Failed to create campaign: ${err.message}`);
    }
  }, [contract, selectedAccount, mapError]);

  const donateToCampaign = useCallback(async (campaignId, amount) => {
    if (!contract || !selectedAccount) {
      throw new Error('Contract not loaded or wallet not connected');
    }

    try {
      const amountInPlanks = BigInt(amount) * BigInt(1_000_000_000_000); // Convert DOT to planks

      const { gasRequired, storageDeposit, result } = await contract.query.donate(
        selectedAccount.address,
        { gasLimit: -1, storageDepositLimit: null, value: amountInPlanks },
        campaignId
      );

      if (result.isErr) {
        const error = result.asErr.toString();
        throw new Error(mapError(error) || error);
      }

      // Execute the transaction
      const tx = contract.tx.donate(
        { gasLimit: gasRequired, storageDepositLimit: storageDeposit, value: amountInPlanks },
        campaignId
      );

      return tx;
    } catch (err) {
      throw new Error(`Failed to donate: ${err.message}`);
    }
  }, [contract, selectedAccount, mapError]);

  const withdrawFunds = useCallback(async (campaignId) => {
    if (!contract || !selectedAccount) {
      throw new Error('Contract not loaded or wallet not connected');
    }

    try {
      const { gasRequired, storageDeposit, result } = await contract.query.withdrawFunds(
        selectedAccount.address,
        { gasLimit: -1, storageDepositLimit: null },
        campaignId
      );

      if (result.isErr) {
        const error = result.asErr.toString();
        throw new Error(mapError(error) || error);
      }

      // Execute the transaction
      const tx = contract.tx.withdrawFunds(
        { gasLimit: gasRequired, storageDepositLimit: storageDeposit },
        campaignId
      );

      return tx;
    } catch (err) {
      throw new Error(`Failed to withdraw funds: ${err.message}`);
    }
  }, [contract, selectedAccount, mapError]);

  useEffect(() => {
    if (contract) {
      fetchCampaigns();
    } else {
      setIsLoading(false);
    }
  }, [contract, fetchCampaigns]);

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