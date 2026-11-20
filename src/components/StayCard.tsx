import { useEffect, useRef, useState } from "react";
import { Heart, MapPin, Star } from "lucide-react";
import type { StayProperty } from "../data/bangkokData";

interface StayCardProps {
  property: StayProperty;
  index: number;
  isLiked: boolean;
  onToggleLike: (id: string) => void;
  onSelect: (property: StayProperty, rect: DOMRect) => void;
  skipScrollReveal?: boolean;
}

export default function StayCard({
  property,
  index,
  isLiked,
  onToggleLike,
  onSelect,
  skipScrollReveal = false,
}: StayCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(skipScrollReveal);
  const [popping, setPopping] = useState(false);

  useEffect(() => {
    if (skipScrollReveal) {
      setVisible(true);
      return;
    }
    const el = cardRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -30px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [skipScrollReveal]);

  const colDelay = (index % 4) * 90;

  const handleCardClick = () => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    onSelect(property, rect);
  };

  const handleHeartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPopping(true);
    onToggleLike(property.id);
    window.setTimeout(() => setPopping(false), 380);
  };

  return (
    <div
      ref={cardRef}
      role="button"
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleCardClick();
        }
      }}
      className="stay-card relative w-full overflow-hidden text-left select-none focus:outline-none"
      style={{
        aspectRatio: "203 / 268",
        borderRadius: "12px",
        boxShadow: "0 12px 30px rgba(110,60,50,.16)",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(40px)",
        transitionDelay: visible ? `${colDelay}ms` : "0ms",
      }}
    >
      {/* Full-bleed photo */}
      <img
        src={property.photo700}
        alt={`${property.name} in ${property.area}`}
        referrerPolicy="no-referrer"
        className="stay-card-photo absolute inset-0 w-full h-full object-cover"
      />

      {/* Bottom darkening gradient */}
      <div
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(22,14,16,.28) 68%, rgba(18,12,14,.78) 100%)",
        }}
      />

      {/* Top-left price pill */}
      <div
        className="absolute top-3 left-3 px-2.5 py-1 flex items-baseline gap-0.5 tabular-nums"
        style={{
          backgroundColor: "rgba(255,255,255,.82)",
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
          borderRadius: "6px",
          fontSize: "11.5px",
          fontWeight: 600,
          color: "#1d1a1c",
        }}
      >
        <span>{property.priceFormatted}</span>
        <span style={{ color: "rgba(29,26,28,.6)", fontWeight: 500 }}>
          /night
        </span>
      </div>

      {/* Top-right 30px white heart button */}
      <button
        type="button"
        aria-label={isLiked ? "Remove from saved stays" : "Save stay"}
        onClick={handleHeartClick}
        className={`absolute top-3 right-3 w-[30px] h-[30px] rounded-full bg-white flex items-center justify-center shadow-sm transition-transform hover:scale-105 focus:outline-none ${
          popping ? "heart-pop" : ""
        }`}
      >
        <Heart
          size={15}
          strokeWidth={1.8}
          color={isLiked ? "#ff4d5e" : "#1d1a1c"}
          fill={isLiked ? "#ff4d5e" : "none"}
        />
      </button>

      {/* Bottom-left text */}
      <div className="absolute left-3.5 right-3.5 bottom-3.5 text-white pointer-events-none">
        <div
          className="font-urbanist font-semibold leading-snug truncate"
          style={{ fontSize: "15.5px" }}
        >
          {property.name}
        </div>
        <div className="flex items-center gap-1 mt-0.5 text-white/85 text-[12px]">
          <MapPin size={11.5} strokeWidth={1.7} className="shrink-0" />
          <span className="truncate">{property.area}</span>
        </div>
        <div className="flex items-center gap-1.5 mt-1.5">
          <div className="flex items-center gap-0.5">
            {[0, 1, 2, 3, 4].map((s) => (
              <Star
                key={s}
                size={11}
                fill="#f7c325"
                color="#f7c325"
                strokeWidth={1.5}
              />
            ))}
          </div>
          <span className="text-[11.5px] font-medium text-white/95 tabular-nums">
            {property.rating}
          </span>
        </div>
      </div>
    </div>
  );
}
