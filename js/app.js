/**
 * ClassMate Practicum - Main Application Controller (Full Customization & Edit Everywhere)
 */

class AppController {
  constructor() {
    this.currentTheme = localStorage.getItem('classmate_theme') || 'dark';
    this.currentFacultyFilter = 'all';
    this.currentFacultySearch = '';
    this.activeModal = null;
    this.tempUploadImage = null;

    document.addEventListener('DOMContentLoaded', () => {
      this.init();
    });
  }

  // Initialize App
  init() {
    this.applyTheme('light');
    this.bindEvents();
    this.updateAuthUI();

    const urlParams = new URLSearchParams(window.location.search);
    const isViewMode = urlParams.get('mode') === 'view';
    const hasHashData = window.location.hash && window.location.hash.includes('portfolio=');

    if (isViewMode || hasHashData) {
      // Apply public mode UI
      if (window.appShare) window.appShare.setPublicMode(true);

      if (hasHashData) {
        // LZString might load async from CDN — wait for it, then decode + render
        const tryLoad = (attemptsLeft) => {
          if (typeof LZString !== 'undefined') {
            const decoded = window.appShare.loadFromHash();
            this.renderAll();
          } else if (attemptsLeft > 0) {
            setTimeout(() => tryLoad(attemptsLeft - 1), 300);
          } else {
            // LZString never loaded — render with whatever data we have
            this.renderAll();
          }
        };
        tryLoad(10);
      } else {
        // view mode with no hash — just render (will show empty template for viewer)
        this.renderAll();
      }
    } else {
      this.renderAll();
    }
  }

