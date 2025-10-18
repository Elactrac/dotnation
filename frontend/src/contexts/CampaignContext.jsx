import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useWallet } from './WalletContext';
import { metrics } from '../utils/metrics';
import { asyncCache } from '../utils/cache';

const CampaignContext = createContext({});

export const CampaignProvider = ({ children }) => {
  const { api, selectedAccount } = useWallet();
  const [campaigns, setCampaigns] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCampaigns = useCallback(async () => {
    if (!api) return;

    const startTime = Date.now();
    setIsLoading(true);
    setError(null);

    try {
      // Use async cache to prevent duplicate requests and cache results
      const formattedCampaigns = await asyncCache.getOrCompute(
        'campaigns:active',
        async () => {
          const apiStartTime = Date.now();
          const activeCampaigns = await api.query.donationPlatform.getActiveCampaigns();
          metrics.recordApiCall('getActiveCampaigns', Date.now() - apiStartTime, true);

          // Format the campaigns for frontend use
          return activeCampaigns.map((campaign) => ({
            id: campaign.id.toNumber(),
            owner: campaign.owner.toString(),
            title: campaign.title.toString(),
            description: campaign.description.toString(),
            goal: campaign.goal.toBigInt(),
            raised: campaign.raised.toBigInt(),
            deadline: campaign.deadline.toNumber(),
            state: campaign.state.toString(),
            beneficiary: campaign.beneficiary.toString(),
          }));
        },
        30000 // Cache for 30 seconds
      );

      setCampaigns(formattedCampaigns);
      metrics.recordApiCall('fetchCampaigns', Date.now() - startTime, true);
    } catch (err) {
      setError(err.message);
      console.error('Failed to fetch campaigns:', err);
      metrics.recordApiCall('fetchCampaigns', Date.now() - startTime, false);
      metrics.recordError(err, 'error', { operation: 'fetchCampaigns' });
    } finally {
      setIsLoading(false);
    }
  }, [api]);

  const getCampaignDetails = useCallback(async (campaignId) => {
    if (!api) throw new Error('API not connected');
    
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

  const createCampaign = useCallback(async (campaignData) => {
    if (!api || !selectedAccount) {
      throw new Error('Wallet not connected');
    }

    const startTime = metrics.startTransaction();

    try {
      const tx = api.tx.donationPlatform.createCampaign(
        campaignData.title,
        campaignData.description,
        campaignData.goal,
        campaignData.deadline,
        campaignData.beneficiary || selectedAccount.address
      );

      await tx.signAndSend(selectedAccount.address);

      // Record successful campaign creation
      metrics.completeTransaction(startTime, true, {
        operation: 'createCampaign',
        title: campaignData.title,
        goal: campaignData.goal.toString()
      });

      // Invalidate cache since we added a new campaign
      asyncCache.invalidate('campaigns:*');

      await fetchCampaigns(); // Refresh the campaign list
    } catch (err) {
      metrics.completeTransaction(startTime, false, {
        operation: 'createCampaign',
        error: err.message
      });
      metrics.recordError(err, 'error', { operation: 'createCampaign' });
      throw new Error(`Failed to create campaign: ${err.message}`);
    }
  }, [api, selectedAccount, fetchCampaigns]);

  const donateToCampaign = useCallback(async (campaignId, amount) => {
    if (!api || !selectedAccount) {
      throw new Error('Wallet not connected');
    }

    const startTime = metrics.startTransaction();

    try {
      // Convert amount to the smallest unit if needed
      const amountInSmallestUnit = BigInt(amount * 1_000_000_000_000); // Convert DOT to its smallest unit

      const tx = api.tx.donationPlatform.donate(campaignId);
      await tx.signAndSend(selectedAccount.address, { value: amountInSmallestUnit });

      // Record successful donation
      metrics.recordDonation(amountInSmallestUnit, campaignId, {
        donor: selectedAccount.address
      });
      metrics.completeTransaction(startTime, true, {
        operation: 'donateToCampaign',
        campaignId,
        amount: amountInSmallestUnit.toString()
      });

      // Invalidate cache since campaign data changed
      asyncCache.invalidate(`campaigns:*`);

      await fetchCampaigns(); // Refresh the campaign list
    } catch (err) {
      metrics.completeTransaction(startTime, false, {
        operation: 'donateToCampaign',
        campaignId,
        amount: amount.toString(),
        error: err.message
      });
      metrics.recordError(err, 'error', { operation: 'donateToCampaign' });
      throw new Error(`Failed to donate: ${err.message}`);
    }
  }, [api, selectedAccount, fetchCampaigns]);

  const withdrawFunds = useCallback(async (campaignId) => {
    if (!api || !selectedAccount) {
      throw new Error('Wallet not connected');
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
    if (api) {
      fetchCampaigns();
    } else {
      setIsLoading(false);
    }
  }, [api, fetchCampaigns]);

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