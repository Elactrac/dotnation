import { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import ReCAPTCHA from 'react-google-recaptcha';
import { verifyRecaptcha } from '../utils/captchaApi';

/**
 * Google reCAPTCHA v2 Modal
 */
const CaptchaModal = ({ isOpen, onClose, onVerify }) => {
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const recaptchaRef = useRef(null);

  // Handle reCAPTCHA change
  const handleRecaptchaChange = async (token) => {
    if (!token) return;

    setIsVerifying(true);
    setError('');

    try {
      // Verify with backend
      const result = await verifyRecaptcha(token);

      if (result.success) {
        console.log('[CaptchaModal] Verification successful');
        onVerify(true, token); // Pass the token as proof
        onClose();
      } else {
        setError('Verification failed. Please try again.');
        recaptchaRef.current.reset();
      }
    } catch (error) {
      console.error('[CaptchaModal] Verification error:', error);
      setError('Verification failed. Please check your connection.');
      recaptchaRef.current.reset();
    } finally {
      setIsVerifying(false);
    }
  };

  // Handle modal close
  const handleClose = () => {
    setError('');
    setIsVerifying(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl border border-primary/30 shadow-2xl shadow-primary/20 max-w-md w-full p-8 animate-scale-in">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 text-white/60 hover:text-white transition-colors"
          aria-label="Close"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-primary/30 rounded-full blur-xl"></div>
              <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-white mb-2 font-display">
            Security Check
          </h2>
          <p className="text-white/60 text-sm">
            Please verify you are human to continue
          </p>
        </div>

        {/* reCAPTCHA */}
        <div className="flex justify-center mb-6">
          <div className="bg-white p-1 rounded-lg">
            <ReCAPTCHA
              ref={recaptchaRef}
              sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY || '6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI'} // Default test key
              onChange={handleRecaptchaChange}
              theme="light"
            />
          </div>
        </div>

        {/* Loading State */}
        {isVerifying && (
          <div className="text-center mb-4">
            <div className="inline-flex items-center gap-2 text-primary">
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="text-sm font-medium">Verifying...</span>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 flex items-center gap-2 animate-shake mb-4">
            <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Cancel Button */}
        <button
          onClick={handleClose}
          className="w-full px-6 py-3 rounded-lg border border-white/10 text-white/60 hover:bg-white/5 hover:text-white transition-all font-medium"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

CaptchaModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onVerify: PropTypes.func.isRequired,
};

export default CaptchaModal;
