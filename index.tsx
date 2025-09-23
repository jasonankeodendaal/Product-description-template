import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Declare globals for TypeScript since they are loaded from a CDN
declare var JSZip: any;
declare var WaveSurfer: any;
declare var docx: any;

// Register the Service Worker to enable PWA offline functionality
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(registration => {
      console.log('ServiceWorker registration successful with scope: ', registration.scope);
      
      // Listen for updates to the service worker.
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New update available
              console.log('New content is available and will be used when all tabs for this scope are closed.');
              // We can notify the user here. The `controllerchange` event will fire when the new worker takes over.
            }
          });
        }
      });
    }).catch(error => {
      console.log('ServiceWorker registration failed: ', error);
    });

    // Listen for when the new service worker has taken control.
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      console.log('New Service Worker activated. Ready for reload.');
      // Dispatch a custom event that the React app can listen to.
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