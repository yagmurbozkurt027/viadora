'use client';
import { useEffect, useRef } from "react";

export default function AnimatedBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    // Sadece ana sayfada çalışsın
    if (typeof window !== 'undefined' && window.location.pathname !== '/') {
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    function setCanvasSize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    setCanvasSize();
    window.addEventListener("resize", setCanvasSize);

    // Partiküller
    let width = canvas.width;
    let height = canvas.height;
    let floatingParticles = [];
    const floatingCount = Math.max(40, Math.floor((width * height) / 18000));
    for (let i = 0; i < floatingCount; i++) {
      floatingParticles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.7,
        vy: (Math.random() - 0.5) * 0.7,
        radius: 2 + Math.random() * 2,
        color: `hsl(${200 + Math.random() * 100}, 80%, 70%)`
      });
    }

    function animate() {
      const isDark = document.documentElement.classList.contains('dark');
      ctx.globalAlpha = 0.18;
      ctx.fillStyle = isDark ? "#181c2a" : "#e0e7ff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.globalAlpha = 1;

      for (let p of floatingParticles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 20;
        ctx.globalAlpha = 0.7;
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.restore();
      }
      ctx.shadowBlur = 0;
      requestAnimationFrame(animate);
    }
    animate();

    return () => {
      window.removeEventListener("resize", setCanvasSize);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: "100vw",
        height: "100vh",
        minHeight: "100%",
        display: "block",
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: -1,
        pointerEvents: "none",
      }}
    />
  );
}
