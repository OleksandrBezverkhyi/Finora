import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthError } from "next-auth";

import { signIn } from "@/lib/auth";

const errorMessages = {
  CredentialsSignin: "Invalid email or password.",
  Default: "Unable to sign in right now. Try again.",
};

async function authenticate(formData) {
  "use server";

  const email = formData.get("email");
  const password = formData.get("password");
  const callbackUrl = formData.get("callbackUrl") || "/dashboard";

  try {
    await signIn("credentials", {
      email,
      password,
      redirectTo: callbackUrl,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      const code = error.type || "Default";
      redirect(`/login?error=${encodeURIComponent(code)}&callbackUrl=${encodeURIComponent(callbackUrl)}`);
    }

    throw error;
  }
}

export default async function LoginPage({ searchParams }) {
  const params = await searchParams;
  const errorCode = params?.error;
  const callbackUrl = params?.callbackUrl || "/dashboard";
  const registered = params?.registered === "1";
  const registeredEmail = params?.email || "";
  const errorMessage = errorCode ? errorMessages[errorCode] || errorMessages.Default : null;

  return (
    <section className="glass-panel w-full max-w-5xl overflow-hidden rounded-[2rem]">
      <div className="grid min-h-[680px] lg:grid-cols-[1.08fr_0.92fr]">
        <div className="flex flex-col justify-between bg-[linear-gradient(145deg,#115e59_0%,#0f766e_48%,#14b8a6_100%)] px-8 py-10 text-white sm:px-10 lg:px-12">
          <div className="space-y-5">
            <p className="eyebrow !text-white/80">Finora</p>
            <h1 className="page-title max-w-md">
              Track income and spending with a cleaner daily workflow.
            </h1>
            <p className="max-w-md text-sm leading-6 text-white/78 sm:text-base">
              Credentials auth is now wired through Auth.js. You can create a new account from the
              register screen and then continue to the protected dashboard.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/16 bg-white/10 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-white/60">Auth</p>
              <p className="mt-3 text-2xl font-semibold">Ready</p>
            </div>
            <div className="rounded-2xl border border-white/16 bg-white/10 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-white/60">Session</p>
              <p className="mt-3 text-2xl font-semibold">JWT</p>
            </div>
            <div className="rounded-2xl border border-white/16 bg-white/10 p-4">
              <p className="text-xs uppercase tracking-[0.18em] text-white/60">Route guard</p>
              <p className="mt-3 text-2xl font-semibold">On</p>
            </div>
          </div>
        </div>

        <div className="flex items-center bg-[rgba(255,253,248,0.88)] px-6 py-8 sm:px-10 lg:px-12">
          <div className="w-full space-y-8">
            <div className="space-y-3">
              <p className="eyebrow">Login</p>
              <h2 className="text-3xl font-semibold tracking-tight text-[var(--foreground)]">
                Welcome back
              </h2>
              <p className="muted max-w-md text-sm leading-6">
                Sign in with the email and password already stored in your local database.
              </p>
            </div>

            <form action={authenticate} className="space-y-5">
              <input type="hidden" name="callbackUrl" value={callbackUrl} />

              <label className="block space-y-2">
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                  Email
                </span>
                <input
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  defaultValue={registeredEmail}
                  placeholder="name@example.com"
                  className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-base text-[var(--foreground)] outline-none transition placeholder:text-[var(--muted)]/70 focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent-soft)]"
                />
              </label>

              <label className="block space-y-2">
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
                  Password
                </span>
                <input
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  placeholder="Enter your password"
                  className="w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-base text-[var(--foreground)] outline-none transition placeholder:text-[var(--muted)]/70 focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent-soft)]"
                />
              </label>

              {registered ? (
                <div className="rounded-2xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
                  Account created successfully. Sign in with your new credentials.
                </div>
              ) : null}

              {errorMessage ? (
                <div className="rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                  {errorMessage}
                </div>
              ) : null}

              <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                <button
                  type="submit"
                  className="rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)] hover:shadow-[0_14px_30px_rgba(15,118,110,0.24)]"
                >
                  Sign in
                </button>
                <Link
                  href={`/register${callbackUrl && callbackUrl !== "/dashboard" ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ""}`}
                  className="rounded-full border border-[var(--border)] bg-white px-5 py-3 text-center text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--accent)] hover:text-[var(--accent-strong)]"
                >
                  Create account
                </Link>
              </div>
            </form>

            <div className="rounded-2xl border border-dashed border-[var(--border)] px-4 py-4">
              <p className="text-sm font-medium text-[var(--foreground)]">No account yet?</p>
              <p className="muted mt-2 text-sm leading-6">
                Open the register page, create an account, then come back here to sign in.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
