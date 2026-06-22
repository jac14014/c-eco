# Technical Specification — The Museum Review

## Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| react | ^19.0.0 | UI framework |
| react-dom | ^19.0.0 | React DOM renderer |
| vite | ^6.0.0 | Build tool |
| @vitejs/plugin-react | ^4.4.0 | Vite React plugin |
| typescript | ^5.7.0 | Type safety |
| tailwindcss | ^4.0.0 | Utility CSS |
| @tailwindcss/vite | ^4.0.0 | Tailwind Vite integration |
| gsap | ^3.12.0 | Core animation engine (ScrollTrigger, SplitText, DrawSVG plugins) |
| lenis | ^1.2.0 | Smooth horizontal scroll |
| split-type | ^1.0.0 | Character-level text splitting for reveal animations |
| @fontsource/oranienbaum | ^5.0.0 | Display serif font (self-hosted) |
| @fontsource/cormorant-garamond | ^5.0.0 | Body serif font, weights 400+500+600 (self-hosted) |
| vite-plugin-glsl | ^1.3.0 | Import .glsl shader files as strings |

## Component Inventory

### Layout

| Component | Source | Notes |
|-----------|--------|-------|
| Navigation | Custom | Fixed top, transparent. Highlights active section via horizontal-scroll position. Contains InfoModal trigger. |
| Footer | Custom | Anchored at page 5 bottom. "BACK TO TOP" scrolls to page 1. |
| InfoModal | Custom | Centered overlay with editorial credits. GSAP timeline for enter/exit. |
| CustomCursor | Custom | Two-layer div cursor (outer ring + inner dot). Hidden on touch devices. |
| LoadingScreen | Custom | Full-viewport ink overlay with masthead + bronze line. Fades on asset ready. |
| PageTransitionController | Custom | Orchestrates page-to-page slide animations + parchment sweep line. Manages transition lock (600ms). |

### Page Sections

| Component | Source | Notes |
|-----------|--------|-------|
| CoverSpread | Custom | Hero: video layer + SVG line animation layer + scanlines/vignette overlay. Complex 7-step entrance timeline. |
| FeaturedArtifacts | Custom | Split layout: 58vw featured image panel + 42vw card grid. Left panel has dark edge gradient for text. |
| HistorySpread | Custom | 50/50 split: left parallax image + right scrolling timeline panel with sticky progress track. |
| WorldInside | Custom | Bronze texture canvas background + typographic manifesto + 5 animated route bars. |
| VisitSpread | Custom | Full-bleed exterior photo + gradient overlay + centered CTA block + bottom 3-column footer nav. |

### Reusable Components

| Component | Source | Used By |
|-----------|--------|---------|
| ProceduralPaperCanvas | Custom (WebGL) | Global background — fixed canvas, z-index 0, on all pages except VisitSpread. |
| BronzeTextureCanvas | Custom (Canvas 2D) | WorldInside background layer only. Simplex noise field animated at 0.02 units/sec. |
| TextReveal | Custom | All spreads. Wraps SplitType + GSAP ScrollTrigger for character-staggered text entrances. |
| ParallaxImage | Custom | HistorySpread left panel, VisitSpread background. GSAP ScrollTrigger-driven translateY. |
| ArtifactCard | Custom | FeaturedArtifacts right panel (×4). Image thumbnail + metadata + hover scale. |
| TimelineEntry | Custom | HistorySpread right panel (×9). Year + title + description, optional image. |
| RouteBar | Custom | WorldInside (×5). Origin flag + route name + arrow, hover shift animation. |
| SectionHeader | Custom | Multiple pages. Decorative line + eyebrow + title pattern. |

## Animation Implementation

