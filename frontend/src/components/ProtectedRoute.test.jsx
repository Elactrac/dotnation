import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter, useNavigate } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ProtectedRoute from './ProtectedRoute';
import { WalletContext } from '../contexts/WalletContext';

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('ProtectedRoute Component', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  const renderWithWallet = (children, walletValue) => {
    return render(
      <BrowserRouter>
        <WalletContext.Provider value={walletValue}>
          {children}
        </WalletContext.Provider>
      </BrowserRouter>
    );
  };

  describe('When wallet is connected', () => {
    it('should render children when wallet is connected', () => {
      const mockWallet = {
        selectedAccount: { address: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY' },
      };

      renderWithWallet(
        <ProtectedRoute requireWallet={true}>
          <div>Protected Content</div>
        </ProtectedRoute>,
        mockWallet
      );

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });

    it('should not redirect when wallet is connected', () => {
      const mockWallet = {
        selectedAccount: { address: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY' },
      };

      renderWithWallet(
        <ProtectedRoute requireWallet={true}>
          <div>Protected Content</div>
        </ProtectedRoute>,
        mockWallet
      );

      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe('When wallet is not connected', () => {
    it('should redirect to home when wallet is required but not connected', async () => {
      const mockWallet = {
        selectedAccount: null,
      };

      renderWithWallet(
        <ProtectedRoute requireWallet={true}>
          <div>Protected Content</div>
        </ProtectedRoute>,
        mockWallet
      );

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/', {
          replace: true,
          state: {
            message: 'Please connect your wallet to access this page',
            from: expect.any(String),
          },
        });
      });
    });

    it('should show loading state when wallet is not connected', () => {
      const mockWallet = {
        selectedAccount: null,
      };

      renderWithWallet(
        <ProtectedRoute requireWallet={true}>
          <div>Protected Content</div>
        </ProtectedRoute>,
        mockWallet
      );

      expect(screen.getByText('Wallet Required')).toBeInTheDocument();
      expect(screen.getByText('Checking wallet connection...')).toBeInTheDocument();
    });

    it('should not render children when wallet is not connected', () => {
      const mockWallet = {
        selectedAccount: null,
      };

      renderWithWallet(
        <ProtectedRoute requireWallet={true}>
          <div>Protected Content</div>
        </ProtectedRoute>,
        mockWallet
      );

      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });
  });

  describe('When requireWallet is false', () => {
    it('should render children regardless of wallet connection', () => {
      const mockWallet = {
        selectedAccount: null,
      };

      renderWithWallet(
        <ProtectedRoute requireWallet={false}>
          <div>Public Content</div>
        </ProtectedRoute>,
        mockWallet
      );

      expect(screen.getByText('Public Content')).toBeInTheDocument();
    });

    it('should not redirect when requireWallet is false', () => {
      const mockWallet = {
        selectedAccount: null,
      };

      renderWithWallet(
        <ProtectedRoute requireWallet={false}>
          <div>Public Content</div>
        </ProtectedRoute>,
        mockWallet
      );

      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe('Wallet state changes', () => {
    it('should update when wallet connects after initial render', async () => {
      const mockWallet = {
        selectedAccount: null,
      };

      const { rerender } = renderWithWallet(
        <ProtectedRoute requireWallet={true}>
          <div>Protected Content</div>
        </ProtectedRoute>,
        mockWallet
      );

      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();

      // Simulate wallet connection
      const updatedWallet = {
        selectedAccount: { address: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY' },
      };

      rerender(
        <BrowserRouter>
          <WalletContext.Provider value={updatedWallet}>
            <ProtectedRoute requireWallet={true}>
              <div>Protected Content</div>
            </ProtectedRoute>
          </WalletContext.Provider>
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Protected Content')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper loading state accessibility', () => {
      const mockWallet = {
        selectedAccount: null,
      };

      renderWithWallet(
        <ProtectedRoute requireWallet={true}>
          <div>Protected Content</div>
        </ProtectedRoute>,
        mockWallet
      );

      const loadingContainer = screen.getByText('Wallet Required').closest('div');
      expect(loadingContainer).toHaveClass('text-center');
    });
  });
});
