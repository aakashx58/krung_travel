import { useEffect, useRef, useState } from "react";
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Minus,
  Plus,
  Send,
  Users,
} from "lucide-react";

export interface SearchState {
  destination: string;
  checkIn: Date | null;
  checkOut: Date | null;
  adults: number;
  children: number;
}

interface SearchBarProps {
  search: SearchState;
  onChange: (next: SearchState) => void;
  onSubmit: () => void;
}

const BANGKOK_AREAS = [
  "All Bangkok",
  "Khlong San",
  "Thonburi",
  "Sathorn",
  "Silom",
  "Bang Rak",
  "Sukhumvit",
  "Charoen Krung",
  "Bang Na",
];

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

function formatShortDate(d: Date | null): string {
  if (!d) return "Add date";
  const m = MONTH_NAMES[d.getMonth()].slice(0, 3);
  return `${m} ${d.getDate()}`;
}

function isSameDay(a: Date | null, b: Date | null): boolean {
  if (!a || !b) return false;
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export default function SearchBar({
  search,
  onChange,
  onSubmit,
}: SearchBarProps) {
  const [introReady, setIntroReady] = useState(false);
  const [activeField, setActiveField] = useState<
    "destination" | "checkin" | "checkout" | "visitors"
  >("checkin");
  const [hoveredField, setHoveredField] = useState<string | null>(null);
  const [openPopover, setOpenPopover] = useState<
    "destination" | "calendar" | "visitors" | null
  >(null);
  const [pickingStage, setPickingStage] = useState<"in" | "out">("in");

  // Default calendar view to December 2026
  const [viewYear, setViewYear] = useState(2026);
  const [viewMonth, setViewMonth] = useState(11); // 0-indexed: 11 = December

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = window.setTimeout(() => setIntroReady(true), 300);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpenPopover(null);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const totalGuests = search.adults + search.children;
  const guestsLabel =
    totalGuests > 0
      ? `${totalGuests} ${totalGuests === 1 ? "guest" : "guests"}`
      : "Add guests";

  // Calendar grid days (Monday first)
  const firstDayOfMonth = new Date(viewYear, viewMonth, 1);
  const startOffset = (firstDayOfMonth.getDay() + 6) % 7; // Mon=0 ... Sun=6
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const calendarCells: (Date | null)[] = [];
  for (let i = 0; i < startOffset; i++) calendarCells.push(null);
  for (let day = 1; day <= daysInMonth; day++) {
    calendarCells.push(new Date(viewYear, viewMonth, day));
  }

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const handleDayClick = (date: Date) => {
    const clicked = startOfDay(date);
    if (pickingStage === "in" || !search.checkIn) {
      onChange({
        ...search,
        checkIn: clicked,
        checkOut: null,
      });
      setPickingStage("out");
      setActiveField("checkout");
    } else {
      const ci = startOfDay(search.checkIn);
      if (clicked < ci) return;
      onChange({
        ...search,
        checkOut: clicked,
      });
      setPickingStage("in");
      // Automatically open Visitors popover after choosing check-out
      setActiveField("visitors");
      setOpenPopover("visitors");
    }
  };

  const isRaised = (key: string) =>
    activeField === key || hoveredField === key;

  return (
    <div
      ref={containerRef}
      className="search-bar-wrap absolute left-1/2 -translate-x-1/2"
      style={{
        width: "min(900px, calc(100% - 40px))",
        zIndex: 18,
        opacity: introReady ? 1 : 0,
        transform: introReady
          ? "translate(-50%, 0)"
          : "translate(-50%, 30px)",
        transition:
          "opacity 1s cubic-bezier(.16,1,.3,1), transform 1s cubic-bezier(.16,1,.3,1)",
      }}
    >
      {/* Main white bar */}
      <div
        className="w-full flex flex-col sm:flex-row sm:items-center sm:h-[90px] px-2.5 py-2.5 sm:py-0 sm:px-3 gap-1.5 sm:gap-1"
        style={{
          backgroundColor: "rgba(255,255,255,.93)",
          borderRadius: "26px",
          boxShadow: "0 18px 60px rgba(120,70,60,.16)",
        }}
      >
        {/* 2x2 grid on <= 640px, linear flex on desktop */}
        <div className="grid grid-cols-2 sm:flex sm:flex-1 sm:items-center gap-1 sm:gap-1">
          {/* Field 1: Bangkok (1.35x wider) */}
          <button
            type="button"
            onMouseEnter={() => setHoveredField("destination")}
            onMouseLeave={() => setHoveredField(null)}
            onClick={() => {
              setActiveField("destination");
              setOpenPopover((p) =>
                p === "destination" ? null : "destination"
              );
            }}
            className="text-left flex flex-col justify-center px-4 sm:px-5 h-[68px] sm:h-[72px] rounded-[14px] transition-all duration-200 focus:outline-none"
            style={{
              flex: "1.35 1 0%",
              backgroundColor: isRaised("destination")
                ? "#ffffff"
                : "transparent",
              boxShadow: isRaised("destination")
                ? "0 8px 24px rgba(120,80,70,.14)"
                : "none",
            }}
          >
            <div className="flex items-center gap-2 text-[#1d1a1c]">
              <MapPin size={16} strokeWidth={1.5} className="shrink-0" />
              <span
                className="font-urbanist font-medium truncate"
                style={{ fontSize: "clamp(16px, 1.5vw, 21px)", lineHeight: 1.15 }}
              >
                {search.destination === "All Bangkok"
                  ? "Bangkok"
                  : search.destination}
              </span>
            </div>
            <span
              className="font-urbanist text-[#8a7f83] pl-6 truncate"
              style={{ fontSize: "13px" }}
            >
              {search.destination === "All Bangkok"
                ? "Choose the destination"
                : "Bangkok district"}
            </span>
          </button>

          {/* Field 2: Check in */}
          <button
            type="button"
            onMouseEnter={() => setHoveredField("checkin")}
            onMouseLeave={() => setHoveredField(null)}
            onClick={() => {
              setActiveField("checkin");
              setPickingStage("in");
              setOpenPopover("calendar");
            }}
            className="text-left flex flex-col justify-center px-4 sm:px-5 h-[68px] sm:h-[72px] rounded-[14px] transition-all duration-200 focus:outline-none"
            style={{
              flex: "1 1 0%",
              backgroundColor: isRaised("checkin") ? "#ffffff" : "transparent",
              boxShadow: isRaised("checkin")
                ? "0 8px 24px rgba(120,80,70,.14)"
                : "none",
            }}
          >
            <div className="flex items-center gap-2 text-[#1d1a1c]">
              <Calendar size={16} strokeWidth={1.5} className="shrink-0" />
              <span
                className="font-urbanist font-medium whitespace-nowrap"
                style={{ fontSize: "clamp(16px, 1.5vw, 21px)", lineHeight: 1.15 }}
              >
                Check in
              </span>
            </div>
            <span
              className="font-urbanist text-[#8a7f83] pl-6 whitespace-nowrap"
              style={{ fontSize: "13px" }}
            >
              {formatShortDate(search.checkIn)}
            </span>
          </button>

          {/* Field 3: Check out */}
          <button
            type="button"
            onMouseEnter={() => setHoveredField("checkout")}
            onMouseLeave={() => setHoveredField(null)}
            onClick={() => {
              setActiveField("checkout");
              setPickingStage(search.checkIn ? "out" : "in");
              setOpenPopover("calendar");
            }}
            className="text-left flex flex-col justify-center px-4 sm:px-5 h-[68px] sm:h-[72px] rounded-[14px] transition-all duration-200 focus:outline-none"
            style={{
              flex: "1 1 0%",
              backgroundColor: isRaised("checkout") ? "#ffffff" : "transparent",
              boxShadow: isRaised("checkout")
                ? "0 8px 24px rgba(120,80,70,.14)"
                : "none",
            }}
          >
            <div className="flex items-center gap-2 text-[#1d1a1c]">
              <Calendar size={16} strokeWidth={1.5} className="shrink-0" />
              <span
                className="font-urbanist font-medium whitespace-nowrap"
                style={{ fontSize: "clamp(16px, 1.5vw, 21px)", lineHeight: 1.15 }}
              >
                Check out
              </span>
            </div>
            <span
              className="font-urbanist text-[#8a7f83] pl-6 whitespace-nowrap"
              style={{ fontSize: "13px" }}
            >
              {formatShortDate(search.checkOut)}
            </span>
          </button>

          {/* Field 4: Visitors */}
          <button
            type="button"
            onMouseEnter={() => setHoveredField("visitors")}
            onMouseLeave={() => setHoveredField(null)}
            onClick={() => {
              setActiveField("visitors");
              setOpenPopover((p) => (p === "visitors" ? null : "visitors"));
            }}
            className="text-left flex flex-col justify-center px-4 sm:px-5 h-[68px] sm:h-[72px] rounded-[14px] transition-all duration-200 focus:outline-none"
            style={{
              flex: "1 1 0%",
              backgroundColor: isRaised("visitors") ? "#ffffff" : "transparent",
              boxShadow: isRaised("visitors")
                ? "0 8px 24px rgba(120,80,70,.14)"
                : "none",
            }}
          >
            <div className="flex items-center gap-2 text-[#1d1a1c]">
              <Users size={16} strokeWidth={1.5} className="shrink-0" />
              <span
                className="font-urbanist font-medium whitespace-nowrap"
                style={{ fontSize: "clamp(16px, 1.5vw, 21px)", lineHeight: 1.15 }}
              >
                Visitors
              </span>
            </div>
            <span
              className="font-urbanist text-[#8a7f83] pl-6 whitespace-nowrap"
              style={{ fontSize: "13px" }}
            >
              {guestsLabel}
            </span>
          </button>
        </div>

        {/* Send button: black 40px square on desktop, full-width below on mobile */}
        <button
          type="button"
          aria-label="Search Bangkok stays"
          onClick={() => {
            setOpenPopover(null);
            onSubmit();
          }}
          className="group flex items-center justify-center bg-[#1d1a1c] text-white w-full h-[44px] sm:w-[40px] sm:h-[40px] sm:mr-3 rounded-[11px] shrink-0 transition-transform duration-200 hover:scale-110 hover:-rotate-8 focus:outline-none"
        >
          <Send size={16} strokeWidth={1.8} />
        </button>
      </div>

      {/* Destination Popover */}
      {openPopover === "destination" && (
        <div
          className="popover-drop absolute left-0 top-[calc(100%+12px)] w-[260px] bg-white rounded-[18px] p-3"
          style={{ boxShadow: "0 22px 60px rgba(90,50,40,.22)", zIndex: 50 }}
        >
          <div className="px-3 py-1.5 text-[11.5px] font-medium text-[#8a7f83]">
            Bangkok Neighborhoods
          </div>
          <div className="grid grid-cols-1 gap-0.5 mt-1">
            {BANGKOK_AREAS.map((area) => {
              const selected = search.destination === area;
              return (
                <button
                  key={area}
                  type="button"
                  onClick={() => {
                    onChange({ ...search, destination: area });
                    setOpenPopover(null);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-[10px] text-[14px] flex items-center justify-between transition-colors ${
                    selected
                      ? "bg-[#f7d9c6] text-[#1d1a1c] font-semibold"
                      : "hover:bg-[#fdf0e7] text-[#1d1a1c]"
                  }`}
                >
                  <span>{area}</span>
                  {area === "All Bangkok" && (
                    <span className="text-[11px] text-[#5c5156]">8 stays</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Calendar Popover */}
      {openPopover === "calendar" && (
        <div
          className="popover-drop absolute left-1/2 -translate-x-1/2 top-[calc(100%+12px)] bg-white rounded-[18px] p-5"
          style={{
            boxShadow: "0 24px 64px rgba(90,50,40,.22)",
            zIndex: 50,
            width: "290px",
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              aria-label="Previous month"
              onClick={handlePrevMonth}
              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#fdf0e7] text-[#1d1a1c]"
            >
              <ChevronLeft size={16} strokeWidth={1.8} />
            </button>
            <div className="font-urbanist font-semibold text-[15px] text-[#1d1a1c]">
              {MONTH_NAMES[viewMonth]} {viewYear}
            </div>
            <button
              type="button"
              aria-label="Next month"
              onClick={handleNextMonth}
              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#fdf0e7] text-[#1d1a1c]"
            >
              <ChevronRight size={16} strokeWidth={1.8} />
            </button>
          </div>

          {/* Weekday headers (Monday first) */}
          <div className="grid grid-cols-7 mb-1.5">
            {WEEKDAYS.map((wd) => (
              <div
                key={wd}
                className="text-center text-[11.5px] font-medium text-[#8a7f83] h-7 flex items-center justify-center"
              >
                {wd}
              </div>
            ))}
          </div>

          {/* 7 columns x 34px */}
          <div className="grid grid-cols-7 gap-y-1">
            {calendarCells.map((cell, idx) => {
              if (!cell) {
                return <div key={`empty-${idx}`} className="h-[34px]" />;
              }

              const isStart = isSameDay(cell, search.checkIn);
              const isEnd = isSameDay(cell, search.checkOut);
              const inRange =
                search.checkIn &&
                search.checkOut &&
                startOfDay(cell) > startOfDay(search.checkIn) &&
                startOfDay(cell) < startOfDay(search.checkOut);
              const isDisabled =
                pickingStage === "out" &&
                search.checkIn !== null &&
                startOfDay(cell) < startOfDay(search.checkIn);

              return (
                <div
                  key={cell.toISOString()}
                  className="h-[34px] flex items-center justify-center relative"
                  style={{
                    background: inRange
                      ? "#fbe4d5"
                      : isStart && search.checkOut
                        ? "linear-gradient(90deg, transparent 50%, #fbe4d5 50%)"
                        : isEnd && search.checkIn
                          ? "linear-gradient(90deg, #fbe4d5 50%, transparent 50%)"
                          : "transparent",
                  }}
                >
                  <button
                    type="button"
                    disabled={isDisabled}
                    onClick={() => handleDayClick(cell)}
                    className={`w-[34px] h-[34px] rounded-[9px] text-[13px] font-medium tabular-nums flex items-center justify-center transition-colors ${
                      isStart || isEnd
                        ? "bg-[#1d1a1c] text-white font-semibold"
                        : isDisabled
                          ? "text-[#8a7f83]/40"
                          : "text-[#1d1a1c] hover:bg-[#f7d9c6]/60"
                    }`}
                  >
                    {cell.getDate()}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Visitors Popover */}
      {openPopover === "visitors" && (
        <div
          className="popover-drop absolute right-0 sm:right-14 top-[calc(100%+12px)] w-[275px] bg-white rounded-[18px] p-5"
          style={{ boxShadow: "0 24px 64px rgba(90,50,40,.22)", zIndex: 50 }}
        >
          {/* Adults row */}
          <div className="flex items-center justify-between py-2.5 border-b border-black/6">
            <div>
              <div className="text-[14.5px] font-semibold text-[#1d1a1c]">
                Adults
              </div>
              <div className="text-[12px] text-[#8a7f83]">Ages 13 or above</div>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                aria-label="Decrease adults"
                onClick={() =>
                  onChange({
                    ...search,
                    adults: Math.max(1, search.adults - 1),
                  })
                }
                className="w-8 h-8 rounded-full border border-[#1d1a1c]/20 flex items-center justify-center text-[#1d1a1c] hover:border-[#1d1a1c] transition-colors"
              >
                <Minus size={14} strokeWidth={1.8} />
              </button>
              <span className="w-4 text-center text-[14px] font-medium tabular-nums">
                {search.adults}
              </span>
              <button
                type="button"
                aria-label="Increase adults"
                onClick={() =>
                  onChange({
                    ...search,
                    adults: Math.min(10, search.adults + 1),
                  })
                }
                className="w-8 h-8 rounded-full border border-[#1d1a1c]/20 flex items-center justify-center text-[#1d1a1c] hover:border-[#1d1a1c] transition-colors"
              >
                <Plus size={14} strokeWidth={1.8} />
              </button>
            </div>
          </div>

          {/* Children row */}
          <div className="flex items-center justify-between pt-3 pb-1">
            <div>
              <div className="text-[14.5px] font-semibold text-[#1d1a1c]">
                Children
              </div>
              <div className="text-[12px] text-[#8a7f83]">Ages 2–12</div>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                aria-label="Decrease children"
                onClick={() =>
                  onChange({
                    ...search,
                    children: Math.max(0, search.children - 1),
                  })
                }
                className="w-8 h-8 rounded-full border border-[#1d1a1c]/20 flex items-center justify-center text-[#1d1a1c] hover:border-[#1d1a1c] transition-colors"
              >
                <Minus size={14} strokeWidth={1.8} />
              </button>
              <span className="w-4 text-center text-[14px] font-medium tabular-nums">
                {search.children}
              </span>
              <button
                type="button"
                aria-label="Increase children"
                onClick={() =>
                  onChange({
                    ...search,
                    children: Math.min(8, search.children + 1),
                  })
                }
                className="w-8 h-8 rounded-full border border-[#1d1a1c]/20 flex items-center justify-center text-[#1d1a1c] hover:border-[#1d1a1c] transition-colors"
              >
                <Plus size={14} strokeWidth={1.8} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
