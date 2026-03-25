/**
 * Decorative marketing panel used on authentication pages.
 *
 * @param {{
 *   gradientClassName: string,
 *   title: string,
 *   description: string,
 *   cards: Array<{ eyebrow: string, value: string }>
 * }} props
 * @returns {import("react").JSX.Element}
 */
export default function AuthShowcase({ gradientClassName, title, description, cards }) {
  return (
    <div
      className={`flex flex-col justify-between px-8 py-10 text-white sm:px-10 lg:px-12 ${gradientClassName}`}
    >
      <div className="space-y-5">
        <p className="eyebrow !text-white/80">Finora</p>
        <h1 className="page-title max-w-md">{title}</h1>
        <p className="max-w-md text-sm leading-6 text-white/78 sm:text-base">{description}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {cards.map((card) => (
          <div key={card.eyebrow} className="rounded-2xl border border-white/16 bg-white/10 p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-white/60">{card.eyebrow}</p>
            <p className="mt-3 text-2xl font-semibold">{card.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
