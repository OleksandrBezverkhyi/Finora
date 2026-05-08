import ProfileSettings from "@/components/profile/profile-settings";
import { getServerMessages } from "@/lib/server-locale";
import { requireSession } from "@/lib/session";

export default async function ProfilePage() {
  const session = await requireSession();
  const messages = await getServerMessages();

  const initialProfile = {
    name: session.user.name || "",
    email: session.user.email || "",
    currency: session.user.currency || "UAH",
  };

  return (
    <div className="space-y-8">
      <section className="glass-panel rounded-[2rem] p-6 sm:p-8">
        <div className="space-y-3">
          <p className="eyebrow">{messages.profilePage.eyebrow}</p>
          <h1 className="page-title max-w-3xl text-[var(--foreground)]">
            {messages.profilePage.title}
          </h1>
          <p className="muted max-w-2xl text-sm leading-6 sm:text-base">
            {messages.profilePage.description}
          </p>
        </div>
      </section>

      <ProfileSettings initialProfile={initialProfile} />
    </div>
  );
}
