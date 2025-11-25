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
        primary: "#FFFFFF", // White
        secondary: "#A3A3A3", // Neutral Gray
        surface: "#111111", // Dark Surface
        border: "rgba(255, 255, 255, 0.1)", // Glass Border
        "background-light": "#F5F5F7",
        "background-dark": "#050505", // Paperweight Black
        text: {
          primary: "#F5F5F7",
          secondary: "rgba(245, 245, 247, 0.6)",
          muted: "rgba(245, 245, 247, 0.4)",
        },
        success: "#A7F3D0",
        warning: "#FDE68A",
        error: "#FECACA",
        info: "#FFFFFF",
      },
      boxShadow: {
        soft: "0 2px 8px rgba(0, 0, 0, 0.2)",
        medium: "0 4px 16px rgba(0, 0, 0, 0.3)",
        hard: "0 8px 32px rgba(0, 0, 0, 0.4)",
        glow: "0 0 20px rgba(255, 255, 255, 0.1)",
        "glow-secondary": "0 0 20px rgba(255, 255, 255, 0.05)",
      },
      fontFamily: {
        display: ["Baskervville", "serif"],
        body: ["Inter", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "0.5rem",
        lg: "0.75rem",
        xl: "1rem",
        full: "9999px",
      },
      animation: {
        'pulse-slow': 'pulse 7s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'subtle-float': 'subtle-float 6s ease-in-out infinite',
        'spin-slow': 'spin 3s linear infinite',
        'fade-in': 'fade-in 0.5s ease-out',
        'slide-up': 'slide-up 0.5s ease-out',
        'scale-in': 'scale-in 0.3s ease-out',
        'float-slow': 'float 8s ease-in-out infinite',
        'float-slower': 'float 12s ease-in-out infinite',
      },
      keyframes: {
        pulse: {
          '0%, 100%': { transform: 'scale(1)', opacity: '0.1' },
          '50%': { transform: 'scale(1.5)', opacity: '0.05' },
        },
        'subtle-float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'scale-in': {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0) translateX(0) rotate(0deg)' },
          '25%': { transform: 'translateY(-20px) translateX(10px) rotate(2deg)' },
          '50%': { transform: 'translateY(-40px) translateX(0) rotate(-2deg)' },
          '75%': { transform: 'translateY(-20px) translateX(-10px) rotate(1deg)' },
        },
      },
    },
  },
  plugins: [],
}

