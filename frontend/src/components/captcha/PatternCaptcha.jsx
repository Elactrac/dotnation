import { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { verifyCaptcha, generateCaptchaChallenge } from '../../utils/captchaApi';

/**
 * Pattern Memory Captcha Component
 * User must remember and repeat a sequence of highlighted tiles
 */
const PatternCaptcha = ({ sessionToken, onVerify, onCancel }) => {
  const [pattern, setPattern] = useState([]);
  const [userPattern, setUserPattern] = useState([]);
  const [isShowing, setIsShowing] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState(-1);
  const [difficulty, setDifficulty] = useState(3); // Start with 3 steps
  const [gameState, setGameState] = useState('ready'); // ready, showing, playing, success, failure
  const [startTime, setStartTime] = useState(null);

  // Generate pattern by fetching from backend
  const generatePattern = useCallback(async () => {
    if (!sessionToken) return;

    try {
      const challenge = await generateCaptchaChallenge(sessionToken, 'pattern', { difficulty });
      setPattern(challenge.pattern);
      setUserPattern([]);
      setCurrentStep(-1);
      setError('');
      setGameState('ready');
    } catch (error) {
      console.error('[PatternCaptcha] Failed to fetch challenge:', error);
      setError('Failed to load pattern. Please try again.');
    }
  }, [sessionToken, difficulty]);

  useEffect(() => {
    generatePattern();
  }, [generatePattern]);

  // Show pattern animation
  const showPattern = async () => {
    setGameState('showing');
    setIsShowing(true);
    setError('');
    setStartTime(Date.now()); // Start tracking time when pattern is shown

    // Show each step with delay
    for (let i = 0; i < pattern.length; i++) {
      setCurrentStep(i);
      await new Promise(resolve => setTimeout(resolve, 600));
      setCurrentStep(-1);
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    setIsShowing(false);
    setGameState('playing');
    setCurrentStep(-1);
  };

  // Handle tile click
  const handleTileClick = (index) => {
    if (isShowing || isVerifying || gameState !== 'playing') return;

    const newUserPattern = [...userPattern, index];
    setUserPattern(newUserPattern);

    // Check if current selection is correct
    const currentIndex = newUserPattern.length - 1;
    if (pattern[currentIndex] !== index) {
      // Wrong tile!
      setError('Incorrect pattern! Try again.');
      setGameState('failure');
      setTimeout(() => {
        generatePattern();
      }, 1500);
      return;
    }

    // Check if pattern is complete
    if (newUserPattern.length === pattern.length) {
      // Success!
      handleSuccess();
    }
  };

  // Handle successful pattern completion
  const handleSuccess = async () => {
    if (!sessionToken) {
      setError('Session not initialized. Please try again.');
      return;
    }

    setGameState('success');
    setIsVerifying(true);

    try {
      // Calculate time taken
      const timeTaken = (Date.now() - startTime) / 1000;

      // Verify with backend
      const result = await verifyCaptcha({
        sessionToken,
        captchaType: 'pattern',
        userAnswer: userPattern,
        timeTaken
      });

      if (result.verified) {
        await new Promise(resolve => setTimeout(resolve, 800));
        onVerify(true, result);
      } else {
        setError(result.error || 'Verification failed. Please try again.');
        setGameState('failure');
        setIsVerifying(false);
        onVerify(false);
      }
    } catch (error) {
      console.error('[PatternCaptcha] Verification error:', error);
      setError('Verification failed. Please try again.');
      setGameState('failure');
      setIsVerifying(false);
      onVerify(false);
    }
  };

  // Increase difficulty
  const increaseDifficulty = () => {
    setDifficulty(Math.min(6, difficulty + 1));
  };

  // Decrease difficulty
  const decreaseDifficulty = () => {
    setDifficulty(Math.max(3, difficulty - 1));
  };

  return (
    <div className="space-y-4">
      {/* Instructions */}
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-4xl">🧠</div>
            <div>
              <p className="text-white font-semibold">Remember the pattern</p>
              <p className="text-sm text-white/60">
                {gameState === 'ready' && 'Click "Show Pattern" to begin'}
                {gameState === 'showing' && 'Watch carefully...'}
                {gameState === 'playing' && 'Now repeat the pattern!'}
                {gameState === 'success' && '✓ Perfect!'}
                {gameState === 'failure' && '✗ Try again'}
              </p>
            </div>
          </div>

          {/* Difficulty selector */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={decreaseDifficulty}
              disabled={difficulty <= 3 || gameState !== 'ready'}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              title="Decrease difficulty"
            >
              <span className="text-white">−</span>
            </button>
            <div className="px-3 py-1 bg-primary/20 border border-primary/30 rounded-full">
              <span className="text-primary font-bold text-sm">{difficulty} steps</span>
            </div>
            <button
              type="button"
              onClick={increaseDifficulty}
              disabled={difficulty >= 6 || gameState !== 'ready'}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              title="Increase difficulty"
            >
              <span className="text-white">+</span>
            </button>
          </div>
        </div>
      </div>

      {/* Pattern Grid */}
      <div className="grid grid-cols-3 gap-3 p-4 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl border-2 border-white/10">
        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((index) => {
          const isCurrentStep = currentStep >= 0 && pattern[currentStep] === index;
          const isInUserPattern = userPattern.includes(index);
          const userStepIndex = userPattern.indexOf(index);
          
          return (
            <button
              key={index}
              type="button"
              onClick={() => handleTileClick(index)}
              disabled={isShowing || isVerifying || gameState !== 'playing'}
              className={`
                aspect-square rounded-xl transition-all duration-200 relative overflow-hidden
                ${isCurrentStep 
                  ? 'bg-gradient-to-br from-primary to-secondary shadow-2xl shadow-primary/50 scale-95' 
                  : 'bg-white/5 hover:bg-white/10'
                }
                ${gameState === 'playing' ? 'cursor-pointer hover:scale-105' : 'cursor-default'}
                ${gameState === 'success' && pattern.includes(index) ? 'bg-green-500/30 border-2 border-green-400' : ''}
                ${gameState === 'failure' && userPattern.includes(index) ? 'bg-red-500/30 border-2 border-red-400' : ''}
                disabled:opacity-50
              `}
              aria-label={`Tile ${index + 1}`}
            >
              {/* Glow effect when active */}
              {isCurrentStep && (
                <div className="absolute inset-0 bg-gradient-to-br from-primary to-secondary animate-pulse" />
              )}

              {/* Step number indicator when clicked */}
              {isInUserPattern && gameState === 'playing' && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold text-white/80">{userStepIndex + 1}</span>
                </div>
              )}

              {/* Ripple effect on click */}
              <div className="absolute inset-0 rounded-xl border-2 border-white/20" />
            </button>
          );
        })}
      </div>

      {/* Progress indicator */}
      {gameState === 'playing' && (
        <div className="flex items-center gap-2">
          <span className="text-white/60 text-sm">Progress:</span>
          <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-300"
              style={{ width: `${(userPattern.length / pattern.length) * 100}%` }}
            />
          </div>
          <span className="text-white/60 text-sm font-mono">
            {userPattern.length}/{pattern.length}
          </span>
        </div>
      )}

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
          disabled={isVerifying || isShowing}
        >
          Cancel
        </button>

        {gameState === 'ready' && (
          <button
            type="button"
            onClick={showPattern}
            className="flex-1 px-6 py-3 rounded-lg bg-gradient-to-r from-primary to-secondary text-white font-semibold hover:shadow-lg hover:shadow-primary/30 transition-all transform hover:scale-105"
          >
            Show Pattern
          </button>
        )}

        {(gameState === 'playing' || gameState === 'failure') && (
          <button
            type="button"
            onClick={generatePattern}
            className="flex-1 px-6 py-3 rounded-lg border-2 border-primary/50 text-primary font-semibold hover:bg-primary/10 transition-all"
          >
            New Pattern
          </button>
        )}

        {gameState === 'success' && (
          <button
            type="button"
            disabled
            className="flex-1 px-6 py-3 rounded-lg bg-green-500/20 border-2 border-green-400 text-green-400 font-semibold"
          >
            <span className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              Verified!
            </span>
          </button>
        )}
      </div>

      {/* Hint */}
      <div className="text-center">
        <p className="text-xs text-white/40">
          💡 Tip: Focus on the pattern, not individual tiles
        </p>
      </div>
    </div>
  );
};

PatternCaptcha.propTypes = {
  sessionToken: PropTypes.string,
  onVerify: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default PatternCaptcha;
