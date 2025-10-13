export default function BuyPCWPage() {
  return (
    <section className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl md:text-4xl font-semibold">Buy PCW</h1>
      <p className="mt-4 text-muted">
        This is a placeholder page. Link this button to your preferred on-ramp or swap once ready.
      </p>

      <div className="mt-8 rounded-2xl border border-border p-6">
        <a
          href="#"
          onClick={(e) => e.preventDefault()}
          className="inline-block rounded-xl bg-accent px-5 py-3 hover:bg-accent/90 transition shadow-[0_0_20px_var(--color-accent-soft)]"
        >
          Launch Buy Flow
        </a>
        <p className="mt-3 text-sm text-muted">
          Keep this site separate from your swap codebase. This repo deploys to Vercel independently.
        </p>
      </div>
    </section>
  );
}
