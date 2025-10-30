import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import BrowseCampaignsPage from './BrowseCampaignsPage';
import { CampaignContext } from '../contexts/CampaignContext';
import { WalletContext } from '../contexts/WalletContext';

// Mock data
const mockCampaigns = [
  {
    id: '1',
    title: 'Tech Innovation Project',
    description: 'Building the future of blockchain',
    owner: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
    beneficiary: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
    goal: 10000000000000000n, // 10000 DOT in plancks
    raised: 5000000000000000n, // 5000 DOT in plancks
    deadline: Date.now() + 86400000 * 30, // 30 days from now
    state: 'Active'
  },
  {
    id: '2',
    title: 'Education Platform',
    description: 'Free education for all',
    owner: '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty',
    beneficiary: '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty',
    goal: 5000000000000000n, // 5000 DOT
    raised: 1000000000000000n, // 1000 DOT
    deadline: Date.now() + 86400000 * 15, // 15 days from now
    state: 'Active'
  },
  {
    id: '3',
    title: 'Successful Campaign',
    description: 'Already funded project',
    owner: '5DAAnrj7VHTznn2AWBemMuyBwZWs6FNFjdyVXUeYum3PTXFy',
    beneficiary: '5DAAnrj7VHTznn2AWBemMuyBwZWs6FNFjdyVXUeYum3PTXFy',
    goal: 1000000000000000n, // 1000 DOT
    raised: 1200000000000000n, // 1200 DOT
    deadline: Date.now() - 86400000, // 1 day ago
    state: 'Successful'
  }
];

const mockCampaignContext = {
  campaigns: mockCampaigns,
  isLoading: false,
  error: null,
  getCampaignDetails: vi.fn(),
  createCampaign: vi.fn(),
  donate: vi.fn(),
  withdrawFunds: vi.fn()
};

const mockWalletContext = {
  accounts: [],
  selectedAccount: null,
  connectWallet: vi.fn(),
  switchAccount: vi.fn(),
  disconnectWallet: vi.fn()
};

const renderWithProviders = (ui, { campaignContext = mockCampaignContext, walletContext = mockWalletContext } = {}) => {
  return render(
    <BrowserRouter>
      <WalletContext.Provider value={walletContext}>
        <CampaignContext.Provider value={campaignContext}>
          {ui}
        </CampaignContext.Provider>
      </WalletContext.Provider>
    </BrowserRouter>
  );
};

