import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { EVENT, CATEGORIES, PAYMENT_METHODS, formatARS } from '../lib/event'
import {
  priceForAttendee,
  totalForReservation,
  attendeeIsValid,
} from '../lib/pricing'

function newAttendee(prefill = {}) {
  return {
    key: crypto.randomUUID(),
    first_name: '',
    last_name: '',
    category: 'adulto',
    days: [],
    needs_seat: false,
    ...prefill,
  }
}

export default function RegistrationForm({ onRegistered }) {
  const [registrar, setRegistrar] = useState({
    first_name: '',
    last_name: '',
    email: '',
    student_name: '',
  })
  const [registrarAttends, setRegistrarAttends] = useState(false)
  const [registrarDetails, setRegistrarDetails] = useState({
    category: 'adulto',
    days: [],
    needs_seat: false,
  })
  const [others, setOthers] = useState([])
  const [paymentMethod, setPaymentMethod] = useState('transferencia')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Construye la lista final de asistentes (registrador + otros)
  function buildAttendees() {
    const list = []
    if (registrarAttends) {
      list.push({
        first_name: registrar.first_name,
        last_name: registrar.last_name,
        category: registrarDetails.category,
        days: registrarDetails.days,
        needs_seat: registrarDetails.needs_seat,
      })
    }
    others.forEach((o) =>
      list.push({
        first_name: o.first_name,
        last_name: o.last_name,
        category: o.category,
        days: o.days,
        needs_seat: o.needs_seat,
      })
    )
    return list
  }

  const attendees = buildAttendees()
  const total = totalForReservation(attendees)

  function updateOther(key, patch) {
    setOthers((prev) =>
      prev.map((o) => (o.key === key ? { ...o, ...patch } : o))
    )
  }
  function toggleDay(daysArr, dayId) {
    return daysArr.includes(dayId)
      ? daysArr.filter((d) => d !== dayId)
      : [...daysArr, dayId]
  }

  function validate() {
    if (!registrar.first_name.trim() || !registrar.last_name.trim())
      return 'Completá tu nombre y apellido.'
    if (!registrar.email.trim() || !registrar.email.includes('@'))
      return 'Ingresá un email válido.'
    if (attendees.length === 0)
      return 'Agregá al menos una persona que asista (vos u otra persona).'
    for (const a of attendees) {
      if (!attendeeIsValid(a))
        return `Revisá los datos de ${a.first_name || 'un asistente'}: faltan nombre, apellido o días.`
    }
    if (total > 0 && !paymentMethod)
      return 'Elegí un método de pago.'
    return ''
  }

  async function handleSubmit() {
    const v = validate()
    if (v) {
      setError(v)
      return
    }
    setError('')
    setSaving(true)

    // Generamos el id en el cliente para no necesitar leer la fila de vuelta
    // (RLS sólo permite al público INSERTAR, no leer).
    const reservationId = crypto.randomUUID()

    // 1) Crear la reserva
    const { error: rErr } = await supabase.from('reservations').insert({
      id: reservationId,
      first_name: registrar.first_name.trim(),
      last_name: registrar.last_name.trim(),
      email: registrar.email.trim(),
      student_name: registrar.student_name.trim() || null,
      total_amount: total,
      payment_method: total > 0 ? paymentMethod : null,
    })

    if (rErr) {
      console.error('Error al crear reserva:', rErr)
      setError('Hubo un error al guardar la reserva: ' + rErr.message)
      setSaving(false)
      return
    }

    // 2) Insertar asistentes
    const rows = attendees.map((a) => ({
      reservation_id: reservationId,
      first_name: a.first_name.trim(),
      last_name: a.last_name.trim(),
      category: a.category,
      day_sab: a.days.includes('sab'),
      day_dom: a.days.includes('dom'),
      needs_seat: !!a.needs_seat,
      price: priceForAttendee(a),
    }))
    const { error: aErr } = await supabase.from('attendees').insert(rows)

    if (aErr) {
      console.error('Error al guardar asistentes:', aErr)
      setError('La reserva se creó pero hubo un problema con los asistentes.')
      setSaving(false)
      return
    }

    // 3) Enviar emails (registrador + administración). No bloquea el registro:
    // si el email falla, la reserva ya quedó guardada igual.
    const payload = {
      reservation: {
        id: reservationId,
        first_name: registrar.first_name.trim(),
        last_name: registrar.last_name.trim(),
        email: registrar.email.trim(),
        student_name: registrar.student_name.trim() || null,
        total_amount: total,
        payment_method: total > 0 ? paymentMethod : null,
      },
      attendees: rows,
    }

    try {
      const { error: fnErr } = await supabase.functions.invoke(
        'enviar-email-reserva',
        { body: payload }
      )
      if (fnErr) console.error('No se pudo enviar el email:', fnErr)
    } catch (e) {
      console.error('No se pudo enviar el email:', e)
    }

    setSaving(false)
    onRegistered({
      reservation: {
        id: reservationId,
        first_name: registrar.first_name.trim(),
      },
      total,
      paymentMethod: total > 0 ? paymentMethod : null,
      attendees,
    })
  }

  return (
    <div className="space-y-6">
      {/* Datos del registrador */}
      <section className="card p-6">
        <h2 className="text-lg font-bold text-ink">Tus datos</h2>
        <p className="mt-1 text-sm text-ink/55">
          Quien completa el registro. Te enviaremos la confirmación a este email.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Input
            label="Nombre"
            value={registrar.first_name}
            onChange={(v) => setRegistrar((r) => ({ ...r, first_name: v }))}
          />
          <Input
            label="Apellido"
            value={registrar.last_name}
            onChange={(v) => setRegistrar((r) => ({ ...r, last_name: v }))}
          />
          <Input
            label="Email"
            type="email"
            value={registrar.email}
            onChange={(v) => setRegistrar((r) => ({ ...r, email: v }))}
          />
          <Input
            label="Alumno por el que asisten"
            value={registrar.student_name}
            placeholder="Nombre del alumno de Otoha"
            onChange={(v) => setRegistrar((r) => ({ ...r, student_name: v }))}
          />
        </div>

        <label className="mt-4 flex items-center gap-2.5 text-sm text-ink/80">
          <input
            type="checkbox"
            className="h-4 w-4 accent-wine"
            checked={registrarAttends}
            onChange={(e) => setRegistrarAttends(e.target.checked)}
          />
          Yo también asisto al evento
        </label>

        {registrarAttends && (
          <div className="mt-4 rounded-xl border border-ink/10 bg-cream p-4">
            <AttendeeFields
              data={registrarDetails}
              onChange={(patch) =>
                setRegistrarDetails((d) => ({ ...d, ...patch }))
              }
              toggleDay={toggleDay}
              hideName
              price={priceForAttendee({
                category: registrarDetails.category,
                days: registrarDetails.days,
              })}
            />
          </div>
        )}
      </section>

      {/* Acompañantes */}
      <section className="card p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-ink">Acompañantes</h2>
            <p className="mt-1 text-sm text-ink/55">
              Agregá a las demás personas que asisten con vos.
            </p>
          </div>
          <button
            className="btn-ghost text-sm"
            onClick={() => setOthers((p) => [...p, newAttendee()])}
          >
            + Agregar persona
          </button>
        </div>

        {others.length === 0 ? (
          <p className="mt-4 rounded-xl border border-dashed border-ink/15 px-4 py-6 text-center text-sm text-ink/40">
            Todavía no agregaste acompañantes.
          </p>
        ) : (
          <div className="mt-4 space-y-4">
            {others.map((o, i) => (
              <div
                key={o.key}
                className="rounded-xl border border-ink/10 bg-cream p-4"
              >
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wide text-ink/50">
                    Persona {i + 1}
                  </span>
                  <button
                    onClick={() =>
                      setOthers((p) => p.filter((x) => x.key !== o.key))
                    }
                    className="text-xs font-medium text-wine/70 hover:text-wine"
                  >
                    Quitar
                  </button>
                </div>
                <AttendeeFields
                  data={o}
                  onChange={(patch) => updateOther(o.key, patch)}
                  toggleDay={toggleDay}
                  price={priceForAttendee(o)}
                />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Método de pago (sólo si hay monto a abonar) */}
      {total > 0 && (
        <section className="card p-6">
          <h2 className="text-lg font-bold text-ink">Método de pago</h2>
          <p className="mt-1 text-sm text-ink/55">
            Elegí cómo querés abonar. El pago no es obligatorio para quedar
            registrado.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {PAYMENT_METHODS.map((m) => {
              const active = paymentMethod === m.id
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setPaymentMethod(m.id)}
                  className={`rounded-xl border p-4 text-left transition ${
                    active
                      ? 'border-wine bg-wine/5 ring-2 ring-wine/20'
                      : 'border-ink/15 bg-cream-soft hover:border-wine/50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`flex h-4 w-4 items-center justify-center rounded-full border ${
                        active ? 'border-wine' : 'border-ink/30'
                      }`}
                    >
                      {active && (
                        <span className="h-2 w-2 rounded-full bg-wine" />
                      )}
                    </span>
                    <span className="font-medium text-ink">{m.label}</span>
                  </div>
                  <p className="mt-1 pl-6 text-sm text-ink/55">{m.hint}</p>
                </button>
              )
            })}
          </div>
        </section>
      )}

      {/* Resumen y total */}
      <section className="card sticky bottom-4 border-wine/20 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm text-ink/60">
              {attendees.length}{' '}
              {attendees.length === 1 ? 'persona' : 'personas'} · Total a abonar
            </p>
            <p className="font-display text-3xl font-bold text-wine">
              {formatARS(total)}
            </p>
            {total === 0 && attendees.length > 0 && (
              <p className="text-xs text-moss">
                Sin cargo (menores y/o alumnos).
              </p>
            )}
          </div>
          <button
            className="btn-primary"
            onClick={handleSubmit}
            disabled={saving}
          >
            {saving ? 'Registrando…' : 'Confirmar registro'}
          </button>
        </div>
        {error && <p className="mt-3 text-sm text-wine">{error}</p>}
      </section>
    </div>
  )
}

/* ------------------------- Subcomponentes ------------------------- */

function AttendeeFields({ data, onChange, toggleDay, price, hideName }) {
  return (
    <div className="space-y-3">
      {!hideName && (
        <div className="grid gap-3 sm:grid-cols-2">
          <Input
            label="Nombre"
            value={data.first_name}
            onChange={(v) => onChange({ first_name: v })}
          />
          <Input
            label="Apellido"
            value={data.last_name}
            onChange={(v) => onChange({ last_name: v })}
          />
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-ink/60">
            Categoría
          </label>
          <select
            className="field"
            value={data.category}
            onChange={(e) => onChange({ category: e.target.value })}
          >
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-ink/60">
            Días que asiste
          </label>
          <div className="flex gap-2">
            {EVENT.days.map((d) => {
              const active = data.days.includes(d.id)
              return (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => onChange({ days: toggleDay(data.days, d.id) })}
                  className={`flex-1 rounded-xl border px-3 py-2 text-sm font-medium transition ${
                    active
                      ? 'border-wine bg-wine text-cream-soft'
                      : 'border-ink/15 bg-cream-soft text-ink/70 hover:border-wine/50'
                  }`}
                >
                  {d.short}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="flex items-center gap-2.5 text-sm text-ink/80">
          <input
            type="checkbox"
            className="h-4 w-4 accent-wine"
            checked={data.needs_seat}
            onChange={(e) => onChange({ needs_seat: e.target.checked })}
          />
          Necesita asiento asegurado (adulto mayor / discapacidad)
        </label>
        <span className="text-sm font-semibold text-ink/70">
          {price > 0 ? formatARS(price) : 'Sin cargo'}
        </span>
      </div>
    </div>
  )
}

function Input({ label, value, onChange, type = 'text', placeholder }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-ink/60">
        {label}
      </label>
      <input
        className="field"
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  )
}