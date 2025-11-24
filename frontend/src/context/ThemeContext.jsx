import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider');
    }
    return context;
};

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState('dark'); // 'dark' or 'light'

    useEffect(() => {
        // Apply theme to document root
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    };

    const setDarkTheme = () => setTheme('dark');
    const setLightTheme = () => setTheme('light');

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, setDarkTheme, setLightTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};
