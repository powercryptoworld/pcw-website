// components/roadmap/RoadmapCard.tsx
"use client";

import type { Item, Status } from "../../data/roadmap";

const statusColors: Record<Status, { dot: string; bg: string; border: string }> = {
  Planned:  { dot: "#9AA7B8", bg: "rgba(255,255,255,.06)", border: "rgba(220,235,255,.14)" },
  Research: { dot: "#b58cff", bg: "rgba(153,69,255,.10)", border: "rgba(153,69,255,.35)" },
  Building: { dot: "#5fb8ff", bg: "rgba(0,224,255,.10)",  border: "rgba(0,224,255,.35)" },
  Live:     { dot: "#14f195", bg: "rgba(20,241,149,.10)", border: "rgba(20,241,149,.35)" },
};

function Badge({ status }: { status: Status }) {
  const c = statusColors[status];
  return (
    <span
      className="pill"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        background: c.bg,
        borderColor: c.border,
      }}
    >
      <span
        aria-hidden
        style={{
          width: 8,
          height: 8,
          borderRadius: 99,
          background: c.dot,
          boxShadow: `0 0 10px ${c.dot}`,
        }}
      />
      {status}
    </span>
  );
}

export default function RoadmapCard({ item }: { item: Item }) {
  return (
    <article className="glass" style={{ padding: 16 }}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="leading-tight" style={{ fontSize: 18, margin: 0 }}>{item.title}</h3>
        <span className="pill text-xs" style={{ background: "rgba(255,255,255,.06)" }}>
          {item.quarter}
        </span>
      </div>

      <p className="text-muted mb-4" style={{ fontSize: 14, marginTop: 6 }}>{item.blurb}</p>

      <ul style={{ margin: 0, paddingLeft: 16, fontSize: 14 }}>
        {item.deliverables.map((d, i) => (
          <li key={i} style={{ marginBottom: 6 }}>{d}</li>
        ))}
      </ul>

      <div className="mt-6">
        <Badge status={item.status} />
      </div>
    </article>
  );
}
