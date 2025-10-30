import { createContext, useContext, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useApi } from './ApiContext';
import { useWallet } from './WalletContext';

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
      // Format campaign data for the contract
      const formattedData = campaignsData.map(campaign => [
        campaign.title,
        campaign.description,
        campaign.goal, // Should already be in plancks
        campaign.deadline, // Should already be timestamp
        campaign.beneficiary
      ]);

      // Call the batch creation method
      const tx = contract.tx.createCampaignsBatch(
        { value: 0, gasLimit: -1 },
        formattedData
      );

      return new Promise((resolve, reject) => {
        tx.signAndSend(selectedAccount.address, ({ status, events, dispatchError }) => {
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
   * Withdraw funds from multiple campaigns in a single batch transaction
   * @param {Array<number>} campaignIds - Array of campaign IDs to withdraw from
   * @returns {Promise<Object>} Result object with successful and failed counts
   */
  const withdrawFundsBatch = useCallback(async (campaignIds) => {
    if (!api || !contract || !selectedAccount) {
      throw new Error('API, contract, or wallet not connected');
    }

    if (!Array.isArray(campaignIds) || campaignIds.length === 0) {
      throw new Error('campaignIds must be a non-empty array');
    }

    setBatchLoading(true);
    setBatchProgress({ current: 0, total: campaignIds.length });

    try {
      // Call the batch withdrawal method
      const tx = contract.tx.withdrawFundsBatch(
        { value: 0, gasLimit: -1 },
        campaignIds
      );

      return new Promise((resolve, reject) => {
        tx.signAndSend(selectedAccount.address, ({ status, events, dispatchError }) => {
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
                  const decoded = contract.abi.decodeEvent(event.data[1]);
                  if (decoded.event.identifier === 'FundsWithdrawn') {
                    batchResult.successful++;
                    batchResult.successIds.push(decoded.args[0].toNumber());
                  }
                } catch (error) {
                  console.error('Error decoding event:', error);
                }
              }
            });

            batchResult.failed = campaignIds.length - batchResult.successful;

            showToast({
              title: 'Batch Withdrawal Complete',
              description: `✅ ${batchResult.successful} withdrawals successful${batchResult.failed > 0 ? `, ❌ ${batchResult.failed} failed` : ''}`,
              status: batchResult.failed === 0 ? 'success' : 'warning',
            });

            resolve(batchResult);
          }
        }).catch(error => {
          reject(error);
        });
      });
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
  }, [api, contract, selectedAccount]);

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
        { value: 0, gasLimit: -1 }
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
        { value: 0, gasLimit: -1 }
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
