"use client";

export default function ContactDock() {
  return (
    <aside
      aria-label="Contact us"
      className="fixed bottom-6 right-6 z-50"
    >
      <button className="px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur">
        Contact us
      </button>
    </aside>
  );
}
