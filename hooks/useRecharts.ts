import { useState, useEffect } from 'react';

// Custom hook to safely access the Recharts library loaded from a CDN.
// This prevents race conditions where a component might try to render a chart
// before the Recharts script has fully loaded and initialized.
export const useRecharts = () => {
  // Initialize state with the Recharts object if it's already available on the window.
  const [recharts, setRecharts] = useState((window as any).Recharts);

  useEffect(() => {
    // If Recharts is already loaded, we don't need to do anything.
    if (recharts) return;

    // If not loaded, set up an interval to check for its availability.
    // This is a robust way to handle scripts loaded asynchronously.
    const checkRecharts = () => {
      if ((window as any).Recharts) {
        setRecharts((window as any).Recharts);
        // Once found, clear the interval to stop checking.
        clearInterval(intervalId);
      }
    };

    const intervalId = setInterval(checkRecharts, 100); // Check every 100ms.

    // Cleanup function to clear the interval when the component unmounts.
    return () => clearInterval(intervalId);
  }, [recharts]); // The effect depends on the `recharts` state.

  return recharts;
};
