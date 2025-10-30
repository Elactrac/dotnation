import { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { generateCaptchaChallenge, verifyCaptcha } from '../../utils/captchaApi';

/**
 * Image Selection Captcha Component
 * User must select all images matching a specific category
 * SECURE: Challenge generated server-side, correct indices never exposed
 */
const ImageCaptcha = ({ sessionToken, onVerify, onCancel }) => {
  const [selectedImages, setSelectedImages] = useState([]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');
  const [challenge, setChallenge] = useState(null);
  const [startTime, setStartTime] = useState(null);

  // Generate a new challenge from backend
  const generateChallenge = useCallback(async () => {
    if (!sessionToken) {
      console.warn('[ImageCaptcha] No session token available');
      return;
    }

    try {
      const challengeData = await generateCaptchaChallenge({
        sessionToken,
        captchaType: 'image'
      });
      
      setChallenge(challengeData.challenge);
      setSelectedImages([]);
      setError('');
      setStartTime(Date.now());
      
      console.log('[ImageCaptcha] Challenge generated:', challengeData.challenge.category);
    } catch (error) {
      console.error('[ImageCaptcha] Failed to generate challenge:', error);
      setError('Failed to load captcha. Please try again.');
    }
  }, [sessionToken]);

  useEffect(() => {
    generateChallenge();
  }, [generateChallenge]);

  // Toggle image selection
  const toggleImage = (index) => {
    if (isVerifying) return;
    
    setSelectedImages(prev => {
      if (prev.includes(index)) {
        return prev.filter(i => i !== index);
      }
      return [...prev, index];
    });
    setError('');
  };

  // Verify selection
  const handleVerify = async () => {
    if (selectedImages.length === 0) {
      setError('Please select at least one image');
      return;
    }

    if (!sessionToken) {
      setError('Session not initialized. Please try again.');
      return;
    }

    setIsVerifying(true);
    setError('');

    try {
      // Calculate time taken
      const timeTaken = (Date.now() - startTime) / 1000;

      // Verify with backend - SECURE: only send user's selection
      const result = await verifyCaptcha({
        sessionToken,
        captchaType: 'image',
        userAnswer: selectedImages,
        timeTaken
      });

      if (result.verified) {
        onVerify(true, result);
      } else {
        setError(result.error || 'Incorrect selection. Please try again.');
        setIsVerifying(false);
        // Regenerate challenge after failed attempt
        setTimeout(generateChallenge, 1500);
        onVerify(false);
      }
    } catch (error) {
      console.error('[ImageCaptcha] Verification error:', error);
      setError('Verification failed. Please try again.');
      setIsVerifying(false);
      onVerify(false);
    }
  };

  if (!challenge) return null;

  return (
    <div className="space-y-4">
      {/* Instructions */}
      <div className="bg-gray-800/50 rounded-lg p-4 border border-white/10">
        <p className="text-white text-center font-medium">
          Select all images with <span className="text-primary font-bold">{challenge.category}</span>
        </p>
      </div>

      {/* Image Grid */}
      <div className="grid grid-cols-3 gap-2">
        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((index) => (
          <button
            key={index}
            type="button"
            onClick={() => toggleImage(index)}
            disabled={isVerifying}
            className={`
              relative aspect-square rounded-lg overflow-hidden transition-all duration-200
              ${selectedImages.includes(index)
                ? 'ring-4 ring-primary shadow-lg shadow-primary/50 scale-95'
                : 'ring-2 ring-white/20 hover:ring-white/40'
              }
              ${isVerifying ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer hover:scale-105'}
            `}
            aria-label={`Image ${index + 1}${selectedImages.includes(index) ? ' selected' : ''}`}
          >
            {/* Placeholder pattern for image */}
            <div 
              className={`
                w-full h-full flex items-center justify-center text-6xl
                ${getImageContent(index)}
              `}
            >
              {getImageEmoji(index, challenge.category)}
            </div>

            {/* Selection indicator */}
            {selectedImages.includes(index) && (
              <div className="absolute inset-0 bg-primary/20 backdrop-blur-[2px] flex items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center animate-scale-in">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
            )}
          </button>
        ))}
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
          onClick={handleVerify}
          className="flex-1 px-6 py-3 rounded-lg bg-gradient-to-r from-primary to-secondary text-white font-semibold hover:shadow-lg hover:shadow-primary/30 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          disabled={isVerifying || selectedImages.length === 0}
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

      {/* Hint */}
      <div className="text-center">
        <button
          type="button"
          onClick={generateChallenge}
          className="text-sm text-white/50 hover:text-white/70 transition-colors"
          disabled={isVerifying}
        >
          Can&apos;t see the images? Get a new challenge
        </button>
      </div>
    </div>
  );
};

// Helper function to get background color for images
const getImageContent = (index) => {
  const backgrounds = [
    'bg-gradient-to-br from-blue-500/20 to-blue-600/30',
    'bg-gradient-to-br from-green-500/20 to-green-600/30',
    'bg-gradient-to-br from-purple-500/20 to-purple-600/30',
    'bg-gradient-to-br from-yellow-500/20 to-yellow-600/30',
    'bg-gradient-to-br from-red-500/20 to-red-600/30',
    'bg-gradient-to-br from-pink-500/20 to-pink-600/30',
    'bg-gradient-to-br from-indigo-500/20 to-indigo-600/30',
    'bg-gradient-to-br from-teal-500/20 to-teal-600/30',
    'bg-gradient-to-br from-orange-500/20 to-orange-600/30',
  ];
  return backgrounds[index];
};

// Helper function to get emoji for each image based on category
const getImageEmoji = (index, category) => {
  const emojiMap = {
    traffic_lights: ['🚦', '🏢', '🌳', '🚦', '🚗', '🏠', '🚦', '🌲', '🏬'],
    crosswalks: ['🏢', '🚶', '🌳', '🚗', '🚶', '🏠', '🌲', '🚶', '🏬'],
    buses: ['🏢', '🚗', '🚌', '🌳', '🚗', '🚌', '🏠', '🌲', '🚌'],
    bicycles: ['🚲', '🚗', '🚲', '🌳', '🏢', '🚲', '🏠', '🚲', '🌲']
  };
  return emojiMap[category]?.[index] || '❓';
};

ImageCaptcha.propTypes = {
  sessionToken: PropTypes.string,
  onVerify: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default ImageCaptcha;
