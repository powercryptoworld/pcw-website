// components/Footer.tsx
export default function Footer() {
  return (
    <footer className="mx-auto max-w-6xl px-6 py-10 text-center">
      <p className="text-xs text-white/50">
        © {new Date().getFullYear()} Power Crypto World. All rights reserved.
      </p>
    </footer>
  );
}
