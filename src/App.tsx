import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import CustomCursor from "./components/CustomCursor";
import HeroSection from "./components/HeroSection";
import Navbar from "./components/Navbar";
import PropertyDetail from "./components/PropertyDetail";
import SearchBar, { type SearchState } from "./components/SearchBar";
import StayCard from "./components/StayCard";
import { STAYS, type StayProperty } from "./data/bangkokData";

export default function App() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [scrollY, setScrollY] = useState(0);
  const [viewportH, setViewportH] = useState(900);

  const [search, setSearch] = useState<SearchState>({
    destination: "All Bangkok",
    checkIn: null,
    checkOut: null,
    adults: 2,
    children: 0,
  });

  const [likedIds, setLikedIds] = useState<Set<string>>(() => new Set());
  const [selectedProperty, setSelectedProperty] = useState<StayProperty | null>(
    null
  );
  const [originRect, setOriginRect] = useState<DOMRect | null>(null);

  const [modalKind, setModalKind] = useState<"contact" | "host" | null>(null);
  const [modalSubmitted, setModalSubmitted] = useState(false);
  const [formEmail, setFormEmail] = useState("");
  const [formMessage, setFormMessage] = useState("");

  const staysRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    const onResize = () => setViewportH(window.innerHeight);
    onScroll();
    onResize();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  // Lock background scroll while detail page is open
  useEffect(() => {
    if (selectedProperty) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedProperty]);

  const navSolid = selectedProperty !== null || scrollY > viewportH * 0.3;

  const toggleLike = (id: string) => {
    setLikedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSelectStay = (property: StayProperty, rect: DOMRect) => {
    setOriginRect(rect);
    setSelectedProperty(property);
  };

  const scrollToStays = () => {
    staysRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleGoHome = () => {
    setSelectedProperty(null);
    setOriginRect(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleGoApartments = () => {
    setSelectedProperty(null);
    setOriginRect(null);
    window.setTimeout(() => {
      scrollToStays();
    }, 60);
  };

  const handleWhereToGo = () => {
    setSelectedProperty(null);
    setOriginRect(null);
    setActiveSlide(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const filteredStays =
    search.destination === "All Bangkok"
      ? STAYS
      : STAYS.filter((stay) =>
          stay.area.toLowerCase().includes(search.destination.toLowerCase())
        );

  const displayedStays = filteredStays.length > 0 ? filteredStays : STAYS;

  const openModal = (kind: "contact" | "host") => {
    setModalKind(kind);
    setModalSubmitted(false);
    setFormEmail("");
    setFormMessage("");
  };

  const handleModalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formEmail.trim() || !formEmail.includes("@")) return;
    setModalSubmitted(true);
  };

  return (
    <div className="page-gradient relative w-full min-h-screen">
      <CustomCursor />

      <Navbar
        solid={navSolid}
        onGoHome={handleGoHome}
        onGoApartments={handleGoApartments}
        onWhereToGo={handleWhereToGo}
        onOpenContact={() => openModal("contact")}
        onOpenHost={() => openModal("host")}
        savedCount={likedIds.size}
      />

      <main>
        {/* Hero with 3 slides, drifting clouds, concentric-ring rail, and search bar */}
        <HeroSection
          activeSlide={activeSlide}
          onSlideChange={setActiveSlide}
          scrollY={scrollY}
        >
          <SearchBar
            search={search}
            onChange={setSearch}
            onSubmit={scrollToStays}
          />
        </HeroSection>

        {/* Recomended Places to Stay section */}
        <section
          id="stays-section"
          ref={staysRef}
          className="stays-section relative pb-24"
          style={{ zIndex: 20 }}
        >
          <div className="flex items-center justify-between gap-4 mb-8">
            <h2
              className="font-gilda text-[#1d1a1c] m-0"
              style={{
                fontSize: "clamp(26px, 2.45vw, 36px)",
                lineHeight: 1.15,
              }}
            >
              Recomended Places to Stay
            </h2>

            <button
              type="button"
              onClick={() =>
                setSearch((prev) => ({ ...prev, destination: "All Bangkok" }))
              }
              className="px-6 py-2 font-urbanist font-medium text-[13.5px] text-[#1d1a1c] bg-transparent transition-colors duration-250 hover:bg-[#1d1a1c] hover:text-white whitespace-nowrap shrink-0 focus:outline-none"
              style={{
                border: "1.4px solid #1d1a1c",
                borderRadius: "20px",
              }}
            >
              See All
            </button>
          </div>

          <div
            className="grid grid-cols-2 min-[1001px]:grid-cols-4"
            style={{ gap: "clamp(14px, 2.2vw, 30px)" }}
          >
            {displayedStays.map((stay, idx) => (
              <StayCard
                key={stay.id}
                property={stay}
                index={idx}
                isLiked={likedIds.has(stay.id)}
                onToggleLike={toggleLike}
                onSelect={handleSelectStay}
              />
            ))}
          </div>
        </section>
      </main>

      {/* Quiet editorial footer */}
      <footer
        className="border-t border-[#1d1a1c]/8 py-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-[13px] text-[#5c5156]"
        style={{
          paddingLeft: "clamp(20px, 9.5vw, 170px)",
          paddingRight: "clamp(20px, 9.5vw, 170px)",
        }}
      >
        <div className="flex items-center gap-4">
          <span className="font-urbanist font-light text-[20px] text-[#1d1a1c]">
            Krung Travel
          </span>
          <span className="text-[#8a7f83]">·</span>
          <span>Bangkok, Thailand</span>
        </div>
        <div className="flex items-center gap-6">
          <button
            type="button"
            onClick={handleGoApartments}
            className="hover:text-[#1d1a1c] transition-colors bg-transparent border-0 p-0 text-inherit"
          >
            Apartments
          </button>
          <button
            type="button"
            onClick={handleWhereToGo}
            className="hover:text-[#1d1a1c] transition-colors bg-transparent border-0 p-0 text-inherit"
          >
            Where to go
          </button>
          <button
            type="button"
            onClick={() => openModal("contact")}
            className="hover:text-[#1d1a1c] transition-colors bg-transparent border-0 p-0 text-inherit"
          >
            Contact Us
          </button>
        </div>
      </footer>

      {/* Shared-element Detail View */}
      {selectedProperty && (
        <PropertyDetail
          property={selectedProperty}
          originRect={originRect}
          search={search}
          likedIds={likedIds}
          onToggleLike={toggleLike}
          onSelectSimilar={handleSelectStay}
          onClose={() => {
            setSelectedProperty(null);
            setOriginRect(null);
          }}
        />
      )}

      {/* Contact / Become a Host modal */}
      {modalKind && (
        <div
          className="fixed inset-0 z-70 bg-[#1d1a1c]/40 backdrop-blur-sm flex items-center justify-center p-5"
          onClick={() => setModalKind(null)}
        >
          <div
            className="popover-drop bg-white rounded-[22px] w-full max-w-md p-7 relative shadow-[0_24px_70px_rgba(60,30,25,0.28)]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              aria-label="Close dialog"
              onClick={() => setModalKind(null)}
              className="absolute top-5 right-5 w-8 h-8 rounded-full flex items-center justify-center hover:bg-[#fdf0e7] text-[#1d1a1c]"
            >
              <X size={17} />
            </button>

            <h3 className="font-gilda text-[26px] text-[#1d1a1c] m-0">
              {modalKind === "host"
                ? "Become a Krung Host"
                : "Contact Concierge"}
            </h3>
            <p className="text-[14px] text-[#5c5156] mt-2 mb-5 leading-relaxed">
              {modalKind === "host"
                ? "Share your Bangkok teak house, riverside villa, or sky suite with thoughtful travelers."
                : "Questions about river transfers, private longtail charters, or tailored Bangkok stays?"}
            </p>

            {modalSubmitted ? (
              <div className="rounded-[14px] bg-[#fdf0e7] p-5 text-[#1d1a1c]">
                <div className="font-semibold text-[15px]">
                  Request received ✓
                </div>
                <p className="text-[13.5px] text-[#5c5156] mt-1 mb-0">
                  Our Bangkok team will reply to {formEmail} shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleModalSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-[12px] font-medium text-[#5c5156] mb-1">
                    Email address
                  </label>
                  <input
                    type="email"
                    required
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-3.5 py-2.5 rounded-[11px] border border-[#1d1a1c]/15 text-[14px] text-[#1d1a1c] focus:outline-none focus:border-[#1d1a1c]"
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-medium text-[#5c5156] mb-1">
                    {modalKind === "host" ? "Property & neighborhood" : "Message"}
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={formMessage}
                    onChange={(e) => setFormMessage(e.target.value)}
                    placeholder={
                      modalKind === "host"
                        ? "Riverside villa in Thonburi, 3 bedrooms..."
                        : "Tell us your travel dates and preferences..."
                    }
                    className="w-full px-3.5 py-2.5 rounded-[11px] border border-[#1d1a1c]/15 text-[14px] text-[#1d1a1c] focus:outline-none focus:border-[#1d1a1c] resize-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 rounded-full bg-[#f39419] text-white font-semibold text-[14.5px] hover:brightness-105 transition-all"
                >
                  {modalKind === "host" ? "Submit Listing" : "Send Message"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
