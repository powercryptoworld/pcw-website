// components/roadmap/YearRail.tsx
"use client";

export default function YearRail({
  years,
  activeYear,
  onJump,
}: {
  years: number[];
  activeYear: number | null;
  onJump: (year: number) => void;
}) {
  return (
    <>
      {/* Desktop sticky rail (hidden class is overridden by your layout breakpoint utilities) */}
      <aside
        aria-label="Year Navigation"
        className="hidden"
        style={{
          position: "sticky",
          top: 68,
          alignSelf: "start",
          zIndex: 1,
          width: 120,
        }}
      >
        <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {years.map((y) => {
            const active = activeYear === y;
            return (
              <li key={y} style={{ marginBottom: 10 }}>
                <button
                  type="button"
                  onClick={() => onJump(y)}
                  className={active ? "pill pill-active" : "pill"}
                  style={{ width: "100%", justifyContent: "center" }}
                >
                  {y}
                </button>
              </li>
            );
          })}
        </ul>
      </aside>

      {/* Mobile tabs */}
      <div
        aria-label="Year Tabs"
        style={{
          position: "sticky",
          top: 56,
          zIndex: 2,
          marginBottom: 16,
          padding: "8px 4px",
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
          background: "linear-gradient(180deg, rgba(12,16,24,.72), rgba(12,16,24,.42))",
          borderBottom: "1px solid rgba(255,255,255,.06)",
          display: "flex",
          gap: 8,
          overflowX: "auto",
        }}
      >
        {years.map((y) => {
          const active = activeYear === y;
          return (
            <button
              key={y}
              type="button"
              onClick={() => onJump(y)}
              className={active ? "pill pill-active" : "pill"}
              style={{ whiteSpace: "nowrap" }}
            >
              {y}
            </button>
          );
        })}
      </div>
    </>
  );
}
