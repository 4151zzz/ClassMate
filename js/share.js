/**
 * ClassMate Practicum - Share, QR Code & Public View Controller
 *
 * HOW IT WORKS:
 * When "แชร์โปรไฟล์" is clicked, the ENTIRE portfolio is LZ-compressed
 * into the URL hash (#portfolio=...) so it is self-contained.
 * The viewer gets all data directly from the URL — no server needed.
 *
 * IMPORTANT: loadFromHash() is called both here and from app.js AFTER
 * window.app is created. Do NOT call window.app.renderAll() here.
 */

class ShareManager {
  constructor() {
    this.isPublicMode = false;
    this.sharedData = null;
    this._decodedData = null;

    // Decode the hash immediately so data is ready when app.js calls renderAll()
    this._tryDecodeHash();

    // Set public mode based on URL
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('mode') === 'view' || window.location.hash.includes('portfolio=')) {
      this.isPublicMode = true;
    }
  }

  // Attempt to decode portfolio data from URL hash RIGHT NOW (synchronously if LZString ready)
  _tryDecodeHash() {
    const hash = window.location.hash;
    if (!hash || !hash.includes('portfolio=')) return;

    const encoded = hash.split('portfolio=')[1];
    if (!encoded) return;

    if (typeof LZString === 'undefined') {
      // LZString CDN not ready yet — app.js init will retry via loadFromHash()
      return;
    }

    try {
      const json = LZString.decompressFromEncodedURIComponent(encoded);
      if (!json) return;
      this._decodedData = JSON.parse(json);
      this.sharedData = this._decodedData;

      // Override getData so that when app.js calls renderAll(), it reads the right data
      if (window.appStorage) {
        window.appStorage.getData = () => this._decodedData;
        window.appStorage._isSharedView = true;
      }
    } catch (err) {
      console.error('[ShareManager] Failed to decode URL hash data:', err);
    }
  }

  // Called by app.js init() after window.app exists
  loadFromHash() {
    const hash = window.location.hash;
    if (!hash || !hash.includes('portfolio=')) return false;

    const encoded = hash.split('portfolio=')[1];
    if (!encoded) return false;

    if (typeof LZString === 'undefined') {
      console.warn('[ShareManager] LZString not ready in loadFromHash');
      return false;
    }

    try {
      const json = LZString.decompressFromEncodedURIComponent(encoded);
      if (!json) return false;

      const data = JSON.parse(json);
      this._decodedData = data;
      this.sharedData = data;

      // Override storage so app always reads shared data
      window.appStorage.getData = () => data;
      window.appStorage._isSharedView = true;

      return true;
    } catch (err) {
      console.error('[ShareManager] loadFromHash error:', err);
      return false;
    }
  }

  // Set Public (View-Only) or Edit Mode — called after DOM is ready
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

  // Compress all portfolio data into a self-contained share URL
  getShareUrl() {
    if (typeof LZString === 'undefined') {
      window.showToast('กรุณารอสักครู่แล้วลองใหม่ (กำลังโหลด LZ-String)', 'error');
      return window.location.origin + window.location.pathname + '?mode=view';
    }

    const rawData = window.appStorage._isSharedView && this._decodedData
      ? this._decodedData
      : (window.appStorage._originalGetData ? window.appStorage._originalGetData() : window.appStorage.getData());

    const json = JSON.stringify(rawData);
    const compressed = LZString.compressToEncodedURIComponent(json);

    const base = window.location.origin + window.location.pathname;
    return base + '?mode=view#portfolio=' + compressed;
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
      // Shorten QR to base URL only (hash too large for QR), show full link in text
      const qrTarget = window.location.origin + window.location.pathname + '?mode=view';
      const apiQr = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(qrTarget)}`;
      qrContainer.innerHTML = `<img src="${apiQr}" alt="QR Code" style="width:180px;height:180px;" />
        <p style="font-size:0.7rem;color:var(--text-muted);margin-top:0.5rem;text-align:center;">QR เปิดหน้าเว็บเท่านั้น<br>ใช้ปุ่ม "คัดลอกลิงก์" เพื่อแชร์พร้อมข้อมูล</p>`;
    }

    if (modal) modal.classList.add('active');
  }

  // Copy link to clipboard
  async copyShareLink() {
    const input = document.getElementById('share-url-input');
    if (input) {
      try {
        await navigator.clipboard.writeText(input.value);
        window.showToast('✅ คัดลอกลิงก์แชร์พอร์ตโฟลิโอสำเร็จ! ส่งให้คนอื่นเปิดได้เลย', 'success');
      } catch (err) {
        input.select();
        document.execCommand('copy');
        window.showToast('✅ คัดลอกลิงก์สำเร็จ!', 'success');
      }
    }
  }

  // Print or PDF export
  printReport() {
    window.print();
  }
}

window.appShare = new ShareManager();
