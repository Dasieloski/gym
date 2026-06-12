import { PrismaClient, Rol, TipoMembresia, EstadoPago, EstadoReserva } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const saltRounds = 10;

  // Limpiar tablas en orden inverso para respetar FKs
  await prisma.registroPeso.deleteMany();
  await prisma.historial.deleteMany();
  await prisma.reserva.deleteMany();
  await prisma.membresia.deleteMany();
  await prisma.entrenador.deleteMany();
  await prisma.usuario.deleteMany();

  console.log('Base de datos limpiada.');

  // ─── Admin ───
  const adminPass = await bcrypt.hash('admin123', saltRounds);
  const admin = await prisma.usuario.create({
    data: {
      nombre: 'Administrador',
      username: 'admin',
      password: adminPass,
      carnetIdentidad: '00000000000',
      telefono: '+53000000000',
      rol: Rol.ADMIN,
      visitasEsteMes: 0,
    },
  });
  console.log('Admin creado:', admin.username);

  // ─── Entrenador ───
  const trainerPass = await bcrypt.hash('trainer123', saltRounds);
  const trainerUser = await prisma.usuario.create({
    data: {
      nombre: 'Carlos Trainer',
      username: 'entrenador1',
      password: trainerPass,
      carnetIdentidad: '11111111111',
      telefono: '+53111111111',
      rol: Rol.ENTRENADOR,
      visitasEsteMes: 0,
    },
  });
  const entrenador = await prisma.entrenador.create({
    data: {
      usuarioId: trainerUser.id,
    },
  });
  console.log('Entrenador creado:', trainerUser.username);

  // ─── Clientes ───
  const clientPass = await bcrypt.hash('client123', saltRounds);

  const cliente1 = await prisma.usuario.create({
    data: {
      nombre: 'Juan Pérez',
      username: 'cliente1',
      password: clientPass,
      carnetIdentidad: '22222222222',
      telefono: '+53222222222',
      rol: Rol.CLIENTE,
      entrenadorAsignadoId: trainerUser.id,
      visitasEsteMes: 8,
    },
  });

  const cliente2 = await prisma.usuario.create({
    data: {
      nombre: 'María López',
      username: 'cliente2',
      password: clientPass,
      carnetIdentidad: '33333333333',
      telefono: '+53333333333',
      rol: Rol.CLIENTE,
      entrenadorAsignadoId: trainerUser.id,
      visitasEsteMes: 12,
    },
  });

  const cliente3 = await prisma.usuario.create({
    data: {
      nombre: 'Pedro García',
      username: 'cliente3',
      password: clientPass,
      carnetIdentidad: '44444444444',
      telefono: '+53444444444',
      rol: Rol.CLIENTE,
      entrenadorAsignadoId: trainerUser.id,
      visitasEsteMes: 3,
    },
  });
  console.log('Clientes creados: cliente1, cliente2, cliente3');

  // ─── Membresías ───
  const hoy = new Date();
  const en30dias = new Date(hoy); en30dias.setDate(hoy.getDate() + 30);
  const en120dias = new Date(hoy); en120dias.setDate(hoy.getDate() + 120);
  const en335dias = new Date(hoy); en335dias.setDate(hoy.getDate() + 335);
  const hace60 = new Date(hoy); hace60.setDate(hoy.getDate() - 60);
  const hace30 = new Date(hoy); hace30.setDate(hoy.getDate() - 30);
  const maniana = new Date(hoy); maniana.setDate(hoy.getDate() + 1);
  maniana.setHours(10, 0, 0, 0);

  const memb1 = await prisma.membresia.create({
    data: {
      tipo: TipoMembresia.MENSUAL,
      fechaInicio: hoy,
      fechaFin: en30dias,
      estadoPago: EstadoPago.PAGADO,
      clienteId: cliente1.id,
    },
  });

  const memb2 = await prisma.membresia.create({
    data: {
      tipo: TipoMembresia.TRIMESTRAL,
      fechaInicio: hace60,
      fechaFin: en120dias,
      estadoPago: EstadoPago.PAGADO,
      clienteId: cliente2.id,
    },
  });

  const memb3 = await prisma.membresia.create({
    data: {
      tipo: TipoMembresia.ANUAL,
      fechaInicio: hace30,
      fechaFin: en335dias,
      estadoPago: EstadoPago.IMPAGADO,
      clienteId: cliente3.id,
    },
  });
  console.log('Membresías creadas.');

  // Asignar membresía actual a cada cliente
  await prisma.usuario.update({ where: { id: cliente1.id }, data: { membresiaActualId: memb1.id } });
  await prisma.usuario.update({ where: { id: cliente2.id }, data: { membresiaActualId: memb2.id } });
  await prisma.usuario.update({ where: { id: cliente3.id }, data: { membresiaActualId: memb3.id } });
  console.log('Membresías actuales asignadas.');

  // ─── Reservas ───
  await prisma.reserva.create({
    data: {
      clienteId: cliente1.id,
      entrenadorId: entrenador.id,
      estado: EstadoReserva.ACTIVA,
      fecha: maniana,
    },
  });
  console.log('Reserva creada (cliente1 + entrenador1).');

  // ─── Registros de Peso ───
  await prisma.registroPeso.create({
    data: {
      fecha: hoy,
      peso: 75.5,
      altura: 1.78,
      imc: 23.8,
      grasaCorporal: 15.2,
      cuello: 40.0,
      pecho: 102.0,
      brazo: 35.5,
      cintura: 86.0,
      cadera: 96.0,
      muslo: 56.0,
      gluteo: 92.0,
      usuarioId: cliente1.id,
    },
  });

  await prisma.registroPeso.create({
    data: {
      fecha: hace30,
      peso: 78.0,
      altura: 1.78,
      imc: 24.6,
      grasaCorporal: 17.0,
      cuello: 41.0,
      pecho: 104.0,
      brazo: 36.0,
      cintura: 88.0,
      cadera: 98.0,
      muslo: 57.0,
      gluteo: 94.0,
      usuarioId: cliente1.id,
    },
  });
  console.log('Registros de peso creados para cliente1.');

  console.log('\n✅ Seed completado con éxito.');
  console.log('Credenciales de prueba:');
  console.log('  Admin      -> username: admin        | password: admin123');
  console.log('  Entrenador -> username: entrenador1  | password: trainer123');
  console.log('  Clientes   -> username: cliente1/2/3  | password: client123');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
