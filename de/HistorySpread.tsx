import { useEffect, useRef } from 'react';
import gsap from 'gsap';

interface HistorySpreadProps {
  isActive: boolean;
}

const TIMELINE_ENTRIES = [
  {
    year: '1753',
    title: 'The Sloane Bequest',
    desc: "Sir Hans Sloane bequeaths his collection of 71,000 objects to King George II for the nation, forming the foundation of the British Museum. The collection includes natural history specimens, antiquities, and ethnographic material from around the world.",
  },
  {
    year: '1759',
    title: 'Opening to the Public',
    desc: 'The British Museum opens its doors on January 15th at Montagu House in Bloomsbury. Admission is free, but visitors must apply for tickets and are limited to guided tours of small groups.',
  },
  {
    year: '1802',
    title: 'The Rosetta Stone Arrives',
    desc: 'The Rosetta Stone is transferred to the museum from the Society of Antiquaries, becoming one of its most significant holdings and eventually its most visited object.',
  },
  {
    year: '1816',
    title: 'The Parthenon Marbles',
    desc: 'The Elgin Marbles are purchased by Parliament and placed in the British Museum, where they remain one of the most debated and admired collections of classical sculpture.',
  },
  {
    year: '1857',
    title: 'The Round Reading Room',
    desc: 'The famous domed Round Reading Room opens in the museum\'s central courtyard. It becomes a center of scholarship, frequented by Karl Marx, Oscar Wilde, and countless researchers.',
  },
  {
    year: '1881',
    title: 'The Natural History Division',
    desc: 'The natural history collections are moved to a new building in South Kensington, forming what would become the Natural History Museum. The British Museum focuses on antiquities, ethnography, and art.',
  },
  {
    year: '1973',
    title: 'The Library Departs',
    desc: 'The British Museum Library — which held the nation\'s most important manuscripts and printed books — merges with other national collections to form the British Library, moving to a new site at St Pancras.',
  },
  {
    year: '2000',
    title: 'The Great Court Opens',
    desc: "The Queen Elizabeth II Great Court opens, transforming the museum's central courtyard with its spectacular glass-and-steel lattice roof designed by Norman Foster. It becomes the largest covered public square in Europe.",
  },
  {
    year: '2023',
    title: 'The Modern Era',
    desc: 'The museum celebrates 270 years with renewed focus on digitization, provenance research, and addressing the complex colonial histories embedded in its collection of over 8 million objects.',
  },
];

