import { useEffect } from 'react';
import PropTypes from 'prop-types';
import { Box } from '@chakra-ui/react';

/**
 * MouseFollower Component
 * Creates a glowing effect that follows the user's mouse cursor
 * Adds visual polish and interactivity to pages
 */
const MouseFollower = ({ size = '96px', color = 'pink.500', blur = '3xl', opacity = 0.2 }) => {
  useEffect(() => {
    const handleMouseMove = (e) => {
      const follower = document.getElementById('mouse-follower');
      if (follower) {
        follower.style.left = `${e.clientX}px`;
        follower.style.top = `${e.clientY}px`;
      }
    };

    document.addEventListener('mousemove', handleMouseMove);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <Box
      id="mouse-follower"
      position="fixed"
      top="0"
      left="0"
      width={size}
      height={size}
      bg={color}
      opacity={opacity}
      borderRadius="full"
      pointerEvents="none"
      filter={`blur(${blur})`}
      transform="translate(-50%, -50%)"
      zIndex={0}
      transition="opacity 0.3s ease"
    />
  );
};

export default MouseFollower;

MouseFollower.propTypes = {
  size: PropTypes.string,
  color: PropTypes.string,
  blur: PropTypes.string,
  opacity: PropTypes.number,
};
