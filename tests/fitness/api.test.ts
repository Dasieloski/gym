// Pruebas de integración contra una BD de desarrollo real (Postgres). Se simula únicamente la
// identidad (getToken); la autorización, la BD y los handlers son los reales.
// Requiere DATABASE_URL apuntando a una BD cuyo nombre contenga "dev" o "test".
import { NextRequest } from 'next/server';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

vi.mock('next-auth/jwt', () => ({
  getToken: async ({ req }: { req: Request }) => {
    const u = req.headers.get('x-test-user');
    return u ? { sub: u } : null;
  },
}));

import prisma from '@/lib/prisma';
import * as catalogo from '@/app/api/fitness/catalogo/route';
import * as rutinas from '@/app/api/fitness/rutinas/route';
import * as rutinaId from '@/app/api/fitness/rutinas/[id]/route';
import * as duplicar from '@/app/api/fitness/rutinas/[id]/duplicar/route';
import * as sesiones from '@/app/api/fitness/sesiones/route';
import * as sesionId from '@/app/api/fitness/sesiones/[id]/route';
import * as series from '@/app/api/fitness/sesiones/[id]/series/route';
import * as finalizar from '@/app/api/fitness/sesiones/[id]/finalizar/route';
import * as cancelar from '@/app/api/fitness/sesiones/[id]/cancelar/route';
import * as progreso from '@/app/api/fitness/progreso/route';
import * as inicio from '@/app/api/fitness/inicio/route';
import * as plantillas from '@/app/api/fitness/entrenador/plantillas/route';
import * as asignaciones from '@/app/api/fitness/entrenador/asignaciones/route';
import * as asignacionId from '@/app/api/fitness/entrenador/asignaciones/[id]/route';
import * as clientesEntrenador from '@/app/api/fitness/entrenador/clientes/route';
import * as progresoCliente from '@/app/api/fitness/entrenador/clientes/[id]/progreso/route';

const bdOk = /dev|test/i.test(process.env.DATABASE_URL || '');
const TAG = `t${Date.now().toString(36)}`;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function call(handler: any, user: number | null, opts: { url?: string; method?: string; body?: unknown; params?: Record<string, string> } = {}) {
  const req = new NextRequest(`http://localhost${opts.url ?? '/api/fitness/x'}`, {
    method: opts.method ?? 'GET',
    headers: { ...(user ? { 'x-test-user': String(user) } : {}), 'content-type': 'application/json' },
    body: opts.body === undefined ? undefined : JSON.stringify(opts.body),
  });
  const res = await handler(req, { params: opts.params ?? {} });
  return { status: res.status as number, json: await res.json() };
}

