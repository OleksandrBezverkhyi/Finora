import RegisterForm from "@/components/auth/register-form";

/**
 * Registration page that prepares the callback URL and renders the account creation form.
 *
 * @param {{ searchParams: Promise<Record<string, string | string[] | undefined>> }} props
 * @returns {Promise<import("react").JSX.Element>}
 */
export default async function RegisterPage({ searchParams }) {
  const params = await searchParams;
  const callbackUrl = params?.callbackUrl || "/dashboard";

  return (
    <section className="glass-panel w-full max-w-5xl overflow-hidden rounded-[2rem]">
      <div className="grid min-h-[720px] lg:grid-cols-[1.08fr_0.92fr]">
        <div className="flex flex-col justify-between bg-[linear-gradient(145deg,#7c2d12_0%,#c2410c_48%,#fb923c_100%)] px-8 py-10 text-white sm:px-10 lg:px-12">
          <div className="space-y-5">
            <p className="eyebrow !text-white/80">Finora</p>
            <h1 className="page-title max-w-md">
              Create your workspace before budgeting, analytics, and planning kick in.
            </h1>
            <p className="max-w-md text-sm leading-6 text-white/78 sm:text-base">
              Create your account once and start tracking income, expenses, savings goals, and
              monthly habits in one place.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/16 bg-white/10 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-white/60">Profile</p>
              <p className="mt-3 text-2xl font-semibold">Name</p>
            </div>
            <div className="rounded-2xl border border-white/16 bg-white/10 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-white/60">Base currency</p>
              <p className="mt-3 text-2xl font-semibold">₴ hryvnia</p>
            </div>
            <div className="rounded-2xl border border-white/16 bg-white/10 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-white/60">Security</p>
              <p className="mt-3 text-2xl font-semibold">Hashed</p>
            </div>
          </div>
        </div>

        <div className="flex items-center bg-[rgba(255,253,248,0.88)] px-6 py-8 sm:px-10 lg:px-12">
          <div className="w-full space-y-8">
            <div className="space-y-3">
              <p className="eyebrow">Register</p>
              <h2 className="text-3xl font-semibold tracking-tight text-[var(--foreground)]">
                Create your account
              </h2>
              <p className="muted max-w-md text-sm leading-6">
                Fill in your details to create a personal space for daily financial tracking. All
                amounts in the app are recorded in hryvnia by default.
              </p>
            </div>

            <RegisterForm callbackUrl={callbackUrl} />
          </div>
        </div>
      </div>
    </section>
  );
}
