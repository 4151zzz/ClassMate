/**
 * ClassMate Practicum - Google Drive Cloud Auto-Sync & Real-Time Portfolio Engine
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
      return await window.appStorage.readFileAsDataURL(file);
    }

    try {
      const dataUrl = await window.appStorage.readFileAsDataURL(file);
      const base64Data = dataUrl.split(',')[1];
      const mimeType = file.type || 'application/octet-stream';
      const fileName = file.name || `file_${Date.now()}`;

      const payload = {
        action: 'uploadFile',
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
        return result.url;
      } else {
        console.warn('Google Apps Script response:', result);
        return dataUrl;
      }
    } catch (err) {
      console.error('Google Drive Upload Error:', err);
      return await window.appStorage.readFileAsDataURL(file);
    }
  }

  // Sync entire portfolio JSON to Google Drive Cloud in Real Time
  async syncPortfolioToCloud(studentId, portfolioData) {
    if (!this.isConfigured()) return false;

    try {
      const payload = {
        action: 'savePortfolio',
        studentId: studentId,
        data: portfolioData
      };

      await fetch(this.scriptUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
      });
      return true;
    } catch (err) {
      console.error('Cloud Sync Error:', err);
      return false;
    }
  }

  // Fetch real-time portfolio from Google Drive Cloud
  async fetchPortfolioFromCloud(studentId) {
    if (!this.isConfigured()) return null;

    try {
      const response = await fetch(`${this.scriptUrl}?action=getPortfolio&studentId=${encodeURIComponent(studentId)}`);
      const result = await response.json();
      if (result && result.status === 'success' && result.data) {
        return result.data;
      }
      return null;
    } catch (err) {
      console.error('Fetch Portfolio Cloud Error:', err);
      return null;
    }
  }

  // Complete Google Apps Script template for Auto-Sync & Real-Time Sharing
  getAppsScriptCode() {
    return `function doGet(e) {
  try {
    var studentId = e.parameter.studentId || "default";
    var folderName = "ClassMate_Practicum_Files";
    var folders = DriveApp.getFoldersByName(folderName);
    var folder = folders.hasNext() ? folders.next() : DriveApp.createFolder(folderName);
    
    var files = folder.getFilesByName("portfolio_" + studentId + ".json");
    if (files.hasNext()) {
      var file = files.next();
      var jsonText = file.getBlob().getDataAsString();
      return ContentService.createTextOutput(JSON.stringify({
        status: "success",
        data: JSON.parse(jsonText)
      })).setMimeType(ContentService.MimeType.JSON);
    }
    return ContentService.createTextOutput(JSON.stringify({ status: "not_found" })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var folderName = data.folder || "ClassMate_Practicum_Files";
    var folders = DriveApp.getFoldersByName(folderName);
    var folder = folders.hasNext() ? folders.next() : DriveApp.createFolder(folderName);
    folder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    
    // Action 1: Save Real-Time Portfolio JSON
    if (data.action === "savePortfolio") {
      var studentId = data.studentId || "default";
      var fileName = "portfolio_" + studentId + ".json";
      var files = folder.getFilesByName(fileName);
      while (files.hasNext()) {
        files.next().setTrashed(true);
      }
      var newFile = folder.createFile(fileName, JSON.stringify(data.data), "application/json");
      newFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      return ContentService.createTextOutput(JSON.stringify({ status: "success" })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Action 2: Upload Image / PDF File to Google Drive
    var decoded = Utilities.base64Decode(data.base64);
    var blob = Utilities.newBlob(decoded, data.type, data.name);
    var file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    
    var fileId = file.getId();
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
