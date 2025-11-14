import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import CampaignDetailsPage from './CampaignDetailsPage';
import { CampaignContext } from '../contexts/CampaignContext';
import { WalletContext } from '../contexts/WalletContext';

// Mock toast notifications
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
    loading: vi.fn(),
  },
}));

// Mock data
const mockOwnerAccount = {
  address: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
  meta: { name: 'Campaign Owner' },
};

const mockDonorAccount = {
  address: '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty',
  meta: { name: 'Donor' },
};

const mockActiveCampaign = {
  id: 1,
  title: 'Test Active Campaign',
  description: 'A campaign for testing',
  owner: mockOwnerAccount.address,
  beneficiary: mockOwnerAccount.address,
  goal: 10000000000000n, // 10 DOT
  raised: 5000000000000n, // 5 DOT
  deadline: Date.now() + 86400000 * 30, // 30 days from now
  state: 'Active',
};

const mockFailedCampaign = {
  id: 2,
  title: 'Test Failed Campaign',
  description: 'A failed campaign for testing refunds',
  owner: mockOwnerAccount.address,
  beneficiary: mockOwnerAccount.address,
  goal: 10000000000000n, // 10 DOT
  raised: 3000000000000n, // 3 DOT
  deadline: Date.now() - 86400000, // 1 day ago (expired)
  state: 'Failed',
};

const mockDonations = [
  {
    donor: mockDonorAccount.address,
    amount: 1000000000000n, // 1 DOT
    timestamp: Date.now() - 86400000 * 5,
  },
];

const mockCampaignContext = {
  campaigns: [mockActiveCampaign, mockFailedCampaign],
  isLoading: false,
  error: null,
  getCampaignDetails: vi.fn(),
  createCampaign: vi.fn(),
  donateToCampaign: vi.fn(),
  withdrawFunds: vi.fn(),
  cancelCampaign: vi.fn(),
  claimRefund: vi.fn(),
  refreshCampaigns: vi.fn(),
};

const mockWalletContext = {
  accounts: [mockOwnerAccount, mockDonorAccount],
  selectedAccount: mockOwnerAccount,
  connectWallet: vi.fn(),
  switchAccount: vi.fn(),
  disconnectWallet: vi.fn(),
};

const renderWithProviders = (
  ui,
  {
    campaignContext = mockCampaignContext,
    walletContext = mockWalletContext,
    route = '/campaign/1',
  } = {}
) => {
  return render(
    <BrowserRouter>
      <WalletContext.Provider value={walletContext}>
        <CampaignContext.Provider value={campaignContext}>
          <Routes>
            <Route path="/campaign/:id" element={ui} />
          </Routes>
        </CampaignContext.Provider>
      </WalletContext.Provider>
    </BrowserRouter>,
    { initialEntries: [route] }
  );
};

