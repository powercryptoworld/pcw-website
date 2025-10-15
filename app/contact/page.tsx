// app/contact/page.tsx
export default function ContactPage() {
  return (
    <section className="container pt-12 pb-28">
      <div className="glass" style={{ width: "min(560px, 94vw)", margin: "0 auto", padding: 24 }}>
        <h1 className="h1" style={{ marginBottom: 12 }}>Get connected</h1>
        <p className="subtle mb-4">Send us a message and we’ll get back to you.</p>

        <form
          action="mailto:pcw@powercryptoworld.com"
          method="post"
          encType="text/plain"
          style={{ display: "grid", gap: 12 }}
        >
          <input className="input" name="name" placeholder="Your name" required />
          <input className="input" name="email" type="email" placeholder="Your email" required />
          <textarea
            className="input"
            name="message"
            placeholder="Your message"
            style={{ height: 120, alignItems: "start", paddingTop: 10 }}
            required
          />
          <div className="swap-bar">
            <button className="btn btn--swap" style={{ width: "100%", padding: "14px 16px", fontWeight: 700 }}>
              Send
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
