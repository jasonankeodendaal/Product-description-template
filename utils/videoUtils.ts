export const generateVideoThumbnail = (videoBlob: Blob, seekTime: number = 1): Promise<string> => {
    return new Promise((resolve, reject) => {
        const video = document.createElement('video');
        video.preload = 'metadata';
        const url = URL.createObjectURL(videoBlob);
        video.src = url;

        video.onloadedmetadata = () => {
            // Ensure seekTime is not greater than the video's duration
            video.currentTime = Math.min(seekTime, video.duration);
        };

        video.onseeked = () => {
            const canvas = document.createElement('canvas');
            // Create a reasonably sized thumbnail
            const aspectRatio = video.videoWidth / video.videoHeight;
            canvas.width = 200;
            canvas.height = 200 / aspectRatio;
            
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                URL.revokeObjectURL(url);
                return reject(new Error('Could not get canvas context.'));
            }
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            URL.revokeObjectURL(url);
            video.removeAttribute('src'); // Clean up video element
            resolve(canvas.toDataURL('image/jpeg', 0.8));
        };

        video.onerror = (e) => {
            URL.revokeObjectURL(url);
            video.removeAttribute('src');
            reject(new Error('Failed to load video for thumbnail generation.'));
        };

        // Timeout to prevent hanging if metadata never loads
        const timeout = setTimeout(() => {
            video.onerror = null; // Prevent late error firing
             URL.revokeObjectURL(url);
             video.removeAttribute('src');
            reject(new Error('Video metadata loading timed out.'));
        }, 5000);

        video.onloadedmetadata = () => {
            clearTimeout(timeout);
            video.currentTime = Math.min(seekTime, video.duration);
        };
    });
};
