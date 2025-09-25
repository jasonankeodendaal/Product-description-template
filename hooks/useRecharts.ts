import { useState, useEffect } from 'react';

export interface RechartsStatus {
    lib: any | null;
    error: boolean;
    loading: boolean;
}

// Custom hook to safely access the Recharts library loaded from a CDN.
export const useRecharts = () => {
    const [recharts, setRecharts] = useState<RechartsStatus>({
        lib: (window as any).Recharts || null,
        error: false,
        loading: !(window as any).Recharts,
    });

    useEffect(() => {
        // If library is already loaded or there was an error, do nothing.
        if (recharts.lib || recharts.error) return;

        let timeoutId: number;

        const checkRecharts = () => {
            if ((window as any).Recharts) {
                setRecharts({ lib: (window as any).Recharts, error: false, loading: false });
                clearInterval(intervalId);
                clearTimeout(timeoutId);
            }
        };

        const intervalId = setInterval(checkRecharts, 100);

        // Set a timeout to show an error if it takes too long to load.
        timeoutId = window.setTimeout(() => {
            if (!(window as any).Recharts) {
                console.error("Recharts library failed to load after 10 seconds.");
                setRecharts({ lib: null, error: true, loading: false });
                clearInterval(intervalId);
            }
        }, 10000); // 10-second timeout

        // Cleanup function to clear timers when the component unmounts.
        return () => {
            clearInterval(intervalId);
            clearTimeout(timeoutId);
        };
    }, [recharts.lib, recharts.error]);

    return recharts;
};
