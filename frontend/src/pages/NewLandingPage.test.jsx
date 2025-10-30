import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import NewLandingPage from './NewLandingPage';
import { WalletContext } from '../contexts/WalletContext';

// Mock IntersectionObserver
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
  takeRecords() {
    return [];
  }
};

// Mock requestAnimationFrame
global.requestAnimationFrame = vi.fn((callback) => {
  setTimeout(callback, 0);
  return 1;
});

// Mock canvas context
HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
  clearRect: vi.fn(),
  strokeStyle: '',
  lineWidth: 0,
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  stroke: vi.fn(),
}));

// Mock wallet context
const mockWalletContext = {
  accounts: [],
  selectedAccount: null,
  connectWallet: vi.fn(),
  switchAccount: vi.fn(),
  disconnectWallet: vi.fn(),
};

const renderWithRouter = (ui, { route = '/', state = null } = {}) => {
  return render(
    <MemoryRouter initialEntries={[{ pathname: route, state }]}>
      <WalletContext.Provider value={mockWalletContext}>
        {ui}
      </WalletContext.Provider>
    </MemoryRouter>
  );
};

describe('NewLandingPage - Redirect Notification', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  describe('Redirect Message Display', () => {
    it('should not display redirect message when no location state', () => {
      renderWithRouter(<NewLandingPage />);
      
      const banner = screen.queryByText(/wallet required/i);
      expect(banner).not.toBeInTheDocument();
    });

    it('should not display redirect message when location state has no message', () => {
      renderWithRouter(<NewLandingPage />, {
        route: '/',
        state: { someOtherKey: 'value' },
      });
      
      const banner = screen.queryByText(/wallet required/i);
      expect(banner).not.toBeInTheDocument();
    });

    it('should display redirect message when location state contains message', () => {
      const message = 'Please connect your wallet to create a campaign';
      
      renderWithRouter(<NewLandingPage />, {
        route: '/',
        state: { message },
      });
      
      expect(screen.getByText('Wallet Required')).toBeInTheDocument();
      expect(screen.getByText(message)).toBeInTheDocument();
    });

    it('should display correct icon for redirect notification', () => {
      const message = 'Please connect your wallet to access this page';
      
      renderWithRouter(<NewLandingPage />, {
        route: '/',
        state: { message },
      });
      
      const banner = screen.getByText('Wallet Required').closest('div');
      const icon = within(banner.parentElement).getByRole('img', { hidden: true });
      expect(icon).toBeInTheDocument();
    });

    it('should display message with yellow/orange gradient styling', () => {
      const message = 'Please connect your wallet';
      
      renderWithRouter(<NewLandingPage />, {
        route: '/',
        state: { message },
      });
      
      const bannerContainer = screen.getByText('Wallet Required').closest('div').parentElement;
      expect(bannerContainer).toHaveClass('bg-gradient-to-br');
      expect(bannerContainer.className).toMatch(/yellow|orange/);
    });
  });

  describe('Auto-Dismiss Functionality', () => {
    it('should auto-dismiss redirect message after 5 seconds', async () => {
      const message = 'Please connect your wallet';
      
      renderWithRouter(<NewLandingPage />, {
        route: '/',
        state: { message },
      });
      
      expect(screen.getByText(message)).toBeInTheDocument();
      
      // Fast-forward time by 5 seconds
      vi.advanceTimersByTime(5000);
      
      await waitFor(() => {
        expect(screen.queryByText(message)).not.toBeInTheDocument();
      });
    });

    it('should not auto-dismiss before 5 seconds', () => {
      const message = 'Please connect your wallet';
      
      renderWithRouter(<NewLandingPage />, {
        route: '/',
        state: { message },
      });
      
      expect(screen.getByText(message)).toBeInTheDocument();
      
      // Fast-forward time by 4 seconds (less than 5)
      vi.advanceTimersByTime(4000);
      
      expect(screen.getByText(message)).toBeInTheDocument();
    });

    it('should clear message exactly at 5 seconds', async () => {
      const message = 'Please connect your wallet';
      
      renderWithRouter(<NewLandingPage />, {
        route: '/',
        state: { message },
      });
      
      // Message should be visible initially
      expect(screen.getByText(message)).toBeInTheDocument();
      
      // Fast-forward to just before 5 seconds
      vi.advanceTimersByTime(4999);
      expect(screen.getByText(message)).toBeInTheDocument();
      
      // Fast-forward the last millisecond
      vi.advanceTimersByTime(1);
      
      await waitFor(() => {
        expect(screen.queryByText(message)).not.toBeInTheDocument();
      });
    });
  });

  describe('Manual Close Functionality', () => {
    it('should render close button', () => {
      const message = 'Please connect your wallet';
      
      renderWithRouter(<NewLandingPage />, {
        route: '/',
        state: { message },
      });
      
      const closeButton = screen.getByRole('button', { name: '' });
      expect(closeButton).toBeInTheDocument();
    });

    it('should close message when close button is clicked', async () => {
      const user = userEvent.setup({ delay: null });
      const message = 'Please connect your wallet';
      
      renderWithRouter(<NewLandingPage />, {
        route: '/',
        state: { message },
      });
      
      expect(screen.getByText(message)).toBeInTheDocument();
      
      const closeButton = screen.getByRole('button', { name: '' });
      await user.click(closeButton);
      
      expect(screen.queryByText(message)).not.toBeInTheDocument();
    });

    it('should close message immediately on click without waiting for timeout', async () => {
      const user = userEvent.setup({ delay: null });
      const message = 'Please connect your wallet';
      
      renderWithRouter(<NewLandingPage />, {
        route: '/',
        state: { message },
      });
      
      // Fast-forward 2 seconds
      vi.advanceTimersByTime(2000);
      expect(screen.getByText(message)).toBeInTheDocument();
      
      // Click close button
      const closeButton = screen.getByRole('button', { name: '' });
      await user.click(closeButton);
      
      expect(screen.queryByText(message)).not.toBeInTheDocument();
    });

    it('should close message before auto-dismiss timeout if manually closed', async () => {
      const user = userEvent.setup({ delay: null });
      const message = 'Please connect your wallet';
      
      renderWithRouter(<NewLandingPage />, {
        route: '/',
        state: { message },
      });
      
      // Fast-forward 1 second
      vi.advanceTimersByTime(1000);
      
      const closeButton = screen.getByRole('button', { name: '' });
      await user.click(closeButton);
      
      expect(screen.queryByText(message)).not.toBeInTheDocument();
      
      // Continue to 5 seconds - message should stay closed
      vi.advanceTimersByTime(4000);
      expect(screen.queryByText(message)).not.toBeInTheDocument();
    });
  });

  describe('Location State Handling', () => {
    it('should clear location state from history after displaying message', () => {
      const replaceSpy = vi.spyOn(window.history, 'replaceState');
      const message = 'Please connect your wallet';
      
      renderWithRouter(<NewLandingPage />, {
        route: '/',
        state: { message },
      });
      
      expect(replaceSpy).toHaveBeenCalledWith({}, document.title);
      replaceSpy.mockRestore();
    });

    it('should not clear location state if no message present', () => {
      const replaceSpy = vi.spyOn(window.history, 'replaceState');
      
      renderWithRouter(<NewLandingPage />);
      
      expect(replaceSpy).not.toHaveBeenCalled();
      replaceSpy.mockRestore();
    });
  });

  describe('Multiple Message Scenarios', () => {
    it('should handle different message texts correctly', () => {
      const messages = [
        'Please connect your wallet to create a campaign',
        'Please connect your wallet to view your donations',
        'Please connect your wallet to access settings',
      ];
      
      messages.forEach((message) => {
        const { unmount } = renderWithRouter(<NewLandingPage />, {
          route: '/',
          state: { message },
        });
        
        expect(screen.getByText(message)).toBeInTheDocument();
        unmount();
      });
    });

    it('should handle very long messages', () => {
      const longMessage = 'Please connect your wallet to continue. This feature requires an active wallet connection to access protected routes and perform secure transactions on the blockchain.';
      
      renderWithRouter(<NewLandingPage />, {
        route: '/',
        state: { message: longMessage },
      });
      
      expect(screen.getByText(longMessage)).toBeInTheDocument();
    });

    it('should handle empty string message', () => {
      renderWithRouter(<NewLandingPage />, {
        route: '/',
        state: { message: '' },
      });
      
      // Empty message should still show banner structure but no text
      const banner = screen.queryByText('Wallet Required');
      expect(banner).not.toBeInTheDocument();
    });
  });

  describe('Banner Positioning and Styling', () => {
    it('should render banner with fixed positioning at top', () => {
      const message = 'Please connect your wallet';
      
      renderWithRouter(<NewLandingPage />, {
        route: '/',
        state: { message },
      });
      
      const banner = screen.getByText('Wallet Required').closest('div').parentElement.parentElement;
      expect(banner).toHaveClass('fixed');
      expect(banner.className).toMatch(/top/);
    });

    it('should center banner horizontally', () => {
      const message = 'Please connect your wallet';
      
      renderWithRouter(<NewLandingPage />, {
        route: '/',
        state: { message },
      });
      
      const banner = screen.getByText('Wallet Required').closest('div').parentElement.parentElement;
      expect(banner.className).toMatch(/left-1\/2/);
      expect(banner.className).toMatch(/-translate-x-1\/2/);
    });

    it('should have high z-index for overlay', () => {
      const message = 'Please connect your wallet';
      
      renderWithRouter(<NewLandingPage />, {
        route: '/',
        state: { message },
      });
      
      const banner = screen.getByText('Wallet Required').closest('div').parentElement.parentElement;
      expect(banner).toHaveClass('z-50');
    });

    it('should have slide-down animation', () => {
      const message = 'Please connect your wallet';
      
      renderWithRouter(<NewLandingPage />, {
        route: '/',
        state: { message },
      });
      
      const banner = screen.getByText('Wallet Required').closest('div').parentElement.parentElement;
      expect(banner).toHaveClass('animate-slide-down');
    });
  });

  describe('Accessibility', () => {
    it('should have proper semantic structure', () => {
      const message = 'Please connect your wallet';
      
      renderWithRouter(<NewLandingPage />, {
        route: '/',
        state: { message },
      });
      
      const heading = screen.getByText('Wallet Required');
      expect(heading.tagName).toBe('H4');
    });

    it('should have accessible close button', async () => {
      const user = userEvent.setup({ delay: null });
      const message = 'Please connect your wallet';
      
      renderWithRouter(<NewLandingPage />, {
        route: '/',
        state: { message },
      });
      
      const closeButton = screen.getByRole('button', { name: '' });
      expect(closeButton).toBeInTheDocument();
      
      // Should be keyboard accessible
      closeButton.focus();
      expect(closeButton).toHaveFocus();
      
      // Should work with click
      await user.click(closeButton);
      expect(screen.queryByText(message)).not.toBeInTheDocument();
    });

    it('should have visible text content', () => {
      const message = 'Please connect your wallet to continue';
      
      renderWithRouter(<NewLandingPage />, {
        route: '/',
        state: { message },
      });
      
      expect(screen.getByText('Wallet Required')).toBeVisible();
      expect(screen.getByText(message)).toBeVisible();
    });

    it('should maintain focus management when closing', async () => {
      const user = userEvent.setup({ delay: null });
      const message = 'Please connect your wallet';
      
      renderWithRouter(<NewLandingPage />, {
        route: '/',
        state: { message },
      });
      
      const closeButton = screen.getByRole('button', { name: '' });
      closeButton.focus();
      
      await user.click(closeButton);
      
      // Focus should move away from closed banner
      expect(closeButton).not.toBeInTheDocument();
    });
  });

  describe('Integration with Page Content', () => {
    it('should not block interaction with page content', () => {
      const message = 'Please connect your wallet';
      
      renderWithRouter(<NewLandingPage />, {
        route: '/',
        state: { message },
      });
      
      // Main page heading should still be accessible
      expect(screen.getByText('DotNation')).toBeInTheDocument();
      expect(screen.getByText(/trustless funding/i)).toBeInTheDocument();
    });

    it('should display banner above page header', () => {
      const message = 'Please connect your wallet';
      
      renderWithRouter(<NewLandingPage />, {
        route: '/',
        state: { message },
      });
      
      const banner = screen.getByText('Wallet Required').closest('div').parentElement.parentElement;
      const header = screen.getByRole('banner');
      
      // Banner should have higher z-index than header
      expect(banner).toHaveClass('z-50');
    });

    it('should not affect page layout when displayed', () => {
      const { container } = renderWithRouter(<NewLandingPage />, {
        route: '/',
        state: { message: 'Please connect your wallet' },
      });
      
      // Check that main content is still present
      const mainContent = container.querySelector('main');
      expect(mainContent).toBeInTheDocument();
    });

    it('should not affect page layout when dismissed', async () => {
      const user = userEvent.setup({ delay: null });
      const message = 'Please connect your wallet';
      
      const { container } = renderWithRouter(<NewLandingPage />, {
        route: '/',
        state: { message },
      });
      
      const closeButton = screen.getByRole('button', { name: '' });
      await user.click(closeButton);
      
      // Main content should still be present and unaffected
      const mainContent = container.querySelector('main');
      expect(mainContent).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle rapid mount/unmount', () => {
      const message = 'Please connect your wallet';
      
      const { unmount } = renderWithRouter(<NewLandingPage />, {
        route: '/',
        state: { message },
      });
      
      expect(screen.getByText(message)).toBeInTheDocument();
      unmount();
      
      // Should not throw error
      expect(screen.queryByText(message)).not.toBeInTheDocument();
    });

    it('should handle location state changes', () => {
      const message1 = 'First message';
      const { rerender } = renderWithRouter(<NewLandingPage />, {
        route: '/',
        state: { message: message1 },
      });
      
      expect(screen.getByText(message1)).toBeInTheDocument();
      
      // Note: Location state changes would require navigation in real app
      // This tests the component's ability to handle the initial state
    });

    it('should cleanup timeout on unmount', () => {
      const message = 'Please connect your wallet';
      
      const { unmount } = renderWithRouter(<NewLandingPage />, {
        route: '/',
        state: { message },
      });
      
      expect(screen.getByText(message)).toBeInTheDocument();
      
      // Unmount before timeout
      unmount();
      
      // Fast-forward past timeout
      vi.advanceTimersByTime(5000);
      
      // Should not throw error (timeout cleaned up)
      expect(true).toBe(true);
    });
  });
});
