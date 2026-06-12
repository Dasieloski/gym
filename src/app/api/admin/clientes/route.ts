import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from "bcryptjs";
import { join } from 'path';
import { unlink } from 'fs/promises';
import { deleteFromSupabase } from '@/lib/supabaseStorage';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search') || '';
    const rolFilter = searchParams.get('rol') || '';
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (rolFilter) {
      where.rol = rolFilter;
    }
    if (search) {
      where.OR = [
        { nombre: { contains: search, mode: 'insensitive' } },
        { carnetIdentidad: { contains: search, mode: 'insensitive' } },
        { telefono: { contains: search, mode: 'insensitive' } },
        { username: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [usuarios, totalCount] = await Promise.all([
      prisma.usuario.findMany({
        where,
        orderBy: { rol: 'asc' },
        select: {
          id: true,
          nombre: true,
          carnetIdentidad: true,
          telefono: true,
          rol: true,
          foto: true,
          comoConocio: true,
          entrenadorAsignado: {
            select: {
              id: true,
              nombre: true,
            }
          },
          membresiaActual: {
            select: {
              tipo: true,
              fechaFin: true,
              estadoPago: true,
            }
          }
        },
        skip,
        take: limit,
      }),
      prisma.usuario.count({ where }),
    ]);

    const clientes = usuarios.filter(u => u.rol === 'CLIENTE');
    const entrenadores = usuarios.filter(u => u.rol === 'ENTRENADOR');
    const otros = usuarios.filter(u => u.rol !== 'CLIENTE' && u.rol !== 'ENTRENADOR');

    const entrenadoresDropdown = await prisma.usuario.findMany({
      where: { rol: 'ENTRENADOR' },
      select: { id: true, nombre: true }
    });

    return NextResponse.json({ 
      clientes, 
      entrenadores, 
      otros, 
      entrenadoresDropdown,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      }
    });
  } catch (error) {
    console.error('Error al obtener los datos:', error);
    return NextResponse.json({ error: 'Error al obtener los datos' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { id, nombre, telefono, entrenadorAsignadoId, rol, password } = await req.json();

    if (!id) {
      throw new Error('El id es requerido');
    }

    const updateData: Record<string, unknown> = {
      nombre,
      telefono,
    };

    if (entrenadorAsignadoId) {
      updateData.entrenadorAsignadoId = parseInt(entrenadorAsignadoId);
    } else {
      updateData.entrenadorAsignadoId = null;
    }

    if (rol) {
      updateData.rol = rol;
    }

    if (password && password.trim() !== "") {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updatedCliente = await prisma.usuario.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        entrenadorAsignado: {
          select: {
            id: true,
            nombre: true,
          }
        },
        membresiaActual: {
          select: {
            tipo: true,
            fechaFin: true,
            estadoPago: true,
          }
        }
      }
    });

    await prisma.historial.create({
      data: {
        accion: 'ACTUALIZACION_USUARIO',
        descripcion: `Se actualizó el usuario ${updatedCliente.nombre}`,
        usuarioId: updatedCliente.id,
        fecha: new Date(),
      },
    })

    return NextResponse.json(updatedCliente, { status: 200 });
  } catch (error) {
    console.error('Error al actualizar el cliente:', error);
    return NextResponse.json({ error: 'Error al actualizar el cliente' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const idParam = searchParams.get('id');
    const clienteId = idParam ? parseInt(idParam) : NaN;

    if (isNaN(clienteId)) {
        return NextResponse.json({ error: 'ID de cliente inválido' }, { status: 400 });
    }

    try {
        // Obtener datos del usuario antes de eliminar
        const usuario = await prisma.usuario.findUnique({
            where: { id: clienteId },
            select: { foto: true, nombre: true, rol: true },
        });

        if (usuario) {
            await prisma.historial.create({
                data: {
                    accion: 'ELIMINACION_USUARIO',
                    descripcion: `Se eliminó el usuario ${usuario.nombre} con rol ${usuario.rol}`,
                    usuarioId: clienteId,
                    fecha: new Date(),
                },
            });
        }

        // Eliminar referencias a reservas
        await prisma.reserva.deleteMany({
            where: { clienteId: clienteId },
        });

        // Eliminar referencias a membresías
        await prisma.membresia.deleteMany({
            where: { clienteId: clienteId },
        });

        // Eliminar referencias a historiales
        await prisma.historial.deleteMany({
            where: { usuarioId: clienteId },
        });

        // Eliminar el cliente
        const deletedCliente = await prisma.usuario.delete({
            where: { id: clienteId },
        });

        // Borrar la foto de Supabase Storage si existe
        if (usuario?.foto) {
            try {
                // Extraer el path del archivo de la URL de Supabase
                const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
                if (supabaseUrl && usuario.foto.startsWith(supabaseUrl)) {
                    const path = usuario.foto.replace(`${supabaseUrl}/storage/v1/object/public/`, '');
                    await deleteFromSupabase(path);
                    console.log('Foto de Supabase eliminada:', path);
                } else if (usuario.foto.startsWith('/uploads/')) {
                    // Fallback para fotos locales antiguas
                    const filepath = join(process.cwd(), 'public', usuario.foto);
                    await unlink(filepath);
                    console.log('Foto local eliminada:', filepath);
                }
            } catch (e) {
                console.error('Error al intentar borrar la foto:', e);
            }
        }

        return NextResponse.json({ message: 'Cliente eliminado con éxito', cliente: deletedCliente });
    } catch (error) {
        console.error('Error al eliminar el cliente:', error);
        return NextResponse.json({ error: 'Error al eliminar el cliente' }, { status: 500 });
    }
}
