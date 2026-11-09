This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

## Módulo fitness (panel del cliente)

Entrenamiento integrado en el panel del cliente (`/cliente/[id]`: Entrenar, Rutinas, Ejercicios, Progreso), en el panel del
entrenador (pestaña *Rutinas*) y en el administrador (pestaña *Fitness*). Está inspirado funcionalmente en
[openGym](https://github.com/olgv/openGym), pero **no reutiliza su código, su catálogo ni sus recursos**: openGym es AGPL-3.0 y
copiarlo obligaría a publicar este sistema bajo la misma licencia. Todo el código y los textos del catálogo son propios.

### Puesta en marcha

```bash
npm install
npx prisma migrate deploy          # aplica 20261029000000_fitness_module (solo añade tablas/columnas)
npm run db:seed-fitness            # catálogo inicial (50 ejercicios). Idempotente: hace upsert por slug
npm test                           # vitest; los tests de integración exigen DATABASE_URL de una BD "dev" o "test"
```

Variable opcional: `APP_TZ` (por defecto `America/Havana`) define la zona horaria con la que se calculan las semanas y los meses
de las estadísticas de frecuencia.

### Modelo de datos

| Tabla | Uso |
|---|---|
| `CatalogoEjercicio` | Catálogo común (músculo principal/secundarios, equipamiento, categoría, nivel, cómo se mide, `mediaUrl` + `mediaLicencia`). |
| `Rutina` (ampliada) | `tipo`: `PERSONAL` (del cliente), `ASIGNADA` (copia hecha por el entrenador) o `PLANTILLA` (reutilizable; las creadas por un administrador son las predeterminadas). |
| `Ejercicio` (ampliada) | Línea de una rutina: ahora referencia al catálogo y guarda descanso y duración. Las filas anteriores (texto libre) siguen funcionando. |
| `SesionEntrenamiento` / `SesionEjercicio` / `SerieRegistrada` | Cada sesión guarda una copia (snapshot) de los ejercicios, de modo que editar o borrar la rutina no altera el historial. |
| `RecordPersonal` | Mejor marca por usuario, ejercicio y tipo. |

Un índice único parcial garantiza una sola sesión `EN_CURSO` por usuario; `(usuarioId, claveCliente)` hace idempotente el inicio de
sesión y `(sesionEjercicioId, numero)` hace idempotente el registro de series. El peso corporal y las medidas reutilizan la
pestaña *Mi Peso* existente (`RegistroPeso`).

### API (`/api/fitness/*`)

La identidad sale siempre del JWT de NextAuth y el rol se relee en BD; ningún id enviado por el navegador autoriza nada.

- Cliente (`CLIENTE`): `inicio`, `rutinas` (+`/[id]`, `/[id]/duplicar`), `sesiones` (+`/activa`, `/[id]`, `/[id]/series`, `/[id]/finalizar`, `/[id]/cancelar`), `progreso`.
- Catálogo: lectura para cualquier rol de panel; alta para `ENTRENADOR`/`ADMIN`; edición/baja lógica solo del creador o `ADMIN`.
- `ENTRENADOR`/`ADMIN`: `entrenador/plantillas`, `entrenador/asignaciones`, `entrenador/clientes`, `entrenador/clientes/[id]/progreso`.
  Un entrenador solo opera sobre clientes con `entrenadorAsignadoId` igual a su usuario; un administrador, sobre cualquiera.

### Cómo se calculan las métricas

- **Volumen** = Σ peso (kg) × repeticiones de series completadas de ejercicios «peso y repeticiones». Los de repeticiones o tiempo no suman.
- **Récords**: peso máximo con ≥1 repetición, máximo de repeticiones o mayor duración, según el tipo de ejercicio. Solo se anuncian
  si superan una marca anterior; la primera vez queda como marca base.
- **Evolución de cargas**: una marca por sesión y ejercicio, siempre en una única unidad (kg, reps o s). No se estiman 1RM.
- **Frecuencia**: sesiones completadas por semana (lunes–domingo) y por mes, en `APP_TZ`.
- **Duración** = fin − inicio de la sesión (incluye los descansos).

### Ampliar el catálogo

- Desde la interfaz: entrenador/administrador → *Catálogo* → *Nuevo*.
- En lote: `npm run db:seed-fitness -- --file ejercicios.json` (lista de objetos con los campos de `prisma/fitness-catalog.ts`; se valida con
  el mismo esquema que la API).
- Imágenes/vídeos: solo `https` y con la licencia indicada en `mediaLicencia`. El catálogo inicial **no incluye medios** a propósito.

### Fuera de alcance

Fotos de progreso: no se implementaron porque la subida actual (`/api/upload`) usa un bucket público de Supabase; guardarlas de forma
privada exige un bucket privado con URLs firmadas (configuración pendiente).
