import { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { verifyCaptcha, generateCaptchaChallenge } from '../../utils/captchaApi';

/**
 * Slider Puzzle Captcha Component
 * User must drag slider to align puzzle piece with gap in image
 */
const SliderCaptcha = ({ sessionToken, onVerify, onCancel }) => {
  const [sliderPosition, setSliderPosition] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');
  const [targetPosition, setTargetPosition] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const sliderRef = useRef(null);
  const containerRef = useRef(null);

  // Fetch challenge from backend on mount
  useEffect(() => {
    const fetchChallenge = async () => {
      if (!sessionToken) return;

      try {
        const challenge = await generateCaptchaChallenge(sessionToken, 'slider');
        setTargetPosition(challenge.targetPosition);
        setStartTime(Date.now());
      } catch (error) {
        console.error('[SliderCaptcha] Failed to fetch challenge:', error);
        setError('Failed to load challenge. Please try again.');
      }
    };

    fetchChallenge();
  }, [sessionToken]);

  // Handle mouse/touch down
  const handleStart = (e) => {
    e.preventDefault();
    setIsDragging(true);
    setError('');
  };

  // Handle mouse/touch move
  useEffect(() => {
    const handleMove = (e) => {
      if (!isDragging || !containerRef.current) return;

      const container = containerRef.current;
      const rect = container.getBoundingClientRect();
      
      let clientX;
      if (e.type === 'touchmove') {
        clientX = e.touches[0].clientX;
      } else {
        clientX = e.clientX;
      }

      const x = clientX - rect.left;
      const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
      
      setSliderPosition(percentage);
    };

    const handleEnd = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMove);
      document.addEventListener('mouseup', handleEnd);
      document.addEventListener('touchmove', handleMove);
      document.addEventListener('touchend', handleEnd);

      return () => {
        document.removeEventListener('mousemove', handleMove);
        document.removeEventListener('mouseup', handleEnd);
        document.removeEventListener('touchmove', handleMove);
        document.removeEventListener('touchend', handleEnd);
      };
    }
  }, [isDragging]);

  // Handle verification
  const handleVerify = async () => {
    if (!sessionToken) {
      setError('Session not initialized. Please try again.');
      return;
    }

    setIsVerifying(true);
    setError('');

    try {
      // Calculate time taken
      const timeTaken = (Date.now() - startTime) / 1000;

      // Verify with backend (tolerance of 5%)
      const result = await verifyCaptcha({
        sessionToken,
        captchaType: 'slider',
        userAnswer: sliderPosition,
        timeTaken,
        options: { tolerance: 5 }
      });

      if (result.verified) {
        // Success! Animate completion
        setSliderPosition(targetPosition);
        await new Promise(resolve => setTimeout(resolve, 300));
        onVerify(true, result);
      } else {
        setError(result.error || 'Position incorrect. Please try again.');
        setIsVerifying(false);
        // Reset slider after delay
        setTimeout(() => {
          setSliderPosition(0);
          setError('');
          setStartTime(Date.now());
        }, 1500);
        onVerify(false);
      }
    } catch (error) {
      console.error('[SliderCaptcha] Verification error:', error);
      setError('Verification failed. Please try again.');
      setIsVerifying(false);
      onVerify(false);
    }
  };

  const handleReset = async () => {
    setSliderPosition(0);
    setError('');
    
    // Fetch new challenge from backend
    if (sessionToken) {
      try {
        const challenge = await generateCaptchaChallenge(sessionToken, 'slider');
        setTargetPosition(challenge.targetPosition);
        setStartTime(Date.now());
      } catch (error) {
        console.error('[SliderCaptcha] Failed to fetch new challenge:', error);
        setError('Failed to load new challenge. Please try again.');
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Instructions */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
        <div className="flex items-center gap-3">
          <div className="text-4xl">🧩</div>
          <div>
            <p className="text-white font-semibold">Complete the puzzle</p>
            <p className="text-sm text-white/60">Drag the slider to align the puzzle piece</p>
          </div>
        </div>
      </div>

      {/* Puzzle Container */}
      <div 
        ref={containerRef}
        className="relative w-full h-48 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl overflow-hidden border-2 border-white/10"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-20">
          <svg width="100%" height="100%">
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <rect width="20" height="20" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-primary"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        {/* Decorative Image Elements */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-8xl opacity-30">🌆</div>
        </div>

        {/* Gap indicator at target position */}
        <div 
          className="absolute top-0 bottom-0 w-16 bg-red-500/20 border-x-2 border-red-500/50 transition-all duration-300"
          style={{ left: `${targetPosition}%` }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-3xl opacity-50">⬜</div>
          </div>
        </div>

        {/* Sliding puzzle piece */}
        <div 
          className="absolute top-0 bottom-0 w-16 bg-primary/30 border-2 border-primary flex items-center justify-center transition-all duration-150"
          style={{ 
            left: `${sliderPosition}%`,
            boxShadow: isDragging ? '0 0 20px rgba(56, 116, 255, 0.6)' : '0 0 10px rgba(56, 116, 255, 0.3)'
          }}
        >
          <div className="text-3xl">🧩</div>
        </div>

        {/* Success overlay */}
        {isVerifying && Math.abs(sliderPosition - targetPosition) <= 5 && (
          <div className="absolute inset-0 bg-green-500/20 backdrop-blur-sm flex items-center justify-center animate-fade-in">
            <div className="text-6xl animate-scale-in">✓</div>
          </div>
        )}
      </div>

      {/* Slider Track */}
      <div className="relative">
        <div className="h-12 bg-white/5 rounded-full border-2 border-white/10 relative overflow-hidden">
          {/* Progress fill */}
          <div 
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary/30 to-secondary/30 transition-all duration-150"
            style={{ width: `${sliderPosition}%` }}
          />

          {/* Slider handle */}
          <div
            ref={sliderRef}
            className={`
              absolute top-1/2 -translate-y-1/2 w-12 h-12 -ml-6 bg-gradient-to-br from-primary to-secondary 
              rounded-full shadow-lg cursor-grab active:cursor-grabbing flex items-center justify-center
              transition-shadow duration-200
              ${isDragging ? 'scale-110 shadow-2xl shadow-primary/50' : 'hover:scale-105'}
            `}
            style={{ left: `${sliderPosition}%` }}
            onMouseDown={handleStart}
            onTouchStart={handleStart}
            role="slider"
            aria-valuemin="0"
            aria-valuemax="100"
            aria-valuenow={Math.round(sliderPosition)}
            aria-label="Puzzle slider"
            tabIndex={0}
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>

        {/* Position indicator */}
        <div className="mt-2 text-center text-sm text-white/50">
          Position: {Math.round(sliderPosition)}%
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

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-6 py-3 rounded-lg border-2 border-white/20 text-white font-semibold hover:bg-white/10 transition-all"
          disabled={isVerifying}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleReset}
          className="px-6 py-3 rounded-lg border-2 border-white/20 text-white font-semibold hover:bg-white/10 transition-all"
          disabled={isVerifying}
          title="Reset puzzle"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
        <button
          type="button"
          onClick={handleVerify}
          className="flex-1 px-6 py-3 rounded-lg bg-gradient-to-r from-primary to-secondary text-white font-semibold hover:shadow-lg hover:shadow-primary/30 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          disabled={isVerifying || sliderPosition < 10}
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
    </div>
  );
};

SliderCaptcha.propTypes = {
  sessionToken: PropTypes.string,
  onVerify: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default SliderCaptcha;
