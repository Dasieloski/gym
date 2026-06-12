-- CreateEnum Sexo (safe: IF NOT EXISTS)
DO $$ BEGIN
  CREATE TYPE "Sexo" AS ENUM ('MASCULINO', 'FEMENINO', 'OTRO');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- CreateTable Configuracion
CREATE TABLE IF NOT EXISTS "Configuracion" (
    "id" SERIAL NOT NULL,
    "clave" TEXT NOT NULL,
    "valor" TEXT NOT NULL,
    "descripcion" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Configuracion_pkey" PRIMARY KEY ("id")
);

-- CreateTable Meta
CREATE TABLE IF NOT EXISTS "Meta" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "tipo" TEXT NOT NULL DEFAULT 'PERSONALIZADA',
    "valorMeta" INTEGER NOT NULL,
    "descripcion" TEXT,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Meta_pkey" PRIMARY KEY ("id")
);

-- CreateTable Notificacion
CREATE TABLE IF NOT EXISTS "Notificacion" (
    "id" SERIAL NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "titulo" TEXT NOT NULL,
    "mensaje" TEXT NOT NULL,
    "tipo" TEXT NOT NULL DEFAULT 'INFO',
    "leida" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Notificacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable Rutina
CREATE TABLE IF NOT EXISTS "Rutina" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "clienteId" INTEGER NOT NULL,
    "creadorId" INTEGER NOT NULL,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Rutina_pkey" PRIMARY KEY ("id")
);

-- CreateTable Ejercicio
CREATE TABLE IF NOT EXISTS "Ejercicio" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "series" INTEGER NOT NULL DEFAULT 3,
    "repeticiones" INTEGER NOT NULL DEFAULT 10,
    "peso" DOUBLE PRECISION,
    "diaSemana" TEXT,
    "orden" INTEGER NOT NULL DEFAULT 0,
    "notas" TEXT,
    "rutinaId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Ejercicio_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "Configuracion_clave_key" ON "Configuracion"("clave");

-- AddForeignKey (safe: IF NOT EXISTS equivalent via exception handling)
DO $$ BEGIN
  ALTER TABLE "Notificacion" ADD CONSTRAINT "Notificacion_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "Rutina" ADD CONSTRAINT "Rutina_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "Rutina" ADD CONSTRAINT "Rutina_creadorId_fkey" FOREIGN KEY ("creadorId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "Ejercicio" ADD CONSTRAINT "Ejercicio_rutinaId_fkey" FOREIGN KEY ("rutinaId") REFERENCES "Rutina"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Add sexo column to Usuario if missing
ALTER TABLE "Usuario" ADD COLUMN IF NOT EXISTS "sexo" "Sexo";
