import { useState } from 'react'
import { PAYMENT, formatARS } from '../lib/event'

export default function PaymentScreen({ result, onDone }) {
  const { reservation, total } = result
  const [copied, setCopied] = useState('')

  function copy(text, label) {
    navigator.clipboard?.writeText(text)
    setCopied(label)
    setTimeout(() => setCopied(''), 1500)
  }

  return (
    <div className="space-y-6">
      <section className="card border-moss/30 bg-moss/5 p-6 text-center">
        <span className="text-3xl">✓</span>
        <h2 className="mt-2 text-xl font-bold text-ink">
          ¡Registro confirmado!
        </h2>
        <p className="mt-1 text-sm text-ink/60">
          Gracias, {reservation.first_name}. Tu lugar quedó reservado. Te
          esperamos en el evento.
        </p>
      </section>

      {total > 0 ? (
        <>
          <section className="card p-6">
            <div className="flex items-center justify-between">
              <p className="text-sm text-ink/60">Total a abonar</p>
              <p className="font-display text-2xl font-bold text-wine">
                {formatARS(total)}
              </p>
            </div>
            <p className="mt-2 text-sm text-ink/55">
              El pago no es obligatorio para quedar registrado. Elegí el método
              que prefieras; también podés abonar en puerta. Una vez efectuado el pago, no olvides avisarnos para confirmar tu asistencia. ¡Gracias!
            </p>
          </section>

          {/* Transferencia */}
          <PayOption title="Transferencia bancaria" badge="Online">
            <dl className="space-y-2 text-sm">
              <CopyRow
                label="Alias"
                value={PAYMENT.transfer.alias}
                onCopy={() => copy(PAYMENT.transfer.alias, 'alias')}
                copied={copied === 'alias'}
              />
              <Row label="Titular" value={PAYMENT.transfer.titular} />
              <Row label="CUIL" value={PAYMENT.transfer.cuil} />
              <Row label="Banco" value={PAYMENT.transfer.banco} />
            </dl>
          </PayOption>

          {/* Efectivo */}
          <PayOption title="Efectivo en puerta" badge="El día del evento">
            <p className="text-sm text-ink/60">{PAYMENT.cashNote}</p>
          </PayOption>
        </>
      ) : (
        <section className="card p-6 text-center">
          <p className="text-ink/70">
            Tu grupo no tiene cargo (menores de 10 y/o alumnos). ¡Nos vemos en el
            evento!
          </p>
        </section>
      )}

      <div className="text-center">
        <button onClick={onDone} className="btn-ghost">
          Hacer otro registro
        </button>
      </div>
    </div>
  )
}

function PayOption({ title, badge, children }) {
  return (
    <section className="card p-6">
      <div className="mb-3 flex items-center gap-3">
        <h3 className="text-base font-bold text-ink">{title}</h3>
        <span className="rounded-full bg-gold/20 px-2.5 py-0.5 text-[11px] font-semibold text-gold">
          {badge}
        </span>
      </div>
      {children}
    </section>
  )
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-ink/50">{label}</dt>
      <dd className="font-medium text-ink">{value}</dd>
    </div>
  )
}

function CopyRow({ label, value, onCopy, copied }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-ink/50">{label}</dt>
      <dd className="flex items-center gap-2">
        <span className="font-mono font-medium text-ink">{value}</span>
        <button
          onClick={onCopy}
          className="rounded-md border border-ink/15 px-2 py-0.5 text-xs text-ink/60 hover:border-wine hover:text-wine"
        >
          {copied ? '¡Copiado!' : 'Copiar'}
        </button>
      </dd>
    </div>
  )
}
