import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

// The service worker registration logic has been moved to a <script> tag in index.html
// to ensure it runs before the browser attempts to fetch this TSX module.

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
