import { useEffect, useRef } from 'react';
import gsap from 'gsap';

interface WorldInsideProps {
  isActive: boolean;
}

const ROUTES = [
  { origin: 'EG', route: 'EGYPT \u2192 LONDON', artifact: 'The Rosetta Stone' },
  { origin: 'AT', route: 'ATHENS \u2192 LONDON', artifact: 'The Parthenon Marbles' },
  { origin: 'MS', route: 'MESOPOTAMIA \u2192 LONDON', artifact: 'Assyrian Reliefs' },
  { origin: 'AX', route: 'ANGLO-SAXON ENGLAND \u2192 LONDON', artifact: 'Sutton Hoo Treasure' },
  { origin: 'CN', route: 'CHINA \u2192 LONDON', artifact: 'The Admonitions Scroll' },
];

// Simplex-like noise for bronze texture
function noise2D(x: number, y: number): number {
  const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
  return n - Math.floor(n);
}

function smoothNoise(x: number, y: number): number {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = x - ix;
  const fy = y - iy;
  const sx = fx * fx * (3 - 2 * fx);
  const sy = fy * fy * (3 - 2 * fy);

  const a = noise2D(ix, iy);
  const b = noise2D(ix + 1, iy);
  const c = noise2D(ix, iy + 1);
  const d = noise2D(ix + 1, iy + 1);

  return a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy;
}

export default function WorldInside({ isActive }: WorldInsideProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hasAnimated = useRef(false);
  const rafRef = useRef(0);

  // Bronze texture canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio, 2);
    const cellSize = 8;

    function resize() {
      if (!canvas) return;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
    }
    resize();

    let time = 0;
    function draw() {
      if (!ctx || !canvas) return;
      const w = canvas.width;
      const h = canvas.height;
      const cols = Math.ceil(w / (cellSize * dpr));
      const rows = Math.ceil(h / (cellSize * dpr));

      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const n = smoothNoise(x * 0.08 + time * 0.02, y * 0.08 + time * 0.015);
          const val = n;

          // Map to bronze palette
          let r: number, g: number, b: number;
          if (val < 0.3) {
            r = 61 + val * 100;
            g = 43 + val * 80;
            b = 31 + val * 60;
          } else if (val < 0.6) {
            r = 107 + (val - 0.3) * 80;
            g = 91 + (val - 0.3) * 60;
            b = 69 + (val - 0.3) * 50;
          } else {
            r = 138 + (val - 0.6) * 60;
            g = 110 + (val - 0.6) * 50;
            b = 62 + (val - 0.6) * 40;
          }

          ctx.fillStyle = `rgb(${Math.floor(r)},${Math.floor(g)},${Math.floor(b)})`;
          ctx.fillRect(x * cellSize * dpr, y * cellSize * dpr, cellSize * dpr + 1, cellSize * dpr + 1);
        }
      }

      time += 0.016;
      rafRef.current = requestAnimationFrame(draw);
    }

    rafRef.current = requestAnimationFrame(draw);
    window.addEventListener('resize', resize);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  // Entrance animations
  useEffect(() => {
    if (!isActive || hasAnimated.current || !sectionRef.current) return;
    hasAnimated.current = true;

    const tl = gsap.timeline();

    // Header
    tl.fromTo('.wi-deco-line', { scaleX: 0 }, { scaleX: 1, duration: 0.6, ease: 'power3.inOut' });
    tl.fromTo('.wi-eyebrow', { opacity: 0 }, { opacity: 1, duration: 0.5 }, 0.2);
    tl.fromTo('.wi-title', { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }, 0.4);

    // Manifesto
    tl.fromTo('.wi-manifesto', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 1, ease: 'power2.out' }, 0.8);
    tl.fromTo('.wi-manifesto-italic', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 1, ease: 'power2.out' }, 1.0);

    // Route bars
    tl.fromTo('.route-bar', { opacity: 0, x: -60 }, { opacity: 1, x: 0, stagger: 0.12, duration: 0.7, ease: 'power2.out' }, 1.2);

    // Bottom note
    tl.fromTo('.wi-bottom-note', { opacity: 0 }, { opacity: 1, duration: 0.6 }, 2.0);

    return () => { tl.kill(); };
  }, [isActive]);

  return (
    <div ref={sectionRef} className="w-screen h-screen relative overflow-hidden flex-shrink-0">
      {/* Bronze Texture Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full z-0"
        style={{ opacity: 0.4 }}
      />

      {/* Paper Texture Overlay */}
      <div className="absolute inset-0 z-[1] pointer-events-none" style={{ backgroundColor: '#F4EDE4', opacity: 0.3 }} />

      {/* Content */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center px-[5vw] py-32">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="wi-deco-line w-20 h-px bg-bronze mx-auto mb-4 origin-center" style={{ transform: 'scaleX(0)' }} />
          <p className="wi-eyebrow text-eyebrow text-bronze mb-2" style={{ opacity: 0 }}>THE WORLD</p>
          <h1 className="wi-title text-display text-ink" style={{ opacity: 0, fontSize: 'clamp(4rem, 7vw, 6rem)' }}>INSIDE</h1>
        </div>

        {/* Manifesto */}
        <div className="max-w-[800px] text-center mb-16">
          <p className="wi-manifesto text-body text-ink leading-[1.8]" style={{ fontSize: 'clamp(1.1rem, 1.5vw, 1.35rem)', opacity: 0 }}>
            The British Museum holds objects from every continent, spanning two million years of human history. Each artifact carries the memory of its makers, its journey, and the hands through which it passed.
          </p>
          <p className="wi-manifesto-italic text-body italic text-stone mt-8" style={{ fontSize: 'clamp(1.1rem, 1.5vw, 1.35rem)', opacity: 0 }}>
            This is not merely a collection. It is a map of human civilization.
          </p>
        </div>

        {/* Cultural Route Bars */}
        <div className="w-full max-w-[1000px] space-y-3">
          {ROUTES.map((route, i) => (
            <div
              key={i}
              className="route-bar flex items-center h-12 px-6 bg-ink/[0.06] rounded-sm border-b border-deep-parchment cursor-pointer group hover:bg-ink/[0.1] transition-colors duration-250"
              style={{ opacity: 0 }}
            >
              <div className="w-5 h-5 rounded-full border border-bronze flex items-center justify-center flex-shrink-0 mr-4">
                <span className="text-[0.5rem] text-bronze font-body font-medium">{route.origin}</span>
              </div>
              <span className="text-artifact-label text-ink flex-1">{route.route}</span>
              <span className="text-bronze group-hover:translate-x-1.5 transition-transform duration-250">&rarr;</span>
            </div>
          ))}
        </div>

        {/* Bottom Note */}
        <div className="wi-bottom-note absolute bottom-16 left-1/2 -translate-x-1/2 text-center" style={{ opacity: 0 }}>
          <p className="text-label text-stone tracking-[0.15em]">8 MILLION OBJECTS &middot; 2 MILLION YEARS &middot; CONTINENTS</p>
          <div className="w-[60px] h-px bg-bronze mx-auto mt-2" />
        </div>
      </div>
    </div>
  );
}
