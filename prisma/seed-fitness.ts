// Carga (idempotente) el catálogo de ejercicios. No borra nada: hace upsert por `slug`.
//   npm run db:seed-fitness                      -> catálogo inicial incluido en el repositorio
//   npm run db:seed-fitness -- --file datos.json -> importa un JSON con una lista de ejercicios
// Cada elemento del JSON usa los mismos campos que `EjercicioSemilla`; `mediaUrl` y `mediaLicencia`
// son opcionales, pero si hay mediaUrl debe indicarse la licencia que permite usar el recurso.
import { readFileSync } from 'fs';
import { PrismaClient } from '@prisma/client';
import { CATALOGO_INICIAL, EjercicioSemilla } from './fitness-catalog';
import { catalogoSchema, slugify } from '../src/lib/fitness/validation';

const prisma = new PrismaClient();

async function main() {
  const i = process.argv.indexOf('--file');
  const origen: EjercicioSemilla[] = i > -1 ? JSON.parse(readFileSync(process.argv[i + 1], 'utf-8')) : CATALOGO_INICIAL;

  let creados = 0;
  let actualizados = 0;
  for (const bruto of origen) {
    const d = catalogoSchema.parse(bruto); // misma validación que la API
    const slug = slugify(d.nombre);
    const existe = await prisma.catalogoEjercicio.findUnique({ where: { slug }, select: { id: true } });
    const datos = { ...d, descripcion: d.descripcion ?? null, mediaUrl: d.mediaUrl ?? null, mediaLicencia: d.mediaLicencia ?? null };
    await prisma.catalogoEjercicio.upsert({ where: { slug }, create: { slug, ...datos }, update: datos });
    existe ? actualizados++ : creados++;
  }
  console.log(`Catálogo: ${creados} creados, ${actualizados} actualizados (${origen.length} en total).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
