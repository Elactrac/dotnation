/* eslint-disable react/prop-types */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { renderWithProviders } from '../utils/test-utils';
import CreateCampaignPage from '../pages/CreateCampaignPage';

// Mock Polkadot extension
vi.mock('@polkadot/extension-dapp', () => ({
  web3Enable: vi.fn().mockResolvedValue([{ name: 'polkadot-js', version: '0.44.1' }]),
  web3Accounts: vi.fn().mockResolvedValue([
    {
      address: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
      meta: { name: 'Test Account', source: 'polkadot-js' },
      type: 'sr25519',
    },
  ]),
  web3FromAddress: vi.fn().mockResolvedValue({
    signer: {
      signRaw: vi.fn(),
      signPayload: vi.fn(),
    },
  }),
}));

// Mock framer-motion for simpler testing
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    button: ({ children, ...props }) => <button {...props}>{children}</button>,
    form: ({ children, ...props }) => <form {...props}>{children}</form>,
  },
  AnimatePresence: ({ children }) => <>{children}</>,
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => {
  const mockIcon = () => <div>Icon</div>;
  return {
    Plus: mockIcon,
    AlertCircle: mockIcon,
    CheckCircle: mockIcon,
    Info: mockIcon,
    Calendar: mockIcon,
    Target: mockIcon,
    User: mockIcon,
    FileText: mockIcon,
    DollarSign: mockIcon,
    Clock: mockIcon,
    TrendingUp: mockIcon,
    Heart: mockIcon,
    ArrowRight: mockIcon,
    Loader: mockIcon,
    Gift: mockIcon,
    Wallet: mockIcon,
    X: mockIcon,
    Check: mockIcon,
    ChevronRight: mockIcon,
    ChevronLeft: mockIcon,
    Search: mockIcon,
    Filter: mockIcon,
    Home: mockIcon,
    Settings: mockIcon,
    LogOut: mockIcon,
    Menu: mockIcon,
  };
});

// Mock AI API to prevent actual API calls
vi.mock('../utils/aiApi', () => ({
  generateDescription: vi.fn().mockResolvedValue({ description: 'AI generated description' }),
  generateTitles: vi.fn().mockResolvedValue({ titles: ['Title 1', 'Title 2', 'Title 3'] }),
  detectFraud: vi.fn().mockResolvedValue({ riskLevel: 'low', riskScore: 10, flags: [], recommendations: [] }),
  generateContractSummary: vi.fn().mockResolvedValue('Mock contract summary'),
}));

