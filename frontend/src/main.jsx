
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import './styles/components.css';
import './styles/light-theme.css';
import { initLogging } from './utils/logger';

// Initialize logging system
initLogging();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
