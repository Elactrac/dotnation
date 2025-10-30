import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { screen, waitFor, within, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../utils/test-utils';
import { CreateCampaignForm } from './CreateCampaignForm';
import toast from 'react-hot-toast';
import * as WalletContext from '../contexts/WalletContext';

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock fetch globally
global.fetch = vi.fn();

describe('CreateCampaignForm', () => {
  const mockOnSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Form Rendering', () => {
    it('should render all required form fields', () => {
      renderWithProviders(<CreateCampaignForm onSuccess={mockOnSuccess} />);

      expect(screen.getByPlaceholderText(/enter a compelling title/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/describe your campaign goals/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/e\.g\., 1000/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/campaign deadline/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/enter the polkadot address/i)).toBeInTheDocument();
    });

    it('should render optional fields', () => {
      renderWithProviders(<CreateCampaignForm onSuccess={mockOnSuccess} />);

      expect(screen.getByPlaceholderText(/technology, healthcare/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/https:\/\/example\.com\/image/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/https:\/\/yourproject\.com/i)).toBeInTheDocument();
    });

    it('should render submit button', () => {
      renderWithProviders(<CreateCampaignForm onSuccess={mockOnSuccess} />);

      expect(screen.getByRole('button', { name: /create campaign/i })).toBeInTheDocument();
    });

    it('should show wallet connection warning when no account connected', () => {
      renderWithProviders(<CreateCampaignForm onSuccess={mockOnSuccess} />);

      expect(screen.getByText(/wallet connection required/i)).toBeInTheDocument();
    });

    it('should not show wallet warning when account is connected', () => {
      // Mock useWallet to return a selected account
      vi.spyOn(WalletContext, 'useWallet').mockReturnValue({
        selectedAccount: { address: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY' },
        accounts: [],
        selectAccount: vi.fn(),
        disconnectWallet: vi.fn(),
      });

      renderWithProviders(<CreateCampaignForm onSuccess={mockOnSuccess} />);

      expect(screen.queryByText(/wallet connection required/i)).not.toBeInTheDocument();
      
      vi.restoreAllMocks();
    });
  });

  describe('Form Validation', () => {
    it('should show error when submitting empty form', async () => {
      const user = userEvent.setup();
      renderWithProviders(<CreateCampaignForm onSuccess={mockOnSuccess} />);

      const submitButton = screen.getByRole('button', { name: /create campaign/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/title is required/i)).toBeInTheDocument();
        expect(screen.getByText(/description is required/i)).toBeInTheDocument();
        expect(screen.getByText(/goal must be greater than 0/i)).toBeInTheDocument();
        expect(screen.getByText(/deadline is required/i)).toBeInTheDocument();
        expect(screen.getByText(/beneficiary address is required/i)).toBeInTheDocument();
      });
    });

    it('should validate title field', async () => {
      const user = userEvent.setup();
      renderWithProviders(<CreateCampaignForm onSuccess={mockOnSuccess} />);

      const titleInput = screen.getByPlaceholderText(/enter a compelling title/i);
      const submitButton = screen.getByRole('button', { name: /create campaign/i });

      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/title is required/i)).toBeInTheDocument();
      });

      await user.type(titleInput, 'My Campaign');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.queryByText(/title is required/i)).not.toBeInTheDocument();
      });
    });

    it('should validate goal is greater than 0', async () => {
      const user = userEvent.setup();
      renderWithProviders(<CreateCampaignForm onSuccess={mockOnSuccess} />);

      const goalInput = screen.getByPlaceholderText(/e\.g\., 1000/i);
      const submitButton = screen.getByRole('button', { name: /create campaign/i });

      await user.type(goalInput, '0');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/goal must be greater than 0/i)).toBeInTheDocument();
      });

      await user.clear(goalInput);
      await user.type(goalInput, '100');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.queryByText(/goal must be greater than 0/i)).not.toBeInTheDocument();
      });
    });

    it('should validate deadline is in the future', async () => {
      const user = userEvent.setup();
      renderWithProviders(<CreateCampaignForm onSuccess={mockOnSuccess} />);

      // Fill in all required fields first
      const titleInput = screen.getByPlaceholderText(/enter a compelling title/i);
      const descriptionInput = screen.getByPlaceholderText(/describe your campaign/i);
      const goalInput = screen.getByLabelText(/funding goal/i);
      const beneficiaryInput = screen.getByPlaceholderText(/enter the polkadot address/i);
      const deadlineInput = screen.getByLabelText(/campaign deadline/i);
      const submitButton = screen.getByRole('button', { name: /create campaign/i });

      // Fill in valid data for all fields except deadline
      await user.type(titleInput, 'Test Campaign');
      await user.type(descriptionInput, 'Test Description');
      await user.type(goalInput, '1000');
      await user.type(beneficiaryInput, '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY');

      // Set deadline to a clearly past date
      const pastDate = '2020-01-01T10:00';

      fireEvent.change(deadlineInput, { target: { value: pastDate } });
      
      // Submit the form using fireEvent.submit instead of user.click
      // (mixing fireEvent and userEvent can cause issues)
      const form = submitButton.closest('form');
      fireEvent.submit(form);

      await waitFor(() => {
        expect(screen.getByText(/deadline must be in the future/i)).toBeInTheDocument();
      });

      // Set deadline to a clearly future date
      const futureDate = '2030-12-31T23:59';

      fireEvent.change(deadlineInput, { target: { value: futureDate } });
      
      // Submit again to clear the error
      fireEvent.submit(form);

      await waitFor(() => {
        expect(screen.queryByText(/deadline must be in the future/i)).not.toBeInTheDocument();
      });
    });

    it('should clear validation errors when user types', async () => {
      const user = userEvent.setup();
      renderWithProviders(<CreateCampaignForm onSuccess={mockOnSuccess} />);

      const titleInput = screen.getByPlaceholderText(/enter a compelling title/i);
      const submitButton = screen.getByRole('button', { name: /create campaign/i });

      await user.click(submitButton);
      
      await waitFor(() => {
        expect(screen.getByText(/title is required/i)).toBeInTheDocument();
      });

      await user.type(titleInput, 'M');

      await waitFor(() => {
        expect(screen.queryByText(/title is required/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('AI Description Generation', () => {
    it('should have AI generate description button', () => {
      renderWithProviders(<CreateCampaignForm onSuccess={mockOnSuccess} />);

      // When no title is provided, the button shows "Enter a title first"
      const aiButton = screen.getByRole('button', { name: /enter a title first/i });
      expect(aiButton).toBeInTheDocument();
    });

    it('should disable AI button when no title is provided', () => {
      renderWithProviders(<CreateCampaignForm onSuccess={mockOnSuccess} />);

      const aiButton = screen.getByRole('button', { name: /enter a title first/i });
      expect(aiButton).toBeDisabled();
    });

    it('should enable AI button when title is provided', async () => {
      const user = userEvent.setup();
      renderWithProviders(<CreateCampaignForm onSuccess={mockOnSuccess} />);

      const titleInput = screen.getByPlaceholderText(/enter a compelling title/i);
      await user.type(titleInput, 'My Campaign');

      const aiButton = screen.getByRole('button', { name: /generate description with ai/i });
      expect(aiButton).not.toBeDisabled();
    });

    it('should keep button disabled when title is cleared', async () => {
      const user = userEvent.setup();
      renderWithProviders(<CreateCampaignForm onSuccess={mockOnSuccess} />);

      // Type a title to enable the button
      const titleInput = screen.getByPlaceholderText(/enter a compelling title/i);
      await user.type(titleInput, 'Test');
      
      const aiButton = screen.getByRole('button', { name: /generate description with ai/i });
      expect(aiButton).not.toBeDisabled();
      
      // Clear the title
      await user.clear(titleInput);
      
      // Button should be disabled again
      const disabledButton = screen.getByRole('button', { name: /enter a title first/i });
      expect(disabledButton).toBeDisabled();
    });

    it('should generate description using AI', async () => {
      const user = userEvent.setup();
      const mockDescription = 'This is an AI-generated description for your campaign.';
      
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ description: mockDescription }),
      });

      renderWithProviders(<CreateCampaignForm onSuccess={mockOnSuccess} />);

      const titleInput = screen.getByPlaceholderText(/enter a compelling title/i);
      await user.type(titleInput, 'My Campaign');

      const aiButton = screen.getByRole('button', { name: /generate description with ai/i });
      await user.click(aiButton);

      await waitFor(() => {
        const descriptionTextarea = screen.getByPlaceholderText(/describe your campaign goals/i);
        expect(descriptionTextarea).toHaveValue(mockDescription);
      });

      expect(toast.success).toHaveBeenCalledWith('Description generated!');
    });

    it('should show loading state while generating', async () => {
      const user = userEvent.setup();
      
      global.fetch.mockImplementation(() => new Promise(() => {})); // Never resolves

      renderWithProviders(<CreateCampaignForm onSuccess={mockOnSuccess} />);

      const titleInput = screen.getByPlaceholderText(/enter a compelling title/i);
      await user.type(titleInput, 'My Campaign');

      const aiButton = screen.getByRole('button', { name: /generate description with ai/i });
      await user.click(aiButton);

      await waitFor(() => {
        expect(aiButton).toBeDisabled();
        expect(aiButton.querySelector('svg.animate-spin')).toBeInTheDocument();
      });
    });

    it('should handle AI generation errors', async () => {
      const user = userEvent.setup();
      
      global.fetch.mockRejectedValueOnce(new Error('AI service unavailable'));

      renderWithProviders(<CreateCampaignForm onSuccess={mockOnSuccess} />);

      const titleInput = screen.getByPlaceholderText(/enter a compelling title/i);
      await user.type(titleInput, 'My Campaign');

      const aiButton = screen.getByRole('button', { name: /generate description with ai/i });
      await user.click(aiButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('AI Generation Failed: AI service unavailable');
      });
    });

    it('should handle AI API error responses', async () => {
      const user = userEvent.setup();
      
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      renderWithProviders(<CreateCampaignForm onSuccess={mockOnSuccess} />);

      const titleInput = screen.getByPlaceholderText(/enter a compelling title/i);
      await user.type(titleInput, 'My Campaign');

      const aiButton = screen.getByRole('button', { name: /generate description with ai/i });
      await user.click(aiButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(expect.stringContaining('AI Generation Failed'));
      });
    });
  });

  describe('Form Submission', () => {
    const fillValidForm = async (user) => {
      await user.type(screen.getByPlaceholderText(/enter a compelling title/i), 'My Test Campaign');
      await user.type(screen.getByPlaceholderText(/describe your campaign goals/i), 'This is a test description');
      await user.type(screen.getByPlaceholderText(/e\.g\., 1000/i), '100');
      
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const futureDate = tomorrow.toISOString().slice(0, 16);
      
      // Use fireEvent for datetime-local input
      const deadlineInput = screen.getByLabelText(/campaign deadline/i);
      fireEvent.change(deadlineInput, { target: { value: futureDate } });
      
      await user.type(screen.getByPlaceholderText(/enter the polkadot address/i), '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY');
    };

    it('should generate contract summary before submission', async () => {
      const user = userEvent.setup();
      const mockSummary = 'Campaign will raise 100 DOT by tomorrow';
      
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ summary: mockSummary }),
      });

      renderWithProviders(<CreateCampaignForm onSuccess={mockOnSuccess} />);

      await fillValidForm(user);

      const submitButton = screen.getByRole('button', { name: /create campaign/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/campaign contract summary/i)).toBeInTheDocument();
        expect(screen.getByText(mockSummary)).toBeInTheDocument();
      });
    });

    it('should show modal with contract summary', async () => {
      const user = userEvent.setup();
      const mockSummary = 'Your campaign details';
      
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ summary: mockSummary }),
      });

      renderWithProviders(<CreateCampaignForm onSuccess={mockOnSuccess} />);

      await fillValidForm(user);

      const submitButton = screen.getByRole('button', { name: /create campaign/i });
      await user.click(submitButton);

      await waitFor(() => {
        const modal = screen.getByText(/campaign contract summary/i).closest('div');
        expect(modal).toBeInTheDocument();
        expect(within(modal).getByText(mockSummary)).toBeInTheDocument();
      });
    });

    it('should have cancel and confirm buttons in modal', async () => {
      const user = userEvent.setup();
      
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ summary: 'Summary' }),
      });

      renderWithProviders(<CreateCampaignForm onSuccess={mockOnSuccess} />);

      await fillValidForm(user);

      const submitButton = screen.getByRole('button', { name: /create campaign/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /confirm & create campaign/i })).toBeInTheDocument();
      });
    });

    it('should close modal when cancel is clicked', async () => {
      const user = userEvent.setup();
      
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ summary: 'Summary' }),
      });

      renderWithProviders(<CreateCampaignForm onSuccess={mockOnSuccess} />);

      await fillValidForm(user);

      const submitButton = screen.getByRole('button', { name: /create campaign/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/campaign contract summary/i)).toBeInTheDocument();
      });

      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await user.click(cancelButton);

      await waitFor(() => {
        expect(screen.queryByText(/campaign contract summary/i)).not.toBeInTheDocument();
      });
    });

    it('should create campaign when confirmed', async () => {
      const user = userEvent.setup();
      
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ summary: 'Summary' }),
      });

      renderWithProviders(<CreateCampaignForm onSuccess={mockOnSuccess} />);

      await fillValidForm(user);

      const submitButton = screen.getByRole('button', { name: /create campaign/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /confirm & create campaign/i })).toBeInTheDocument();
      });

      const confirmButton = screen.getByRole('button', { name: /confirm & create campaign/i });
      await user.click(confirmButton);

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalled();
      }, { timeout: 3000 });
    });

    it('should show success toast after creation', async () => {
      const user = userEvent.setup();
      
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ summary: 'Summary' }),
      });

      renderWithProviders(<CreateCampaignForm onSuccess={mockOnSuccess} />);

      await fillValidForm(user);

      const submitButton = screen.getByRole('button', { name: /create campaign/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /confirm & create campaign/i })).toBeInTheDocument();
      });

      const confirmButton = screen.getByRole('button', { name: /confirm & create campaign/i });
      await user.click(confirmButton);

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith(expect.stringContaining('Campaign created'));
      }, { timeout: 3000 });
    });

    it('should show loading state during creation', async () => {
      const user = userEvent.setup();
      
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ summary: 'Summary' }),
      });

      renderWithProviders(<CreateCampaignForm onSuccess={mockOnSuccess} />);

      await fillValidForm(user);

      const submitButton = screen.getByRole('button', { name: /create campaign/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /confirm & create campaign/i })).toBeInTheDocument();
      });

      const confirmButton = screen.getByRole('button', { name: /confirm & create campaign/i });
      await user.click(confirmButton);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /creating campaign\.\.\./i })).toBeInTheDocument();
      });
    });

    it('should handle contract summary generation errors', async () => {
      const user = userEvent.setup();
      
      global.fetch.mockRejectedValueOnce(new Error('Summary service unavailable'));

      renderWithProviders(<CreateCampaignForm onSuccess={mockOnSuccess} />);

      await fillValidForm(user);

      const submitButton = screen.getByRole('button', { name: /create campaign/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith(expect.stringContaining('Summary Generation Failed'));
      });
    });
  });

  describe('Form Interaction', () => {
    it('should update form state when typing in fields', async () => {
      const user = userEvent.setup();
      renderWithProviders(<CreateCampaignForm onSuccess={mockOnSuccess} />);

      const titleInput = screen.getByPlaceholderText(/enter a compelling title/i);
      await user.type(titleInput, 'New Campaign');

      expect(titleInput).toHaveValue('New Campaign');
    });

    it('should handle optional fields', async () => {
      const user = userEvent.setup();
      renderWithProviders(<CreateCampaignForm onSuccess={mockOnSuccess} />);

      const categoryInput = screen.getByPlaceholderText(/technology, healthcare/i);
      const imageUrlInput = screen.getByPlaceholderText(/https:\/\/example\.com\/image/i);
      const websiteInput = screen.getByPlaceholderText(/https:\/\/yourproject\.com/i);

      await user.type(categoryInput, 'Technology');
      await user.type(imageUrlInput, 'https://example.com/image.png');
      await user.type(websiteInput, 'https://example.com');

      expect(categoryInput).toHaveValue('Technology');
      expect(imageUrlInput).toHaveValue('https://example.com/image.png');
      expect(websiteInput).toHaveValue('https://example.com');
    });

    it('should handle decimal values for goal', async () => {
      const user = userEvent.setup();
      renderWithProviders(<CreateCampaignForm onSuccess={mockOnSuccess} />);

      const goalInput = screen.getByPlaceholderText(/e\.g\., 1000/i);
      await user.type(goalInput, '123.45');

      expect(goalInput).toHaveValue(123.45);
    });
  });

  describe('Responsive Design', () => {
    it('should render with responsive grid layout', () => {
      const { container } = renderWithProviders(<CreateCampaignForm onSuccess={mockOnSuccess} />);

      const gridElements = container.querySelectorAll('.grid');
      expect(gridElements.length).toBeGreaterThan(0);
    });

    it('should have responsive spacing classes', () => {
      const { container } = renderWithProviders(<CreateCampaignForm onSuccess={mockOnSuccess} />);

      const spacingElements = container.querySelectorAll('[class*="space-y"]');
      expect(spacingElements.length).toBeGreaterThan(0);
    });
  });

  describe('Accessibility', () => {
    it('should have proper labels for all inputs', () => {
      renderWithProviders(<CreateCampaignForm onSuccess={mockOnSuccess} />);

      expect(screen.getByPlaceholderText(/enter a compelling title/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/describe your campaign goals/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/e\.g\., 1000/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/campaign deadline/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/enter the polkadot address/i)).toBeInTheDocument();
    });

    it('should display error messages with proper styling', async () => {
      const user = userEvent.setup();
      renderWithProviders(<CreateCampaignForm onSuccess={mockOnSuccess} />);

      const submitButton = screen.getByRole('button', { name: /create campaign/i });
      await user.click(submitButton);

      await waitFor(() => {
        // Get specific error messages (not the wallet warning)
        expect(screen.getByText(/title is required/i).className).toContain('text-red-400');
        expect(screen.getByText(/description is required/i).className).toContain('text-red-400');
        expect(screen.getByText(/goal must be greater than 0/i).className).toContain('text-red-400');
      });
    });

    it('should have proper button states', async () => {
      userEvent.setup();
      renderWithProviders(<CreateCampaignForm onSuccess={mockOnSuccess} />);

      const submitButton = screen.getByRole('button', { name: /create campaign/i });
      expect(submitButton).toHaveClass('disabled:opacity-50', 'disabled:cursor-not-allowed');
    });

    it('should have proper ARIA attributes for disabled buttons', () => {
      renderWithProviders(<CreateCampaignForm onSuccess={mockOnSuccess} />);

      const aiButton = screen.getByRole('button', { name: /enter a title first/i });
      expect(aiButton).toBeDisabled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long titles', async () => {
      const user = userEvent.setup();
      renderWithProviders(<CreateCampaignForm onSuccess={mockOnSuccess} />);

      const titleInput = screen.getByPlaceholderText(/enter a compelling title/i);
      const longTitle = 'A'.repeat(500);
      await user.type(titleInput, longTitle);

      expect(titleInput).toHaveValue(longTitle);
    });

    it('should handle very long descriptions', async () => {
      const user = userEvent.setup();
      renderWithProviders(<CreateCampaignForm onSuccess={mockOnSuccess} />);

      const descriptionInput = screen.getByPlaceholderText(/describe your campaign goals/i);
      const longDescription = 'B'.repeat(5000);
      
      // Use paste instead of type for better performance with long strings
      await user.click(descriptionInput);
      await user.paste(longDescription);

      expect(descriptionInput).toHaveValue(longDescription);
    });

    it('should handle negative goal values', async () => {
      const user = userEvent.setup();
      renderWithProviders(<CreateCampaignForm onSuccess={mockOnSuccess} />);

      const goalInput = screen.getByPlaceholderText(/e\.g\., 1000/i);
      await user.type(goalInput, '-100');

      const submitButton = screen.getByRole('button', { name: /create campaign/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/goal must be greater than 0/i)).toBeInTheDocument();
      });
    });

    it('should handle special characters in inputs', async () => {
      const user = userEvent.setup();
      renderWithProviders(<CreateCampaignForm onSuccess={mockOnSuccess} />);

      const titleInput = screen.getByPlaceholderText(/enter a compelling title/i);
      
      // Use paste instead of type for special characters
      await user.click(titleInput);
      await user.paste('!@#$%^&*()');

      expect(titleInput).toHaveValue('!@#$%^&*()');
    });
  });
});
