/**
 * ClassMate Practicum - Share, QR Code & Public View Controller
 */

class ShareManager {
  constructor() {
    this.isPublicMode = false;
    this.checkInitialMode();
  }

  // Check URL parameters for view mode
  checkInitialMode() {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('mode') === 'view') {
      this.setPublicMode(true);
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

  // Generate shareable link
  getShareUrl() {
    const url = new URL(window.location.origin + window.location.pathname);
    const data = window.appStorage.getData();
    const studentId = (data.student && data.student.studentId) || (window.appAuth && window.appAuth.getCurrentUser() && window.appAuth.getCurrentUser().studentId);
    if (studentId && studentId !== 'XXXXXXXXXXX') {
      url.searchParams.set('id', studentId);
    }
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
      if (typeof QRCode !== 'undefined') {
        new QRCode(qrContainer, {
          text: shareUrl,
          width: 180,
          height: 180,
          colorDark: "#0f172a",
          colorLight: "#ffffff",
          correctLevel: QRCode.CorrectLevel.H
        });
      } else {
        // Fallback to QR Server API if offline/CDN not loaded
        qrContainer.innerHTML = `<img src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(shareUrl)}" alt="QR Code" style="width:180px;height:180px;" />`;
      }
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