describe('Campaign Creation Integration Tests', () => {
  let user;

  beforeEach(() => {
    user = userEvent.setup();
    vi.clearAllMocks();
  });

  describe('Form Validation', () => {
    it('should display validation errors for empty required fields', async () => {
      const router = createMemoryRouter([
        {
          path: '/create-campaign',
          element: <CreateCampaignPage />,
        },
      ], {
        initialEntries: ['/create-campaign'],
      });

      renderWithProviders(<RouterProvider router={router} />, { withRouter: false });

      // Try to submit without filling form
      const submitButton = screen.getByRole('button', { name: /create campaign/i });
      await user.click(submitButton);

      // Should show validation errors
      await waitFor(() => {
        // Check for required field errors
        expect(screen.getByText(/title must be between 1 and 100 characters/i)).toBeInTheDocument();
        expect(screen.getByText(/description must be between 1 and 1000 characters/i)).toBeInTheDocument();
        expect(screen.getByText(/goal must be between/i)).toBeInTheDocument();
        expect(screen.getByText(/deadline is required/i)).toBeInTheDocument();
        expect(screen.getByText(/beneficiary address is required/i)).toBeInTheDocument();
      });
    });

    it('should validate description minimum length (50 characters)', async () => {
      const router = createMemoryRouter([
        {
          path: '/create-campaign',
          element: <CreateCampaignPage />,
        },
      ], {
        initialEntries: ['/create-campaign'],
      });

      renderWithProviders(<RouterProvider router={router} />, { withRouter: false });

      // Fill description with less than 50 characters
      const descriptionInput = screen.getByPlaceholderText(/tell your story/i);
      await user.type(descriptionInput, 'Too short description');

      // Submit form
      const submitButton = screen.getByRole('button', { name: /create campaign/i });
      await user.click(submitButton);

      // Should show error for short description
      await waitFor(() => {
        expect(screen.getByText(/description must be at least 50 characters/i)).toBeInTheDocument();
      });
    });

    it('should require deadline field to be filled', async () => {
      const router = createMemoryRouter([
        {
          path: '/create-campaign',
          element: <CreateCampaignPage />,
        },
      ], {
        initialEntries: ['/create-campaign'],
      });

      renderWithProviders(<RouterProvider router={router} />, { withRouter: false });

      // Submit form without filling deadline
      const submitButton = screen.getByRole('button', { name: /create campaign/i });
      await user.click(submitButton);

      // Should show error for missing deadline
      await waitFor(() => {
        expect(screen.getByText(/deadline is required/i)).toBeInTheDocument();
      });

      // Verify the help text is shown
      expect(screen.getByText(/must be between 1 hour and 1 year from now/i)).toBeInTheDocument();
    });
  });

  describe('Successful Campaign Creation Flow', () => {
    it('should allow user to fill form and see character counts', async () => {
      const router = createMemoryRouter([
        {
          path: '/create-campaign',
          element: <CreateCampaignPage />,
        },
      ], {
        initialEntries: ['/create-campaign'],
      });

      renderWithProviders(<RouterProvider router={router} />, { withRouter: false });

      // Fill title and verify character count
      const titleInput = screen.getByPlaceholderText(/enter a compelling campaign title/i);
      await user.type(titleInput, 'Save the Ocean');

      // Should show character count
      await waitFor(() => {
        expect(screen.getByText('14/100 characters')).toBeInTheDocument();
      });

      // Fill description
      const descriptionInput = screen.getByPlaceholderText(/tell your story/i);
      await user.type(descriptionInput, 'Help us clean up ocean pollution and protect marine life for future generations.');

      // Description should also show character count
      await waitFor(() => {
        expect(screen.getByText(/\/1000 characters/i)).toBeInTheDocument();
      });
    });

    it('should show all required form fields', async () => {
      const router = createMemoryRouter([
        {
          path: '/create-campaign',
          element: <CreateCampaignPage />,
        },
      ], {
        initialEntries: ['/create-campaign'],
      });

      renderWithProviders(<RouterProvider router={router} />, { withRouter: false });

      // Verify all required fields are present
      expect(screen.getByPlaceholderText(/enter a compelling campaign title/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/tell your story/i)).toBeInTheDocument();
      expect(screen.getByRole('spinbutton', { name: /goal/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/campaign deadline/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/enter the beneficiary.*polkadot address/i)).toBeInTheDocument();

      // Verify submit button exists
      expect(screen.getByRole('button', { name: /create campaign/i })).toBeInTheDocument();

      // Verify AI assistance buttons
      expect(screen.getByLabelText(/generate ai title suggestions/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/generate ai description from title/i)).toBeInTheDocument();
    });
  });

  describe('User Experience', () => {
    it('should disable AI description button when title is empty', async () => {
      const router = createMemoryRouter([
        {
          path: '/create-campaign',
          element: <CreateCampaignPage />,
        },
      ], {
        initialEntries: ['/create-campaign'],
      });

      renderWithProviders(<RouterProvider router={router} />, { withRouter: false });

      // AI description button should be disabled initially
      const aiDescButton = screen.getByLabelText(/generate ai description from title/i);
      expect(aiDescButton).toBeDisabled();

      // Fill title
      const titleInput = screen.getByPlaceholderText(/enter a compelling campaign title/i);
      await user.type(titleInput, 'Save the Ocean');

      // AI description button should now be enabled
      await waitFor(() => {
        expect(aiDescButton).not.toBeDisabled();
      });
    });

    it('should show validation errors with aria-invalid attributes', async () => {
      const router = createMemoryRouter([
        {
          path: '/create-campaign',
          element: <CreateCampaignPage />,
        },
      ], {
        initialEntries: ['/create-campaign'],
      });

      renderWithProviders(<RouterProvider router={router} />, { withRouter: false });

      // Submit empty form
      const submitButton = screen.getByRole('button', { name: /create campaign/i });
      await user.click(submitButton);

      // Check that inputs have aria-invalid="true" after validation fails
      await waitFor(() => {
        const titleInput = screen.getByPlaceholderText(/enter a compelling campaign title/i);
        expect(titleInput).toHaveAttribute('aria-invalid', 'true');

        const descriptionInput = screen.getByPlaceholderText(/tell your story/i);
        expect(descriptionInput).toHaveAttribute('aria-invalid', 'true');
      });
    });
  });

  describe('Wallet Integration', () => {
    it('should show form when wallet is not connected', async () => {
      const router = createMemoryRouter([
        {
          path: '/create-campaign',
          element: <CreateCampaignPage />,
        },
      ], {
        initialEntries: ['/create-campaign'],
      });

      // Render without wallet
      renderWithProviders(<RouterProvider router={router} />, {
        withRouter: false,
        withWallet: false,
      });

      // Form should still be visible (wallet check happens on submit)
      await waitFor(() => {
        expect(screen.getByPlaceholderText(/enter a compelling campaign title/i)).toBeInTheDocument();
      });
    });
  });
});