| Animation | Library | Approach | Complexity |
|-----------|---------|----------|------------|
| Procedural Paper Canvas (WebGL shader) | Raw WebGL | Single fullscreen quad. Value noise + FBM (3 octaves). 4 uniforms (time, resolution, paperColor, inkColor, accentColor). requestAnimationFrame loop. Pixel ratio capped at 2. | **High** 🔒 |
| Bronze Texture Canvas (Canvas 2D) | Raw Canvas 2D | Simplex noise field mapped to bronze palette. Low-res cell grid (~8px), time-driven offset at 0.02u/s. requestAnimationFrame loop. Opacity 0.4. | **High** 🔒 |
| Cover Hero Opening Sequence | GSAP timeline | Single master timeline: camera push-in (scale 1.05→1.0) → SVG line drawing (stroke-dashoffset 2000→0, 3 paths staggered) → decorative line scaleX → masthead SplitText stagger → subtitle fade → bottom panel slideY → CTA fade. 7 steps with precise delays. | **High** 🔒 |
| SVG Artifact Line Drawing | GSAP | 3 SVG `<path>` elements with stroke-dasharray/dashoffset animation. Sequential trigger (bust 0s, relief 1.5s, vase 3s). Fade-out at 4.75s + reset loop. | **Medium** |
| Page Turn Transitions | GSAP | Leaving: content translateX 0→-100vw (800ms, power3.inOut). Entering: content translateX 100vw→0 (800ms). Parchment sweep line: scaleX 0→1 (600ms) then translateX 0→100vw (400ms). 600ms lock prevents overlap. | **High** 🔒 |
| Custom Cursor | GSAP / RAF | Two fixed-position divs. Outer ring: lerp 0.15 follow. Inner dot: lerp 0.5 follow. Hover detection scales outer to 40px, inner to 6px. Click spring animation. Disabled on touch. | **Medium** |
| Text Reveal (character stagger) | SplitType + GSAP + ScrollTrigger | SplitType splits into chars. GSAP animates opacity 0→1, translateY 60%→0. Stagger 0.015s/char, 1s duration, power2.out. ScrollTrigger fires at horizontal threshold (left edge crosses 80% viewport). | **Medium** |
| Image Parallax + Clip Reveal | GSAP + ScrollTrigger | Clip-path inset(0 100% 0 0)→inset(0 0 0 0) over 1.2s. Inner image scale 1.1→1.0 over 1.4s. Trigger at 75% horizontal viewport. Parallax via ScrollTrigger scrub on translateY. | **Medium** |
| Fade Up (shared pattern) | GSAP + ScrollTrigger | Opacity 0→1, translateY 30px→0, 0.8s, power2.out, stagger 0.1s. Reused across all pages. | **Low** |
| History Timeline Scroll Progress | GSAP ScrollTrigger | Bronze progress line width 0%→100%, scrub: 1. Year text brightens (bronze→ochre) as line reaches each node. Right panel scrolls vertically while left image stays fixed. | **Medium** |
| Cover Scroll/CTA Bounce | GSAP | Arrow translateY oscillates 0→8px, 1.5s, ease-in-out, yoyo repeat -1. | **Low** |
| Loading Screen | GSAP | Bronze line scaleX 0→1 (1.5s, power2.inOut). Masthead opacity 0→1. Fade-out overlay (opacity→0, 400ms) on asset ready. Triggers hero timeline on complete. | **Low** |
| InfoModal Enter/Exit | GSAP | Enter: overlay opacity 0→1 (300ms), modal scale 0.95→1.0 + opacity (300ms, ease-out). Exit: reverse, 200ms. | **Low** |
| Card/Image Hover | CSS transitions | Image scale 1.03 on hover (overflow hidden, 400ms ease-out). Link underline scaleX 0→1. Arrow translateX shift. No JS needed. | **Low** |
| Route Bar Entrance | GSAP + ScrollTrigger | Each bar: translateX -60px→0, opacity 0→1, stagger 0.12s, 0.7s, power2.out. Arrow bounce 0→4px→0 after settle. | **Medium** |
| WorldInside Header Reveal | GSAP | Line scaleX 0→1 (0.6s, power3.inOut). Eyebrow fade (0.5s, delay 0.2s). "INSIDE" SplitText character stagger (0.03s/char, 0.8s, power2.out, delay 0.4s). | **Medium** |
| Page-Specific Entrance Sequences | GSAP timelines | Each spread has a coordinated entrance timeline (see design docs for per-page choreography). Triggered by page-transition completion. | **Medium** |

## State & Logic Plan

