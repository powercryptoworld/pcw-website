// components/roadmap/index.tsx
"use client";

import React from "react";
import { ROADMAP } from "../../data/roadmap";
import YearRail from "./YearRail";
import RoadmapSection from "./RoadmapSection";

export default function Roadmap() {
  const years = ROADMAP.map((y) => y.year);
  const [activeYear, setActiveYear] = React.useState<number | null>(years[0] ?? null);

  React.useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>("section[id^='year-']"));
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => (a.boundingClientRect.top > b.boundingClientRect.top ? 1 : -1))[0];

        if (visible) {
          const y = Number((visible.target as HTMLElement).dataset.year);
          if (!Number.isNaN(y)) setActiveYear(y);
        }
      },
      { rootMargin: "-30% 0px -60% 0px", threshold: [0.1, 0.25, 0.5, 0.75] }
    );

    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  const jumpTo = (year: number) => {
    const el = document.getElementById(`year-${year}`);
    if (!el) return;
    const topOffset = 70;
    const rect = el.getBoundingClientRect();
    const absoluteY = window.scrollY + rect.top - topOffset;
    window.scrollTo({ top: absoluteY, behavior: "smooth" });
  };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "0fr 1fr", gap: 18 }}>
      <YearRail years={years} activeYear={activeYear} onJump={jumpTo} />
      <div style={{ display: "grid", gap: 28 }}>
        {ROADMAP.map((yr) => (
          <RoadmapSection key={yr.year} data={yr} />
        ))}
      </div>
    </div>
  );
}
