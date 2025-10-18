import React from 'react';
import ReactDOM from 'react-dom/client';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import App from './App.jsx';
import './index.css';

const theme = extendTheme({
  colors: {
    brand: {
      900: '#0A0B1A', // dark background
      800: '#171930', // card background
      700: '#E6007A', // primary accent
      600: '#00EAD3', // secondary accent
    },
  },
  styles: {
    global: {
      body: {
        bg: 'brand.900',
        color: 'white',
      },
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <App />
    </ChakraProvider>
  </React.StrictMode>,
);
