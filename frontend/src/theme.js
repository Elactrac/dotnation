
import { extendTheme } from '@chakra-ui/react';

// 1. Extend the theme to include custom colors, fonts, etc
const theme = extendTheme({
  styles: {
    global: {
      'html, body': {
        backgroundColor: '#0A0B1A', // --bg-color
        color: '#F0F2F5', // --primary-text
        fontFamily: "'Inter', sans-serif",
        lineHeight: '1.6',
      },
    },
  },
  colors: {
    brand: {
      primary: '#3874ff', // --primary-accent (New Blue)
      secondary: '#00EAD3', // --secondary-accent
      background: '#0A0B1A', // --bg-color
      card: 'rgba(23, 25, 48, 0.7)', // --card-bg
      border: 'rgba(255, 255, 255, 0.1)', // --border-color
      textPrimary: '#F0F2F5', // --primary-text
      textSecondary: '#A0AEC0', // --secondary-text
    },
    status: {
        success: '#38A169', // --success-color
        warning: '#D69E2E', // --warning-color
        failed: '#C53030',
    }
  },
  fonts: {
    heading: "'Poppins', sans-serif",
    body: "'Inter', sans-serif",
  },
  components: {
    Button: {
        variants: {
            'primary': {
                bg: 'brand.primary',
                color: 'white',
                _hover: {
                    transform: 'translateY(-2px)',
                    boxShadow: '0 10px 20px rgba(56, 116, 255, 0.2)',
                }
            }
        }
    }
  }
});

export default theme;