describe('CampaignDetailsPage - Cancel Campaign', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCampaignContext.getCampaignDetails.mockResolvedValue({
      campaign: mockActiveCampaign,
      donations: mockDonations,
    });
  });

  describe('Cancel Campaign Button Visibility', () => {
    it('should show cancel button when user is campaign owner and campaign is active', async () => {
      renderWithProviders(<CampaignDetailsPage />, {
        walletContext: { ...mockWalletContext, selectedAccount: mockOwnerAccount },
      });

      await waitFor(() => {
        expect(screen.getByText('Test Active Campaign')).toBeInTheDocument();
      });

      expect(screen.getByText('Cancel Campaign')).toBeInTheDocument();
    });

    it('should not show cancel button when user is not campaign owner', async () => {
      renderWithProviders(<CampaignDetailsPage />, {
        walletContext: { ...mockWalletContext, selectedAccount: mockDonorAccount },
      });

      await waitFor(() => {
        expect(screen.getByText('Test Active Campaign')).toBeInTheDocument();
      });

      expect(screen.queryByText('Cancel Campaign')).not.toBeInTheDocument();
    });

    it('should not show cancel button when campaign is not active', async () => {
      mockCampaignContext.getCampaignDetails.mockResolvedValue({
        campaign: mockFailedCampaign,
        donations: mockDonations,
      });

      renderWithProviders(<CampaignDetailsPage />, {
        walletContext: { ...mockWalletContext, selectedAccount: mockOwnerAccount },
      });

      await waitFor(() => {
        expect(screen.getByText('Test Failed Campaign')).toBeInTheDocument();
      });

      expect(screen.queryByText('Cancel Campaign')).not.toBeInTheDocument();
    });

    it('should not show cancel button when no account is connected', async () => {
      renderWithProviders(<CampaignDetailsPage />, {
        walletContext: { ...mockWalletContext, selectedAccount: null },
      });

      await waitFor(() => {
        expect(screen.getByText('Test Active Campaign')).toBeInTheDocument();
      });

      expect(screen.queryByText('Cancel Campaign')).not.toBeInTheDocument();
    });
  });

  describe('Cancel Campaign Functionality', () => {
    beforeEach(() => {
      // Mock window.confirm
      window.confirm = vi.fn(() => true);
    });

    it('should show confirmation dialog when cancel button is clicked', async () => {
      renderWithProviders(<CampaignDetailsPage />, {
        walletContext: { ...mockWalletContext, selectedAccount: mockOwnerAccount },
      });

      await waitFor(() => {
        expect(screen.getByText('Cancel Campaign')).toBeInTheDocument();
      });

      const cancelButton = screen.getByText('Cancel Campaign');
      fireEvent.click(cancelButton);

      expect(window.confirm).toHaveBeenCalledWith(
        'Are you sure you want to cancel this campaign? Donors will be able to claim refunds.'
      );
    });

    it('should not cancel campaign if user cancels confirmation', async () => {
      window.confirm = vi.fn(() => false);

      renderWithProviders(<CampaignDetailsPage />, {
        walletContext: { ...mockWalletContext, selectedAccount: mockOwnerAccount },
      });

      await waitFor(() => {
        expect(screen.getByText('Cancel Campaign')).toBeInTheDocument();
      });

      const cancelButton = screen.getByText('Cancel Campaign');
      fireEvent.click(cancelButton);

      expect(mockCampaignContext.cancelCampaign).not.toHaveBeenCalled();
    });

    it('should call cancelCampaign with correct campaign ID', async () => {
      mockCampaignContext.cancelCampaign.mockResolvedValue({});

      renderWithProviders(<CampaignDetailsPage />, {
        walletContext: { ...mockWalletContext, selectedAccount: mockOwnerAccount },
      });

      await waitFor(() => {
        expect(screen.getByText('Cancel Campaign')).toBeInTheDocument();
      });

      const cancelButton = screen.getByText('Cancel Campaign');
      fireEvent.click(cancelButton);

      await waitFor(() => {
        expect(mockCampaignContext.cancelCampaign).toHaveBeenCalledWith('1');
      });
    });

    it('should show loading state during cancellation', async () => {
      mockCampaignContext.cancelCampaign.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      renderWithProviders(<CampaignDetailsPage />, {
        walletContext: { ...mockWalletContext, selectedAccount: mockOwnerAccount },
      });

      await waitFor(() => {
        expect(screen.getByText('Cancel Campaign')).toBeInTheDocument();
      });

      const cancelButton = screen.getByText('Cancel Campaign');
      fireEvent.click(cancelButton);

      await waitFor(() => {
        expect(screen.getByText('Cancelling campaign...')).toBeInTheDocument();
      });
    });

    it('should refresh campaign details after successful cancellation', async () => {
      mockCampaignContext.cancelCampaign.mockResolvedValue({});

      renderWithProviders(<CampaignDetailsPage />, {
        walletContext: { ...mockWalletContext, selectedAccount: mockOwnerAccount },
      });

      await waitFor(() => {
        expect(screen.getByText('Cancel Campaign')).toBeInTheDocument();
      });

      const cancelButton = screen.getByText('Cancel Campaign');
      fireEvent.click(cancelButton);

      await waitFor(() => {
        expect(mockCampaignContext.getCampaignDetails).toHaveBeenCalledTimes(2); // Initial load + refresh
      });
    });

    it('should handle cancellation errors gracefully', async () => {
      mockCampaignContext.cancelCampaign.mockRejectedValue(
        new Error('Only campaign owner can cancel')
      );

      renderWithProviders(<CampaignDetailsPage />, {
        walletContext: { ...mockWalletContext, selectedAccount: mockOwnerAccount },
      });

      await waitFor(() => {
        expect(screen.getByText('Cancel Campaign')).toBeInTheDocument();
      });

      const cancelButton = screen.getByText('Cancel Campaign');
      fireEvent.click(cancelButton);

      await waitFor(() => {
        expect(mockCampaignContext.cancelCampaign).toHaveBeenCalled();
      });
    });

    it('should disable cancel button during cancellation', async () => {
      mockCampaignContext.cancelCampaign.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      renderWithProviders(<CampaignDetailsPage />, {
        walletContext: { ...mockWalletContext, selectedAccount: mockOwnerAccount },
      });

      await waitFor(() => {
        expect(screen.getByText('Cancel Campaign')).toBeInTheDocument();
      });

      const cancelButton = screen.getByText('Cancel Campaign');
      fireEvent.click(cancelButton);

      await waitFor(() => {
        const loadingButton = screen.getByText('Cancelling campaign...').closest('button');
        expect(loadingButton).toBeDisabled();
      });
    });
  });
});

