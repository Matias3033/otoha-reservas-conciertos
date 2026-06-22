-- =====================================================================
-- Reservas Evento Otoha · Esquema de base de datos para Supabase
-- Ejecutá este script completo en el SQL Editor de tu proyecto Supabase.
-- =====================================================================

-- Limpieza opcional (descomentá para reiniciar desde cero)
-- drop table if exists attendees cascade;
-- drop table if exists reservations cascade;

-- ---------------------------------------------------------------------
-- Reservas: una fila por persona que completa el formulario (registrador)
-- ---------------------------------------------------------------------
create table if not exists reservations (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text not null,
  email text not null,
  student_name text,          -- alumno por el cual asiste el grupo
  total_amount int not null default 0,  -- monto calculado al registrar
  payment_method text,        -- 'mercadopago' | 'transferencia' | 'efectivo' | null
  paid boolean not null default false,  -- el admin lo marca a mano
  notes text,
  created_at timestamptz default now()
);

-- ---------------------------------------------------------------------
-- Asistentes: cada persona del grupo de una reserva
-- ---------------------------------------------------------------------
create table if not exists attendees (
  id uuid primary key default gen_random_uuid(),
  reservation_id uuid not null references reservations(id) on delete cascade,
  first_name text not null,
  last_name text not null,
  category text not null,          -- 'adulto' | 'menor' | 'alumno'
  day_sab boolean not null default false,
  day_dom boolean not null default false,
  needs_seat boolean not null default false,  -- adulto mayor / discapacidad
  price int not null default 0,
  created_at timestamptz default now()
);

create index if not exists idx_attendees_reservation
  on attendees(reservation_id);

-- =====================================================================
-- Row Level Security (RLS)
-- - El público puede CREAR reservas y asistentes (registrarse), pero NO leer
--   los datos de otros (privacidad de emails).
-- - El admin autenticado puede ver, editar y borrar todo.
-- =====================================================================
alter table reservations enable row level security;
alter table attendees enable row level security;

-- El público (anon) puede insertar reservas y asistentes
create policy "registro publico reservations" on reservations
  for insert to anon with check (true);
create policy "registro publico attendees" on attendees
  for insert to anon with check (true);

-- Solo el admin autenticado puede leer/editar/borrar
create policy "admin lee reservations" on reservations
  for select to authenticated using (true);
create policy "admin edita reservations" on reservations
  for update to authenticated using (true) with check (true);
create policy "admin borra reservations" on reservations
  for delete to authenticated using (true);

create policy "admin lee attendees" on attendees
  for select to authenticated using (true);
create policy "admin edita attendees" on attendees
  for update to authenticated using (true) with check (true);
create policy "admin borra attendees" on attendees
  for delete to authenticated using (true);

-- Nota: el registrador NO ve la lista de inscriptos; solo confirma su reserva.
-- El monto se muestra en el navegador antes de enviar, calculado en el front.
