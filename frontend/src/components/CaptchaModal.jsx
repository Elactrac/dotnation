import { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import ImageCaptcha from './captcha/ImageCaptcha';
import SliderCaptcha from './captcha/SliderCaptcha';
import PatternCaptcha from './captcha/PatternCaptcha';

/**
 * Advanced Multi-Type Captcha Modal with Progressive Difficulty
 * Supports 4 types: Math, Image Selection, Slider Puzzle, Pattern Memory
 */
const CaptchaModal = ({ isOpen, onClose, onVerify }) => {
  const [captchaType, setCaptchaType] = useState('math'); // math, image, slider, pattern
  const [captchaQuestion, setCaptchaQuestion] = useState({ num1: 0, num2: 0, answer: 0 });
  const [userAnswer, setUserAnswer] = useState('');
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [failureCount, setFailureCount] = useState(0);

  // Captcha type configuration
  const captchaTypes = {
    math: { label: 'Math Challenge', icon: '🔢', difficulty: 1 },
    image: { label: 'Image Selection', icon: '🖼️', difficulty: 2 },
    slider: { label: 'Puzzle Slider', icon: '🧩', difficulty: 3 },
    pattern: { label: 'Pattern Memory', icon: '🧠', difficulty: 4 }
  };

  // Generate a math captcha
  const generateMathCaptcha = useCallback(() => {
    const operations = ['+', '-', '*'];
    const operation = failureCount < 2 ? '+' : operations[Math.floor(Math.random() * operations.length)];
    
    let num1, num2, answer;
    
    if (operation === '+') {
      num1 = Math.floor(Math.random() * 10) + 1;
      num2 = Math.floor(Math.random() * 10) + 1;
      answer = num1 + num2;
    } else if (operation === '-') {
      num1 = Math.floor(Math.random() * 15) + 6;
      num2 = Math.floor(Math.random() * (num1 - 1)) + 1;
      answer = num1 - num2;
    } else {
      num1 = Math.floor(Math.random() * 10) + 1;
      num2 = Math.floor(Math.random() * 10) + 1;
      answer = num1 * num2;
    }
    
    setCaptchaQuestion({ num1, num2, operation, answer });
    setUserAnswer('');
    setError('');
  }, [failureCount]);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setCaptchaType('math');
      setFailureCount(0);
      generateMathCaptcha();
    }
  }, [isOpen, generateMathCaptcha]);

  // Progressive difficulty: escalate on failures
  useEffect(() => {
    if (failureCount >= 3 && captchaType === 'math') {
      // After 3 math failures, switch to image captcha
      setCaptchaType('image');
    } else if (failureCount >= 5 && captchaType === 'image') {
      // After 5 total failures, switch to slider
      setCaptchaType('slider');
    } else if (failureCount >= 7 && captchaType === 'slider') {
      // After 7 total failures, switch to pattern (hardest)
      setCaptchaType('pattern');
    }
  }, [failureCount, captchaType]);

  // Handle math captcha submission
  const handleMathSubmit = async (e) => {
    e.preventDefault();
    setIsVerifying(true);
    setError('');

    // Simulate verification delay
    await new Promise(resolve => setTimeout(resolve, 500));

    if (parseInt(userAnswer) === captchaQuestion.answer) {
      // Success!
      onVerify(true);
      onClose();
    } else {
      // Failure
      setError('Incorrect answer. Please try again.');
      setFailureCount(prev => prev + 1);
      generateMathCaptcha();
      setIsVerifying(false);
    }
  };

  // Handle verification from other captcha types
  const handleOtherCaptchaVerify = (success) => {
    if (success) {
      onVerify(true);
      onClose();
    }
  };

  // Handle captcha cancellation
  const handleCaptchaCancel = () => {
    handleClose();
  };

  // Handle modal close
  const handleClose = () => {
    setUserAnswer('');
    setError('');
    setIsVerifying(false);
    onClose();
  };

  // Handle manual captcha type change
  const changeCaptchaType = (newType) => {
    setCaptchaType(newType);
    setError('');
    if (newType === 'math') {
      generateMathCaptcha();
    }
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
      <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl border border-primary/30 shadow-2xl shadow-primary/20 max-w-2xl w-full p-8 animate-scale-in max-h-[90vh] overflow-y-auto">
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
          {/* Icon */}
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

          {/* Title */}
          <h2 className="text-2xl font-bold text-white mb-2 font-display">
            Verify You&apos;re Human
          </h2>
          <p className="text-white/60 text-sm">
            Complete the challenge to continue
          </p>

          {/* Failure warning */}
          {failureCount >= 2 && (
            <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-yellow-500/10 border border-yellow-500/30 rounded-full">
              <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span className="text-yellow-400 text-xs font-medium">
                {failureCount} failed attempts
              </span>
            </div>
          )}
        </div>

        {/* Captcha Type Selector */}
        <div className="mb-6">
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {Object.entries(captchaTypes).map(([type, config]) => (
              <button
                key={type}
                type="button"
                onClick={() => changeCaptchaType(type)}
                disabled={isVerifying}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all whitespace-nowrap
                  ${captchaType === type
                    ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg shadow-primary/30'
                    : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white/80'
                  }
                  disabled:opacity-50 disabled:cursor-not-allowed
                `}
              >
                <span className="text-lg">{config.icon}</span>
                <span>{config.label}</span>
                {captchaType === type && (
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Captcha Content */}
        <div className="mb-6">
          {captchaType === 'math' && (
            <form onSubmit={handleMathSubmit} className="space-y-6">
              {/* Math Question */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
                <div className="text-center">
                  <p className="text-white/70 text-sm mb-4">What is the answer?</p>
                  <div className="flex items-center justify-center gap-4 mb-4">
                    <span className="text-4xl font-bold text-primary font-display">{captchaQuestion.num1}</span>
                    <span className="text-3xl text-white/50">{captchaQuestion.operation || '+'}</span>
                    <span className="text-4xl font-bold text-secondary font-display">{captchaQuestion.num2}</span>
                    <span className="text-3xl text-white/50">=</span>
                    <span className="text-4xl text-white/30">?</span>
                  </div>
                  
                  {/* Answer Input */}
                  <input
                    type="number"
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    className="w-full max-w-[120px] mx-auto bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white text-center text-xl font-bold focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                    placeholder="?"
                    autoFocus
                    disabled={isVerifying}
                    required
                  />
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 flex items-center gap-2 animate-shake">
                  <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 px-6 py-3 rounded-lg border-2 border-white/20 text-white font-semibold hover:bg-white/10 transition-all"
                  disabled={isVerifying}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 rounded-lg bg-gradient-to-r from-primary to-secondary text-white font-semibold hover:shadow-lg hover:shadow-primary/30 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  disabled={isVerifying || !userAnswer}
                >
                  {isVerifying ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Verifying...
                    </span>
                  ) : (
                    'Verify'
                  )}
                </button>
              </div>
            </form>
          )}

          {captchaType === 'image' && (
            <ImageCaptcha 
              onVerify={handleOtherCaptchaVerify}
              onCancel={handleCaptchaCancel}
            />
          )}

          {captchaType === 'slider' && (
            <SliderCaptcha 
              onVerify={handleOtherCaptchaVerify}
              onCancel={handleCaptchaCancel}
            />
          )}

          {captchaType === 'pattern' && (
            <PatternCaptcha 
              onVerify={handleOtherCaptchaVerify}
              onCancel={handleCaptchaCancel}
            />
          )}
        </div>

        {/* Security Note */}
        <div className="pt-6 border-t border-white/10">
          <div className="flex items-start gap-2">
            <svg className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <p className="text-white/50 text-xs leading-relaxed">
              This advanced verification system helps protect the DotNation platform from automated bots and ensures a secure experience for all users. The difficulty adjusts based on your performance.
            </p>
          </div>
        </div>
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