describe('BrowseCampaignsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Page Rendering', () => {
    it('should render the page title', () => {
      renderWithProviders(<BrowseCampaignsPage />);
      expect(screen.getByText('Browse Campaigns')).toBeInTheDocument();
    });

    it('should render the page subtitle', () => {
      renderWithProviders(<BrowseCampaignsPage />);
      expect(screen.getByText(/discover and support amazing causes/i)).toBeInTheDocument();
    });

    it('should render search input', () => {
      renderWithProviders(<BrowseCampaignsPage />);
      expect(screen.getByPlaceholderText(/search campaigns/i)).toBeInTheDocument();
    });

    it('should render all campaigns initially', () => {
      renderWithProviders(<BrowseCampaignsPage />);
      expect(screen.getByText('Tech Innovation Project')).toBeInTheDocument();
      expect(screen.getByText('Education Platform')).toBeInTheDocument();
      expect(screen.getByText('Successful Campaign')).toBeInTheDocument();
    });

    it('should display campaign count', () => {
      renderWithProviders(<BrowseCampaignsPage />);
      expect(screen.getByText(/showing/i)).toBeInTheDocument();
      expect(screen.getByText('3', { exact: false })).toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('should show loading spinner when isLoading is true', () => {
      renderWithProviders(<BrowseCampaignsPage />, {
        campaignContext: { ...mockCampaignContext, isLoading: true }
      });
      expect(screen.getByText(/loading campaigns/i)).toBeInTheDocument();
    });

    it('should show loading animation', () => {
      renderWithProviders(<BrowseCampaignsPage />, {
        campaignContext: { ...mockCampaignContext, isLoading: true }
      });
      const spinner = screen.getByText(/loading campaigns/i).previousSibling;
      expect(spinner).toHaveClass('animate-spin');
    });
  });

  describe('Error State', () => {
    it('should display error message when error occurs', () => {
      const errorMessage = 'Failed to load campaigns';
      renderWithProviders(<BrowseCampaignsPage />, {
        campaignContext: { ...mockCampaignContext, error: errorMessage }
      });
      expect(screen.getByText(new RegExp(errorMessage, 'i'))).toBeInTheDocument();
    });

    it('should show error icon', () => {
      renderWithProviders(<BrowseCampaignsPage />, {
        campaignContext: { ...mockCampaignContext, error: 'Error loading' }
      });
      const errorContainer = screen.getByText(/error loading/i).closest('div');
      expect(errorContainer).toHaveClass('bg-red-500/10');
    });
  });

  describe('Search Functionality', () => {
    it('should filter campaigns by title', async () => {
      const user = userEvent.setup();
      renderWithProviders(<BrowseCampaignsPage />);
      
      const searchInput = screen.getByPlaceholderText(/search campaigns/i);
      await user.type(searchInput, 'Tech');
      
      expect(screen.getByText('Tech Innovation Project')).toBeInTheDocument();
      expect(screen.queryByText('Education Platform')).not.toBeInTheDocument();
    });

    it('should filter campaigns by description', async () => {
      const user = userEvent.setup();
      renderWithProviders(<BrowseCampaignsPage />);
      
      const searchInput = screen.getByPlaceholderText(/search campaigns/i);
      await user.type(searchInput, 'education');
      
      expect(screen.getByText('Education Platform')).toBeInTheDocument();
      expect(screen.queryByText('Tech Innovation Project')).not.toBeInTheDocument();
    });

    it('should be case insensitive', async () => {
      const user = userEvent.setup();
      renderWithProviders(<BrowseCampaignsPage />);
      
      const searchInput = screen.getByPlaceholderText(/search campaigns/i);
      await user.type(searchInput, 'TECH');
      
      expect(screen.getByText('Tech Innovation Project')).toBeInTheDocument();
    });

    it('should show no results message when no matches', async () => {
      const user = userEvent.setup();
      renderWithProviders(<BrowseCampaignsPage />);
      
      const searchInput = screen.getByPlaceholderText(/search campaigns/i);
      await user.type(searchInput, 'NonExistentCampaign123');
      
      expect(screen.getByText(/no campaigns found/i)).toBeInTheDocument();
    });

    it('should update campaign count after search', async () => {
      const user = userEvent.setup();
      renderWithProviders(<BrowseCampaignsPage />);
      
      const searchInput = screen.getByPlaceholderText(/search campaigns/i);
      await user.type(searchInput, 'Tech');
      
      expect(screen.getByText(/showing/i)).toBeInTheDocument();
      expect(screen.getByText('1', { exact: false })).toBeInTheDocument();
    });
  });

  describe('Status Filter', () => {
    it('should filter by Active status', async () => {
      const user = userEvent.setup();
      renderWithProviders(<BrowseCampaignsPage />);
      
      // Open mobile filters first
      const filtersButton = screen.getAllByText(/filters/i)[0];
      await user.click(filtersButton);
      
      const statusSelect = screen.getAllByLabelText(/status/i)[0];
      await user.selectOptions(statusSelect, 'Active');
      
      await waitFor(() => {
        expect(screen.getByText('Tech Innovation Project')).toBeInTheDocument();
        expect(screen.queryByText('Successful Campaign')).not.toBeInTheDocument();
      });
    });

    it('should filter by Successful status', async () => {
      const user = userEvent.setup();
      renderWithProviders(<BrowseCampaignsPage />);
      
      // Open mobile filters
      const filtersButton = screen.getAllByText(/filters/i)[0];
      await user.click(filtersButton);
      
      const statusSelect = screen.getAllByLabelText(/status/i)[0];
      await user.selectOptions(statusSelect, 'Successful');
      
      await waitFor(() => {
        expect(screen.getByText('Successful Campaign')).toBeInTheDocument();
        expect(screen.queryByText('Tech Innovation Project')).not.toBeInTheDocument();
      });
    });

    it('should show all campaigns when status is "all"', async () => {
      const user = userEvent.setup();
      renderWithProviders(<BrowseCampaignsPage />);
      
      expect(screen.getByText('Tech Innovation Project')).toBeInTheDocument();
      expect(screen.getByText('Successful Campaign')).toBeInTheDocument();
    });
  });

  describe('Sort Functionality', () => {
    it('should have sort dropdown', () => {
      renderWithProviders(<BrowseCampaignsPage />);
      expect(screen.getByText(/sort by/i)).toBeInTheDocument();
    });

    it('should have multiple sort options', () => {
      renderWithProviders(<BrowseCampaignsPage />);
      const sortSelect = screen.getByDisplayValue(/newest first/i);
      expect(within(sortSelect).getByText('Newest First')).toBeInTheDocument();
    });

    it('should change sort order', async () => {
      const user = userEvent.setup();
      renderWithProviders(<BrowseCampaignsPage />);
      
      const sortSelect = screen.getByDisplayValue(/newest first/i);
      await user.selectOptions(sortSelect, 'goal-high');
      
      expect(sortSelect.value).toBe('goal-high');
    });
  });

  describe('Filter Management', () => {
    it('should display active filters count', async () => {
      const user = userEvent.setup();
      renderWithProviders(<BrowseCampaignsPage />);
      
      const searchInput = screen.getByPlaceholderText(/search campaigns/i);
      await user.type(searchInput, 'Tech');
      
      await waitFor(() => {
        expect(screen.getByText(/1 filter active/i)).toBeInTheDocument();
      });
    });

    it('should show clear all button when filters active', async () => {
      const user = userEvent.setup();
      renderWithProviders(<BrowseCampaignsPage />);
      
      const searchInput = screen.getByPlaceholderText(/search campaigns/i);
      await user.type(searchInput, 'Tech');
      
      await waitFor(() => {
        expect(screen.getByText(/clear all/i)).toBeInTheDocument();
      });
    });

    it('should clear all filters when clear button clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(<BrowseCampaignsPage />);
      
      const searchInput = screen.getByPlaceholderText(/search campaigns/i);
      await user.type(searchInput, 'Tech');
      
      const clearButton = await screen.findByText(/clear all/i);
      await user.click(clearButton);
      
      expect(searchInput.value).toBe('');
      expect(screen.getByText('Tech Innovation Project')).toBeInTheDocument();
      expect(screen.getByText('Education Platform')).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('should show empty state when no campaigns', () => {
      renderWithProviders(<BrowseCampaignsPage />, {
        campaignContext: { ...mockCampaignContext, campaigns: [] }
      });
      
      expect(screen.getByText(/no campaigns found/i)).toBeInTheDocument();
    });

    it('should show appropriate message for filtered results', async () => {
      const user = userEvent.setup();
      renderWithProviders(<BrowseCampaignsPage />);
      
      const searchInput = screen.getByPlaceholderText(/search campaigns/i);
      await user.type(searchInput, 'NonExistent');
      
      expect(screen.getByText(/try adjusting your filters/i)).toBeInTheDocument();
    });
  });

  describe('Campaign Cards', () => {
    it('should render campaign cards', () => {
      renderWithProviders(<BrowseCampaignsPage />);
      expect(screen.getByText('Tech Innovation Project')).toBeInTheDocument();
      expect(screen.getByText('Education Platform')).toBeInTheDocument();
    });

    it('should display campaign titles', () => {
      renderWithProviders(<BrowseCampaignsPage />);
      mockCampaigns.forEach(campaign => {
        expect(screen.getByText(campaign.title)).toBeInTheDocument();
      });
    });
  });

  describe('Modern UI Styling', () => {
    it('should have glassmorphism styling on search container', () => {
      renderWithProviders(<BrowseCampaignsPage />);
      const searchContainer = screen.getByPlaceholderText(/search campaigns/i).closest('div').parentElement;
      expect(searchContainer).toHaveClass('backdrop-blur-xl');
    });

    it('should have gradient text on title', () => {
      renderWithProviders(<BrowseCampaignsPage />);
      const title = screen.getByText('Browse Campaigns');
      expect(title).toHaveClass('bg-gradient-to-r');
      expect(title).toHaveClass('from-primary');
    });

    it('should have modern rounded borders', () => {
      renderWithProviders(<BrowseCampaignsPage />);
      const searchContainer = screen.getByPlaceholderText(/search campaigns/i).closest('div').parentElement;
      expect(searchContainer).toHaveClass('rounded-2xl');
    });
  });

  describe('Responsive Design', () => {
    it('should have mobile filters toggle button', () => {
      renderWithProviders(<BrowseCampaignsPage />);
      const filtersButton = screen.getAllByText(/filters/i)[0];
      expect(filtersButton).toBeInTheDocument();
    });

    it('should open mobile filters panel when button clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(<BrowseCampaignsPage />);
      
      const filtersButton = screen.getAllByText(/filters/i)[0];
      await user.click(filtersButton);
      
      expect(screen.getByText(/categories/i)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have accessible search input', () => {
      renderWithProviders(<BrowseCampaignsPage />);
      const searchInput = screen.getByPlaceholderText(/search campaigns/i);
      expect(searchInput).toHaveAttribute('type', 'text');
    });

    it('should have accessible select elements', async () => {
      const user = userEvent.setup();
      renderWithProviders(<BrowseCampaignsPage />);
      
      const filtersButton = screen.getAllByText(/filters/i)[0];
      await user.click(filtersButton);
      
      const statusSelect = screen.getAllByLabelText(/status/i)[0];
      expect(statusSelect).toBeInTheDocument();
    });

    it('should have visible labels', async () => {
      const user = userEvent.setup();
      renderWithProviders(<BrowseCampaignsPage />);
      
      const filtersButton = screen.getAllByText(/filters/i)[0];
      await user.click(filtersButton);
      
      expect(screen.getByText(/status/i)).toBeVisible();
    });
  });
});
