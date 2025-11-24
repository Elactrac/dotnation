import { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

/**
 * ThemeRouter - Automatically switches themes based on route patterns
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

        // Apply appropriate theme
        if (shouldUseLightTheme && theme !== 'light') {
            setLightTheme();
        } else if (!shouldUseLightTheme && theme !== 'dark') {
            setDarkTheme();
        }
    }, [location.pathname, theme, setDarkTheme, setLightTheme]);

    return <>{children}</>;
};

export default ThemeRouter;

ThemeRouter.propTypes = {
    children: PropTypes.node.isRequired
};
