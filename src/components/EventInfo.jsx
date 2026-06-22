import { EVENT, PRICES, formatARS } from '../lib/event'

export default function EventInfo() {
  return (
    <section className="mx-auto max-w-4xl px-4 pb-6 pt-10 sm:px-6 sm:pt-14">
      <p className="eyebrow">{EVENT.name}</p>
      <h1 className="mt-2 text-3xl font-bold leading-tight text-ink sm:text-4xl">
        Reservá tu lugar
      </h1>
      <p className="mt-3 max-w-xl text-ink/60">
        Dos funciones: {EVENT.days.map((d) => d.label).join(' y ')}, a las 15 hs
        ambos días. Completá el formulario para dejar tu lugar registrado.
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <Rule>Menores de 10 años no abonan.</Rule>
        <Rule>Alumnos de Otoha no abonan.</Rule>
        <Rule>
          A partir de los 10 años: <strong>{formatARS(PRICES.ONE_DAY)}</strong>{' '}
          por día.
        </Rule>
        <Rule highlight>
          Promo dos días: <strong>{formatARS(PRICES.TWO_DAYS)}</strong> por
          persona.
        </Rule>
      </div>
    </section>
  )
}

function Rule({ children, highlight }) {
  return (
    <div
      className={`flex items-start gap-3 rounded-xl border p-3.5 text-sm ${
        highlight
          ? 'border-gold/40 bg-gold/10 text-ink'
          : 'border-ink/10 bg-cream-soft text-ink/80'
      }`}
    >
      <span
        className={`mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full text-[11px] font-bold ${
          highlight ? 'bg-gold text-ink' : 'bg-wine/10 text-wine'
        }`}
      >
        {highlight ? '★' : '✓'}
      </span>
      <span>{children}</span>
    </div>
  )
}
