import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthError } from "next-auth";

import AuthField from "@/components/auth/auth-field";
import AuthShowcase from "@/components/auth/auth-showcase";
import { signIn } from "@/lib/auth";

const errorMessages = {
  CredentialsSignin: "Invalid email or password.",
  Default: "Unable to sign in right now. Try again.",
};

const showcaseCards = [
  { eyebrow: "Overview", value: "Income" },
  { eyebrow: "Planning", value: "Budget" },
  { eyebrow: "Control", value: "Balance" },
];

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
        <AuthShowcase
          gradientClassName="bg-[linear-gradient(145deg,#115e59_0%,#0f766e_48%,#14b8a6_100%)]"
          title="Track income and spending with a cleaner daily workflow."
          description="Stay on top of your budget, follow daily expenses, and keep every financial decision in one organized space."
          cards={showcaseCards}
        />
        <LoginPanel
          callbackUrl={callbackUrl}
          errorMessage={errorMessage}
          registered={registered}
          registeredEmail={registeredEmail}
        />
      </div>
    </section>
  );
}

function LoginPanel({ callbackUrl, errorMessage, registered, registeredEmail }) {
  return (
    <div className="flex items-center bg-[rgba(255,253,248,0.88)] px-6 py-8 sm:px-10 lg:px-12">
      <div className="w-full space-y-8">
        <div className="space-y-3">
          <p className="eyebrow">Login</p>
          <h2 className="text-3xl font-semibold tracking-tight text-[var(--foreground)]">
            Welcome back
          </h2>
          <p className="muted max-w-md text-sm leading-6">
            Sign in to review your finances, recent transactions, and current balance.
          </p>
        </div>

        <form action={authenticate} className="space-y-5">
          <input type="hidden" name="callbackUrl" value={callbackUrl} />
          <AuthField
            label="Email"
            name="email"
            type="email"
            autoComplete="email"
            required
            defaultValue={registeredEmail}
            placeholder="name@example.com"
          />
          <AuthField
            label="Password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            placeholder="Enter your password"
          />
          {registered ? <SuccessNotice /> : null}
          {errorMessage ? <ErrorNotice message={errorMessage} /> : null}
          <LoginActions callbackUrl={callbackUrl} />
        </form>

        <div className="rounded-2xl border border-dashed border-[var(--border)] px-4 py-4">
          <p className="text-sm font-medium text-[var(--foreground)]">No account yet?</p>
          <p className="muted mt-2 text-sm leading-6">
            Create an account in a few steps and start keeping your personal finances in order.
          </p>
        </div>
      </div>
    </div>
  );
}

function LoginActions({ callbackUrl }) {
  const registerHref =
    callbackUrl && callbackUrl !== "/dashboard"
      ? `/register?callbackUrl=${encodeURIComponent(callbackUrl)}`
      : "/register";

  return (
    <div className="flex flex-col gap-3 pt-2 sm:flex-row">
      <button
        type="submit"
        className="rounded-full bg-[var(--accent)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--accent-strong)] hover:shadow-[0_14px_30px_rgba(15,118,110,0.24)]"
      >
        Sign in
      </button>
      <Link
        href={registerHref}
        className="rounded-full border border-[var(--border)] bg-white px-5 py-3 text-center text-sm font-semibold text-[var(--foreground)] transition hover:border-[var(--accent)] hover:text-[var(--accent-strong)]"
      >
        Create account
      </Link>
    </div>
  );
}

function SuccessNotice() {
  return (
    <div className="rounded-2xl border border-emerald-300 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
      Account created successfully. Sign in with your new credentials.
    </div>
  );
}

function ErrorNotice({ message }) {
  return (
    <div className="rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
      {message}
    </div>
  );
}
