export default function LoginPage() {
  return (
    <section className="glass-panel w-full max-w-5xl overflow-hidden rounded-[2rem]">
      <div className="grid min-h-[620px] lg:grid-cols-[1.1fr_0.9fr]">
        <div className="flex flex-col justify-between bg-[linear-gradient(135deg,#115e59_0%,#0f766e_55%,#14b8a6_100%)] px-8 py-10 text-white sm:px-10 lg:px-12">
          <div className="space-y-5">
            <p className="eyebrow !text-white/80">Finora</p>
            <h1 className="page-title max-w-md">
              Track money with a calmer view of your monthly decisions.
            </h1>
            <p className="max-w-md text-sm leading-6 text-white/78 sm:text-base">
              This is a temporary login screen placeholder. The next step is wiring Auth.js,
              credentials validation, and protected sessions.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/16 bg-white/10 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-white/60">Period</p>
              <p className="mt-3 text-2xl font-semibold">Month</p>
            </div>
            <div className="rounded-2xl border border-white/16 bg-white/10 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-white/60">Focus</p>
              <p className="mt-3 text-2xl font-semibold">Budget</p>
            </div>
            <div className="rounded-2xl border border-white/16 bg-white/10 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-white/60">Insight</p>
              <p className="mt-3 text-2xl font-semibold">Habits</p>
            </div>
          </div>
        </div>

        <div className="flex items-center bg-[rgba(255,253,248,0.88)] px-6 py-8 sm:px-10 lg:px-12">
          <div className="w-full space-y-8">
            <div className="space-y-3">
              <p className="eyebrow">Login</p>
              <h2 className="text-3xl font-semibold tracking-tight text-[var(--foreground)]">
                Auth UI stub
              </h2>
              <p className="muted max-w-md text-sm leading-6">
                Form fields and server actions will be added in the auth step. For now, this
                route exists so the app shell and navigation can be committed cleanly.
              </p>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border border-[var(--border)] bg-white px-4 py-3">
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-[var(--muted)]">
                  Email
                </p>
                <p className="mt-2 text-sm text-[var(--foreground)]/55">name@example.com</p>
              </div>
              <div className="rounded-2xl border border-[var(--border)] bg-white px-4 py-3">
                <p className="text-xs font-medium uppercase tracking-[0.16em] text-[var(--muted)]">
                  Password
                </p>
                <p className="mt-2 text-sm tracking-[0.3em] text-[var(--foreground)]/55">
                  ••••••••
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                className="rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)]"
              >
                Login coming soon
              </button>
              <button
                type="button"
                className="rounded-full border border-[var(--border)] bg-white px-5 py-3 text-sm font-semibold text-[var(--foreground)]"
              >
                Register route next
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
