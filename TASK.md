# TASK

## 2026-10-29 · Módulo fitness en el panel del cliente
- [x] Modelo de datos y migración `20261029000000_fitness_module`
- [x] API `/api/fitness/*` con autorización en servidor
- [x] Catálogo de ejercicios (50 iniciales) + importación
- [x] Rutinas personales / asignadas / plantillas
- [x] Entrenamiento en curso (series, descanso, reanudación tras recarga)
- [x] Historial, progreso, récords
- [x] Gestión para entrenador y administrador
- [x] Tests (vitest) de métricas y de integración con BD
- [ ] Fotos de progreso privadas (requiere bucket privado + URLs firmadas)

## Discovered During Work
- [x] `/api/cliente/[id]` y `/api/cliente/[id]/registro-peso` no validaban propietario (IDOR): corregido.
- [x] `src/lib/auth.ts` registraba usuario y contraseña con `console.log` en cada login: eliminado ese log.
- [ ] `src/app/api/admin/rutinas` (legado) no distingue rutinas personales/plantillas de las asignadas.
- [ ] `prisma/seed.ts` borra tablas con `deleteMany`: no ejecutar fuera de desarrollo.
