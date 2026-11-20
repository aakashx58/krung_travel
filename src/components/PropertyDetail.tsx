import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  Anchor,
  Award,
  Bell,
  ChevronRight,
  Film,
  Heart,
  Minus,
  Plus,
  Star,
  UtensilsCrossed,
  Wifi,
} from "lucide-react";
import {
  AVATARS,
  INTERIOR_THUMBS,
  STAYS,
  type StayProperty,
} from "../data/bangkokData";
import type { SearchState } from "./SearchBar";
import StayCard from "./StayCard";

interface PropertyDetailProps {
  property: StayProperty;
  originRect: DOMRect | null;
  search: SearchState;
  likedIds: Set<string>;
  onToggleLike: (id: string) => void;
  onSelectSimilar: (property: StayProperty, rect: DOMRect) => void;
  onClose: () => void;
}

interface FlightState {
  active: boolean;
  from: DOMRect;
  to: DOMRect;
  progress: number;
  photo: string;
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function formatDetailDate(d: Date | null, fallback: string): string {
  if (!d) return fallback;
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}

export default function PropertyDetail({
  property,
  originRect,
  search,
  likedIds,
  onToggleLike,
  onSelectSimilar,
  onClose,
}: PropertyDetailProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const mainPhotoRef = useRef<HTMLDivElement>(null);
  const flightRafRef = useRef<number | null>(null);

  const [pageEntered, setPageEntered] = useState(false);
  const [closing, setClosing] = useState(false);
  const [flight, setFlight] = useState<FlightState | null>(null);
  const [photoLanded, setPhotoLanded] = useState(!originRect);
  const [activeGalleryIdx, setActiveGalleryIdx] = useState<number | null>(null);

  const [guests, setGuests] = useState(
    Math.max(1, search.adults + search.children)
  );
  const [booked, setBooked] = useState(false);
  const [ratingMode, setRatingMode] = useState(false);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [heartPop, setHeartPop] = useState(false);

  // Fade in page over 0.55s
  useEffect(() => {
    const raf = requestAnimationFrame(() => setPageEntered(true));
    return () => cancelAnimationFrame(raf);
  }, []);

  // Reset gallery & booking state when property changes
  useEffect(() => {
    setActiveGalleryIdx(null);
    setBooked(false);
    setRatingMode(false);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0 });
    }
  }, [property.id]);

  // Shared-element flight over 900ms with easeInOutCubic
  useLayoutEffect(() => {
    if (!originRect || !mainPhotoRef.current) {
      setPhotoLanded(true);
      setFlight(null);
      return;
    }

    setPhotoLanded(false);
    const targetRect = mainPhotoRef.current.getBoundingClientRect();

    setFlight({
      active: true,
      from: originRect,
      to: targetRect,
      progress: 0,
      photo: property.photo700,
    });

    const duration = 900;
    const start = performance.now();

    const step = (now: number) => {
      const raw = Math.min(1, (now - start) / duration);
      const eased = easeInOutCubic(raw);
      setFlight((prev) => (prev ? { ...prev, progress: eased } : null));
      if (raw < 1) {
        flightRafRef.current = requestAnimationFrame(step);
      } else {
        setPhotoLanded(true);
        setFlight(null);
      }
    };

    flightRafRef.current = requestAnimationFrame(step);

    return () => {
      if (flightRafRef.current) cancelAnimationFrame(flightRafRef.current);
    };
  }, [property.id, property.photo700, originRect]);

  const handleClose = () => {
    setClosing(true);
    window.setTimeout(() => {
      onClose();
    }, 450);
  };

  const checkInText = formatDetailDate(search.checkIn, "Dec 22");
  const checkOutText = formatDetailDate(search.checkOut, "Dec 27, 2026");

  const similarStays = STAYS.filter((s) => s.id !== property.id).slice(0, 4);
  const isLiked = likedIds.has(property.id);

  const displayedPhoto700 =
    activeGalleryIdx !== null
      ? INTERIOR_THUMBS[activeGalleryIdx]
      : property.photo700;
  const displayedPhoto1400 =
    activeGalleryIdx !== null
      ? INTERIOR_THUMBS[activeGalleryIdx]
      : property.photo1400;

  // Interpolated flight box
  let flightBox: React.CSSProperties | null = null;
  if (flight && flight.active) {
    const p = flight.progress;
    const x = flight.from.left + (flight.to.left - flight.from.left) * p;
    const y = flight.from.top + (flight.to.top - flight.from.top) * p;
    const w = flight.from.width + (flight.to.width - flight.from.width) * p;
    const h = flight.from.height + (flight.to.height - flight.from.height) * p;
    const radius = 12 + (10 - 12) * p;
    flightBox = {
      position: "fixed",
      left: `${x}px`,
      top: `${y}px`,
      width: `${w}px`,
      height: `${h}px`,
      borderRadius: `${radius}px`,
      overflow: "hidden",
      zIndex: 55,
      pointerEvents: "none",
      boxShadow: "0 20px 50px rgba(80,45,38,.24)",
    };
  }

  return (
    <>
      <div
        ref={scrollContainerRef}
        className="fixed inset-0 z-40 bg-white overflow-y-auto overflow-x-hidden"
        style={{
          opacity: closing ? 0 : pageEntered ? 1 : 0,
          transition: "opacity 0.55s cubic-bezier(.65,0,.35,1)",
        }}
      >
        {/* 290px tall peach band at top */}
        <div
          aria-hidden="true"
          className="absolute top-0 left-0 right-0 pointer-events-none"
          style={{
            height: "290px",
            backgroundColor: "#f7d9c6",
          }}
        />

        <div
          className="relative z-10 pb-20"
          style={{
            paddingTop: "102px",
            paddingLeft: "clamp(20px, 9.5vw, 170px)",
            paddingRight: "clamp(20px, 9.5vw, 170px)",
          }}
        >
          {/* Breadcrumb */}
          <nav
            aria-label="Breadcrumb"
            className="detail-rise flex flex-wrap items-center gap-1.5 text-[12.5px] text-[#1d1a1c] mb-6"
            style={{ animationDelay: "250ms" }}
          >
            <button
              type="button"
              onClick={handleClose}
              className="hover:underline bg-transparent border-0 p-0 text-[#1d1a1c] font-medium"
            >
              Home
            </button>
            <ChevronRight size={13} strokeWidth={1.6} className="text-[#5c5156]" />
            <span>Type of places to stay</span>
            <ChevronRight size={13} strokeWidth={1.6} className="text-[#5c5156]" />
            <span>{property.category}</span>
            <ChevronRight size={13} strokeWidth={1.6} className="text-[#5c5156]" />
            <span className="text-[#8a7f83]">
              {property.name}, {property.area}
            </span>
          </nav>

          {/* 2-column layout: 1.18fr and 1fr; stacks on <= 1000px */}
          <div className="grid grid-cols-1 min-[1001px]:grid-cols-[1.18fr_1fr] gap-8 min-[1001px]:gap-12 items-start">
            {/* Left column: Main photo + 3 interior thumbnails */}
            <div>
              <div
                ref={mainPhotoRef}
                className="relative w-full overflow-hidden bg-[#f7d9c6]"
                style={{
                  aspectRatio: "512 / 445",
                  borderRadius: "10px",
                  opacity: photoLanded ? 1 : 0,
                  boxShadow: "0 18px 46px rgba(90,50,40,.14)",
                }}
              >
                {/* Cached w=700 base layer */}
                <img
                  src={displayedPhoto700}
                  alt={property.name}
                  referrerPolicy="no-referrer"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                {/* High-res w=1400 layered on top */}
                <img
                  src={displayedPhoto1400}
                  alt={property.name}
                  referrerPolicy="no-referrer"
                  className="absolute inset-0 w-full h-full object-cover"
                />

                {/* Heart button */}
                <button
                  type="button"
                  aria-label={isLiked ? "Remove from saved" : "Save property"}
                  onClick={() => {
                    setHeartPop(true);
                    onToggleLike(property.id);
                    window.setTimeout(() => setHeartPop(false), 380);
                  }}
                  className={`absolute top-4 right-4 w-9 h-9 rounded-full bg-white/95 flex items-center justify-center shadow-md transition-transform hover:scale-105 ${
                    heartPop ? "heart-pop" : ""
                  }`}
                >
                  <Heart
                    size={17}
                    strokeWidth={1.8}
                    color={isLiked ? "#ff4d5e" : "#1d1a1c"}
                    fill={isLiked ? "#ff4d5e" : "none"}
                  />
                </button>

                {activeGalleryIdx !== null && (
                  <button
                    type="button"
                    onClick={() => setActiveGalleryIdx(null)}
                    className="absolute bottom-3.5 left-3.5 px-3 py-1.5 rounded-full bg-white/90 text-[12px] font-medium text-[#1d1a1c] shadow-sm hover:bg-white"
                  >
                    Back to exterior
                  </button>
                )}
              </div>

              {/* Three square interior thumbnails with 16px gap */}
              <div
                className="detail-rise grid grid-cols-3 gap-[16px] mt-[16px]"
                style={{ animationDelay: "320ms" }}
              >
                {INTERIOR_THUMBS.map((thumb, idx) => {
                  const isThird = idx === 2;
                  const isSelected = activeGalleryIdx === idx;
                  return (
                    <button
                      key={thumb}
                      type="button"
                      onClick={() =>
                        setActiveGalleryIdx(isSelected ? null : idx)
                      }
                      className={`relative aspect-square rounded-[10px] overflow-hidden transition-transform duration-300 hover:-translate-y-1 focus:outline-none ${
                        isSelected ? "ring-2 ring-[#f39419]" : ""
                      }`}
                    >
                      <img
                        src={thumb}
                        alt={`${property.name} interior ${idx + 1}`}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                      {isThird && (
                        <div className="absolute inset-0 bg-[#1d1a1c]/48 flex items-center justify-center text-white font-urbanist font-semibold text-[22px]">
                          +9
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right column */}
            <div className="flex flex-col">
              {/* Name in Gilda Display at ~38px */}
              <h1
                className="detail-rise font-gilda text-[#1d1a1c] m-0"
                style={{
                  fontSize: "clamp(28px, 2.8vw, 38px)",
                  lineHeight: 1.15,
                  animationDelay: "320ms",
                }}
              >
                {property.name}
              </h1>

              {/* Hosted by + 20px avatar + Ploy Sirikul */}
              <div
                className="detail-rise flex items-center gap-2 mt-2.5 text-[13.5px] text-[#5c5156]"
                style={{ animationDelay: "390ms" }}
              >
                <span>Hosted by</span>
                <img
                  src={AVATARS[0]}
                  alt="Ploy Sirikul"
                  referrerPolicy="no-referrer"
                  className="w-[20px] h-[20px] rounded-full object-cover"
                />
                <span className="font-semibold text-[#1d1a1c]">
                  Ploy Sirikul
                </span>
              </div>

              {/* About {name} */}
              <div
                className="detail-rise mt-6"
                style={{ animationDelay: "460ms" }}
              >
                <h2 className="font-gilda text-[21px] text-[#1d1a1c] mb-2">
                  About {property.name}
                </h2>
                <p className="text-[14.5px] leading-[1.68] text-[#5c5156] m-0">
                  {property.description}
                </p>
              </div>

              {/* Booking card */}
              <div
                className="detail-rise mt-6 bg-white rounded-[18px] p-6"
                style={{
                  boxShadow: "0 16px 46px rgba(100,60,50,.11)",
                  animationDelay: "530ms",
                }}
              >
                <div className="flex items-baseline gap-1 mb-4 tabular-nums">
                  <span
                    className="font-urbanist font-bold text-[#1d1a1c]"
                    style={{ fontSize: "26px" }}
                  >
                    {property.priceFormatted}
                  </span>
                  <span className="text-[14px] text-[#8a7f83]">/night</span>
                </div>

                {/* Pale grey box with Check In & Check Out */}
                <div className="grid grid-cols-2 rounded-[12px] bg-[#f5f3f4] divide-x divide-black/10 mb-4">
                  <div className="px-4 py-3">
                    <div className="text-[11px] font-medium text-[#8a7f83] uppercase tracking-wider">
                      Check In
                    </div>
                    <div className="text-[14px] font-semibold text-[#1d1a1c] mt-0.5 tabular-nums">
                      {checkInText}
                    </div>
                  </div>
                  <div className="px-4 py-3">
                    <div className="text-[11px] font-medium text-[#8a7f83] uppercase tracking-wider">
                      Check Out
                    </div>
                    <div className="text-[14px] font-semibold text-[#1d1a1c] mt-0.5 tabular-nums">
                      {checkOutText}
                    </div>
                  </div>
                </div>

                {/* Guests row with - / + steppers */}
                <div className="flex items-center justify-between py-2 mb-4">
                  <div>
                    <div className="text-[14px] font-semibold text-[#1d1a1c]">
                      Guests
                    </div>
                    <div className="text-[12px] text-[#8a7f83] tabular-nums">
                      {guests} {guests === 1 ? "visitor" : "visitors"}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      aria-label="Decrease guests"
                      onClick={() => setGuests((g) => Math.max(1, g - 1))}
                      className="w-8 h-8 rounded-full border border-[#1d1a1c]/20 flex items-center justify-center text-[#1d1a1c] hover:border-[#1d1a1c]"
                    >
                      <Minus size={14} strokeWidth={1.8} />
                    </button>
                    <span className="w-5 text-center font-semibold text-[14.5px] tabular-nums">
                      {guests}
                    </span>
                    <button
                      type="button"
                      aria-label="Increase guests"
                      onClick={() => setGuests((g) => Math.min(12, g + 1))}
                      className="w-8 h-8 rounded-full border border-[#1d1a1c]/20 flex items-center justify-center text-[#1d1a1c] hover:border-[#1d1a1c]"
                    >
                      <Plus size={14} strokeWidth={1.8} />
                    </button>
                  </div>
                </div>

                {/* Orange Book Now pill -> turns green Booked ✓ */}
                <button
                  type="button"
                  onClick={() => setBooked(true)}
                  className="w-full py-3.5 rounded-full font-urbanist font-semibold text-[15px] text-white transition-all duration-300 hover:brightness-105 focus:outline-none"
                  style={{
                    backgroundColor: booked ? "#1ea866" : "#f39419",
                  }}
                >
                  {booked ? "Booked ✓" : "Book Now"}
                </button>
              </div>

              {/* Rating row between hairlines */}
              <div
                className="detail-rise mt-6 py-4 border-y border-black/10 flex flex-wrap items-center justify-between gap-4"
                style={{ animationDelay: "600ms" }}
              >
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-[20px] font-bold text-[#1d1a1c] tabular-nums">
                      {userRating ? `${userRating}.0` : "4.8"}
                    </span>
                    <span className="text-[12.5px] text-[#8a7f83] tabular-nums">
                      ({userRating ? property.reviewsCount + 1 : property.reviewsCount}{" "}
                      reviews)
                    </span>
                  </div>
                  <div className="flex items-center gap-1 mt-1">
                    {[0, 1, 2, 3, 4].map((s) => (
                      <Star
                        key={s}
                        size={12}
                        fill="#ff4d5e"
                        color="#ff4d5e"
                        strokeWidth={1.5}
                      />
                    ))}
                  </div>
                </div>

                {/* Three overlapping 38px reviewer avatars */}
                <div className="flex items-center -space-x-2.5">
                  {AVATARS.map((avatar, idx) => (
                    <img
                      key={avatar}
                      src={avatar}
                      alt={`Reviewer ${idx + 1}`}
                      referrerPolicy="no-referrer"
                      className="w-[38px] h-[38px] rounded-full object-cover ring-2 ring-white"
                    />
                  ))}
                </div>

                {/* Rate Now outline pill */}
                <button
                  type="button"
                  onClick={() => setRatingMode((r) => !r)}
                  className="px-4 py-1.5 rounded-full border border-[#1d1a1c] text-[12.5px] font-medium text-[#1d1a1c] hover:bg-[#1d1a1c] hover:text-white transition-colors"
                >
                  {userRating ? "Rated ✓" : "Rate Now"}
                </button>
              </div>

              {ratingMode && (
                <div className="mt-3 p-3 rounded-[12px] bg-[#fdf0e7] flex items-center justify-between">
                  <span className="text-[13px] font-medium text-[#1d1a1c]">
                    Rate your stay experience:
                  </span>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((starVal) => (
                      <button
                        key={starVal}
                        type="button"
                        aria-label={`Rate ${starVal} stars`}
                        onClick={() => {
                          setUserRating(starVal);
                          setRatingMode(false);
                        }}
                        className="p-0.5 hover:scale-115 transition-transform"
                      >
                        <Star
                          size={16}
                          fill={
                            (userRating ?? 5) >= starVal ? "#ff4d5e" : "none"
                          }
                          color="#ff4d5e"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Amenities: 3 x 2 grid */}
              <div
                className="detail-rise mt-6"
                style={{ animationDelay: "670ms" }}
              >
                <h2 className="font-gilda text-[21px] text-[#1d1a1c] mb-4">
                  Amenities
                </h2>
                <div className="grid grid-cols-3 gap-x-4 gap-y-4">
                  {[
                    { icon: Wifi, label: "Wi-Fi" },
                    { icon: UtensilsCrossed, label: "Personal Bar" },
                    { icon: Anchor, label: "Private Pier" },
                    { icon: Award, label: "Superhost" },
                    { icon: Film, label: "Own Cinema" },
                    { icon: Bell, label: "Room Service" },
                  ].map(({ icon: Icon, label }) => (
                    <div
                      key={label}
                      className="flex items-center gap-2.5 text-[13.5px] text-[#5c5156]"
                    >
                      <Icon
                        size={17}
                        strokeWidth={1.5}
                        className="text-[#1d1a1c] shrink-0"
                      />
                      <span>{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Similar Places to Stay */}
          <section className="mt-16 pt-10 border-t border-black/8">
            <h2
              className="font-gilda text-[#1d1a1c] mb-7"
              style={{ fontSize: "clamp(24px, 2.2vw, 32px)" }}
            >
              Similar Places to Stay
            </h2>
            <div
              className="grid grid-cols-2 min-[1001px]:grid-cols-4"
              style={{ gap: "clamp(14px, 2.2vw, 30px)" }}
            >
              {similarStays.map((item, idx) => (
                <StayCard
                  key={item.id}
                  property={item}
                  index={idx}
                  isLiked={likedIds.has(item.id)}
                  onToggleLike={onToggleLike}
                  onSelect={onSelectSimilar}
                  skipScrollReveal
                />
              ))}
            </div>
          </section>
        </div>
      </div>

      {/* Floating shared-element flight photo */}
      {flightBox && flight && (
        <div style={flightBox} aria-hidden="true">
          <img
            src={flight.photo}
            alt=""
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
        </div>
      )}
    </>
  );
}
