import { useEffect, useRef } from 'react';
import gsap from 'gsap';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function InfoModal({ isOpen, onClose }: InfoModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    if (!overlayRef.current || !modalRef.current) return;

    if (isOpen) {
      const tl = gsap.timeline();
      tl.fromTo(overlayRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3 });
      tl.fromTo(
        modalRef.current,
        { opacity: 0, scale: 0.95 },
        { opacity: 1, scale: 1, duration: 0.3, ease: 'power2.out' },
        0
      );
      tlRef.current = tl;
    } else {
      const tl = gsap.timeline();
      tl.to(modalRef.current, { opacity: 0, scale: 0.95, duration: 0.2 });
      tl.to(overlayRef.current, { opacity: 0, duration: 0.2 }, 0);
      tlRef.current = tl;
    }

    return () => {
      tlRef.current?.kill();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[60] flex items-center justify-center"
      style={{ backgroundColor: 'rgba(12, 12, 12, 0.6)', backdropFilter: 'blur(12px)' }}
      onClick={onClose}
    >
      <div
        ref={modalRef}
        className="bg-parchment max-w-[600px] w-[90vw] p-12 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 rounded-full border-2 border-ink flex items-center justify-center text-label text-ink hover:bg-ink hover:text-parchment transition-colors duration-300 cursor-pointer bg-transparent"
        >
          CLOSE
        </button>

        <div className="text-center mt-4">
          <h2 className="text-masthead text-ink tracking-[0.25em] mb-2">THE MUSEUM REVIEW</h2>
          <p className="text-label text-stone tracking-[0.12em] mb-8">ISSUE I / 2026</p>

          <p className="text-body text-stone mb-8 max-w-md mx-auto leading-relaxed">
            The Museum Review is an editorial digital publication exploring the British Museum's
            collections, history, and cultural significance.
          </p>

          <div className="space-y-3 mb-8">
            <div className="flex justify-between text-body-small text-stone">
              <span className="text-label text-stone">DESIGN</span>
              <span>Editorial Digital Experience</span>
            </div>
            <div className="flex justify-between text-body-small text-stone">
              <span className="text-label text-stone">DEVELOPMENT</span>
              <span>React + GSAP + WebGL</span>
            </div>
            <div className="flex justify-between text-body-small text-stone">
              <span className="text-label text-stone">RESEARCH</span>
              <span>British Museum Archives</span>
            </div>
            <div className="flex justify-between text-body-small text-stone">
              <span className="text-label text-stone">TYPOGRAPHY</span>
              <span>Oranienbaum + Cormorant Garamond</span>
            </div>
          </div>

          <p className="text-label text-muted-ivory tracking-[0.12em]">
            A CURATED DIGITAL PUBLICATION
          </p>
        </div>
      </div>
    </div>
  );
}
