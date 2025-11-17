import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import { ApiProvider } from '../contexts/ApiContext';
import { WalletProvider } from '../contexts/WalletContext';
import { CampaignProvider } from '../contexts/CampaignContext';
import { BatchOperationsProvider } from '../contexts/BatchOperationsContext';
import { NftProvider } from '../contexts/NftContext';

/**
 * Custom render function that wraps components with all necessary providers
 * @param {React.ReactElement} ui - Component to render
 * @param {Object} options - Render options
 * @param {Object} options.initialState - Initial state for contexts
 * @param {boolean} options.withRouter - Whether to include router (default: true)
 * @param {boolean} options.withWallet - Whether to include wallet context (default: true)
 * @param {boolean} options.withCampaign - Whether to include campaign context (default: true)
 * @param {boolean} options.withNft - Whether to include NFT context (default: true)
 * @returns {Object} - Render result with utilities
 */
export function renderWithProviders(
  ui,
  {
    withRouter = true,
    withWallet = true,
    withCampaign = true,
    withNft = true,
    ...renderOptions
  } = {}
) {
  const Wrapper = ({ children }) => {
    let wrapped = children;

    if (withWallet || withCampaign || withNft) {
      wrapped = (
        <ApiProvider>
          <WalletProvider>
            <NftProvider>
              {withCampaign ? (
                <CampaignProvider>
                  <BatchOperationsProvider>
                    {children}
                  </BatchOperationsProvider>
                </CampaignProvider>
              ) : (
                children
              )}
            </NftProvider>
          </WalletProvider>
        </ApiProvider>
      );
    }

    if (withRouter) {
      wrapped = <BrowserRouter>{wrapped}</BrowserRouter>;
    }

    return wrapped;
  };

  Wrapper.propTypes = {
    children: PropTypes.node.isRequired,
  };

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

/**
 * Mock wallet account for testing
 */
export const mockAccount = {
  address: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
  meta: {
    name: 'Test Account',
    source: 'polkadot-js',
  },
  type: 'sr25519',
};

/**
 * Mock multiple wallet accounts
 */
export const mockAccounts = [
  mockAccount,
  {
    address: '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty',
    meta: {
      name: 'Second Account',
      source: 'polkadot-js',
    },
    type: 'sr25519',
  },
];

/**
 * Mock campaign data
 */
export const mockCampaign = {
  id: 1,
  title: 'Test Campaign',
  description: 'This is a test campaign description',
  goal: '1000000000000000', // 1000 DOT in plancks
  raised: '500000000000000', // 500 DOT in plancks
  deadline: Date.now() + 86400000 * 30, // 30 days from now
  beneficiary: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
  state: 'Active',
  donations: [
    {
      donor: '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty',
      amount: '250000000000000',
      timestamp: Date.now() - 86400000,
    },
    {
      donor: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
      amount: '250000000000000',
      timestamp: Date.now() - 43200000,
    },
  ],
};

/**
 * Mock multiple campaigns
 */
export const mockCampaigns = [
  mockCampaign,
  {
    ...mockCampaign,
    id: 2,
    title: 'Second Campaign',
    raised: '1000000000000000',
    state: 'Successful',
  },
  {
    ...mockCampaign,
    id: 3,
    title: 'Failed Campaign',
    deadline: Date.now() - 86400000,
    raised: '100000000000000',
    state: 'Failed',
  },
];

/**
 * Mock NFT data
 */
export const mockNft = {
  tokenId: 1,
  metadata: {
    campaignId: 1,
    campaignTitle: 'Test Campaign',
    amount: 10000000000000, // 10 DOT in plancks
    timestamp: Date.now() - 86400000,
    donor: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
  },
  rarity: 'Common',
};

/**
 * Mock multiple NFTs
 */
export const mockNfts = [
  mockNft,
  {
    tokenId: 2,
    metadata: {
      campaignId: 2,
      campaignTitle: 'Second Campaign',
      amount: 25000000000000, // 25 DOT
      timestamp: Date.now() - 43200000,
      donor: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
    },
    rarity: 'Uncommon',
  },
  {
    tokenId: 3,
    metadata: {
      campaignId: 1,
      campaignTitle: 'Test Campaign',
      amount: 100000000000000, // 100 DOT
      timestamp: Date.now() - 172800000,
      donor: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
    },
    rarity: 'Rare',
  },
];

/**
 * Mock Polkadot API
 */
export const mockApi = {
  query: {
    system: {
      account: vi.fn().mockResolvedValue({
        data: {
          free: '5000000000000000', // 5000 DOT
        },
      }),
    },
  },
  tx: {
    donationPlatform: {
      createCampaign: vi.fn().mockReturnValue({
        signAndSend: vi.fn().mockResolvedValue('0x123'),
      }),
      donate: vi.fn().mockReturnValue({
        signAndSend: vi.fn().mockResolvedValue('0x456'),
      }),
      withdraw: vi.fn().mockReturnValue({
        signAndSend: vi.fn().mockResolvedValue('0x789'),
      }),
    },
  },
  isReady: Promise.resolve(true),
};

/**
 * Mock web3Enable from @polkadot/extension-dapp
 */
export const mockWeb3Enable = vi.fn().mockResolvedValue([
  { name: 'polkadot-js', version: '0.44.1' },
]);

/**
 * Mock web3Accounts from @polkadot/extension-dapp
 */
export const mockWeb3Accounts = vi.fn().mockResolvedValue(mockAccounts);

/**
 * Wait for async updates to complete
 */
export const waitForAsync = () => new Promise((resolve) => setTimeout(resolve, 0));

/**
 * Flush all pending promises
 */
export const flushPromises = () => new Promise(setImmediate);

/**
 * Create a mock toast for testing
 */
export const mockToast = {
  success: vi.fn(),
  error: vi.fn(),
  loading: vi.fn(),
  custom: vi.fn(),
};

/**
 * Mock localStorage
 */
export const mockLocalStorage = (() => {
  let store = {};

  return {
    getItem: vi.fn((key) => store[key] || null),
    setItem: vi.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: vi.fn((key) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

/**
 * Setup function to run before each test
 */
export const setupTest = () => {
  // Mock localStorage
  Object.defineProperty(window, 'localStorage', {
    value: mockLocalStorage,
  });

  // Clear all mocks
  vi.clearAllMocks();
};

/**
 * Cleanup function to run after each test
 */
export const cleanupTest = () => {
  mockLocalStorage.clear();
  vi.restoreAllMocks();
};

// Re-export everything from @testing-library/react
export * from '@testing-library/react';
