import { CATEGORIES, PRICES } from './event'

// Precio de UN asistente según su categoría y los días que asiste.
// attendee: { category: 'adulto'|'menor'|'alumno', days: ['sab','dom'] }
export function priceForAttendee(attendee) {
  const cat = CATEGORIES.find((c) => c.id === attendee.category)
  if (!cat || !cat.pays) return 0

  const numDays = attendee.days?.length || 0
  if (numDays === 0) return 0
  if (numDays >= 2) return PRICES.TWO_DAYS // promo 2 días
  return PRICES.ONE_DAY // un solo día
}

// Total de una reserva (lista de asistentes)
export function totalForReservation(attendees) {
  return (attendees || []).reduce((sum, a) => sum + priceForAttendee(a), 0)
}

// Validación de un asistente antes de guardar
export function attendeeIsValid(a) {
  if (!a.first_name?.trim() || !a.last_name?.trim()) return false
  if (!a.category) return false
  if (!a.days || a.days.length === 0) return false
  return true
}
