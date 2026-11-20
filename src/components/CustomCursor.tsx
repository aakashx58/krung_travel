import { useEffect, useState } from "react";

export default function CustomCursor() {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [visible, setVisible] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [isRec, setIsRec] = useState(false);
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    if (coarse) {
      setIsTouch(true);
      return;
    }

    const params = new URLSearchParams(window.location.search);
    setIsRec(params.has("rec"));

    const isClickableTarget = (target: EventTarget | null): boolean => {
      if (!(target instanceof Element)) return false;
      return Boolean(
        target.closest(
          'a, button, [role="button"], [data-clickable="true"], input, select, textarea, .stay-card'
        )
      );
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      setPos({ x: e.clientX, y: e.clientY });
      setVisible(true);
      setHovered(isClickableTarget(e.target));
    };

    const onDown = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      setPressed(true);
    };

    const onUp = () => {
      setPressed(false);
    };

    const onLeave = () => {
      setVisible(false);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    document.addEventListener("mouseleave", onLeave);

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      document.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  if (isTouch) return null;

  const baseSize = isRec ? 50 : 26;
  const hoverSize = isRec ? 58 : 38;
  const pressSize = isRec ? 62 : 44;
  const borderW = isRec ? 7 : 5;

  const size = pressed ? pressSize : hovered ? hoverSize : baseSize;

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: `${size}px`,
        height: `${size}px`,
        marginLeft: `${-size / 2}px`,
        marginTop: `${-size / 2}px`,
        borderRadius: "50%",
        pointerEvents: "none",
        zIndex: 9999,
        opacity: visible ? 1 : 0,
        transform: `translate3d(${pos.x}px, ${pos.y}px, 0)`,
        backgroundColor: pressed
          ? "transparent"
          : hovered
            ? "rgba(72,62,68,.35)"
            : "rgba(72,62,68,.55)",
        border: pressed
          ? `${borderW}px solid rgba(20,16,18,.9)`
          : "0px solid transparent",
        boxSizing: "border-box",
        transition:
          "width 0.25s cubic-bezier(.16,1,.3,1), height 0.25s cubic-bezier(.16,1,.3,1), margin 0.25s cubic-bezier(.16,1,.3,1), background-color 0.25s cubic-bezier(.16,1,.3,1), border 0.18s cubic-bezier(.16,1,.3,1), opacity 0.2s ease",
      }}
    />
  );
}
