import { Box } from '@chakra-ui/react';
import { keyframes } from '@emotion/react';

/**
 * Keyframes for the pulsing background animation.
 */
const pulseAnimation = keyframes`
  0%, 100% {
    transform: scale(1);
    opacity: 0.1;
  }
  50% {
    transform: scale(1.5);
    opacity: 0.05;
  }
`;

/**
 * Renders an animated background with a pulsing radial gradient effect.
 * This component is used to add atmospheric depth to pages.
 * @returns {JSX.Element} The animated background component.
 */
const AnimatedBackground = () => {
  return (
    <Box
      position="fixed"
      top="50%"
      left="50%"
      transform="translate(-50%, -50%)"
      width="200%"
      height="200%"
      pointerEvents="none"
      zIndex={-1}
    >
      <Box
        position="absolute"
        inset="0"
        bgGradient="radial(circle at center, rgba(238, 43, 140, 0.1) 0%, transparent 30%)"
        animation={`${pulseAnimation} 7s cubic-bezier(0.4, 0, 0.6, 1) infinite`}
      />
    </Box>
  );
};

export default AnimatedBackground;
