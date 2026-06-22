import { useEffect, useRef } from 'react';
import gsap from 'gsap';

interface VisitExploreProps {
  isActive: boolean;
  onBackToTop: () => void;
}

export default function VisitExplore({ isActive, onBackToTop }: VisitExploreProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!isActive || hasAnimated.current || !sectionRef.current) return;
    hasAnimated.current = true;

    const tl = gsap.timeline();

    // Background
    tl.fromTo('.visit-bg', { opacity: 0, scale: 1.05 }, { opacity: 1, scale: 1, duration: 1.5, ease: 'power2.out' });

    // Top section
    tl.fromTo('.visit-top-left', { opacity: 0, x: -40 }, { opacity: 1, x: 0, duration: 0.8, ease: 'power3.out' }, 0.3);
    tl.fromTo('.visit-top-right', { opacity: 0, x: 40 }, { opacity: 1, x: 0, duration: 0.8, ease: 'power3.out' }, 0.4);

    // Center CTA
    tl.fromTo('.visit-title', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }, 0.6);
    tl.fromTo('.visit-desc', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6 }, 1.0);
    tl.fromTo('.visit-btn', { opacity: 0, y: 20 }, { opacity: 1, y: 0, stagger: 0.15, duration: 0.6 }, 1.3);

    // Bottom bar
    tl.fromTo('.visit-bottom', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' }, 1.5);

    return () => { tl.kill(); };
  }, [isActive]);

  return (
    <div ref={sectionRef} className="w-screen h-screen relative overflow-hidden flex-shrink-0">
      {/* Background Image */}
      <img
        src="/assets/museum-exterior.jpg"
        alt="British Museum at Golden Hour"
        className="visit-bg absolute inset-0 w-full h-full object-cover z-0"
        style={{ opacity: 0 }}
      />

      {/* Dark Overlay */}
      <div
        className="absolute inset-0 z-[1] pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, rgba(12,12,12,0.5) 0%, rgba(12,12,12,0.75) 100%)' }}
      />

      {/* Content Layer */}
      <div className="absolute inset-0 z-10 flex flex-col justify-between p-[6rem_5vw_3rem]">
        {/* Top Section */}
        <div className="flex justify-between items-start">
          <div className="visit-top-left" style={{ opacity: 0 }}>
            <p className="text-eyebrow text-bronze mb-2">VISIT & EXPLORE</p>
            <div className="w-[60px] h-px bg-bronze mb-4" />
            <h2 className="text-section-title text-parchment max-w-[500px] mt-4">THE BRITISH MUSEUM</h2>
            <p className="text-body text-parchment/80 mt-2">Great Russell Street, London WC1B 3DG</p>
          </div>

          <div className="visit-top-right text-right" style={{ opacity: 0 }}>
            <p className="text-eyebrow text-parchment mb-1">ADMISSION FREE</p>
            <p className="text-body-small text-muted-ivory">OPEN DAILY 10:00 — 17:00</p>
            <p className="text-body-small text-muted-ivory">FRIDAYS UNTIL 20:30</p>
          </div>
        </div>

        {/* Center CTA */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center max-w-[700px]">
          <h2 className="visit-title text-display text-parchment" style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', opacity: 0 }}>
            The Museum Review
          </h2>
          <p className="visit-desc text-body text-parchment/80 leading-[1.7] mt-6" style={{ opacity: 0 }}>
            An editorial publication exploring the collections, history, and cultural significance of one of the world's greatest museums.
          </p>
          <div className="flex gap-6 justify-center mt-12">
            <a
              href="https://www.britishmuseum.org/visit"
              target="_blank"
              rel="noopener noreferrer"
              className="visit-btn text-nav bg-parchment text-ink px-10 py-4 tracking-[0.1em] hover:bg-bronze hover:text-parchment transition-all duration-300"
              style={{ opacity: 0 }}
            >
              PLAN YOUR VISIT
            </a>
            <a
              href="https://www.britishmuseum.org/collection"
              target="_blank"
              rel="noopener noreferrer"
              className="visit-btn text-nav border border-parchment text-parchment px-10 py-4 tracking-[0.1em] hover:bg-parchment hover:text-ink transition-all duration-300"
              style={{ opacity: 0 }}
            >
              EXPLORE THE COLLECTION
            </a>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="visit-bottom absolute bottom-0 left-0 right-0 border-t border-charcoal px-[5vw] py-8" style={{ opacity: 0 }}>
          <div className="flex justify-between items-end">
            {/* Left: Social */}
            <div>
              <p className="text-eyebrow text-bronze mb-3">STAY CONNECTED</p>
              <div className="flex gap-8">
                <a href="#" className="text-nav text-muted-ivory hover:text-parchment transition-colors duration-300">Instagram</a>
                <a href="#" className="text-nav text-muted-ivory hover:text-parchment transition-colors duration-300">Twitter</a>
                <a href="#" className="text-nav text-muted-ivory hover:text-parchment transition-colors duration-300">Newsletter</a>
              </div>
            </div>

            {/* Center: Identity */}
            <div className="text-center">
              <p className="text-masthead text-parchment tracking-[0.25em]">THE MUSEUM REVIEW</p>
              <p className="text-label text-muted-ivory mt-2 tracking-[0.12em]">ISSUE I &middot; 2026</p>
            </div>

            {/* Right: Explore */}
            <div className="text-right">
              <p className="text-eyebrow text-bronze mb-3">MORE TO EXPLORE</p>
              <div className="flex flex-col gap-1 items-end">
                <button onClick={onBackToTop} className="text-nav text-muted-ivory hover:text-parchment transition-colors duration-300 cursor-pointer bg-transparent border-none">
                  About the Publication
                </button>
                <button onClick={onBackToTop} className="text-nav text-muted-ivory hover:text-parchment transition-colors duration-300 cursor-pointer bg-transparent border-none">
                  Provenance & Ethics
                </button>
                <button onClick={onBackToTop} className="text-nav text-muted-ivory hover:text-parchment transition-colors duration-300 cursor-pointer bg-transparent border-none">
                  Colonial Histories
                </button>
              </div>
            </div>
          </div>

          {/* Bottom copyright */}
          <div className="flex justify-between items-center mt-8 pt-4 border-t border-charcoal/50">
            <span className="text-label text-muted-ivory tracking-[0.12em]">EST. 1753</span>
            <span className="text-label text-muted-ivory tracking-[0.12em]">&copy; 2026 THE MUSEUM REVIEW</span>
            <button
              onClick={onBackToTop}
              className="text-label text-muted-ivory hover:text-parchment tracking-[0.12em] transition-colors duration-300 cursor-pointer bg-transparent border-none"
            >
              BACK TO TOP
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
