import { useEffect } from 'react';
import PropTypes from 'prop-types';

/**
 * MouseFollower Component
 * Creates a glowing effect that follows the user's mouse cursor
 * Adds visual polish and interactivity to pages
 */
const MouseFollower = ({ size = 96, opacity = 0.2 }) => {
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
    <div
      id="mouse-follower"
      className="fixed top-0 left-0 pointer-events-none rounded-full bg-primary -translate-x-1/2 -translate-y-1/2 z-0 transition-opacity duration-300"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        opacity: opacity,
        filter: 'blur(80px)',
      }}
    />
  );
};

MouseFollower.propTypes = {
  size: PropTypes.number,
  opacity: PropTypes.number,
};

export default MouseFollower;
