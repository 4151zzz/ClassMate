/**
 * ClassMate Practicum - Cyber FX & Rich Animations Engine
 * (Interactive Particle Mesh, 3D Tilt Spotlight, Scramble Decode Text, Counter-Up, Click Ripples)
 */

class CyberFXEngine {
  constructor() {
    this.canvas = document.getElementById('ambient-canvas');
    this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
    this.particles = [];
    this.mouse = { x: -1000, y: -1000, radius: 140 };
    this.isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    document.addEventListener('DOMContentLoaded', () => {
      this.init();
    });
  }

  init() {
    if (!this.isReducedMotion && this.canvas && this.ctx) {
      this.initParticleCanvas();
    }
    this.initSpotlightTilt();
    this.initClickRipples();
    this.initSceneTextDecode();
    this.initNumberCounters();
  }

  // ==========================================
  // 1. Interactive Cyber Particle Mesh
  // ==========================================
  initParticleCanvas() {
    const resize = () => {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
      this.createParticles();
    };

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    });

    window.addEventListener('mouseout', () => {
      this.mouse.x = -1000;
      this.mouse.y = -1000;
    });

    resize();
    this.animateParticles();
  }

  createParticles() {
    this.particles = [];
    const count = Math.min(Math.floor((this.canvas.width * this.canvas.height) / 18000), 75);
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        size: Math.random() * 2 + 1,
        color: Math.random() > 0.4 ? 'rgba(0, 240, 255, ' : 'rgba(56, 189, 248, ',
        baseAlpha: Math.random() * 0.4 + 0.2
      });
    }
  }

  animateParticles() {
    if (!this.ctx) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];

      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0 || p.x > this.canvas.width) p.vx *= -1;
      if (p.y < 0 || p.y > this.canvas.height) p.vy *= -1;

      // Mouse distance repulsion
      const dx = this.mouse.x - p.x;
      const dy = this.mouse.y - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < this.mouse.radius) {
        const force = (this.mouse.radius - dist) / this.mouse.radius;
        p.x -= (dx / dist) * force * 2;
        p.y -= (dy / dist) * force * 2;
      }

      // Draw particle
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fillStyle = p.color + p.baseAlpha + ')';
      this.ctx.shadowBlur = 8;
      this.ctx.shadowColor = '#00f0ff';
      this.ctx.fill();

      // Connect near particles
      for (let j = i + 1; j < this.particles.length; j++) {
        const p2 = this.particles[j];
        const pdist = Math.hypot(p.x - p2.x, p.y - p2.y);
        if (pdist < 130) {
          const alpha = (1 - pdist / 130) * 0.22;
          this.ctx.beginPath();
          this.ctx.strokeStyle = `rgba(0, 240, 255, ${alpha})`;
          this.ctx.lineWidth = 0.75;
          this.ctx.moveTo(p.x, p.y);
          this.ctx.lineTo(p2.x, p2.y);
          this.ctx.stroke();
        }
      }
    }

    requestAnimationFrame(() => this.animateParticles());
  }

  // ==========================================
  // 2. 3D Tilt & Cursor Spotlight Tracker
  // ==========================================
  initSpotlightTilt() {
    const cards = document.querySelectorAll('.card, .stat-box, .hero-profile-card, .school-hero-card, .mentor-card, .faculty-card, .log-card, .gallery-item');
    
    cards.forEach(card => {
      card.classList.add('spotlight-card');

      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);

        // Subtle 3D tilt calculation
        if (card.classList.contains('tilt-card') || card.classList.contains('stat-box')) {
          const centerX = rect.width / 2;
          const centerY = rect.height / 2;
          const rotateX = ((y - centerY) / centerY) * -5;
          const rotateY = ((x - centerX) / centerX) * 5;
          card.style.transform = `perspective(800px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-3px)`;
        }
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }

  // ==========================================
  // 3. Cyber Click Ripple Effect
  // ==========================================
  initClickRipples() {
    document.addEventListener('click', (e) => {
      // Don't create ripple on inputs or selects
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;

      const ripple = document.createElement('div');
      ripple.className = 'cyber-ripple';
      const size = 60;
      ripple.style.width = `${size}px`;
      ripple.style.height = `${size}px`;
      ripple.style.left = `${e.clientX - size / 2}px`;
      ripple.style.top = `${e.clientY - size / 2}px`;
      ripple.style.position = 'fixed';

      document.body.appendChild(ripple);

      setTimeout(() => {
        if (ripple.parentNode) ripple.parentNode.removeChild(ripple);
      }, 650);
    });
  }

  // ==========================================
  // 4. Scramble / Decode Text Effect
  // ==========================================
  initSceneTextDecode() {
    const markers = document.querySelectorAll('.scene-title');
    const chars = '0123456789ABCDEF/\\_#$*!~';

    markers.forEach(title => {
      const originalText = title.textContent;
      
      const decode = () => {
        let iterations = 0;
        const interval = setInterval(() => {
          title.textContent = originalText
            .split('')
            .map((char, index) => {
              if (char === ' ' || char === '&' || char === ';') return char;
              if (index < iterations) {
                return originalText[index];
              }
              return chars[Math.floor(Math.random() * chars.length)];
            })
            .join('');

          if (iterations >= originalText.length) {
            clearInterval(interval);
            title.textContent = originalText;
          }
          iterations += 1;
        }, 30);
      };

      // Decode on hover
      title.parentElement.addEventListener('mouseenter', decode);
    });
  }

  scrambleElement(el, targetText, duration = 800) {
    if (!el) return;
    const chars = '0123456789ABCDEF$#@!*&';
    let iterations = 0;
    const stepTime = Math.max(20, Math.floor(duration / targetText.length));

    const interval = setInterval(() => {
      el.textContent = targetText
        .split('')
        .map((c, i) => {
          if (c === ' ') return ' ';
          if (i < iterations) return targetText[i];
          return chars[Math.floor(Math.random() * chars.length)];
        })
        .join('');

      if (iterations >= targetText.length) {
        clearInterval(interval);
        el.textContent = targetText;
      }
      iterations += 1;
    }, stepTime);
  }

  // ==========================================
  // 5. Number Rolling Counter-Up Animation
  // ==========================================
  initNumberCounters() {
    this.animateCounters();
  }

  animateCounters() {
    const hoursEl = document.getElementById('stat-completed-hours');
    const plansEl = document.getElementById('stat-plans-count');

    if (hoursEl) {
      const text = hoursEl.textContent;
      const match = text.match(/(\d+)\s*\/\s*(\d+)/);
      if (match) {
        const cur = parseInt(match[1], 10);
        const max = parseInt(match[2], 10);
        this.countUp(hoursEl, 0, cur, 1000, (v) => `${v} / ${max} ชม.`);
      }
    }

    if (plansEl) {
      const match = plansEl.textContent.match(/(\d+)/);
      if (match) {
        const target = parseInt(match[1], 10);
        this.countUp(plansEl, 0, target, 900, (v) => `${v} แผน`);
      }
    }
  }

  countUp(el, start, end, duration, formatFn) {
    if (!el || start === end) return;
    const startTime = performance.now();

    const update = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out expo
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = Math.round(start + (end - start) * ease);

      el.textContent = formatFn ? formatFn(current) : current;

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    };

    requestAnimationFrame(update);
  }
}

// Global instance
window.cyberFX = new CyberFXEngine();
