import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Función auxiliar para determinar días adicionales según el tipo de membresía
const getAdditionalDays = (tipo: string): number => {
    switch (tipo.toUpperCase()) {
        case 'ANUAL':
            return 365;
        case 'TRIMESTRAL':
            return 180; // 3 meses
        case 'MENSUAL':
            return 30;
        default:
            return 30; // Por defecto, asumiendo 30 días
    }
}

export async function PUT(request: Request) {
    try {
        // Leer todo el cuerpo de la solicitud
        const { clientId, tipo, descripcion, fechaInicio, fechaFin, additionalDays, countDaysWithoutPayment } = await request.json();

        console.log('Backend: Recibido PUT request');
        console.log('clientId:', clientId);
        console.log('tipo:', tipo);
        console.log('descripcion:', descripcion);
        console.log('fechaInicio:', fechaInicio);
        console.log('fechaFin:', fechaFin);
        console.log('additionalDays:', additionalDays);
        console.log('countDaysWithoutPayment:', countDaysWithoutPayment);

        if (!clientId || !tipo) {
            console.log('Backend: clientId o tipo faltantes');
            return NextResponse.json({ error: 'clientId y tipo son requeridos' }, { status: 400 });
        }

        // Buscar al usuario (cliente) incluyendo la membresía actual
        const usuario = await prisma.usuario.findUnique({
            where: { id: clientId },
            include: { membresiaActual: true },
        });

        console.log('Backend: Usuario encontrado:', usuario);

        if (!usuario) {
            console.log('Backend: Cliente no encontrado');
            return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 });
        }

        // Obtener la fecha actual
        const hoy = new Date();

        let nuevaFechaInicio: Date;
        let nuevaFechaFin: Date;

        if (countDaysWithoutPayment) {
            // Calcular los días sin pago
            const fechaFinActual = new Date(usuario.membresiaActual?.fechaFin || hoy);
            const diferenciaTiempo = hoy.getTime() - fechaFinActual.getTime();
            const diasSinPago = Math.floor(diferenciaTiempo / (1000 * 60 * 60 * 24));

            console.log('Backend: diasSinPago:', diasSinPago);

            // Calcular los días a agregar restando los días sin pago al periodo de la membresía
            const diasDeMembresia = getAdditionalDays(tipo);
            const diasParaAgregar = diasDeMembresia - diasSinPago;

            console.log('Backend: diasParaAgregar:', diasParaAgregar);

            // Establecer la nueva fecha de inicio como hoy
            nuevaFechaInicio = hoy;

            // Calcular la nueva fecha de fin añadiendo los días a agregar
            nuevaFechaFin = new Date(hoy.getTime() + (diasParaAgregar * 24 * 60 * 60 * 1000));

            console.log('Backend: nuevaFechaFin (contar días sin pago):', nuevaFechaFin);
        } else if (descripcion && descripcion.toLowerCase().includes('adelantado')) {
            // Determinar si es un pago adelantado
            const isAdvanced = true;
            console.log('Backend: isAdvanced:', isAdvanced);

            let currentFechaFin: Date;
            if (usuario.membresiaActual) {
              currentFechaFin = new Date(usuario.membresiaActual.fechaFin);
            } else {
              currentFechaFin = hoy;
            }
            console.log('Backend: currentFechaFin:', currentFechaFin);

            // Calcular los días adicionales basados en el tipo de membresía
            const additionalDaysToAdd = additionalDays || getAdditionalDays(tipo);
            console.log('Backend: additionalDays:', additionalDaysToAdd);

            // Si hay membresía actual, empezar desde su fecha fin, sino desde hoy
            if (usuario.membresiaActual) {
              nuevaFechaInicio = currentFechaFin;
              nuevaFechaFin = new Date(currentFechaFin.getTime() + (additionalDaysToAdd * 24 * 60 * 60 * 1000));
            } else {
              nuevaFechaInicio = hoy;
              nuevaFechaFin = new Date(hoy.getTime() + (additionalDaysToAdd * 24 * 60 * 60 * 1000));
            }
            console.log('Backend: nuevaFechaFin (adelantado):', nuevaFechaFin);
        } else {
            if (usuario.membresiaActual) {
                // Si el cliente tiene una membresía actual, usar las fechas proporcionadas
                if (!fechaInicio || !fechaFin) {
                    console.log('Backend: fechaInicio o fechaFin faltantes');
                    return NextResponse.json({ error: 'fechaInicio y fechaFin son requeridos si no es adelantado' }, { status: 400 });
                }

                nuevaFechaInicio = new Date(fechaInicio);
                nuevaFechaFin = new Date(fechaFin);

                console.log('Backend: nuevaFechaInicio (normal):', nuevaFechaInicio);
                console.log('Backend: nuevaFechaFin (normal):', nuevaFechaFin);
            } else {
                // Si el cliente no tiene una membresía actual, asignar fechas automáticamente
                nuevaFechaInicio = hoy;
                const diasDeMembresia = getAdditionalDays(tipo);
                nuevaFechaFin = new Date(hoy.getTime() + (diasDeMembresia * 24 * 60 * 60 * 1000));

                console.log('Backend: nuevaFechaInicio (automático):', nuevaFechaInicio);
                console.log('Backend: nuevaFechaFin (automático):', nuevaFechaFin);
            }
        }

        // Crear una nueva membresía con las fechas calculadas
        const nuevaMembresia = await prisma.membresia.create({
            data: {
                tipo: tipo,
                fechaInicio: nuevaFechaInicio,
                fechaFin: nuevaFechaFin,
                estadoPago: 'PAGADO',
                clienteId: clientId,
            },
        });

        console.log('Backend: Nueva membresía creada:', nuevaMembresia);

        // Actualizar al usuario para que apunte a la nueva membresía
        const updatedUsuario = await prisma.usuario.update({
            where: { id: clientId },
            data: {
                membresiaActualId: nuevaMembresia.id,
            },
            include: {
                membresiaActual: true,
                membresias: true,
            },
        });

        console.log('Backend: Usuario actualizado:', updatedUsuario);

        return NextResponse.json(updatedUsuario);
    } catch (error) {
        console.error('Error actualizando membresía:', error);
        return NextResponse.json({ error: 'Error actualizando membresía' }, { status: 500 });
    }
}