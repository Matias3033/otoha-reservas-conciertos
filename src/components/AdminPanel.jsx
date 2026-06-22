import { useState, useEffect, useCallback } from 'react'
import * as XLSX from 'xlsx'
import { supabase } from '../lib/supabase'
import { EVENT, formatARS } from '../lib/event'

const CATEGORY_LABEL = {
  adulto: 'Adulto/a',
  menor: 'Menor de 10',
  alumno: 'Alumno/a',
}
const METHOD_LABEL = {
  transferencia: 'Transferencia',
  efectivo: 'Efectivo',
}

// Arma el Excel con una fila por asistente y lo descarga.
function exportToExcel(reservations) {
  const rows = []
  reservations.forEach((r) => {
    const fecha = r.created_at
      ? new Date(r.created_at).toLocaleString('es-AR')
      : ''
    r.attendees.forEach((a) => {
      const dias = [a.day_sab && 'Sábado 27', a.day_dom && 'Domingo 28']
        .filter(Boolean)
        .join(' + ')
      rows.push({
        'Registrante': `${r.first_name} ${r.last_name}`,
        'Email': r.email,
        'Alumno': r.student_name || '',
        'Asistente': `${a.first_name} ${a.last_name}`,
        'Categoría': CATEGORY_LABEL[a.category] || a.category,
        'Días': dias || '—',
        'Asiento asegurado': a.needs_seat ? 'Sí' : 'No',
        'Precio': a.price || 0,
        'Total reserva': r.total_amount || 0,
        'Método de pago': METHOD_LABEL[r.payment_method] || '',
        'Pagado': r.paid ? 'Sí' : 'No',
        'Fecha de registro': fecha,
      })
    })
  })

  const ws = XLSX.utils.json_to_sheet(rows)
  // Ancho de columnas para que se lea bien
  ws['!cols'] = [
    { wch: 22 }, { wch: 26 }, { wch: 18 }, { wch: 22 }, { wch: 14 },
    { wch: 18 }, { wch: 16 }, { wch: 10 }, { wch: 13 }, { wch: 16 },
    { wch: 8 }, { wch: 20 },
  ]
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Inscriptos')

  const fecha = new Date().toISOString().slice(0, 10)
  XLSX.writeFile(wb, `inscriptos-evento-otoha-${fecha}.xlsx`)
}

export default function AdminPanel({ session }) {
  if (!session) return <Login />
  return <Dashboard />
}

/* ----------------------------- LOGIN ----------------------------- */
function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin() {
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error)
      setError('No pudimos iniciar sesión. Revisá el email y la contraseña.')
    setLoading(false)
  }

  return (
    <div className="mx-auto max-w-sm py-6">
      <div className="card p-6">
        <p className="eyebrow">Acceso privado</p>
        <h2 className="mt-1 text-xl font-bold text-ink">Entrar al panel</h2>
        <p className="mt-1 text-sm text-ink/55">
          Solo el equipo de Otoha puede ver las reservas.
        </p>
        <div className="mt-5 space-y-3">
          <input
            className="field"
            type="email"
            placeholder="tu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="field"
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
          />
          {error && <p className="text-sm text-wine">{error}</p>}
          <button
            className="btn-primary w-full"
            onClick={handleLogin}
            disabled={loading || !email || !password}
          >
            {loading ? 'Entrando…' : 'Entrar'}
          </button>
        </div>
      </div>
    </div>
  )
}

