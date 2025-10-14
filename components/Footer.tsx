export default function Footer() {
  return (
    <footer className="relative z-10">
      <div className="mx-auto max-w-6xl px-6 py-6">
        <p className="text-xs text-neutral-400">
          © {new Date().getFullYear()} Power Crypto World. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
