// app/contact/page.tsx
export default function ContactPage() {
  return (
    <>
      {/* Fixed hero image behind everything */}
      <div
        aria-hidden
        style={{
          position: "fixed",
          inset: 0,
          zIndex: -6,
          backgroundImage: "url(/contact-hero.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "center 35%",
          backgroundRepeat: "no-repeat",
          filter: "saturate(115%) brightness(0.9)",
          pointerEvents: "none",
        }}
      />

      {/* Neon V-beams overlay (defined in globals.css) */}
      <div className="contact-vfx" aria-hidden />

      <section className="container pt-12 pb-28" style={{ position: "relative" }}>
        {/* ↓ Smaller card: narrower max width + tighter padding */}
        <div
          className="glass"
          style={{
            width: "min(560px, 92vw)",   // was 720px
            margin: "0 auto",
            padding: 20,                  // was 24
          }}
        >
          <h1 className="h1" style={{ marginBottom: 8, fontSize: "clamp(22px, 2.2vw, 30px)" }}>
            Contact Power Crypto World
          </h1>
          <p className="subtle mb-5">Questions, partnerships, or support—drop us a line.</p>

          <form
            action="mailto:pcw@powercryptoworld.com"
            method="post"
            encType="text/plain"
            style={{ display: "grid", gap: 10 }}
          >
            <div className="row" style={{ gap: 6, marginBottom: 10 }}>
              <label className="label">Your name</label>
              <input className="input" name="name" placeholder="Satoshi Nakamoto" required />
            </div>

            <div className="row" style={{ gap: 6, marginBottom: 10 }}>
              <label className="label">Your email</label>
              <input className="input" name="email" type="email" placeholder="you@example.com" required />
            </div>

            <div className="row" style={{ gap: 6, marginBottom: 10 }}>
              <label className="label">Subject</label>
              <input className="input" name="subject" placeholder="Let’s talk" required />
            </div>

            <div className="row" style={{ gap: 6, marginBottom: 12 }}>
              <label className="label">Message</label>
              <textarea
                className="input"
                name="message"
                placeholder="Tell us how we can help…"
                style={{ height: 120, alignItems: "start", paddingTop: 10 }}
                required
              />
            </div>

            <div className="swap-bar">
              <button className="btn btn--swap" style={{ width: "100%", padding: "12px 14px", fontWeight: 700 }}>
                Send Email
              </button>
            </div>
          </form>
        </div>
      </section>
    </>
  );
}
