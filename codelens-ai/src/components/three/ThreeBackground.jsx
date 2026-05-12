// ThreeBackground.jsx — Subtle 3D WebGL Particle Field
// Uses Three.js (imported as "three") — cursor-reactive particles

import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function ThreeBackground({ theme = "dark", intensity = 0.6 }) {
  const canvasRef = useRef(null);
  const frameRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0, vx: 0, vy: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // ── Renderer ───────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: false,
      powerPreference: "low-power",
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 200);
    camera.position.z = 35;

    // ── Accent colors per theme ────────────────────────────────
    const COLORS = {
      dark: { p1: 0x38bdf8, p2: 0x4ade80, p3: 0xa78bfa },
      cyberpunk: { p1: 0xf700ff, p2: 0x00ff88, p3: 0x00e5ff },
      light: { p1: 0x2563eb, p2: 0x7c3aed, p3: 0x0891b2 },
    };
    const cols = COLORS[theme] || COLORS.dark;

    // ── Particles ──────────────────────────────────────────────
    const COUNT = 220;
    const positions = new Float32Array(COUNT * 3);
    const velocities = new Float32Array(COUNT * 3);
    const colors = new Float32Array(COUNT * 3);
    const sizes = new Float32Array(COUNT);

    const palette = [
      new THREE.Color(cols.p1),
      new THREE.Color(cols.p2),
      new THREE.Color(cols.p3),
    ];

    for (let i = 0; i < COUNT; i++) {
      positions[i * 3]     = (Math.random() - 0.5) * 90;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 65;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 50;

      velocities[i * 3]     = (Math.random() - 0.5) * 0.008;
      velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.006;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.004;

      const c = palette[Math.floor(Math.random() * palette.length)];
      colors[i * 3]     = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;

      sizes[i] = Math.random() * 1.8 + 0.4;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("color",    new THREE.BufferAttribute(colors, 3));
    geo.setAttribute("size",     new THREE.BufferAttribute(sizes, 1));

    // Custom shader for glowing round particles
    const mat = new THREE.ShaderMaterial({
      uniforms: {
        opacity: { value: intensity * 0.85 },
        time:    { value: 0 },
      },
      vertexShader: `
        attribute float size;
        attribute vec3 color;
        varying vec3 vColor;
        varying float vAlpha;
        uniform float time;
        void main() {
          vColor = color;
          vAlpha = 0.6 + 0.4 * sin(time + position.x * 0.1 + position.y * 0.08);
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = size * (200.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        varying float vAlpha;
        uniform float opacity;
        void main() {
          vec2 uv = gl_PointCoord - 0.5;
          float d = length(uv);
          if (d > 0.5) discard;
          float alpha = (1.0 - smoothstep(0.2, 0.5, d)) * vAlpha * opacity;
          gl_FragColor = vec4(vColor, alpha);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexColors: true,
    });

    const points = new THREE.Points(geo, mat);
    scene.add(points);

    // ── Connection lines (neural network feel) ─────────────────
    const lineMat = new THREE.LineBasicMaterial({
      color: cols.p1,
      transparent: true,
      opacity: 0.04,
      blending: THREE.AdditiveBlending,
    });

    // Only draw ~15 random lines between close particles
    for (let i = 0; i < 15; i++) {
      const a = Math.floor(Math.random() * COUNT);
      const b = Math.floor(Math.random() * COUNT);
      const pts = [
        new THREE.Vector3(positions[a * 3], positions[a * 3 + 1], positions[a * 3 + 2]),
        new THREE.Vector3(positions[b * 3], positions[b * 3 + 1], positions[b * 3 + 2]),
      ];
      const lineGeo = new THREE.BufferGeometry().setFromPoints(pts);
      scene.add(new THREE.Line(lineGeo, lineMat));
    }

    // ── Subtle holographic rings ───────────────────────────────
    const ringMat = new THREE.MeshBasicMaterial({
      color: cols.p1, transparent: true, opacity: 0.06,
      wireframe: true, blending: THREE.AdditiveBlending,
    });
    const ring = new THREE.Mesh(new THREE.TorusGeometry(8, 0.05, 8, 80), ringMat);
    scene.add(ring);

    const ring2Mat = new THREE.MeshBasicMaterial({
      color: cols.p2, transparent: true, opacity: 0.04,
      wireframe: true, blending: THREE.AdditiveBlending,
    });
    const ring2 = new THREE.Mesh(new THREE.TorusGeometry(13, 0.04, 6, 80), ring2Mat);
    scene.add(ring2);

    // ── Mouse tracking ─────────────────────────────────────────
    const onMouseMove = (e) => {
      const nx = (e.clientX / window.innerWidth - 0.5) * 2;
      const ny = -(e.clientY / window.innerHeight - 0.5) * 2;
      mouseRef.current.vx = nx - mouseRef.current.x;
      mouseRef.current.vy = ny - mouseRef.current.y;
      mouseRef.current.x = nx;
      mouseRef.current.y = ny;
    };
    window.addEventListener("mousemove", onMouseMove);

    // ── Resize ─────────────────────────────────────────────────
    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", onResize);

    // ── Animation loop ─────────────────────────────────────────
    let t = 0;
    const p = geo.attributes.position.array;
    const v = velocities;

    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      t += 0.004;
      mat.uniforms.time.value = t;

      // Move particles
      for (let i = 0; i < COUNT; i++) {
        p[i * 3]     += v[i * 3];
        p[i * 3 + 1] += v[i * 3 + 1];
        p[i * 3 + 2] += v[i * 3 + 2];

        // Bounce on bounds
        if (Math.abs(p[i * 3])     > 46) v[i * 3]     *= -1;
        if (Math.abs(p[i * 3 + 1]) > 34) v[i * 3 + 1] *= -1;
        if (Math.abs(p[i * 3 + 2]) > 26) v[i * 3 + 2] *= -1;
      }
      geo.attributes.position.needsUpdate = true;

      // Smooth camera follow mouse
      camera.position.x += (mouseRef.current.x * 5 - camera.position.x) * 0.025;
      camera.position.y += (mouseRef.current.y * 3.5 - camera.position.y) * 0.025;

      // Rotate rings
      ring.rotation.x  = t * 0.25;
      ring.rotation.y  = t * 0.4;
      ring2.rotation.x = -t * 0.18;
      ring2.rotation.z =  t * 0.3;

      // Slow scene rotation
      points.rotation.y = Math.sin(t * 0.1) * 0.08;

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", onResize);
      geo.dispose();
      mat.dispose();
      renderer.dispose();
    };
  }, [theme, intensity]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        opacity: 0.75,
      }}
    />
  );
}