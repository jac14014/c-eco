import { useEffect, useRef } from 'react';

export default function CustomCursor() {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const posRef = useRef({ x: 0, y: 0 });
  const outerPosRef = useRef({ x: 0, y: 0 });
  const isHovering = useRef(false);
  const rafRef = useRef(0);

  useEffect(() => {
    // Hide on touch devices
    const hasHover = window.matchMedia('(hover: hover)').matches;
    if (!hasHover) return;

    document.body.style.cursor = 'none';

    const onMouseMove = (e: MouseEvent) => {
      posRef.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseDown = () => {
      if (outerRef.current) {
        outerRef.current.style.width = '16px';
        outerRef.current.style.height = '16px';
      }
    };
    const onMouseUp = () => {
      if (outerRef.current) {
        outerRef.current.style.width = isHovering.current ? '40px' : '20px';
        outerRef.current.style.height = isHovering.current ? '40px' : '20px';
      }
    };

    function animate() {
      outerPosRef.current.x += (posRef.current.x - outerPosRef.current.x) * 0.15;
      outerPosRef.current.y += (posRef.current.y - outerPosRef.current.y) * 0.15;

      if (outerRef.current) {
        outerRef.current.style.transform = `translate(${outerPosRef.current.x - (isHovering.current ? 20 : 10)}px, ${outerPosRef.current.y - (isHovering.current ? 20 : 10)}px)`;
        outerRef.current.style.width = isHovering.current ? '40px' : '20px';
        outerRef.current.style.height = isHovering.current ? '40px' : '20px';
      }

      if (innerRef.current) {
        innerRef.current.style.transform = `translate(${posRef.current.x - (isHovering.current ? 3 : 2)}px, ${posRef.current.y - (isHovering.current ? 3 : 2)}px)`;
        innerRef.current.style.width = isHovering.current ? '6px' : '4px';
        innerRef.current.style.height = isHovering.current ? '6px' : '4px';
      }

      rafRef.current = requestAnimationFrame(animate);
    }
    rafRef.current = requestAnimationFrame(animate);

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);

    // Event delegation for hover
    document.addEventListener('mouseover', (e) => {
      const target = e.target as HTMLElement;
      if (target.closest('a, button, [data-cursor-hover]')) {
        isHovering.current = true;
      }
    });
    document.addEventListener('mouseout', (e) => {
      const target = e.target as HTMLElement;
      if (target.closest('a, button, [data-cursor-hover]')) {
        isHovering.current = false;
      }
    });

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      document.body.style.cursor = '';
    };
  }, []);

  const hasHover = typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches;
  if (!hasHover) return null;

  return (
    <>
      <div
        ref={outerRef}
        className="fixed top-0 left-0 rounded-full border border-white/80 pointer-events-none z-[70] transition-[width,height] duration-200 ease-out"
        style={{ width: 20, height: 20, opacity: 0.8 }}
      />
      <div
        ref={innerRef}
        className="fixed top-0 left-0 rounded-full bg-white pointer-events-none z-[70]"
        style={{ width: 4, height: 4 }}
      />
    </>
  );
}
