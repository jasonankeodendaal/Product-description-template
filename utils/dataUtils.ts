import { Template, Recording } from '../App';

/**
 * Converts a Blob object to a Base64 encoded string.
 */
export const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        // result is "data:audio/webm;base64,..." - we only want the part after the comma
        resolve(reader.result.split(',')[1]);
      } else {
        reject(new Error('Failed to convert blob to base64 string.'));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

/**
 * Converts a Base64 string to a Blob object.
 */
export const base64ToBlob = (base64: string, mimeType: string): Blob => {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
};

/**
 * Converts a data URL string (e.g., from canvas.toDataURL) to a Blob object.
 */
export const dataURLtoBlob = (dataurl: string): Blob => {
    const arr = dataurl.split(',');
    const mimeMatch = arr[0].match(/:(.*?);/);
    if (!mimeMatch) {
        throw new Error('Invalid data URL format');
    }
    const mime = mimeMatch[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while(n--){
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], {type:mime});
}


/**
 * Creates and triggers a download for a JSON backup file of all application data.
 */
export const createBackup = async (
    templates: Template[],
    recordings: Recording[]
): Promise<void> => {
    // Prepare recordings by converting audio blobs to base64
    const recordingsForBackup = await Promise.all(
        recordings.map(async (rec) => {
            const audioBase64 = await blobToBase64(rec.audioBlob);
            // Omit client-side state and the blob itself
            const { audioBlob, isTranscribing, ...rest } = rec;
            return {
                ...rest,
                audioBase64,
                audioMimeType: rec.audioBlob.type,
            };
        })
    );
    
    const backupData = {
        templates,
        recordings: recordingsForBackup
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `ai-product-gen-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
};