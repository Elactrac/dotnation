import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import VersionBanner from '../components/VersionBanner';
import Footer from '../components/Footer';
import NavBar from '../components/NavBar';

const NewDashboardLayout = () => {
  useEffect(() => {
    // Mouse follower effect
    const handleMouseMove = (e) => {
      const follower = document.getElementById('mouse-follower');
      if (follower) {
        follower.style.left = `${e.clientX}px`;
        follower.style.top = `${e.clientY}px`;
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="relative min-h-screen w-full flex flex-col overflow-x-hidden bg-background-dark font-body text-white/90">
      {/* Skip to Main Content Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-[1000] focus:top-4 focus:left-4 focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:rounded-lg focus:font-medium focus:outline-none focus:ring-2 focus:ring-white"
      >
        Skip to main content
      </a>

      {/* Mouse Follower */}
      <div
        id="mouse-follower"
        className="fixed top-0 left-0 w-24 h-24 bg-primary/20 rounded-full pointer-events-none blur-3xl z-0 -translate-x-1/2 -translate-y-1/2"
        aria-hidden="true"
      />

      {/* Background Gradient - Subtle White Glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03)_0%,transparent_50%)] animate-pulse-slow" />
      </div>

      {/* Main Layout Container */}
      <div className="relative flex flex-col min-h-screen z-10">
        {/* Header */}
        <NavBar variant="dashboard" />

        {/* Version Banner */}
        <VersionBanner />

        {/* Main Content */}
        <main id="main-content" className="flex-1 flex flex-col items-center pb-16" tabIndex="-1">
          <Outlet />
        </main>

        {/* Footer */}
        <Footer variant="dashboard" />
      </div>
    </div>
  );
};

export default NewDashboardLayout;
