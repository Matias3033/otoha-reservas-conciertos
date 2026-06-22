# Reservas · Evento Otoha

Sistema de registro de asistentes para el evento de Otoha (sábado 27 y domingo
28 de junio, 15 hs). Hecho con **React + Vite + Tailwind + Supabase**, listo para
subir a GitHub y desplegar en Vercel. Mismo stack y estética que el prode.

## Qué hace

- **Portada con las reglas**: menores de 10 y alumnos no abonan; 7000 ARS por
  día desde los 10 años; promo dos días a 10000 ARS.
- **Formulario de registro**: el registrador carga sus datos (nombre, apellido,
  email, alumno por el que asiste) y puede:
  - marcarse a sí mismo como asistente (o solo cargar a otros),
  - agregar todos los acompañantes que quiera,
  - elegir por persona la categoría (adulto / menor de 10 / alumno) y los días,
  - marcar si alguien necesita **asiento asegurado** (adulto mayor / discapacidad).
- **Total en vivo**: el monto se calcula mientras carga, siguiendo las reglas.
- **Pantalla de pago**: tras registrarse, ve las tres opciones (Mercado Pago,
  transferencia con alias/CBU copiables, efectivo en puerta). El pago **no es
  obligatorio** para quedar registrado.
- **Panel de admin** (con login): lista todas las reservas con su detalle de
  asistentes, métricas (personas, asientos a asegurar, gente por día, total
  esperado y cobrado), y permite marcar a mano quién pagó y con qué método.

### Cómo se calcula el precio

Por cada asistente que abona (adulto de 10+): un solo día = 7000; dos días =
10000 (promo). Menores de 10 y alumnos = sin cargo. El total del grupo es la
suma. Ejemplos verificados: 4 adultos un día = 28.000; 4 adultos dos días =
40.000.

---

## Antes de publicar: completá tus datos de pago

Abrí `src/lib/event.js` y reemplazá los valores de `PAYMENT` con los reales:

```js
export const PAYMENT = {
  mercadoPagoLink: 'https://link.mercadopago.com.ar/otoha', // tu link real
  transfer: {
    alias: 'OTOHA.MUSICA',
    cbu: '0000000000000000000000',
    titular: 'Otoha Academia de Música',
    banco: 'Banco —',
  },
  cashNote: 'Podés abonar en efectivo en la puerta el día del evento.',
}
```

Si cambian fechas o precios, también están en ese archivo (`EVENT` y `PRICES`).

---

## Puesta en marcha

### 1. Supabase

1. Creá un proyecto en [supabase.com](https://supabase.com).
2. **SQL Editor** → **New query** → pegá `supabase/schema.sql` → **Run**.
3. **Authentication** → **Users** → **Add user** → creá tu usuario admin con
   email y contraseña (marcá "Auto Confirm User").
4. **Project Settings** → **API**: copiá la **Project URL** y la **publishable
   key** (`sb_publishable_...`; reemplaza a la vieja anon key).

### 2. Local

```bash
npm install
cp .env.example .env   # completá VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY
npm run dev
```

> En `VITE_SUPABASE_ANON_KEY` va la publishable key (`sb_publishable_...`). El
> nombre de la variable no cambia. Reiniciá `npm run dev` después de editar `.env`.

### 3. GitHub + Vercel

1. Subí el repo a GitHub (el `.gitignore` excluye `.env` y `node_modules`).
2. En Vercel importá el repo (preset **Vite**).
3. Cargá las dos variables de entorno (`VITE_SUPABASE_URL`,
   `VITE_SUPABASE_ANON_KEY`). Deploy.

---

## Privacidad y seguridad

- El público puede **crear** su reserva pero **no puede leer** las de otros (los
  emails y la lista de inscriptos solo los ve el admin logueado). Esto está
  forzado por Row Level Security en la base.
- El monto se calcula en el navegador y se guarda con la reserva. El admin
  siempre puede ajustarlo a mano si hace falta.

## Dónde tocar cada cosa

- Fechas, precios, categorías y datos de pago: `src/lib/event.js`
- Lógica de cálculo: `src/lib/pricing.js`
- Formulario: `src/components/RegistrationForm.jsx`
- Pantalla de pago: `src/components/PaymentScreen.jsx`
- Panel admin: `src/components/AdminPanel.jsx`
- Base de datos: `supabase/schema.sql`