/* --------------------------- DASHBOARD --------------------------- */
function Dashboard() {
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('todas') // todas | pagadas | pendientes

  const load = useCallback(async () => {
    setLoading(true)
    const { data: res } = await supabase
      .from('reservations')
      .select('*')
      .order('created_at', { ascending: false })
    const { data: att } = await supabase.from('attendees').select('*')

    const byReservation = {}
    ;(att || []).forEach((a) => {
      byReservation[a.reservation_id] ??= []
      byReservation[a.reservation_id].push(a)
    })

    setReservations(
      (res || []).map((r) => ({ ...r, attendees: byReservation[r.id] || [] }))
    )
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function togglePaid(r) {
    await supabase
      .from('reservations')
      .update({ paid: !r.paid })
      .eq('id', r.id)
    load()
  }
  async function setMethod(r, method) {
    await supabase
      .from('reservations')
      .update({ payment_method: method || null })
      .eq('id', r.id)
    load()
  }
  async function remove(r) {
    if (!confirm(`¿Borrar la reserva de ${r.first_name} ${r.last_name}?`)) return
    await supabase.from('reservations').delete().eq('id', r.id)
    load()
  }

  // Totales
  const stats = reservations.reduce(
    (s, r) => {
      s.people += r.attendees.length
      s.expected += r.total_amount
      if (r.paid) s.collected += r.total_amount
      s.seats += r.attendees.filter((a) => a.needs_seat).length
      EVENT.days.forEach((d) => {
        r.attendees.forEach((a) => {
          if ((d.id === 'sab' && a.day_sab) || (d.id === 'dom' && a.day_dom))
            s.perDay[d.id] += 1
        })
      })
      return s
    },
    {
      people: 0,
      expected: 0,
      collected: 0,
      seats: 0,
      perDay: { sab: 0, dom: 0 },
    }
  )

  const filtered = reservations.filter((r) =>
    filter === 'pagadas' ? r.paid : filter === 'pendientes' ? !r.paid : true
  )

  return (
    <div className="space-y-6 py-2">
      <div className="flex items-center justify-between">
        <div>
          <p className="eyebrow">Panel de administración</p>
          <h2 className="text-2xl font-bold text-ink">Reservas del evento</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => exportToExcel(reservations)}
            disabled={reservations.length === 0}
            className="btn-gold text-sm"
          >
            ↓ Exportar a Excel
          </button>
          <button
            onClick={() => supabase.auth.signOut()}
            className="btn-ghost text-sm"
          >
            Cerrar sesión
          </button>
        </div>
      </div>

      {/* Métricas */}
      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <Stat label="Reservas" value={reservations.length} />
        <Stat label="Personas" value={stats.people} />
        <Stat
          label="Asientos a asegurar"
          value={stats.seats}
          accent="gold"
        />
        <Stat label={EVENT.days[0].short} value={stats.perDay.sab} />
        <Stat label={EVENT.days[1].short} value={stats.perDay.dom} />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Stat
          label="Total esperado"
          value={formatARS(stats.expected)}
          accent="wine"
        />
        <Stat
          label="Cobrado (marcado como pagado)"
          value={formatARS(stats.collected)}
          accent="moss"
        />
      </div>

      {/* Filtro */}
      <div className="flex gap-2">
        {['todas', 'pendientes', 'pagadas'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-3 py-1.5 text-sm font-medium capitalize transition ${
              filter === f
                ? 'bg-wine text-cream-soft'
                : 'border border-ink/15 text-ink/60 hover:border-wine'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="py-10 text-center text-ink/40">Cargando…</p>
      ) : filtered.length === 0 ? (
        <p className="card px-6 py-12 text-center text-ink/50">
          No hay reservas {filter !== 'todas' ? filter : 'todavía'}.
        </p>
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => (
            <ReservationCard
              key={r.id}
              r={r}
              onTogglePaid={() => togglePaid(r)}
              onSetMethod={(m) => setMethod(r, m)}
              onRemove={() => remove(r)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function Stat({ label, value, accent }) {
  const color =
    accent === 'wine'
      ? 'text-wine'
      : accent === 'moss'
        ? 'text-moss'
        : accent === 'gold'
          ? 'text-gold'
          : 'text-ink'
  return (
    <div className="card p-4">
      <p className="text-xs text-ink/55">{label}</p>
      <p className={`mt-1 font-display text-2xl font-bold ${color}`}>{value}</p>
    </div>
  )
}

function ReservationCard({ r, onTogglePaid, onSetMethod, onRemove }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="card overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 p-4">
        <div className="min-w-0">
          <p className="font-medium text-ink">
            {r.first_name} {r.last_name}
            {r.attendees.some((a) => a.needs_seat) && (
              <span
                className="ml-2 text-gold"
                title="Tiene asientos a asegurar"
              >
                ♿
              </span>
            )}
          </p>
          <p className="truncate text-sm text-ink/55">
            {r.email}
            {r.student_name && <> · Alumno: {r.student_name}</>}
          </p>
          <button
            onClick={() => setOpen((o) => !o)}
            className="mt-1 text-xs font-medium text-wine/70 hover:text-wine"
          >
            {r.attendees.length}{' '}
            {r.attendees.length === 1 ? 'persona' : 'personas'} ·{' '}
            {open ? 'ocultar' : 'ver detalle'}
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="font-display text-lg font-bold text-wine">
              {formatARS(r.total_amount)}
            </p>
            <select
              value={r.payment_method || ''}
              onChange={(e) => onSetMethod(e.target.value)}
              className="mt-1 rounded-lg border border-ink/15 bg-cream-soft px-2 py-1 text-xs text-ink/70"
            >
              <option value="">Sin método</option>
              <option value="mercadopago">Mercado Pago</option>
              <option value="transferencia">Transferencia</option>
              <option value="efectivo">Efectivo</option>
            </select>
          </div>
          <button
            onClick={onTogglePaid}
            className={`btn text-sm ${
              r.paid
                ? 'bg-moss text-cream-soft'
                : 'border border-ink/15 text-ink/60 hover:border-moss hover:text-moss'
            }`}
          >
            {r.paid ? '✓ Pagado' : 'Marcar pagado'}
          </button>
          <button
            onClick={onRemove}
            className="text-xs text-wine/60 hover:text-wine"
            title="Borrar reserva"
          >
            ✕
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-ink/10 bg-cream/50 px-4 py-3">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-ink/50">
                <th className="py-1 font-semibold">Nombre</th>
                <th className="py-1 font-semibold">Categoría</th>
                <th className="py-1 font-semibold">Días</th>
                <th className="py-1 font-semibold">Asiento</th>
                <th className="py-1 text-right font-semibold">Precio</th>
              </tr>
            </thead>
            <tbody>
              {r.attendees.map((a) => (
                <tr key={a.id} className="border-t border-ink/5">
                  <td className="py-1.5">
                    {a.first_name} {a.last_name}
                  </td>
                  <td className="py-1.5 capitalize text-ink/70">
                    {a.category}
                  </td>
                  <td className="py-1.5 text-ink/70">
                    {[a.day_sab && 'Sáb', a.day_dom && 'Dom']
                      .filter(Boolean)
                      .join(' + ') || '—'}
                  </td>
                  <td className="py-1.5">
                    {a.needs_seat ? (
                      <span className="text-gold">Sí ♿</span>
                    ) : (
                      <span className="text-ink/30">No</span>
                    )}
                  </td>
                  <td className="py-1.5 text-right text-ink/70">
                    {a.price > 0 ? formatARS(a.price) : 'Sin cargo'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}