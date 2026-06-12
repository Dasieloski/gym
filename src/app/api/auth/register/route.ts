import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(request: Request) {
    try {
        const data = await request.json()
        console.log("Datos recibidos:", data)

        if (!data.nombre || !data.username || !data.carnetIdentidad || !data.telefono || !data.password) {
            console.log("Faltan campos requeridos")
            return NextResponse.json({
                message: "Todos los campos son obligatorios"
            }, { status: 400 })
        }

        if (!data.sexo) {
            return NextResponse.json({
                message: "El sexo es obligatorio"
            }, { status: 400 })
        }

        const userfound = await prisma.usuario.findFirst({
            where: {
                OR: [
                    { username: data.username },
                    { carnetIdentidad: data.carnetIdentidad }
                ]
            }
        })

        if (userfound) {
            return NextResponse.json({
                message: "El usuario ya existe"
            }, { status: 400 })
        }

        const hashedPassword = await bcrypt.hash(data.password, 10)
        const NewUser = await prisma.usuario.create({
            data: {
                foto: data.foto,
                nombre: data.nombre,
                username: data.username,
                carnetIdentidad: data.carnetIdentidad,
                telefono: data.telefono,
                password: hashedPassword,
                rol: data.rol || 'CLIENTEESPERA',
                sexo: data.sexo,
                email: data.email || null,
                instagram: data.instagram || null,
                comoConocio: data.comoConocio || null,
                fechaNacimiento: data.fechaNacimiento ? new Date(data.fechaNacimiento) : null,
            }
        })

        await prisma.historial.create({
            data: {
                accion: 'CREACION_USUARIO',
                descripcion: `Se creó el usuario ${NewUser.nombre} con rol ${NewUser.rol}`,
                usuarioId: NewUser.id,
                fecha: new Date(),
            },
        })

        console.log("Usuario creado exitosamente:", NewUser)
        return NextResponse.json({ message: "Usuario creado exitosamente", user: NewUser })
    } catch (error) {
        console.error("Error en el registro:", error)
        return NextResponse.json({ message: "Error interno del servidor" }, { status: 500 })
    }
}