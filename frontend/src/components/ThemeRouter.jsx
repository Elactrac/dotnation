import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

/**
 * ThemeRouter - Automatically switches themes based on route patterns with circular reveal animation
 * 
 * Dark Theme Routes (Crowdfunding):
 * - /campaigns, /campaign/:id, /create-campaign
 * - /dashboard, /my-campaigns, /my-donations, /my-nfts
 * - /browse, /leaderboard, /batch-create, /batch-withdraw
 * - /admin/matching-pool
 * 
 * Light Theme Routes (Creator Economy):
 * - /members, /members/*
 * - /creator/*
 * 
 * Default: Dark theme for all other routes
 */
const ThemeRouter = ({ children }) => {
    const location = useLocation();
    const { setDarkTheme, setLightTheme, theme } = useTheme();
    const [isAnimating, setIsAnimating] = useState(false);
    const [targetTheme, setTargetTheme] = useState(null);

    useEffect(() => {
        const path = location.pathname;

        // Define light theme routes (Creator Economy)
        const lightThemeRoutes = [
            '/members',
            '/creator'
        ];

        // Check if current path should use light theme
        const shouldUseLightTheme = lightThemeRoutes.some(route => 
            path.startsWith(route)
        );

        // Apply appropriate theme with animation
        if (shouldUseLightTheme && theme !== 'light') {
            setTargetTheme('light');
            setIsAnimating(true);
            
            // Delay theme change until circle is large enough to cover most of screen (60% through animation)
            setTimeout(() => {
                setLightTheme();
            }, 960);
            
            // End animation
            setTimeout(() => {
                setIsAnimating(false);
                setTargetTheme(null);
            }, 1600);
        } else if (!shouldUseLightTheme && theme !== 'dark') {
            setTargetTheme('dark');
            setIsAnimating(true);
            
            // Delay theme change until circle is large enough to cover most of screen
            setTimeout(() => {
                setDarkTheme();
            }, 960);
            
            setTimeout(() => {
                setIsAnimating(false);
                setTargetTheme(null);
            }, 1600);
        }
    }, [location.pathname, theme, setDarkTheme, setLightTheme]);

    return (
        <>
            {isAnimating && (
                <div 
                    className="theme-transition-overlay"
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100vw',
                        height: '100vh',
                        background: targetTheme === 'light' ? '#FFFFFF' : '#0a0a0a',
                        zIndex: 9999,
                        pointerEvents: 'none',
                        clipPath: 'circle(0% at 50% 10%)',
                        animation: 'circularReveal 1.6s cubic-bezier(0.65, 0, 0.35, 1) forwards'
                    }}
                />
            )}
            <div style={{
                opacity: isAnimating ? 0 : 1,
                transition: 'opacity 0.4s ease-in-out'
            }}>
                {children}
            </div>
        </>
    );
};

export default ThemeRouter;

ThemeRouter.propTypes = {
    children: PropTypes.node.isRequired
};
