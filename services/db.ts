import { Recording, Photo, Note } from '../App';

const DB_NAME = 'AiToolsDB';
const DB_VERSION = 2; // Incremented version for schema change
const RECORDING_STORE = 'recordings';
const PHOTO_STORE = 'photos';
const NOTE_STORE = 'notes';
const HANDLE_STORE = 'handles';

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(RECORDING_STORE)) {
        db.createObjectStore(RECORDING_STORE, { keyPath: 'id' });
      }
       if (!db.objectStoreNames.contains(PHOTO_STORE)) {
        db.createObjectStore(PHOTO_STORE, { keyPath: 'id' });
      }
       if (!db.objectStoreNames.contains(NOTE_STORE)) {
        const noteStore = db.createObjectStore(NOTE_STORE, { keyPath: 'id' });
        noteStore.createIndex('category', 'category', { unique: false });
      }
      if (!db.objectStoreNames.contains(HANDLE_STORE)) {
        db.createObjectStore(HANDLE_STORE);
      }
    };

    request.onsuccess = (event) => resolve((event.target as IDBOpenDBRequest).result);
    request.onerror = (event) => reject((event.target as IDBOpenDBRequest).error);
  });
};

const performDBRequest = <T>(storeName: string, mode: IDBTransactionMode, action: (store: IDBObjectStore) => IDBRequest): Promise<T> => {
    return new Promise(async (resolve, reject) => {
        try {
            const db = await openDB();
            const tx = db.transaction(storeName, mode);
            const store = tx.objectStore(storeName);
            const request = action(store);
            tx.oncomplete = () => resolve(request.result);
            tx.onerror = () => reject(tx.error);
        } catch (error) {
            reject(error);
        }
    });
};

export const db = {
  // Recordings
  saveRecording: (rec: Recording): Promise<void> => performDBRequest(RECORDING_STORE, 'readwrite', store => store.put(rec)),
  getAllRecordings: (): Promise<Recording[]> => performDBRequest(RECORDING_STORE, 'readonly', store => store.getAll()),
  deleteRecording: (id: string): Promise<void> => performDBRequest(RECORDING_STORE, 'readwrite', store => store.delete(id)),
  
  // Photos
  savePhoto: (photo: Photo): Promise<void> => performDBRequest(PHOTO_STORE, 'readwrite', store => store.put(photo)),
  getAllPhotos: (): Promise<Photo[]> => performDBRequest(PHOTO_STORE, 'readonly', store => store.getAll()),
  deletePhoto: (id: string): Promise<void> => performDBRequest(PHOTO_STORE, 'readwrite', store => store.delete(id)),

  // Notes
  saveNote: (note: Note): Promise<void> => performDBRequest(NOTE_STORE, 'readwrite', store => store.put(note)),
  getAllNotes: (): Promise<Note[]> => performDBRequest(NOTE_STORE, 'readonly', store => store.getAll()),
  deleteNote: (id: string): Promise<void> => performDBRequest(NOTE_STORE, 'readwrite', store => store.delete(id)),
  
  // Clear All Data
  async clearAllData(): Promise<void> {
      const db = await openDB();
      const stores = [RECORDING_STORE, PHOTO_STORE, NOTE_STORE];
      const tx = db.transaction(stores, 'readwrite');
      for (const storeName of stores) {
          tx.objectStore(storeName).clear();
      }
      return new Promise(resolve => { tx.oncomplete = () => resolve() });
  },

  // Directory Handle
  setDirectoryHandle: (handle: FileSystemDirectoryHandle): Promise<void> => performDBRequest(HANDLE_STORE, 'readwrite', store => store.put(handle, 'directoryHandle')),
  getDirectoryHandle: (): Promise<FileSystemDirectoryHandle | null> => performDBRequest(HANDLE_STORE, 'readonly', store => store.get('directoryHandle')),
  clearDirectoryHandle: (): Promise<void> => performDBRequest(HANDLE_STORE, 'readwrite', store => store.delete('directoryHandle')),
};
