CREATE TYPE "EstadoEquipo" AS ENUM ('OPERATIVO', 'MANTENIMIENTO', 'DANADO', 'RETIRADO');

CREATE TABLE "Equipo" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "marca" TEXT,
    "modelo" TEXT,
    "cantidad" INTEGER NOT NULL DEFAULT 1,
    "estado" "EstadoEquipo" NOT NULL DEFAULT 'OPERATIVO',
    "fechaCompra" TIMESTAMP(3),
    "ultimoMantenimiento" TIMESTAMP(3),
    "proximoMantenimiento" TIMESTAMP(3),
    "notas" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Equipo_pkey" PRIMARY KEY ("id")
);
