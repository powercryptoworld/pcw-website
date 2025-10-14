export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-white/10">
      {/* thin glow line */}
      <div className="h-px w-full glow-line" />

      <div className="mx-auto max-w-6xl px-6 py-6">
        <p className="text-xs text-neutral-400">
          © {new Date().getFullYear()} Power Crypto World. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