describe.skipIf(!bdOk)('módulo fitness (integración)', () => {
  const ids: Record<string, number> = {};
  let sentadilla = 0;
  let plancha = 0;
  let flexiones = 0;

  const crearUsuario = async (clave: string, rol: 'ADMIN' | 'ENTRENADOR' | 'CLIENTE' | 'CLIENTEESPERA', extra: object = {}) => {
    const u = await prisma.usuario.create({
      data: { nombre: `${TAG}-${clave}`, username: `${TAG}-${clave}`, password: 'x', carnetIdentidad: `${TAG}-${clave}`, telefono: '1', rol, ...extra },
    });
    ids[clave] = u.id;
  };

  beforeAll(async () => {
    await crearUsuario('admin', 'ADMIN');
    await crearUsuario('trainer', 'ENTRENADOR');
    await crearUsuario('trainer2', 'ENTRENADOR');
    await crearUsuario('a', 'CLIENTE', { entrenadorAsignadoId: ids.trainer });
    await crearUsuario('b', 'CLIENTE');
    await crearUsuario('espera', 'CLIENTEESPERA');
    const { items } = (await call(catalogo.GET, ids.a, { url: '/api/fitness/catalogo?q=sentadilla' })).json;
    sentadilla = items.find((i: { slug: string }) => i.slug === 'sentadilla-con-barra').id;
    plancha = (await prisma.catalogoEjercicio.findUniqueOrThrow({ where: { slug: 'plancha' } })).id;
    flexiones = (await prisma.catalogoEjercicio.findUniqueOrThrow({ where: { slug: 'flexiones' } })).id;
  });

  afterAll(async () => {
    const usuarios = Object.values(ids);
    await prisma.recordPersonal.deleteMany({ where: { usuarioId: { in: usuarios } } });
    await prisma.sesionEntrenamiento.deleteMany({ where: { usuarioId: { in: usuarios } } });
    await prisma.notificacion.deleteMany({ where: { usuarioId: { in: usuarios } } });
    await prisma.rutina.deleteMany({ where: { OR: [{ clienteId: { in: usuarios } }, { creadorId: { in: usuarios } }] } });
    await prisma.catalogoEjercicio.deleteMany({ where: { nombre: { startsWith: TAG } } });
    await prisma.usuario.deleteMany({ where: { id: { in: usuarios } } });
    await prisma.$disconnect();
  });

  const rutinaBody = (nombre: string) => ({
    nombre,
    ejercicios: [
      { catalogoId: sentadilla, series: 3, repeticiones: 5, peso: 60, descansoSeg: 90 },
      { catalogoId: flexiones, series: 2, repeticiones: 10 },
      { catalogoId: plancha, series: 1, repeticiones: 1, duracionSeg: 45 },
    ],
  });

  describe('autenticación y roles', () => {
    it('sin sesión responde 401 y un cliente en espera 403', async () => {
      expect((await call(rutinas.GET, null)).status).toBe(401);
      expect((await call(rutinas.GET, ids.espera)).status).toBe(403);
      expect((await call(inicio.GET, ids.trainer)).status).toBe(403);
    });

    it('un cliente no puede crear ejercicios del catálogo ni usar endpoints de entrenador', async () => {
      const ej = { nombre: `${TAG} X`, musculoPrincipal: 'PECHO', equipamiento: 'BARRA', categoria: 'FUERZA' };
      expect((await call(catalogo.POST, ids.a, { method: 'POST', body: ej })).status).toBe(403);
      expect((await call(plantillas.GET, ids.a)).status).toBe(403);
      expect((await call(asignaciones.POST, ids.a, { method: 'POST', body: { rutinaId: 1, clienteId: ids.a } })).status).toBe(403);
    });

    it('el entrenador crea ejercicios con validación (licencia obligatoria si hay media)', async () => {
      const base = { nombre: `${TAG} Ejercicio`, musculoPrincipal: 'PECHO', equipamiento: 'BARRA', categoria: 'FUERZA' };
      const mal = await call(catalogo.POST, ids.trainer, { method: 'POST', body: { ...base, mediaUrl: 'https://ejemplo.com/a.gif' } });
      expect(mal.status).toBe(400);
      const ok = await call(catalogo.POST, ids.trainer, { method: 'POST', body: base });
      expect(ok.status).toBe(201);
    });
  });

  describe('rutinas personales', () => {
    it('crea, lista y valida entradas (caso de uso + fallos)', async () => {
      const r = await call(rutinas.POST, ids.a, { method: 'POST', body: rutinaBody('Fuerza A') });
      expect(r.status).toBe(201);
      expect(r.json.tipo).toBe('PERSONAL');
      expect(r.json.ejercicios).toHaveLength(3);
      expect(r.json.ejercicios[2].duracionSeg).toBe(45);
      expect(r.json.ejercicios[1].peso).toBeNull(); // peso solo aplica a PESO_REPS

      const lista = await call(rutinas.GET, ids.a);
      expect(lista.json.map((x: { nombre: string }) => x.nombre)).toContain('Fuerza A');

      expect((await call(rutinas.POST, ids.a, { method: 'POST', body: { nombre: 'x', ejercicios: [] } })).status).toBe(400);
      expect((await call(rutinas.POST, ids.a, { method: 'POST', body: rutinaBody('Fantasma').ejercicios.length && { nombre: 'Mala', ejercicios: [{ catalogoId: 99999999 }] } })).status).toBe(400);
    });

    it('otro cliente no puede ver, editar, archivar, duplicar ni borrar una rutina ajena', async () => {
      const { json } = await call(rutinas.POST, ids.a, { method: 'POST', body: rutinaBody('Privada A') });
      const p = { params: { id: String(json.id) } };
      expect((await call(rutinaId.GET, ids.b, p)).status).toBe(404);
      expect((await call(rutinaId.PUT, ids.b, { ...p, method: 'PUT', body: rutinaBody('Robada') })).status).toBe(404);
      expect((await call(rutinaId.PATCH, ids.b, { ...p, method: 'PATCH', body: { archivada: true } })).status).toBe(404);
      expect((await call(duplicar.POST, ids.b, { ...p, method: 'POST' })).status).toBe(404);
      expect((await call(rutinaId.DELETE, ids.b, { ...p, method: 'DELETE' })).status).toBe(404);
      expect((await prisma.rutina.findUnique({ where: { id: json.id } }))?.nombre).toBe('Privada A');
      expect((await call(rutinas.GET, ids.b)).json.some((r: { id: number }) => r.id === json.id)).toBe(false);
    });

    it('edita, archiva y elimina la propia; la rutina asignada es de solo lectura pero duplicable', async () => {
      const { json } = await call(rutinas.POST, ids.a, { method: 'POST', body: rutinaBody('Editable') });
      const p = { params: { id: String(json.id) } };
      const ed = await call(rutinaId.PUT, ids.a, { ...p, method: 'PUT', body: { nombre: 'Editada', ejercicios: [{ catalogoId: plancha, duracionSeg: 30 }] } });
      expect(ed.json.nombre).toBe('Editada');
      expect(ed.json.ejercicios).toHaveLength(1);
      expect((await call(rutinaId.PATCH, ids.a, { ...p, method: 'PATCH', body: { archivada: true } })).json.activa).toBe(false);
      expect((await call(rutinaId.DELETE, ids.a, { ...p, method: 'DELETE' })).status).toBe(200);

      const pl = await call(plantillas.POST, ids.trainer, { method: 'POST', body: rutinaBody('Plantilla T') });
      const asig = await call(asignaciones.POST, ids.trainer, { method: 'POST', body: { rutinaId: pl.json.id, clienteId: ids.a } });
      expect(asig.status).toBe(201);
      expect(asig.json.tipo).toBe('ASIGNADA');
      const pa = { params: { id: String(asig.json.id) } };
      const intento = await call(rutinaId.PUT, ids.a, { ...pa, method: 'PUT', body: rutinaBody('Cambiada en silencio') });
      expect(intento.status).toBe(403);
      expect((await call(rutinaId.DELETE, ids.a, { ...pa, method: 'DELETE' })).status).toBe(403);
      const copia = await call(duplicar.POST, ids.a, { ...pa, method: 'POST' });
      expect(copia.status).toBe(201);
      expect(copia.json.tipo).toBe('PERSONAL');
      expect(copia.json.plantillaOrigenId).toBe(asig.json.id);
      expect((await prisma.rutina.findUniqueOrThrow({ where: { id: asig.json.id } })).nombre).toBe('Plantilla T');
    });
  });

  describe('entrenamiento: flujo completo', () => {
    let rutina = 0;
    let sesion = 0;
    let ejercicios: { id: number; catalogoId: number }[] = [];

    it('inicia una sesión de forma idempotente y rechaza una segunda sesión en curso', async () => {
      rutina = (await call(rutinas.POST, ids.a, { method: 'POST', body: rutinaBody('Sesión') })).json.id;
      const clave = `clave-${TAG}-1`;
      const s1 = await call(sesiones.POST, ids.a, { method: 'POST', body: { rutinaId: rutina, claveCliente: clave } });
      const s2 = await call(sesiones.POST, ids.a, { method: 'POST', body: { rutinaId: rutina, claveCliente: clave } });
      expect(s1.status).toBe(201);
      expect(s2.status).toBe(200);
      expect(s2.json.id).toBe(s1.json.id);
      sesion = s1.json.id;
      ejercicios = s1.json.ejercicios;
      expect(ejercicios).toHaveLength(3);

      const otra = await call(sesiones.POST, ids.a, { method: 'POST', body: { rutinaId: rutina, claveCliente: `clave-${TAG}-2` } });
      expect(otra.status).toBe(409);
      expect(otra.json.sesionActivaId).toBe(sesion);
      expect(await prisma.sesionEntrenamiento.count({ where: { usuarioId: ids.a, estado: 'EN_CURSO' } })).toBe(1);
    });

    it('un cliente ajeno no puede iniciar la rutina, leer la sesión ni registrar series', async () => {
      expect((await call(sesiones.POST, ids.b, { method: 'POST', body: { rutinaId: rutina, claveCliente: `ajeno-${TAG}-1` } })).status).toBe(404);
      const p = { params: { id: String(sesion) } };
      expect((await call(sesionId.GET, ids.b, p)).status).toBe(404);
      const body = { ejercicioId: ejercicios[0].id, numero: 1, peso: 100, repeticiones: 5, completada: true };
      expect((await call(series.PUT, ids.b, { ...p, method: 'PUT', body })).status).toBe(404);
      expect((await call(finalizar.POST, ids.b, { ...p, method: 'POST', body: {} })).status).toBe(404);
      expect((await call(cancelar.POST, ids.b, { ...p, method: 'POST' })).status).toBe(404);
    });

    it('registra series sin duplicarlas al reintentar y valida los datos', async () => {
      const p = { params: { id: String(sesion) } };
      const [sq, fl, pl] = ejercicios;
      const put = (b: object) => call(series.PUT, ids.a, { ...p, method: 'PUT', body: b });

      expect((await put({ ejercicioId: sq.id, numero: 1, peso: 60, repeticiones: 5, completada: true })).status).toBe(200);
      expect((await put({ ejercicioId: sq.id, numero: 1, peso: 60, repeticiones: 5, completada: true })).status).toBe(200); // reintento
      await put({ ejercicioId: sq.id, numero: 2, peso: 65, repeticiones: 5, completada: true });
      await put({ ejercicioId: fl.id, numero: 1, repeticiones: 12, completada: true });
      await put({ ejercicioId: pl.id, numero: 1, duracionSeg: 50, completada: true });
      expect(await prisma.serieRegistrada.count({ where: { sesionEjercicioId: sq.id } })).toBe(2);

      expect((await put({ ejercicioId: sq.id, numero: 3, peso: 70, completada: true })).status).toBe(400); // sin reps
      expect((await put({ ejercicioId: sq.id, numero: 99, peso: 70, repeticiones: 3, completada: true })).status).toBe(400);
      expect((await put({ ejercicioId: sq.id, numero: 1, peso: -5, repeticiones: 3, completada: true })).status).toBe(400);
      expect((await put({ ejercicioId: 99999999, numero: 1, repeticiones: 3, completada: true })).status).toBe(404);
    });

    it('finaliza: calcula duración, volumen y marcas base, y es idempotente', async () => {
      const p = { params: { id: String(sesion) } };
      const f1 = await call(finalizar.POST, ids.a, { ...p, method: 'POST', body: {} });
      expect(f1.status).toBe(200);
      expect(f1.json.estado).toBe('COMPLETADA');
      expect(f1.json.totalSeries).toBe(4);
      expect(f1.json.volumenKg).toBe(60 * 5 + 65 * 5); // flexiones y plancha no suman
      expect(f1.json.ejerciciosRealizados).toBe(3);
      expect(f1.json.records).toHaveLength(0); // primera vez: marca base

      const f2 = await call(finalizar.POST, ids.a, { ...p, method: 'POST', body: {} });
      expect(f2.json.volumenKg).toBe(f1.json.volumenKg);
      expect(await prisma.recordPersonal.count({ where: { usuarioId: ids.a } })).toBe(3);
      // una sesión cerrada no admite más series
      expect((await call(series.PUT, ids.a, { ...p, method: 'PUT', body: { ejercicioId: ejercicios[0].id, numero: 3, peso: 70, repeticiones: 3, completada: true } })).status).toBe(409);
      expect((await call(cancelar.POST, ids.a, { ...p, method: 'POST' })).status).toBe(409);
    });

    it('detecta un récord personal en la siguiente sesión', async () => {
      const s = await call(sesiones.POST, ids.a, { method: 'POST', body: { rutinaId: rutina, claveCliente: `clave-${TAG}-3` } });
      const p = { params: { id: String(s.json.id) } };
      await call(series.PUT, ids.a, { ...p, method: 'PUT', body: { ejercicioId: s.json.ejercicios[0].id, numero: 1, peso: 80, repeticiones: 3, completada: true } });
      const f = await call(finalizar.POST, ids.a, { ...p, method: 'POST', body: {} });
      expect(f.json.records).toHaveLength(1);
      expect(f.json.records[0]).toMatchObject({ ejercicio: 'Sentadilla con barra', tipo: 'PESO_MAXIMO', valor: 80 });
    });

    it('finalizar sin series falla y cancelar es idempotente', async () => {
      const s = await call(sesiones.POST, ids.a, { method: 'POST', body: { rutinaId: rutina, claveCliente: `clave-${TAG}-4` } });
      const p = { params: { id: String(s.json.id) } };
      expect((await call(finalizar.POST, ids.a, { ...p, method: 'POST', body: {} })).status).toBe(400);
      expect((await call(cancelar.POST, ids.a, { ...p, method: 'POST' })).json.estado).toBe('CANCELADA');
      expect((await call(cancelar.POST, ids.a, { ...p, method: 'POST' })).json.estado).toBe('CANCELADA');
      expect((await call(finalizar.POST, ids.a, { ...p, method: 'POST', body: {} })).status).toBe(409);
    });

    it('el historial y el progreso solo incluyen sesiones completadas del propio usuario', async () => {
      const h = await call(sesiones.GET, ids.a);
      expect(h.json.items).toHaveLength(2);
      expect((await call(sesiones.GET, ids.b)).json.items).toHaveLength(0);

      const pr = await call(progreso.GET, ids.a);
      expect(pr.json.totales.sesiones).toBe(2);
      expect(pr.json.records.length).toBe(3);
      expect(pr.json.frecuenciaSemanal.reduce((n: number, x: { sesiones: number }) => n + x.sesiones, 0)).toBe(2);
      const ev = await call(progreso.GET, ids.a, { url: `/api/fitness/progreso?catalogoId=${sentadilla}` });
      expect(ev.json.unidad).toBe('kg');
      expect(ev.json.puntos.map((x: { valor: number }) => x.valor)).toEqual([65, 80]);
      expect((await call(progreso.GET, ids.b)).json.totales.sesiones).toBe(0);
      expect((await call(progreso.GET, ids.b, { url: `/api/fitness/progreso?catalogoId=${sentadilla}` })).json.puntos).toEqual([]);
    });

    it('la pantalla de inicio refleja solo datos reales del usuario', async () => {
      const a = await call(inicio.GET, ids.a);
      expect(a.json.semana.sesiones).toBe(2);
      expect(a.json.sesionActiva).toBeNull();
      const b = await call(inicio.GET, ids.b);
      expect(b.json.semana.sesiones).toBe(0);
      expect(b.json.ultimasSesiones).toEqual([]);
      expect(b.json.membresia).toBeNull();
    });

    it('eliminar la rutina no borra el historial de sesiones', async () => {
      expect((await call(rutinaId.DELETE, ids.a, { params: { id: String(rutina) }, method: 'DELETE' })).status).toBe(200);
      const h = await call(sesiones.GET, ids.a);
      expect(h.json.items).toHaveLength(2);
      expect(h.json.items[0].rutinaNombre).toBe('Sesión');
    });
  });

  describe('entrenadores y administradores', () => {
    it('solo asigna a sus clientes y no a ajenos', async () => {
      const pl = await call(plantillas.POST, ids.trainer, { method: 'POST', body: rutinaBody('Plantilla 2') });
      expect((await call(asignaciones.POST, ids.trainer, { method: 'POST', body: { rutinaId: pl.json.id, clienteId: ids.b } })).status).toBe(404);
      expect((await call(asignaciones.POST, ids.trainer2, { method: 'POST', body: { rutinaId: pl.json.id, clienteId: ids.a } })).status).toBe(404);
      expect((await call(asignaciones.POST, ids.trainer, { method: 'POST', body: { rutinaId: pl.json.id, clienteId: ids.trainer2 } })).status).toBe(404);
      expect((await call(asignaciones.POST, ids.admin, { method: 'POST', body: { rutinaId: pl.json.id, clienteId: ids.b } })).status).toBe(201);
    });

    it('otro entrenador no ve ni edita plantillas ajenas, pero sí las predeterminadas del administrador', async () => {
      const pl = await call(plantillas.POST, ids.trainer, { method: 'POST', body: rutinaBody('Solo mía') });
      const lista2 = await call(plantillas.GET, ids.trainer2);
      expect(lista2.json.some((r: { id: number }) => r.id === pl.json.id)).toBe(false);
      expect((await call(asignacionId.PUT, ids.trainer2, { params: { id: String(pl.json.id) }, method: 'PUT', body: rutinaBody('Xx') })).status).toBe(404);

      const adm = await call(plantillas.POST, ids.admin, { method: 'POST', body: rutinaBody('Predeterminada') });
      expect((await call(plantillas.GET, ids.trainer2)).json.some((r: { id: number }) => r.id === adm.json.id)).toBe(true);
      expect((await call(asignacionId.PUT, ids.trainer2, { params: { id: String(adm.json.id) }, method: 'PUT', body: rutinaBody('Xx') })).status).toBe(403);
    });

    it('retirar una asignación la oculta al cliente sin tocar su historial', async () => {
      const lista = (await call(asignaciones.GET, ids.trainer, { url: `/api/fitness/entrenador/asignaciones?clienteId=${ids.a}` })).json;
      expect(lista.length).toBeGreaterThan(0);
      const id = lista[0].id;
      expect((await call(asignacionId.DELETE, ids.trainer2, { params: { id: String(id) }, method: 'DELETE' })).status).toBe(404);
      expect((await call(asignacionId.DELETE, ids.trainer, { params: { id: String(id) }, method: 'DELETE' })).status).toBe(200);
      expect((await call(rutinas.GET, ids.a)).json.some((r: { id: number }) => r.id === id)).toBe(false);
    });

    it('consulta del progreso: el entrenador asignado y el administrador sí, otros no', async () => {
      const url = (c: number) => ({ url: `/api/fitness/entrenador/clientes/${c}/progreso`, params: { id: String(c) } });
      const ok = await call(progresoCliente.GET, ids.trainer, url(ids.a));
      expect(ok.status).toBe(200);
      expect(ok.json.totales.sesiones).toBe(2);
      expect(ok.json.historial).toHaveLength(2);
      expect((await call(progresoCliente.GET, ids.admin, url(ids.a))).status).toBe(200);
      expect((await call(progresoCliente.GET, ids.trainer2, url(ids.a))).status).toBe(404);
      expect((await call(progresoCliente.GET, ids.trainer, url(ids.b))).status).toBe(404);
      expect((await call(progresoCliente.GET, ids.a, url(ids.a))).status).toBe(403);
      expect((await call(progresoCliente.GET, ids.b, url(ids.a))).status).toBe(403);
    });

    it('la lista de clientes del entrenador solo contiene los suyos', async () => {
      const t = (await call(clientesEntrenador.GET, ids.trainer)).json.map((c: { id: number }) => c.id);
      expect(t).toContain(ids.a);
      expect(t).not.toContain(ids.b);
      expect((await call(clientesEntrenador.GET, ids.trainer2)).json.map((c: { id: number }) => c.id)).not.toContain(ids.a);
    });
  });
});
