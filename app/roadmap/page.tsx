// app/roadmap/page.tsx
import Roadmap from "../../components/roadmap";

export default function RoadmapPage() {
  return (
    <>
      {/* Fixed hero image behind everything */}
      <div
        aria-hidden
        style={{
          position: "fixed",
          inset: 0,
          zIndex: -6,
          backgroundImage: "url(/roadmap-hero.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center 45%",
          backgroundRepeat: "no-repeat",
          filter: "saturate(115%) brightness(0.95)",
          pointerEvents: "none",
        }}
      />

      {/* Neon overlay (reused) */}
      <div className="swap-vfx" aria-hidden />

      {/* Roadmap content */}
      <section className="container pb-28" style={{ paddingTop: 8 }}>
        <header style={{ margin: "24px 0 18px" }}>
          <h1 className="h1">2026–2030 Roadmap</h1>
          <p className="subtle">Ambitious, iterative, and subject to change as we ship and learn.</p>
        </header>

        <Roadmap />
      </section>
    </>
  );
}
