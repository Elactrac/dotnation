/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Paperweight Design System - Editorial Noir
        primary: "#FFFFFF",
        secondary: "#A1A1AA",
        
        // Background colors
        background: {
          base: "#000000",
          surface: "#080808",
          overlay: "rgba(255, 255, 255, 0.03)",
        },
        // Legacy aliases
        "background-dark": "#000000",
        "background-light": "#F5F5F7",
        surface: "#080808",
        
        // Text colors
        text: {
          primary: "#FFFFFF",
          secondary: "#A1A1AA",
          muted: "#52525B",
          inverse: "#000000",
        },
        
        // Border colors
        border: {
          DEFAULT: "rgba(255, 255, 255, 0.1)",
          subtle: "rgba(255, 255, 255, 0.1)",
          strong: "rgba(255, 255, 255, 0.2)",
        },
        
        // Accent colors
        accent: {
          primary: "#FFFFFF",
          highlight: "rgba(255, 255, 255, 0.1)",
        },
        
        // Status colors
        success: "#22C55E",
        warning: "#F59E0B",
        error: "#EF4444",
        info: "#3B82F6",
      },
      
      boxShadow: {
        // Paperweight shadows
        soft: "0 2px 8px rgba(0, 0, 0, 0.2)",
        medium: "0 4px 16px rgba(0, 0, 0, 0.3)",
        hard: "0 8px 32px rgba(0, 0, 0, 0.4)",
        // Heavy glass shadow
        glass: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
        // Button hover glow
        "btn-hover": "0 4px 12px rgba(255, 255, 255, 0.2)",
        glow: "0 0 20px rgba(255, 255, 255, 0.1)",
      },
      
      fontFamily: {
        // Headings: Elegant, sharp, authoritative
        display: ["Playfair Display", "Times New Roman", "serif"],
        serif: ["Playfair Display", "Times New Roman", "serif"],
        // Body: Geometric, legible, functional
        body: ["Inter", "Geist", "Helvetica Neue", "sans-serif"],
        sans: ["Inter", "Geist", "Helvetica Neue", "sans-serif"],
      },
      
      letterSpacing: {
        tighter: "-0.02em", // For headings
      },
      
      borderRadius: {
        // Sharp corners for buttons
        sharp: "2px",
        DEFAULT: "0.5rem",
        lg: "0.75rem",
        xl: "1rem",
        '2xl': "1.5rem",
        // Cards use 16px
        card: "16px",
        full: "9999px",
      },
      
      backdropBlur: {
        glass: "24px",
      },
      
      transitionTimingFunction: {
        // Heavy, smooth, gravity-based movements
        gravity: "cubic-bezier(0.2, 0.8, 0.2, 1)",
      },
      
      transitionDuration: {
        // Paperweight motion duration
        600: "600ms",
      },
      
      animation: {
        // Gravity-based, no bouncing
        'fade-in': 'fade-in 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)',
        'slide-up': 'slide-up 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)',
        'slide-in-right': 'slide-in-right 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)',
        'scale-in': 'scale-in 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)',
        'pulse-slow': 'pulse 7s cubic-bezier(0.2, 0.8, 0.2, 1) infinite',
        'float-slow': 'float 8s cubic-bezier(0.2, 0.8, 0.2, 1) infinite',
        'float-slower': 'float 12s cubic-bezier(0.2, 0.8, 0.2, 1) infinite',
        'spin-slow': 'spin 3s linear infinite',
      },
      
      keyframes: {
        pulse: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.1' },
          '50%': { transform: 'scale(1.5)', opacity: '0.05' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-in-right': {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        'scale-in': {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
      },
      
      maxWidth: {
        container: "1440px",
      },
    },
  },
  plugins: [
    // Custom plugin for Paperweight utilities
    function({ addUtilities, addComponents }) {
      addUtilities({
        '.scrollbar-hide': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
          '&::-webkit-scrollbar': {
            display: 'none',
          },
        },
        // Glassmorphism 2.0
        '.glass': {
          'background': 'rgba(255, 255, 255, 0.02)',
          'backdrop-filter': 'blur(24px)',
          '-webkit-backdrop-filter': 'blur(24px)',
          'border': '1px solid rgba(255, 255, 255, 0.08)',
          'box-shadow': '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        },
        '.glass-subtle': {
          'background': 'rgba(255, 255, 255, 0.03)',
          'backdrop-filter': 'blur(16px)',
          '-webkit-backdrop-filter': 'blur(16px)',
          'border': '1px solid rgba(255, 255, 255, 0.05)',
        },
      });
      
      addComponents({
        // Primary button - Paperweight style
        '.btn-primary': {
          'background': '#FFFFFF',
          'color': '#000000',
          'font-family': 'Inter, sans-serif',
          'font-weight': '600',
          'border-radius': '2px',
          'transition': 'all 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)',
          '&:hover': {
            'transform': 'translateY(-1px)',
            'box-shadow': '0 4px 12px rgba(255, 255, 255, 0.2)',
          },
        },
        // Secondary button - Paperweight style
        '.btn-secondary': {
          'background': 'transparent',
          'color': '#FFFFFF',
          'border': '1px solid rgba(255, 255, 255, 0.2)',
          'font-family': 'Inter, sans-serif',
          'font-weight': '500',
          'border-radius': '2px',
          'transition': 'all 0.6s cubic-bezier(0.2, 0.8, 0.2, 1)',
          '&:hover': {
            'border-color': '#FFFFFF',
          },
        },
        // Heavy glass card
        '.card-glass': {
          'background': 'linear-gradient(180deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)',
          'border-radius': '16px',
          'border': '1px solid rgba(255, 255, 255, 0.05)',
          'backdrop-filter': 'blur(24px)',
          '-webkit-backdrop-filter': 'blur(24px)',
          'box-shadow': '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        },
      });
    },
  ],
}
