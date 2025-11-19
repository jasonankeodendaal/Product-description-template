import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css'; // Assuming index.css exists from your provided CSS file content

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(registration => {
      console.log('ServiceWorker registration successful with scope: ', registration.scope);
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('New content is available and will be used when all tabs for this scope are closed.');
            }
          });
        }
      });
    }).catch(error => {
      console.log('ServiceWorker registration failed: ', error);
    });

    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('New Service Worker activated. Ready for reload.');
      window.dispatchEvent(new CustomEvent('sw-updated'));
    });
  });
}

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