### Horizontal Scroll Architecture

Lenis is configured with `orientation: 'horizontal'`, `gestureOrientation: 'both'`, `wheelMultiplier: 0.7` (desktop) / `1.2` (mobile). The DOM arranges five spreads as `position: absolute` layers within a single flex row. Each spread is toggled via `opacity` and `pointer-events`.

**PageTransitionController** manages:
- Current page index (0–4)
- Transition lock boolean (600ms cooldown)
- `scrollToPage(targetIndex)` method: validates lock, plays leave animation, swaps active spread, plays enter animation, releases lock
- Navigation sync: updates Navigation active link after transition completes
- Lenis scroll event listener detecting page boundaries (scrollLeft ≈ pageIndex × innerWidth)

### Custom Cursor State

Managed in CustomCursor component:
- Mouse position: tracked via `mousemove` listener, updated with RAF lerp interpolation
- Hover state: detected via `mouseenter`/`mouseleave` on all `a`, `button`, `[data-cursor-hover]` elements (event delegation on document)
- Click state: brief scale-down pulse via `mousedown`/`mouseup`
- Device detection: `matchMedia('(hover: hover)')` — hides entirely on touch devices

### Loading Sequence State

A simple 3-phase state machine:
1. **LOADING** — LoadingScreen visible, assets loading (images + video `canplaythrough`)
2. **READY** — All assets loaded, LoadingScreen begins fade-out
3. **ENTERED** — LoadingScreen fully hidden, Cover hero entrance timeline starts

Controlled via a ref (not React state) to avoid re-renders during animation. A single `onComplete` callback transitions from READY→ENTERED.

### Navigation Active Section

Derived from PageTransitionController's current page index. Navigation receives `activePage` prop and applies underline to the corresponding link. No separate scroll listener — single source of truth from the transition controller.

### History Panel Scroll Isolation

The HistorySpread right panel has its own internal vertical scroll (`overflow-y: auto`) within the 50vw container. Lenis handles horizontal page navigation; the native browser scrollbar handles vertical timeline scrolling. The left image panel uses `position: sticky` within the spread to create parallax as the right panel scrolls. GSAP ScrollTrigger is configured with the right panel's scrollable element as its scroller reference for the timeline progress animation.

### Responsive Breakpoint

At 768px viewport width, the entire layout switches:
- Lenis reconfigures to `orientation: 'vertical'`
- Spreads stack vertically (each becomes 100vh section)
- Page transitions become standard scroll (no slide animation)
- CustomCursor hides
- Artifact grid collapses to single column
- Timeline scrolls vertically
- Typography continues scaling via `clamp()` — no additional breakpoint needed

This switch is detected via `ResizeObserver` on a root container element, triggering a Lenis re-initialization and GSAP ScrollTrigger refresh.

## Other Key Decisions

**Raw WebGL over Three.js/R3F**: The ProceduralPaperCanvas is a single fullscreen quad with a fragment shader. Three.js would add ~150KB for a use case that needs only `gl.createShader`, `gl.createProgram`, a single `Float32Array` quad, and uniform updates in a RAF loop. The BronzeTextureCanvas similarly uses only Canvas 2D `fillRect` in a grid loop. Raw APIs keep bundle size minimal and eliminate framework overhead for trivial geometry.

**GSAP SplitText vs. SplitType**: The design calls for character-level text splitting across many elements. GSAP's SplitText plugin (Club/Business tier) is the canonical choice for GSAP workflows. SplitType is listed as a fallback dependency if SplitText licensing is unavailable — it produces compatible output for GSAP tweens.

**Video Asset Handling**: The cover-loop video is the only video asset. It must be loaded with `preload="auto"` and the loading sequence waits for the `canplaythrough` event before transitioning from LOADING→READY. The video element uses `muted autoplay loop playsinline` attributes. For performance, the video source should be MP4 (H.264) at 1080p max.

**Sound Effects**: The page-turn paper sound (0.5s) on transitions is noted in the design. Implementation: preloaded `<audio>` element with a generated/paper-turning sound file, played via `audio.play()` at transition start. Include a user-preference mute toggle (stored in `localStorage`).
