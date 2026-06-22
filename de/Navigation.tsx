import { useEffect, useRef, useState } from 'react';

interface NavigationProps {
  activePage: number;
  onNavigate: (page: number) => void;
  onInfoClick: () => void;
}

const NAV_ITEMS = [
  { label: 'FEATURED', page: 1 },
  { label: 'HISTORY', page: 2 },
  { label: 'COLLECTION', page: 3 },
  { label: 'VISIT', page: 4 },
];

export default function Navigation({ activePage, onNavigate, onInfoClick }: NavigationProps) {
  const [visible, setVisible] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <nav
      ref={navRef}
      className="fixed top-0 left-0 w-full h-[4.5rem] flex items-center justify-between px-[5vw] z-50 transition-opacity duration-700"
      style={{
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? 'auto' : 'none',
      }}
    >
      {/* Left: Masthead */}
      <div className="flex flex-col">
        <div className="w-10 h-px bg-bronze mb-1.5" />
        <span className="text-masthead text-parchment tracking-[0.25em]">THE MUSEUM REVIEW</span>
        <span className="text-label text-muted-ivory tracking-[0.12em] mt-0.5">LONDON</span>
      </div>

      {/* Center: Section links */}
      <div className="hidden md:flex items-center gap-8">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.label}
            onClick={() => onNavigate(item.page)}
            className="relative text-nav text-muted-ivory hover:text-parchment transition-colors duration-300 cursor-pointer bg-transparent border-none"
          >
            {item.label}
            {activePage === item.page && (
              <span className="absolute -bottom-1 left-0 w-full h-px bg-parchment" />
            )}
          </button>
        ))}
      </div>

      {/* Right: Info button */}
      <button
        onClick={onInfoClick}
        className="w-10 h-10 rounded-full border-2 border-muted-ivory flex items-center justify-center text-label text-muted-ivory hover:border-parchment hover:text-parchment transition-colors duration-300 cursor-pointer bg-transparent"
      >
        INFO
      </button>
    </nav>
  );
}
