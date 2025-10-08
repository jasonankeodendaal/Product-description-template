import type { Photo } from "../types";

export const resizeImage = (file: Blob, maxSize: number = 1024): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      return reject(new Error('File is not an image.'));
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject('Could not get canvas context.');

        let { width, height } = img;
        if (width > height) {
          if (width > maxSize) {
            height = Math.round((height * maxSize) / width);
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = Math.round((width * maxSize) / height);
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        // Return as JPEG to save space, with a quality of 90%
        resolve(canvas.toDataURL('image/jpeg', 0.9));
      };
      img.onerror = () => reject('Could not load image file.');
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject('Failed to read file.');
    reader.readAsDataURL(file);
  });
};

/**
 * Creates a high-quality, squared version of an image blob.
 * This function uses a multi-step, step-down resampling algorithm for superior
 * downscaling quality, preserving sharpness and detail.
 * @param sourceBlob The original image file as a Blob.
 * @param size The target width and height of the square canvas.
 * @param quality The JPEG quality of the output image (0.0 to 1.0).
 * @returns A Promise that resolves with the new squared image as a JPEG Blob.
 */
export const squareImageAndGetBlob = (
  sourceBlob: Blob,
  size: number,
  quality: number = 1.0
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(sourceBlob);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      // Determine final placement dimensions
      const ratio = img.naturalWidth / img.naturalHeight;
      const destWidth = Math.round(ratio > 1 ? size : size * ratio);
      const destHeight = Math.round(ratio > 1 ? size / ratio : size);

      // Create a temporary canvas to hold the original image
      let currentCanvas = document.createElement('canvas');
      let currentCtx = currentCanvas.getContext('2d');
      if (!currentCtx) return reject(new Error('Could not get canvas context.'));

      currentCanvas.width = img.naturalWidth;
      currentCanvas.height = img.naturalHeight;
      currentCtx.drawImage(img, 0, 0);

      // Resample in steps for high quality downscaling
      while (currentCanvas.width > destWidth * 2 && currentCanvas.width > 500) {
        const newWidth = Math.max(destWidth, currentCanvas.width / 2);
        const newHeight = Math.max(destHeight, currentCanvas.height / 2);

        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = newWidth;
        tempCanvas.height = newHeight;

        const tempCtx = tempCanvas.getContext('2d');
        if (!tempCtx) return reject(new Error('Could not get temp canvas context.'));
        tempCtx.drawImage(currentCanvas, 0, 0, newWidth, newHeight);

        // Replace old canvas with the new downscaled one
        currentCanvas = tempCanvas;
      }

      // Now draw to final square canvas
      const finalCanvas = document.createElement('canvas');
      finalCanvas.width = size;
      finalCanvas.height = size;

      const finalCtx = finalCanvas.getContext('2d');
      if (!finalCtx) return reject(new Error('Could not get final canvas context.'));

      // Center image in square canvas
      finalCtx.fillStyle = '#fff';
      finalCtx.fillRect(0, 0, size, size);

      const offsetX = (size - currentCanvas.width) / 2;
      const offsetY = (size - currentCanvas.height) / 2;
      finalCtx.drawImage(currentCanvas, offsetX, offsetY, currentCanvas.width, currentCanvas.height);

      // Export to JPEG Blob
      finalCanvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Failed to create blob.'));
        },
        'image/jpeg',
        quality
      );
    };

    img.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error('Image load failed.'));
    }
    img.src = objectUrl;
  });
};