// =====================================================================
// Configuración del evento Otoha. Tocá acá si cambian fechas o precios.
// =====================================================================

export const EVENT = {
  name: 'Evento Otoha',
  // Los días del evento. El "id" se guarda en la base.
  days: [
    { id: 'sab', label: 'Sábado 27 de junio', short: 'Sáb 27', time: '15:00' },
    { id: 'dom', label: 'Domingo 28 de junio', short: 'Dom 28', time: '15:00' },
  ],
}

// Categorías de cada asistente
export const CATEGORIES = [
  { id: 'adulto', label: 'Adulto/a (10 años o más)', pays: true },
  { id: 'menor', label: 'Menor de 10 años', pays: false },
  { id: 'alumno', label: 'Alumno/a de Otoha', pays: false },
]

export const PRICES = {
  ONE_DAY: 7000, // un solo día
  TWO_DAYS: 10000, // promoción por los dos días
}

// Métodos de pago disponibles para que elija el usuario al registrarse.
export const PAYMENT_METHODS = [
  {
    id: 'transferencia',
    label: 'Transferencia bancaria',
    hint: 'Te mostramos los datos para transferir.',
  },
  {
    id: 'efectivo',
    label: 'Efectivo en puerta',
    hint: 'Abonás el día del evento al ingresar.',
  },
]

// Datos para la pantalla de pago. EDITÁ ESTOS VALORES con los reales de Otoha.
export const PAYMENT = {
  transfer: {
    alias: 'OTOHA.MUSICA', // reemplazar
    cuil: '27-40521393-7', // reemplazar
    titular: 'Victoria Emilia Meeroff', // reemplazar
    banco: 'Mercado Pago', // reemplazar
  },
  cashNote: 'Podés abonar en efectivo en la puerta el día del evento.',
}

// Formatea un número como pesos argentinos
export function formatARS(n) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n)
}