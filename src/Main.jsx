// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/style.css';
import { BrowserRouter } from 'react-router-dom';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      {/* You can wrap App in an ErrorBoundary or HelmetProvider here if needed */}
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
