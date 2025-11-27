import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

/**
 * Shared Footer component for consistent footer across the app
 * @param {Object} props
 * @param {string} props.variant - 'dashboard' | 'landing' | 'minimal' - styling variant
 * @param {boolean} props.showLogo - whether to show the logo section
 */
const Footer = ({ variant = 'dashboard', showLogo = false }) => {
  const currentYear = new Date().getFullYear();

  // Social links - update these with actual project URLs
  const socialLinks = {
    twitter: 'https://twitter.com/dotnation_io',
    github: 'https://github.com/Elactrac/dotnation',
    discord: 'https://discord.gg/dotnation',
  };

  // Navigation links
  const navLinks = [
    { to: '/terms', label: 'Terms of Service' },
    { to: '/privacy', label: 'Privacy Policy' },
    { to: '/about', label: 'About' },
    { to: '/contact', label: 'Contact Us' },
  ];

  // Twitter/X icon
  const TwitterIcon = () => (
    <svg fill="currentColor" height="24" viewBox="0 0 256 256" width="24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M247.39,68.94A8,8,0,0,0,240,64H209.57A48.66,48.66,0,0,0,168.1,40a46.91,46.91,0,0,0-33.75,13.7A47.9,47.9,0,0,0,120,88v6.09C79.74,83.47,46.81,50.72,46.46,50.37a8,8,0,0,0-13.65,4.92c-4.31,47.79,9.57,79.77,22,98.18a110.93,110.93,0,0,0,21.88,24.2c-15.23,17.53-39.21,26.74-39.47,26.84a8,8,0,0,0-3.85,11.93c.75,1.12,3.75,5.05,11.08,8.72C53.51,229.7,65.48,232,80,232c70.67,0,129.72-54.42,135.75-124.44l29.91-29.9A8,8,0,0,0,247.39,68.94Zm-45,29.41a8,8,0,0,0-2.32,5.14C196,166.58,143.28,216,80,216c-10.56,0-18-1.4-23.22-3.08,11.51-6.25,27.56-17,37.88-32.48A8,8,0,0,0,92,169.08c-.47-.27-43.91-26.34-44-96,16,13,45.25,33.17,78.67,38.79A8,8,0,0,0,136,104V88a32,32,0,0,1,9.6-22.92A30.94,30.94,0,0,1,167.9,56c12.66.16,24.49,7.88,29.44,19.21A8,8,0,0,0,204.67,80h16Z" />
    </svg>
  );

  // GitHub icon
  const GitHubIcon = () => (
    <svg fill="currentColor" height="24" viewBox="0 0 256 256" width="24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M208.31,75.68A59.78,59.78,0,0,0,202.93,28,8,8,0,0,0,196,24a59.75,59.75,0,0,0-48,24H124A59.75,59.75,0,0,0,76,24a8,8,0,0,0-6.93,4,59.78,59.78,0,0,0-5.38,47.68A58.14,58.14,0,0,0,56,104v8a56.06,56.06,0,0,0,48.44,55.47A39.8,39.8,0,0,0,96,192v8H72a24,24,0,0,1-24-24A40,40,0,0,0,8,136a8,8,0,0,0,0,16,24,24,0,0,1,24,24,40,40,0,0,0,40,40H96v16a8,8,0,0,0,16,0V192a24,24,0,0,1,48,0v40a8,8,0,0,0,16,0V192a39.8,39.8,0,0,0-8.44-24.53A56.06,56.06,0,0,0,216,112v-8A58.14,58.14,0,0,0,208.31,75.68ZM200,112a40,40,0,0,1-40,40H112a40,40,0,0,1-40-40v-8a41.74,41.74,0,0,1,6.9-22.48A8,8,0,0,0,80,73.83a43.81,43.81,0,0,1,.79-33.58,43.88,43.88,0,0,1,32.32,20.06A8,8,0,0,0,119.82,64h32.35a8,8,0,0,0,6.74-3.69,43.87,43.87,0,0,1,32.32-20.06A43.81,43.81,0,0,1,192,73.83a8.09,8.09,0,0,0,1,7.65A41.72,41.72,0,0,1,200,104Z" />
    </svg>
  );

  // Discord icon
  const DiscordIcon = () => (
    <svg fill="currentColor" height="24" viewBox="0 0 256 256" width="24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M104,140a12,12,0,1,1-12-12A12,12,0,0,1,104,140Zm60-12a12,12,0,1,0,12,12A12,12,0,0,0,164,128Zm74.45,64.9-67,29.71a16.17,16.17,0,0,1-21.71-9.1l-8.11-22q-6.72.45-13.63.46t-13.63-.46l-8.11,22a16.18,16.18,0,0,1-21.71,9.1l-67-29.71a15.93,15.93,0,0,1-9.06-18.51L38,58A16.07,16.07,0,0,1,51,46.14l36.06-5.93a16.22,16.22,0,0,1,18.26,11.88l.57,1.91h44.22l.57-1.91a16.22,16.22,0,0,1,18.26-11.88L205,46.14A16.07,16.07,0,0,1,218,58l29.53,116.38A15.93,15.93,0,0,1,238.45,192.9ZM232,178.28,202.47,62l-36.06-5.92L160,79.19a8,8,0,0,1-7.88,6.81H103.88A8,8,0,0,1,96,79.19l-6.41-23.1L53.53,62,24,178.28,91,207.68l6.77-18.32A8,8,0,0,1,105.55,186c14.57,2.93,29.74,2.91,44.34,0a8,8,0,0,1,7.73,3.36L164.42,208Z" />
    </svg>
  );

  // Minimal footer (for landing pages)
  if (variant === 'minimal') {
    return (
      <footer className="border-t border-white/5 bg-[#050505] py-12" role="contentinfo">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white text-black rounded flex items-center justify-center font-serif font-bold">P</div>
            <span className="font-serif text-xl text-white">Paperweight</span>
          </div>
          <div className="flex gap-8 text-sm text-white/50">
            <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Twitter</a>
            <a href={socialLinks.discord} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Discord</a>
            <Link to="/about" className="hover:text-white transition-colors">About</Link>
          </div>
          <div className="text-white/30 text-sm">
            &copy; {currentYear} Paperweight. On-chain.
          </div>
        </div>
      </footer>
    );
  }

  // Landing variant
  if (variant === 'landing') {
    return (
      <footer className="border-t border-[var(--glass-border)] bg-[var(--bg-color)] py-12" role="contentinfo">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white text-black rounded-md flex items-center justify-center font-serif font-bold">P</div>
            <span className="text-white font-serif text-xl">Paperweight</span>
          </div>
          <div className="flex gap-8 text-sm text-[var(--secondary-text)]">
            <Link to="/about" className="hover:text-white transition-colors">About</Link>
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link to="/contact" className="hover:text-white transition-colors">Contact</Link>
          </div>
          <div className="text-[var(--secondary-text)] text-sm">
            &copy; {currentYear} Paperweight. All rights reserved.
          </div>
        </div>
      </footer>
    );
  }

  // Dashboard variant (default)
  return (
    <footer className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-auto pt-8" role="contentinfo">
      <div className="py-6 border-t border-white/10">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          {showLogo && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white text-black rounded flex items-center justify-center font-serif font-bold">P</div>
              <span className="font-serif text-xl text-white">Paperweight</span>
            </div>
          )}
          
          <nav className="flex items-center gap-6" aria-label="Footer navigation">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-white/60 hover:text-white transition-colors text-sm"
                aria-label={link.label}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex gap-4" role="group" aria-label="Social media links">
            <a
              href={socialLinks.twitter}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/60 hover:text-white transition-colors"
              aria-label="Follow us on Twitter"
            >
              <TwitterIcon />
            </a>
            <a
              href={socialLinks.github}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/60 hover:text-white transition-colors"
              aria-label="View source code on GitHub"
            >
              <GitHubIcon />
            </a>
            <a
              href={socialLinks.discord}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/60 hover:text-white transition-colors"
              aria-label="Join our Discord server"
            >
              <DiscordIcon />
            </a>
          </div>

          <p className="text-white/60 text-sm">&copy; {currentYear} DotNation. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

Footer.propTypes = {
  variant: PropTypes.oneOf(['dashboard', 'landing', 'minimal']),
  showLogo: PropTypes.bool,
};

export default Footer;
