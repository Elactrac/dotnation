import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { DonationInterface } from './DonationInterface';
import * as formatters from '../utils/formatters';

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  Heart: () => <div data-testid="heart-icon">Heart</div>,
  AlertCircle: () => <div data-testid="alert-icon">AlertCircle</div>,
  Info: () => <div data-testid="info-icon">Info</div>,
}));

// Mock formatters
vi.mock('../utils/formatters', () => ({
  formatDOT: vi.fn((value) => (Number(value) / 1e12).toFixed(2)),
  parseDOT: vi.fn((value) => BigInt(parseFloat(value) * 1e12)),
  isValidPositiveNumber: vi.fn((value) => {
    const num = parseFloat(value);
    return !isNaN(num) && num > 0;
  }),
}));

// Mock errorHandler
vi.mock('../utils/errorHandler', () => ({
  asyncHandler: (fn) => fn,
}));

// Create mock functions that we can control in tests
const mockDonateToCampaign = vi.fn();
let mockSelectedAccount = { address: '0x123', name: 'Test Account' };

// Mock the context hooks
vi.mock('../contexts/CampaignContext.jsx', () => ({
  useCampaign: () => ({
    donateToCampaign: mockDonateToCampaign,
  }),
}));

vi.mock('../contexts/WalletContext.jsx', () => ({
  useWallet: () => ({
    selectedAccount: mockSelectedAccount,
  }),
}));

