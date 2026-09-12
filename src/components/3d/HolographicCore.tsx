import React, { useEffect, useRef } from "react";
import * as THREE from "three";

export const HolographicCore: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let animationFrameId: number;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 2000);
    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    camera.position.z = 120;

    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    const clock = new THREE.Clock();

    // 1. Quantum Core Group
    const coreGroup = new THREE.Group();
    scene.add(coreGroup);

    const updateCorePosition = () => {
      if (window.innerWidth < 1024) {
        coreGroup.position.set(0, 15, -20);
        coreGroup.scale.set(0.65, 0.65, 0.65);
      } else {
        coreGroup.position.set(38, 8, 0);
        coreGroup.scale.set(1, 1, 1);
      }
    };
    updateCorePosition();

    // Inner glowing solid
    const innerGeo = new THREE.IcosahedronGeometry(14, 1);
    const innerMat = new THREE.MeshPhongMaterial({
      color: 0x0284c7,
      emissive: 0x00f0ff,
      emissiveIntensity: 0.4,
      shininess: 100,
      transparent: true,
      opacity: 0.85,
    });
    const innerCore = new THREE.Mesh(innerGeo, innerMat);
    coreGroup.add(innerCore);

    // Outer wireframe cage
    const outerGeo = new THREE.IcosahedronGeometry(22, 2);
    const outerMat = new THREE.MeshBasicMaterial({
      color: 0x00f0ff,
      wireframe: true,
      transparent: true,
      opacity: 0.45,
    });
    const outerWire = new THREE.Mesh(outerGeo, outerMat);
    coreGroup.add(outerWire);

    // Glowing Vertex Points on outer cage
    const vertMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 1.8,
      transparent: true,
      opacity: 0.9,
    });
    const vertexPoints = new THREE.Points(outerGeo, vertMat);
    coreGroup.add(vertexPoints);

    // Floating Torus Knot around core
    const knotGeo = new THREE.TorusKnotGeometry(26, 0.8, 120, 16, 2, 3);
    const knotMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x1d4ed8,
      emissiveIntensity: 0.5,
      metalness: 0.9,
      roughness: 0.2,
      transparent: true,
      opacity: 0.7,
    });
    const torusKnot = new THREE.Mesh(knotGeo, knotMat);
    coreGroup.add(torusKnot);

    // Gyro Rings
    const ringGroup = new THREE.Group();
    coreGroup.add(ringGroup);

    const createRing = (radius: number, tube: number, color: number, opacity: number) => {
      const geo = new THREE.TorusGeometry(radius, tube, 16, 100);
      const mat = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity,
        wireframe: true,
      });
      return new THREE.Mesh(geo, mat);
    };

    const ring1 = createRing(36, 0.4, 0x00f0ff, 0.5);
    const ring2 = createRing(44, 0.35, 0x38bdf8, 0.4);
    const ring3 = createRing(52, 0.3, 0x818cf8, 0.3);

    ring1.rotation.x = Math.PI / 3;
    ring2.rotation.y = Math.PI / 4;
    ring3.rotation.z = Math.PI / 6;

    ringGroup.add(ring1);
    ringGroup.add(ring2);
    ringGroup.add(ring3);

    // Starfield Particle Cloud
    const particleCount = 1500;
    const starGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const color1 = new THREE.Color(0x00f0ff);
    const color2 = new THREE.Color(0x38bdf8);
    const color3 = new THREE.Color(0x818cf8);

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      positions[i3] = (Math.random() - 0.5) * 600;
      positions[i3 + 1] = (Math.random() - 0.5) * 500;
      positions[i3 + 2] = (Math.random() - 0.5) * 400;

      const mixed = Math.random() < 0.4 ? color1 : (Math.random() < 0.7 ? color2 : color3);
      colors[i3] = mixed.r;
      colors[i3 + 1] = mixed.g;
      colors[i3 + 2] = mixed.b;
    }

    starGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    starGeo.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const starMat = new THREE.PointsMaterial({
      size: 1.5,
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
    });
    const starfield = new THREE.Points(starGeo, starMat);
    scene.add(starfield);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.45);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x00f0ff, 2.5, 300);
    pointLight1.position.set(50, 50, 50);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x3b82f6, 2, 300);
    pointLight2.position.set(-50, -50, 50);
    scene.add(pointLight2);

    const onMouseMove = (e: MouseEvent) => {
      mouse.targetX = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.targetY = -(e.clientY / window.innerHeight) * 2 + 1;
    };

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      updateCorePosition();
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("resize", onResize);

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      mouse.x += (mouse.targetX - mouse.x) * 0.05;
      mouse.y += (mouse.targetY - mouse.y) * 0.05;

      coreGroup.rotation.y = elapsedTime * 0.25 + mouse.x * 0.6;
      coreGroup.rotation.x = elapsedTime * 0.15 - mouse.y * 0.6;

      innerCore.rotation.y = -elapsedTime * 0.5;
      innerCore.rotation.z = elapsedTime * 0.3;
      const pulse = 1 + Math.sin(elapsedTime * 2) * 0.08;
      innerCore.scale.set(pulse, pulse, pulse);

      torusKnot.rotation.x = elapsedTime * 0.3;
      torusKnot.rotation.y = elapsedTime * 0.4;

      ring1.rotation.z = elapsedTime * 0.6;
      ring2.rotation.x = elapsedTime * 0.5;
      ring3.rotation.y = elapsedTime * 0.4;

      starfield.rotation.y = elapsedTime * 0.03 + mouse.x * 0.12;
      starfield.rotation.x = mouse.y * 0.12;

      camera.position.x = mouse.x * 12;
      camera.position.y = mouse.y * 12;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <canvas ref={canvasRef} className="w-full h-full block" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#06080d]/40 to-[#06080d] pointer-events-none" />
    </div>
  );
};
