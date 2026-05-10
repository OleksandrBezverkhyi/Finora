import RegisterForm from "@/components/auth/register-form";
import { getServerMessages } from "@/lib/server-locale";

export default async function RegisterPage({ searchParams }) {
  const params = await searchParams;
  const callbackUrl = params?.callbackUrl || "/dashboard";
  const messages = await getServerMessages();

  return (
    <section className="glass-panel w-full max-w-5xl overflow-hidden rounded-[2rem]">
      <div className="grid min-h-[720px] lg:grid-cols-[1.08fr_0.92fr]">
        <div className="flex flex-col justify-between bg-[linear-gradient(145deg,#7c2d12_0%,#c2410c_48%,#fb923c_100%)] px-8 py-10 text-white sm:px-10 lg:px-12">
          <div className="space-y-5">
            <p className="eyebrow !text-white/80">{messages.common.appName}</p>
            <h1 className="page-title max-w-md">{messages.register.heroTitle}</h1>
            <p className="max-w-md text-sm leading-6 text-white/78 sm:text-base">{messages.register.heroText}</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/16 bg-white/10 p-4 text-center">
              <p className="flex min-h-[2.25rem] items-start justify-center text-xs uppercase tracking-[0.18em] text-white/60">
                {messages.register.profile}
              </p>
              <p className="mt-3 flex min-h-[3.5rem] items-start justify-center text-2xl font-semibold">
                {messages.register.name}
              </p>
            </div>
            <div className="rounded-2xl border border-white/16 bg-white/10 p-4 text-center">
              <p className="flex min-h-[2.25rem] items-start justify-center text-xs uppercase tracking-[0.18em] text-white/60">
                {messages.register.baseCurrency}
              </p>
              <p className="mt-3 flex min-h-[3.5rem] items-start justify-center text-2xl font-semibold">
                {messages.register.hryvnia}
              </p>
            </div>
            <div className="rounded-2xl border border-white/16 bg-white/10 p-4 text-center">
              <p className="flex min-h-[2.25rem] items-start justify-center text-xs uppercase tracking-[0.18em] text-white/60">
                {messages.register.security}
              </p>
              <p className="mt-3 flex min-h-[3.5rem] items-start justify-center text-2xl font-semibold">
                {messages.register.hashed}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center bg-[rgba(255,253,248,0.88)] px-6 py-8 sm:px-10 lg:px-12">
          <div className="w-full space-y-8">
            <div className="space-y-3">
              <p className="eyebrow">{messages.register.eyebrow}</p>
              <h2 className="text-3xl font-semibold tracking-tight text-[var(--foreground)]">{messages.register.title}</h2>
              <p className="muted max-w-md text-sm leading-6">{messages.register.description}</p>
            </div>

            <RegisterForm callbackUrl={callbackUrl} />
          </div>
        </div>
      </div>
    </section>
  );
}
