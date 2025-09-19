// FIX: Changed parameter type from File to Blob, as the function only uses properties available on Blob.
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