import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { ToastProvider } from './context/ToastContext';
import { Toaster } from 'react-hot-toast'; 

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ToastProvider>
      <App />
      <Toaster position="top-right" reverseOrder={false} /> 
    </ToastProvider>
  </React.StrictMode>
);
