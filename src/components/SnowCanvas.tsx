import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";

export interface SnowCanvasHandle {
  shake: (intensity: number) => void;
  /** set the normalized direction snow should fall in, e.g. from device tilt */
  setGravity: (x: number, y: number) => void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  swayOffset: number;
  swaySpeed: number;
  opacity: number;
}

interface SnowCanvasProps {
  size: number;
  particleCount?: number;
}

const GRAVITY = 0.052;
const DAMPING = 0.975;
const WALL_DAMPING = 0.42;
const REST_EPSILON = 0.03;
const GRAVITY_LERP = 0.05;

export const SnowCanvas = forwardRef<SnowCanvasHandle, SnowCanvasProps>(
  ({ size, particleCount = 1420 }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const particlesRef = useRef<Particle[]>([]);
    const shakeEnergyRef = useRef(0);
    const swirlRef = useRef(0);
    const rafRef = useRef<number | null>(null);
    const gravityRef = useRef({ x: 0, y: 1 });
    const gravityTargetRef = useRef({ x: 0, y: 1 });

    useImperativeHandle(ref, () => ({
      shake: (intensity: number) => {
        shakeEnergyRef.current = Math.min(1, shakeEnergyRef.current + intensity);
        swirlRef.current += intensity * (Math.random() > 0.5 ? 1 : -1) * 0.6;
      },
      setGravity: (x: number, y: number) => {
        gravityTargetRef.current = { x, y };
      },
    }));

    useEffect(() => {
      const radius = size / 2;
      const particles: Particle[] = [];
      for (let i = 0; i < particleCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.sqrt(Math.random()) * (radius - 6);
        particles.push({
          x: radius + Math.cos(angle) * dist,
          y: radius + Math.sin(angle) * dist,
          vx: 0,
          vy: 0,
          r: Math.random() * 2.4 + 1,
          swayOffset: Math.random() * Math.PI * 2,
          swaySpeed: Math.random() * 0.02 + 0.008,
          opacity: Math.random() * 0.5 + 0.5,
        });
      }
      particlesRef.current = particles;
    }, [size, particleCount]);

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = size * dpr;
      canvas.height = size * dpr;
      canvas.style.width = `${size}px`;
      canvas.style.height = `${size}px`;
      ctx.scale(dpr, dpr);

      const radius = size / 2;
      const cx = radius;
      const cy = radius;
      let frame = 0;

      const tick = () => {
        frame++;
        ctx.clearRect(0, 0, size, size);

        const energy = shakeEnergyRef.current;
        const swirl = swirlRef.current;

        const gravity = gravityRef.current;
        const target = gravityTargetRef.current;
        gravity.x += (target.x - gravity.x) * GRAVITY_LERP;
        gravity.y += (target.y - gravity.y) * GRAVITY_LERP;

        ctx.shadowColor = "rgba(180,205,230,0.6)";
        ctx.shadowBlur = 1.5;

        for (const p of particlesRef.current) {
          // gravity, slightly reduced while agitated so flakes hang in suspension
          const g = GRAVITY * (1 - energy * 0.6);
          p.vx += gravity.x * g;
          p.vy += gravity.y * g;

          // gentle ambient sway (perpendicular to gravity, so it still reads as "sideways" when tilted)
          const sway = Math.sin(frame * p.swaySpeed + p.swayOffset) * 0.08;
          p.x += sway * gravity.y;
          p.y -= sway * gravity.x;

          // shake energy: outward/turbulent kick + swirl (tangential) force
          if (energy > 0.001) {
            const dx = p.x - cx;
            const dy = p.y - cy;
            const dist = Math.hypot(dx, dy) || 1;
            const nx = dx / dist;
            const ny = dy / dist;
            const tx = -ny;
            const ty = nx;
            p.vx += (Math.random() - 0.5) * energy * 1.6 + tx * swirl * 0.12;
            p.vy += (Math.random() - 0.5) * energy * 1.6 + ty * swirl * 0.12;
          }

          p.vx *= DAMPING;
          p.vy *= DAMPING;

          p.x += p.vx;
          p.y += p.vy;

          // collide with the inner glass wall
          const dx = p.x - cx;
          const dy = p.y - cy;
          const dist = Math.hypot(dx, dy);
          const maxDist = radius - p.r - 2;
          if (dist > maxDist) {
            const nx = dx / dist;
            const ny = dy / dist;
            p.x = cx + nx * maxDist;
            p.y = cy + ny * maxDist;
            const vn = p.vx * nx + p.vy * ny;
            p.vx -= (1 + WALL_DAMPING) * vn * nx;
            p.vy -= (1 + WALL_DAMPING) * vn * ny;
          }

          if (Math.hypot(p.vx, p.vy) < REST_EPSILON) {
            p.vx = 0;
            p.vy = 0;
          }

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255,255,255,${p.opacity})`;
          ctx.fill();
        }

        shakeEnergyRef.current *= 0.965;
        if (shakeEnergyRef.current < 0.002) shakeEnergyRef.current = 0;
        swirlRef.current *= 0.94;

        rafRef.current = requestAnimationFrame(tick);
      };

      rafRef.current = requestAnimationFrame(tick);
      return () => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
      };
    }, [size]);

    return (
      <canvas
        ref={canvasRef}
        className="snow-canvas"
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "50%",
          pointerEvents: "none",
        }}
      />
    );
  },
);

SnowCanvas.displayName = "SnowCanvas";
