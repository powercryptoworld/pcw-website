// components/Footer.tsx
export default function Footer() {
  return (
    <footer
      style={{
        position: "fixed",
        right: 10,
        bottom: 8,
        zIndex: 10,
        pointerEvents: "none",
      }}
    >
      <span
        style={{
          fontSize: 11,
          color: "rgba(230,240,255,0.45)",
          letterSpacing: ".2px",
          userSelect: "none",
        }}
      >
        © {new Date().getFullYear()} Power Crypto World Foundation. All rights reserved
      </span>
    </footer>
  );
}
