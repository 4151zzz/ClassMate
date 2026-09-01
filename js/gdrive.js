/**
 * ClassMate Practicum - Google Drive Cloud Auto-Sync Integration
 */

class GoogleDriveManager {
  constructor() {
    this.storageKey = 'classmate_gdrive_script_url';
    this.scriptUrl = localStorage.getItem(this.storageKey) || '';
  }

  getScriptUrl() {
    return this.scriptUrl;
  }

  setScriptUrl(url) {
    this.scriptUrl = (url || '').trim();
    localStorage.setItem(this.storageKey, this.scriptUrl);
    return true;
  }

  isConfigured() {
    return !!this.scriptUrl && this.scriptUrl.startsWith('https://script.google.com/');
  }

  // Upload file directly to user's Google Drive via Google Apps Script Web App
  async uploadFile(file, folderName = 'ClassMate_Practicum_Files') {
    if (!this.isConfigured()) {
      // Return local Base64 if not configured
      return await window.appStorage.readFileAsDataURL(file);
    }

    try {
      const dataUrl = await window.appStorage.readFileAsDataURL(file);
      const base64Data = dataUrl.split(',')[1];
      const mimeType = file.type || 'application/octet-stream';
      const fileName = file.name || `file_${Date.now()}`;

      const payload = {
        base64: base64Data,
        type: mimeType,
        name: fileName,
        folder: folderName
      };

      const response = await fetch(this.scriptUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8'
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (result && result.status === 'success' && result.url) {
        // Return direct Google Drive embed/view link
        return result.url;
      } else {
        console.warn('Google Apps Script response:', result);
        return dataUrl; // Fallback to local Base64
      }
    } catch (err) {
      console.error('Google Drive Upload Error:', err);
      // Fallback seamlessly to local Base64 so nothing breaks
      return await window.appStorage.readFileAsDataURL(file);
    }
  }

  // Get sample Google Apps Script code for the user to copy
  getAppsScriptCode() {
    return `function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var folderName = data.folder || "ClassMate_Practicum_Files";
    
    // Find or create folder in Google Drive
    var folders = DriveApp.getFoldersByName(folderName);
    var folder = folders.hasNext() ? folders.next() : DriveApp.createFolder(folderName);
    folder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    
    // Decode base64 and create file
    var decoded = Utilities.base64Decode(data.base64);
    var blob = Utilities.newBlob(decoded, data.type, data.name);
    var file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    
    var fileId = file.getId();
    // Direct embed link for images & PDFs
    var directUrl = "https://lh3.googleusercontent.com/d/" + fileId;
    
    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      fileId: fileId,
      url: directUrl,
      viewUrl: file.getUrl()
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}`;
  }
}

window.appGDrive = new GoogleDriveManager();