describe('CampaignDetailsPage - Claim Refund', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCampaignContext.getCampaignDetails.mockResolvedValue({
      campaign: mockFailedCampaign,
      donations: mockDonations,
    });
  });

  describe('Claim Refund Button Visibility', () => {
    it('should show refund button when user donated and campaign failed', async () => {
      renderWithProviders(<CampaignDetailsPage />, {
        walletContext: { ...mockWalletContext, selectedAccount: mockDonorAccount },
        route: '/campaign/2',
      });

      await waitFor(() => {
        expect(screen.getByText('Test Failed Campaign')).toBeInTheDocument();
      });

      expect(screen.getByText('Claim Refund')).toBeInTheDocument();
    });

    it('should not show refund button when campaign is still active', async () => {
      mockCampaignContext.getCampaignDetails.mockResolvedValue({
        campaign: mockActiveCampaign,
        donations: mockDonations,
      });

      renderWithProviders(<CampaignDetailsPage />, {
        walletContext: { ...mockWalletContext, selectedAccount: mockDonorAccount },
      });

      await waitFor(() => {
        expect(screen.getByText('Test Active Campaign')).toBeInTheDocument();
      });

      expect(screen.queryByText('Claim Refund')).not.toBeInTheDocument();
    });

    it('should not show refund button when user has not donated', async () => {
      mockCampaignContext.getCampaignDetails.mockResolvedValue({
        campaign: mockFailedCampaign,
        donations: [], // No donations
      });

      renderWithProviders(<CampaignDetailsPage />, {
        walletContext: { ...mockWalletContext, selectedAccount: mockDonorAccount },
        route: '/campaign/2',
      });

      await waitFor(() => {
        expect(screen.getByText('Test Failed Campaign')).toBeInTheDocument();
      });

      expect(screen.queryByText('Claim Refund')).not.toBeInTheDocument();
    });

    it('should not show refund button when no account is connected', async () => {
      renderWithProviders(<CampaignDetailsPage />, {
        walletContext: { ...mockWalletContext, selectedAccount: null },
        route: '/campaign/2',
      });

      await waitFor(() => {
        expect(screen.getByText('Test Failed Campaign')).toBeInTheDocument();
      });

      expect(screen.queryByText('Claim Refund')).not.toBeInTheDocument();
    });

    it('should not show refund button when user donation amount is zero', async () => {
      mockCampaignContext.getCampaignDetails.mockResolvedValue({
        campaign: mockFailedCampaign,
        donations: [
          {
            donor: mockDonorAccount.address,
            amount: 0n, // Zero donation
            timestamp: Date.now(),
          },
        ],
      });

      renderWithProviders(<CampaignDetailsPage />, {
        walletContext: { ...mockWalletContext, selectedAccount: mockDonorAccount },
        route: '/campaign/2',
      });

      await waitFor(() => {
        expect(screen.getByText('Test Failed Campaign')).toBeInTheDocument();
      });

      expect(screen.queryByText('Claim Refund')).not.toBeInTheDocument();
    });
  });

  describe('Claim Refund Functionality', () => {
    it('should call claimRefund with correct campaign ID', async () => {
      mockCampaignContext.claimRefund.mockResolvedValue({});

      renderWithProviders(<CampaignDetailsPage />, {
        walletContext: { ...mockWalletContext, selectedAccount: mockDonorAccount },
        route: '/campaign/2',
      });

      await waitFor(() => {
        expect(screen.getByText('Claim Refund')).toBeInTheDocument();
      });

      const refundButton = screen.getByText('Claim Refund');
      fireEvent.click(refundButton);

      await waitFor(() => {
        expect(mockCampaignContext.claimRefund).toHaveBeenCalledWith('2');
      });
    });

    it('should show loading state during refund claim', async () => {
      mockCampaignContext.claimRefund.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      renderWithProviders(<CampaignDetailsPage />, {
        walletContext: { ...mockWalletContext, selectedAccount: mockDonorAccount },
        route: '/campaign/2',
      });

      await waitFor(() => {
        expect(screen.getByText('Claim Refund')).toBeInTheDocument();
      });

      const refundButton = screen.getByText('Claim Refund');
      fireEvent.click(refundButton);

      await waitFor(() => {
        expect(screen.getByText('Claiming refund...')).toBeInTheDocument();
      });
    });

    it('should disable refund button during claim process', async () => {
      mockCampaignContext.claimRefund.mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      renderWithProviders(<CampaignDetailsPage />, {
        walletContext: { ...mockWalletContext, selectedAccount: mockDonorAccount },
        route: '/campaign/2',
      });

      await waitFor(() => {
        expect(screen.getByText('Claim Refund')).toBeInTheDocument();
      });

      const refundButton = screen.getByText('Claim Refund');
      fireEvent.click(refundButton);

      await waitFor(() => {
        const loadingButton = screen.getByText('Claiming refund...').closest('button');
        expect(loadingButton).toBeDisabled();
      });
    });

    it('should refresh campaign details after successful refund', async () => {
      mockCampaignContext.claimRefund.mockResolvedValue({});

      renderWithProviders(<CampaignDetailsPage />, {
        walletContext: { ...mockWalletContext, selectedAccount: mockDonorAccount },
        route: '/campaign/2',
      });

      await waitFor(() => {
        expect(screen.getByText('Claim Refund')).toBeInTheDocument();
      });

      const refundButton = screen.getByText('Claim Refund');
      fireEvent.click(refundButton);

      await waitFor(() => {
        expect(mockCampaignContext.getCampaignDetails).toHaveBeenCalledTimes(2); // Initial load + refresh
      });
    });

    it('should handle refund errors gracefully', async () => {
      mockCampaignContext.claimRefund.mockRejectedValue(
        new Error('You have already claimed your refund')
      );

      renderWithProviders(<CampaignDetailsPage />, {
        walletContext: { ...mockWalletContext, selectedAccount: mockDonorAccount },
        route: '/campaign/2',
      });

      await waitFor(() => {
        expect(screen.getByText('Claim Refund')).toBeInTheDocument();
      });

      const refundButton = screen.getByText('Claim Refund');
      fireEvent.click(refundButton);

      await waitFor(() => {
        expect(mockCampaignContext.claimRefund).toHaveBeenCalled();
      });
    });

    it('should handle NoDonationFound error', async () => {
      mockCampaignContext.claimRefund.mockRejectedValue(
        new Error('You have no donation to refund for this campaign')
      );

      renderWithProviders(<CampaignDetailsPage />, {
        walletContext: { ...mockWalletContext, selectedAccount: mockDonorAccount },
        route: '/campaign/2',
      });

      await waitFor(() => {
        expect(screen.getByText('Claim Refund')).toBeInTheDocument();
      });

      const refundButton = screen.getByText('Claim Refund');
      fireEvent.click(refundButton);

      await waitFor(() => {
        expect(mockCampaignContext.claimRefund).toHaveBeenCalled();
      });
    });

    it('should handle CampaignNotFailed error', async () => {
      mockCampaignContext.claimRefund.mockRejectedValue(
        new Error('Campaign has not failed - refunds are only available for failed campaigns')
      );

      renderWithProviders(<CampaignDetailsPage />, {
        walletContext: { ...mockWalletContext, selectedAccount: mockDonorAccount },
        route: '/campaign/2',
      });

      await waitFor(() => {
        expect(screen.getByText('Claim Refund')).toBeInTheDocument();
      });

      const refundButton = screen.getByText('Claim Refund');
      fireEvent.click(refundButton);

      await waitFor(() => {
        expect(mockCampaignContext.claimRefund).toHaveBeenCalled();
      });
    });
  });
});

