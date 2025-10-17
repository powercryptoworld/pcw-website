// components/roadmap/RoadmapSection.tsx
"use client";

import type { Year } from "../../data/roadmap";
import RoadmapCard from "./RoadmapCard";

export default function RoadmapSection({ data }: { data: Year }) {
  return (
    <section id={`year-${data.year}`} data-year={data.year} style={{ scrollMarginTop: 80 }}>
      <div style={{ margin: "22px 0 10px" }}>
        <h2 className="leading-tight" style={{ fontSize: 22, margin: 0 }}>
          {data.year}
        </h2>
        {data.kpis && data.kpis.length > 0 && (
          <div className="tabs mt-2">
            {data.kpis.map((k, i) => (
              <span key={i} className="pill">{k}</span>
            ))}
          </div>
        )}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          gap: 14,
        }}
      >
        {data.items.map((it, idx) => (
          <RoadmapCard key={idx} item={it} />
        ))}
      </div>
    </section>
  );
}