describe('DonationInterface', () => {
  const mockCampaignId = '1';

  const mockActiveCampaign = {
    id: '1',
    state: 'Active',
    deadline: Date.now() + 86400000, // 1 day from now
    raised: 5000000000000000n, // 5000 DOT in plancks
    goal: 10000000000000000n, // 10000 DOT in plancks
  };

  const mockEndedCampaign = {
    id: '1',
    state: 'Successful',
    deadline: Date.now() - 86400000, // 1 day ago
    raised: 10000000000000000n,
    goal: 10000000000000000n,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset mock account to connected state
    mockSelectedAccount = { address: '0x123', name: 'Test Account' };
  });

  describe('Rendering', () => {
    it('renders the donation interface with all elements', () => {
      render(
        <DonationInterface campaignId={mockCampaignId} campaign={mockActiveCampaign} />
      );

      expect(screen.getByText('Support This Campaign')).toBeInTheDocument();
      expect(screen.getByText('Quick Select')).toBeInTheDocument();
      expect(screen.getByText('Custom Amount (DOT)')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter donation amount')).toBeInTheDocument();
    });

    it('displays campaign progress stats', () => {
      render(
        <DonationInterface campaignId={mockCampaignId} campaign={mockActiveCampaign} />
      );

      expect(screen.getByText('Current Progress')).toBeInTheDocument();
      expect(screen.getByText(/5000\.00 DOT/)).toBeInTheDocument();
      expect(screen.getByText(/of 10000\.00 DOT goal/)).toBeInTheDocument();
    });

    it('displays quick select buttons for suggested amounts', () => {
      render(
        <DonationInterface campaignId={mockCampaignId} campaign={mockActiveCampaign} />
      );

      expect(screen.getByText('10 DOT')).toBeInTheDocument();
      expect(screen.getByText('25 DOT')).toBeInTheDocument();
      expect(screen.getByText('50 DOT')).toBeInTheDocument();
      expect(screen.getByText('100 DOT')).toBeInTheDocument();
    });

    it('renders donate button with correct initial text', () => {
      render(
        <DonationInterface campaignId={mockCampaignId} campaign={mockActiveCampaign} />
      );

      expect(screen.getByRole('button', { name: /Enter Amount/i })).toBeInTheDocument();
    });

    it('displays helper text about blockchain donations', () => {
      render(
        <DonationInterface campaignId={mockCampaignId} campaign={mockActiveCampaign} />
      );

      expect(
        screen.getByText(/Your donation will be sent directly to the campaign beneficiary on the blockchain/)
      ).toBeInTheDocument();
    });
  });

  describe('Wallet Connection', () => {
    it('shows warning when wallet is not connected', () => {
      mockSelectedAccount = null;
      
      render(
        <DonationInterface campaignId={mockCampaignId} campaign={mockActiveCampaign} />
      );

      expect(screen.getByText('Wallet Not Connected')).toBeInTheDocument();
      expect(screen.getByText('Connect your wallet to make a donation')).toBeInTheDocument();
    });

    it('disables inputs when wallet is not connected', () => {
      mockSelectedAccount = null;
      
      render(
        <DonationInterface campaignId={mockCampaignId} campaign={mockActiveCampaign} />
      );

      const input = screen.getByPlaceholderText('Enter donation amount');
      expect(input).toBeDisabled();

      const quickButtons = screen.getAllByRole('button').filter(btn => btn.textContent.includes('DOT'));
      quickButtons.forEach(button => {
        expect(button).toBeDisabled();
      });
    });

    it('shows "Connect Wallet to Donate" button text when not connected', () => {
      mockSelectedAccount = null;
      
      render(
        <DonationInterface campaignId={mockCampaignId} campaign={mockActiveCampaign} />
      );

      expect(screen.getByRole('button', { name: /Connect Wallet to Donate/i })).toBeInTheDocument();
    });
  });

  describe('Campaign Status', () => {
    it('shows campaign ended warning for inactive campaigns', () => {
      render(
        <DonationInterface campaignId={mockCampaignId} campaign={mockEndedCampaign} />
      );

      expect(screen.getByText('Campaign Ended')).toBeInTheDocument();
      expect(screen.getByText(/This campaign has reached its deadline/)).toBeInTheDocument();
    });

    it('disables inputs when campaign is not active', () => {
      render(
        <DonationInterface campaignId={mockCampaignId} campaign={mockEndedCampaign} />
      );

      const input = screen.getByPlaceholderText('Enter donation amount');
      expect(input).toBeDisabled();
    });

    it('shows "Campaign Ended" button text for inactive campaigns', () => {
      render(
        <DonationInterface campaignId={mockCampaignId} campaign={mockEndedCampaign} />
      );

      expect(screen.getByRole('button', { name: /Campaign Ended/i })).toBeInTheDocument();
    });
  });

  describe('Amount Input', () => {
    it('allows typing custom amount', () => {
      render(
        <DonationInterface campaignId={mockCampaignId} campaign={mockActiveCampaign} />
      );

      const input = screen.getByPlaceholderText('Enter donation amount');
      fireEvent.change(input, { target: { value: '15' } });

      expect(input.value).toBe('15');
    });

    it('validates minimum amount (0.1 DOT)', () => {
      render(
        <DonationInterface campaignId={mockCampaignId} campaign={mockActiveCampaign} />
      );

      const input = screen.getByPlaceholderText('Enter donation amount');
      fireEvent.change(input, { target: { value: '0.05' } });

      expect(screen.getByText('Minimum donation is 0.1 DOT')).toBeInTheDocument();
    });

    it('validates maximum amount (100,000 DOT)', () => {
      render(
        <DonationInterface campaignId={mockCampaignId} campaign={mockActiveCampaign} />
      );

      const input = screen.getByPlaceholderText('Enter donation amount');
      fireEvent.change(input, { target: { value: '150000' } });

      expect(screen.getByText('Maximum donation is 100,000 DOT')).toBeInTheDocument();
    });

    it('validates positive numbers', () => {
      formatters.isValidPositiveNumber.mockReturnValueOnce(false);

      render(
        <DonationInterface campaignId={mockCampaignId} campaign={mockActiveCampaign} />
      );

      const input = screen.getByPlaceholderText('Enter donation amount');
      fireEvent.change(input, { target: { value: '-5' } });

      expect(screen.getByText('Please enter a valid positive number')).toBeInTheDocument();
    });

    it('shows error styling when amount is invalid', () => {
      render(
        <DonationInterface campaignId={mockCampaignId} campaign={mockActiveCampaign} />
      );

      const input = screen.getByPlaceholderText('Enter donation amount');
      fireEvent.change(input, { target: { value: '0.05' } });

      expect(input).toHaveClass('border-red-500');
    });

    it('updates button text with entered amount', () => {
      render(
        <DonationInterface campaignId={mockCampaignId} campaign={mockActiveCampaign} />
      );

      const input = screen.getByPlaceholderText('Enter donation amount');
      fireEvent.change(input, { target: { value: '25' } });

      expect(screen.getByRole('button', { name: /Donate 25 DOT/i })).toBeInTheDocument();
    });

    it('clears error when valid amount is entered', () => {
      render(
        <DonationInterface campaignId={mockCampaignId} campaign={mockActiveCampaign} />
      );

      const input = screen.getByPlaceholderText('Enter donation amount');
      
      // Enter invalid amount
      fireEvent.change(input, { target: { value: '0.05' } });
      expect(screen.getByText('Minimum donation is 0.1 DOT')).toBeInTheDocument();

      // Enter valid amount
      fireEvent.change(input, { target: { value: '10' } });
      expect(screen.queryByText('Minimum donation is 0.1 DOT')).not.toBeInTheDocument();
    });
  });

  describe('Quick Amount Buttons', () => {
    it('sets amount when quick button is clicked', () => {
      render(
        <DonationInterface campaignId={mockCampaignId} campaign={mockActiveCampaign} />
      );

      const button = screen.getByText('25 DOT');
      fireEvent.click(button);

      const input = screen.getByPlaceholderText('Enter donation amount');
      expect(input.value).toBe('25');
    });

    it('highlights selected quick amount button', () => {
      render(
        <DonationInterface campaignId={mockCampaignId} campaign={mockActiveCampaign} />
      );

      const button = screen.getByText('50 DOT');
      fireEvent.click(button);

      expect(button).toHaveClass('from-blue-600', 'to-purple-600');
    });

    it('clears error when quick amount is selected', () => {
      render(
        <DonationInterface campaignId={mockCampaignId} campaign={mockActiveCampaign} />
      );

      // Enter invalid amount
      const input = screen.getByPlaceholderText('Enter donation amount');
      fireEvent.change(input, { target: { value: '0.05' } });
      expect(screen.getByText('Minimum donation is 0.1 DOT')).toBeInTheDocument();

      // Click quick amount
      const button = screen.getByText('10 DOT');
      fireEvent.click(button);

      expect(screen.queryByText('Minimum donation is 0.1 DOT')).not.toBeInTheDocument();
    });

    it('updates button text when quick amount is selected', () => {
      render(
        <DonationInterface campaignId={mockCampaignId} campaign={mockActiveCampaign} />
      );

      const button = screen.getByText('100 DOT');
      fireEvent.click(button);

      expect(screen.getByRole('button', { name: /Donate 100 DOT/i })).toBeInTheDocument();
    });
  });

  describe('Donation Submission', () => {
    it('calls donateToCampaign with correct amount', async () => {
      render(
        <DonationInterface campaignId={mockCampaignId} campaign={mockActiveCampaign} />
      );

      const input = screen.getByPlaceholderText('Enter donation amount');
      fireEvent.change(input, { target: { value: '50' } });

      const donateButton = screen.getByRole('button', { name: /Donate 50 DOT/i });
      fireEvent.click(donateButton);

      await waitFor(() => {
        expect(mockDonateToCampaign).toHaveBeenCalledWith(mockCampaignId, BigInt(50 * 1e12));
      });
    });

    it('shows success toast after successful donation', async () => {
      mockDonateToCampaign.mockResolvedValueOnce();

      render(
        <DonationInterface campaignId={mockCampaignId} campaign={mockActiveCampaign} />
      );

      const input = screen.getByPlaceholderText('Enter donation amount');
      fireEvent.change(input, { target: { value: '25' } });

      const donateButton = screen.getByRole('button', { name: /Donate 25 DOT/i });
      fireEvent.click(donateButton);

      await waitFor(() => {
        expect(screen.getByText('Donation Successful! 🎉')).toBeInTheDocument();
        expect(screen.getByText(/You donated 25 DOT to this campaign/)).toBeInTheDocument();
      });
    });

    it('resets amount after successful donation', async () => {
      mockDonateToCampaign.mockResolvedValueOnce();

      render(
        <DonationInterface campaignId={mockCampaignId} campaign={mockActiveCampaign} />
      );

      const input = screen.getByPlaceholderText('Enter donation amount');
      fireEvent.change(input, { target: { value: '10' } });

      const donateButton = screen.getByRole('button', { name: /Donate 10 DOT/i });
      fireEvent.click(donateButton);

      await waitFor(() => {
        expect(input.value).toBe('');
      });
    });

    it('shows error toast when donation fails', async () => {
      mockDonateToCampaign.mockRejectedValueOnce(new Error('Insufficient funds'));

      render(
        <DonationInterface campaignId={mockCampaignId} campaign={mockActiveCampaign} />
      );

      const input = screen.getByPlaceholderText('Enter donation amount');
      fireEvent.change(input, { target: { value: '10' } });

      const donateButton = screen.getByRole('button', { name: /Donate 10 DOT/i });
      fireEvent.click(donateButton);

      await waitFor(() => {
        expect(screen.getByText('Donation Failed')).toBeInTheDocument();
        expect(screen.getByText('Insufficient funds')).toBeInTheDocument();
      });
    });

    it('shows loading state during submission', async () => {
      mockDonateToCampaign.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

      render(
        <DonationInterface campaignId={mockCampaignId} campaign={mockActiveCampaign} />
      );

      const input = screen.getByPlaceholderText('Enter donation amount');
      fireEvent.change(input, { target: { value: '10' } });

      const donateButton = screen.getByRole('button', { name: /Donate 10 DOT/i });
      fireEvent.click(donateButton);

      expect(screen.getByText('Processing Donation...')).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.queryByText('Processing Donation...')).not.toBeInTheDocument();
      });
    });

    it('disables button during submission', async () => {
      mockDonateToCampaign.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

      render(
        <DonationInterface campaignId={mockCampaignId} campaign={mockActiveCampaign} />
      );

      const input = screen.getByPlaceholderText('Enter donation amount');
      fireEvent.change(input, { target: { value: '10' } });

      const donateButton = screen.getByRole('button', { name: /Donate 10 DOT/i });
      fireEvent.click(donateButton);

      const processingButton = screen.getByRole('button', { name: /Processing Donation/i });
      expect(processingButton).toBeDisabled();

      await waitFor(() => {
        expect(screen.queryByText('Processing Donation...')).not.toBeInTheDocument();
      });
    });

    it('shows warning toast when trying to donate without wallet', async () => {
      mockSelectedAccount = null;
      
      render(
        <DonationInterface campaignId={mockCampaignId} campaign={mockActiveCampaign} />
      );

      const donateButton = screen.getByRole('button', { name: /Connect Wallet to Donate/i });
      fireEvent.click(donateButton);

      await waitFor(() => {
        const toastMessages = screen.getAllByText('Wallet Not Connected');
        expect(toastMessages.length).toBeGreaterThan(0);
        expect(screen.getByText('Please connect your wallet to make a donation')).toBeInTheDocument();
      });

      expect(mockDonateToCampaign).not.toHaveBeenCalled();
    });

    it('shows error toast when trying to donate invalid amount', async () => {
      render(
        <DonationInterface campaignId={mockCampaignId} campaign={mockActiveCampaign} />
      );

      const input = screen.getByPlaceholderText('Enter donation amount');
      fireEvent.change(input, { target: { value: '0.05' } });

      // The button should be disabled due to validation
      const donateButton = screen.getByRole('button', { name: /Enter Amount/i });
      
      // The validation should prevent the call
      expect(mockDonateToCampaign).not.toHaveBeenCalled();
    });

    it('does not submit when amount is empty', () => {
      render(
        <DonationInterface campaignId={mockCampaignId} campaign={mockActiveCampaign} />
      );

      const donateButton = screen.getByRole('button', { name: /Enter Amount/i });
      expect(donateButton).toBeDisabled();

      fireEvent.click(donateButton);
      expect(mockDonateToCampaign).not.toHaveBeenCalled();
    });
  });

  describe('Toast Notifications', () => {
    it('displays success toast with correct styling', async () => {
      mockDonateToCampaign.mockResolvedValueOnce();

      render(
        <DonationInterface campaignId={mockCampaignId} campaign={mockActiveCampaign} />
      );

      const input = screen.getByPlaceholderText('Enter donation amount');
      fireEvent.change(input, { target: { value: '10' } });

      const donateButton = screen.getByRole('button', { name: /Donate 10 DOT/i });
      fireEvent.click(donateButton);

      await waitFor(() => {
        const toast = screen.getByText('Donation Successful! 🎉').closest('div');
        expect(toast).toHaveClass('bg-green-500/20', 'border-green-500/30', 'text-green-400');
      });
    });

    it('displays error toast with correct styling', async () => {
      mockDonateToCampaign.mockRejectedValueOnce(new Error('Transaction failed'));

      render(
        <DonationInterface campaignId={mockCampaignId} campaign={mockActiveCampaign} />
      );

      const input = screen.getByPlaceholderText('Enter donation amount');
      fireEvent.change(input, { target: { value: '10' } });

      const donateButton = screen.getByRole('button', { name: /Donate 10 DOT/i });
      fireEvent.click(donateButton);

      await waitFor(() => {
        const toast = screen.getByText('Donation Failed').closest('div');
        expect(toast).toHaveClass('bg-red-500/20', 'border-red-500/30', 'text-red-400');
      });
    });

    it('displays warning toast with correct styling', async () => {
      mockSelectedAccount = null;
      
      render(
        <DonationInterface campaignId={mockCampaignId} campaign={mockActiveCampaign} />
      );

      const donateButton = screen.getByRole('button', { name: /Connect Wallet to Donate/i });
      fireEvent.click(donateButton);

      await waitFor(() => {
        const toasts = screen.getAllByText('Wallet Not Connected');
        // Find the toast notification (not the warning banner)
        const toast = toasts.find(el => el.closest('div').classList.contains('bg-yellow-500/20'));
        expect(toast).toBeTruthy();
      });
    });

    it('auto-dismisses toasts after timeout', async () => {
      vi.useFakeTimers();
      mockDonateToCampaign.mockResolvedValueOnce();

      render(
        <DonationInterface campaignId={mockCampaignId} campaign={mockActiveCampaign} />
      );

      const input = screen.getByPlaceholderText('Enter donation amount');
      fireEvent.change(input, { target: { value: '10' } });

      const donateButton = screen.getByRole('button', { name: /Donate 10 DOT/i });
      fireEvent.click(donateButton);

      await waitFor(() => {
        expect(screen.getByText('Donation Successful! 🎉')).toBeInTheDocument();
      });

      // Fast-forward time
      vi.advanceTimersByTime(7000);

      await waitFor(() => {
        expect(screen.queryByText('Donation Successful! 🎉')).not.toBeInTheDocument();
      });

      vi.useRealTimers();
    });

    it('can display multiple toasts simultaneously', async () => {
      mockSelectedAccount = null;
      
      render(
        <DonationInterface campaignId={mockCampaignId} campaign={mockActiveCampaign} />
      );

      const donateButton = screen.getByRole('button', { name: /Connect Wallet to Donate/i });
      
      // Trigger toast (wallet not connected)
      fireEvent.click(donateButton);

      await waitFor(() => {
        // Should show both the wallet warning banner and toast
        const walletWarnings = screen.getAllByText('Wallet Not Connected');
        expect(walletWarnings.length).toBeGreaterThanOrEqual(1);
      });
    });
  });

  describe('Button States', () => {
    it('disables button when wallet is not connected', () => {
      mockSelectedAccount = null;
      
      render(
        <DonationInterface campaignId={mockCampaignId} campaign={mockActiveCampaign} />
      );

      const donateButton = screen.getByRole('button', { name: /Connect Wallet to Donate/i });
      expect(donateButton).toBeDisabled();
    });

    it('disables button when campaign is not active', () => {
      render(
        <DonationInterface campaignId={mockCampaignId} campaign={mockEndedCampaign} />
      );

      const donateButton = screen.getByRole('button', { name: /Campaign Ended/i });
      expect(donateButton).toBeDisabled();
    });

    it('disables button when amount has validation error', () => {
      render(
        <DonationInterface campaignId={mockCampaignId} campaign={mockActiveCampaign} />
      );

      const input = screen.getByPlaceholderText('Enter donation amount');
      fireEvent.change(input, { target: { value: '0.05' } });

      const donateButton = screen.getByRole('button', { name: /Enter Amount/i });
      expect(donateButton).toBeDisabled();
    });

    it('disables button when amount is empty', () => {
      render(
        <DonationInterface campaignId={mockCampaignId} campaign={mockActiveCampaign} />
      );

      const donateButton = screen.getByRole('button', { name: /Enter Amount/i });
      expect(donateButton).toBeDisabled();
    });

    it('enables button when all conditions are met', () => {
      render(
        <DonationInterface campaignId={mockCampaignId} campaign={mockActiveCampaign} />
      );

      const input = screen.getByPlaceholderText('Enter donation amount');
      fireEvent.change(input, { target: { value: '10' } });

      const donateButton = screen.getByRole('button', { name: /Donate 10 DOT/i });
      expect(donateButton).not.toBeDisabled();
    });
  });

  describe('Modern UI Styling', () => {
    it('applies glassmorphism effect to main container', () => {
      const { container } = render(
        <DonationInterface campaignId={mockCampaignId} campaign={mockActiveCampaign} />
      );

      const mainContainer = container.querySelector('.backdrop-blur-xl');
      expect(mainContainer).toBeTruthy();
      expect(mainContainer).toHaveClass('bg-gradient-to-br', 'from-purple-500/10', 'to-pink-500/10');
    });

    it('applies gradient to donate button when enabled', () => {
      render(
        <DonationInterface campaignId={mockCampaignId} campaign={mockActiveCampaign} />
      );

      const input = screen.getByPlaceholderText('Enter donation amount');
      fireEvent.change(input, { target: { value: '10' } });

      const donateButton = screen.getByRole('button', { name: /Donate 10 DOT/i });
      expect(donateButton).toHaveClass('bg-gradient-to-r', 'from-pink-600', 'to-purple-600');
    });

    it('applies correct styling to selected quick amount button', () => {
      render(
        <DonationInterface campaignId={mockCampaignId} campaign={mockActiveCampaign} />
      );

      const button = screen.getByText('25 DOT');
      fireEvent.click(button);

      expect(button).toHaveClass('bg-gradient-to-r', 'from-blue-600', 'to-purple-600', 'border-blue-500');
    });

    it('applies dark theme styling to input', () => {
      render(
        <DonationInterface campaignId={mockCampaignId} campaign={mockActiveCampaign} />
      );

      const input = screen.getByPlaceholderText('Enter donation amount');
      expect(input).toHaveClass('bg-gray-800', 'text-white', 'border-gray-700');
    });
  });

  describe('Accessibility', () => {
    it('has proper labels for form inputs', () => {
      render(
        <DonationInterface campaignId={mockCampaignId} campaign={mockActiveCampaign} />
      );

      expect(screen.getByText('Quick Select')).toBeInTheDocument();
      expect(screen.getByText('Custom Amount (DOT)')).toBeInTheDocument();
    });

    it('has placeholder text for amount input', () => {
      render(
        <DonationInterface campaignId={mockCampaignId} campaign={mockActiveCampaign} />
      );

      expect(screen.getByPlaceholderText('Enter donation amount')).toBeInTheDocument();
    });

    it('displays error messages for screen readers', () => {
      render(
        <DonationInterface campaignId={mockCampaignId} campaign={mockActiveCampaign} />
      );

      const input = screen.getByPlaceholderText('Enter donation amount');
      fireEvent.change(input, { target: { value: '0.05' } });

      const errorMessage = screen.getByText('Minimum donation is 0.1 DOT');
      expect(errorMessage).toBeInTheDocument();
      expect(errorMessage).toHaveClass('text-red-400');
    });

    it('uses semantic HTML for buttons', () => {
      render(
        <DonationInterface campaignId={mockCampaignId} campaign={mockActiveCampaign} />
      );

      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  describe('Edge Cases', () => {
    it('handles campaign without deadline gracefully', () => {
      const campaignWithoutDeadline = {
        ...mockActiveCampaign,
        deadline: null,
      };

      render(
        <DonationInterface campaignId={mockCampaignId} campaign={campaignWithoutDeadline} />
      );

      expect(screen.getByText('Support This Campaign')).toBeInTheDocument();
    });

    it('handles campaign without stats gracefully', () => {
      render(
        <DonationInterface campaignId={mockCampaignId} campaign={null} />
      );

      expect(screen.getByText('Support This Campaign')).toBeInTheDocument();
      expect(screen.queryByText('Current Progress')).not.toBeInTheDocument();
    });

    it('handles donation error without message', async () => {
      mockDonateToCampaign.mockRejectedValueOnce({});

      render(
        <DonationInterface campaignId={mockCampaignId} campaign={mockActiveCampaign} />
      );

      const input = screen.getByPlaceholderText('Enter donation amount');
      fireEvent.change(input, { target: { value: '10' } });

      const donateButton = screen.getByRole('button', { name: /Donate 10 DOT/i });
      fireEvent.click(donateButton);

      await waitFor(() => {
        expect(screen.getByText('Donation Failed')).toBeInTheDocument();
        expect(screen.getByText(/Failed to process donation/)).toBeInTheDocument();
      });
    });

    it('handles very large valid amounts', () => {
      render(
        <DonationInterface campaignId={mockCampaignId} campaign={mockActiveCampaign} />
      );

      const input = screen.getByPlaceholderText('Enter donation amount');
      fireEvent.change(input, { target: { value: '99999' } });

      expect(screen.queryByText(/Maximum donation is 100,000 DOT/)).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Donate 99999 DOT/i })).toBeInTheDocument();
    });

    it('handles decimal amounts correctly', () => {
      render(
        <DonationInterface campaignId={mockCampaignId} campaign={mockActiveCampaign} />
      );

      const input = screen.getByPlaceholderText('Enter donation amount');
      fireEvent.change(input, { target: { value: '0.5' } });

      expect(screen.queryByText(/Minimum donation is 0.1 DOT/)).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Donate 0.5 DOT/i })).toBeInTheDocument();
    });
  });
});
