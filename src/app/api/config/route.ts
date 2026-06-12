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
