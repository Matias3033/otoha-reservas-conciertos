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

// =====================================================================
// Merch de Otoha (en colaboración con Sakura Indumentaria).
// Cargado a mano desde otohamusica.com.ar/merch — el sitio de Otoha no
// tiene una API pública, así que no se puede traer en vivo. Si cambian
// productos, fotos o precios, actualizá este array.
// No suma al total de la reserva: solo queda anotado el interés y se
// coordina disponibilidad/talle/pago aparte (igual que hoy por WhatsApp).
// =====================================================================
export const MERCH = [
  {
    id: 'remera',
    name: 'Remera de Otoha',
    price: 30000,
    image:
      'https://www.otohamusica.com.ar/_next/image?url=%2Fmerch%2Fremera-otoha.jpeg&w=1080&q=75',
    description:
      'Algodón peinado 24-1, estampado frontal y posterior en rosado. A elección: frase posterior, color de remera y de la frase.',
  },
  {
    id: 'taza',
    name: 'Taza de cerámica',
    price: 13000,
    image:
      'https://www.otohamusica.com.ar/_next/image?url=%2Fmerch%2Ftaza-otoha.jpeg&w=1080&q=75',
    description: 'Con estampado. Incluye box. A elección: frase para la taza.',
  },
  {
    id: 'vaso',
    name: 'Vaso térmico',
    price: 12000,
    image:
      'https://www.otohamusica.com.ar/_next/image?url=%2Fmerch%2Fvaso-termico-otoha.jpeg&w=1080&q=75',
    description: 'De plástico, con estampado. A elección: frase para el vaso.',
  },
  {
    id: 'gorra-trucker',
    name: 'Gorra Trucker',
    price: 13000,
    image:
      'https://www.otohamusica.com.ar/_next/image?url=%2Fmerch%2Fgorra-trucker-otoha.jpeg&w=1080&q=75',
    description: 'Tipo trucker, con red posterior y estampado de la academia.',
  },
  {
    id: 'gorra-gabardina',
    name: 'Gorra de gabardina',
    price: 14000,
    image:
      'https://www.otohamusica.com.ar/_next/image?url=%2Fmerch%2Fgorra-gabardina-otoha.jpeg&w=1080&q=75',
    description: 'Tipo gabardina, con estampado de la academia.',
  },
  {
    id: 'llavero',
    name: 'Llavero Otoha',
    price: 2000,
    image:
      'https://www.otohamusica.com.ar/_next/image?url=%2Fmerch%2Fllavero-otoha.jpeg&w=1080&q=75',
    description:
      'Cinta lanyard de 2cm, reforzado con remache y argolla para llaves.',
  },
  {
    id: 'bolsa',
    name: 'Bolsa de Friselina',
    price: 2500,
    image:
      'https://www.otohamusica.com.ar/_next/image?url=%2Fmerch%2Fbolsa-friselina-otoha.jpeg&w=1080&q=75',
    description: 'Con estampado de Otoha. A elección: frase.',
  },
]

// Comida y bebida para pedir junto con la reserva. EDITÁ los precios reales.
// Tampoco suma al total: se coordina y paga aparte, igual que el merch.
export const SNACKS = [
  { id: 'sanguchito', name: 'Sanguchito', price: 1500 }, // EDITAR precio real
  { id: 'agua', name: 'Agua', price: 1000 }, // EDITAR precio real
]

// Formatea un número como pesos argentinos
export function formatARS(n) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n)
}