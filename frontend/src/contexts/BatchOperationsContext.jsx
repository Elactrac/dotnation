import { createContext, useContext, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { web3Enable, web3FromAddress } from '@polkadot/extension-dapp';
import { useApi, createGasLimit } from './ApiContext';
import { useWallet } from './WalletContext';
import {
  validateCampaignTitle,
  validateCampaignDescription,
  validateSubstrateAddress,
  validateGoalAmount,
} from '../utils/validation';
import { CONTRACT_LIMITS } from '../config/constants';

// Simple toast utility without Chakra UI
const showToast = ({ title, description, status }) => {
  console.log(`[${status.toUpperCase()}] ${title}: ${description}`);
  // In a real implementation, you'd show a custom toast component
  // For now, we'll use console.log as a placeholder
};

const BatchOperationsContext = createContext();

export const useBatchOperations = () => {
  const context = useContext(BatchOperationsContext);
  if (!context) {
    throw new Error('useBatchOperations must be used within BatchOperationsProvider');
  }
  return context;
};

export const BatchOperationsProvider = ({ children }) => {
  const { api, contract } = useApi();
  const { selectedAccount } = useWallet();

  const [batchLoading, setBatchLoading] = useState(false);
  const [batchProgress, setBatchProgress] = useState({ current: 0, total: 0 });

  /**
   * Create multiple campaigns in a single batch transaction
   * @param {Array} campaignsData - Array of campaign objects with { title, description, goal, deadline, beneficiary }
   * @returns {Promise<Object>} Result object with successful and failed counts
   */
  const createCampaignsBatch = useCallback(async (campaignsData) => {
    if (!api || !contract || !selectedAccount) {
      throw new Error('API, contract, or wallet not connected');
    }

    if (!Array.isArray(campaignsData) || campaignsData.length === 0) {
      throw new Error('campaignsData must be a non-empty array');
    }

    setBatchLoading(true);
    setBatchProgress({ current: 0, total: campaignsData.length });

    try {
      // Enable web3 extension
      const extensions = await web3Enable('DotNation');
      if (!extensions || extensions.length === 0) {
        throw new Error('No Polkadot extension found. Please install a Polkadot wallet extension.');
      }

      // Get the injector for signing
      const injector = await web3FromAddress(selectedAccount.address);
      if (!injector || !injector.signer) {
        throw new Error('Failed to get signer from wallet extension.');
      }

      // Validate and format campaign data for the contract
      const formattedData = campaignsData.map((campaign, index) => {
        try {
          const title = validateCampaignTitle(campaign.title);
          const description = validateCampaignDescription(campaign.description);
          const goal = validateGoalAmount(campaign.goal).toString();

          if (!validateSubstrateAddress(campaign.beneficiary)) {
            throw new Error(`Invalid beneficiary address for campaign ${index + 1}`);
          }

          return [
            title,
            description,
            goal,
            Number(campaign.deadline),
            campaign.beneficiary,
          ];
        } catch (validationError) {
          throw new Error(validationError.message || `Invalid campaign data at index ${index}`);
        }
      });

      // Call the batch creation method (Polkadot.js converts snake_case to camelCase)
      const tx = contract.tx.createCampaignsBatch(
        {
          value: 0,
          gasLimit: createGasLimit(api),
          storageDepositLimit: CONTRACT_LIMITS.MAX_STORAGE_DEPOSIT.toString(),
        },
        formattedData
      );

      return new Promise((resolve, reject) => {
        tx.signAndSend(selectedAccount.address, { signer: injector.signer }, ({ status, events, dispatchError }) => {
          if (status.isInBlock) {
            console.log(`Batch transaction included in block: ${status.asInBlock}`);
          }

          if (status.isFinalized) {
            console.log(`Batch transaction finalized: ${status.asFinalized}`);

            if (dispatchError) {
              if (dispatchError.isModule) {
                const decoded = api.registry.findMetaError(dispatchError.asModule);
                const { docs, method, section } = decoded;
                reject(new Error(`${section}.${method}: ${docs.join(' ')}`));
              } else {
                reject(new Error(dispatchError.toString()));
              }
              return;
            }

            // Parse the result from events
            let batchResult = { successful: 0, failed: 0, successIds: [] };

            events.forEach(({ event }) => {
              if (event.section === 'contracts' && event.method === 'ContractEmitted') {
                // Parse the batch result from contract events
                try {
                  const decoded = contract.abi.decodeEvent(event.data[1]);
                  if (decoded.event.identifier === 'CampaignCreated') {
                    batchResult.successful++;
                    batchResult.successIds.push(decoded.args[0].toNumber());
                  }
                } catch (error) {
                  console.error('Error decoding event:', error);
                }
              }
            });

            batchResult.failed = campaignsData.length - batchResult.successful;

            showToast({
              title: 'Batch Creation Complete',
              description: `✅ ${batchResult.successful} campaigns created successfully${batchResult.failed > 0 ? `, ❌ ${batchResult.failed} failed` : ''}`,
              status: batchResult.failed === 0 ? 'success' : 'warning',
            });

            resolve(batchResult);
          }
        }).catch(error => {
          reject(error);
        });
      });
    } catch (error) {
      console.error('Batch campaign creation error:', error);
      showToast({
        title: 'Batch Creation Failed',
        description: error.message || 'Failed to create campaigns in batch',
        status: 'error',
      });
      throw error;
    } finally {
      setBatchLoading(false);
      setBatchProgress({ current: 0, total: 0 });
    }
  }, [api, contract, selectedAccount]);

  /**
   * Withdraw funds from a single batch of campaigns (internal helper)
   * @param {Array<number>} campaignIds - Array of campaign IDs to withdraw from
   * @param {Object} injector - Wallet injector with signer
   * @returns {Promise<Object>} Result object with successful and failed counts
   */
  const withdrawSingleBatch = useCallback(async (campaignIds, injector) => {
    const tx = contract.tx.withdrawFundsBatch(
      {
        value: 0,
        gasLimit: createGasLimit(api),
        storageDepositLimit: CONTRACT_LIMITS.MAX_STORAGE_DEPOSIT.toString(),
      },
      campaignIds
    );

    return new Promise((resolve, reject) => {
      tx.signAndSend(selectedAccount.address, { signer: injector.signer }, ({ status, events, dispatchError }) => {
        if (status.isInBlock) {
          console.log(`Batch withdrawal included in block: ${status.asInBlock}`);
        }

        if (status.isFinalized) {
          console.log(`Batch withdrawal finalized: ${status.asFinalized}`);

          if (dispatchError) {
            if (dispatchError.isModule) {
              const decoded = api.registry.findMetaError(dispatchError.asModule);
              const { docs, method, section } = decoded;
              reject(new Error(`${section}.${method}: ${docs.join(' ')}`));
            } else {
              reject(new Error(dispatchError.toString()));
            }
            return;
          }

          // Parse the result from events
          let batchResult = { successful: 0, failed: 0, successIds: [] };

          events.forEach(({ event }) => {
            if (event.section === 'contracts' && event.method === 'ContractEmitted') {
              try {
                console.log('[BatchWithdrawal] Raw event:', {
                  section: event.section,
                  method: event.method,
                  data: event.data,
                  dataLength: event.data?.length
                });

                // event.data structure: [contractAddress, eventData]
                if (!event.data || event.data.length < 2) {
                  console.warn('[BatchWithdrawal] Event data structure unexpected - length:', event.data?.length);
                  // Try to continue anyway - the batch might have succeeded
                  return;
                }
                
                const decoded = contract.abi.decodeEvent(event.data[1]);
                console.log('[BatchWithdrawal] Decoded event:', decoded.event.identifier);
                
                if (decoded.event.identifier === 'FundsWithdrawn') {
                  batchResult.successful++;
                  // Handle both array and object argument structures
                  const campaignId = decoded.args[0]?.toNumber?.() || decoded.args[0];
                  if (campaignId !== undefined) {
                    batchResult.successIds.push(campaignId);
                    console.log('[BatchWithdrawal] ✅ Campaign', campaignId, 'withdrawn successfully');
                  }
                } else if (decoded.event.identifier === 'BatchWithdrawalResult') {
                  // Handle batch result event if contract emits it
                  console.log('[BatchWithdrawal] Batch result event:', decoded.args);
                  batchResult.successful = decoded.args[0]?.toNumber?.() || 0;
                  batchResult.failed = decoded.args[1]?.toNumber?.() || 0;
                }
              } catch (error) {
                console.error('[BatchWithdrawal] Error decoding event:', error);
                console.error('[BatchWithdrawal] Event data:', event.data);
              }
            }
          });

          // Calculate failures
          batchResult.failed = campaignIds.length - batchResult.successful;
          
          // If we couldn't decode any events but transaction finalized without error,
          // check if System.ExtrinsicSuccess exists (indicates the extrinsic worked)
          if (batchResult.successful === 0 && !dispatchError) {
            const hasExtrinsicSuccess = events.some(({ event }) => 
              event.section === 'system' && event.method === 'ExtrinsicSuccess'
            );
            if (hasExtrinsicSuccess) {
              console.warn('[BatchWithdrawal] ⚠️  Transaction succeeded but no contract events decoded');
              console.warn('[BatchWithdrawal] This may indicate a contract version mismatch or event structure change');
              // Assume all campaigns succeeded since transaction didn't fail
              batchResult.successful = campaignIds.length;
              batchResult.failed = 0;
              batchResult.successIds = campaignIds;
            }
          }
          
          console.log('[BatchWithdrawal] Final result:', batchResult);
          resolve(batchResult);
        }
      }).catch(error => {
        reject(error);
      });
    });
  }, [api, contract, selectedAccount]);

  /**
   * Withdraw funds from multiple campaigns with automatic batch splitting
   * @param {Array<number>} campaignIds - Array of campaign IDs to withdraw from
   * @param {number} maxBatchSize - Maximum number of campaigns per batch (default: 5)
   * @returns {Promise<Object>} Result object with successful and failed counts
   */
  const withdrawFundsBatch = useCallback(async (campaignIds, maxBatchSize = 5) => {
    if (!api || !contract || !selectedAccount) {
      throw new Error('API, contract, or wallet not connected');
    }

    if (!Array.isArray(campaignIds) || campaignIds.length === 0) {
      throw new Error('campaignIds must be a non-empty array');
    }

    setBatchLoading(true);
    setBatchProgress({ current: 0, total: campaignIds.length });

    try {
      // Enable web3 extension
      const extensions = await web3Enable('DotNation');
      if (!extensions || extensions.length === 0) {
        throw new Error('No Polkadot extension found. Please install a Polkadot wallet extension.');
      }

      // Get the injector for signing
      const injector = await web3FromAddress(selectedAccount.address);
      if (!injector || !injector.signer) {
        throw new Error('Failed to get signer from wallet extension.');
      }

      // Split campaigns into batches
      const batches = [];
      for (let i = 0; i < campaignIds.length; i += maxBatchSize) {
        batches.push(campaignIds.slice(i, i + maxBatchSize));
      }

      console.log(`Splitting ${campaignIds.length} campaigns into ${batches.length} batches of max ${maxBatchSize}`);

      // Process batches sequentially
      let totalSuccessful = 0;
      let totalFailed = 0;
      let allSuccessIds = [];

      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];
        console.log(`Processing batch ${i + 1}/${batches.length} with ${batch.length} campaigns`);

        try {
          const batchResult = await withdrawSingleBatch(batch, injector);
          totalSuccessful += batchResult.successful;
          totalFailed += batchResult.failed;
          allSuccessIds = [...allSuccessIds, ...batchResult.successIds];

          // Update progress
          setBatchProgress({ 
            current: totalSuccessful + totalFailed, 
            total: campaignIds.length 
          });

          showToast({
            title: `Batch ${i + 1}/${batches.length} Complete`,
            description: `✅ ${batchResult.successful} successful${batchResult.failed > 0 ? `, ❌ ${batchResult.failed} failed` : ''}`,
            status: batchResult.failed === 0 ? 'success' : 'warning',
          });

        } catch (error) {
          console.error(`Batch ${i + 1} failed:`, error);
          
          // Check if it's a block limit error - try smaller batch size
          if (error.message.includes('ExhaustsResources') || 
              error.message.includes('block limits') ||
              error.message.includes('1010')) {
            
            // If batch size is already 1, we can't split further
            if (batch.length === 1) {
              totalFailed += batch.length;
              showToast({
                title: 'Withdrawal Failed',
                description: `Campaign ${batch[0]} failed: Transaction too large even for single withdrawal`,
                status: 'error',
              });
              continue;
            }

            // Try again with smaller batch size (half the current batch)
            const smallerBatchSize = Math.max(1, Math.floor(batch.length / 2));
            console.log(`Retrying batch ${i + 1} with smaller size: ${smallerBatchSize}`);
            
            showToast({
              title: 'Retrying with Smaller Batch',
              description: `Reducing batch size to ${smallerBatchSize} campaigns`,
              status: 'info',
            });

            // Recursively process this batch with smaller size
            const retryResult = await withdrawFundsBatch(batch, smallerBatchSize);
            totalSuccessful += retryResult.successful;
            totalFailed += retryResult.failed;
            allSuccessIds = [...allSuccessIds, ...retryResult.successIds];
          } else {
            // For other errors, mark all in this batch as failed
            totalFailed += batch.length;
            showToast({
              title: `Batch ${i + 1} Failed`,
              description: error.message || 'Unknown error',
              status: 'error',
            });
          }
        }

        // Small delay between batches to avoid overwhelming the network
        if (i < batches.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      const finalResult = {
        successful: totalSuccessful,
        failed: totalFailed,
        successIds: allSuccessIds
      };

      showToast({
        title: 'All Withdrawals Complete',
        description: `✅ ${totalSuccessful} total successful${totalFailed > 0 ? `, ❌ ${totalFailed} failed` : ''}`,
        status: totalFailed === 0 ? 'success' : 'warning',
      });

      return finalResult;

    } catch (error) {
      console.error('Batch withdrawal error:', error);
      showToast({
        title: 'Batch Withdrawal Failed',
        description: error.message || 'Failed to withdraw funds in batch',
        status: 'error',
      });
      throw error;
    } finally {
      setBatchLoading(false);
      setBatchProgress({ current: 0, total: 0 });
    }
  }, [api, contract, selectedAccount, withdrawSingleBatch]);

  /**
   * Get the contract version
   * @returns {Promise<number>} Contract version number
   */
  const getContractVersion = useCallback(async () => {
    if (!api || !contract) {
      throw new Error('API or contract not connected');
    }

    try {
      const { result, output } = await contract.query.getVersion(
        selectedAccount?.address || '5C4hrfjw9DjXZTzV3MwzrrAr9P1MJhSrvWGWqi1eSuyUpnhM',
        { value: 0, gasLimit: createGasLimit(api) }
      );

      if (result.isOk && output) {
        return output.toNumber();
      }

      return 1; // Default to V1 if method doesn't exist
    } catch (error) {
      console.warn('getVersion not available, assuming V1:', error);
      return 1;
    }
  }, [api, contract, selectedAccount]);

  /**
   * Get the maximum batch size allowed
   * @returns {Promise<number>} Maximum batch size
   */
  const getMaxBatchSize = useCallback(async () => {
    if (!api || !contract) {
      throw new Error('API or contract not connected');
    }

    try {
      const { result, output } = await contract.query.getMaxBatchSize(
        selectedAccount?.address || '5C4hrfjw9DjXZTzV3MwzrrAr9P1MJhSrvWGWqi1eSuyUpnhM',
        { value: 0, gasLimit: createGasLimit() }
      );

      if (result.isOk && output) {
        return output.toNumber();
      }

      return 50; // Default value
    } catch (error) {
      console.warn('getMaxBatchSize not available, using default:', error);
      return 50;
    }
  }, [api, contract, selectedAccount]);

  /**
   * Check if batch operations are available (V2+ contract)
   * @returns {Promise<boolean>} True if batch operations are supported
   */
  const isBatchOperationsAvailable = useCallback(async () => {
    try {
      const version = await getContractVersion();
      return version >= 2;
    } catch (error) {
      return false;
    }
  }, [getContractVersion]);

  const value = {
    // State
    batchLoading,
    batchProgress,

    // Methods
    createCampaignsBatch,
    withdrawFundsBatch,
    getContractVersion,
    getMaxBatchSize,
    isBatchOperationsAvailable,
  };

  return (
    <BatchOperationsContext.Provider value={value}>
      {children}
    </BatchOperationsContext.Provider>
  );
};

BatchOperationsProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
