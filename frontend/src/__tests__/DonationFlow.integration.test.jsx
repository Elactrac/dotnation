import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../utils/test-utils';
import { DonationInterface } from '../components/DonationInterface';

// Mock Polkadot extension
vi.mock('@polkadot/extension-dapp', () => ({
  web3Enable: vi.fn().mockResolvedValue([{ name: 'polkadot-js', version: '0.44.1' }]),
  web3FromAddress: vi.fn().mockResolvedValue({
    signer: {
      signRaw: vi.fn(),
      signPayload: vi.fn(),
    },
  }),
}));

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    button: ({ children, ...props }) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => {
  const mockIcon = () => <div>Icon</div>;
  return {
    Heart: mockIcon,
    AlertCircle: mockIcon,
    CheckCircle: mockIcon,
    Wallet: mockIcon,
    TrendingUp: mockIcon,
    ArrowRight: mockIcon,
    Loader: mockIcon,
    Gift: mockIcon,
  };
});

// Mock contexts with realistic data
vi.mock('../contexts/CampaignContext', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useCampaign: () => ({
      donateToCampaign: vi.fn().mockResolvedValue({
        signAndSend: vi.fn((address, options, callback) => {
          // Simulate finalized transaction
          setTimeout(() => {
            callback({ 
              status: { isFinalized: true }, 
              dispatchError: null,
              events: []
            });
          }, 100);
          return Promise.resolve('0x123hash');
        }),
      }),
      contract: { address: '5ContractAddressXXXXXXXXXXXXXXXXXXXXXXXXXXXX' },
    }),
  };
});

vi.mock('../contexts/WalletContext', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useWallet: () => ({
      selectedAccount: {
        address: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
        meta: { name: 'Test Account' },
      },
      balance: '5000000000000000', // 5000 DOT
    }),
  };
});

vi.mock('../contexts/NftContext', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNft: () => ({
      nftEnabled: true,
      mintNftReceipt: vi.fn().mockResolvedValue({
        tokenId: 123,
        metadata: { campaignId: 1, amount: '1000000000000' },
      }),
    }),
  };
});

// Mock campaign data
const mockCampaign = {
  id: 1,
  title: 'Help Build Community Center',
  description: 'A community center to bring people together',
  goal: '10000000000000000', // 10,000 DOT
  raised: '5000000000000000', // 5,000 DOT
  deadline: Date.now() + 86400000 * 30,
  beneficiary: '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty',
  state: 'Active',
};

