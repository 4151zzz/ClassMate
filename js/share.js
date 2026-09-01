/**
 * ClassMate Practicum - Share, QR Code & Public View Controller
 *
 * Strategy: Portfolio data is compressed (LZ-String) and embedded into
 * the URL hash so the shared link works on ANY device/browser with NO server needed.
 *
 * Shared URL format:
 *   index.html?mode=view#portfolio=<lzstring_compressed_base64>
 *
 * Images stored as Google Drive links work fine across devices.
 * Images stored as large base64 dataURLs are stripped and replaced with a placeholder.
 */

class ShareManager {
  constructor() {
    this.isPublicMode = false;
    this.sharedData = null;
    this.checkInitialMode();
  }

  // Check URL parameters and hash for view mode and embedded data
  checkInitialMode() {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('mode') === 'view') {
      // Try to load embedded portfolio from URL hash
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
      const originalGetData = window.appStorage.getData.bind(window.appStorage);
      window.appStorage.getData = () => portfolioData;
      window.appStorage._originalGetData = originalGetData;

      console.log('✅ Loaded shared portfolio from URL:', portfolioData.student?.fullName);
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

  // Build a sanitized copy of data (strip large base64 images to keep URL short)
  sanitizeDataForShare(data) {
    const clone = JSON.parse(JSON.stringify(data));

    const isBase64Image = (v) => typeof v === 'string' && v.startsWith('data:image');
    const isBase64Pdf = (v) => typeof v === 'string' && v.startsWith('data:application/pdf');

    // Strip base64 avatar / cover (keep Google Drive links)
    if (isBase64Image(clone.student?.avatar)) {
      clone.student.avatar = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80';
    }
    if (isBase64Image(clone.student?.coverPhoto)) {
      clone.student.coverPhoto = '';
    }
    if (isBase64Image(clone.school?.badge)) {
      clone.school.badge = '';
    }

    // Strip base64 in mentors / faculty avatars
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

    // Strip base64 PDF data in teaching logs
    if (clone.teachingLogs) {
      clone.teachingLogs = clone.teachingLogs.map(l => {
        if (isBase64Pdf(l.pdfData)) l.pdfData = null;
        if (isBase64Image(l.thumbnail)) l.thumbnail = null;
        return l;
      });
    }

    // Strip base64 in gallery
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

  // Generate shareable link with embedded portfolio data in URL hash
  getShareUrl() {
    if (typeof LZString === 'undefined') {
      // Fallback to ID-only link if library not loaded
      const url = new URL(window.location.origin + window.location.pathname);
      url.searchParams.set('mode', 'view');
      return url.href;
    }

    const rawData = window.appStorage.getData ? window.appStorage.getData() : {};
    const safeData = this.sanitizeDataForShare(rawData);
    const json = JSON.stringify(safeData);
    const compressed = LZString.compressToEncodedURIComponent(json);

    const url = new URL(window.location.origin + window.location.pathname);
    url.searchParams.set('mode', 'view');
    return url.href + '#portfolio=' + compressed;
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
      // QR Code from the URL (use API to avoid large URL issues in QRCode.js)
      const qrUrl = window.location.origin + window.location.pathname + '?mode=view';
      const apiQr = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(qrUrl)}`;
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
