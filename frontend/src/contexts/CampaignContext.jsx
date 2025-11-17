import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useWallet } from './WalletContext';
import { useApi, createGasLimit } from './ApiContext';
import { prepareContractTransaction, defaultRetryOptions } from '../utils/contractRetry';
import { formatDOT } from '../utils/formatters';
import {
  validateCampaignTitle,
  validateCampaignDescription,
  validateSubstrateAddress,
  sanitizeText,
  validateGoalAmount,
  validateDonationAmount,
} from '../utils/validation';
import { CONTRACT_LIMITS } from '../config/constants';
import { 
  getMockCampaigns, 
  addMockCampaign, 
  getMockCampaignById, 
  getMockDonations,
  addMockDonation,
  updateMockCampaignState 
} from '../utils/mockStorage';

const CampaignContext = createContext({});

// Map contract errors to user-friendly messages
const mapError = (error) => {
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
    'Unauthorized': 'You are not authorized to perform this action.',
    'CampaignNotFailed': 'Campaign has not failed - refunds are only available for failed campaigns.',
    'NoDonationFound': 'You have no donation to refund for this campaign.',
    'RefundAlreadyClaimed': 'You have already claimed your refund for this campaign.',
    'RefundFailed': 'Refund transfer failed. Please try again.',
  };
  return errorMappings[error] || 'An unexpected error occurred.';
};

