import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

function serialize(obj: any): any {
    if (obj === null || obj === undefined) return obj;
    if (typeof obj === 'bigint') return obj.toString();
    if (obj instanceof Date) return obj.toISOString();
    if (typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return obj.map(serialize);
    const newObj: any = {};
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            newObj[key] = serialize(obj[key]);
        }
    }
    return newObj;
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    const { id } = params;

    try {
        console.log(`Request received for client ID: ${id}`);

        const usuario = await prisma.usuario.findUnique({
            where: { id: Number(id) },
            include: {
                registrosPeso: true,
                entrenadorAsignado: {
                    include: {
                        entrenador: {
                            include: {
                                usuario: true,
                            },
                        },
                    },
                },
                membresias: true,
                reservasCliente: {
                    include: {
                        entrenador: {
                            include: {
                                usuario: true,
                            },
                        },
                    },
                },
            },
        });

        if (!usuario) {
            console.log(`Cliente con ID ${id} no encontrado.`);
            return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 });
        }

        const weightRecords = usuario.registrosPeso || [];

        if (weightRecords.length === 0) {
            console.log(`No hay registros de peso disponibles para el cliente ID ${id}.`);
            return NextResponse.json({ message: 'No hay registros de peso disponibles' }, { status: 200 });
        }

        // Filtrar registros con fecha y peso no nulos y ordenar por fecha
        const sortedRecords = [...weightRecords]
            .filter(record => record.fecha !== null && record.peso !== null)
            .sort((a, b) => new Date(a.fecha!).getTime() - new Date(b.fecha!).getTime());

        const primerRegistro = sortedRecords[0];
        const ultimoRegistro = sortedRecords[sortedRecords.length - 1];

        if (!primerRegistro || !ultimoRegistro) {
            console.log(`No hay registros de peso válidos para el cliente ID ${id}.`);
            return NextResponse.json({ message: 'No hay registros de peso válidos' }, { status: 200 });
        }

        const kgDiferencia = ultimoRegistro.peso! - primerRegistro.peso!;
        const diasDiferencia = Math.ceil(
            (new Date(ultimoRegistro.fecha!).getTime() - new Date(primerRegistro.fecha!).getTime()) / (1000 * 60 * 60 * 24)
        );

        const kgPorDia = diasDiferencia !== 0 ? kgDiferencia / diasDiferencia : kgDiferencia;
        const kgPorSemana = kgPorDia * 7;
        const kgPorMes = kgPorDia * 30;

        const pesos = sortedRecords
            .map(record => record.peso)
            .filter((peso): peso is number => peso !== null);

        const pesoMaximo = Math.max(...pesos);
        const pesoMinimo = Math.min(...pesos);

        const ganancias = sortedRecords.reduce((acc, record, index) => {
            if (index === 0) return acc;
            const diff = record.peso! - sortedRecords[index - 1].peso!;
            return diff > 0 ? acc + diff : acc;
        }, 0);

        const estadisticas = {
            kgDiferencia,
            diasDiferencia,
            kgPorDia,
            kgPorSemana,
            kgPorMes,
            pesoMaximo,
            pesoMinimo,
            ganancias,
            registros: sortedRecords,
        };

        // Definir uniqueDays extrayendo las fechas únicas de reservas
        const uniqueDays = new Set(
            usuario.reservasCliente.map(reserva => new Date(reserva.fecha).toDateString())
        );

        const visitasEsteMes = uniqueDays.size; // Contar los días únicos

        const clienteInfo = {
            id: usuario.id.toString(),
            nombre: usuario.nombre,
            carnetIdentidad: usuario.carnetIdentidad,
            foto: usuario.foto,
            telefono: usuario.telefono,
            rol: usuario.rol,
            visitasEsteMes: usuario.visitasEsteMes || 0,
            reservas: usuario.reservasCliente.map(r => ({
                id: r.id.toString(),
                fecha: r.fecha.toISOString(),
                estado: r.estado,
                entrenador: r.entrenador
                    ? {
                        id: r.entrenador.id.toString(),
                        nombre: r.entrenador.usuario.nombre,
                    }
                    : null,
            })),
            membresias: usuario.membresias.map(m => ({
                id: m.id.toString(),
                tipo: m.tipo,
                estadoPago: m.estadoPago,
                fechaInicio: m.fechaInicio.toISOString(),
                fechaFin: m.fechaFin.toISOString(),
            })),
            entrenadorAsignado: usuario.entrenadorAsignado
                ? {
                    id: usuario.entrenadorAsignado.id.toString(),
                    nombre: usuario.entrenadorAsignado.nombre,
                    telefono: usuario.entrenadorAsignado.telefono,
                }
                : null,
            estadisticas,
        };

        const serializedClienteInfo = serialize(clienteInfo);

        console.log(`Estadísticas calculadas para el cliente ID ${id}:`, estadisticas);

        return NextResponse.json(serializedClienteInfo);
    } catch (error) {
        console.error('Error al obtener información del usuario:', error);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}