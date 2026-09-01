/**
 * ClassMate Practicum - Storage Manager (LocalStorage + IndexedDB for High-Res Photos)
 */

const STORAGE_KEY = 'classmate_practicum_data_v2';
const DB_NAME = 'ClassMateImageDB';
const DB_VERSION = 1;
const STORE_NAME = 'uploaded_images';

class StorageManager {
  constructor() {
    this.db = null;
    this.initDB();
  }

  // Initialize IndexedDB
  initDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (e) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      };

      request.onsuccess = (e) => {
        this.db = e.target.result;
        resolve(this.db);
      };

      request.onerror = (e) => {
        console.error('IndexedDB Error:', e.target.error);
        resolve(null);
      };
    });
  }

  // Auto convert Google Drive share links to direct embed URLs
  cleanGoogleDriveUrl(url) {
    if (!url || typeof url !== 'string') return url;
    const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || url.match(/id=([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      return `https://lh3.googleusercontent.com/d/${match[1]}`;
    }
    return url;
  }

  getCurrentStorageKey() {
    const urlParams = new URLSearchParams(window.location.search);
    const urlId = urlParams.get('id') || urlParams.get('user');
    if (urlId) return `classmate_data_${urlId}`;

    if (window.appAuth && window.appAuth.getCurrentUser()) {
      return `classmate_data_${window.appAuth.getCurrentUser().studentId}`;
    }
    return STORAGE_KEY;
  }

  // Get full app state (Per-user or default)
  getData() {
    try {
      const key = this.getCurrentStorageKey();
      const json = localStorage.getItem(key);
      if (!json) {
        this.saveData(DEFAULT_PRACTICUM_DATA);
        return JSON.parse(JSON.stringify(DEFAULT_PRACTICUM_DATA));
      }
      return JSON.parse(json);
    } catch (e) {
      console.error('Failed to read data from LocalStorage', e);
      return JSON.parse(JSON.stringify(DEFAULT_PRACTICUM_DATA));
    }
  }

  // Save app state (Per-user or default) & Auto Sync to Cloud
  saveData(data) {
    try {
      const key = this.getCurrentStorageKey();
      localStorage.setItem(key, JSON.stringify(data));

      // Auto Real-Time Sync to Google Drive Cloud
      const studentId = (data.student && data.student.studentId) || (window.appAuth && window.appAuth.getCurrentUser() && window.appAuth.getCurrentUser().studentId);
      if (studentId && window.appGDrive && window.appGDrive.isConfigured()) {
        window.appGDrive.syncPortfolioToCloud(studentId, data);
      }

      return true;
    } catch (e) {
      console.error('Failed to save to LocalStorage', e);
      return false;
    }
  }

  saveDataForUser(studentId, data) {
    try {
      localStorage.setItem(`classmate_data_${studentId}`, JSON.stringify(data));
      if (window.appGDrive && window.appGDrive.isConfigured()) {
        window.appGDrive.syncPortfolioToCloud(studentId, data);
      }
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  // Store image in IndexedDB
  async saveImageToDB(id, dataUrl) {
    if (!this.db) await this.initDB();
    if (!this.db) return dataUrl; // Fallback

    return new Promise((resolve, reject) => {
      try {
        const transaction = this.db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const item = { id, dataUrl, timestamp: Date.now() };
        const req = store.put(item);

        req.onsuccess = () => resolve(id);
        req.onerror = (e) => {
          console.warn('Failed to save to IndexedDB', e);
          resolve(dataUrl);
        };
      } catch (err) {
        resolve(dataUrl);
      }
    });
  }

  // Retrieve image from IndexedDB
  async getImageFromDB(id) {
    if (!this.db) await this.initDB();
    if (!this.db) return null;

    return new Promise((resolve) => {
      try {
        const transaction = this.db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const req = store.get(id);

        req.onsuccess = (e) => {
          if (e.target.result && e.target.result.dataUrl) {
            resolve(e.target.result.dataUrl);
          } else {
            resolve(null);
          }
        };
        req.onerror = () => resolve(null);
      } catch (e) {
        resolve(null);
      }
    });
  }

  // Convert File to Base64 Data URL
  readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  }

  // Reset to default sample data
  resetDefaults() {
    this.saveData(DEFAULT_PRACTICUM_DATA);
    return JSON.parse(JSON.stringify(DEFAULT_PRACTICUM_DATA));
  }

  // Export JSON backup
  exportJSON() {
    const data = this.getData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ClassMate_Practicum_Report_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Import JSON backup
  importJSON(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.student && parsed.school) {
        this.saveData(parsed);
        return true;
      }
      return false;
    } catch (e) {
      console.error('Invalid JSON import', e);
      return false;
    }
  }
}

window.appStorage = new StorageManager();
