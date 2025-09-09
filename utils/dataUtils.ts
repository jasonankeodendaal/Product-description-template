
import { Template, Recording, Photo, Note } from '../App';
import { SiteSettings } from '../constants';

export const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result.split(',')[1]);
      } else {
        reject(new Error('Failed to convert blob to base64 string.'));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

export const base64ToBlob = (base64: string, mimeType: string): Blob => {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
};

export const dataURLtoBlob = (dataurl: string): Blob => {
    const arr = dataurl.split(',');
    const mimeMatch = arr[0].match(/:(.*?);/);
    if (!mimeMatch) throw new Error('Invalid data URL format');
    
    const mime = mimeMatch[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while(n--) u8arr[n] = bstr.charCodeAt(n);
    return new Blob([u8arr], {type:mime});
}


export const createBackup = async (
    siteSettings: SiteSettings,
    templates: Template[],
    recordings: Recording[],
    photos: Photo[],
    notes: Note[]
): Promise<void> => {
    const recordingsForBackup = await Promise.all(
        recordings.map(async (rec) => {
            const audioBase64 = await blobToBase64(rec.audioBlob);
            const { audioBlob, isTranscribing, ...rest } = rec;
            return { ...rest, audioBase64, audioMimeType: rec.audioBlob.type };
        })
    );

    const photosForBackup = await Promise.all(
        photos.map(async (photo) => {
            const imageBase64 = await blobToBase64(photo.imageBlob);
            const { imageBlob, ...rest } = photo;
            return { ...rest, imageBase64 };
        })
    );
    
    const backupData = {
        siteSettings,
        templates,
        recordings: recordingsForBackup,
        photos: photosForBackup,
        notes
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `ai-tools-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
};
