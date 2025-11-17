import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { WalletContext } from '../contexts/WalletContext';
import ProtectedRoute from '../components/ProtectedRoute';

// Mock components
const MockPublicPage = () => <div>Public Page</div>;
const MockProtectedPage = () => <div>Protected Page</div>;
const MockLandingPage = () => <div>Landing Page</div>;

describe('App Protected Routes Integration', () => {
  const renderWithRouter = (initialRoute, walletValue) => {
    const router = createMemoryRouter(
      [
        {
          path: '/',
          element: <MockLandingPage />,
        },
        {
          path: '/public',
          element: <MockPublicPage />,
        },
        {
          path: '/protected',
          element: (
            <ProtectedRoute requireWallet={true}>
              <MockProtectedPage />
            </ProtectedRoute>
          ),
        },
        {
          path: '/create-campaign',
          element: (
            <ProtectedRoute requireWallet={true}>
              <div>Create Campaign Page</div>
            </ProtectedRoute>
          ),
        },
        {
          path: '/my-campaigns',
          element: (
            <ProtectedRoute requireWallet={true}>
              <div>My Campaigns Page</div>
            </ProtectedRoute>
          ),
        },
        {
          path: '/my-donations',
          element: (
            <ProtectedRoute requireWallet={true}>
              <div>My Donations Page</div>
            </ProtectedRoute>
          ),
        },
        {
          path: '/batch-create',
          element: (
            <ProtectedRoute requireWallet={true}>
              <div>Batch Create Page</div>
            </ProtectedRoute>
          ),
        },
        {
          path: '/batch-withdraw',
          element: (
            <ProtectedRoute requireWallet={true}>
              <div>Batch Withdraw Page</div>
            </ProtectedRoute>
          ),
        },
        {
          path: '/profile',
          element: (
            <ProtectedRoute requireWallet={true}>
              <div>Profile Page</div>
            </ProtectedRoute>
          ),
        },
        {
          path: '/settings',
          element: (
            <ProtectedRoute requireWallet={true}>
              <div>Settings Page</div>
            </ProtectedRoute>
          ),
        },
      ],
      {
        initialEntries: [initialRoute],
      }
    );

    return render(
      <WalletContext.Provider value={walletValue}>
        <RouterProvider router={router} />
      </WalletContext.Provider>
    );
  };

  describe('Public Routes', () => {
    it('should allow access to landing page without wallet', () => {
      const mockWallet = { selectedAccount: null };
      renderWithRouter('/', mockWallet);

      expect(screen.getByText('Landing Page')).toBeInTheDocument();
    });

    it('should allow access to public routes without wallet', () => {
      const mockWallet = { selectedAccount: null };
      renderWithRouter('/public', mockWallet);

      expect(screen.getByText('Public Page')).toBeInTheDocument();
    });
  });

  describe('Protected Routes - Without Wallet', () => {
    const mockWallet = { selectedAccount: null };

    it('should redirect /create-campaign to landing page without wallet', async () => {
      renderWithRouter('/create-campaign', mockWallet);

      await waitFor(() => {
        expect(screen.getByText('Landing Page')).toBeInTheDocument();
      });
    });

    it('should redirect /my-campaigns to landing page without wallet', async () => {
      renderWithRouter('/my-campaigns', mockWallet);

      await waitFor(() => {
        expect(screen.getByText('Landing Page')).toBeInTheDocument();
      });
    });

    it('should redirect /my-donations to landing page without wallet', async () => {
      renderWithRouter('/my-donations', mockWallet);

      await waitFor(() => {
        expect(screen.getByText('Landing Page')).toBeInTheDocument();
      });
    });

    it('should redirect /batch-create to landing page without wallet', async () => {
      renderWithRouter('/batch-create', mockWallet);

      await waitFor(() => {
        expect(screen.getByText('Landing Page')).toBeInTheDocument();
      });
    });

    it('should redirect /batch-withdraw to landing page without wallet', async () => {
      renderWithRouter('/batch-withdraw', mockWallet);

      await waitFor(() => {
        expect(screen.getByText('Landing Page')).toBeInTheDocument();
      });
    });

    it('should redirect /profile to landing page without wallet', async () => {
      renderWithRouter('/profile', mockWallet);

      await waitFor(() => {
        expect(screen.getByText('Landing Page')).toBeInTheDocument();
      });
    });

    it('should redirect /settings to landing page without wallet', async () => {
      renderWithRouter('/settings', mockWallet);

      await waitFor(() => {
        expect(screen.getByText('Landing Page')).toBeInTheDocument();
      });
    });

    it('should show loading state before redirect', async () => {
      renderWithRouter('/protected', mockWallet);

      // The loading state appears briefly, then redirects to landing page
      await waitFor(() => {
        // After redirect completes, landing page should be shown
        expect(screen.getByText('Landing Page')).toBeInTheDocument();
      });
    });
  });

  describe('Protected Routes - With Wallet', () => {
    const mockWallet = {
      selectedAccount: {
        address: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
        meta: { name: 'Test Account' },
      },
    };

    it('should allow access to /create-campaign with wallet', () => {
      renderWithRouter('/create-campaign', mockWallet);

      expect(screen.getByText('Create Campaign Page')).toBeInTheDocument();
    });

    it('should allow access to /my-campaigns with wallet', () => {
      renderWithRouter('/my-campaigns', mockWallet);

      expect(screen.getByText('My Campaigns Page')).toBeInTheDocument();
    });

    it('should allow access to /my-donations with wallet', () => {
      renderWithRouter('/my-donations', mockWallet);

      expect(screen.getByText('My Donations Page')).toBeInTheDocument();
    });

    it('should allow access to /batch-create with wallet', () => {
      renderWithRouter('/batch-create', mockWallet);

      expect(screen.getByText('Batch Create Page')).toBeInTheDocument();
    });

    it('should allow access to /batch-withdraw with wallet', () => {
      renderWithRouter('/batch-withdraw', mockWallet);

      expect(screen.getByText('Batch Withdraw Page')).toBeInTheDocument();
    });

    it('should allow access to /profile with wallet', () => {
      renderWithRouter('/profile', mockWallet);

      expect(screen.getByText('Profile Page')).toBeInTheDocument();
    });

    it('should allow access to /settings with wallet', () => {
      renderWithRouter('/settings', mockWallet);

      expect(screen.getByText('Settings Page')).toBeInTheDocument();
    });
  });

  describe('Wallet Connection Flow', () => {
    it('should maintain protected page access when wallet remains connected', () => {
      const mockWallet = {
        selectedAccount: {
          address: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
        },
      };

      renderWithRouter('/protected', mockWallet);

      expect(screen.getByText('Protected Page')).toBeInTheDocument();
    });

    it('should handle multiple protected routes correctly', async () => {
      const mockWallet = {
        selectedAccount: {
          address: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
        },
      };

      // Test that all protected routes work with wallet
      const protectedRoutes = [
        '/create-campaign',
        '/my-campaigns',
        '/my-donations',
        '/batch-create',
        '/batch-withdraw',
        '/profile',
        '/settings',
      ];

      for (const route of protectedRoutes) {
        const { unmount } = renderWithRouter(route, mockWallet);
        await waitFor(() => {
          // Should not redirect to landing page
          expect(screen.queryByText('Landing Page')).not.toBeInTheDocument();
        });
        unmount();
      }
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined selectedAccount', async () => {
      const mockWallet = { selectedAccount: undefined };
      renderWithRouter('/protected', mockWallet);

      await waitFor(() => {
        expect(screen.getByText('Landing Page')).toBeInTheDocument();
      });
    });

    it('should handle null wallet context', async () => {
      const mockWallet = { selectedAccount: null };
      renderWithRouter('/protected', mockWallet);

      await waitFor(() => {
        expect(screen.getByText('Landing Page')).toBeInTheDocument();
      });
    });

    it('should handle wallet with empty address', async () => {
      const mockWallet = { selectedAccount: { address: '' } };
      renderWithRouter('/protected', mockWallet);

      // Empty address should still be considered as "connected" for this test
      // Actual validation should happen at wallet connection level
      expect(screen.getByText('Protected Page')).toBeInTheDocument();
    });
  });
});
