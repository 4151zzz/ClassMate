/**
 * ClassMate Practicum - Share, QR Code & Public View Controller
 * 
 * Embeds full student portfolio into URL Hash via LZ-String compression
 * so the link works 100% reliably across any device/browser without a server.
 */

class ShareManager {
  constructor() {
    this.isPublicMode = false;
    this.sharedData = null;
    this.checkInitialMode();
  }

  // Check URL parameters and hash for view mode and embedded data
  async checkInitialMode() {
    const urlParams = new URLSearchParams(window.location.search);
    const hasViewMode = urlParams.get('mode') === 'view';
    const hasPortfolioHash = window.location.hash && window.location.hash.includes('portfolio=');
    const studentId = urlParams.get('id') || urlParams.get('user');

    if (hasViewMode || hasPortfolioHash || studentId) {
      this.setPublicMode(true);

      // 1. Try decoding from URL hash (fastest & most reliable)
      if (hasPortfolioHash) {
        this.loadFromHash();
      }

      // 2. Try fetching from Cloud if connected
      if (studentId && window.appGDrive && window.appGDrive.isConfigured()) {
        try {
          const cloudData = await window.appGDrive.fetchPortfolioFromCloud(studentId);
          if (cloudData) {
            this.sharedData = cloudData;
            window.appStorage.saveDataForUser(studentId, cloudData);
            window.appStorage.getData = () => cloudData;
            if (window.app) window.app.renderAll();
          }
        } catch (e) {
          console.warn('Cloud fetch fallback', e);
        }
      }
    }
  }

  // Decode and load portfolio data embedded in the URL hash
  loadFromHash() {
    try {
      const hash = window.location.hash;
      if (!hash || !hash.includes('portfolio=')) return;

      const encoded = hash.split('portfolio=')[1];
      if (!encoded) return;

      if (typeof LZString === 'undefined') {
        setTimeout(() => this.loadFromHash(), 300);
        return;
      }

      const json = LZString.decompressFromEncodedURIComponent(encoded);
      if (!json) return;

      const portfolioData = JSON.parse(json);
      this.sharedData = portfolioData;

      // Save to local storage for caching
      const studentId = portfolioData.student?.studentId || 'shared_user';
      if (window.appStorage) {
        window.appStorage.saveDataForUser(studentId, portfolioData);
        window.appStorage.getData = () => portfolioData;
      }

      if (window.app) {
        window.app.renderAll();
      }
    } catch (err) {
      console.error('Failed to decode shared portfolio from URL:', err);
    }
  }

  // Set Public (View-Only) or Edit Mode
  setPublicMode(isPublic) {
    this.isPublicMode = isPublic;
    if (isPublic) {
      document.body.classList.add('public-mode-active');
      const badge = document.getElementById('mode-indicator');
      if (badge) {
        badge.className = 'mode-badge public-mode';
        badge.innerHTML = '<span class="status-dot"></span> โหมดสาธารณะ (ผู้เข้าชม)';
      }
      const toggleBtn = document.getElementById('toggle-mode-btn');
      if (toggleBtn) {
        toggleBtn.innerHTML = '<i class="fas fa-lock-open"></i> สลับเป็นโหมดแก้ไข';
      }
    } else {
      document.body.classList.remove('public-mode-active');
      const badge = document.getElementById('mode-indicator');
      if (badge) {
        badge.className = 'mode-badge edit-mode';
        badge.innerHTML = '<span class="status-dot" style="background:#f59e0b;box-shadow:0 0 8px #f59e0b"></span> โหมดแก้ไขข้อมูล';
      }
      const toggleBtn = document.getElementById('toggle-mode-btn');
      if (toggleBtn) {
        toggleBtn.innerHTML = '<i class="fas fa-eye"></i> ดูมุมมองผู้เข้าชม';
      }
    }
  }

  toggleMode() {
    this.setPublicMode(!this.isPublicMode);
    if (this.isPublicMode) {
      window.showToast('สลับเข้าสู่มุมมองผู้เข้าชม (Read-Only Mode)', 'info');
    } else {
      window.showToast('สลับเข้าสู่โหมดแก้ไขข้อมูล (Editor Mode)', 'success');
    }
  }

  // Generate shareable link with embedded portfolio data
  getShareUrl() {
    const rawData = window.appStorage.getData ? window.appStorage.getData() : {};
    const studentId = (rawData.student && rawData.student.studentId) || (window.appAuth && window.appAuth.getCurrentUser() && window.appAuth.getCurrentUser().studentId);

    const url = new URL(window.location.origin + window.location.pathname);
    if (studentId && studentId !== 'XXXXXXXXXXX') {
      url.searchParams.set('id', studentId);
    }
    url.searchParams.set('mode', 'view');

    if (typeof LZString !== 'undefined') {
      const json = JSON.stringify(rawData);
      const compressed = LZString.compressToEncodedURIComponent(json);
      return url.href + '#portfolio=' + compressed;
    }

    return url.href;
  }

  // Open Share Modal & Generate QR Code
  openShareModal() {
    const shareUrl = this.getShareUrl();
    const modal = document.getElementById('share-modal');
    const input = document.getElementById('share-url-input');
    const qrContainer = document.getElementById('qrcode-container');

    if (input) input.value = shareUrl;

    // Update browser address bar hash seamlessly so if user copies address bar it has full data
    if (shareUrl.includes('#portfolio=')) {
      const hashPart = shareUrl.substring(shareUrl.indexOf('#'));
      history.replaceState(null, '', window.location.pathname + window.location.search + hashPart);
    }

    if (qrContainer) {
      qrContainer.innerHTML = '';
      const apiQr = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(shareUrl)}`;
      qrContainer.innerHTML = `<img src="${apiQr}" alt="QR Code" style="width:180px;height:180px;" />`;
    }

    if (modal) modal.classList.add('active');
  }

  // Copy link
  async copyShareLink() {
    const input = document.getElementById('share-url-input');
    if (input) {
      try {
        await navigator.clipboard.writeText(input.value);
        window.showToast('คัดลอกลิงก์แชร์โปรไฟล์สำเร็จแล้ว!', 'success');
      } catch (err) {
        input.select();
        document.execCommand('copy');
        window.showToast('คัดลอกลิงก์แชร์โปรไฟล์สำเร็จ!', 'success');
      }
    }
  }

  // Print or PDF export
  printReport() {
    window.print();
  }
}

window.appShare = new ShareManager();
