import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import prisma from '@/lib/prisma';
import { handle, requireActor } from '@/lib/fitness/auth';
import { catalogoSchema, slugify } from '@/lib/fitness/validation';

export const dynamic = 'force-dynamic';

const TAMANO_PAGINA = 100;

// Lectura: cualquier usuario con panel (el catálogo es común y no contiene datos personales).
export const GET = handle(async (req: NextRequest) => {
  await requireActor(req, ['CLIENTE', 'ENTRENADOR', 'ADMIN']);
  const p = new URL(req.url).searchParams;
  const q = p.get('q')?.trim().slice(0, 80);
  const pagina = Math.max(1, parseInt(p.get('pagina') || '1', 10) || 1);

  const where: Prisma.CatalogoEjercicioWhereInput = {
    activo: true,
    ...(q ? { nombre: { contains: q, mode: 'insensitive' } } : {}),
    ...(p.get('musculo') ? { OR: [{ musculoPrincipal: p.get('musculo')! }, { musculosSecundarios: { has: p.get('musculo')! } }] } : {}),
    ...(p.get('equipamiento') ? { equipamiento: p.get('equipamiento')! } : {}),
    ...(p.get('categoria') ? { categoria: p.get('categoria')! } : {}),
    ...(p.get('nivel') ? { nivel: p.get('nivel')! } : {}),
  };

  const [total, items] = await Promise.all([
    prisma.catalogoEjercicio.count({ where }),
    prisma.catalogoEjercicio.findMany({
      where,
      orderBy: { nombre: 'asc' },
      take: TAMANO_PAGINA,
      skip: (pagina - 1) * TAMANO_PAGINA,
    }),
  ]);
  return NextResponse.json({ total, pagina, tamanoPagina: TAMANO_PAGINA, items });
});

// Alta: entrenadores y administradores mantienen el catálogo común.
export const POST = handle(async (req: NextRequest) => {
  const actor = await requireActor(req, ['ENTRENADOR', 'ADMIN']);
  const d = catalogoSchema.parse(await req.json());
  let slug = slugify(d.nombre);
  if (await prisma.catalogoEjercicio.findUnique({ where: { slug }, select: { id: true } })) {
    slug = `${slug}-${Date.now().toString(36)}`.slice(0, 90);
  }
  const creado = await prisma.catalogoEjercicio.create({
    data: { ...d, slug, descripcion: d.descripcion ?? null, mediaUrl: d.mediaUrl ?? null, mediaLicencia: d.mediaLicencia ?? null, creadoPorId: actor.id },
  });
  return NextResponse.json(creado, { status: 201 });
});