describe('CampaignDetailsPage - Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.confirm = vi.fn(() => true);
  });

  it('should not show both cancel and refund buttons simultaneously', async () => {
    mockCampaignContext.getCampaignDetails.mockResolvedValue({
      campaign: mockActiveCampaign,
      donations: mockDonations,
    });

    renderWithProviders(<CampaignDetailsPage />, {
      walletContext: { ...mockWalletContext, selectedAccount: mockOwnerAccount },
    });

    await waitFor(() => {
      expect(screen.getByText('Test Active Campaign')).toBeInTheDocument();
    });

    expect(screen.getByText('Cancel Campaign')).toBeInTheDocument();
    expect(screen.queryByText('Claim Refund')).not.toBeInTheDocument();
  });

  it('should handle rapid consecutive cancel button clicks gracefully', async () => {
    mockCampaignContext.cancelCampaign.mockResolvedValue({});

    renderWithProviders(<CampaignDetailsPage />, {
      walletContext: { ...mockWalletContext, selectedAccount: mockOwnerAccount },
    });

    await waitFor(() => {
      expect(screen.getByText('Cancel Campaign')).toBeInTheDocument();
    });

    const cancelButton = screen.getByText('Cancel Campaign');
    fireEvent.click(cancelButton);
    fireEvent.click(cancelButton);
    fireEvent.click(cancelButton);

    await waitFor(() => {
      expect(mockCampaignContext.cancelCampaign).toHaveBeenCalledTimes(1);
    });
  });

  it('should handle rapid consecutive refund button clicks gracefully', async () => {
    mockCampaignContext.getCampaignDetails.mockResolvedValue({
      campaign: mockFailedCampaign,
      donations: mockDonations,
    });
    mockCampaignContext.claimRefund.mockResolvedValue({});

    renderWithProviders(<CampaignDetailsPage />, {
      walletContext: { ...mockWalletContext, selectedAccount: mockDonorAccount },
      route: '/campaign/2',
    });

    await waitFor(() => {
      expect(screen.getByText('Claim Refund')).toBeInTheDocument();
    });

    const refundButton = screen.getByText('Claim Refund');
    fireEvent.click(refundButton);
    fireEvent.click(refundButton);
    fireEvent.click(refundButton);

    await waitFor(() => {
      expect(mockCampaignContext.claimRefund).toHaveBeenCalledTimes(1);
    });
  });
});
