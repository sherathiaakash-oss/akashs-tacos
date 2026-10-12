import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css';
// Dynamically set backend API URL based on development or production environment
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

// 1. Locate the absolute DOM hook gateway container from index.html
const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error("❌ Critical Architecture Error: The root canvas DOM element with id 'root' was not found in your index.html file.");
} else {
  // 2. Instantiate the dynamic React virtual DOM node tree layer
  const root = createRoot(rootElement);

  // 3. Render the core application layout matrix path into the screen viewport canvas
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
