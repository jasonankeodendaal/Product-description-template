import { Recording } from '../App';

const DB_NAME = 'RecordingAppDB';
const DB_VERSION = 1;
const RECORDING_STORE = 'recordings';
const HANDLE_STORE = 'handles';

const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(RECORDING_STORE)) {
        db.createObjectStore(RECORDING_STORE, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(HANDLE_STORE)) {
        db.createObjectStore(HANDLE_STORE);
      }
    };

    request.onsuccess = (event) => {
      resolve((event.target as IDBOpenDBRequest).result);
    };

    request.onerror = (event) => {
      reject((event.target as IDBOpenDBRequest).error);
    };
  });
};

export const db = {
  async saveRecording(recording: Recording): Promise<void> {
    const db = await openDB();
    const tx = db.transaction(RECORDING_STORE, 'readwrite');
    const store = tx.objectStore(RECORDING_STORE);
    store.put(recording);
    return new Promise((resolve) => {
      tx.oncomplete = () => resolve();
    });
  },

  async getAllRecordings(): Promise<Recording[]> {
    const db = await openDB();
    const tx = db.transaction(RECORDING_STORE, 'readonly');
    const store = tx.objectStore(RECORDING_STORE);
    const request = store.getAll();
    return new Promise((resolve) => {
      request.onsuccess = () => resolve(request.result);
    });
  },

  async deleteRecording(id: string): Promise<void> {
    const db = await openDB();
    const tx = db.transaction(RECORDING_STORE, 'readwrite');
    const store = tx.objectStore(RECORDING_STORE);
    store.delete(id);
     return new Promise((resolve) => {
      tx.oncomplete = () => resolve();
    });
  },

  async clearAllRecordings(): Promise<void> {
    const db = await openDB();
    const tx = db.transaction(RECORDING_STORE, 'readwrite');
    const store = tx.objectStore(RECORDING_STORE);
    store.clear();
     return new Promise((resolve) => {
      tx.oncomplete = () => resolve();
    });
  },

  async setDirectoryHandle(handle: FileSystemDirectoryHandle): Promise<void> {
    const db = await openDB();
    const tx = db.transaction(HANDLE_STORE, 'readwrite');
    const store = tx.objectStore(HANDLE_STORE);
    store.put(handle, 'directoryHandle');
    return new Promise((resolve) => {
      tx.oncomplete = () => resolve();
    });
  },

  async getDirectoryHandle(): Promise<FileSystemDirectoryHandle | null> {
    const db = await openDB();
    const tx = db.transaction(HANDLE_STORE, 'readonly');
    const store = tx.objectStore(HANDLE_STORE);
    const request = store.get('directoryHandle');
    return new Promise((resolve) => {
      request.onsuccess = () => resolve(request.result || null);
    });
  },
  
  async clearDirectoryHandle(): Promise<void> {
      const db = await openDB();
      const tx = db.transaction(HANDLE_STORE, 'readwrite');
      const store = tx.objectStore(HANDLE_STORE);
      store.delete('directoryHandle');
  }
};