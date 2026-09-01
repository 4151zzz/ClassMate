/**
 * ClassMate Practicum - Share, QR Code & Real-Time Public View Controller
 */

class ShareManager {
  constructor() {
    this.isPublicMode = false;
    this.sharedData = null;
    this.checkInitialMode();
  }

  // Check URL parameters and hash for view mode and embedded/cloud data
  async checkInitialMode() {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('mode') === 'view') {
      const studentId = urlParams.get('id') || urlParams.get('user');
      
      // Step 1: Try to fetch real-time cloud data from Google Drive / Cloud Sync
      if (studentId && window.appGDrive && window.appGDrive.isConfigured()) {
        try {
          const cloudData = await window.appGDrive.fetchPortfolioFromCloud(studentId);
          if (cloudData) {
            this.sharedData = cloudData;
            window.appStorage.getData = () => cloudData;
            if (window.app) window.app.renderAll();
            console.log('✅ Real-Time Cloud Portfolio Loaded for:', studentId);
            this.setPublicMode(true);
            return;
          }
        } catch (e) {
          console.warn('Could not fetch cloud data, falling back to URL hash', e);
        }
      }

      // Step 2: Fallback to embedded URL Hash data
      this.loadFromHash();
      this.setPublicMode(true);
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
        console.warn('LZ-String library not loaded yet — will retry');
        setTimeout(() => this.loadFromHash(), 500);
        return;
      }

      const json = LZString.decompressFromEncodedURIComponent(encoded);
      if (!json) return;

      const portfolioData = JSON.parse(json);
      this.sharedData = portfolioData;

      // Override storage getData so app renders shared data
      window.appStorage.getData = () => portfolioData;
      if (window.app) window.app.renderAll();

      console.log('✅ Loaded shared portfolio from URL Hash:', portfolioData.student?.fullName);
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

  // Build a sanitized copy of data (strip large local base64 images to keep URL clean)
  sanitizeDataForShare(data) {
    const clone = JSON.parse(JSON.stringify(data));

    const isBase64Image = (v) => typeof v === 'string' && v.startsWith('data:image');
    const isBase64Pdf = (v) => typeof v === 'string' && v.startsWith('data:application/pdf');

    if (isBase64Image(clone.student?.avatar)) {
      clone.student.avatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80';
    }
    if (isBase64Image(clone.student?.coverPhoto)) {
      clone.student.coverPhoto = '';
    }
    if (isBase64Image(clone.school?.badge)) {
      clone.school.badge = '';
    }

    if (clone.mentors) {
      clone.mentors = clone.mentors.map(m => {
        if (isBase64Image(m.avatar)) m.avatar = '';
        return m;
      });
    }
    if (clone.faculty) {
      clone.faculty = clone.faculty.map(f => {
        if (isBase64Image(f.avatar)) f.avatar = '';
        return f;
      });
    }

    if (clone.teachingLogs) {
      clone.teachingLogs = clone.teachingLogs.map(l => {
        if (isBase64Pdf(l.pdfData)) l.pdfData = null;
        if (isBase64Image(l.thumbnail)) l.thumbnail = null;
        return l;
      });
    }

    if (clone.gallery) {
      clone.gallery = clone.gallery.map(g => {
        if (isBase64Image(g.src)) g.src = '';
        return g;
      });
    }
    if (clone.studentShowcases) {
      clone.studentShowcases = clone.studentShowcases.map(s => {
        if (isBase64Image(s.image)) s.image = '';
        return s;
      });
    }

    return clone;
  }

  // Generate shareable link
  getShareUrl() {
    const rawData = window.appStorage.getData ? window.appStorage.getData() : {};
    const studentId = (rawData.student && rawData.student.studentId) || (window.appAuth && window.appAuth.getCurrentUser() && window.appAuth.getCurrentUser().studentId);

    // If Google Drive Cloud Sync is active, provide clean permanent real-time link!
    if (window.appGDrive && window.appGDrive.isConfigured() && studentId && studentId !== 'XXXXXXXXXXX') {
      const url = new URL(window.location.origin + window.location.pathname);
      url.searchParams.set('id', studentId);
      url.searchParams.set('mode', 'view');
      return url.href;
    }

    // Otherwise, embed full data into URL hash for instant serverless sharing
    if (typeof LZString !== 'undefined') {
      const safeData = this.sanitizeDataForShare(rawData);
      const json = JSON.stringify(safeData);
      const compressed = LZString.compressToEncodedURIComponent(json);

      const url = new URL(window.location.origin + window.location.pathname);
      if (studentId && studentId !== 'XXXXXXXXXXX') {
        url.searchParams.set('id', studentId);
      }
      url.searchParams.set('mode', 'view');
      return url.href + '#portfolio=' + compressed;
    }

    const url = new URL(window.location.origin + window.location.pathname);
    url.searchParams.set('mode', 'view');
    return url.href;
  }

  // Open Share Modal & Generate QR Code
  openShareModal() {
    const shareUrl = this.getShareUrl();
    const modal = document.getElementById('share-modal');
    const input = document.getElementById('share-url-input');
    const qrContainer = document.getElementById('qrcode-container');

    if (input) input.value = shareUrl;

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
