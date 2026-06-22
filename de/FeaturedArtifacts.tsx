import { useEffect, useRef } from 'react';
import gsap from 'gsap';

interface FeaturedArtifactsProps {
  isActive: boolean;
}

const ARTIFACTS = [
  {
    num: 'II',
    name: 'THE ELGIN MARBLES',
    period: '5TH CENTURY BC',
    desc: 'Classical Greek sculptures from the Parthenon, depicting the Panathenaic procession and mythological battles.',
    image: '/assets/elgin-marbles.jpg',
  },
  {
    num: 'III',
    name: 'THE SUTTON HOO HELMET',
    period: 'C. 625 AD',
    desc: 'An Anglo-Saxon ceremonial helmet discovered in a ship burial, one of the most important archaeological finds in British history.',
    image: '/assets/sutton-hoo-helmet.jpg',
  },
  {
    num: 'IV',
    name: 'THE EGYPTIAN MUMMY OF KATEBET',
    period: '19TH DYNASTY',
    desc: 'The decorated coffin and mummy of a Theban priestess, preserved for over 3,000 years with intricate painted detail.',
    image: '/assets/egyptian-mummy.jpg',
  },
  {
    num: 'V',
    name: 'THE ASSYRIAN LION HUNT RELIEFS',
    period: 'C. 645 BC',
    desc: 'Palace wall panels from Nineveh depicting King Ashurbanipal\'s ceremonial lion hunts in extraordinary detail.',
    image: '/assets/assyrian-relief.jpg',
  },
];

export default function FeaturedArtifacts({ isActive }: FeaturedArtifactsProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!isActive || hasAnimated.current || !sectionRef.current) return;
    hasAnimated.current = true;

    const tl = gsap.timeline();

    // Left panel slides in
    tl.fromTo('.featured-left', { x: '-100%' }, { x: '0%', duration: 1, ease: 'power3.out' });
    tl.fromTo('.featured-img', { scale: 1.1 }, { scale: 1, duration: 1.2, ease: 'power2.out' }, 0);

    // Text elements fade up
    tl.fromTo('.featured-eyebrow', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6 }, 0.3);
    tl.fromTo('.featured-title', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8 }, 0.5);
    tl.fromTo('.featured-meta', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6 }, 0.7);
    tl.fromTo('.featured-desc', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6 }, 0.8);
    tl.fromTo('.featured-readmore', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6 }, 0.9);

    // Right panel slides in
    tl.fromTo('.featured-right', { x: '100%' }, { x: '0%', duration: 1, ease: 'power3.out' }, 0.2);
    tl.fromTo('.featured-header', { opacity: 0 }, { opacity: 1, duration: 0.6 }, 0.6);
    tl.fromTo('.artifact-card', { opacity: 0, y: 40 }, { opacity: 1, y: 0, stagger: 0.15, duration: 0.7, ease: 'power2.out' }, 0.8);
    tl.fromTo('.featured-bottom-note', { opacity: 0 }, { opacity: 1, duration: 0.5 }, 1.2);

    return () => { tl.kill(); };
  }, [isActive]);

  return (
    <div ref={sectionRef} className="w-screen h-screen relative overflow-hidden flex-shrink-0">
      {/* Left Featured Panel */}
      <div className="featured-left absolute top-0 left-0 w-[58vw] h-full overflow-hidden" style={{ transform: 'translateX(-100%)' }}>
        <img
          src="/assets/rosetta-stone.jpg"
          alt="The Rosetta Stone"
          className="featured-img absolute inset-0 w-full h-full object-cover"
        />
        {/* Dark gradient on left edge */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'linear-gradient(to right, rgba(12,12,12,0.7) 0%, transparent 40%)' }}
        />

        {/* Text block */}
        <div className="absolute bottom-[10vh] left-[5vw] max-w-[38vw]">
          <p className="featured-eyebrow text-eyebrow text-bronze mb-2" style={{ opacity: 0 }}>FEATURED ARTIFACT</p>
          <div className="w-[60px] h-px bg-bronze mb-4" />
          <h2 className="featured-title text-section-title text-parchment mb-2" style={{ opacity: 0 }}>THE ROSETTA STONE</h2>
          <p className="featured-meta text-label text-muted-ivory tracking-[0.12em] mb-4" style={{ opacity: 0 }}>
            196 BC &middot; GRANODIORITE &middot; DISCOVERED 1799
          </p>
          <p className="featured-desc text-body text-parchment/85 max-w-[420px] leading-[1.7] mb-4" style={{ opacity: 0 }}>
            The key to deciphering Egyptian hieroglyphs, this granodiorite stele has been one of the British Museum's most visited objects since 1802. Its trilingual inscription — in hieroglyphic, Demotic, and Ancient Greek — unlocked three millennia of recorded history.
          </p>
          <a
            href="#"
            className="featured-readmore text-nav text-bronze inline-flex items-center gap-2 group relative" style={{ opacity: 0 }}
          >
            READ MORE
            <span className="group-hover:translate-x-1 transition-transform duration-200">&rarr;</span>
            <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-bronze group-hover:w-full transition-all duration-300" />
          </a>
        </div>
      </div>

      {/* Right Content Area */}
      <div
        className="featured-right absolute top-0 right-0 w-[42vw] h-full bg-parchment overflow-y-auto"
        style={{ transform: 'translateX(100%)' }}
      >
        {/* Header */}
        <div className="featured-header pt-12 px-[3vw] pb-6" style={{ opacity: 0 }}>
          <p className="text-eyebrow text-stone mb-2">COLLECTION HIGHLIGHTS</p>
          <div className="w-10 h-px bg-bronze" />
        </div>

        {/* Artifact Cards */}
        <div className="px-[3vw] pb-12 space-y-6">
          {ARTIFACTS.map((artifact) => (
            <div
              key={artifact.num}
              className="artifact-card flex border border-deep-parchment overflow-hidden group cursor-pointer"
              style={{ opacity: 0 }}
            >
              <div className="w-[35%] overflow-hidden">
                <img
                  src={artifact.image}
                  alt={artifact.name}
                  className="w-full aspect-[4/3] object-cover group-hover:scale-[1.03] transition-transform duration-400 ease-out"
                />
              </div>
              <div className="w-[65%] pl-6 py-4 pr-4 flex flex-col justify-center">
                <p className="text-artifact-number text-stone mb-1">{artifact.num}</p>
                <p className="text-artifact-label text-ink mb-1">{artifact.name}</p>
                <p className="text-body-small text-stone line-clamp-2">{artifact.desc}</p>
                <span className="text-label text-bronze mt-2 inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform duration-200">
                  VIEW &rarr;
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom note */}
        <div className="featured-bottom-note absolute bottom-12 right-[3vw]" style={{ opacity: 0 }}>
          <p className="text-label text-muted-ivory tracking-[0.12em]">5 OBJECTS &middot; 2 MILLION YEARS OF HISTORY</p>
        </div>
      </div>
    </div>
  );
}
