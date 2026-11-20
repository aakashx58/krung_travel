import { useCallback, useEffect, useRef, useState } from "react";
import { CLOUD_IMAGE, HERO_SLIDES, RAIL_THUMBS } from "../data/bangkokData";

interface HeroSectionProps {
  activeSlide: number;
  onSlideChange: (index: number) => void;
  scrollY: number;
  children?: React.ReactNode;
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export default function HeroSection({
  activeSlide,
  onSlideChange,
  scrollY,
  children,
}: HeroSectionProps) {
  const heroRef = useRef<HTMLElement>(null);
  const [viewport, setViewport] = useState({ w: 1440, h: 900 });

  // Intro states
  const [titleIntro, setTitleIntro] = useState(false);
  const [thumbsIntro, setThumbsIntro] = useState(false);
  const [ringsIntro, setRingsIntro] = useState(false);
  const [captionVisible, setCaptionVisible] = useState(false);

  // Transition / wipe states
  const [outgoingSlide, setOutgoingSlide] = useState<number | null>(null);
  const [wipeProgress, setWipeProgress] = useState(1);
  const [displayedCaptionSlide, setDisplayedCaptionSlide] = useState(activeSlide);

  // Ken Burns + pointer parallax
  const [kenBurnsScale, setKenBurnsScale] = useState(0);
  const [parallax, setParallax] = useState({ x: 0, y: 0 });

  const prevSlideRef = useRef(activeSlide);
  const wipeRafRef = useRef<number | null>(null);
  const kbStartRef = useRef<number>(performance.now());
  const captionTimerRef = useRef<number | null>(null);

  // Measure viewport & hero height
  useEffect(() => {
    const updateSize = () => {
      const h = heroRef.current?.offsetHeight || Math.max(680, window.innerHeight);
      setViewport({ w: window.innerWidth, h });
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  // Intro sequence on load
  useEffect(() => {
    const t1 = window.setTimeout(() => setTitleIntro(true), 250);
    const t2 = window.setTimeout(() => setThumbsIntro(true), 350);
    const t3 = window.setTimeout(() => setRingsIntro(true), 350);
    const t4 = window.setTimeout(() => setCaptionVisible(true), 900);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, []);

  // Auto-advance every 5.2s
  useEffect(() => {
    const timer = window.setInterval(() => {
      onSlideChange((activeSlide + 1) % HERO_SLIDES.length);
    }, 5200);
    return () => clearInterval(timer);
  }, [activeSlide, onSlideChange]);

  // Trigger misty right-to-left wipe when activeSlide changes
  useEffect(() => {
    if (prevSlideRef.current === activeSlide) return;
    const fromSlide = prevSlideRef.current;
    prevSlideRef.current = activeSlide;

    if (wipeRafRef.current) cancelAnimationFrame(wipeRafRef.current);
    if (captionTimerRef.current) clearTimeout(captionTimerRef.current);

    setOutgoingSlide(fromSlide);
    setWipeProgress(0);
    setCaptionVisible(false);

    captionTimerRef.current = window.setTimeout(() => {
      setDisplayedCaptionSlide(activeSlide);
      setCaptionVisible(true);
    }, 650);

    const duration = 1250;
    const start = performance.now();

    const step = (now: number) => {
      const raw = Math.min(1, (now - start) / duration);
      const eased = easeInOutCubic(raw);
      setWipeProgress(eased);
      if (raw < 1) {
        wipeRafRef.current = requestAnimationFrame(step);
      } else {
        setOutgoingSlide(null);
        setWipeProgress(1);
        kbStartRef.current = performance.now();
        setKenBurnsScale(0);
      }
    };

    wipeRafRef.current = requestAnimationFrame(step);

    return () => {
      if (wipeRafRef.current) cancelAnimationFrame(wipeRafRef.current);
      if (captionTimerRef.current) clearTimeout(captionTimerRef.current);
    };
  }, [activeSlide]);

  // Slow Ken Burns after wipe (0.0035/s up to 12s)
  useEffect(() => {
    let rafId: number;
    const tick = (now: number) => {
      if (outgoingSlide === null) {
        const elapsed = Math.min(12, (now - kbStartRef.current) / 1000);
        setKenBurnsScale(elapsed * 0.0035);
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [outgoingSlide]);

  // Pointer parallax (±0.6% horizontal, ±0.5% vertical)
  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLElement>) => {
    if (e.pointerType === "touch") return;
    const nx = (e.clientX / window.innerWidth) * 2 - 1;
    const ny = (e.clientY / window.innerHeight) * 2 - 1;
    setParallax({
      x: -nx * 0.6,
      y: -ny * 0.5,
    });
  }, []);

  const vw = viewport.w;
  const vh = viewport.h;
  const isMobile = vw <= 640;

  // Rail geometry
  const railCenterX = vw * 0.855;
  const colTop = 74 + vh * 0.085;
  const activeSize = Math.min(190, Math.max(96, vw * 0.113));
  const inactiveSize = Math.min(92, Math.max(46, vw * 0.054));
  const thumbGap = Math.max(8, vw * 0.009);

  const activeRailIdx = HERO_SLIDES[activeSlide].thumbIndexInRail;

  let currentTop = colTop;
  const thumbLayouts = RAIL_THUMBS.map((thumb, idx) => {
    const isActive = idx === activeRailIdx;
    const size = isActive ? activeSize : inactiveSize;
    const top = currentTop;
    const left = railCenterX - size / 2;
    const centerY = top + size / 2;
    currentTop += size + thumbGap;
    return { thumb, idx, isActive, size, top, left, centerY };
  });

  const activeThumbLayout = thumbLayouts[activeRailIdx];
  const innerRingRadius = activeSize / 2 + vw * 0.05;
  const outerRingRadius = activeSize / 2 + vw * 0.108;

  const connectorLen = Math.max(40, vw * 0.047);
  const connectorGap = vw * 0.008;
  const connectorRightFromViewport =
    vw - (activeThumbLayout.left - connectorGap);

  const captionGapFromConnector = Math.max(16, vw * 0.012);
  const captionRightFromViewport =
    connectorRightFromViewport + connectorLen + captionGapFromConnector;
  const captionBarHeight = Math.max(84, vw * 0.065);

  // Scroll choreography
  const slideStackTranslateY = 0.42 * scrollY;
  const bottomCloudTranslateY = -0.38 * scrollY;
  const bottomCloudScale = 1 + (0.35 * scrollY) / Math.max(680, vh);
  const topCloudOpacity = Math.min(1, Math.max(0, scrollY / (0.45 * vh)));
  const topCloudTranslateY = -0.15 * scrollY;
  const railTranslateY = 0.2 * scrollY;
  const railOpacity = Math.max(0, 1 - scrollY / (0.5 * vh));

  // Wipe mask & mist band values
  const s0 = wipeProgress * 135 - 35;
  const sMid = wipeProgress * 135 - 17.5;
  const s1 = wipeProgress * 135;
  const incomingMask =
    outgoingSlide !== null
      ? `linear-gradient(to left, rgba(0,0,0,1) ${s0}%, rgba(0,0,0,0.6) ${sMid}%, rgba(0,0,0,0) ${s1}%)`
      : undefined;

  const mistOpacity =
    outgoingSlide !== null ? Math.sin(Math.PI * wipeProgress) * 0.95 : 0;

  const captionSlide = HERO_SLIDES[displayedCaptionSlide];

  return (
    <section
      ref={heroRef}
      onPointerMove={handlePointerMove}
      className="relative w-full h-screen min-h-[680px] overflow-hidden select-none"
    >
      {/* Slide stack with scroll lag */}
      <div
        className="absolute inset-0 will-change-transform"
        style={{
          transform: `translate3d(0, ${slideStackTranslateY}px, 0)`,
        }}
      >
        {HERO_SLIDES.map((slide, idx) => {
          const isIncoming = idx === activeSlide;
          const isOutgoing = idx === outgoingSlide;

          if (!isIncoming && !isOutgoing) return null;

          let photoScale = 1.04 + kenBurnsScale;
          let photoShiftX = parallax.x;
          const photoShiftY = parallax.y;

          if (outgoingSlide !== null) {
            if (isIncoming) {
              photoScale = 1.12 - 0.08 * wipeProgress;
              photoShiftX = 2 * (1 - wipeProgress);
            } else if (isOutgoing) {
              photoScale = 1.04 + 0.05 * wipeProgress;
              photoShiftX = -2 * wipeProgress;
            }
          }

          const zIndex = isIncoming ? 2 : 1;
          const maskStyle =
            isIncoming && incomingMask
              ? {
                  maskImage: incomingMask,
                  WebkitMaskImage: incomingMask,
                }
              : {};

          return (
            <div
              key={slide.id}
              className="absolute inset-0 overflow-hidden"
              style={{ zIndex, ...maskStyle }}
            >
              {/* Photo layer inset -3% */}
              <div
                className="absolute will-change-transform"
                style={{
                  inset: "-3%",
                  backgroundImage: `url("${slide.photo}")`,
                  backgroundSize: "cover",
                  backgroundPosition: slide.position,
                  transform: `translate3d(${photoShiftX}%, ${photoShiftY}%, 0) scale(${photoScale})`,
                }}
              />

              {/* Top mauve tint behind nav */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(84,64,74,.42) 0%, rgba(84,64,74,.08) 26%, transparent 46%)",
                }}
              />

              {/* Giant title inside slide so wipe reveals photo + title together */}
              <h1
                className={`absolute font-urbanist font-bold uppercase m-0 p-0 pointer-events-none ${slide.titleClass}`}
                style={{ zIndex: 3 }}
              >
                {slide.titleLines.map((line, lineIdx) => {
                  const words = line.split(" ");
                  return (
                    <span key={lineIdx} className="block">
                      {words.map((word, wIdx) => {
                        const globalWordIndex =
                          lineIdx === 0
                            ? wIdx
                            : slide.titleLines[0].split(" ").length + wIdx;
                        return (
                          <span
                            key={`${lineIdx}-${wIdx}`}
                            className="inline-block overflow-hidden align-top mr-[0.26em] last:mr-0"
                          >
                            <span
                              className="hero-title-word"
                              style={{
                                transform: titleIntro
                                  ? "translateY(0)"
                                  : "translateY(105%)",
                                transition: `transform 1.15s cubic-bezier(.16,1,.3,1) ${globalWordIndex * 90}ms`,
                              }}
                            >
                              {word}
                            </span>
                          </span>
                        );
                      })}
                    </span>
                  );
                })}
              </h1>
            </div>
          );
        })}

        {/* Mist band riding along the wipe edge */}
        {outgoingSlide !== null && (
          <div
            aria-hidden="true"
            className="absolute pointer-events-none"
            style={{
              top: "-5%",
              bottom: "-5%",
              width: "34vw",
              right: `calc(${sMid}% - 17vw)`,
              zIndex: 4,
              opacity: mistOpacity,
              background:
                "radial-gradient(ellipse at center, rgba(255,236,226,.75) 0%, rgba(255,236,226,.36) 45%, rgba(255,236,226,0) 74%)",
              filter: "blur(10px)",
            }}
          />
        )}
      </div>

      {/* Bottom volumetric drifting cloud bank */}
      <div
        aria-hidden="true"
        className="absolute pointer-events-none will-change-transform"
        style={{
          left: "-4%",
          right: "-4%",
          bottom: "-6%",
          height: "78%",
          zIndex: 7,
          mixBlendMode: "screen",
          transform: `translate3d(0, ${bottomCloudTranslateY}px, 0) scale(${bottomCloudScale})`,
          transformOrigin: "center bottom",
        }}
      >
        {/* Back cloud copy (mirrored horizontally, 85% opacity, 34s) */}
        <div
          className="cloud-back absolute inset-0"
          style={{
            opacity: 0.85,
            backgroundImage: `url("${CLOUD_IMAGE}")`,
            backgroundSize: "cover",
            backgroundPosition: "center bottom",
            maskImage: "linear-gradient(180deg, transparent 0%, #000 38%)",
            WebkitMaskImage: "linear-gradient(180deg, transparent 0%, #000 38%)",
          }}
        />
        {/* Front cloud copy (26s) */}
        <div
          className="cloud-front absolute inset-0"
          style={{
            backgroundImage: `url("${CLOUD_IMAGE}")`,
            backgroundSize: "cover",
            backgroundPosition: "center bottom",
            maskImage: "linear-gradient(180deg, transparent 0%, #000 38%)",
            WebkitMaskImage: "linear-gradient(180deg, transparent 0%, #000 38%)",
          }}
        />
      </div>

      {/* Top cloud layer (flipped vertically, fades in on scroll) */}
      <div
        aria-hidden="true"
        className="absolute pointer-events-none will-change-transform"
        style={{
          left: "-4%",
          right: "-4%",
          top: "-30%",
          height: "80%",
          zIndex: 8,
          mixBlendMode: "screen",
          opacity: topCloudOpacity,
          transform: `translate3d(0, ${topCloudTranslateY}px, 0)`,
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("${CLOUD_IMAGE}")`,
            backgroundSize: "cover",
            backgroundPosition: "center bottom",
            transform: "scaleY(-1)",
            maskImage: "linear-gradient(180deg, transparent 0%, #000 38%)",
            WebkitMaskImage: "linear-gradient(180deg, transparent 0%, #000 38%)",
          }}
        />
      </div>

      {/* Bottom fade into peach page (#f7d9c6) */}
      <div
        aria-hidden="true"
        className="absolute left-0 right-0 bottom-0 pointer-events-none"
        style={{
          height: "46%",
          zIndex: 9,
          background:
            "linear-gradient(180deg, rgba(247,217,198,0) 0%, rgba(247,217,198,.45) 45%, rgba(247,217,198,.92) 82%, #f7d9c6 100%)",
        }}
      />

      {/* Right rail: concentric rings, thumbnails, connector, caption */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: 14,
          opacity: railOpacity,
          transform: `translate3d(0, ${railTranslateY}px, 0)`,
        }}
      >
        {/* Inner concentric ring */}
        <div
          style={{
            position: "absolute",
            left: `${railCenterX - innerRingRadius}px`,
            top: `${activeThumbLayout.centerY - innerRingRadius}px`,
            width: `${innerRingRadius * 2}px`,
            height: `${innerRingRadius * 2}px`,
            borderRadius: "50%",
            border: "1.6px solid rgba(255,255,255,.5)",
            opacity: ringsIntro ? 1 : 0,
            transition:
              "left 0.9s cubic-bezier(.65,0,.35,1), top 0.9s cubic-bezier(.65,0,.35,1), width 0.9s cubic-bezier(.65,0,.35,1), height 0.9s cubic-bezier(.65,0,.35,1), opacity 1s ease 0.35s",
          }}
        />

        {/* Outer concentric ring */}
        <div
          style={{
            position: "absolute",
            left: `${railCenterX - outerRingRadius}px`,
            top: `${activeThumbLayout.centerY - outerRingRadius}px`,
            width: `${outerRingRadius * 2}px`,
            height: `${outerRingRadius * 2}px`,
            borderRadius: "50%",
            border: "1.6px solid rgba(255,255,255,.5)",
            opacity: ringsIntro ? 1 : 0,
            transition:
              "left 0.9s cubic-bezier(.65,0,.35,1), top 0.9s cubic-bezier(.65,0,.35,1), width 0.9s cubic-bezier(.65,0,.35,1), height 0.9s cubic-bezier(.65,0,.35,1), opacity 1s ease 0.45s",
          }}
        />

        {/* 3 Thumbnails */}
        {thumbLayouts.map(({ thumb, idx, isActive, size, top, left }) => (
          <button
            key={thumb.id}
            type="button"
            aria-label={thumb.label}
            onClick={() => onSlideChange(thumb.slideIndex)}
            className="pointer-events-auto group focus:outline-none"
            style={{
              position: "absolute",
              top: `${top}px`,
              left: `${left}px`,
              width: `${size}px`,
              height: `${size}px`,
              borderRadius: "50%",
              padding: 0,
              border: "3px solid rgba(255,255,255,.92)",
              boxShadow: "0 10px 26px rgba(60,30,30,.28)",
              transform: thumbsIntro ? "scale(1)" : "scale(0)",
              transition: `top 0.9s cubic-bezier(.65,0,.35,1), left 0.9s cubic-bezier(.65,0,.35,1), width 0.9s cubic-bezier(.65,0,.35,1), height 0.9s cubic-bezier(.65,0,.35,1), transform 0.7s cubic-bezier(.16,1,.3,1) ${thumbsIntro ? 0 : idx * 140}ms`,
            }}
          >
            {/* Active 9px outer halo */}
            <span
              aria-hidden="true"
              style={{
                position: "absolute",
                inset: "-12px",
                borderRadius: "50%",
                border: "1.5px solid rgba(255,255,255,.55)",
                opacity: isActive ? 1 : 0,
                transform: isActive ? "scale(1)" : "scale(0.85)",
                transition:
                  "opacity 0.5s cubic-bezier(.65,0,.35,1), transform 0.6s cubic-bezier(.16,1,.3,1)",
                pointerEvents: "none",
              }}
            />
            <span className="block w-full h-full rounded-full overflow-hidden transition-transform duration-300 group-hover:scale-[1.07]">
              <img
                src={thumb.image}
                alt={thumb.label}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </span>
          </button>
        ))}

        {/* Connector line & Caption block (hidden on <= 640px) */}
        {!isMobile && (
          <>
            {/* Horizontal 3px white rounded connector */}
            <div
              style={{
                position: "absolute",
                top: `${activeThumbLayout.centerY - 1.5}px`,
                right: `${connectorRightFromViewport}px`,
                width: `${connectorLen}px`,
                height: "3px",
                borderRadius: "999px",
                backgroundColor: "rgba(255,255,255,.95)",
                transformOrigin: "right center",
                transform: captionVisible ? "scaleX(1)" : "scaleX(0)",
                transition:
                  "transform 0.55s cubic-bezier(.16,1,.3,1), top 0.9s cubic-bezier(.65,0,.35,1), right 0.9s cubic-bezier(.65,0,.35,1)",
              }}
            />

            {/* Caption block */}
            <div
              style={{
                position: "absolute",
                top: `${activeThumbLayout.centerY}px`,
                right: `${captionRightFromViewport}px`,
                transform: "translateY(-50%)",
                display: "flex",
                alignItems: "center",
                gap: "16px",
                transition:
                  "top 0.9s cubic-bezier(.65,0,.35,1), right 0.9s cubic-bezier(.65,0,.35,1)",
              }}
            >
              {/* Text content revealed left-to-right */}
              <div
                className="text-right"
                style={{
                  clipPath: captionVisible
                    ? "inset(0 0% 0 0)"
                    : "inset(0 100% 0 0)",
                  transition: "clip-path 0.9s cubic-bezier(.16,1,.3,1)",
                }}
              >
                <h2
                  className="font-urbanist font-light text-white m-0 whitespace-nowrap"
                  style={{
                    fontSize: "clamp(26px, 2.75vw, 40px)",
                    lineHeight: 1.12,
                    textShadow: "0 2px 16px rgba(45,25,30,.28)",
                  }}
                >
                  {captionSlide.captionTitle}
                </h2>
                <p
                  className="font-urbanist text-white/88 mt-2 mb-0 ml-auto"
                  style={{
                    fontSize: "clamp(12px, 1vw, 14.5px)",
                    lineHeight: 1.45,
                    maxWidth: "250px",
                    textShadow: "0 1px 10px rgba(45,25,30,.24)",
                  }}
                >
                  {captionSlide.captionBody}
                </p>
              </div>

              {/* Vertical 3px white bar growing from top */}
              <div
                style={{
                  width: "3px",
                  height: `${captionBarHeight}px`,
                  borderRadius: "999px",
                  backgroundColor: "rgba(255,255,255,.95)",
                  transformOrigin: "top center",
                  transform: captionVisible ? "scaleY(1)" : "scaleY(0)",
                  transition: "transform 0.6s cubic-bezier(.16,1,.3,1)",
                  flexShrink: 0,
                }}
              />
            </div>
          </>
        )}
      </div>

      {/* Search bar slot rendered above clouds */}
      {children}
    </section>
  );
}
