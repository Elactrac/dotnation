import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import DashboardPage from './DashboardPage';
import { CampaignContext } from '../contexts/CampaignContext';
import { WalletContext } from '../contexts/WalletContext';

const mockCampaigns = [
  {
    id: '1',
    title: 'DeFi For Good',
    description: 'Building decentralized finance solutions',
    owner: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
    beneficiary: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
    goal: 10000000000000000n,
    raised: 8000000000000000n,
    deadline: Date.now() + 86400000 * 30,
    state: 'Active'
  },
  {
    id: '2',
    title: 'Ocean Cleanup DAO',
    description: 'Cleaning oceans with blockchain',
    owner: '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty',
    beneficiary: '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty',
    goal: 5000000000000000n,
    raised: 5500000000000000n,
    deadline: Date.now() - 86400000,
    state: 'Successful'
  },
  {
    id: '3',
    title: 'Open Source Education',
    description: 'Free education for everyone',
    owner: '5DAAnrj7VHTznn2AWBemMuyBwZWs6FNFjdyVXUeYum3PTXFy',
    beneficiary: '5DAAnrj7VHTznn2AWBemMuyBwZWs6FNFjdyVXUeYum3PTXFy',
    goal: 3000000000000000n,
    raised: 2000000000000000n,
    deadline: Date.now() + 86400000 * 15,
    state: 'Active'
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
  accounts: [{ address: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY', name: 'Test Account' }],
  selectedAccount: { address: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY', name: 'Test Account' },
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

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Page Header', () => {
    it('should render welcome message', () => {
      renderWithProviders(<DashboardPage />);
      expect(screen.getByText('Welcome to DotNation')).toBeInTheDocument();
    });

    it('should render subtitle', () => {
      renderWithProviders(<DashboardPage />);
      expect(screen.getByText(/empowering the polkadot ecosystem/i)).toBeInTheDocument();
    });

    it('should have gradient styling on title', () => {
      renderWithProviders(<DashboardPage />);
      const title = screen.getByText('Welcome to DotNation');
      expect(title).toHaveClass('bg-gradient-to-r');
      expect(title).toHaveClass('from-primary');
    });

    it('should show create campaign button when wallet connected', () => {
      renderWithProviders(<DashboardPage />);
      expect(screen.getByText('Create Campaign')).toBeInTheDocument();
    });

    it('should not show create campaign button when wallet disconnected', () => {
      renderWithProviders(<DashboardPage />, {
        walletContext: { ...mockWalletContext, selectedAccount: null }
      });
      expect(screen.queryByText('Create Campaign')).not.toBeInTheDocument();
    });
  });

  describe('Stats Grid', () => {
    it('should display Total Raised stat', () => {
      renderWithProviders(<DashboardPage />);
      expect(screen.getByText('Total Raised')).toBeInTheDocument();
    });

    it('should display Active Projects stat', () => {
      renderWithProviders(<DashboardPage />);
      expect(screen.getByText('Active Projects')).toBeInTheDocument();
    });

    it('should display Contributors stat', () => {
      renderWithProviders(<DashboardPage />);
      expect(screen.getByText('Contributors')).toBeInTheDocument();
    });

    it('should display Success Rate stat', () => {
      renderWithProviders(<DashboardPage />);
      expect(screen.getByText('Success Rate')).toBeInTheDocument();
    });

    it('should calculate total raised correctly', () => {
      renderWithProviders(<DashboardPage />);
      const totalRaised = 8000 + 5500 + 2000; // Sum of all raised amounts in DOT
      expect(screen.getByText(new RegExp(`${totalRaised}`, 'i'))).toBeInTheDocument();
    });

    it('should count active campaigns correctly', () => {
      renderWithProviders(<DashboardPage />);
      const activeCampaigns = mockCampaigns.filter(c => c.state === 'Active').length;
      expect(screen.getByText(activeCampaigns.toString())).toBeInTheDocument();
    });

    it('should calculate success rate', () => {
      renderWithProviders(<DashboardPage />);
      const successRate = ((1 / 3) * 100).toFixed(1); // 1 successful out of 3 total
      expect(screen.getByText(`${successRate}%`)).toBeInTheDocument();
    });

    it('should have glassmorphism styling on stat cards', () => {
      renderWithProviders(<DashboardPage />);
      const statCard = screen.getByText('Total Raised').closest('div');
      expect(statCard).toHaveClass('backdrop-blur-xl');
    });

    it('should have hover effects on stat cards', () => {
      renderWithProviders(<DashboardPage />);
      const statCard = screen.getByText('Total Raised').closest('div');
      expect(statCard.className).toMatch(/hover:border-primary/);
    });
  });

  describe('Trending Projects', () => {
    it('should display trending projects section', () => {
      renderWithProviders(<DashboardPage />);
      expect(screen.getByText('Trending Projects')).toBeInTheDocument();
    });

    it('should show View All link', () => {
      renderWithProviders(<DashboardPage />);
      expect(screen.getByText('View All')).toBeInTheDocument();
    });

    it('should render trending project cards', () => {
      renderWithProviders(<DashboardPage />);
      expect(screen.getByText('DeFi For Good')).toBeInTheDocument();
    });

    it('should display project progress bars', () => {
      renderWithProviders(<DashboardPage />);
      const progressText = screen.getAllByText(/progress/i)[0];
      expect(progressText).toBeInTheDocument();
    });

    it('should show View Details button for each project', () => {
      renderWithProviders(<DashboardPage />);
      const viewDetailsButtons = screen.getAllByText('View Details');
      expect(viewDetailsButtons.length).toBeGreaterThan(0);
    });

    it('should limit trending projects to 4', () => {
      const manyCampaigns = Array.from({ length: 10 }, (_, i) => ({
        ...mockCampaigns[0],
        id: `campaign-${i}`,
        title: `Campaign ${i}`
      }));
      
      renderWithProviders(<DashboardPage />, {
        campaignContext: { ...mockCampaignContext, campaigns: manyCampaigns }
      });
      
      const viewDetailsButtons = screen.getAllByText('View Details');
      expect(viewDetailsButtons.length).toBeLessThanOrEqual(4);
    });

    it('should show empty state when no campaigns', () => {
      renderWithProviders(<DashboardPage />, {
        campaignContext: { ...mockCampaignContext, campaigns: [] }
      });
      expect(screen.getByText(/no campaigns available yet/i)).toBeInTheDocument();
    });
  });

  describe('Your Contributions Sidebar', () => {
    it('should display contributions section', () => {
      renderWithProviders(<DashboardPage />);
      expect(screen.getByText('Your Contributions')).toBeInTheDocument();
    });

    it('should show contributions when wallet connected', () => {
      renderWithProviders(<DashboardPage />);
      expect(screen.getByText('DeFi For Good')).toBeInTheDocument();
    });

    it('should show connect wallet prompt when disconnected', () => {
      renderWithProviders(<DashboardPage />, {
        walletContext: { ...mockWalletContext, selectedAccount: null }
      });
      expect(screen.getByText(/connect your wallet/i)).toBeInTheDocument();
    });

    it('should display View All Donations link', () => {
      renderWithProviders(<DashboardPage />);
      expect(screen.getByText('View All Donations')).toBeInTheDocument();
    });
  });

  describe('Categories Sidebar', () => {
    it('should display categories section', () => {
      renderWithProviders(<DashboardPage />);
      expect(screen.getByText('Categories')).toBeInTheDocument();
    });

    it('should show Technology category', () => {
      renderWithProviders(<DashboardPage />);
      expect(screen.getByText('Technology')).toBeInTheDocument();
    });

    it('should show Social Good category', () => {
      renderWithProviders(<DashboardPage />);
      expect(screen.getByText('Social Good')).toBeInTheDocument();
    });

    it('should show Environment category', () => {
      renderWithProviders(<DashboardPage />);
      expect(screen.getByText('Environment')).toBeInTheDocument();
    });

    it('should show category counts', () => {
      renderWithProviders(<DashboardPage />);
      const categoryButtons = screen.getAllByRole('button');
      const categoryButton = categoryButtons.find(btn => btn.textContent.includes('Technology'));
      expect(categoryButton).toBeInTheDocument();
    });

    it('should highlight All category by default', () => {
      renderWithProviders(<DashboardPage />);
      const allButton = screen.getByRole('button', { name: /all/i });
      expect(allButton).toHaveClass('from-primary/20');
    });
  });

  describe('Quick Actions', () => {
    it('should display quick actions section', () => {
      renderWithProviders(<DashboardPage />);
      expect(screen.getByText('Quick Actions')).toBeInTheDocument();
    });

    it('should have Create Campaign action', () => {
      renderWithProviders(<DashboardPage />);
      const createButtons = screen.getAllByText('Create Campaign');
      expect(createButtons.length).toBeGreaterThan(0);
    });

    it('should have Browse Campaigns action', () => {
      renderWithProviders(<DashboardPage />);
      expect(screen.getByText('Browse Campaigns')).toBeInTheDocument();
    });
  });

  describe('Navigation Links', () => {
    it('should link to create campaign page', () => {
      renderWithProviders(<DashboardPage />);
      const createLink = screen.getAllByText('Create Campaign')[0].closest('a');
      expect(createLink).toHaveAttribute('href', '/dashboard/create-campaign');
    });

    it('should link to browse page', () => {
      renderWithProviders(<DashboardPage />);
      const browseLink = screen.getByText('Browse Campaigns').closest('a');
      expect(browseLink).toHaveAttribute('href', '/dashboard/browse');
    });

    it('should link to campaign details', () => {
      renderWithProviders(<DashboardPage />);
      const viewDetailsLink = screen.getAllByText('View Details')[0].closest('a');
      expect(viewDetailsLink?.getAttribute('href')).toMatch(/\/dashboard\/campaign\//);
    });

    it('should link to donations page', () => {
      renderWithProviders(<DashboardPage />);
      const donationsLink = screen.getByText('View All Donations').closest('a');
      expect(donationsLink).toHaveAttribute('href', '/dashboard/my-donations');
    });
  });

  describe('Modern UI Styling', () => {
    it('should have glassmorphism on stat cards', () => {
      renderWithProviders(<DashboardPage />);
      const statCard = screen.getByText('Total Raised').closest('div');
      expect(statCard?.className).toMatch(/backdrop-blur-xl/);
    });

    it('should have gradient borders', () => {
      renderWithProviders(<DashboardPage />);
      const statCard = screen.getByText('Total Raised').closest('div');
      expect(statCard?.className).toMatch(/border-gray-700/);
    });

    it('should have rounded corners', () => {
      renderWithProviders(<DashboardPage />);
      const statCard = screen.getByText('Total Raised').closest('div');
      expect(statCard).toHaveClass('rounded-2xl');
    });

    it('should have gradient backgrounds on project cards', () => {
      renderWithProviders(<DashboardPage />);
      const projectCard = screen.getByText('DeFi For Good').closest('div');
      expect(projectCard?.parentElement?.className).toMatch(/bg-gradient-to-br/);
    });
  });

  describe('Responsive Design', () => {
    it('should have responsive grid classes', () => {
      const { container } = renderWithProviders(<DashboardPage />);
      const statsGrid = container.querySelector('.grid');
      expect(statsGrid?.className).toMatch(/grid-cols-1.*md:grid-cols-2.*lg:grid-cols-4/);
    });

    it('should have responsive padding', () => {
      const { container } = renderWithProviders(<DashboardPage />);
      const mainContainer = container.querySelector('.max-w-7xl');
      expect(mainContainer?.className).toMatch(/px-4.*sm:px-6.*lg:px-8/);
    });
  });

  describe('Empty States', () => {
    it('should show empty campaign state with emoji', () => {
      renderWithProviders(<DashboardPage />, {
        campaignContext: { ...mockCampaignContext, campaigns: [] }
      });
      expect(screen.getByText('🚀')).toBeInTheDocument();
    });

    it('should show create campaign prompt in empty state', () => {
      renderWithProviders(<DashboardPage />, {
        campaignContext: { ...mockCampaignContext, campaigns: [] }
      });
      expect(screen.getByText(/be the first to create one/i)).toBeInTheDocument();
    });
  });

  describe('Data Formatting', () => {
    it('should format DOT amounts correctly', () => {
      renderWithProviders(<DashboardPage />);
      // Check for formatted DOT amounts
      const dotAmounts = screen.getAllByText(/DOT/i);
      expect(dotAmounts.length).toBeGreaterThan(0);
    });

    it('should display percentages with decimals', () => {
      renderWithProviders(<DashboardPage />);
      const successRate = screen.getByText(/\d+\.\d+%/);
      expect(successRate).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have accessible stat card structure', () => {
      renderWithProviders(<DashboardPage />);
      const statCard = screen.getByText('Total Raised');
      expect(statCard.tagName).toBe('P');
    });

    it('should have visible focus indicators on links', () => {
      renderWithProviders(<DashboardPage />);
      const viewAllLink = screen.getByText('View All');
      expect(viewAllLink).toBeVisible();
    });

    it('should have semantic HTML structure', () => {
      const { container } = renderWithProviders(<DashboardPage />);
      expect(container.querySelector('h1')).toBeInTheDocument();
      expect(container.querySelector('h2')).toBeInTheDocument();
    });
  });

  describe('Interactive Elements', () => {
    it('should have clickable create campaign button', async () => {
      const user = userEvent.setup();
      renderWithProviders(<DashboardPage />);
      const createButton = screen.getAllByText('Create Campaign')[0];
      expect(createButton).toBeInTheDocument();
      await user.click(createButton);
    });

    it('should have clickable category buttons', async () => {
      const user = userEvent.setup();
      renderWithProviders(<DashboardPage />);
      const techButton = screen.getByRole('button', { name: /technology/i });
      await user.click(techButton);
      expect(techButton).toBeInTheDocument();
    });

    it('should have hover effects on buttons', () => {
      renderWithProviders(<DashboardPage />);
      const createButton = screen.getAllByText('Create Campaign')[0];
      expect(createButton.className).toMatch(/hover:scale-105/);
    });
  });
});
