import { useEffect, useRef, useState } from "react";
import { ChevronDown, Globe, Menu, User } from "lucide-react";

interface NavbarProps {
  solid: boolean;
  onGoHome: () => void;
  onGoApartments: () => void;
  onWhereToGo: () => void;
  onOpenContact: () => void;
  onOpenHost: () => void;
  savedCount: number;
}

export default function Navbar({
  solid,
  onGoHome,
  onGoApartments,
  onWhereToGo,
  onOpenContact,
  onOpenHost,
  savedCount,
}: NavbarProps) {
  const [visitorsMode, setVisitorsMode] = useState("Visitors");
  const [visitorsOpen, setVisitorsOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [lang, setLang] = useState<"EN" | "TH">("EN");

  const visitorsRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (visitorsRef.current && !visitorsRef.current.contains(e.target as Node)) {
        setVisitorsOpen(false);
      }
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const textColor = solid ? "#1d1a1c" : "rgba(255,255,255,.92)";
  const hairlineColor = solid ? "rgba(29,26,28,.08)" : "rgba(255,255,255,.28)";
  const dividerColor = solid ? "rgba(29,26,28,.45)" : "rgba(255,255,255,.45)";

  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: "74px",
        paddingLeft: "clamp(20px, 9.5vw, 170px)",
        paddingRight: "clamp(20px, 9.5vw, 170px)",
        zIndex: 60,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: solid ? "rgba(247,217,198,.86)" : "transparent",
        backdropFilter: solid ? "blur(14px)" : "none",
        WebkitBackdropFilter: solid ? "blur(14px)" : "none",
        color: textColor,
        borderBottom: `1px solid ${hairlineColor}`,
        transition:
          "background-color 0.5s cubic-bezier(.65,0,.35,1), color 0.5s cubic-bezier(.65,0,.35,1), border-color 0.5s cubic-bezier(.65,0,.35,1)",
      }}
    >
      {/* Left side: Logo + 1x42px divider + Visitors dropdown */}
      <div className="flex items-center shrink-0">
        <button
          type="button"
          onClick={onGoHome}
          className="font-urbanist font-light tracking-[-0.01em] whitespace-nowrap shrink-0 bg-transparent border-0 p-0 text-inherit focus:outline-none"
          style={{ fontSize: "26px", lineHeight: 1 }}
        >
          Krung Travel
        </button>

        {/* Divider & Visitors: hidden on <= 640px */}
        <div className="hidden sm:flex items-center shrink-0">
          <div
            style={{
              width: "1px",
              height: "42px",
              backgroundColor: dividerColor,
              marginLeft: "28px",
              marginRight: "28px",
              transition: "background-color 0.5s cubic-bezier(.65,0,.35,1)",
            }}
          />

          <div ref={visitorsRef} className="relative">
            <button
              type="button"
              onClick={() => setVisitorsOpen((prev) => !prev)}
              className="flex items-center gap-1.5 bg-transparent border-0 p-0 text-inherit whitespace-nowrap shrink-0 focus:outline-none"
              style={{ fontSize: "12.5px", fontWeight: 500 }}
            >
              <span>{visitorsMode}</span>
              <ChevronDown size={13} strokeWidth={1.6} />
            </button>

            {visitorsOpen && (
              <div
                className="popover-drop absolute left-0 top-[calc(100%+14px)] w-44 rounded-[14px] bg-white text-[#1d1a1c] py-2 shadow-[0_14px_40px_rgba(90,50,40,0.18)]"
                style={{ zIndex: 80 }}
              >
                {["Visitors", "Solo Travelers", "Family Stays", "Long Stays"].map(
                  (mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => {
                        setVisitorsMode(mode);
                        setVisitorsOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-[13px] transition-colors hover:bg-[#fdf0e7] ${
                        visitorsMode === mode ? "font-semibold" : "font-normal"
                      }`}
                    >
                      {mode}
                    </button>
                  )
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Centre links: hidden on <= 1000px */}
      <nav
        className="hidden min-[1001px]:flex items-center shrink-0"
        style={{ gap: "44px", fontSize: "14.5px", fontWeight: 500 }}
      >
        <button
          type="button"
          onClick={onGoApartments}
          className="nav-link-wipe bg-transparent border-0 p-0 text-inherit whitespace-nowrap shrink-0 focus:outline-none"
        >
          Apartments
        </button>
        <button
          type="button"
          onClick={onWhereToGo}
          className="nav-link-wipe bg-transparent border-0 p-0 text-inherit whitespace-nowrap shrink-0 focus:outline-none"
        >
          Where to go
        </button>
        <button
          type="button"
          onClick={onOpenContact}
          className="nav-link-wipe bg-transparent border-0 p-0 text-inherit whitespace-nowrap shrink-0 focus:outline-none"
        >
          Contact Us
        </button>
      </nav>

      {/* Right side: Become a host (hidden <=1000px) + Globe + Pill */}
      <div className="flex items-center gap-5 shrink-0">
        <button
          type="button"
          onClick={onOpenHost}
          className="hidden min-[1001px]:inline-block nav-link-wipe bg-transparent border-0 p-0 text-inherit whitespace-nowrap shrink-0 focus:outline-none"
          style={{ fontSize: "14px", fontWeight: 500 }}
        >
          Become a host
        </button>

        <button
          type="button"
          aria-label="Toggle language"
          onClick={() => setLang((prev) => (prev === "EN" ? "TH" : "EN"))}
          title={lang === "EN" ? "English (Bangkok)" : "ภาษาไทย (Bangkok)"}
          className="flex items-center justify-center bg-transparent border-0 p-1 text-inherit opacity-90 hover:opacity-100 transition-opacity focus:outline-none"
        >
          <Globe size={18} strokeWidth={1.5} />
        </button>

        <div ref={menuRef} className="relative">
          <button
            type="button"
            aria-label="Account menu"
            onClick={() => setMenuOpen((prev) => !prev)}
            className="flex items-center gap-2.5 px-2.5 py-1.5 bg-transparent text-inherit transition-opacity hover:opacity-85 focus:outline-none"
            style={{
              border: `1.5px solid ${textColor}`,
              borderRadius: "9px",
              transition: "border-color 0.5s cubic-bezier(.65,0,.35,1)",
            }}
          >
            <Menu size={16} strokeWidth={1.7} />
            <span
              className="flex items-center justify-center rounded-full"
              style={{
                width: "22px",
                height: "22px",
                backgroundColor: textColor,
                color: solid ? "#f7d9c6" : "#54404a",
                transition:
                  "background-color 0.5s cubic-bezier(.65,0,.35,1), color 0.5s cubic-bezier(.65,0,.35,1)",
              }}
            >
              <User size={13} strokeWidth={2} />
            </span>
          </button>

          {menuOpen && (
            <div
              className="popover-drop absolute right-0 top-[calc(100%+12px)] w-52 rounded-[16px] bg-white text-[#1d1a1c] py-2.5 shadow-[0_18px_50px_rgba(90,50,40,0.2)]"
              style={{ zIndex: 80 }}
            >
              <div className="px-4 py-1.5 text-[12px] text-[#8a7f83] border-b border-black/5">
                Krung Travel · {lang === "EN" ? "Bangkok, TH" : "กรุงเทพฯ"}
              </div>
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onGoApartments();
                }}
                className="w-full text-left px-4 py-2 text-[13.5px] font-medium hover:bg-[#fdf0e7] flex items-center justify-between"
              >
                <span>Saved Stays</span>
                <span className="text-[12px] text-[#8a7f83]">{savedCount}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onWhereToGo();
                }}
                className="w-full text-left px-4 py-2 text-[13.5px] hover:bg-[#fdf0e7]"
              >
                Where to go
              </button>
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onOpenHost();
                }}
                className="w-full text-left px-4 py-2 text-[13.5px] hover:bg-[#fdf0e7]"
              >
                Become a host
              </button>
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onOpenContact();
                }}
                className="w-full text-left px-4 py-2 text-[13.5px] hover:bg-[#fdf0e7]"
              >
                Contact Us
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
