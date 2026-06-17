import { useEffect, useRef, useMemo } from "react";

interface Star {
  x: number; y: number; r: number;
  opacity: number; speed: number;
  twinklePeriod: number; twinkleOffset: number;
}

interface ShootingStar {
  x: number; y: number;
  vx: number; vy: number;
  length: number; opacity: number;
  life: number; maxLife: number;
}

interface Props {
  nebulaColor?: string;
  nebulaColor2?: string;
  intensity?: number;
  shootingStars?: boolean;
}

export function CosmicBackground({
  nebulaColor = "#C4B5FD",
  nebulaColor2 = "#7C3AED",
  intensity = 1,
  shootingStars = true,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const startRef = useRef(performance.now());

  const stars = useMemo<Star[]>(() => {
    const count = Math.floor(280 * intensity);
    return Array.from({ length: count }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: Math.random() * 1.5 + 0.3,
      opacity: Math.random() * 0.6 + 0.2,
      speed: Math.random() * 0.00004 + 0.00001,
      twinklePeriod: Math.random() * 4000 + 2000,
      twinkleOffset: Math.random() * Math.PI * 2,
    }));
  }, [intensity]);

  const shootingStarsRef = useRef<ShootingStar[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let W = 0, H = 0;
    const resize = () => {
      W = canvas.width = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const spawnShootingStar = () => {
      const angle = (Math.random() * 40 + 20) * (Math.PI / 180);
      const speed = Math.random() * 4 + 3;
      shootingStarsRef.current.push({
        x: Math.random() * W,
        y: Math.random() * H * 0.4,
        vx: -Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        length: Math.random() * 120 + 60,
        opacity: 1,
        life: 0,
        maxLife: Math.random() * 40 + 30,
      });
    };

    let shootTimer = 0;
    const shootInterval = shootingStars ? 3000 : Infinity;

    const draw = (now: number) => {
      rafRef.current = requestAnimationFrame(draw);
      const t = now - startRef.current;

      ctx.clearRect(0, 0, W, H);

      // Deep void base
      ctx.fillStyle = "#0B0E14";
      ctx.fillRect(0, 0, W, H);

      // Nebula layer 1
      const n1 = ctx.createRadialGradient(W * 0.3, H * 0.4, 0, W * 0.3, H * 0.4, W * 0.55);
      n1.addColorStop(0, hex2rgba(nebulaColor, 0.07));
      n1.addColorStop(0.5, hex2rgba(nebulaColor, 0.03));
      n1.addColorStop(1, "transparent");
      ctx.fillStyle = n1;
      ctx.fillRect(0, 0, W, H);

      // Nebula layer 2
      const n2 = ctx.createRadialGradient(W * 0.75, H * 0.65, 0, W * 0.75, H * 0.65, W * 0.45);
      n2.addColorStop(0, hex2rgba(nebulaColor2, 0.06));
      n2.addColorStop(0.6, hex2rgba(nebulaColor2, 0.02));
      n2.addColorStop(1, "transparent");
      ctx.fillStyle = n2;
      ctx.fillRect(0, 0, W, H);

      // Drifting center glow
      const drift = Math.sin(t * 0.0003) * 0.05;
      const n3 = ctx.createRadialGradient(W * (0.5 + drift), H * 0.5, 0, W * 0.5, H * 0.5, W * 0.35);
      n3.addColorStop(0, hex2rgba(nebulaColor, 0.04));
      n3.addColorStop(1, "transparent");
      ctx.fillStyle = n3;
      ctx.fillRect(0, 0, W, H);

      // Stars
      for (const s of stars) {
        const twinkle = 0.5 + 0.5 * Math.sin(t / s.twinklePeriod * Math.PI * 2 + s.twinkleOffset);
        const op = s.opacity * (0.4 + 0.6 * twinkle);
        const x = (s.x + t * s.speed) % 1;
        ctx.beginPath();
        ctx.arc(x * W, s.y * H, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${op})`;
        ctx.fill();
      }

      // Shooting stars
      if (shootingStars) {
        shootTimer += 16;
        if (shootTimer >= shootInterval / 1) {
          shootTimer = 0;
          if (Math.random() < 0.015) spawnShootingStar();
        }

        shootingStarsRef.current = shootingStarsRef.current.filter(s => s.life < s.maxLife);
        for (const s of shootingStarsRef.current) {
          s.x += s.vx;
          s.y += s.vy;
          s.life++;
          const prog = s.life / s.maxLife;
          const op = s.opacity * (1 - prog);
          const grad = ctx.createLinearGradient(s.x, s.y, s.x - s.vx * (s.length / 6), s.y - s.vy * (s.length / 6));
          grad.addColorStop(0, `rgba(255,255,255,${op})`);
          grad.addColorStop(1, "transparent");
          ctx.beginPath();
          ctx.moveTo(s.x, s.y);
          ctx.lineTo(s.x - s.vx * (s.length / 6), s.y - s.vy * (s.length / 6));
          ctx.strokeStyle = grad;
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
      }
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(rafRef.current);
      ro.disconnect();
    };
  }, [stars, nebulaColor, nebulaColor2, shootingStars]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}

function hex2rgba(hex: string, alpha: number) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}
