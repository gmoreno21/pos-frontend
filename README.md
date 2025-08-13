# POS Supabase (Next.js + React + TypeScript)

POS web moderna con Next.js (App Router), TailwindCSS, shadcn/ui, framer-motion, React Query, zod/react-hook-form, sonner, next-themes y Supabase (Auth + Postgres + RLS).

## Requisitos
- Node.js 18+
- Cuenta y proyecto en Supabase
- Variables de entorno:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Instalación rápida
```bash
# 1) Instala dependencias
bash install.sh

# 2) Copia .env
cp .env.example .env.local
# Rellena tus claves de Supabase en .env.local

# 3) Ejecuta migraciones SQL en Supabase (schema + RLS + triggers)
#   Abre el Panel de SQL en Supabase y pega el contenido de:
#   - sql/schema.sql
#   - sql/seed.sql (opcional para datos de ejemplo)

# 4) Levanta el proyecto
npm run dev
```

## Estructura
- `app/` Next.js App Router
- `components/` UI y pequeños building blocks
- `lib/` clientes y helpers
- `providers/` Providers para Theme y React Query
- `sql/` DDL + RLS + seeds

## Funcionalidad
- Autenticación Supabase (email/contraseña)
- Rutas "protegidas" con redirección a `/login` si no hay sesión (guard de cliente)
- Productos: CRUD con (activar/desactivar), tabla con búsqueda/ordenamiento/paginación
- Ventas (POS): buscador, carrito, descuentos por línea/por ticket, totales, finalize sale
- Reportes: KPIs y gráficos simples
- Tema claro/oscuro con `next-themes`
- Notificaciones con `sonner`

> Nota: Este starter prioriza la claridad del código. En producción agrega middleware con Auth Helpers si quieres protección en el edge, y mueve lógica sensible a server actions o rutas API.

## Scripts
- `install.sh` instala dependencias, inicializa Tailwind y configura shadcn/ui mínimo.
- `sql/schema.sql` crea tablas, índices, triggers y RLS.
- `sql/seed.sql` siembra productos de ejemplo (respetando `user_id`).

## Botón de Logout
En el header (ver `components/Header.tsx`) hay un botón "Salir" que ejecuta:
```ts
await supabase.auth.signOut()
```

## Licencia
MIT
