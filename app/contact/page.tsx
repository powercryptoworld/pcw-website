export default function ContactPage() {
  const EMAIL = "pcw@powercryptoworld.com";

  return (
    <section className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl md:text-4xl font-semibold">Contact</h1>
      <p className="mt-2 text-sm text-muted">
        Prefer email?{" "}
        <a
          className="underline hover:glow-shadow"
          href={`mailto:${EMAIL}`}
        >
          {EMAIL}
        </a>
      </p>

      <div className="mt-8 rounded-2xl border border-border p-6 bg-elev/60 backdrop-blur">
        <form
          className="grid gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            const data = new FormData(e.currentTarget as HTMLFormElement);
            const subject = encodeURIComponent("PCW Website Inquiry");
            const body = encodeURIComponent(
              `Name: ${data.get("name")}\nEmail: ${data.get("email")}\nMessage:\n${data.get("message")}`
            );
            window.location.href = `mailto:${EMAIL}?subject=${subject}&body=${body}`;
          }}
        >
          <label className="grid gap-2">
            <span className="text-sm text-muted">Name</span>
            <input
              className="rounded-xl bg-elev border border-border px-3 py-2 outline-none focus:border-[var(--sol-green)]"
              name="name"
              required
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm text-muted">Email</span>
            <input
              className="rounded-xl bg-elev border border-border px-3 py-2 outline-none focus:border-[var(--sol-green)]"
              type="email"
              name="email"
              required
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm text-muted">Message</span>
            <textarea
              className="min-h-[140px] rounded-xl bg-elev border border-border px-3 py-2 outline-none focus:border-[var(--sol-green)]"
              name="message"
              required
            />
          </label>

          <button
            className="mt-2 rounded-xl bg-accent px-5 py-3 hover:bg-accent/90 transition glow-shadow"
            type="submit"
          >
            Send
          </button>
        </form>
      </div>
    </section>
  );
}
