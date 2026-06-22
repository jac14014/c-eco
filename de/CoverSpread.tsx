import { useEffect, useRef } from 'react';
import gsap from 'gsap';

interface CoverSpreadProps {
  isActive: boolean;
  onEnterGallery: () => void;
}

// SVG artifact outlines - simplified paths
const BUST_PATH = 'M50,180 C50,140 55,110 70,90 C75,80 80,75 85,70 C90,65 95,60 100,55 C105,50 115,45 125,42 C130,40 138,38 145,38 C152,38 160,40 168,42 C175,44 182,48 188,53 C194,58 198,65 200,72 C202,80 203,88 202,96 C201,104 198,112 194,120 C190,128 185,135 180,142 C175,148 170,154 165,160 C160,166 158,172 157,180 C156,188 156,196 157,204 C158,212 160,220 162,228 C164,236 166,244 167,252 C168,260 168,268 167,276 C166,284 164,292 162,300';
const RELIEF_PATH = 'M30,100 C30,80 35,65 45,55 C55,45 70,40 90,38 C110,36 130,38 150,42 C170,46 188,52 200,60 C212,68 220,78 224,90 C228,102 228,115 224,128 C220,140 212,152 200,162 C188,172 172,180 154,186 C136,192 118,196 100,198 C82,200 65,200 50,198 C40,196 35,190 32,180 C30,170 30,158 30,145 C30,132 30,118 30,105 C30,95 32,85 38,78 C44,71 52,66 62,63 C72,60 82,58 92,58';
const VASE_PATH = 'M80,20 C90,18 100,17 110,18 C120,19 128,22 134,27 C140,32 144,39 146,47 C148,55 148,63 146,71 C144,79 140,86 136,93 C132,100 128,106 125,112 C122,118 120,124 120,130 C120,136 122,142 125,148 C128,154 132,160 136,166 C140,172 144,178 146,186 C148,194 148,202 146,210 C144,218 140,225 134,230 C128,235 120,238 110,239 C100,240 90,239 80,237';

