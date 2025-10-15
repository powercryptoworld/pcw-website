// app/not-found.tsx
import Link from "next/link";

export default function NotFound() {
  return (
    <section
      className="container"
      style={{
        minHeight: "60vh",
        display: "grid",
        placeItems: "center",
        padding: "80px 0",
        textAlign: "center",
      }}
    >
      <div
        className="glass"
        style={{
          width: "min(720px, 92vw)",
          padding: 24,
        }}
        role="alert"
        aria-live="assertive"
      >
        <h1
          className="h1"
          style={{ marginBottom: 8, fontSize: "clamp(28px,3.2vw,40px)" }}
        >
          Page not found
        </h1>
        <p className="subtle" style={{ marginBottom: 18 }}>
          The URL you entered doesn’t exist. Let’s get you back to the Swap.
        </p>

        <div className="swap-bar">
          <Link
            href="/"
            className="btn btn--swap"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              padding: "14px 16px",
              fontWeight: 700,
              textDecoration: "none",
            }}
          >
            Go to Swap
          </Link>
        </div>
      </div>
    </section>
  );
}