export const CampaignProvider = ({ children }) => {
  const { api, contract } = useApi();
  const { selectedAccount } = useWallet();
  const [campaigns, setCampaigns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCampaigns = useCallback(async () => {
    console.log('[CampaignContext] fetchCampaigns called');
    console.log('[CampaignContext] contract exists:', !!contract);
    console.log('[CampaignContext] contract address:', contract?.address?.toString());
    
    if (!contract) {
      // Use mock storage if contract not available
      console.log('[CampaignContext] ⚠️  Using mock storage - contract not loaded');
      console.log('[CampaignContext] Check: VITE_CONTRACT_ADDRESS in .env.local');
      const mockCampaigns = getMockCampaigns();
      // Convert string to BigInt if needed and sanitize user-facing text
      const parsedCampaigns = mockCampaigns.map(c => ({
        ...c,
        title: sanitizeText(c.title),
        description: sanitizeText(c.description),
        goal: typeof c.goal === 'string' ? BigInt(c.goal) : c.goal,
        raised: typeof c.raised === 'string' ? BigInt(c.raised) : c.raised,
      }));
      setCampaigns(parsedCampaigns);
      setIsLoading(false);
      return;
    }
    
    console.log('[CampaignContext] ✅ Using blockchain mode - querying contract');
    console.log('[CampaignContext] contract.query:', contract.query);
    console.log('[CampaignContext] Available methods:', Object.keys(contract.query || {}));

    try {
      // Check if the method exists (Polkadot.js converts snake_case to camelCase)
      if (!contract.query || typeof contract.query.getCampaignsPaginated !== 'function') {
        console.error('[CampaignContext] ❌ contract.query.getCampaignsPaginated is not a function');
        console.error('[CampaignContext] Available query methods:', Object.keys(contract.query || {}));
        console.warn('[CampaignContext] ⚠️  Falling back to mock storage - contract method not available');
        
        // Fall back to mock storage
        const mockCampaigns = getMockCampaigns();
        const parsedCampaigns = mockCampaigns.map(c => ({
          ...c,
          title: sanitizeText(c.title),
          description: sanitizeText(c.description),
          goal: typeof c.goal === 'string' ? BigInt(c.goal) : c.goal,
          raised: typeof c.raised === 'string' ? BigInt(c.raised) : c.raised,
        }));
        setCampaigns(parsedCampaigns);
        setIsLoading(false);
        setError('Contract not compatible. Using demo mode.');
        return;
      }

      // Use getCampaignsPaginated method (Polkadot.js converts snake_case to camelCase)
      const { result, output } = await contract.query.getCampaignsPaginated(
        selectedAccount?.address || '', 
        { gasLimit: createGasLimit(api) },
        0, // start index
        100 // max count
      );

      if (result.isErr) {
        const errorMsg = result.asErr.toString();
        console.error('[CampaignContext] ❌ Contract query failed:', errorMsg);
        console.error('[CampaignContext] Error details:', JSON.stringify(result.asErr, null, 2));
        
        // If contract traps, it might be an old version - use mock mode
        if (errorMsg.includes('ContractTrapped') || errorMsg.includes('module')) {
          console.warn('[CampaignContext] ⚠️  Contract trapped - likely version mismatch. Using mock mode.');
          const mockCampaigns = getMockCampaigns();
          const parsedCampaigns = mockCampaigns.map(c => ({
            ...c,
            title: sanitizeText(c.title),
            description: sanitizeText(c.description),
            goal: typeof c.goal === 'string' ? BigInt(c.goal) : c.goal,
            raised: typeof c.raised === 'string' ? BigInt(c.raised) : c.raised,
          }));
          setCampaigns(parsedCampaigns);
          setIsLoading(false);
          setError('Contract version mismatch. Using demo mode. Please redeploy the latest contract.');
          return;
        }
        
        throw new Error(`Contract error: ${errorMsg}`);
      }

      // Contract returns Result<Vec<Campaign>, Error> so we need to unwrap it
      const outputHuman = output.toHuman();
      console.log('[CampaignContext] Output:', outputHuman);
      
      // Handle Result type (either { Ok: [...] } or { Err: ... })
      const campaignsData = outputHuman?.Ok || outputHuman || [];
      console.log('[CampaignContext] Campaigns data:', campaignsData);
      console.log('[CampaignContext] Is array?', Array.isArray(campaignsData));
      
      if (!Array.isArray(campaignsData)) {
        console.warn('[CampaignContext] ⚠️  Campaigns data is not an array, setting empty array');
        setCampaigns([]);
        setIsLoading(false);
        return;
      }
      
      const formattedCampaigns = campaignsData.map(campaign => {
        console.log('[CampaignContext] 🔍 Raw campaign data from contract:', campaign);
        
        const formatted = {
          id: parseInt(campaign.id),
          owner: campaign.owner,
          title: sanitizeText(campaign.title),
          description: sanitizeText(campaign.description),
          goal: BigInt(campaign.goal.replace(/,/g, '')),
          raised: BigInt(campaign.raised.replace(/,/g, '')),
          deadline: parseInt(campaign.deadline.replace(/,/g, '')),
          state: campaign.state,
          beneficiary: campaign.beneficiary,
        };
        console.log('[CampaignContext] 📋 Formatted campaign:', {
          rawId: campaign.id,
          parsedId: formatted.id,
          title: formatted.title,
          state: formatted.state,
          owner: formatted.owner
        });
        return formatted;
      });

      console.log('[CampaignContext] ✅ Total campaigns fetched:', formattedCampaigns.length);
      setCampaigns(formattedCampaigns);
    } catch (err) {
      console.error('Failed to fetch campaigns:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [contract, selectedAccount]);

  const getCampaignDetails = useCallback(async (campaignId) => {
    // Convert to number if it's a string
    const numericId = typeof campaignId === 'string' ? parseInt(campaignId, 10) : campaignId;
    
    console.log('[CampaignContext] getCampaignDetails called:', {
      originalId: campaignId,
      numericId,
      idType: typeof campaignId,
      hasContract: !!contract
    });
    
    if (!contract) {
      // Use mock storage
      console.log('[CampaignContext] Using mock storage for campaign:', numericId);
      const campaign = getMockCampaignById(numericId);
      if (!campaign) {
        console.error('[CampaignContext] Campaign not found in mock storage:', numericId);
        throw new Error('Campaign not found');
      }
      
      const donations = getMockDonations(numericId);
      
      return {
        campaign: {
          ...campaign,
          title: sanitizeText(campaign.title),
          description: sanitizeText(campaign.description),
        },
        donations,
      };
    }

    try {
      console.log('[CampaignContext] Querying blockchain for campaign:', numericId);
      const { result, output } = await contract.query.getCampaignDetails(
        selectedAccount?.address || '', 
        { gasLimit: createGasLimit(api) }, 
        numericId,
        0, // offset for donations pagination
        100 // limit - get up to 100 donations
      );

      if (result.isErr) {
        const errorMsg = result.asErr.toString();
        console.error('[CampaignContext] Query error:', errorMsg);
        throw new Error(`Contract error: ${errorMsg}`);
      }

      if (!output) {
        console.error('[CampaignContext] No output from contract for campaign:', numericId);
        throw new Error('Campaign not found');
      }

      const outputHuman = output.toHuman();
      console.log('[CampaignContext] Campaign details retrieved:', outputHuman);
      
      // Contract returns Result<CampaignDetails, Error>, so unwrap the Ok value
      const details = outputHuman.Ok || outputHuman;
      
      if (!details || !details.campaign) {
        console.error('[CampaignContext] Campaign not found or invalid response:', details);
        throw new Error('Campaign not found');
      }
      
      // Contract returns CampaignDetails { campaign, donations, total_donations }
      const campaign = details.campaign;
      const donations = details.donations || [];
      
      console.log('[CampaignContext] ✅ Parsed campaign:', {
        id: campaign.id,
        title: campaign.title,
        owner: campaign.owner,
        donationsCount: donations.length
      });

      return {
        campaign: {
          id: parseInt(campaign.id),
          owner: campaign.owner,
          title: sanitizeText(campaign.title),
          description: sanitizeText(campaign.description),
          goal: BigInt(campaign.goal.replace(/,/g, '')),
          raised: BigInt(campaign.raised.replace(/,/g, '')),
          deadline: parseInt(campaign.deadline.replace(/,/g, '')),
          state: campaign.state,
          beneficiary: campaign.beneficiary,
        },
        donations: donations.map(donation => ({
          donor: donation.donor,
          amount: BigInt(donation.amount.replace(/,/g, '')),
          timestamp: parseInt(donation.timestamp.replace(/,/g, ''))
        })),
        totalDonations: parseInt(details.totalDonations || details.total_donations || '0')
      };
    } catch (err) {
      throw new Error(`Failed to get campaign details: ${err.message}`);
    }
  }, [contract, selectedAccount]);

  const createCampaign = useCallback(async (campaignData) => {
    console.log('[CampaignContext] createCampaign called with:', campaignData);
    console.log('[CampaignContext] contract exists:', !!contract);
    console.log('[CampaignContext] selectedAccount:', selectedAccount?.address);
    
    if (!contract) {
      // Use mock storage
      console.log('[CampaignContext] Using mock storage for campaign creation');
      console.log('[CampaignContext] Campaign data:', campaignData);
      
      try {
        if (!selectedAccount) {
          throw new Error('Wallet not connected');
        }
        
        const sanitizedTitle = validateCampaignTitle(campaignData.title);
        const sanitizedDescription = validateCampaignDescription(campaignData.description);
        const goalInPlancks = validateGoalAmount(campaignData.goal);
        if (!validateSubstrateAddress(campaignData.beneficiary)) {
          throw new Error('Invalid beneficiary address.');
        }
        
        console.log('[CampaignContext] Validation passed, creating mock campaign');
        
        const newCampaign = addMockCampaign({
          ...campaignData,
          title: sanitizedTitle,
          description: sanitizedDescription,
          owner: selectedAccount.address,
          goal: goalInPlancks,
        });
        
        console.log('[CampaignContext] Mock campaign created:', newCampaign);
        
        // Refresh campaigns list
        await fetchCampaigns();
        
        console.log('[CampaignContext] Campaigns refreshed, returning success');
        return { success: true, campaignId: newCampaign.id };
      } catch (mockErr) {
        console.error('[CampaignContext] Error in mock campaign creation:', mockErr);
        throw mockErr;
      }
    }

    console.log('[CampaignContext] Contract exists, using blockchain mode');
    
    if (!selectedAccount) {
      throw new Error('Contract not loaded or wallet not connected');
    }

    try {
      // Log exact parameters being sent
      console.log('[CampaignContext] 🔍 Creating campaign with parameters:', {
        title: campaignData.title,
        titleLength: campaignData.title?.length,
        description: campaignData.description,
        descriptionLength: campaignData.description?.length,
        goal: campaignData.goal,
        goalType: typeof campaignData.goal,
        deadline: campaignData.deadline,
        deadlineType: typeof campaignData.deadline,
        beneficiary: campaignData.beneficiary,
      });
      
      const sanitizedTitle = validateCampaignTitle(campaignData.title);
      const sanitizedDescription = validateCampaignDescription(campaignData.description);
      const goalInPlancks = validateGoalAmount(campaignData.goal);

      if (!validateSubstrateAddress(campaignData.beneficiary)) {
        throw new Error('Invalid beneficiary address.');
      }

      // Prepare transaction with automatic retry on transient errors
      const tx = await prepareContractTransaction(
        contract,
        'createCampaign', // Use camelCase - Polkadot.js converts snake_case ABI methods to camelCase
        selectedAccount.address,
        [
          sanitizedTitle,
          sanitizedDescription,
          goalInPlancks.toString(),
          Number(campaignData.deadline),
          campaignData.beneficiary,
        ],
        {
          ...defaultRetryOptions,
          queryOptions: { 
            storageDepositLimit: CONTRACT_LIMITS.MAX_STORAGE_DEPOSIT ? CONTRACT_LIMITS.MAX_STORAGE_DEPOSIT.toString() : null
          },
          txOptions: { 
            storageDepositLimit: CONTRACT_LIMITS.MAX_STORAGE_DEPOSIT ? CONTRACT_LIMITS.MAX_STORAGE_DEPOSIT.toString() : null
          },
          api,
          onRetry: (attempt, maxRetries, delay, error) => {
            console.warn(
              `Retrying create campaign (attempt ${attempt}/${maxRetries}) after ${delay}ms:`,
              error.message
            );
          },
        }
      );

      return tx;
    } catch (err) {
      // Map error to user-friendly message
      console.error('[CampaignContext] Error creating campaign:', err);
      console.error('[CampaignContext] Error message:', err.message);
      console.error('[CampaignContext] Error stack:', err.stack);
      const errorMessage = mapError(err.message) || err.message;
      throw new Error(`Failed to create campaign: ${errorMessage}`);
    }
  }, [contract, selectedAccount, fetchCampaigns]);

  const donateToCampaign = useCallback(async (campaignId, amount) => {
    console.log('[CampaignContext] donateToCampaign called:', {
      campaignId,
      amount: amount.toString(),
      hasContract: !!contract,
      hasAccount: !!selectedAccount
    });
    
    if (!contract) {
      // Use mock storage
      console.log('[CampaignContext] ⚠️  No contract - using mock mode');
      if (!selectedAccount) {
        throw new Error('Wallet not connected');
      }
      
      // amount is already in plancks (converted by parseDOT)
      const amountInPlanks = BigInt(amount);
      addMockDonation(campaignId, selectedAccount.address, amountInPlanks);
      
      // Refresh campaigns list
      await fetchCampaigns();
      
      return { success: true, mock: true };
    }

    if (!selectedAccount) {
      throw new Error('Contract not loaded or wallet not connected');
    }

    console.log('[CampaignContext] ✅ Blockchain mode - preparing donation transaction');
    
    try {
      // amount is already in plancks (converted by parseDOT in DonationInterface)
      const amountInPlanks = validateDonationAmount(amount);

      console.log('[CampaignContext] Donating:', {
        campaignId,
        amountInPlanks: amountInPlanks.toString(),
        amountInDOT: formatDOT(amountInPlanks)
      });

      // Prepare transaction with automatic retry on transient errors
      const tx = await prepareContractTransaction(
        contract,
        'donate',
        selectedAccount.address,
        [campaignId],
        {
          ...defaultRetryOptions,
          api,
          queryOptions: { value: amountInPlanks },
          txOptions: { value: amountInPlanks },
          onRetry: (attempt, maxRetries, delay, error) => {
            console.warn(
              `Retrying donation (attempt ${attempt}/${maxRetries}) after ${delay}ms:`,
              error.message
            );
          },
        }
      );

      return tx;
    } catch (err) {
      // Map error to user-friendly message
      console.error('[CampaignContext] ❌ Error donating:', err);
      console.error('[CampaignContext] Error message:', err.message);
      console.error('[CampaignContext] Error stack:', err.stack);
      const errorMessage = mapError(err.message) || err.message;
      throw new Error(`Failed to donate: ${errorMessage}`);
    }
  }, [contract, selectedAccount, fetchCampaigns]);

  const withdrawFunds = useCallback(async (campaignId) => {
    if (!contract || !selectedAccount) {
      throw new Error('Contract not loaded or wallet not connected');
    }

    try {
      // Prepare transaction with automatic retry on transient errors
      const tx = await prepareContractTransaction(
        contract,
        'withdrawFunds', // Use camelCase - Polkadot.js converts snake_case ABI methods to camelCase
        selectedAccount.address,
        [campaignId],
        {
          ...defaultRetryOptions,
          api,
          queryOptions: {
            storageDepositLimit: CONTRACT_LIMITS.MAX_STORAGE_DEPOSIT.toString(),
          },
          txOptions: {
            storageDepositLimit: CONTRACT_LIMITS.MAX_STORAGE_DEPOSIT.toString(),
          },
          onRetry: (attempt, maxRetries, delay, error) => {
            console.warn(
              `Retrying withdraw funds (attempt ${attempt}/${maxRetries}) after ${delay}ms:`,
              error.message
            );
          },
        }
      );

      return tx;
    } catch (err) {
      // Map error to user-friendly message
      const errorMessage = mapError(err.message) || err.message;
      throw new Error(`Failed to withdraw funds: ${errorMessage}`);
    }
  }, [contract, selectedAccount]);

  const cancelCampaign = useCallback(async (campaignId) => {
    if (!contract) {
      // Use mock storage
      if (!selectedAccount) {
        throw new Error('Wallet not connected');
      }
      
      const campaign = getMockCampaignById(campaignId);
      if (!campaign) {
        throw new Error('Campaign not found.');
      }
      
      if (campaign.owner !== selectedAccount.address) {
        throw new Error('Only the campaign owner can perform this action.');
      }
      
      updateMockCampaignState(campaignId, 'Cancelled');
      
      // Refresh campaigns list
      await fetchCampaigns();
      
      return { success: true };
    }

    if (!selectedAccount) {
      throw new Error('Contract not loaded or wallet not connected');
    }

    try {
      // Prepare transaction with automatic retry on transient errors
      const tx = await prepareContractTransaction(
        contract,
        'cancelCampaign', // Use camelCase - Polkadot.js converts snake_case ABI methods to camelCase
        selectedAccount.address,
        [campaignId],
        {
          ...defaultRetryOptions,
          api,
          onRetry: (attempt, maxRetries, delay, error) => {
            console.warn(
              `Retrying cancel campaign (attempt ${attempt}/${maxRetries}) after ${delay}ms:`,
              error.message
            );
          },
        }
      );

      return tx;
    } catch (err) {
      // Map error to user-friendly message
      const errorMessage = mapError(err.message) || err.message;
      throw new Error(`Failed to cancel campaign: ${errorMessage}`);
    }
  }, [contract, selectedAccount, fetchCampaigns]);

  const claimRefund = useCallback(async (campaignId) => {
    if (!contract || !selectedAccount) {
      throw new Error('Contract not loaded or wallet not connected');
    }

    try {
      // Prepare transaction with automatic retry on transient errors
      const tx = await prepareContractTransaction(
        contract,
        'claimRefund', // Use camelCase - Polkadot.js converts snake_case ABI methods to camelCase
        selectedAccount.address,
        [campaignId],
        {
          ...defaultRetryOptions,
          api,
          onRetry: (attempt, maxRetries, delay, error) => {
            console.warn(
              `Retrying claim refund (attempt ${attempt}/${maxRetries}) after ${delay}ms:`,
              error.message
            );
          },
        }
      );

      return tx;
    } catch (err) {
      // Map error to user-friendly message
      const errorMessage = mapError(err.message) || err.message;
      throw new Error(`Failed to claim refund: ${errorMessage}`);
    }
  }, [contract, selectedAccount]);

  // ==================== Quadratic Funding Functions ====================

  const fundMatchingPool = useCallback(async (amount) => {
    if (!contract || !selectedAccount) {
      throw new Error('Contract or wallet not connected');
    }

    try {
      const tx = await prepareContractTransaction(
        contract,
        'fundMatchingPool',
        selectedAccount.address,
        [],
        {
          ...defaultRetryOptions,
          api,
          value: amount, // Send DOT with the transaction
        }
      );

      return tx;
    } catch (err) {
      throw new Error(`Failed to fund matching pool: ${err.message}`);
    }
  }, [contract, selectedAccount, api]);

  const createMatchingRound = useCallback(async (poolAmount, durationMs) => {
    if (!contract || !selectedAccount) {
      throw new Error('Contract or wallet not connected');
    }

    try {
      const tx = await prepareContractTransaction(
        contract,
        'createMatchingRound',
        selectedAccount.address,
        [poolAmount, durationMs],
        {
          ...defaultRetryOptions,
          api,
        }
      );

      return tx;
    } catch (err) {
      throw new Error(`Failed to create matching round: ${err.message}`);
    }
  }, [contract, selectedAccount, api]);

  const distributeMatching = useCallback(async (roundId) => {
    if (!contract || !selectedAccount) {
      throw new Error('Contract or wallet not connected');
    }

    try {
      const tx = await prepareContractTransaction(
        contract,
        'calculateAndDistributeMatching',
        selectedAccount.address,
        [roundId],
        {
          ...defaultRetryOptions,
          api,
        }
      );

      return tx;
    } catch (err) {
      throw new Error(`Failed to distribute matching: ${err.message}`);
    }
  }, [contract, selectedAccount, api]);

  const getEstimatedMatching = useCallback(async (campaignId) => {
    if (!contract) {
      return '0';
    }

    try {
      const { result, output } = await contract.query.getEstimatedMatching(
        selectedAccount?.address || '',
        { gasLimit: createGasLimit(api) },
        campaignId
      );

      if (result.isErr) {
        console.error('Error getting estimated matching:', result.asErr.toString());
        return '0';
      }

      const value = output?.toHuman() || '0';
      return typeof value === 'string' ? value.replace(/,/g, '') : value.toString();
    } catch (err) {
      console.error('Failed to get estimated matching:', err);
      return '0';
    }
  }, [contract, selectedAccount, api]);

  const getMatchingPoolBalance = useCallback(async () => {
    if (!contract) {
      return '0';
    }

    try {
      const { result, output } = await contract.query.getMatchingPoolBalance(
        selectedAccount?.address || '',
        { gasLimit: createGasLimit(api) }
      );

      if (result.isErr) {
        console.error('Error getting matching pool balance:', result.asErr.toString());
        return '0';
      }

      const value = output?.toHuman() || '0';
      return typeof value === 'string' ? value.replace(/,/g, '') : value.toString();
    } catch (err) {
      console.error('Failed to get matching pool balance:', err);
      return '0';
    }
  }, [contract, selectedAccount, api]);

  const getCurrentRound = useCallback(async () => {
    if (!contract) {
      return null;
    }

    try {
      const { result, output } = await contract.query.getCurrentRound(
        selectedAccount?.address || '',
        { gasLimit: createGasLimit(api) }
      );

      if (result.isErr) {
        console.error('Error getting current round:', result.asErr.toString());
        return null;
      }

      const value = output?.toHuman();
      return value && value !== 'None' ? parseInt(value) : null;
    } catch (err) {
      console.error('Failed to get current round:', err);
      return null;
    }
  }, [contract, selectedAccount, api]);

  const getRoundDetails = useCallback(async (roundId) => {
    if (!contract) {
      return null;
    }

    try {
      const { result, output } = await contract.query.getRound(
        selectedAccount?.address || '',
        { gasLimit: createGasLimit(api) },
        roundId
      );

      if (result.isErr) {
        console.error('Error getting round details:', result.asErr.toString());
        return null;
      }

      const value = output?.toHuman();
      if (!value || value === 'None') {
        return null;
      }

      return {
        id: parseInt(value.id),
        poolAmount: value.poolAmount.replace(/,/g, ''),
        endTime: parseInt(value.endTime.replace(/,/g, '')),
        distributed: value.distributed === 'true' || value.distributed === true,
      };
    } catch (err) {
      console.error('Failed to get round details:', err);
      return null;
    }
  }, [contract, selectedAccount, api]);

  // ==================== DAO Milestone Voting Functions ====================

  const addMilestones = useCallback(async (campaignId, milestonesData) => {
    if (!contract || !selectedAccount) {
      throw new Error('Contract or wallet not connected');
    }

    try {
      const tx = await prepareContractTransaction(
        contract,
        'addMilestones',
        selectedAccount.address,
        [campaignId, milestonesData],
        {
          ...defaultRetryOptions,
          api,
        }
      );

      return tx;
    } catch (err) {
      throw new Error(`Failed to add milestones: ${err.message}`);
    }
  }, [contract, selectedAccount, api]);

  const activateMilestoneVoting = useCallback(async (campaignId, milestoneIndex) => {
    if (!contract || !selectedAccount) {
      throw new Error('Contract or wallet not connected');
    }

    try {
      const tx = await prepareContractTransaction(
        contract,
        'activateMilestoneVoting',
        selectedAccount.address,
        [campaignId, milestoneIndex],
        {
          ...defaultRetryOptions,
          api,
        }
      );

      return tx;
    } catch (err) {
      throw new Error(`Failed to activate milestone voting: ${err.message}`);
    }
  }, [contract, selectedAccount, api]);

  const voteOnMilestone = useCallback(async (campaignId, milestoneIndex, approve) => {
    if (!contract || !selectedAccount) {
      throw new Error('Contract or wallet not connected');
    }

    try {
      const tx = await prepareContractTransaction(
        contract,
        'voteOnMilestone',
        selectedAccount.address,
        [campaignId, milestoneIndex, approve],
        {
          ...defaultRetryOptions,
          api,
        }
      );

      return tx;
    } catch (err) {
      throw new Error(`Failed to vote on milestone: ${err.message}`);
    }
  }, [contract, selectedAccount, api]);

  const releaseMilestoneFunds = useCallback(async (campaignId, milestoneIndex) => {
    if (!contract || !selectedAccount) {
      throw new Error('Contract or wallet not connected');
    }

    try {
      const tx = await prepareContractTransaction(
        contract,
        'releaseMilestoneFunds',
        selectedAccount.address,
        [campaignId, milestoneIndex],
        {
          ...defaultRetryOptions,
          api,
        }
      );

      return tx;
    } catch (err) {
      throw new Error(`Failed to release milestone funds: ${err.message}`);
    }
  }, [contract, selectedAccount, api]);

  const getMilestones = useCallback(async (campaignId) => {
    if (!contract) {
      return [];
    }

    try {
      const { result, output } = await contract.query.getMilestones(
        selectedAccount?.address || '',
        { gasLimit: createGasLimit(api) },
        campaignId
      );

      if (result.isErr) {
        console.error('Error getting milestones:', result.asErr.toString());
        return [];
      }

      const value = output?.toHuman();
      if (!value || value === 'None') {
        return [];
      }

      // Parse milestones
      return value.map(m => ({
        description: m.description,
        percentage: parseInt(m.percentage.replace(/,/g, '')),
        deadline: parseInt(m.deadline.replace(/,/g, '')),
        votesFor: m.votesFor.replace(/,/g, ''),
        votesAgainst: m.votesAgainst.replace(/,/g, ''),
        released: m.released === 'true' || m.released === true,
        votingActive: m.votingActive === 'true' || m.votingActive === true,
      }));
    } catch (err) {
      console.error('Failed to get milestones:', err);
      return [];
    }
  }, [contract, selectedAccount, api]);

  const hasVotedOnMilestone = useCallback(async (campaignId, milestoneIndex, voter) => {
    if (!contract) {
      return false;
    }

    try {
      const { result, output } = await contract.query.hasVotedOnMilestone(
        selectedAccount?.address || '',
        { gasLimit: createGasLimit(api) },
        campaignId,
        milestoneIndex,
        voter
      );

      if (result.isErr) {
        return false;
      }

      return output?.toHuman() === 'true' || output?.toHuman() === true;
    } catch (err) {
      console.error('Failed to check vote status:', err);
      return false;
    }
  }, [contract, selectedAccount, api]);

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
        contract, // Export contract so components can check if blockchain mode is active
        createCampaign,
        donateToCampaign,
        getCampaignDetails,
        withdrawFunds,
        cancelCampaign,
        claimRefund,
        refreshCampaigns: fetchCampaigns,
        // Quadratic funding functions
        fundMatchingPool,
        createMatchingRound,
        distributeMatching,
        getEstimatedMatching,
        getMatchingPoolBalance,
        getCurrentRound,
        getRoundDetails,
        // DAO milestone voting functions
        addMilestones,
        activateMilestoneVoting,
        voteOnMilestone,
        releaseMilestoneFunds,
        getMilestones,
        hasVotedOnMilestone,
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