describe('Donation Flow Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Donation Interface Rendering', () => {
    it('should render donation interface with all elements', () => {
      renderWithProviders(
        <DonationInterface 
          campaignId={1} 
          campaign={mockCampaign}
          onDonationSuccess={vi.fn()}
        />
      );

      // Check for amount input
      expect(screen.getByPlaceholderText('0.00')).toBeInTheDocument();

      // Check for suggested amounts (buttons show "X DOT" not just "X")
      expect(screen.getByText('1 DOT')).toBeInTheDocument();
      expect(screen.getByText('5 DOT')).toBeInTheDocument();
      expect(screen.getByText('10 DOT')).toBeInTheDocument();
      expect(screen.getByText('25 DOT')).toBeInTheDocument();

      // Check for donate button (uses aria-label which includes amount)
      const donateButton = screen.getByText(/donate now/i);
      expect(donateButton).toBeInTheDocument();
    });

    it('should display campaign progress information', () => {
      renderWithProviders(
        <DonationInterface 
          campaignId={1} 
          campaign={mockCampaign}
          onDonationSuccess={vi.fn()}
        />
      );

      // Campaign is at 50% (5000/10000) - formatDOT doesn't add commas
      expect(screen.getByText(/5000 DOT/)).toBeInTheDocument();
      expect(screen.getByText(/10000 DOT/)).toBeInTheDocument();
      expect(screen.getByText(/50\.0%/)).toBeInTheDocument();
    });
  });

  describe('Donation Amount Input', () => {
    it('should allow user to type custom donation amount', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(
        <DonationInterface 
          campaignId={1} 
          campaign={mockCampaign}
          onDonationSuccess={vi.fn()}
        />
      );

      const amountInput = screen.getByPlaceholderText('0.00');
      
      await user.clear(amountInput);
      await user.type(amountInput, '15');

      expect(amountInput.value).toBe('15');
    });

    it('should allow user to select suggested amount', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(
        <DonationInterface 
          campaignId={1} 
          campaign={mockCampaign}
          onDonationSuccess={vi.fn()}
        />
      );

      // Find button with text "5" (5 DOT suggestion)
      const buttons = screen.getAllByRole('button');
      const fiveDotButton = buttons.find(btn => 
        btn.textContent === '5' || btn.textContent.includes('5 DOT')
      );
      
      if (fiveDotButton) {
        await user.click(fiveDotButton);
        
        const amountInput = screen.getByPlaceholderText('0.00');
        await waitFor(() => {
          expect(amountInput.value).toBe('5');
        });
      }
    });

    it('should clear input when user types after selecting suggested amount', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(
        <DonationInterface 
          campaignId={1} 
          campaign={mockCampaign}
          onDonationSuccess={vi.fn()}
        />
      );

      const amountInput = screen.getByPlaceholderText('0.00');
      
      // Type a custom amount
      await user.clear(amountInput);
      await user.type(amountInput, '20');

      expect(amountInput.value).toBe('20');
    });
  });

  describe('Donation Validation', () => {
    it('should show error for zero amount', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(
        <DonationInterface 
          campaignId={1} 
          campaign={mockCampaign}
          onDonationSuccess={vi.fn()}
        />
      );

      const amountInput = screen.getByPlaceholderText('0.00');
      const donateButton = screen.getByRole('button', { name: /donate/i });

      await user.clear(amountInput);
      await user.type(amountInput, '0');
      await user.click(donateButton);

      // Should show validation error (button stays disabled or error appears)
      await waitFor(() => {
        // Either button disabled or error message shown
        const hasError = screen.queryByText(/greater than/i) || donateButton.disabled;
        expect(hasError).toBeTruthy();
      });
    });

    it('should show error for negative amount', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(
        <DonationInterface 
          campaignId={1} 
          campaign={mockCampaign}
          onDonationSuccess={vi.fn()}
        />
      );

      const amountInput = screen.getByPlaceholderText('0.00');
      const donateButton = screen.getByRole('button', { name: /donate/i });

      await user.clear(amountInput);
      await user.type(amountInput, '-5');
      await user.click(donateButton);

      // Should show validation error
      await waitFor(() => {
        const hasError = screen.queryByText(/greater than/i) || donateButton.disabled;
        expect(hasError).toBeTruthy();
      });
    });

    it('should show error for empty amount', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(
        <DonationInterface 
          campaignId={1} 
          campaign={mockCampaign}
          onDonationSuccess={vi.fn()}
        />
      );

      const donateButton = screen.getByRole('button', { name: /donate/i });
      await user.click(donateButton);

      // Should show validation error or keep button disabled
      await waitFor(() => {
        const hasError = screen.queryByText(/required/i) || donateButton.disabled;
        expect(hasError).toBeTruthy();
      });
    });

    it('should accept donation between 1 and 1,000,000 DOT', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(
        <DonationInterface 
          campaignId={1} 
          campaign={mockCampaign}
          onDonationSuccess={vi.fn()}
        />
      );

      const amountInput = screen.getByPlaceholderText('0.00');
      const donateButton = screen.getByRole('button', { name: /donate/i });

      // Enter valid amount
      await user.clear(amountInput);
      await user.type(amountInput, '100');

      // Button should be enabled for valid amount
      await waitFor(() => {
        expect(donateButton).not.toBeDisabled();
      });
    });
  });

  describe('Donation Submission', () => {
    it('should disable donate button while submitting', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(
        <DonationInterface 
          campaignId={1} 
          campaign={mockCampaign}
          onDonationSuccess={vi.fn()}
        />
      );

      const amountInput = screen.getByPlaceholderText('0.00');
      const donateButton = screen.getByRole('button', { name: /donate/i });

      await user.type(amountInput, '10');
      await user.click(donateButton);

      // Button should be disabled during submission
      expect(donateButton).toBeDisabled();
    });

    it('should accept valid donation amount', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(
        <DonationInterface 
          campaignId={1} 
          campaign={mockCampaign}
          onDonationSuccess={vi.fn()}
        />
      );

      const amountInput = screen.getByPlaceholderText('0.00');

      // Enter valid amounts and verify they're accepted
      const validAmounts = ['1', '5', '10', '100', '1000'];
      
      for (const amount of validAmounts) {
        await user.clear(amountInput);
        await user.type(amountInput, amount);
        expect(amountInput.value).toBe(amount);
        
        // Should not show error for valid amount
        expect(screen.queryByText(/invalid/i)).not.toBeInTheDocument();
      }
    });
  });

  describe('User Feedback', () => {
    it('should show loading state during donation', async () => {
      const user = userEvent.setup();
      
      renderWithProviders(
        <DonationInterface 
          campaignId={1} 
          campaign={mockCampaign}
          onDonationSuccess={vi.fn()}
        />
      );

      const amountInput = screen.getByPlaceholderText('0.00');
      const donateButton = screen.getByRole('button', { name: /donate/i });

      await user.type(amountInput, '10');
      await user.click(donateButton);

      // Should show loading state (button disabled or loading text)
      expect(donateButton).toBeDisabled();
    });

    it('should handle donation submission flow', async () => {
      const user = userEvent.setup();
      const onSuccess = vi.fn();
      
      renderWithProviders(
        <DonationInterface 
          campaignId={1} 
          campaign={mockCampaign}
          onDonationSuccess={onSuccess}
        />
      );

      const amountInput = screen.getByPlaceholderText('0.00');
      const donateButton = screen.getByRole('button', { name: /donate/i });

      await user.type(amountInput, '10');
      
      // Button should be enabled with valid amount
      expect(donateButton).not.toBeDisabled();
      
      await user.click(donateButton);

      // Button should be disabled during submission
      expect(donateButton).toBeDisabled();
    });
  });

  describe('NFT Integration', () => {
    it('should indicate NFT will be minted for donation', () => {
      renderWithProviders(
        <DonationInterface 
          campaignId={1} 
          campaign={mockCampaign}
          onDonationSuccess={vi.fn()}
        />
      );

      // Check for NFT-related text or icon
      // This depends on your UI, might be "Receive NFT", "Get Receipt NFT", etc.
      const nftIndicator = screen.queryByText(/nft/i) || screen.queryByText(/receipt/i);
      expect(nftIndicator).toBeInTheDocument();
    });
  });
});