export default function CoverSpread({ isActive, onEnterGallery }: CoverSpreadProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const svgPathsRef = useRef<SVGPathElement[]>([]);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!isActive || hasAnimated.current) return;
    hasAnimated.current = true;

    const tl = gsap.timeline();

    // 1. Camera push-in
    if (videoRef.current) {
      gsap.fromTo(videoRef.current, { scale: 1.05 }, { scale: 1, duration: 2, ease: 'power2.out' });
    }

    // 2. SVG line drawing
    svgPathsRef.current.forEach((path, i) => {
      if (!path) return;
      const length = path.getTotalLength ? path.getTotalLength() : 2000;
      gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
      tl.to(path, {
        strokeDashoffset: 0,
        duration: 4.5,
        ease: 'power2.inOut',
      }, i * 1.5);
    });

    // Fade out SVG
    tl.to('.svg-overlay', { opacity: 0, duration: 0.5 }, 4.75);

    // 3. Decorative line
    tl.fromTo('.hero-deco-line', { scaleX: 0 }, { scaleX: 1, duration: 0.6, ease: 'power3.inOut' }, 0.8);

    // 4. Subtitle fade
    tl.fromTo('.hero-subtitle', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }, 1.7);

    // 5. Bottom panel slide up
    tl.fromTo('.bottom-panel', { y: '100%' }, { y: '0%', duration: 0.8, ease: 'power3.out' }, 2.5);

    // 6. CTA fade
    tl.fromTo('.hero-cta', { opacity: 0 }, { opacity: 1, duration: 0.5 }, 3.0);

    // Sidebar reveal
    tl.fromTo('.editorial-sidebar', { opacity: 0, x: 30 }, { opacity: 1, x: 0, duration: 0.8, ease: 'power2.out' }, 1.5);

    return () => { tl.kill(); };
  }, [isActive]);

  return (
    <div ref={sectionRef} className="w-screen h-screen relative overflow-hidden flex-shrink-0">
      {/* Video Background */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover z-0"
        src="/assets/cover-loop.mp4"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
      />

      {/* SVG Line Drawing Overlay */}
      <svg
        className="svg-overlay absolute inset-0 w-full h-full z-[1] pointer-events-none mix-blend-overlay"
        style={{ opacity: 0.25 }}
        viewBox="0 0 250 300"
        preserveAspectRatio="xMidYMid meet"
      >
        <path
          ref={(el) => { if (el) svgPathsRef.current[0] = el; }}
          d={BUST_PATH}
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
        />
        <path
          ref={(el) => { if (el) svgPathsRef.current[1] = el; }}
          d={RELIEF_PATH}
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
        />
        <path
          ref={(el) => { if (el) svgPathsRef.current[2] = el; }}
          d={VASE_PATH}
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
        />
      </svg>

      {/* Scanlines + Vignette */}
      <div className="scanlines absolute inset-0 z-[2] pointer-events-none" />
      <div className="vignette absolute inset-0 z-[2] pointer-events-none" />

      {/* Dark gradient overlay */}
      <div
        className="absolute inset-0 z-[3] pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, transparent 40%, rgba(12,12,12,0.7) 100%)' }}
      />

      {/* Content Layer */}
      <div ref={contentRef} className="absolute inset-0 z-10">
        {/* Center-left title block */}
        <div
          className="absolute top-1/2 left-[5vw]"
          style={{ transform: 'translateY(-60%)', width: 'max(40vw, 500px)' }}
        >
          <div className="w-[60px] h-px bg-parchment mx-auto mb-6" />
          <p className="text-eyebrow text-muted-ivory text-center mb-2">THE</p>
          <h1 className="text-display text-parchment text-center leading-[0.95]">BRITISH</h1>
          <h1 className="text-display text-parchment text-center leading-[0.95]">MUSEUM</h1>
          <div className="w-[120px] h-px bg-bronze mx-auto mt-6 mb-6" />
          <p className="hero-subtitle text-subtitle text-muted-ivory text-center max-w-[450px] mx-auto leading-[1.6]" style={{ opacity: 0 }}>
            A Curated Journey Through Two and a Half Centuries of Human History
          </p>
        </div>

        {/* Right editorial sidebar */}
        <div
          className="editorial-sidebar absolute top-1/2 right-[5vw] -translate-y-1/2 w-[280px] p-8"
          style={{
            backgroundColor: 'rgba(244, 237, 228, 0.08)',
            borderLeft: '1px solid rgba(244, 237, 228, 0.2)',
            opacity: 0,
          }}
        >
          <p className="text-eyebrow text-bronze mb-3">ISSUE I</p>
          <div className="w-10 h-px bg-bronze mb-4" />
          <p className="text-body-small text-parchment leading-[1.7]">
            FROM THE ROSETTA STONE TO THE PARTHENON MARBLES
            <br /><br />
            EST. 1753 — PRESENT
          </p>
          <p className="text-body-small text-muted-ivory mt-4 leading-[1.7]">
            SIR HANS SLOANE'S COLLECTION TO THE MODERN GREAT COURT
          </p>
        </div>

        {/* Bottom bar */}
        <div
          className="bottom-panel absolute bottom-0 left-0 right-0 h-[20vh] flex items-end justify-between px-[5vw] pb-8"
          style={{
            background: 'linear-gradient(to top, rgba(12,12,12,0.9), transparent)',
            transform: 'translateY(100%)',
          }}
        >
          <div className="flex items-center gap-2">
            <span className="text-label text-muted-ivory tracking-[0.12em]">SCROLL TO EXPLORE</span>
            <div className="animate-bounce-arrow">
              <svg width="12" height="12" viewBox="0 0 12 12" className="text-bronze">
                <path d="M6 2 L6 10 M2 7 L6 11 L10 7" stroke="currentColor" strokeWidth="1" fill="none" />
              </svg>
            </div>
          </div>

          <span className="text-label text-muted-ivory tracking-[0.2em]">
            THE MUSEUM REVIEW / ISSUE I / 2026
          </span>

          <button
            onClick={onEnterGallery}
            className="hero-cta text-nav text-parchment border border-parchment px-8 py-3 bg-transparent hover:bg-parchment hover:text-ink transition-all duration-300 cursor-pointer"
            style={{ opacity: 0 }}
          >
            ENTER GALLERY
          </button>
        </div>
      </div>
    </div>
  );
}
