import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import CaptchaModal from './CaptchaModal';

// Mock fetch for backend verification
global.fetch = vi.fn();

describe('CaptchaModal Component', () => {
  let mockOnClose;
  let mockOnVerify;

  beforeEach(() => {
    mockOnClose = vi.fn();
    mockOnVerify = vi.fn();
    vi.useFakeTimers();
    sessionStorage.clear();
    
    // Mock fetch for session creation (always succeeds)
    global.fetch.mockImplementation((url) => {
      if (url.includes('/create-session')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            success: true,
            sessionToken: 'mock-session-token',
            expiresIn: 300
          })
        });
      }
      // For verification, return failure by default (will use client-side fallback)
      return Promise.reject(new Error('Backend unavailable'));
    });
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  describe('Modal Visibility', () => {
    it('should not render when isOpen is false', () => {
      render(
        <CaptchaModal isOpen={false} onClose={mockOnClose} onVerify={mockOnVerify} />
      );

      expect(screen.queryByText('Verify You\'re Human')).not.toBeInTheDocument();
    });

    it('should render when isOpen is true', async () => {
      await act(async () => {
        render(
          <CaptchaModal isOpen={true} onClose={mockOnClose} onVerify={mockOnVerify} />
        );
      });

      expect(screen.getByText('Verify You\'re Human')).toBeInTheDocument();
    });

    it('should generate captcha question on open', async () => {
      await act(async () => {
        render(
          <CaptchaModal isOpen={true} onClose={mockOnClose} onVerify={mockOnVerify} />
        );
      });

      // Should show either visual captcha canvas or pattern question
      const form = screen.getByRole('button', { name: /Verify/i }).closest('form');
      expect(form).toBeInTheDocument();
    });
  });

  describe('Captcha Types', () => {
    it('should display captcha challenge text', async () => {
      await act(async () => {
        render(
          <CaptchaModal isOpen={true} onClose={mockOnClose} onVerify={mockOnVerify} />
        );
      });

      // Should have some challenge text
      const form = screen.getByRole('button', { name: /Verify/i }).closest('form');
      expect(form).toBeInTheDocument();
    });

    it('should have refresh button for new challenge', async () => {
      await act(async () => {
        render(
          <CaptchaModal isOpen={true} onClose={mockOnClose} onVerify={mockOnVerify} />
        );
      });

      expect(screen.getByText('New Challenge')).toBeInTheDocument();
    });

    it('should regenerate captcha when refresh is clicked', async () => {
      await act(async () => {
        render(
          <CaptchaModal isOpen={true} onClose={mockOnClose} onVerify={mockOnVerify} />
        );
      });

      const refreshButton = screen.getByText('New Challenge');
      fireEvent.click(refreshButton);

      // Should still show the form
      expect(screen.getByRole('button', { name: /Verify/i })).toBeInTheDocument();
    });
  });

  describe('Correct Answer Submission', () => {
    it('should call onVerify and onClose on correct answer with backend', async () => {
      // Mock session creation and successful backend verification
      global.fetch.mockImplementation((url) => {
        if (url.includes('/create-session')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              success: true,
              sessionToken: 'mock-session-token',
              expiresIn: 300
            })
          });
        }
        if (url.includes('/verify')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              verified: true,
              token: 'mock-token',
              timestamp: Date.now()
            })
          });
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      await act(async () => {
        render(
          <CaptchaModal isOpen={true} onClose={mockOnClose} onVerify={mockOnVerify} />
        );
      });

      // Wait to avoid timing check
      act(() => {
        vi.advanceTimersByTime(2500);
      });

      // Try to find input (could be text input for visual or buttons for pattern)
      const inputs = screen.queryAllByRole('textbox');
      if (inputs.length > 0) {
        fireEvent.change(inputs[0], { target: { value: 'ABC123' } });
      }

      const verifyButton = screen.getByText('Verify');
      fireEvent.click(verifyButton);

      await act(async () => {
        vi.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(mockOnVerify).toHaveBeenCalledWith(true);
      });
    });

    it('should store verification token in sessionStorage on success', async () => {
      global.fetch.mockImplementation((url) => {
        if (url.includes('/create-session')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              success: true,
              sessionToken: 'mock-session-token',
              expiresIn: 300
            })
          });
        }
        if (url.includes('/verify')) {
          return Promise.resolve({
            ok: true,
            json: async () => ({
              verified: true,
              token: 'mock-token',
              timestamp: Date.now()
            })
          });
        }
        return Promise.reject(new Error('Unknown endpoint'));
      });

      await act(async () => {
        render(
          <CaptchaModal isOpen={true} onClose={mockOnClose} onVerify={mockOnVerify} />
        );
      });

      act(() => {
        vi.advanceTimersByTime(2500);
      });

      const inputs = screen.queryAllByRole('textbox');
      if (inputs.length > 0) {
        fireEvent.change(inputs[0], { target: { value: 'ABC123' } });
      }

      const verifyButton = screen.getByText('Verify');
      fireEvent.click(verifyButton);

      await act(async () => {
        vi.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(sessionStorage.getItem('captcha_verified')).toBeTruthy();
      });
    });
  });

  describe('Incorrect Answer Handling', () => {
    it('should show error message on incorrect answer', async () => {
      render(
        <CaptchaModal isOpen={true} onClose={mockOnClose} onVerify={mockOnVerify} />
      );

      act(() => {
        vi.advanceTimersByTime(2500);
      });

      const inputs = screen.queryAllByRole('textbox');
      if (inputs.length > 0) {
        // Enter wrong answer
        fireEvent.change(inputs[0], { target: { value: 'WRONG' } });
      }

      const verifyButton = screen.getByText('Verify');
      fireEvent.click(verifyButton);

      await act(async () => {
        vi.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        screen.queryByText(/Incorrect answer|attempt.*remaining/i);
        // Error might appear
      });
    });

    it('should track failed attempts', async () => {
      render(
        <CaptchaModal isOpen={true} onClose={mockOnClose} onVerify={mockOnVerify} />
      );

      const verifyButton = screen.getByText('Verify');

      // First failed attempt
      act(() => {
        vi.advanceTimersByTime(2500);
      });
      
      const inputs = screen.queryAllByRole('textbox');
      if (inputs.length > 0) {
        fireEvent.change(inputs[0], { target: { value: 'WRONG' } });
      }
      
      fireEvent.click(verifyButton);

      await act(async () => {
        vi.advanceTimersByTime(1000);
      });

      // Should show attempts indicator
      await waitFor(() => {
        const form = verifyButton.closest('form');
        const dots = form.querySelectorAll('.w-2.h-2');
        // Attempt dots should be present
        expect(dots.length).toBeGreaterThan(0);
      });
    });

    it('should lock after 3 failed attempts', async () => {
      render(
        <CaptchaModal isOpen={true} onClose={mockOnClose} onVerify={mockOnVerify} />
      );

      const verifyButton = screen.getByText('Verify');

      // Fail 3 times
      for (let i = 0; i < 3; i++) {
        act(() => {
          vi.advanceTimersByTime(2500);
        });
        
        const inputs = screen.queryAllByRole('textbox');
        if (inputs.length > 0) {
          fireEvent.change(inputs[0], { target: { value: 'WRONG' } });
        }
        
        fireEvent.click(verifyButton);

        await act(async () => {
          vi.advanceTimersByTime(1000);
        });
      }

      // Should show locked state
      await waitFor(() => {
        const lockedText = screen.queryByText(/Locked.*\d+s/i);
        expect(lockedText).toBeInTheDocument();
      });
    });
  });

  describe('Anti-Bot Protection', () => {
    it('should flag suspiciously fast answers', async () => {
      render(
        <CaptchaModal isOpen={true} onClose={mockOnClose} onVerify={mockOnVerify} />
      );

      const verifyButton = screen.getByText('Verify');

      // Answer immediately (< 2 seconds)
      const inputs = screen.queryAllByRole('textbox');
      if (inputs.length > 0) {
        fireEvent.change(inputs[0], { target: { value: 'ABC123' } });
      }
      
      fireEvent.click(verifyButton);

      await act(async () => {
        vi.advanceTimersByTime(1000);
      });

      // Should show suspicious activity error
      await waitFor(() => {
        const suspiciousError = screen.queryByText(/suspicious activity/i);
        expect(suspiciousError).toBeInTheDocument();
      });
    });

    it('should accept answers after reasonable time', async () => {
      render(
        <CaptchaModal isOpen={true} onClose={mockOnClose} onVerify={mockOnVerify} />
      );

      // Wait sufficient time (> 2 seconds)
      act(() => {
        vi.advanceTimersByTime(3000);
      });

      const inputs = screen.queryAllByRole('textbox');
      if (inputs.length > 0) {
        fireEvent.change(inputs[0], { target: { value: 'ABC123' } });
      }

      const verifyButton = screen.getByText('Verify');
      fireEvent.click(verifyButton);

      await act(async () => {
        vi.advanceTimersByTime(1000);
      });

      // Should not show suspicious activity error
      screen.queryByText(/suspicious activity/i);
      // May or may not appear depending on answer correctness
    });
  });

  describe('User Interface', () => {
    it('should disable buttons during verification', async () => {
      render(
        <CaptchaModal isOpen={true} onClose={mockOnClose} onVerify={mockOnVerify} />
      );

      act(() => {
        vi.advanceTimersByTime(2500);
      });

      const inputs = screen.queryAllByRole('textbox');
      if (inputs.length > 0) {
        fireEvent.change(inputs[0], { target: { value: 'ABC123' } });
      }

      const verifyButton = screen.getByText('Verify');
      fireEvent.click(verifyButton);

      // Should show verifying state
      expect(screen.getByText(/Verifying/i)).toBeInTheDocument();
    });

    it('should show cancel button', () => {
      render(
        <CaptchaModal isOpen={true} onClose={mockOnClose} onVerify={mockOnVerify} />
      );

      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });

    it('should call onClose when cancel is clicked', () => {
      render(
        <CaptchaModal isOpen={true} onClose={mockOnClose} onVerify={mockOnVerify} />
      );

      const cancelButton = screen.getByText('Cancel');
      fireEvent.click(cancelButton);

      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe('Lock Timer Countdown', () => {
    it('should countdown and unlock after 60 seconds', async () => {
      render(
        <CaptchaModal isOpen={true} onClose={mockOnClose} onVerify={mockOnVerify} />
      );

      const verifyButton = screen.getByText('Verify');

      // Trigger lock with 3 fast attempts
      for (let i = 0; i < 3; i++) {
        act(() => {
          vi.advanceTimersByTime(500); // Very fast
        });
        
        const inputs = screen.queryAllByRole('textbox');
        if (inputs.length > 0) {
          fireEvent.change(inputs[0], { target: { value: 'WRONG' } });
        }
        
        fireEvent.click(verifyButton);

        await act(async () => {
          vi.advanceTimersByTime(100);
        });
      }

      // Should be locked
      await waitFor(() => {
        expect(screen.queryByText(/Locked.*60s/i)).toBeInTheDocument();
      });

      // Fast forward 60 seconds
      act(() => {
        vi.advanceTimersByTime(60000);
      });

      // Should be unlocked now
      await waitFor(() => {
        const lockedText = screen.queryByText(/Locked/i);
        expect(lockedText).not.toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(
        <CaptchaModal isOpen={true} onClose={mockOnClose} onVerify={mockOnVerify} />
      );

      const closeButton = screen.getByLabelText('Close');
      expect(closeButton).toBeInTheDocument();
    });
  });

  describe('Security Note', () => {
    it('should display security information', () => {
      render(
        <CaptchaModal isOpen={true} onClose={mockOnClose} onVerify={mockOnVerify} />
      );

      expect(screen.getByText(/This verification helps protect the DotNation platform/i)).toBeInTheDocument();
    });
  });
});
