import { PrismaClient, Rol, TipoMembresia, EstadoPago, EstadoReserva } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const saltRounds = 10;

  // Clean tables in reverse FK order
  await prisma.registroPeso.deleteMany();
  await prisma.notificacionPush.deleteMany();
  await prisma.notificacion.deleteMany();
  await prisma.punto.deleteMany();
  await prisma.racha.deleteMany();
  await prisma.encuestaNPS.deleteMany();
  await prisma.recompensaCumpleanios.deleteMany();
  await prisma.desafioUsuario.deleteMany();
  await prisma.desafio.deleteMany();
  await prisma.ejercicio.deleteMany();
  await prisma.rutina.deleteMany();
  await prisma.pagoEntrenador.deleteMany();
  await prisma.pago.deleteMany();
  await prisma.gasto.deleteMany();
  await prisma.checkIn.deleteMany();
  await prisma.notaCliente.deleteMany();
  await prisma.congelacionMembresia.deleteMany();
  await prisma.historial.deleteMany();
  await prisma.reserva.deleteMany();
  await prisma.membresia.deleteMany();
  await prisma.entrenador.deleteMany();
  await prisma.usuario.deleteMany();
  await prisma.equipo.deleteMany();
  await prisma.meta.deleteMany();
  await prisma.configuracion.deleteMany();

  console.log('BD limpiada.');

  // ═══════════════════════════════════════════
  // ADMIN
  // ═══════════════════════════════════════════
  const adminPass = await bcrypt.hash('Dasieltorres@99', saltRounds);
  const admin = await prisma.usuario.create({
    data: {
      nombre: 'Dasiel Torres',
      username: 'dasieloski',
      password: adminPass,
      carnetIdentidad: '00000000001',
      telefono: '+5350000001',
      rol: Rol.ADMIN,
      visitasEsteMes: 0,
      email: 'dasiel@rosengym.com',
    },
  });
  console.log('✓ Admin creado: dasieloski / Dasieltorres@99');

  // ═══════════════════════════════════════════
  // 5 ENTRENADORES
  // ═══════════════════════════════════════════
  const trainerPass = await bcrypt.hash('trainer123', saltRounds);
  const entrenadores: { id: number; usuarioId: number; nombre: string }[] = [];

  const trainersData = [
    { nombre: 'Carlos Mendoza', username: 'entrenador1', ci: '11111111111', tel: '+5311111111' },
    { nombre: 'Laura Jiménez', username: 'entrenador2', ci: '11111111112', tel: '+5311111112' },
    { nombre: 'Andrés Ruiz',   username: 'entrenador3', ci: '11111111113', tel: '+5311111113' },
    { nombre: 'Sofía Vargas',  username: 'entrenador4', ci: '11111111114', tel: '+5311111114' },
    { nombre: 'Miguel Torres', username: 'entrenador5', ci: '11111111115', tel: '+5311111115' },
  ];

  for (const t of trainersData) {
    const user = await prisma.usuario.create({
      data: {
        nombre: t.nombre,
        username: t.username,
        password: trainerPass,
        carnetIdentidad: t.ci,
        telefono: t.tel,
        rol: Rol.ENTRENADOR,
        visitasEsteMes: 0,
      },
    });
    const ent = await prisma.entrenador.create({ data: { usuarioId: user.id } });
    entrenadores.push({ id: ent.id, usuarioId: user.id, nombre: t.nombre });
    console.log(`  → ${t.username} / trainer123`);
  }

  // ═══════════════════════════════════════════
  // 30 CLIENTES
  // ═══════════════════════════════════════════
  const clientPass = await bcrypt.hash('cliente123', saltRounds);
  const hoy = new Date();
  const clientes: { id: number; nombre: string }[] = [];

  const nombres = [
    'Juan Pérez',       'María López',      'Pedro García',     'Ana Martínez',
    'Luis Hernández',   'Carmen Díaz',      'José Rodríguez',   'Rosa Sánchez',
    'Jorge Ramírez',    'Elena Flores',     'Daniel Castillo',  'Mónica Reyes',
    'Ricardo Morales',  'Patricia Torres',  'Fernando Gómez',   'Gabriela Ortiz',
    'Santiago Vega',    'Verónica Luna',    'Alejandro Cruz',   'Adriana Rivas',
    'Manuel Ríos',      'Silvia Medina',    'Alberto Campos',   'Teresa Peña',
    'Diego Navarro',    'Lucía Herrera',    'Pablo Guerrero',   'Marina Delgado',
    'Héctor Sandoval',  'Clara Aguilar',
  ];

  for (let i = 0; i < 30; i++) {
    const user = await prisma.usuario.create({
      data: {
        nombre: nombres[i],
        username: `cliente${i + 1}`,
        password: clientPass,
        carnetIdentidad: `${22222222222 + i}`,
        telefono: `+532222${String(2222 + i).padStart(4, '0')}`,
        rol: Rol.CLIENTE,
        entrenadorAsignadoId: entrenadores[i % 5].usuarioId,
        visitasEsteMes: Math.floor(Math.random() * 25),
        email: `cliente${i + 1}@email.com`,
      },
    });
    clientes.push({ id: user.id, nombre: user.nombre });
  }
  console.log('✓ 30 clientes creados (cliente1..cliente30 / cliente123)');

  // ═══════════════════════════════════════════
  // MEMBRESÍAS VARIADAS
  // ═══════════════════════════════════════════
  const date = (d: number) => { const r = new Date(hoy); r.setDate(hoy.getDate() + d); return r; };
  type MembCfg = { tipo: TipoMembresia; di: number; df: number; pago: EstadoPago; congelada?: boolean };
  const configs: MembCfg[] = [
    // 0-4: 5 activas MENSUAL (algunas próximas a vencer)
    { tipo: TipoMembresia.MENSUAL,    di: -20, df: 2,   pago: EstadoPago.PAGADO },
    { tipo: TipoMembresia.MENSUAL,    di: -15, df: 5,   pago: EstadoPago.PAGADO },
    { tipo: TipoMembresia.MENSUAL,    di: -25, df: -3,  pago: EstadoPago.IMPAGADO },
    { tipo: TipoMembresia.MENSUAL,    di: -10, df: 10,  pago: EstadoPago.PAGADO },
    { tipo: TipoMembresia.MENSUAL,    di: -5,  df: 15,  pago: EstadoPago.PAGADO },
    // 5-9: recién empezadas
    { tipo: TipoMembresia.MENSUAL,    di: 0,   df: 30,  pago: EstadoPago.PAGADO },
    { tipo: TipoMembresia.MENSUAL,    di: -2,  df: 28,  pago: EstadoPago.PAGADO },
    { tipo: TipoMembresia.MENSUAL,    di: -3,  df: 27,  pago: EstadoPago.PAGADO },
    { tipo: TipoMembresia.MENSUAL,    di: -1,  df: 29,  pago: EstadoPago.IMPAGADO },
    { tipo: TipoMembresia.MENSUAL,    di: 0,   df: 30,  pago: EstadoPago.PAGADO },
    // 10-14: trimestrales
    { tipo: TipoMembresia.TRIMESTRAL, di: -40, df: 50,  pago: EstadoPago.PAGADO },
    { tipo: TipoMembresia.TRIMESTRAL, di: -60, df: 30,  pago: EstadoPago.PAGADO },
    { tipo: TipoMembresia.TRIMESTRAL, di: -80, df: 10,  pago: EstadoPago.PAGADO },
    { tipo: TipoMembresia.TRIMESTRAL, di: -30, df: 60,  pago: EstadoPago.PAGADO },
    { tipo: TipoMembresia.TRIMESTRAL, di: -50, df: -5,  pago: EstadoPago.IMPAGADO },
    // 15-19: anuales / largas
    { tipo: TipoMembresia.ANUAL,      di: -30, df: 335, pago: EstadoPago.PAGADO },
    { tipo: TipoMembresia.ANUAL,      di: -60, df: 305, pago: EstadoPago.PAGADO },
    { tipo: TipoMembresia.ANUAL,      di: -90, df: 275, pago: EstadoPago.PAGADO },
    { tipo: TipoMembresia.ANUAL,      di: -10, df: 355, pago: EstadoPago.PAGADO },
    { tipo: TipoMembresia.ANUAL,      di: -120,df: 245, pago: EstadoPago.IMPAGADO },
    // 20-24: congeladas / diversas
    { tipo: TipoMembresia.MENSUAL,    di: -40, df: -10, pago: EstadoPago.PAGADO,    congelada: true },
    { tipo: TipoMembresia.TRIMESTRAL, di: -20, df: 70,  pago: EstadoPago.PAGADO,    congelada: true },
    { tipo: TipoMembresia.MENSUAL,    di: -45, df: -15, pago: EstadoPago.IMPAGADO },
    { tipo: TipoMembresia.TRIMESTRAL, di: -5,  df: 85,  pago: EstadoPago.PAGADO },
    { tipo: TipoMembresia.MENSUAL,    di: -35, df: -5,  pago: EstadoPago.PAGADO },
    // 25-29: variadas
    { tipo: TipoMembresia.TRIMESTRAL, di: -70, df: 20,  pago: EstadoPago.PAGADO },
    { tipo: TipoMembresia.ANUAL,      di: -50, df: 315, pago: EstadoPago.PAGADO },
    { tipo: TipoMembresia.MENSUAL,    di: -8,  df: 22,  pago: EstadoPago.PAGADO },
    { tipo: TipoMembresia.MENSUAL,    di: -12, df: 18,  pago: EstadoPago.IMPAGADO },
    { tipo: TipoMembresia.TRIMESTRAL, di: -90, df: 0,   pago: EstadoPago.PAGADO },
  ];

  for (let i = 0; i < 30; i++) {
    const cfg = configs[i];
    const mem = await prisma.membresia.create({
      data: {
        tipo: cfg.tipo,
        fechaInicio: date(cfg.di),
        fechaFin: date(cfg.df),
        estadoPago: cfg.pago,
        congelada: cfg.congelada ?? false,
        clienteId: clientes[i].id,
      },
    });
    // Assign as current membership (unless expired or impago)
    const expired = date(cfg.df) < hoy;
    if (!expired && cfg.pago === EstadoPago.PAGADO) {
      await prisma.usuario.update({ where: { id: clientes[i].id }, data: { membresiaActualId: mem.id } });
    }
  }
  console.log('✓ 30 membresías creadas (variadas: próximas a vencer, activas, congeladas, impagas)');

  // ═══════════════════════════════════════════
  // PAGOS (one per membership)
  // ═══════════════════════════════════════════
  const precios: Record<TipoMembresia, number> = {
    [TipoMembresia.MENSUAL]: 500,
    [TipoMembresia.TRIMESTRAL]: 1350,
    [TipoMembresia.ANUAL]: 4800,
  };
  const allMems = await prisma.membresia.findMany();
  for (const m of allMems) {
    await prisma.pago.create({
      data: {
        clienteId: m.clienteId,
        membresiaId: m.id,
        monto: precios[m.tipo as TipoMembresia],
        moneda: 'CUP',
        metodoPago: ['EFECTIVO', 'TRANSFERENCIA', 'ZELLE'][Math.floor(Math.random() * 3)],
        fechaPago: m.fechaInicio,
      },
    });
  }
  console.log('✓ Pagos creados');

  // ═══════════════════════════════════════════
  // CHECK-INS (some clients have history)
  // ═══════════════════════════════════════════
  for (let i = 0; i < 15; i++) {
    const visits = Math.floor(Math.random() * 8) + 1;
    for (let v = 0; v < visits; v++) {
      const d = new Date(hoy);
      d.setDate(d.getDate() - Math.floor(Math.random() * 20));
      d.setHours(7 + Math.floor(Math.random() * 12), Math.floor(Math.random() * 60));
      await prisma.checkIn.create({
        data: { clienteId: clientes[i].id, fecha: d, tipo: 'ENTRADA', metodo: 'MANUAL' },
      });
    }
  }
  console.log('✓ Check-ins creados');

  // ═══════════════════════════════════════════
  // RUTINAS for some clients
  // ═══════════════════════════════════════════
  const ejerciciosPool = ['Press banca', 'Sentadilla', 'Peso muerto', 'Press militar',
    'Remo con barra', 'Curl bíceps', 'Fondos', 'Dominadas', 'Elevaciones laterales',
    'Press francés', 'Curl femoral', 'Extensión cuádriceps'];

  for (let i = 0; i < 12; i++) {
    const entrenadorAsignado = await prisma.usuario.findUnique({ where: { id: clientes[i].id }, select: { entrenadorAsignadoId: true } });
    const rutina = await prisma.rutina.create({
      data: {
        nombre: `Rutina ${nombres[i].split(' ')[0]}`,
        clienteId: clientes[i].id,
        creadorId: entrenadorAsignado?.entrenadorAsignadoId ?? admin.id,
        activa: true,
      },
    });
    for (let e = 0; e < 5; e++) {
      await prisma.ejercicio.create({
        data: {
          nombre: ejerciciosPool[(i * 5 + e) % ejerciciosPool.length],
          series: 3 + Math.floor(Math.random() * 2),
          repeticiones: 8 + Math.floor(Math.random() * 5),
          peso: Math.round((20 + Math.random() * 60) * 10) / 10,
          diaSemana: ['LUNES', 'MIÉRCOLES', 'VIERNES'][e % 3],
          orden: e,
          rutinaId: rutina.id,
        },
      });
    }
  }
  console.log('✓ Rutinas y ejercicios creados');

  // ═══════════════════════════════════════════
  // HISTORIAL
  // ═══════════════════════════════════════════
  for (let i = 0; i < 10; i++) {
    await prisma.historial.create({
      data: {
        accion: 'CHECKIN',
        descripcion: `Check-in registrado para ${nombres[i]}`,
        usuarioId: clientes[i].id,
        fecha: date(-Math.floor(Math.random() * 15)),
      },
    });
  }
  console.log('✓ Historial creado');

  // ═══════════════════════════════════════════
  // CONFIGURACIÓN
  // ═══════════════════════════════════════════
  await prisma.configuracion.createMany({
    data: [
      { clave: 'PRECIO_MENSUAL', valor: '500', descripcion: 'Precio membresía mensual en CUP' },
      { clave: 'PRECIO_TRIMESTRAL', valor: '1350', descripcion: 'Precio membresía trimestral en CUP' },
      { clave: 'PRECIO_ANUAL', valor: '4800', descripcion: 'Precio membresía anual en CUP' },
      { clave: 'MONEDA_PREDETERMINADA', valor: 'CUP', descripcion: 'Moneda por defecto' },
      { clave: 'NOMBRE_GIMNASIO', valor: 'Rosen Gym', descripcion: 'Nombre del gimnasio' },
      { clave: 'HORARIO_APERTURA', valor: '06:00', descripcion: 'Hora de apertura' },
      { clave: 'HORARIO_CIERRE', valor: '22:00', descripcion: 'Hora de cierre' },
    ],
  });
  console.log('✓ Configuración creada');

  // ═══════════════════════════════════════════
  // SUMMARY
  // ═══════════════════════════════════════════
  console.log('\n═══════════════════════════════════════');
  console.log('✅ Seed completado exitosamente');
  console.log('═══════════════════════════════════════');
  console.log('\nCredenciales:');
  console.log('  Admin:       dasieloski / Dasieltorres@99');
  console.log('  Entrenadores: entrenador1..5 / trainer123');
  console.log('  Clientes:    cliente1..30 / cliente123');
}

main()
  .then(async () => { await prisma.$disconnect(); })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
