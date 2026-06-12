import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET() {
    try {
        const configs = await prisma.configuracion.findMany()
        const configMap: Record<string, string> = {}
        configs.forEach((c) => {
            configMap[c.clave] = c.valor
        })
        return NextResponse.json(configMap)
    } catch (error) {
        console.error("Error al obtener configuración:", error)
        return NextResponse.json({ error: "Error al obtener configuración" }, { status: 500 })
    }
}

export async function PUT(request: Request) {
    try {
        const data = await request.json()
        const { clave, valor, descripcion } = data

        if (!clave || valor === undefined) {
            return NextResponse.json({ error: "Clave y valor son requeridos" }, { status: 400 })
        }

        const config = await prisma.configuracion.upsert({
            where: { clave },
            update: { valor, descripcion },
            create: { clave, valor, descripcion }
        })

        return NextResponse.json(config)
    } catch (error) {
        console.error("Error al guardar configuración:", error)
        return NextResponse.json({ error: "Error al guardar configuración" }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const data = await request.json()
        const { configs } = data

        if (!Array.isArray(configs)) {
            return NextResponse.json({ error: "Configs debe ser un array" }, { status: 400 })
        }

        const results = []
        for (const item of configs) {
            const config = await prisma.configuracion.upsert({
                where: { clave: item.clave },
                update: { valor: item.valor, descripcion: item.descripcion },
                create: { clave: item.clave, valor: item.valor, descripcion: item.descripcion }
            })
            results.push(config)
        }

        return NextResponse.json(results)
    } catch (error) {
        console.error("Error al guardar configuraciones:", error)
        return NextResponse.json({ error: "Error al guardar configuraciones" }, { status: 500 })
    }
}