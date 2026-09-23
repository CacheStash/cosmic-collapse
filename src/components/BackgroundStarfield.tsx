import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface BackgroundStarfieldProps {
  isWarping?: boolean;
}

export const BackgroundStarfield: React.FC<BackgroundStarfieldProps> = ({ isWarping = false }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isWarpingRef = useRef(isWarping);
  isWarpingRef.current = isWarping;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a0a12, 0.0012);

    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      1,
      2000
    );
    camera.position.z = 1000;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 1. Starfield Particles
    const starCount = 1800;
    const starGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(starCount * 3);
    const colors = new Float32Array(starCount * 3);
    const sizes = new Float32Array(starCount);

    const colorPalette = [
      new THREE.Color(0x00f0ff), // Cyan
      new THREE.Color(0xffd700), // Gold
      new THREE.Color(0xb026ff), // Violet
      new THREE.Color(0xffffff), // Supernova white
      new THREE.Color(0x60a5fa), // Ice blue
      new THREE.Color(0xf43f5e), // Flare red
    ];

    for (let i = 0; i < starCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 2400;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 2400;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 2000;

      const col = colorPalette[Math.floor(Math.random() * colorPalette.length)];
      colors[i * 3] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;

      sizes[i] = Math.random() * 3.5 + 1.2;
    }

    starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    starGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    starGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    // Simple custom circular particle shader texture
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
      grad.addColorStop(0, 'rgba(255,255,255,1)');
      grad.addColorStop(0.3, 'rgba(255,255,255,0.7)');
      grad.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 32, 32);
    }
    const starTexture = new THREE.CanvasTexture(canvas);

    const starMaterial = new THREE.PointsMaterial({
      size: 4,
      vertexColors: true,
      map: starTexture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const starField = new THREE.Points(starGeometry, starMaterial);
    scene.add(starField);

    // 2. Volumetric Nebula Clouds (Procedural multi-colored dust clouds)
    const nebulaCount = 45;
    const nebulaGroup = new THREE.Group();
    const nebulaGeom = new THREE.PlaneGeometry(500, 500);

    const nebulaColors = [
      'rgba(176, 38, 255, 0.08)', // Violet
      'rgba(0, 240, 255, 0.07)',  // Cyan
      'rgba(244, 63, 94, 0.06)',   // Deep rose
      'rgba(255, 215, 0, 0.05)',  // Golden dust
    ];

    const nebulaTextures = nebulaColors.map(color => {
      const nCanvas = document.createElement('canvas');
      nCanvas.width = 128;
      nCanvas.height = 128;
      const nCtx = nCanvas.getContext('2d')!;
      const grad = nCtx.createRadialGradient(64, 64, 0, 64, 64, 64);
      grad.addColorStop(0, color);
      grad.addColorStop(0.6, color.replace(/[\d.]+\)$/, '0.02)'));
      grad.addColorStop(1, 'transparent');
      nCtx.fillStyle = grad;
      nCtx.fillRect(0, 0, 128, 128);
      return new THREE.CanvasTexture(nCanvas);
    });

    for (let i = 0; i < nebulaCount; i++) {
      const mat = new THREE.MeshBasicMaterial({
        map: nebulaTextures[i % nebulaTextures.length],
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const mesh = new THREE.Mesh(nebulaGeom, mat);
      mesh.position.set(
        (Math.random() - 0.5) * 1800,
        (Math.random() - 0.5) * 1800,
        (Math.random() - 0.5) * 1400
      );
      mesh.rotation.z = Math.random() * Math.PI * 2;
      mesh.scale.setScalar(Math.random() * 2 + 1.5);
      nebulaGroup.add(mesh);
    }
    scene.add(nebulaGroup);

    // Mouse parallax tracking
    let targetMouseX = 0;
    let targetMouseY = 0;
    let mouseX = 0;
    let mouseY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      targetMouseX = (e.clientX - window.innerWidth / 2) * 0.4;
      targetMouseY = (e.clientY - window.innerHeight / 2) * 0.4;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Resize handler
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Mouse Parallax Lerp
      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;

      camera.position.x = mouseX * 0.5;
      camera.position.y = -mouseY * 0.5;
      camera.lookAt(scene.position);

      // Starfield slow rotation & warp speed effect
      const warpSpeed = isWarpingRef.current ? 4.5 : 1.0;
      starField.rotation.y += 0.0004 * warpSpeed;
      starField.rotation.x += 0.0002 * warpSpeed;

      // Slowly pulse nebulae
      nebulaGroup.rotation.z = Math.sin(elapsed * 0.05) * 0.08;
      nebulaGroup.children.forEach((child, idx) => {
        child.rotation.z += 0.0003 * (idx % 2 === 0 ? 1 : -1);
      });

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      starGeometry.dispose();
      starMaterial.dispose();
      nebulaGeom.dispose();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden bg-[#0a0a12]"
      style={{
        background: 'radial-gradient(ellipse at center, #101222 0%, #0a0a12 75%, #050508 100%)'
      }}
    />
  );
};
