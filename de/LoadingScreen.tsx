import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

interface LoadingScreenProps {
  onComplete: () => void;
}

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const tl = gsap.timeline();
    
    tl.fromTo(
      lineRef.current,
      { scaleX: 0 },
      { scaleX: 1, duration: 1.5, ease: 'power2.inOut' }
    );

    const assets = [
      '/assets/cover-loop.mp4',
      '/assets/rosetta-stone.jpg',
      '/assets/elgin-marbles.jpg',
      '/assets/sutton-hoo-helmet.jpg',
      '/assets/egyptian-mummy.jpg',
      '/assets/assyrian-relief.jpg',
      '/assets/history-museum.jpg',
      '/assets/reading-room.jpg',
      '/assets/museum-exterior.jpg',
    ];

    let loaded = 0;
    const total = assets.length;

    function checkAllLoaded() {
      loaded++;
      if (loaded >= total) {
        setTimeout(() => {
          setFading(true);
          gsap.to(overlayRef.current, {
            opacity: 0,
            duration: 0.4,
            ease: 'power2.out',
            onComplete,
          });
        }, 300);
      }
    }

    assets.forEach((src) => {
      if (src.endsWith('.mp4')) {
        const video = document.createElement('video');
        video.preload = 'auto';
        video.src = src;
        video.oncanplaythrough = checkAllLoaded;
        video.onerror = checkAllLoaded;
      } else {
        const img = new Image();
        img.onload = checkAllLoaded;
        img.onerror = checkAllLoaded;
        img.src = src;
      }
    });

    return () => {
      tl.kill();
    };
  }, [onComplete]);

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 bg-ink z-[100] flex flex-col items-center justify-center"
      style={{ opacity: fading ? undefined : 1 }}
    >
      <h1 className="text-display text-parchment mb-8 tracking-[0.02em]">THE MUSEUM REVIEW</h1>
      <div
        ref={lineRef}
        className="w-[60px] h-px bg-bronze origin-center"
        style={{ transform: 'scaleX(0)' }}
      />
    </div>
  );
}
