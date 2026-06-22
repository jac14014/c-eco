import { useEffect, useRef, useState, useCallback } from 'react';
import gsap from 'gsap';
import ProceduralPaperCanvas from './components/ProceduralPaperCanvas';
import Navigation from './components/Navigation';
import LoadingScreen from './components/LoadingScreen';
import InfoModal from './components/InfoModal';
import CustomCursor from './components/CustomCursor';
import CoverSpread from './sections/CoverSpread';
import FeaturedArtifacts from './sections/FeaturedArtifacts';
import HistorySpread from './sections/HistorySpread';
import WorldInside from './sections/WorldInside';
import VisitExplore from './sections/VisitExplore';

const PAGES = ['cover', 'featured', 'history', 'collection', 'visit'];

function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const isTransitioning = useRef(false);
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Page transition
  const goToPage = useCallback((targetPage: number) => {
    if (isTransitioning.current) return;
    if (targetPage < 0 || targetPage >= PAGES.length) return;
    if (targetPage === currentPage) return;

    isTransitioning.current = true;
    const direction = targetPage > currentPage ? 1 : -1;

    // Current page exit
    const currentEl = pageRefs.current[currentPage];
    const targetEl = pageRefs.current[targetPage];

    if (currentEl && targetEl) {
      // Prepare target
      gsap.set(targetEl, {
        x: direction * 100 + 'vw',
        opacity: 1,
        pointerEvents: 'auto',
        position: 'absolute',
        top: 0,
        left: 0,
      });

      const tl = gsap.timeline({
        onComplete: () => {
          setCurrentPage(targetPage);
          isTransitioning.current = false;
        },
      });

      // Slide current out
      tl.to(currentEl, {
        x: -direction * 100 + 'vw',
        duration: 0.8,
        ease: 'power3.inOut',
      }, 0);

      // Slide target in
      tl.to(targetEl, {
        x: '0vw',
        duration: 0.8,
        ease: 'power3.inOut',
      }, 0);
    } else {
      setCurrentPage(targetPage);
      isTransitioning.current = false;
    }
  }, [currentPage]);

  // Wheel-based horizontal navigation
  useEffect(() => {
    let accumulatedDelta = 0;
    const threshold = 80;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (isTransitioning.current) return;

      accumulatedDelta += Math.abs(e.deltaY) > Math.abs(e.deltaX) ? e.deltaY : e.deltaX;

      if (accumulatedDelta > threshold) {
        accumulatedDelta = 0;
        if (e.deltaY > 0 || e.deltaX > 0) {
          goToPage(Math.min(currentPage + 1, PAGES.length - 1));
        }
      } else if (accumulatedDelta < -threshold) {
        accumulatedDelta = 0;
        if (e.deltaY < 0 || e.deltaX < 0) {
          goToPage(Math.max(currentPage - 1, 0));
        }
      }
    };

    // Debounce reset
    let resetTimer: ReturnType<typeof setTimeout>;
    const debouncedWheel = (e: WheelEvent) => {
      onWheel(e);
      clearTimeout(resetTimer);
      resetTimer = setTimeout(() => { accumulatedDelta = 0; }, 200);
    };

    window.addEventListener('wheel', debouncedWheel, { passive: false });
    return () => {
      window.removeEventListener('wheel', debouncedWheel);
      clearTimeout(resetTimer);
    };
  }, [currentPage, goToPage]);

  // Touch/swipe support
  useEffect(() => {
    let touchStartX = 0;
    let touchStartY = 0;

    const onTouchStart = (e: TouchEvent) => {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (isTransitioning.current) return;
      const dx = e.changedTouches[0].clientX - touchStartX;
      const dy = e.changedTouches[0].clientY - touchStartY;

      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
        if (dx < 0) {
          goToPage(Math.min(currentPage + 1, PAGES.length - 1));
        } else {
          goToPage(Math.max(currentPage - 1, 0));
        }
      }
    };

    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    return () => {
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [currentPage, goToPage]);

  // Keyboard navigation
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (isTransitioning.current) return;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        goToPage(Math.min(currentPage + 1, PAGES.length - 1));
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        goToPage(Math.max(currentPage - 1, 0));
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [currentPage, goToPage]);

  const handleLoadComplete = useCallback(() => {
    setIsLoading(false);
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-ink">
      {/* Procedural Paper Canvas - behind everything */}
      <ProceduralPaperCanvas />

      {/* Custom Cursor */}
      <CustomCursor />

      {/* Loading Screen */}
      {isLoading && <LoadingScreen onComplete={handleLoadComplete} />}

      {/* Navigation */}
      {!isLoading && (
        <Navigation
          activePage={currentPage}
          onNavigate={goToPage}
          onInfoClick={() => setIsInfoOpen(true)}
        />
      )}

      {/* Info Modal */}
      <InfoModal isOpen={isInfoOpen} onClose={() => setIsInfoOpen(false)} />

      {/* Pages Container */}
      <div ref={containerRef} className="relative w-full h-full">
        {/* Page 0: Cover */}
        <div
          ref={(el) => { pageRefs.current[0] = el; }}
          className="absolute top-0 left-0 w-full h-full"
          style={{ zIndex: currentPage === 0 ? 10 : 1 }}
        >
          <CoverSpread isActive={!isLoading && currentPage === 0} onEnterGallery={() => goToPage(1)} />
        </div>

        {/* Page 1: Featured Artifacts */}
        <div
          ref={(el) => { pageRefs.current[1] = el; }}
          className="absolute top-0 left-0 w-full h-full"
          style={{
            transform: 'translateX(100vw)',
            opacity: 0,
            pointerEvents: 'none',
            zIndex: currentPage === 1 ? 10 : 1,
          }}
        >
          <FeaturedArtifacts isActive={!isLoading && currentPage === 1} />
        </div>

        {/* Page 2: History */}
        <div
          ref={(el) => { pageRefs.current[2] = el; }}
          className="absolute top-0 left-0 w-full h-full"
          style={{
            transform: 'translateX(100vw)',
            opacity: 0,
            pointerEvents: 'none',
            zIndex: currentPage === 2 ? 10 : 1,
          }}
        >
          <HistorySpread isActive={!isLoading && currentPage === 2} />
        </div>

        {/* Page 3: World Inside */}
        <div
          ref={(el) => { pageRefs.current[3] = el; }}
          className="absolute top-0 left-0 w-full h-full"
          style={{
            transform: 'translateX(100vw)',
            opacity: 0,
            pointerEvents: 'none',
            zIndex: currentPage === 3 ? 10 : 1,
          }}
        >
          <WorldInside isActive={!isLoading && currentPage === 3} />
        </div>

        {/* Page 4: Visit */}
        <div
          ref={(el) => { pageRefs.current[4] = el; }}
          className="absolute top-0 left-0 w-full h-full"
          style={{
            transform: 'translateX(100vw)',
            opacity: 0,
            pointerEvents: 'none',
            zIndex: currentPage === 4 ? 10 : 1,
          }}
        >
          <VisitExplore isActive={!isLoading && currentPage === 4} onBackToTop={() => goToPage(0)} />
        </div>
      </div>

      {/* Page indicator dots */}
      {!isLoading && (
        <div className="fixed right-6 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-3">
          {PAGES.map((_, i) => (
            <button
              key={i}
              onClick={() => goToPage(i)}
              className={`w-2 h-2 rounded-full transition-all duration-300 cursor-pointer border-none ${
                i === currentPage ? 'bg-parchment scale-125' : 'bg-muted-ivory/50 hover:bg-muted-ivory'
              }`}
              aria-label={`Go to page ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default App;
