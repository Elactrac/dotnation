import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import WalletConnect from './WalletConnect';
import { renderWithProviders, mockAccount, mockAccounts } from '../utils/test-utils';
import * as WalletContext from '../contexts/WalletContext';

describe('WalletConnect', () => {
  let mockUseWallet;

  beforeEach(() => {
    mockUseWallet = {
      accounts: [],
      selectedAccount: null,
      connectWallet: vi.fn(),
      disconnectWallet: vi.fn(),
      switchAccount: vi.fn(),
      isLoading: false,
      error: null,
      balance: null,
    };

    vi.spyOn(WalletContext, 'useWallet').mockReturnValue(mockUseWallet);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Initial States', () => {
    it('should render loading state', () => {
      mockUseWallet.isLoading = true;
      renderWithProviders(<WalletConnect />, { withWallet: false });
      
      expect(screen.getByText('Connecting...')).toBeInTheDocument();
    });

    it('should render connect button when not connected', () => {
      renderWithProviders(<WalletConnect />, { withWallet: false });
      
      const connectButton = screen.getByRole('button', { name: /connect wallet/i });
      expect(connectButton).toBeInTheDocument();
    });

    it('should render retry button on error', () => {
      mockUseWallet.error = 'Connection failed';
      renderWithProviders(<WalletConnect />, { withWallet: false });
      
      const retryButton = screen.getByRole('button', { name: /retry/i });
      expect(retryButton).toBeInTheDocument();
    });

    it('should render wallet info when connected', () => {
      mockUseWallet.selectedAccount = mockAccount;
      mockUseWallet.accounts = mockAccounts;
      mockUseWallet.balance = '5000000000000000'; // 5000 DOT
      
      renderWithProviders(<WalletConnect />, { withWallet: false });
      
      // The shortened address is always visible in the button
      expect(screen.getByText(/5Grwva/)).toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('should call connectWallet when connect button is clicked', async () => {
      const user = userEvent.setup();
      renderWithProviders(<WalletConnect />, { withWallet: false });
      
      const connectButton = screen.getByRole('button', { name: /connect wallet/i });
      await user.click(connectButton);
      
      expect(mockUseWallet.connectWallet).toHaveBeenCalledTimes(1);
    });

    it('should call connectWallet when retry button is clicked', async () => {
      const user = userEvent.setup();
      mockUseWallet.error = 'Connection failed';
      renderWithProviders(<WalletConnect />, { withWallet: false });
      
      const retryButton = screen.getByRole('button', { name: /retry/i });
      await user.click(retryButton);
      
      expect(mockUseWallet.connectWallet).toHaveBeenCalledTimes(1);
    });

    it('should open dropdown menu when wallet button is clicked', async () => {
      const user = userEvent.setup();
      mockUseWallet.selectedAccount = mockAccount;
      mockUseWallet.accounts = mockAccounts;
      mockUseWallet.balance = '5000000000000000';
      
      renderWithProviders(<WalletConnect />, { withWallet: false });
      
      const walletButton = screen.getByRole('button');
      await user.click(walletButton);
      
      await waitFor(() => {
        // Check for the "Second Account" text which is unique to the dropdown
        expect(screen.getByText('Second Account')).toBeInTheDocument();
      });
    });

    it('should call switchAccount when different account is clicked', async () => {
      const user = userEvent.setup();
      mockUseWallet.selectedAccount = mockAccounts[0];
      mockUseWallet.accounts = mockAccounts;
      mockUseWallet.balance = '5000000000000000';
      
      renderWithProviders(<WalletConnect />, { withWallet: false });
      
      // Open dropdown
      const walletButton = screen.getByRole('button');
      await user.click(walletButton);
      
      // Click second account
      const secondAccount = await screen.findByText('Second Account');
      await user.click(secondAccount);
      
      expect(mockUseWallet.switchAccount).toHaveBeenCalledWith(mockAccounts[1]);
    });

    it('should call disconnectWallet when disconnect button is clicked', async () => {
      const user = userEvent.setup();
      mockUseWallet.selectedAccount = mockAccount;
      mockUseWallet.accounts = mockAccounts;
      mockUseWallet.balance = '5000000000000000';
      
      renderWithProviders(<WalletConnect />, { withWallet: false });
      
      // Open dropdown
      const walletButton = screen.getByRole('button');
      await user.click(walletButton);
      
      // Click disconnect
      const disconnectButton = await screen.findByText('Disconnect');
      await user.click(disconnectButton);
      
      expect(mockUseWallet.disconnectWallet).toHaveBeenCalledTimes(1);
    });

    it('should close dropdown when clicking outside', async () => {
      mockUseWallet.selectedAccount = mockAccount;
      mockUseWallet.accounts = mockAccounts;
      mockUseWallet.balance = '5000000000000000';
      
      renderWithProviders(<WalletConnect />, { withWallet: false });
      
      // Open dropdown
      const walletButton = screen.getByRole('button');
      fireEvent.click(walletButton);
      
      await waitFor(() => {
        expect(screen.getByText('Disconnect')).toBeInTheDocument();
      });
      
      // Click outside
      fireEvent.mouseDown(document.body);
      
      await waitFor(() => {
        expect(screen.queryByText('Disconnect')).not.toBeInTheDocument();
      });
    });
  });

  describe('Balance Display', () => {
    it('should display formatted balance', () => {
      mockUseWallet.selectedAccount = mockAccount;
      mockUseWallet.accounts = mockAccounts;
      mockUseWallet.balance = '5000000000000000'; // 5000 DOT
      
      const { container } = renderWithProviders(<WalletConnect />, { withWallet: false });
      
      // Balance is hidden on small screens but present in DOM
      // formatBalance from Polkadot.js shows it as "5.0000 PDOT" or similar
      const balanceText = container.textContent;
      expect(balanceText).toMatch(/5\.\d+|5,\d+/); // Matches either format
    });

    it('should handle null balance gracefully', () => {
      mockUseWallet.selectedAccount = mockAccount;
      mockUseWallet.accounts = mockAccounts;
      mockUseWallet.balance = null;
      
      renderWithProviders(<WalletConnect />, { withWallet: false });
      
      // Should still render the component without crashing
      expect(screen.getByRole('button')).toBeInTheDocument();
    });
  });

  describe('Responsive Behavior', () => {
    it('should show shortened address', () => {
      mockUseWallet.selectedAccount = mockAccount;
      mockUseWallet.accounts = mockAccounts;
      mockUseWallet.balance = '5000000000000000';
      
      renderWithProviders(<WalletConnect />, { withWallet: false });
      
      // Should show shortened version of address
      expect(screen.getByText(/5Grwva/)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper button roles', () => {
      renderWithProviders(<WalletConnect />, { withWallet: false });
      
      const connectButton = screen.getByRole('button', { name: /connect wallet/i });
      expect(connectButton).toBeInTheDocument();
    });

    it('should be keyboard navigable', async () => {
      const user = userEvent.setup();
      mockUseWallet.selectedAccount = mockAccount;
      mockUseWallet.accounts = mockAccounts;
      mockUseWallet.balance = '5000000000000000';
      
      renderWithProviders(<WalletConnect />, { withWallet: false });
      
      // Tab to wallet button
      await user.tab();
      
      // Should focus the wallet button
      const walletButton = screen.getByRole('button');
      expect(walletButton).toHaveFocus();
      
      // Press Enter to open dropdown
      await user.keyboard('{Enter}');
      
      await waitFor(() => {
        expect(screen.getByText('Disconnect')).toBeInTheDocument();
      });
    });
  });
});
