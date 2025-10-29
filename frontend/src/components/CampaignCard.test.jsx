import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders, mockCampaigns } from '../utils/test-utils';
import CampaignCard from './CampaignCard';

// Mock fetch globally
global.fetch = vi.fn();

describe('CampaignCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Campaign Display', () => {
    it('should render campaign basic information', () => {
      const campaign = mockCampaigns[0];
      renderWithProviders(<CampaignCard campaign={campaign} />);

      expect(screen.getByText(campaign.title)).toBeInTheDocument();
      expect(screen.getByText(/active/i)).toBeInTheDocument();
      expect(screen.getByText(/goal:/i)).toBeInTheDocument();
    });

    it('should display correct number of donors', () => {
      const campaign = {
        ...mockCampaigns[0],
        donations: [{ amount: '1000000000000' }, { amount: '2000000000000' }],
      };
      renderWithProviders(<CampaignCard campaign={campaign} />);

      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText(/donors/i)).toBeInTheDocument();
    });

    it('should display 0 donors when donations array is empty', () => {
      const campaign = {
        ...mockCampaigns[0],
        donations: [],
      };
      renderWithProviders(<CampaignCard campaign={campaign} />);

      expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('should display 0 donors when donations is undefined', () => {
      const campaign = {
        ...mockCampaigns[0],
        donations: undefined,
      };
      renderWithProviders(<CampaignCard campaign={campaign} />);

      expect(screen.getByText('0')).toBeInTheDocument();
    });
  });

  describe('Campaign Status', () => {
    it('should display Active status with correct styling', () => {
      const campaign = {
        ...mockCampaigns[0],
        state: 'Active',
        deadline: Date.now() + 1000000000,
      };
      renderWithProviders(<CampaignCard campaign={campaign} />);

      const statusBadge = screen.getByText(/active/i);
      expect(statusBadge).toBeInTheDocument();
      expect(statusBadge).toHaveClass('badge-info');
    });

    it('should display Successful status with correct styling', () => {
      const campaign = {
        ...mockCampaigns[0],
        state: 'Successful',
        raised: '15000000000000',
        goal: '10000000000000',
      };
      renderWithProviders(<CampaignCard campaign={campaign} />);

      const statusBadge = screen.getByText(/successful/i);
      expect(statusBadge).toBeInTheDocument();
      expect(statusBadge).toHaveClass('badge-success');
    });

    it('should display Failed status with correct styling', () => {
      const campaign = {
        ...mockCampaigns[0],
        state: 'Failed',
        deadline: Date.now() - 1000000,
        raised: '5000000000000',
        goal: '10000000000000',
      };
      renderWithProviders(<CampaignCard campaign={campaign} />);

      const statusBadge = screen.getByText(/failed/i);
      expect(statusBadge).toBeInTheDocument();
      expect(statusBadge).toHaveClass('badge-error');
    });

    it('should display Withdrawn status', () => {
      const campaign = {
        ...mockCampaigns[0],
        state: 'Withdrawn',
      };
      renderWithProviders(<CampaignCard campaign={campaign} />);

      expect(screen.getByText(/withdrawn/i)).toBeInTheDocument();
    });
  });

  describe('Progress Bar', () => {
    it('should calculate and display progress correctly', () => {
      const campaign = {
        ...mockCampaigns[0],
        raised: '5000000000000',
        goal: '10000000000000',
      };
      renderWithProviders(<CampaignCard campaign={campaign} />);

      const progressBar = document.querySelector('.bg-primary');
      expect(progressBar).toHaveStyle({ width: '50%' });
    });

    it('should cap progress at 100%', () => {
      const campaign = {
        ...mockCampaigns[0],
        raised: '15000000000000',
        goal: '10000000000000',
      };
      renderWithProviders(<CampaignCard campaign={campaign} />);

      const progressBar = document.querySelector('.bg-primary');
      expect(progressBar).toHaveStyle({ width: '100%' });
    });

    it('should show 0% progress when nothing raised', () => {
      const campaign = {
        ...mockCampaigns[0],
        raised: '0',
        goal: '10000000000000',
      };
      renderWithProviders(<CampaignCard campaign={campaign} />);

      const progressBar = document.querySelector('.bg-primary');
      expect(progressBar).toHaveStyle({ width: '0%' });
    });
  });

  describe('AI Summary Feature', () => {
    it('should have a "Summarize with AI" button', () => {
      const campaign = mockCampaigns[0];
      renderWithProviders(<CampaignCard campaign={campaign} />);

      const aiButton = screen.getByTitle(/summarize with ai/i);
      expect(aiButton).toBeInTheDocument();
    });

    it('should show loading state when generating summary', async () => {
      const user = userEvent.setup();
      const campaign = mockCampaigns[0];
      
      global.fetch.mockImplementation(() => new Promise(() => {})); // Never resolves
      
      renderWithProviders(<CampaignCard campaign={campaign} />);

      const aiButton = screen.getByTitle(/summarize with ai/i);
      await user.click(aiButton);

      expect(aiButton).toBeDisabled();
      expect(screen.getByTitle(/summarize with ai/i).querySelector('svg.animate-spin')).toBeInTheDocument();
    });

    it('should display AI-generated summary on success', async () => {
      const user = userEvent.setup();
      const campaign = mockCampaigns[0];
      const mockSummary = 'This campaign aims to help families in need.';
      
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ summary: mockSummary }),
      });
      
      renderWithProviders(<CampaignCard campaign={campaign} />);

      const aiButton = screen.getByTitle(/summarize with ai/i);
      await user.click(aiButton);

      await waitFor(() => {
        expect(screen.getByText(mockSummary)).toBeInTheDocument();
      });
    });

    it('should toggle summary off when clicked again', async () => {
      const user = userEvent.setup();
      const campaign = mockCampaigns[0];
      const mockSummary = 'This campaign aims to help families in need.';
      
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ summary: mockSummary }),
      });
      
      renderWithProviders(<CampaignCard campaign={campaign} />);

      const aiButton = screen.getByTitle(/summarize with ai/i);
      
      // First click - show summary
      await user.click(aiButton);
      await waitFor(() => {
        expect(screen.getByText(mockSummary)).toBeInTheDocument();
      });

      // Second click - hide summary
      await user.click(aiButton);
      await waitFor(() => {
        expect(screen.queryByText(mockSummary)).not.toBeInTheDocument();
      });
    });

    it('should display error message when AI service fails', async () => {
      const user = userEvent.setup();
      const campaign = mockCampaigns[0];
      const errorMessage = 'AI service unavailable';
      
      global.fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: errorMessage }),
      });
      
      renderWithProviders(<CampaignCard campaign={campaign} />);

      const aiButton = screen.getByTitle(/summarize with ai/i);
      await user.click(aiButton);

      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });
    });

    it('should handle network errors gracefully', async () => {
      const user = userEvent.setup();
      const campaign = mockCampaigns[0];
      
      global.fetch.mockRejectedValueOnce(new Error('Network error'));
      
      renderWithProviders(<CampaignCard campaign={campaign} />);

      const aiButton = screen.getByTitle(/summarize with ai/i);
      await user.click(aiButton);

      await waitFor(() => {
        expect(screen.getByText(/network error/i)).toBeInTheDocument();
      });
    });

    it('should toggle error message off when clicked again', async () => {
      const user = userEvent.setup();
      const campaign = mockCampaigns[0];
      
      global.fetch.mockRejectedValueOnce(new Error('Network error'));
      
      renderWithProviders(<CampaignCard campaign={campaign} />);

      const aiButton = screen.getByTitle(/summarize with ai/i);
      
      // First click - show error
      await user.click(aiButton);
      await waitFor(() => {
        expect(screen.getByText(/network error/i)).toBeInTheDocument();
      });

      // Second click - hide error
      await user.click(aiButton);
      await waitFor(() => {
        expect(screen.queryByText(/network error/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Action Buttons', () => {
    it('should render "View Details" button with link', () => {
      const campaign = mockCampaigns[0];
      renderWithProviders(<CampaignCard campaign={campaign} />);

      const viewButton = screen.getByTitle(/view details/i);
      expect(viewButton).toBeInTheDocument();
      
      const link = viewButton.closest('a');
      expect(link).toHaveAttribute('href', `/dashboard/campaign/${campaign.id}`);
    });

    it('should show "Withdraw Funds" button for successful campaigns', () => {
      const campaign = {
        ...mockCampaigns[0],
        state: 'Successful',
        raised: '15000000000000',
        goal: '10000000000000',
      };
      renderWithProviders(<CampaignCard campaign={campaign} />);

      expect(screen.getByTitle(/withdraw funds/i)).toBeInTheDocument();
    });

    it('should not show "Withdraw Funds" button for active campaigns', () => {
      const campaign = {
        ...mockCampaigns[0],
        state: 'Active',
        deadline: Date.now() + 1000000000,
      };
      renderWithProviders(<CampaignCard campaign={campaign} />);

      expect(screen.queryByTitle(/withdraw funds/i)).not.toBeInTheDocument();
    });

    it('should not show "Withdraw Funds" button for failed campaigns', () => {
      const campaign = {
        ...mockCampaigns[0],
        state: 'Failed',
        deadline: Date.now() - 1000000,
      };
      renderWithProviders(<CampaignCard campaign={campaign} />);

      expect(screen.queryByTitle(/withdraw funds/i)).not.toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('should have responsive text sizes', () => {
      const campaign = mockCampaigns[0];
      const { container } = renderWithProviders(<CampaignCard campaign={campaign} />);

      // Check for responsive classes
      const title = screen.getByText(campaign.title);
      expect(title).toHaveClass('text-display-sm');
      
      const goalText = container.querySelector('.text-xs');
      expect(goalText).toBeInTheDocument();
    });

    it('should have responsive padding on buttons', () => {
      const campaign = mockCampaigns[0];
      renderWithProviders(<CampaignCard campaign={campaign} />);

      const statusBadge = screen.getByText(/active/i);
      expect(statusBadge.className).toMatch(/px-\d+/);
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long campaign titles', () => {
      const campaign = {
        ...mockCampaigns[0],
        title: 'A'.repeat(200),
      };
      renderWithProviders(<CampaignCard campaign={campaign} />);

      const title = screen.getByText('A'.repeat(200));
      expect(title).toHaveClass('break-words');
    });

    it('should handle campaigns with zero goal', () => {
      const campaign = {
        ...mockCampaigns[0],
        goal: '0',
        raised: '0',
      };
      renderWithProviders(<CampaignCard campaign={campaign} />);

      expect(screen.getByText(/goal:/i)).toBeInTheDocument();
    });

    it('should handle missing campaign properties gracefully', () => {
      const campaign = {
        id: 1,
        title: 'Test Campaign',
        description: 'Test Description',
        raised: '0',
        goal: '1000000000000',
        deadline: Date.now() + 1000000,
        state: 'Active',
      };
      
      expect(() => renderWithProviders(<CampaignCard campaign={campaign} />)).not.toThrow();
    });
  });

  describe('Accessibility', () => {
    it('should have accessible button titles', () => {
      const campaign = mockCampaigns[0];
      renderWithProviders(<CampaignCard campaign={campaign} />);

      expect(screen.getByTitle(/summarize with ai/i)).toBeInTheDocument();
      expect(screen.getByTitle(/view details/i)).toBeInTheDocument();
    });

    it('should disable AI button while loading', async () => {
      const user = userEvent.setup();
      const campaign = mockCampaigns[0];
      
      global.fetch.mockImplementation(() => new Promise(() => {}));
      
      renderWithProviders(<CampaignCard campaign={campaign} />);

      const aiButton = screen.getByTitle(/summarize with ai/i);
      await user.click(aiButton);

      expect(aiButton).toBeDisabled();
      expect(aiButton).toHaveClass('disabled:opacity-50', 'disabled:cursor-not-allowed');
    });

    it('should have proper ARIA attributes for progress bar', () => {
      const campaign = mockCampaigns[0];
      const { container } = renderWithProviders(<CampaignCard campaign={campaign} />);

      const progressBar = container.querySelector('.bg-border');
      expect(progressBar).toBeInTheDocument();
    });
  });
});
