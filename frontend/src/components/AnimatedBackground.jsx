/**
 * Renders an animated background with a pulsing radial gradient effect.
 * This component is used to add atmospheric depth to pages.
 * @returns {JSX.Element} The animated background component.
 */
const AnimatedBackground = () => {
  return (
    <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[200%] pointer-events-none -z-10">
      <div 
        className="absolute inset-0 animate-pulse-slow"
        style={{
          background: 'radial-gradient(circle at center, rgba(56, 116, 255, 0.1) 0%, transparent 30%)',
          animation: 'pulse-bg 7s cubic-bezier(0.4, 0, 0.6, 1) infinite'
        }}
      />
      <style>{`
        @keyframes pulse-bg {
          0%, 100% {
            transform: scale(1);
            opacity: 0.1;
          }
          50% {
            transform: scale(1.5);
            opacity: 0.05;
          }
        }
      `}</style>
    </div>
  );
};

export default AnimatedBackground;