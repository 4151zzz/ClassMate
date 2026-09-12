/**
 * ClassMate Practicum - Three.js 3D WebGL Cinematic Scene
 * Real 3D WebGL Holographic Quantum Core, Concentric Gyroscope Rings & 3D Nebula Starfield
 */

class WebGL3DScene {
  constructor() {
    this.container = document.getElementById('webgl-3d-container');
    this.canvas = document.getElementById('webgl-3d-canvas');
    if (!this.canvas || typeof THREE === 'undefined') {
      console.warn('Three.js or WebGL canvas not found, falling back gracefully');
      return;
    }

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 2000);
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });

    this.mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    this.scrollProgress = 0;
    this.clock = new THREE.Clock();

    this.init();
  }

  init() {
    // Renderer settings
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.camera.position.z = 120;

    // 1. Build 3D Holographic Quantum Core (Icosahedron + Wireframe Glow)
    this.createQuantumCore();

    // 2. Build 3D Concentric Gyroscope Rings
    this.createGyroRings();

    // 3. Build 3D Starfield / Particle Cloud
    this.createStarfield();

    // 4. Lighting
    this.setupLighting();

    // 5. Event Listeners
    window.addEventListener('resize', () => this.onResize());
    window.addEventListener('mousemove', (e) => this.onMouseMove(e));
    window.addEventListener('scroll', () => this.onScroll());

    // 6. Start Loop
    this.animate();
  }

  createQuantumCore() {
    this.coreGroup = new THREE.Group();
    this.scene.add(this.coreGroup);

    // Position in right-side 3D space to complement the hero layout
    this.coreGroup.position.set(38, 8, 0);

    // Inner glowing solid
    const innerGeo = new THREE.IcosahedronGeometry(14, 1);
    const innerMat = new THREE.MeshPhongMaterial({
      color: 0x0284c7,
      emissive: 0x00f0ff,
      emissiveIntensity: 0.35,
      shininess: 100,
      transparent: true,
      opacity: 0.8,
      wireframe: false
    });
    this.innerCore = new THREE.Mesh(innerGeo, innerMat);
    this.coreGroup.add(this.innerCore);

    // Outer wireframe cage
    const outerGeo = new THREE.IcosahedronGeometry(22, 2);
    const outerMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      wireframe: true,
      transparent: true,
      opacity: 0.45
    });
    this.outerWire = new THREE.Mesh(outerGeo, outerMat);
    this.coreGroup.add(this.outerWire);

    // Glowing Vertex Points on outer cage
    const vertMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 1.8,
      transparent: true,
      opacity: 0.9
    });
    this.vertexPoints = new THREE.Points(outerGeo, vertMat);
    this.coreGroup.add(this.vertexPoints);

    // Floating Torus Knot around core
    const knotGeo = new THREE.TorusKnotGeometry(26, 0.8, 120, 16, 2, 3);
    const knotMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x1d4ed8,
      emissiveIntensity: 0.5,
      metalness: 0.9,
      roughness: 0.2,
      transparent: true,
      opacity: 0.7
    });
    this.torusKnot = new THREE.Mesh(knotGeo, knotMat);
    this.coreGroup.add(this.torusKnot);
  }

  createGyroRings() {
    this.ringGroup = new THREE.Group();
    this.coreGroup.add(this.ringGroup);

    const createRing = (radius, tube, color, opacity) => {
      const geo = new THREE.TorusGeometry(radius, tube, 16, 100);
      const mat = new THREE.MeshBasicMaterial({
        color: color,
        transparent: true,
        opacity: opacity,
        wireframe: true
      });
      return new THREE.Mesh(geo, mat);
    };

    this.ring1 = createRing(36, 0.4, 0x00f0ff, 0.5);
    this.ring2 = createRing(44, 0.35, 0x38bdf8, 0.4);
    this.ring3 = createRing(52, 0.3, 0x818cf8, 0.3);

    this.ring1.rotation.x = Math.PI / 3;
    this.ring2.rotation.y = Math.PI / 4;
    this.ring3.rotation.z = Math.PI / 6;

    this.ringGroup.add(this.ring1);
    this.ringGroup.add(this.ring2);
    this.ringGroup.add(this.ring3);
  }

  createStarfield() {
    const particleCount = 1800;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const color1 = new THREE.Color(0x00f0ff);
    const color2 = new THREE.Color(0x38bdf8);
    const color3 = new THREE.Color(0x818cf8);

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      // Spread across wide 3D space
      positions[i3] = (Math.random() - 0.5) * 600;
      positions[i3 + 1] = (Math.random() - 0.5) * 500;
      positions[i3 + 2] = (Math.random() - 0.5) * 400;

      const mixed = Math.random() < 0.4 ? color1 : (Math.random() < 0.7 ? color2 : color3);
      colors[i3] = mixed.r;
      colors[i3 + 1] = mixed.g;
      colors[i3 + 2] = mixed.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 1.5,
      vertexColors: true,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending
    });

    this.starfield = new THREE.Points(geometry, material);
    this.scene.add(this.starfield);
  }

  setupLighting() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    this.scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x00f0ff, 2.5, 300);
    pointLight1.position.set(50, 50, 50);
    this.scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x3b82f6, 2, 300);
    pointLight2.position.set(-50, -50, 50);
    this.scene.add(pointLight2);

    const pointLight3 = new THREE.PointLight(0x10b981, 1.5, 200);
    pointLight3.position.set(0, 80, -30);
    this.scene.add(pointLight3);
  }

  onMouseMove(e) {
    // Normalized device coordinates (-1 to 1)
    this.mouse.targetX = (e.clientX / window.innerWidth) * 2 - 1;
    this.mouse.targetY = -(e.clientY / window.innerHeight) * 2 + 1;
  }

  onScroll() {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    this.scrollProgress = maxScroll > 0 ? window.scrollY / maxScroll : 0;
  }

  onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);

    // Responsive core positioning
    if (window.innerWidth < 1024) {
      this.coreGroup.position.set(0, 15, -20);
      this.coreGroup.scale.set(0.7, 0.7, 0.7);
    } else {
      this.coreGroup.position.set(38, 8, 0);
      this.coreGroup.scale.set(1, 1, 1);
    }
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const delta = this.clock.getDelta();
    const elapsedTime = this.clock.getElapsedTime();

    // Smooth Lerp Mouse Tracking
    this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.05;
    this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.05;

    // Rotate 3D Core with time and mouse influence
    if (this.coreGroup) {
      this.coreGroup.rotation.y = elapsedTime * 0.25 + this.mouse.x * 0.6;
      this.coreGroup.rotation.x = elapsedTime * 0.15 - this.mouse.y * 0.6;

      // Inner Core Counter-Rotation
      if (this.innerCore) {
        this.innerCore.rotation.y = -elapsedTime * 0.5;
        this.innerCore.rotation.z = elapsedTime * 0.3;
        const pulse = 1 + Math.sin(elapsedTime * 2) * 0.08;
        this.innerCore.scale.set(pulse, pulse, pulse);
      }

      // Torus knot rotation
      if (this.torusKnot) {
        this.torusKnot.rotation.x = elapsedTime * 0.3;
        this.torusKnot.rotation.y = elapsedTime * 0.4;
      }

      // Gyro Rings individual axis rotation
      if (this.ring1) this.ring1.rotation.z = elapsedTime * 0.6;
      if (this.ring2) this.ring2.rotation.x = elapsedTime * 0.5;
      if (this.ring3) this.ring3.rotation.y = elapsedTime * 0.4;
    }

    // Gentle starfield drift
    if (this.starfield) {
      this.starfield.rotation.y = elapsedTime * 0.03 + this.mouse.x * 0.15;
      this.starfield.rotation.x = this.mouse.y * 0.15;
    }

    // Parallax Camera gliding
    this.camera.position.x = this.mouse.x * 12;
    this.camera.position.y = this.mouse.y * 12;
    this.camera.lookAt(0, 0, 0);

    this.renderer.render(this.scene, this.camera);
  }
}

// Instantiate on load
document.addEventListener('DOMContentLoaded', () => {
  window.webgl3D = new WebGL3DScene();
});
