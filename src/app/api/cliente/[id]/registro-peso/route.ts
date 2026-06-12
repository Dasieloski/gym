import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request, { params }: { params: { id: string } }) {
    const { id } = params;

    try {
        const registros = await prisma.registroPeso.findMany({
            where: {
                usuarioId: parseInt(id),
            },
            orderBy: {
                fecha: 'desc',
            },
        });

        // Convertir campos BigInt a string
        const serializedRegistros = registros.map(registro => ({
            ...registro,
            id: registro.id.toString(),
        }));

        return NextResponse.json(serializedRegistros, { status: 200 });
    } catch (error) {
        console.error('Error al obtener los registros de peso:', error);
        return NextResponse.json({ error: 'Error al obtener los registros de peso' }, { status: 500 });
    }
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
    const { id } = params;
    const { peso, imc, grasaCorporal, cuello, pecho, brazo, cintura, cadera, muslo, altura, gluteo } = await request.json();

    // Validar que altura no sea null o undefined
    if (altura === null || altura === undefined || altura <= 0) {
        return NextResponse.json({ error: 'Altura es obligatoria y debe ser un número válido' }, { status: 400 });
    }

    try {
        // Verificar si el usuario existe
        const usuario = await prisma.usuario.findUnique({
            where: { id: parseInt(id) },
        });

        if (!usuario) {
            return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
        }

        const nuevoRegistro = await prisma.registroPeso.create({
            data: {
                peso,
                imc,
                grasaCorporal,
                cuello,
                altura,
                gluteo,
                pecho,
                brazo,
                cintura,
                cadera,
                muslo,
                usuarioId: parseInt(id),
                fecha: new Date(),
            },
        });

        // Serializar campos si es necesario
        const serializedRegistro = {
            ...nuevoRegistro,
            id: nuevoRegistro.id.toString(),
        };

        return NextResponse.json(serializedRegistro, { status: 201 });
    } catch (error) {
        if (error instanceof Error) {
            console.error('Error al agregar registro de peso:', error);
            return NextResponse.json({ error: 'Error al agregar registro de peso', details: error.message }, { status: 500 });
        } else {
            console.error('Error desconocido:', error);
            return NextResponse.json({ error: 'Error desconocido al agregar registro de peso' }, { status: 500 });
        }
    }
}