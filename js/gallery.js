/**
 * ClassMate Practicum - Gallery & Lightbox Controller
 */

class GalleryManager {
  constructor() {
    this.currentFilter = 'all';
    this.activeImageIndex = 0;
  }

  // Render gallery cards
  renderGallery(items) {
    const container = document.getElementById('gallery-grid');
    if (!container) return;

    const filtered = this.currentFilter === 'all' 
      ? items 
      : items.filter(item => item.category === this.currentFilter);

    if (filtered.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--text-muted);">
          <i class="fas fa-images" style="font-size: 2.5rem; margin-bottom: 0.5rem; opacity: 0.5;"></i>
          <p>ยังไม่มีรูปภาพในหมวดหมู่นี้</p>
        </div>
      `;
      return;
    }

    container.innerHTML = filtered.map((item, idx) => `
      <div class="gallery-item" onclick="window.appGallery.openLightbox('${item.id}')">
        <img src="${item.url}" alt="${item.title}" class="gallery-img" loading="lazy" />
        <div class="gallery-overlay">
          <span class="gallery-cat-badge">${item.category || 'กิจกรรม'}</span>
          <h4 class="gallery-title">${item.title}</h4>
          <span class="gallery-date"><i class="far fa-calendar-alt"></i> ${item.date || ''}</span>
        </div>
        <div class="gallery-item-actions">
          <button class="btn btn-sm btn-icon btn-outline" style="background: rgba(0,0,0,0.6); color: #fff; width:32px; height:32px;" onclick="event.stopPropagation(); window.app.editGalleryItem('${item.id}')" title="แก้ไข">
            <i class="fas fa-pen" style="font-size:0.75rem;"></i>
          </button>
          <button class="btn btn-sm btn-icon btn-outline" style="background: rgba(239,68,68,0.8); color: #fff; width:32px; height:32px;" onclick="event.stopPropagation(); window.app.deleteGalleryItem('${item.id}')" title="ลบ">
            <i class="fas fa-trash" style="font-size:0.75rem;"></i>
          </button>
        </div>
      </div>
    `).join('');
  }

  // Filter category
  filter(cat, btnElement) {
    this.currentFilter = cat;
    
    // Update active filter button
    const buttons = document.querySelectorAll('.gallery-filter-pill');
    buttons.forEach(b => b.classList.remove('active'));
    if (btnElement) btnElement.classList.add('active');

    const data = window.appStorage.getData();
    this.renderGallery(data.gallery || []);
  }

  // Open Lightbox
  openLightbox(id) {
    const data = window.appStorage.getData();
    const item = (data.gallery || []).find(g => g.id === id);
    if (!item) return;

    const modal = document.getElementById('lightbox-modal');
    const img = document.getElementById('lightbox-img');
    const title = document.getElementById('lightbox-title');
    const desc = document.getElementById('lightbox-desc');
    const meta = document.getElementById('lightbox-meta');

    if (img) img.src = item.url;
    if (title) title.innerText = item.title;
    if (desc) desc.innerText = item.description || '';
    if (meta) meta.innerHTML = `<span class="gallery-cat-badge">${item.category}</span> <span>${item.date || ''}</span>`;

    if (modal) modal.classList.add('active');
  }

  closeLightbox() {
    const modal = document.getElementById('lightbox-modal');
    if (modal) modal.classList.remove('active');
  }
}

window.appGallery = new GalleryManager();
