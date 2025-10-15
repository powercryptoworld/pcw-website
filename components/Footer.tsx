export default function Footer() {
  return (
    <footer
      style={{
        margin: "0 auto",
        maxWidth: 1200,
        padding: "28px 20px 40px",
        textAlign: "center",
      }}
    >
      <p
        style={{
          margin: 0,
          fontSize: 12,
          color: "rgba(230, 240, 255, 0.55)",
          letterSpacing: ".2px",
        }}
      >
        © {new Date().getFullYear()} Power Crypto World. All rights reserved.
      </p>
    </footer>
  );
}