  // Theme Toggler
  applyTheme(theme) {
    this.currentTheme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('classmate_theme', theme);
    
    const themeIcon = document.getElementById('theme-toggle-icon');
    if (themeIcon) {
      themeIcon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
  }

  toggleTheme() {
    const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
    this.applyTheme(newTheme);
    window.showToast(`เปลี่ยนเป็นโหมด ${newTheme === 'dark' ? 'มืด (Dark)' : 'สว่าง (Light)'} เรียบร้อย`, 'info');
  }

  // Bind UI Events
  bindEvents() {
    // Theme toggle button
    const themeBtn = document.getElementById('theme-toggle-btn');
    if (themeBtn) {
      themeBtn.addEventListener('click', () => this.toggleTheme());
    }

    // Public/Edit Mode toggle
    const modeBtn = document.getElementById('toggle-mode-btn');
    if (modeBtn) {
      modeBtn.addEventListener('click', () => window.appShare.toggleMode());
    }

    // Share button
    const shareBtn = document.getElementById('share-btn');
    if (shareBtn) {
      shareBtn.addEventListener('click', () => window.appShare.openShareModal());
    }

    // Tab buttons
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const targetTab = btn.getAttribute('data-tab');
        this.switchTab(targetTab, btn);
      });
    });

    // Faculty search input
    const facSearch = document.getElementById('faculty-search-input');
    if (facSearch) {
      facSearch.addEventListener('input', (e) => {
        this.currentFacultySearch = e.target.value.trim().toLowerCase();
        this.renderFaculty();
      });
    }

    // JSON file import listener
    const importInput = document.getElementById('import-json-input');
    if (importInput) {
      importInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          const reader = new FileReader();
          reader.onload = (event) => {
            const success = window.appStorage.importJSON(event.target.result);
            if (success) {
              this.renderAll();
              window.showToast('นำเข้าข้อมูลสำเร็จและอัปเดตหน้าเว็บแล้ว!', 'success');
            } else {
              window.showToast('ไฟล์ JSON ไม่ถูกต้องหรือไม่ตรงรูปแบบ', 'error');
            }
          };
          reader.readAsText(file);
        }
      });
    }

    // Drag and drop photo uploaders
    this.initDropzones();
  }

  // Tab switcher
  switchTab(tabId, clickedBtn) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));

    if (clickedBtn) {
      clickedBtn.classList.add('active');
    } else {
      const activeBtn = document.querySelector(`.tab-btn[data-tab="${tabId}"]`);
      if (activeBtn) activeBtn.classList.add('active');
    }

    const targetPanel = document.getElementById(`tab-${tabId}`);
    if (targetPanel) {
      targetPanel.classList.add('active');
    }
  }

  // Render everything from storage
  renderAll() {
    const data = window.appStorage.getData();
    this.renderStudentProfile(data.student);
    this.renderCompetencies(data.competencies || []);
    this.renderSchoolProfile(data.school);
    this.renderMentors(data.mentors || []);
    this.renderFaculty();
    this.renderTimetable(data.timetable || DEFAULT_PRACTICUM_DATA.timetable || []);
    this.renderTeachingLogs(data.teachingLogs || []);
    window.appGallery.renderGallery(data.gallery || []);
    this.renderStudentShowcases(data.studentShowcases || []);
  }

  // Render Student Profile & Hero Section
  renderStudentProfile(student) {
    if (!student) return;

    // Header / Hero Elements
    const avatarEl = document.getElementById('hero-avatar-img');
    const nameEl = document.getElementById('hero-student-name');
    const idEl = document.getElementById('hero-student-id');
    const facultyEl = document.getElementById('hero-faculty-text');
    const majorEl = document.getElementById('hero-major-text');
    const quoteEl = document.getElementById('hero-quote-text');
    const statusEl = document.getElementById('hero-status-text');
    const tagsContainer = document.getElementById('hero-tags-container');

    // Stats
    const hoursEl = document.getElementById('stat-completed-hours');
    const plansEl = document.getElementById('stat-plans-count');
    const classesEl = document.getElementById('stat-classes-taught');

    if (avatarEl) avatarEl.src = student.avatar;
    if (nameEl) nameEl.innerText = student.fullName;
    if (idEl) idEl.innerText = `รหัสนักศึกษา: ${student.studentId}`;
    if (facultyEl) facultyEl.innerHTML = `<i class="fas fa-university" style="color:var(--primary-500);"></i> ${student.faculty}`;
    if (majorEl) majorEl.innerHTML = `<i class="fas fa-laptop-code" style="color:var(--accent-purple);"></i> ${student.major} • ${student.university}`;
    if (quoteEl) quoteEl.innerText = student.quote;
    if (statusEl) statusEl.innerText = student.status || 'กำลังปฏิบัติการสอนในสถานศึกษา';

    if (tagsContainer) {
      const tags = student.tags && student.tags.length ? student.tags : ["ครูฝึกสอน", "Active Learning", "AI & EdTech", "ปีการศึกษา 2568"];
      tagsContainer.innerHTML = tags.map(t => `<span class="hero-tag"><i class="fas fa-tag"></i> ${t}</span>`).join('');
    }

    if (hoursEl) hoursEl.innerText = `${student.completedHours} / ${student.totalHours} ชม.`;
    if (plansEl) plansEl.innerText = `${student.lessonPlansCount} แผน`;
    if (classesEl) classesEl.innerText = student.classesTaught;

    // Bio and Contacts
    const bioEl = document.getElementById('profile-bio-text');
    const emailEl = document.getElementById('profile-email-text');
    const phoneEl = document.getElementById('profile-phone-text');
    if (bioEl) bioEl.innerText = student.bio || '';
    if (emailEl) emailEl.innerText = student.email || '';
    if (phoneEl) phoneEl.innerText = student.phone || '';
  }

  // Render Competencies
  renderCompetencies(comps) {
    const container = document.getElementById('competencies-container');
    if (!container) return;

    if (!comps || comps.length === 0) {
      container.innerHTML = '<p style="color:var(--text-muted);">ยังไม่มีข้อมูลสมรรถนะ</p>';
      return;
    }

    container.innerHTML = comps.map(c => `
      <div style="background:var(--bg-glass-strong); padding: 1rem; border-radius: var(--radius-md); border: 1px solid var(--border-color); position:relative;">
        <div style="font-weight: 600; color:${c.color || 'var(--primary-500)'}; margin-bottom: 0.25rem;">
          <i class="fas ${c.icon || 'fa-star'}"></i> ${c.title}
        </div>
        <span style="font-size: 0.82rem; color:var(--text-secondary);">${c.desc}</span>
      </div>
    `).join('');
  }

  // Render School Info
  renderSchoolProfile(school) {
    if (!school) return;

    const logoEl = document.getElementById('school-logo-img');
    const nameThEl = document.getElementById('school-name-th');
    const nameEnEl = document.getElementById('school-name-en');
    const mottoEl = document.getElementById('school-motto');
    const visionEl = document.getElementById('school-vision');
    const addressEl = document.getElementById('school-address');
    const directorEl = document.getElementById('school-director');
    const phoneEl = document.getElementById('school-phone');
    const emailEl = document.getElementById('school-email');
    const webEl = document.getElementById('school-website');
    const affilEl = document.getElementById('school-affiliation');
    const mapFrame = document.getElementById('school-map-iframe');

    if (logoEl) logoEl.src = school.badge;
    if (nameThEl) nameThEl.innerText = school.nameTh;
    if (nameEnEl) nameEnEl.innerText = school.nameEn;
    if (mottoEl) mottoEl.innerText = school.motto;
    if (visionEl) visionEl.innerText = school.vision;
    if (addressEl) addressEl.innerText = school.address;
    if (directorEl) directorEl.innerText = school.director;
    if (phoneEl) phoneEl.innerText = school.phone;
    if (emailEl) emailEl.innerText = school.email;
    if (affilEl) affilEl.innerText = school.affiliation || 'สังกัด สพฐ. / สกอ.';
    if (webEl) {
      webEl.innerText = school.website;
      webEl.href = school.website;
    }
    if (mapFrame && school.mapUrl) {
      mapFrame.src = school.mapUrl;
    }
  }

  // Render Mentors & Supervisors
  renderMentors(mentors) {
    const container = document.getElementById('mentors-grid');
    if (!container) return;

    if (mentors.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1/-1; text-align:center; padding:3rem; color:var(--text-muted);">
          <i class="fas fa-user-slash" style="font-size:2.5rem; margin-bottom:0.5rem; opacity:0.5;"></i>
          <p>ยังไม่มีข้อมูลครูพี่เลี้ยงหรืออาจารย์นิเทศก์</p>
        </div>
      `;
      return;
    }

    container.innerHTML = mentors.map(m => `
      <div class="mentor-card">
        <span class="mentor-badge ${m.roleType === 'mentor' ? 'badge-mentor' : 'badge-supervisor'}">
          ${m.roleTitle}
        </span>
        <div class="mentor-avatar-wrap">
          <img src="${m.avatar}" alt="${m.name}" class="mentor-avatar" />
        </div>
        <h3 class="mentor-name">${m.name}</h3>
        <div class="mentor-position">${m.position}</div>
        <div class="mentor-school-dept"><i class="fas fa-university"></i> ${m.department}</div>
        
        <div class="mentor-feedback-box">
          ${m.comment || 'ไม่มีบันทึกความคิดเห็น'}
        </div>

        <div class="mentor-contacts">
          ${m.phone ? `<a href="tel:${m.phone}" class="btn btn-sm btn-outline"><i class="fas fa-phone"></i> ${m.phone}</a>` : ''}
          ${m.email ? `<a href="mailto:${m.email}" class="btn btn-sm btn-outline"><i class="fas fa-envelope"></i> อีเมล</a>` : ''}
          <button class="btn btn-sm btn-outline btn-icon edit-trigger" onclick="window.app.editMentor('${m.id}')" title="แก้ไขข้อมูล">
            <i class="fas fa-pen"></i>
          </button>
          <button class="btn btn-sm btn-outline btn-icon edit-trigger" style="color:#ef4444;" onclick="window.app.deleteMentor('${m.id}')" title="ลบข้อมูล">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    `).join('');
  }

  // Render Faculty Directory with Search & Category filters
  renderFaculty() {
    const data = window.appStorage.getData();
    const faculty = data.faculty || [];
    const container = document.getElementById('faculty-grid');
    if (!container) return;

    let filtered = faculty;

    if (this.currentFacultyFilter !== 'all') {
      filtered = filtered.filter(f => f.department === this.currentFacultyFilter);
    }

    if (this.currentFacultySearch) {
      const q = this.currentFacultySearch;
      filtered = filtered.filter(f => 
        (f.name && f.name.toLowerCase().includes(q)) ||
        (f.position && f.position.toLowerCase().includes(q)) ||
        (f.department && f.department.toLowerCase().includes(q))
      );
    }

    if (filtered.length === 0) {
      container.innerHTML = `
        <div style="grid-column:1/-1; text-align:center; padding:3rem; color:var(--text-muted);">
          <i class="fas fa-user-slash" style="font-size:2.5rem; margin-bottom:0.5rem; opacity:0.5;"></i>
          <p>ไม่พบข้อมูลครูอาจารย์ตามเงื่อนไขที่ค้นหา</p>
        </div>
      `;
      return;
    }

    container.innerHTML = filtered.map(f => `
      <div class="faculty-card">
        <div class="faculty-actions">
          <button class="btn btn-sm btn-icon btn-outline" style="width:28px;height:28px;" onclick="window.app.editFaculty('${f.id}')" title="แก้ไข">
            <i class="fas fa-pen" style="font-size:0.7rem;"></i>
          </button>
          <button class="btn btn-sm btn-icon btn-outline" style="width:28px;height:28px;color:#ef4444;" onclick="window.app.deleteFaculty('${f.id}')" title="ลบ">
            <i class="fas fa-trash" style="font-size:0.7rem;"></i>
          </button>
        </div>
        <div class="faculty-avatar-wrap">
          <img src="${f.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}" alt="${f.name}" class="faculty-avatar" />
        </div>
        <h4 class="faculty-name">${f.name}</h4>
        <div class="faculty-role">${f.position}</div>
        <div class="faculty-dept-badge">${f.department}</div>
        <div class="faculty-contact-text">
          ${f.phone ? `<div><i class="fas fa-phone-alt" style="font-size:0.7rem;"></i> ${f.phone}</div>` : ''}
          ${f.email ? `<div><i class="fas fa-envelope" style="font-size:0.7rem;"></i> ${f.email}</div>` : ''}
        </div>
      </div>
    `).join('');
  }

  filterFaculty(dept, btnElement) {
    this.currentFacultyFilter = dept;
    document.querySelectorAll('.faculty-filter-pill').forEach(b => b.classList.remove('active'));
    if (btnElement) btnElement.classList.add('active');
    this.renderFaculty();
  }

  // Switch view between Timetable board and Lesson Plans list
  switchTimetableView(view) {
    const ttView = document.getElementById('timetable-view-container');
    const logsView = document.getElementById('logs-view-container');
    if (view === 'timetable') {
      if (ttView) ttView.style.display = 'block';
      if (logsView) logsView.style.display = 'none';
    } else {
      if (ttView) ttView.style.display = 'none';
      if (logsView) logsView.style.display = 'block';
    }
  }

  // Render Weekly Timetable
  renderTimetable(timetable) {
    const container = document.getElementById('timetable-days-grid');
    if (!container) return;

    const days = [
      { key: 'จันทร์', name: 'วันจันทร์ (Monday)', class: 'day-header-mon', icon: 'fa-sun', color: '#facc15' },
      { key: 'อังคาร', name: 'วันอังคาร (Tuesday)', class: 'day-header-tue', icon: 'fa-heart', color: '#f472b6' },
      { key: 'พุธ', name: 'วันพุธ (Wednesday)', class: 'day-header-wed', icon: 'fa-leaf', color: '#34d399' },
      { key: 'พฤหัสบดี', name: 'วันพฤหัสบดี (Thursday)', class: 'day-header-thu', icon: 'fa-bolt', color: '#fb923c' },
      { key: 'ศุกร์', name: 'วันศุกร์ (Friday)', class: 'day-header-fri', icon: 'fa-water', color: '#60a5fa' }
    ];

    container.innerHTML = days.map(d => {
      const daySlots = (timetable || []).filter(t => t.day === d.key).sort((a, b) => (a.period || 1) - (b.period || 1));

      return `
        <div class="timetable-day-col">
          <div class="timetable-day-header ${d.class}">
            <span><i class="fas ${d.icon}" style="color:${d.color};"></i> ${d.name}</span>
            <span style="font-size:0.75rem; color:var(--text-muted); font-weight:normal;">${daySlots.length} คาบ</span>
          </div>
          <div class="timetable-day-body">
            ${daySlots.length === 0 ? `
              <div style="text-align:center; padding:1.5rem; color:var(--text-muted); font-size:0.8rem;">
                <i class="far fa-calendar-times" style="font-size:1.5rem; opacity:0.4; margin-bottom:0.25rem;"></i>
                <p>ไม่มีคาบสอน</p>
              </div>
            ` : daySlots.map(s => `
              <div class="timetable-slot-card" onclick="window.app.editTimetableSlot('${s.id}')">
                <div class="slot-actions edit-trigger" onclick="event.stopPropagation();">
                  <button class="btn btn-sm btn-icon btn-outline" style="width:24px;height:24px;" onclick="window.app.editTimetableSlot('${s.id}')" title="แก้ไขคาบสอน">
                    <i class="fas fa-pen" style="font-size:0.65rem;"></i>
                  </button>
                  <button class="btn btn-sm btn-icon btn-outline" style="width:24px;height:24px; color:#ef4444;" onclick="window.app.deleteTimetableSlot('${s.id}')" title="ลบ">
                    <i class="fas fa-trash" style="font-size:0.65rem;"></i>
                  </button>
                </div>
                
                <span class="slot-period-badge">
                  <i class="far fa-clock"></i> คาบที่ ${s.period} (${s.time})
                </span>
                
                <div class="slot-subject-title">${s.subjectCode}: ${s.subjectName}</div>
                
                <div class="slot-info-row">
                  <span><i class="fas fa-users" style="color:var(--accent-purple);"></i> ${s.grade}</span> • 
                  <span><i class="fas fa-door-open" style="color:var(--primary-500);"></i> ${s.room}</span>
                </div>

                ${s.planId ? `
                  <div style="margin-top:0.45rem;">
                    <button class="btn btn-sm btn-outline" style="font-size:0.72rem; padding:0.2rem 0.5rem; color:var(--accent-emerald); border-color:rgba(16,185,129,0.3);" onclick="event.stopPropagation(); window.app.viewLessonPlan('${s.planId}')">
                      <i class="fas fa-file-pdf"></i> แผนการสอน
                    </button>
                  </div>
                ` : ''}
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }).join('');
  }

  // Populate Lesson Plan options in Timetable Modal
  populateTimetablePlanOptions(selectedPlanId = '') {
    const data = window.appStorage.getData();
    const logs = data.teachingLogs || [];
    const select = document.getElementById('edit-tt-planid');
    if (!select) return;

    select.innerHTML = '<option value="">-- ไม่ระบุแผน / ลิงก์ทั่วไป --</option>' + 
      logs.map(l => `<option value="${l.id}" ${l.id === selectedPlanId ? 'selected' : ''}>${l.week ? l.week + ': ' : ''}${l.title} (${l.subject})</option>`).join('');
  }

  // Timetable Slot Modals (Add / Edit / Delete)
  openAddTimetableModal() {
    this.populateTimetablePlanOptions('');
    document.getElementById('edit-tt-id').value = '';
    document.getElementById('edit-tt-day').value = 'จันทร์';
    document.getElementById('edit-tt-period').value = 1;
    document.getElementById('edit-tt-time').value = '08:30 - 09:20';
    document.getElementById('edit-tt-code').value = '';
    document.getElementById('edit-tt-name').value = '';
    document.getElementById('edit-tt-grade').value = '';
    document.getElementById('edit-tt-room').value = '';
    document.getElementById('timetable-modal-title').innerHTML = '<i class="fas fa-calendar-plus"></i> เพิ่มคาบสอนในตาราง';

    this.openModal('edit-timetable-modal');
  }

  editTimetableSlot(slotId) {
    const data = window.appStorage.getData();
    const slot = (data.timetable || DEFAULT_PRACTICUM_DATA.timetable || []).find(s => s.id === slotId);
    if (!slot) return;

    this.populateTimetablePlanOptions(slot.planId || '');
    document.getElementById('edit-tt-id').value = slot.id;
    document.getElementById('edit-tt-day').value = slot.day;
    document.getElementById('edit-tt-period').value = slot.period || 1;
    document.getElementById('edit-tt-time').value = slot.time;
    document.getElementById('edit-tt-code').value = slot.subjectCode;
    document.getElementById('edit-tt-name').value = slot.subjectName;
    document.getElementById('edit-tt-grade').value = slot.grade;
    document.getElementById('edit-tt-room').value = slot.room;
    document.getElementById('timetable-modal-title').innerHTML = '<i class="fas fa-calendar-edit"></i> แก้ไขคาบสอนในตาราง';

    this.openModal('edit-timetable-modal');
  }

  saveTimetableSlot(e) {
    e.preventDefault();
    const data = window.appStorage.getData();
    if (!data.timetable) data.timetable = DEFAULT_PRACTICUM_DATA.timetable || [];

    const slotId = document.getElementById('edit-tt-id').value;
    const day = document.getElementById('edit-tt-day').value;
    const period = parseInt(document.getElementById('edit-tt-period').value) || 1;
    const time = document.getElementById('edit-tt-time').value;
    const subjectCode = document.getElementById('edit-tt-code').value;
    const subjectName = document.getElementById('edit-tt-name').value;
    const grade = document.getElementById('edit-tt-grade').value;
    const room = document.getElementById('edit-tt-room').value;
    const planId = document.getElementById('edit-tt-planid').value;

    if (slotId) {
      const slot = data.timetable.find(s => s.id === slotId);
      if (slot) {
        slot.day = day;
        slot.period = period;
        slot.time = time;
        slot.subjectCode = subjectCode;
        slot.subjectName = subjectName;
        slot.grade = grade;
        slot.room = room;
        slot.planId = planId;
      }
    } else {
      data.timetable.push({
        id: 'tt-' + Date.now(),
        day,
        period,
        time,
        subjectCode,
        subjectName,
        grade,
        room,
        planId
      });
    }

    window.appStorage.saveData(data);
    this.renderTimetable(data.timetable);
    this.closeModal('edit-timetable-modal');
    window.showToast('บันทึกคาบสอนในตารางเรียบร้อยแล้ว', 'success');
  }

  deleteTimetableSlot(slotId) {
    if (confirm('คุณต้องการลบคาบสอนนี้ออกจากตารางใช่หรือไม่?')) {
      const data = window.appStorage.getData();
      data.timetable = (data.timetable || DEFAULT_PRACTICUM_DATA.timetable || []).filter(s => s.id !== slotId);
      window.appStorage.saveData(data);
      this.renderTimetable(data.timetable);
      window.showToast('ลบคาบสอนเรียบร้อยแล้ว', 'info');
    }
  }

  // Render All Plans Modal List dynamically
  renderAllPlansModal(logs) {
    const container = document.getElementById('all-plans-list');
    if (!container) return;

    if (!logs || logs.length === 0) {
      container.innerHTML = `
        <div style="text-align:center; padding:2rem; color:var(--text-muted);">
          <i class="fas fa-folder-open" style="font-size:2rem; opacity:0.4; margin-bottom:0.5rem;"></i>
          <p>ยังไม่มีรายการแผนการจัดการเรียนรู้</p>
        </div>
      `;
      return;
    }

    container.innerHTML = logs.map(l => `
      <div style="background:var(--bg-glass-strong); padding: 1rem; border-radius: var(--radius-md); border:1px solid var(--border-color); display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:0.5rem;">
        <div>
          <div style="font-weight:600; font-size:0.95rem;">${l.week ? l.week + ': ' : ''}${l.title}</div>
          <span style="font-size:0.78rem; color:var(--text-muted);">${l.subject} • ${l.grade} (${l.hours || 4} ชั่วโมง)</span>
        </div>
        <button class="btn btn-sm btn-primary" onclick="window.app.closeModal('view-all-plans-modal'); window.app.viewLessonPlan('${l.id}');">
          <i class="fas fa-file-alt"></i> เปิดดูแผน
        </button>
      </div>
    `).join('');
  }

  // Render Teaching Logs
  renderTeachingLogs(logs) {
    const container = document.getElementById('teaching-timeline');
    this.renderAllPlansModal(logs || []);
    if (!container) return;

    if (!logs || logs.length === 0) {
      container.innerHTML = '<p style="text-align:center; color:var(--text-muted); padding:2rem;">ยังไม่มีบันทึกและแผนการจัดการเรียนรู้ (กดปุ่ม "เพิ่มแผนการสอน" เพื่อเริ่มต้น)</p>';
      return;
    }

    container.innerHTML = logs.map(l => `
      <div class="log-card">
        <div class="log-date-col">
          <span class="log-week-badge">${l.week}</span>
          <span class="log-date-text"><i class="far fa-calendar-check"></i> ${l.date}</span>
          <span style="font-size:0.75rem; color:var(--text-muted);">${l.hours} ชั่วโมง</span>
        </div>
        <div class="log-info-col">
          <h4 class="log-title">${l.title}</h4>
          <p class="log-desc">${l.description}</p>
          
          <div class="log-meta-pills">
            <span class="log-pill"><i class="fas fa-book"></i> ${l.subject}</span>
            <span class="log-pill"><i class="fas fa-users"></i> ${l.grade}</span>
            <span class="log-pill" style="color:var(--accent-emerald); font-weight:600;"><i class="fas fa-check-circle"></i> ${l.status}</span>
          </div>

          <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-top: 0.65rem;">
            <button class="btn btn-sm btn-primary" onclick="window.app.viewLessonPlan('${l.id}')">
              <i class="fas fa-file-alt"></i> ดูแผนการสอน
            </button>
            ${l.planLink && l.planLink !== '#' ? `
              <a href="${l.planLink}" target="_blank" class="btn btn-sm btn-outline">
                <i class="fas fa-external-link-alt"></i> เปิดลิงก์ไฟล์ / Drive
              </a>
            ` : ''}
          </div>
        </div>
        <div class="log-actions edit-trigger" style="display:flex; flex-direction:column; gap:0.5rem;">
          <button class="btn btn-sm btn-outline btn-icon" onclick="window.app.editLog('${l.id}')" title="แก้ไขบันทึกและแผนการสอน">
            <i class="fas fa-pen"></i>
          </button>
          <button class="btn btn-sm btn-outline btn-icon" style="color:#ef4444;" onclick="window.app.deleteLog('${l.id}')" title="ลบ">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    `).join('');
  }

  // Switch tab in Lesson Plan View Modal
  switchPlanViewTab(tab) {
    const summarySection = document.getElementById('plan-view-summary-section');
    const pdfSection = document.getElementById('plan-view-pdf-section');
    const btnSummary = document.getElementById('plan-tab-btn-summary');
    const btnPdf = document.getElementById('plan-tab-btn-pdf');

    if (tab === 'summary') {
      if (summarySection) summarySection.style.display = 'block';
      if (pdfSection) pdfSection.style.display = 'none';
      if (btnSummary) { btnSummary.className = 'btn btn-sm btn-primary'; }
      if (btnPdf) { btnPdf.className = 'btn btn-sm btn-outline'; }
    } else {
      if (summarySection) summarySection.style.display = 'none';
      if (pdfSection) pdfSection.style.display = 'flex';
      if (btnSummary) { btnSummary.className = 'btn btn-sm btn-outline'; }
      if (btnPdf) { btnPdf.className = 'btn btn-sm btn-primary'; }
    }
  }

  // View Lesson Plan Modal Details & Interactive PDF Preview
  viewLessonPlan(logId) {
    const data = window.appStorage.getData();
    const log = (data.teachingLogs || []).find(l => l.id === logId);
    if (!log) return;

    this.switchPlanViewTab('summary');

    document.getElementById('view-plan-week-badge').innerText = log.week || 'สัปดาห์ที่ 1';
    document.getElementById('view-plan-title').innerText = log.title;
    document.getElementById('view-plan-meta').innerHTML = `
      <span><i class="fas fa-book" style="color:var(--primary-500);"></i> <strong>รายวิชา:</strong> ${log.subject}</span> • 
      <span><i class="fas fa-users" style="color:var(--accent-purple);"></i> <strong>ระดับชั้น:</strong> ${log.grade}</span> • 
      <span><i class="far fa-calendar-alt"></i> <strong>วันที่สอน:</strong> ${log.date}</span>
    `;
    document.getElementById('view-plan-desc').innerText = log.description;
    
    // Objectives
    const objEl = document.getElementById('view-plan-objectives');
    if (objEl) {
      objEl.innerText = log.objectives || '1. นักเรียนสามารถอธิบายหลักการและกระบวนการทำงานได้ถูกต้อง\n2. นักเรียนสามารถประยุกต์ใช้ทักษะการแก้ปัญหาในสถานการณ์จริงได้\n3. นักเรียนมีวินัยและมีความรับผิดชอบต่อการทำงานร่วมกัน';
    }

    // Steps
    const stepsEl = document.getElementById('view-plan-steps');
    if (stepsEl) {
      stepsEl.innerText = log.steps || '• ขั้นนำ (10 นาที): กระตุ้นความสนใจด้วยคำถามชวนคิดและยกตัวอย่างสถานการณ์จริง\n• ขั้นสอน (35 นาที): ดำเนินกิจกรรม Active Learning และฝึกปฏิบัติกลุ่ม\n• ขั้นสรุป (15 นาที): ร่วมกันสรุปองค์ความรู้และประเมินผลชิ้นงาน';
    }

    // Interactive PDF Preview
    const pdfContainer = document.getElementById('plan-pdf-container');
    const downloadBtn = document.getElementById('view-plan-download-btn');
    const extLinkBtn = document.getElementById('view-plan-ext-link');

    if (pdfContainer) {
      if (log.pdfDataUrl) {
        pdfContainer.innerHTML = `
          <iframe src="${log.pdfDataUrl}#toolbar=1" width="100%" height="100%" style="border:none;"></iframe>
        `;
        if (downloadBtn) {
          downloadBtn.href = log.pdfDataUrl;
          downloadBtn.download = `${log.title || 'Lesson_Plan'}.pdf`;
          downloadBtn.style.display = 'inline-flex';
        }
      } else if (log.planLink && log.planLink.endsWith('.pdf')) {
        pdfContainer.innerHTML = `
          <iframe src="${log.planLink}" width="100%" height="100%" style="border:none;"></iframe>
        `;
        if (downloadBtn) {
          downloadBtn.href = log.planLink;
          downloadBtn.style.display = 'inline-flex';
        }
      } else {
        // Fallback document sheet preview
        pdfContainer.innerHTML = `
          <div style="padding: 2.5rem; text-align: center; color: var(--text-secondary); display: flex; flex-direction: column; align-items: center; gap: 0.75rem;">
            <i class="fas fa-file-pdf" style="font-size: 3.5rem; color: #ef4444; opacity: 0.8;"></i>
            <h4 style="font-size: 1.15rem; font-weight: 700; color: var(--text-primary);">เอกสารแผนการจัดการเรียนรู้: ${log.title}</h4>
            <p style="font-size: 0.88rem; max-width: 480px;">
              ${log.subject} (${log.grade}) • เวลาเรียน ${log.hours || 4} คาบ • สถานะ: ${log.status || 'ผ่านการประเมิน'}
            </p>
            <div style="display:flex; gap:0.5rem; margin-top:0.5rem;">
              <button class="btn btn-primary" onclick="window.app.closeModal('view-plan-modal'); window.app.editLog('${log.id}');">
                <i class="fas fa-upload"></i> อัปโหลดไฟล์ PDF สำหรับแผนนี้
              </button>
            </div>
          </div>
        `;
        if (downloadBtn) downloadBtn.style.display = 'none';
      }
    }

    // External Link Button
    if (extLinkBtn) {
      if (log.planLink && log.planLink !== '#') {
        extLinkBtn.href = log.planLink;
        extLinkBtn.style.display = 'inline-flex';
      } else {
        extLinkBtn.style.display = 'none';
      }
    }

    // Edit button inside modal
    const editBtn = document.getElementById('view-plan-edit-btn');
    if (editBtn) {
      editBtn.onclick = () => {
        this.closeModal('view-plan-modal');
        this.editLog(log.id);
      };
    }

    this.openModal('view-plan-modal');
  }

  // Render Student Showcases
  renderStudentShowcases(items) {
    const container = document.getElementById('student-showcases-grid');
    if (!container) return;

    if (!items || items.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1/-1; text-align:center; padding:3rem; color:var(--text-muted);">
          <i class="fas fa-award" style="font-size:2.5rem; margin-bottom:0.5rem; opacity:0.5;"></i>
          <p>ยังไม่มีรายการผลงานนักเรียน</p>
        </div>
      `;
      return;
    }

    container.innerHTML = items.map(s => `
      <div class="card hover-lift" style="display:flex; flex-direction:column; gap:1rem; overflow:hidden; position:relative;">
        <div class="faculty-actions" style="opacity:1;">
          <button class="btn btn-sm btn-icon btn-outline" style="background:rgba(0,0,0,0.6); color:#fff; width:30px;height:30px;" onclick="window.app.editShowcase('${s.id}')" title="แก้ไข">
            <i class="fas fa-pen" style="font-size:0.7rem;"></i>
          </button>
          <button class="btn btn-sm btn-icon btn-outline" style="background:rgba(239,68,68,0.8); color:#fff; width:30px;height:30px;" onclick="window.app.deleteShowcase('${s.id}')" title="ลบ">
            <i class="fas fa-trash" style="font-size:0.7rem;"></i>
          </button>
        </div>
        <img src="${s.image}" alt="${s.title}" style="width:100%; height:190px; object-fit:cover; border-radius:var(--radius-md);" />
        <div>
          <div style="font-size:0.78rem; color:var(--accent-amber); font-weight:600; margin-bottom:0.3rem;">
            <i class="fas fa-trophy"></i> ${s.award}
          </div>
          <h4 style="font-size:1.1rem; font-weight:700; margin-bottom:0.35rem;">${s.title}</h4>
          <p style="font-size:0.85rem; color:var(--text-secondary);"><i class="fas fa-user-graduate"></i> จัดทำโดย: ${s.studentNames}</p>
        </div>
      </div>
    `).join('');
  }

  // ==========================================
  // Modal & Edit Dialog Handlers
  // ==========================================

  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('active');
      this.activeModal = modal;
      this.tempUploadImage = null;
      const previews = modal.querySelectorAll('.upload-preview-container');
      previews.forEach(p => p.innerHTML = '');
    }
  }

  closeModal(modalId) {
    const modal = modalId ? document.getElementById(modalId) : this.activeModal;
    if (modal) {
      modal.classList.remove('active');
    }
    this.activeModal = null;
    this.tempUploadImage = null;
  }

  // Edit Student Profile Modal
  openEditProfileModal() {
    const data = window.appStorage.getData().student;
    document.getElementById('edit-student-name').value = data.fullName || '';
    document.getElementById('edit-student-id').value = data.studentId || '';
    document.getElementById('edit-student-major').value = data.major || '';
    document.getElementById('edit-student-faculty').value = data.faculty || '';
    document.getElementById('edit-student-uni').value = data.university || '';
    document.getElementById('edit-student-status').value = data.status || 'กำลังปฏิบัติการสอนในสถานศึกษา';
    document.getElementById('edit-student-quote').value = data.quote || '';
    document.getElementById('edit-student-bio').value = data.bio || '';
    document.getElementById('edit-student-tags').value = (data.tags || []).join(', ');
    document.getElementById('edit-student-hours-done').value = data.completedHours || 0;
    document.getElementById('edit-student-hours-total').value = data.totalHours || 360;
    document.getElementById('edit-student-plans').value = data.lessonPlansCount || 0;
    document.getElementById('edit-student-classes').value = data.classesTaught || '';
    document.getElementById('edit-student-email').value = data.email || '';
    document.getElementById('edit-student-phone').value = data.phone || '';

    this.openModal('edit-profile-modal');
  }

  saveStudentProfile(e) {
    e.preventDefault();
    const data = window.appStorage.getData();
    
    data.student.fullName = document.getElementById('edit-student-name').value;
    data.student.studentId = document.getElementById('edit-student-id').value;
    data.student.major = document.getElementById('edit-student-major').value;
    data.student.faculty = document.getElementById('edit-student-faculty').value;
    data.student.university = document.getElementById('edit-student-uni').value;
    data.student.status = document.getElementById('edit-student-status').value;
    data.student.quote = document.getElementById('edit-student-quote').value;
    data.student.bio = document.getElementById('edit-student-bio').value;

    const rawTags = document.getElementById('edit-student-tags').value;
    data.student.tags = rawTags.split(',').map(t => t.trim()).filter(t => t.length > 0);

    data.student.completedHours = parseInt(document.getElementById('edit-student-hours-done').value) || 0;
    data.student.totalHours = parseInt(document.getElementById('edit-student-hours-total').value) || 360;
    data.student.lessonPlansCount = parseInt(document.getElementById('edit-student-plans').value) || 0;
    data.student.classesTaught = document.getElementById('edit-student-classes').value;
    data.student.email = document.getElementById('edit-student-email').value;
    data.student.phone = document.getElementById('edit-student-phone').value;

    if (this.tempUploadImage) {
      data.student.avatar = this.tempUploadImage;
    }

    window.appStorage.saveData(data);
    this.renderStudentProfile(data.student);
    this.closeModal('edit-profile-modal');
    window.showToast('บันทึกข้อมูลโปรไฟล์เรียบร้อยแล้ว', 'success');
  }

  // Edit Competencies Modal
  openEditCompetenciesModal() {
    const data = window.appStorage.getData();
    const comps = data.competencies || [];

    document.getElementById('edit-comp-1-title').value = comps[0]?.title || '';
    document.getElementById('edit-comp-1-desc').value = comps[0]?.desc || '';
    document.getElementById('edit-comp-2-title').value = comps[1]?.title || '';
    document.getElementById('edit-comp-2-desc').value = comps[1]?.desc || '';
    document.getElementById('edit-comp-3-title').value = comps[2]?.title || '';
    document.getElementById('edit-comp-3-desc').value = comps[2]?.desc || '';

    this.openModal('edit-competencies-modal');
  }

  saveCompetencies(e) {
    e.preventDefault();
    const data = window.appStorage.getData();
    data.competencies = [
      {
        id: 'comp-1',
        title: document.getElementById('edit-comp-1-title').value,
        desc: document.getElementById('edit-comp-1-desc').value,
        icon: 'fa-brain',
        color: 'var(--primary-500)'
      },
      {
        id: 'comp-2',
        title: document.getElementById('edit-comp-2-title').value,
        desc: document.getElementById('edit-comp-2-desc').value,
        icon: 'fa-laptop-code',
        color: 'var(--accent-purple)'
      },
      {
        id: 'comp-3',
        title: document.getElementById('edit-comp-3-title').value,
        desc: document.getElementById('edit-comp-3-desc').value,
        icon: 'fa-users',
        color: 'var(--accent-emerald)'
      }
    ];

    window.appStorage.saveData(data);
    this.renderCompetencies(data.competencies);
    this.closeModal('edit-competencies-modal');
    window.showToast('บันทึกสมรรถนะผู้เรียนเรียบร้อยแล้ว', 'success');
  }

  // Edit School Modal
  openEditSchoolModal() {
    const data = window.appStorage.getData().school;
    document.getElementById('edit-school-name-th').value = data.nameTh || '';
    document.getElementById('edit-school-name-en').value = data.nameEn || '';
    document.getElementById('edit-school-motto').value = data.motto || '';
    document.getElementById('edit-school-vision').value = data.vision || '';
    document.getElementById('edit-school-address').value = data.address || '';
    document.getElementById('edit-school-director').value = data.director || '';
    document.getElementById('edit-school-phone').value = data.phone || '';
    document.getElementById('edit-school-email').value = data.email || '';
    document.getElementById('edit-school-website').value = data.website || '';
    document.getElementById('edit-school-affiliation').value = data.affiliation || 'สังกัด สพฐ. / สกอ.';
    document.getElementById('edit-school-map').value = data.mapUrl || '';

    this.openModal('edit-school-modal');
  }

  saveSchoolProfile(e) {
    e.preventDefault();
    const data = window.appStorage.getData();

    data.school.nameTh = document.getElementById('edit-school-name-th').value;
    data.school.nameEn = document.getElementById('edit-school-name-en').value;
    data.school.motto = document.getElementById('edit-school-motto').value;
    data.school.vision = document.getElementById('edit-school-vision').value;
    data.school.address = document.getElementById('edit-school-address').value;
    data.school.director = document.getElementById('edit-school-director').value;
    data.school.phone = document.getElementById('edit-school-phone').value;
    data.school.email = document.getElementById('edit-school-email').value;
    data.school.website = document.getElementById('edit-school-website').value;
    data.school.affiliation = document.getElementById('edit-school-affiliation').value;
    data.school.mapUrl = document.getElementById('edit-school-map').value;

    if (this.tempUploadImage) {
      data.school.badge = this.tempUploadImage;
    }

    window.appStorage.saveData(data);
    this.renderSchoolProfile(data.school);
    this.closeModal('edit-school-modal');
    window.showToast('บันทึกข้อมูลสถานศึกษาเรียบร้อยแล้ว', 'success');
  }

  // Mentors Modal (Add / Edit / Delete)
  openAddMentorModal() {
    document.getElementById('edit-mentor-id').value = '';
    document.getElementById('edit-mentor-name').value = '';
    document.getElementById('edit-mentor-role-title').value = 'ครูพี่เลี้ยง (Mentor Teacher)';
    document.getElementById('edit-mentor-role-type').value = 'mentor';
    document.getElementById('edit-mentor-position').value = 'ครูชำนาญการพิเศษ';
    document.getElementById('edit-mentor-dept').value = 'กลุ่มสาระฯ วิทยาศาสตร์และเทคโนโลยี';
    document.getElementById('edit-mentor-comment').value = '';
    document.getElementById('edit-mentor-phone').value = '';
    document.getElementById('edit-mentor-email').value = '';
    document.getElementById('mentor-modal-title').innerHTML = '<i class="fas fa-user-plus"></i> เพิ่มครูพี่เลี้ยง / อาจารย์นิเทศก์';

    this.openModal('edit-mentor-modal');
  }

  editMentor(mentorId) {
    const data = window.appStorage.getData();
    const mentor = (data.mentors || []).find(m => m.id === mentorId);
    if (!mentor) return;

    document.getElementById('edit-mentor-id').value = mentor.id;
    document.getElementById('edit-mentor-name').value = mentor.name;
    document.getElementById('edit-mentor-role-title').value = mentor.roleTitle;
    document.getElementById('edit-mentor-role-type').value = mentor.roleType || 'mentor';
    document.getElementById('edit-mentor-position').value = mentor.position;
    document.getElementById('edit-mentor-dept').value = mentor.department;
    document.getElementById('edit-mentor-comment').value = mentor.comment || '';
    document.getElementById('edit-mentor-phone').value = mentor.phone || '';
    document.getElementById('edit-mentor-email').value = mentor.email || '';
    document.getElementById('mentor-modal-title').innerHTML = '<i class="fas fa-user-edit"></i> แก้ไขข้อมูลครูพี่เลี้ยง / อาจารย์นิเทศก์';

    this.openModal('edit-mentor-modal');
  }

  saveMentor(e) {
    e.preventDefault();
    const data = window.appStorage.getData();
    if (!data.mentors) data.mentors = [];

    const mentorId = document.getElementById('edit-mentor-id').value;
    const name = document.getElementById('edit-mentor-name').value;
    const roleTitle = document.getElementById('edit-mentor-role-title').value;
    const roleType = document.getElementById('edit-mentor-role-type').value;
    const position = document.getElementById('edit-mentor-position').value;
    const department = document.getElementById('edit-mentor-dept').value;
    const comment = document.getElementById('edit-mentor-comment').value;
    const phone = document.getElementById('edit-mentor-phone').value;
    const email = document.getElementById('edit-mentor-email').value;

    if (mentorId) {
      const mentor = data.mentors.find(m => m.id === mentorId);
      if (mentor) {
        mentor.name = name;
        mentor.roleTitle = roleTitle;
        mentor.roleType = roleType;
        mentor.position = position;
        mentor.department = department;
        mentor.comment = comment;
        mentor.phone = phone;
        mentor.email = email;
        if (this.tempUploadImage) mentor.avatar = this.tempUploadImage;
      }
    } else {
      data.mentors.push({
        id: 'mentor-' + Date.now(),
        name,
        roleTitle,
        roleType,
        position,
        department,
        comment,
        phone,
        email,
        avatar: this.tempUploadImage || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=500&q=80'
      });
    }

    window.appStorage.saveData(data);
    this.renderMentors(data.mentors);
    this.closeModal('edit-mentor-modal');
    window.showToast('บันทึกข้อมูลครูพี่เลี้ยง/อาจารย์นิเทศก์เรียบร้อย', 'success');
  }

  deleteMentor(mentorId) {
    if (confirm('คุณต้องการลบข้อมูลครูพี่เลี้ยง/อาจารย์นิเทศก์ท่านนี้ใช่หรือไม่?')) {
      const data = window.appStorage.getData();
      data.mentors = (data.mentors || []).filter(m => m.id !== mentorId);
      window.appStorage.saveData(data);
      this.renderMentors(data.mentors);
      window.showToast('ลบข้อมูลเรียบร้อยแล้ว', 'info');
    }
  }

  // Student Showcase Modals (Add / Edit / Delete)
  openAddShowcaseModal() {
    document.getElementById('edit-sc-id').value = '';
    document.getElementById('edit-sc-title').value = '';
    document.getElementById('edit-sc-students').value = '';
    document.getElementById('edit-sc-award').value = '';
    document.getElementById('showcase-modal-title').innerHTML = '<i class="fas fa-plus-circle"></i> เพิ่มผลงานนักเรียน & ชิ้นงานเด่น';

    this.openModal('edit-showcase-modal');
  }

  editShowcase(scId) {
    const data = window.appStorage.getData();
    const sc = (data.studentShowcases || []).find(s => s.id === scId);
    if (!sc) return;

    document.getElementById('edit-sc-id').value = sc.id;
    document.getElementById('edit-sc-title').value = sc.title;
    document.getElementById('edit-sc-students').value = sc.studentNames;
    document.getElementById('edit-sc-award').value = sc.award;
    document.getElementById('showcase-modal-title').innerHTML = '<i class="fas fa-edit"></i> แก้ไขผลงานนักเรียน';

    this.openModal('edit-showcase-modal');
  }

  saveShowcase(e) {
    e.preventDefault();
    const data = window.appStorage.getData();
    if (!data.studentShowcases) data.studentShowcases = [];

    const scId = document.getElementById('edit-sc-id').value;
    const title = document.getElementById('edit-sc-title').value;
    const studentNames = document.getElementById('edit-sc-students').value;
    const award = document.getElementById('edit-sc-award').value;

    if (scId) {
      const sc = data.studentShowcases.find(s => s.id === scId);
      if (sc) {
        sc.title = title;
        sc.studentNames = studentNames;
        sc.award = award;
        if (this.tempUploadImage) sc.image = this.tempUploadImage;
      }
    } else {
      data.studentShowcases.push({
        id: 'sc-' + Date.now(),
        title,
        studentNames,
        award,
        image: this.tempUploadImage || 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=600&q=80'
      });
    }

    window.appStorage.saveData(data);
    this.renderStudentShowcases(data.studentShowcases);
    this.closeModal('edit-showcase-modal');
    window.showToast('บันทึกผลงานนักเรียนเรียบร้อยแล้ว', 'success');
  }

  deleteShowcase(scId) {
    if (confirm('คุณต้องการลบผลงานนักเรียนนี้ใช่หรือไม่?')) {
      const data = window.appStorage.getData();
      data.studentShowcases = (data.studentShowcases || []).filter(s => s.id !== scId);
      window.appStorage.saveData(data);
      this.renderStudentShowcases(data.studentShowcases);
      window.showToast('ลบผลงานนักเรียนเรียบร้อย', 'info');
    }
  }

  // Reset to default sample data
  resetToDefaults() {
    if (confirm('คำเตือน: คุณต้องการรีเซ็ตข้อมูลทั้งหมดกลับเป็นค่าเริ่มต้น (Demo Data) ใช่หรือไม่?')) {
      window.appStorage.resetDefaults();
      this.renderAll();
      window.showToast('รีเซ็ตข้อมูลทั้งหมดเป็นค่าเริ่มต้นเรียบร้อย', 'success');
    }
  }

  triggerImportJSON() {
    const input = document.getElementById('import-json-input');
    if (input) input.click();
  }

  // Faculty Directory Modals
  openAddFacultyModal() {
    document.getElementById('edit-fac-id').value = '';
    document.getElementById('edit-fac-name').value = '';
    document.getElementById('edit-fac-position').value = '';
    document.getElementById('edit-fac-dept').value = 'วิทยาศาสตร์และเทคโนโลยี';
    document.getElementById('edit-fac-phone').value = '';
    document.getElementById('edit-fac-email').value = '';
    document.getElementById('faculty-modal-title').innerHTML = '<i class="fas fa-user-plus"></i> เพิ่มครูอาจารย์ในทำเนียบ';

    this.openModal('edit-faculty-modal');
  }

  editFaculty(facId) {
    const data = window.appStorage.getData();
    const fac = (data.faculty || []).find(f => f.id === facId);
    if (!fac) return;

    document.getElementById('edit-fac-id').value = fac.id;
    document.getElementById('edit-fac-name').value = fac.name;
    document.getElementById('edit-fac-position').value = fac.position;
    document.getElementById('edit-fac-dept').value = fac.department;
    document.getElementById('edit-fac-phone').value = fac.phone || '';
    document.getElementById('edit-fac-email').value = fac.email || '';
    document.getElementById('faculty-modal-title').innerHTML = '<i class="fas fa-user-edit"></i> แก้ไขข้อมูลครูอาจารย์';

    this.openModal('edit-faculty-modal');
  }

  saveFaculty(e) {
    e.preventDefault();
    const data = window.appStorage.getData();
    if (!data.faculty) data.faculty = [];

    const facId = document.getElementById('edit-fac-id').value;
    const name = document.getElementById('edit-fac-name').value;
    const position = document.getElementById('edit-fac-position').value;
    const department = document.getElementById('edit-fac-dept').value;
    const phone = document.getElementById('edit-fac-phone').value;
    const email = document.getElementById('edit-fac-email').value;

    if (facId) {
      const fac = data.faculty.find(f => f.id === facId);
      if (fac) {
        fac.name = name;
        fac.position = position;
        fac.department = department;
        fac.phone = phone;
        fac.email = email;
        if (this.tempUploadImage) fac.avatar = this.tempUploadImage;
      }
    } else {
      data.faculty.push({
        id: 'fac-' + Date.now(),
        name,
        position,
        department,
        phone,
        email,
        avatar: this.tempUploadImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'
      });
    }

    window.appStorage.saveData(data);
    this.renderFaculty();
    this.closeModal('edit-faculty-modal');
    window.showToast('บันทึกทำเนียบครูอาจารย์สำเร็จ', 'success');
  }

  deleteFaculty(facId) {
    if (confirm('คุณต้องการลบครูอาจารย์ท่านนี้ออกจากทำเนียบใช่หรือไม่?')) {
      const data = window.appStorage.getData();
      data.faculty = (data.faculty || []).filter(f => f.id !== facId);
      window.appStorage.saveData(data);
      this.renderFaculty();
      window.showToast('ลบข้อมูลเรียบร้อยแล้ว', 'info');
    }
  }

  // Photo Gallery Modals
  openAddGalleryModal() {
    document.getElementById('edit-gal-id').value = '';
    document.getElementById('edit-gal-title').value = '';
    document.getElementById('edit-gal-category').value = 'การสอนในห้อง';
    document.getElementById('edit-gal-date').value = new Date().toLocaleDateString('th-TH', { year:'numeric', month:'short', day:'numeric' });
    document.getElementById('edit-gal-desc').value = '';
    document.getElementById('gallery-modal-title').innerHTML = '<i class="fas fa-cloud-upload-alt"></i> อัปโหลดรูปภาพกิจกรรมใหม่';

    this.openModal('edit-gallery-modal');
  }

  editGalleryItem(galId) {
    const data = window.appStorage.getData();
    const item = (data.gallery || []).find(g => g.id === galId);
    if (!item) return;

    document.getElementById('edit-gal-id').value = item.id;
    document.getElementById('edit-gal-title').value = item.title;
    document.getElementById('edit-gal-category').value = item.category;
    document.getElementById('edit-gal-date').value = item.date;
    document.getElementById('edit-gal-desc').value = item.description || '';
    document.getElementById('gallery-modal-title').innerHTML = '<i class="fas fa-edit"></i> แก้ไขข้อมูลภาพกิจกรรม';

    this.openModal('edit-gallery-modal');
  }

  saveGalleryItem(e) {
    e.preventDefault();
    const data = window.appStorage.getData();
    if (!data.gallery) data.gallery = [];

    const galId = document.getElementById('edit-gal-id').value;
    const title = document.getElementById('edit-gal-title').value;
    const category = document.getElementById('edit-gal-category').value;
    const date = document.getElementById('edit-gal-date').value;
    const description = document.getElementById('edit-gal-desc').value;

    if (galId) {
      const item = data.gallery.find(g => g.id === galId);
      if (item) {
        item.title = title;
        item.category = category;
        item.date = date;
        item.description = description;
        if (this.tempUploadImage) item.url = this.tempUploadImage;
      }
    } else {
      if (!this.tempUploadImage) {
        window.showToast('กรุณาเลือกรูปภาพที่ต้องการอัปโหลด', 'error');
        return;
      }
      data.gallery.unshift({
        id: 'gal-' + Date.now(),
        title,
        category,
        date,
        description,
        url: this.tempUploadImage
      });
    }

    window.appStorage.saveData(data);
    window.appGallery.renderGallery(data.gallery);
    this.closeModal('edit-gallery-modal');
    window.showToast('บันทึกรูปภาพกิจกรรมเรียบร้อยแล้ว', 'success');
  }

  deleteGalleryItem(galId) {
    if (confirm('คุณต้องการลบรูปภาพนี้ใช่หรือไม่?')) {
      const data = window.appStorage.getData();
      data.gallery = (data.gallery || []).filter(g => g.id !== galId);
      window.appStorage.saveData(data);
      window.appGallery.renderGallery(data.gallery);
      window.showToast('ลบรูปภาพเรียบร้อยแล้ว', 'info');
    }
  }

  // Teaching Logs Modals
  openAddLogModal() {
    this.tempUploadPdf = null;
    document.getElementById('edit-log-id').value = '';
    document.getElementById('edit-log-week').value = `สัปดาห์ที่ ${(window.appStorage.getData().teachingLogs || []).length + 1}`;
    document.getElementById('edit-log-date').value = new Date().toLocaleDateString('th-TH', { year:'numeric', month:'short', day:'numeric' });
    document.getElementById('edit-log-subject').value = 'วิทยาการคำนวณ (ว21103)';
    document.getElementById('edit-log-grade').value = 'มัธยมศึกษาปีที่ 1';
    document.getElementById('edit-log-title').value = '';
    document.getElementById('edit-log-desc').value = '';
    document.getElementById('edit-log-hours').value = 4;
    document.getElementById('edit-log-status').value = 'ผ่านการประเมิน';
    document.getElementById('edit-log-planlink').value = '';
    document.getElementById('edit-log-objectives').value = '1. นักเรียนสามารถอธิบายหลักการและกระบวนการทำงานได้ถูกต้อง\n2. นักเรียนสามารถประยุกต์ใช้ทักษะการแก้ปัญหาในสถานการณ์จริงได้';
    document.getElementById('edit-log-steps').value = '• ขั้นนำ (10 นาที): กระตุ้นความสนใจ\n• ขั้นสอน (35 นาที): กิจกรรม Active Learning\n• ขั้นสรุป (15 นาที): สรุปองค์ความรู้';

    const pdfStatus = document.getElementById('pdf-preview-status');
    if (pdfStatus) pdfStatus.innerHTML = '';

    this.openModal('edit-log-modal');
  }

  editLog(logId) {
    this.tempUploadPdf = null;
    const data = window.appStorage.getData();
    const log = (data.teachingLogs || []).find(l => l.id === logId);
    if (!log) return;

    document.getElementById('edit-log-id').value = log.id;
    document.getElementById('edit-log-week').value = log.week;
    document.getElementById('edit-log-date').value = log.date;
    document.getElementById('edit-log-subject').value = log.subject;
    document.getElementById('edit-log-grade').value = log.grade;
    document.getElementById('edit-log-title').value = log.title;
    document.getElementById('edit-log-desc').value = log.description;
    document.getElementById('edit-log-hours').value = log.hours || 4;
    document.getElementById('edit-log-status').value = log.status || 'ผ่านการประเมิน';
    document.getElementById('edit-log-planlink').value = log.planLink || '';
    document.getElementById('edit-log-objectives').value = log.objectives || '';
    document.getElementById('edit-log-steps').value = log.steps || '';

    const pdfStatus = document.getElementById('pdf-preview-status');
    if (pdfStatus) {
      if (log.pdfDataUrl) {
        pdfStatus.innerHTML = `<span style="color:var(--accent-emerald); font-weight:600;"><i class="fas fa-file-pdf"></i> มีไฟล์ PDF แนบอยู่แล้ว (อัปโหลดใหม่เพื่อแทนที่)</span>`;
      } else {
        pdfStatus.innerHTML = '';
      }
    }

    this.openModal('edit-log-modal');
  }

  saveLog(e) {
    e.preventDefault();
    const data = window.appStorage.getData();
    if (!data.teachingLogs) data.teachingLogs = [];

    const logId = document.getElementById('edit-log-id').value;
    const week = document.getElementById('edit-log-week').value;
    const date = document.getElementById('edit-log-date').value;
    const subject = document.getElementById('edit-log-subject').value;
    const grade = document.getElementById('edit-log-grade').value;
    const title = document.getElementById('edit-log-title').value;
    const description = document.getElementById('edit-log-desc').value;
    const hours = parseInt(document.getElementById('edit-log-hours').value) || 4;
    const status = document.getElementById('edit-log-status').value;
    const planLink = document.getElementById('edit-log-planlink').value.trim();
    const objectives = document.getElementById('edit-log-objectives').value;
    const steps = document.getElementById('edit-log-steps').value;

    if (logId) {
      const log = data.teachingLogs.find(l => l.id === logId);
      if (log) {
        log.week = week;
        log.date = date;
        log.subject = subject;
        log.grade = grade;
        log.title = title;
        log.description = description;
        log.hours = hours;
        log.status = status;
        log.planLink = planLink;
        log.objectives = objectives;
        log.steps = steps;
        if (this.tempUploadPdf) {
          log.pdfDataUrl = this.tempUploadPdf;
        }
      }
    } else {
      data.teachingLogs.unshift({
        id: 'log-' + Date.now(),
        week,
        date,
        subject,
        grade,
        title,
        description,
        hours,
        status,
        planLink,
        objectives,
        steps,
        pdfDataUrl: this.tempUploadPdf || null
      });
    }

    window.appStorage.saveData(data);
    this.renderTeachingLogs(data.teachingLogs);
    this.closeModal('edit-log-modal');
    window.showToast('บันทึกแผนและไฟล์ PDF เรียบร้อยแล้ว', 'success');
  }

  deleteLog(logId) {
    if (confirm('คุณต้องการลบบันทึกการสอนนี้ใช่หรือไม่?')) {
      const data = window.appStorage.getData();
      data.teachingLogs = (data.teachingLogs || []).filter(l => l.id !== logId);
      window.appStorage.saveData(data);
      this.renderTeachingLogs(data.teachingLogs);
      window.showToast('ลบบันทึกการสอนเรียบร้อย', 'info');
    }
  }

  // Dropzone initialization for image and PDF file inputs
  initDropzones() {
    const dropzones = document.querySelectorAll('.upload-dropzone');
    dropzones.forEach(zone => {
      const fileInput = zone.querySelector('input[type="file"]');
      const isPdf = fileInput && (fileInput.accept.includes('.pdf') || fileInput.id === 'edit-log-pdffile');
      const previewContainer = isPdf ? document.getElementById('pdf-preview-status') : zone.nextElementSibling;

      zone.addEventListener('click', () => {
        if (fileInput) fileInput.click();
      });

      zone.addEventListener('dragover', (e) => {
        e.preventDefault();
        zone.classList.add('dragover');
      });

      zone.addEventListener('dragleave', () => {
        zone.classList.remove('dragover');
      });

      zone.addEventListener('drop', async (e) => {
        e.preventDefault();
        zone.classList.remove('dragover');
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
          const file = e.dataTransfer.files[0];
          if (isPdf || file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
            await this.handlePdfFile(file, previewContainer);
          } else {
            await this.handleImageFile(file, previewContainer);
          }
        }
      });

      if (fileInput) {
        fileInput.addEventListener('change', async (e) => {
          if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (isPdf || file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
              await this.handlePdfFile(file, previewContainer);
            } else {
              await this.handleImageFile(file, previewContainer);
            }
          }
        });
      }
    });
  }

  async handlePdfFile(file, statusContainer) {
    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      window.showToast('กรุณาเลือกไฟล์ PDF เท่านั้น', 'error');
      return;
    }

    try {
      if (window.appGDrive && window.appGDrive.isConfigured()) {
        window.showToast('☁️ กำลังอัปโหลดไฟล์ PDF ไปยัง Google Drive...', 'info');
      }

      const uploadedUrl = await window.appGDrive.uploadFile(file, 'ClassMate_Lesson_Plans');
      this.tempUploadPdf = uploadedUrl;

      if (statusContainer) {
        statusContainer.innerHTML = `
          <div style="background:rgba(16,185,129,0.12); padding:0.6rem 0.8rem; border-radius:var(--radius-md); border:1px solid rgba(16,185,129,0.3); color:var(--accent-emerald); font-size:0.85rem; display:flex; align-items:center; gap:0.5rem;">
            <i class="fas fa-file-pdf" style="font-size:1.1rem; color:#ef4444;"></i>
            <span>แนบไฟล์ PDF: <strong>${file.name}</strong> (${(file.size / (1024 * 1024)).toFixed(2)} MB) เรียบร้อยแล้ว</span>
          </div>
        `;
      }

      if (window.appGDrive && window.appGDrive.isConfigured()) {
        window.showToast(`✅ อัปโหลดไฟล์ "${file.name}" บันทึกลง Google Drive สำเร็จ!`, 'success');
      } else {
        window.showToast(`โหลดไฟล์ PDF "${file.name}" สำเร็จแล้ว`, 'success');
      }
    } catch (err) {
      console.error(err);
      window.showToast('เกิดข้อผิดพลาดในการโหลดไฟล์ PDF', 'error');
    }
  }

  async handleImageFile(file, previewContainer) {
    if (!file.type.startsWith('image/')) {
      window.showToast('กรุณาเลือกไฟล์รูปภาพเท่านั้น (JPG, PNG, WebP)', 'error');
      return;
    }

    try {
      if (window.appGDrive && window.appGDrive.isConfigured()) {
        window.showToast('☁️ กำลังอัปโหลดรูปภาพไปยัง Google Drive...', 'info');
      }

      const uploadedUrl = await window.appGDrive.uploadFile(file, 'ClassMate_Photos');
      this.tempUploadImage = uploadedUrl;

      if (previewContainer) {
        previewContainer.innerHTML = `
          <img src="${uploadedUrl}" class="upload-preview-img" alt="Preview" />
          <span style="font-size:0.8rem; color:var(--accent-emerald);"><i class="fas fa-check-circle"></i> อัปโหลดรูปภาพสำเร็จแล้ว</span>
        `;
      }

      if (window.appGDrive && window.appGDrive.isConfigured()) {
        window.showToast(`✅ บันทึกรูปลง Google Drive เรียบร้อยแล้ว!`, 'success');
      } else {
        window.showToast('โหลดรูปภาพเรียบร้อยแล้ว', 'success');
      }
    } catch (err) {
      console.error(err);
      window.showToast('เกิดข้อผิดพลาดในการโหลดรูปภาพ', 'error');
    }
  }

  // Google Drive Settings Modal Handlers
  openGDriveModal() {
    const codeBlock = document.getElementById('gdrive-code-block');
    if (codeBlock && window.appGDrive) {
      codeBlock.value = window.appGDrive.getAppsScriptCode();
    }

    const input = document.getElementById('gdrive-script-url-input');
    if (input && window.appGDrive) {
      input.value = window.appGDrive.getScriptUrl();
    }

    this.updateGDriveStatusUI();
    this.openModal('gdrive-settings-modal');
  }

  updateGDriveStatusUI() {
    const statusEl = document.getElementById('gdrive-connection-status');
    if (!statusEl || !window.appGDrive) return;

    if (window.appGDrive.isConfigured()) {
      statusEl.innerHTML = '<span style="color:var(--accent-emerald); font-weight:600;"><i class="fas fa-check-circle"></i> สถานะ: เชื่อมต่อ Google Drive อัตโนมัติแล้ว (พร้อมใช้งาน)</span>';
    } else {
      statusEl.innerHTML = '<span style="color:var(--text-muted);"><i class="fas fa-info-circle"></i> สถานะ: ยังไม่ได้เชื่อมต่อ (ระบบจะบันทึกรูปและไฟล์ในเครื่อง LocalStorage ตามปกติ)</span>';
    }
  }

  saveGDriveUrl(e) {
    e.preventDefault();
    const url = document.getElementById('gdrive-script-url-input').value.trim();
    if (window.appGDrive) {
      window.appGDrive.setScriptUrl(url);
      this.updateGDriveStatusUI();
      window.showToast('บันทึกการตั้งค่า Google Drive สำเร็จแล้ว!', 'success');
      setTimeout(() => this.closeModal('gdrive-settings-modal'), 800);
    }
  }

  copyGDriveCode() {
    if (!window.appGDrive) return;
    const code = window.appGDrive.getAppsScriptCode();
    navigator.clipboard.writeText(code).then(() => {
      window.showToast('คัดลอกโค้ด Google Apps Script เรียบร้อยแล้ว!', 'success');
    }).catch(() => {
      const codeBlock = document.getElementById('gdrive-code-block');
      if (codeBlock) {
        codeBlock.select();
        document.execCommand('copy');
        window.showToast('คัดลอกโค้ดสคริปต์เรียบร้อยแล้ว!', 'success');
      }
    });
  }

  // Authentication UI & Modal Handlers
  updateAuthUI() {
    const loginBtn = document.getElementById('login-nav-btn');
    const userPill = document.getElementById('user-logged-pill');
    const userName = document.getElementById('user-logged-name');

    if (!window.appAuth) return;

    if (window.appAuth.isLoggedIn()) {
      const u = window.appAuth.getCurrentUser();
      if (loginBtn) loginBtn.style.display = 'none';
      if (userPill) userPill.style.display = 'flex';
      if (userName) userName.innerText = u.fullName || u.studentId;
    } else {
      if (loginBtn) loginBtn.style.display = 'inline-flex';
      if (userPill) userPill.style.display = 'none';
    }

    // Check if viewing someone else's portfolio via URL
    const urlParams = new URLSearchParams(window.location.search);
    const urlId = urlParams.get('id') || urlParams.get('user');
    if (urlId && (!window.appAuth.isLoggedIn() || window.appAuth.getCurrentUser().studentId !== urlId)) {
      window.appShare.setPublicMode(true);
    }
  }

  openAuthModal() {
    if (!window.appAuth) return;

    if (window.appAuth.isLoggedIn()) {
      const u = window.appAuth.getCurrentUser();
      document.getElementById('auth-current-name').innerText = u.fullName;
      document.getElementById('auth-current-id').innerText = `รหัสนักศึกษา: ${u.studentId}`;
      document.getElementById('auth-current-major').innerText = `${u.major} • ${u.faculty}`;

      document.getElementById('auth-login-section').style.display = 'none';
      document.getElementById('auth-register-section').style.display = 'none';
      document.getElementById('auth-profile-section').style.display = 'block';

      document.getElementById('auth-tab-btn-login').style.display = 'none';
      document.getElementById('auth-tab-btn-register').style.display = 'none';
    } else {
      document.getElementById('auth-tab-btn-login').style.display = 'inline-flex';
      document.getElementById('auth-tab-btn-register').style.display = 'inline-flex';
      this.switchAuthTab('login');
    }

    this.openModal('auth-modal');
  }

  switchAuthTab(tab) {
    const loginSec = document.getElementById('auth-login-section');
    const regSec = document.getElementById('auth-register-section');
    const profSec = document.getElementById('auth-profile-section');
    const tabLogin = document.getElementById('auth-tab-btn-login');
    const tabReg = document.getElementById('auth-tab-btn-register');

    if (profSec) profSec.style.display = 'none';

    if (tab === 'login') {
      if (loginSec) loginSec.style.display = 'block';
      if (regSec) regSec.style.display = 'none';
      if (tabLogin) tabLogin.className = 'btn btn-sm btn-primary';
      if (tabReg) tabReg.className = 'btn btn-sm btn-outline';
    } else {
      if (loginSec) loginSec.style.display = 'none';
      if (regSec) regSec.style.display = 'block';
      if (tabLogin) tabLogin.className = 'btn btn-sm btn-outline';
      if (tabReg) tabReg.className = 'btn btn-sm btn-primary';
    }
  }

  handleLogin(e) {
    e.preventDefault();
    const studentId = document.getElementById('login-student-id').value;
    const password = document.getElementById('login-password').value;

    const res = window.appAuth.login(studentId, password);
    if (res.success) {
      this.closeModal('auth-modal');
      this.updateAuthUI();
      this.renderAll();
      window.showToast(`ยินดีต้อนรับคุณ ${res.user.fullName}! เข้าสู่ระบบเรียบร้อย`, 'success');
    } else {
      window.showToast(res.message, 'error');
    }
  }

  handleRegister(e) {
    e.preventDefault();
    const studentData = {
      studentId: document.getElementById('reg-student-id').value,
      fullName: document.getElementById('reg-student-name').value,
      major: document.getElementById('reg-student-major').value,
      faculty: document.getElementById('reg-student-faculty').value,
      university: document.getElementById('reg-student-uni').value
    };
    const password = document.getElementById('reg-password').value;

    const res = window.appAuth.register(studentData, password);
    if (res.success) {
      this.closeModal('auth-modal');
      this.updateAuthUI();
      this.renderAll();
      window.showToast(`สร้างบัญชีพอร์ตโฟลิโอสำหรับคุณ ${res.user.fullName} สำเร็จแล้ว!`, 'success');
    } else {
      window.showToast(res.message, 'error');
    }
  }
}

// Global Toast System
window.showToast = function(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  let icon = 'info-circle';
  if (type === 'success') icon = 'check-circle';
  if (type === 'error') icon = 'exclamation-circle';

  toast.innerHTML = `<i class="fas fa-${icon}"></i> <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
};

window.app = new AppController();