export default function HistorySpread({ isActive }: HistorySpreadProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const rightPanelRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (!isActive || hasAnimated.current || !sectionRef.current) return;
    hasAnimated.current = true;

    const tl = gsap.timeline();

    // Left panel
    tl.fromTo('.history-left', { opacity: 0 }, { opacity: 1, duration: 1, ease: 'power2.out' });
    tl.fromTo('.history-overlay-text', { opacity: 0, y: 50 }, { opacity: 1, y: 0, stagger: 0.15, duration: 0.8 }, 0.3);

    // Right panel
    tl.fromTo('.history-right', { x: '50vw' }, { x: '0', duration: 1, ease: 'power3.out' }, 0);
    tl.fromTo('.history-header', { opacity: 0 }, { opacity: 1, duration: 0.6 }, 0.4);
    tl.fromTo('.history-progress-track', { scaleX: 0 }, { scaleX: 1, duration: 0.5, transformOrigin: 'left' }, 0.3);
    tl.fromTo('.timeline-entry', { opacity: 0, x: 30 }, { opacity: 1, x: 0, stagger: 0.1, duration: 0.6, ease: 'power2.out' }, 0.6);

    // Scroll-driven progress bar
    const updateProgress = () => {
      if (!rightPanelRef.current || !progressRef.current) return;
      const scrollTop = rightPanelRef.current.scrollTop;
      const scrollHeight = rightPanelRef.current.scrollHeight - rightPanelRef.current.clientHeight;
      const progress = scrollHeight > 0 ? scrollTop / scrollHeight : 0;
      progressRef.current.style.width = `${progress * 100}%`;
    };

    rightPanelRef.current?.addEventListener('scroll', updateProgress);

    return () => {
      tl.kill();
      rightPanelRef.current?.removeEventListener('scroll', updateProgress);
    };
  }, [isActive]);

  return (
    <div ref={sectionRef} className="w-screen h-screen relative overflow-hidden flex-shrink-0">
      {/* Left Image Panel */}
      <div className="history-left absolute top-0 left-0 w-1/2 h-full overflow-hidden" style={{ opacity: 0 }}>
        <img
          src="/assets/history-museum.jpg"
          alt="British Museum Historical Exterior"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-ink/30" />

        {/* Text overlay */}
        <div className="absolute bottom-[8vh] left-[4vw] max-w-[36vw]">
          <p className="history-overlay-text text-eyebrow text-bronze mb-2" style={{ opacity: 0 }}>ESTABLISHED</p>
          <h2 className="history-overlay-text text-display text-parchment leading-[0.95]" style={{ opacity: 0, fontSize: 'clamp(5rem, 8vw, 7rem)' }}>1753</h2>
          <p className="history-overlay-text text-subtitle text-parchment/80 max-w-[320px] mt-4" style={{ opacity: 0 }}>
            A PUBLIC INSTITUTION FOR THE ILLUSTRATION OF HISTORY
          </p>
          <div className="history-overlay-text w-20 h-px bg-bronze mt-4" style={{ opacity: 0 }} />
        </div>
      </div>

      {/* Right Content Panel */}
      <div
        ref={rightPanelRef}
        className="history-right absolute top-0 right-0 w-1/2 h-full bg-parchment overflow-y-auto"
        style={{ transform: 'translateX(50vw)' }}
      >
        {/* Sticky progress track */}
        <div className="sticky top-8 left-0 right-0 h-0.5 bg-deep-parchment z-10 mx-[4vw]">
          <div
            ref={progressRef}
            className="history-progress-track h-full bg-bronze origin-left"
            style={{ width: '0%' }}
          />
        </div>

        {/* Header */}
        <div className="history-header pt-16 px-[4vw] pb-8" style={{ opacity: 0 }}>
          <h2 className="text-section-title text-ink">THE HISTORY</h2>
          <p className="text-eyebrow text-stone mt-1">OF THE BRITISH MUSEUM</p>
          <div className="w-[60px] h-px bg-bronze mt-4" />
        </div>

        {/* Timeline Entries */}
        <div className="px-[4vw] pb-16 space-y-12">
          {TIMELINE_ENTRIES.map((entry, i) => (
            <div key={entry.year} className="timeline-entry flex" style={{ opacity: 0 }}>
              <div className="w-[120px] flex-shrink-0">
                <span className="font-display text-bronge text-ink" style={{ fontSize: 'clamp(2rem, 3vw, 2.5rem)' }}>
                  {entry.year}
                </span>
              </div>
              <div className="flex-1">
                <h3 className="text-heading text-ink mb-2">{entry.title}</h3>
                <p className="text-body text-stone leading-[1.7]">{entry.desc}</p>
                {i === 4 && (
                  <img
                    src="/assets/reading-room.jpg"
                    alt="The Round Reading Room"
                    className="w-full aspect-video object-cover mt-4 border border-deep-parchment"
                  />
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Quote */}
        <div className="px-[4vw] py-8 border-t border-deep-parchment">
          <p className="text-body italic text-stone text-center leading-[1.7]">
            "The museum's collection tells the story of human culture from its beginnings to the present day."
          </p>
          <p className="text-label text-muted-ivory text-center mt-4 tracking-[0.12em]">
            — SIR HANS SLOANE, 1753
          </p>
        </div>
      </div>
    </div>
  );
}
