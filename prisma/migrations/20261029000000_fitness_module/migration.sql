-- CreateEnum
CREATE TYPE "RutinaTipo" AS ENUM ('PERSONAL', 'ASIGNADA', 'PLANTILLA');

-- CreateEnum
CREATE TYPE "TipoMedicion" AS ENUM ('PESO_REPS', 'SOLO_REPS', 'TIEMPO');

-- CreateEnum
CREATE TYPE "EstadoSesion" AS ENUM ('EN_CURSO', 'COMPLETADA', 'CANCELADA');

-- CreateEnum
CREATE TYPE "TipoRecord" AS ENUM ('PESO_MAXIMO', 'MAX_REPS', 'MAX_DURACION');

-- AlterTable
ALTER TABLE "Rutina" ADD COLUMN     "plantillaOrigenId" INTEGER,
ADD COLUMN     "tipo" "RutinaTipo" NOT NULL DEFAULT 'ASIGNADA';

-- AlterTable
ALTER TABLE "Ejercicio" ADD COLUMN     "catalogoId" INTEGER,
ADD COLUMN     "descansoSeg" INTEGER,
ADD COLUMN     "duracionSeg" INTEGER;

-- CreateTable
CREATE TABLE "CatalogoEjercicio" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "instrucciones" TEXT[],
    "musculoPrincipal" TEXT NOT NULL,
    "musculosSecundarios" TEXT[],
    "equipamiento" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "nivel" TEXT NOT NULL DEFAULT 'PRINCIPIANTE',
    "tipoMedicion" "TipoMedicion" NOT NULL DEFAULT 'PESO_REPS',
    "mediaUrl" TEXT,
    "mediaLicencia" TEXT,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "creadoPorId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CatalogoEjercicio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SesionEntrenamiento" (
    "id" SERIAL NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "rutinaId" INTEGER,
    "rutinaNombre" TEXT NOT NULL,
    "diaSemana" TEXT,
    "estado" "EstadoSesion" NOT NULL DEFAULT 'EN_CURSO',
    "claveCliente" TEXT NOT NULL,
    "iniciadaAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finalizadaAt" TIMESTAMP(3),
    "duracionSeg" INTEGER,
    "totalSeries" INTEGER,
    "volumenKg" DOUBLE PRECISION,
    "notas" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SesionEntrenamiento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SesionEjercicio" (
    "id" SERIAL NOT NULL,
    "sesionId" INTEGER NOT NULL,
    "orden" INTEGER NOT NULL,
    "catalogoId" INTEGER,
    "nombre" TEXT NOT NULL,
    "tipoMedicion" "TipoMedicion" NOT NULL DEFAULT 'PESO_REPS',
    "seriesObjetivo" INTEGER NOT NULL DEFAULT 3,
    "repsObjetivo" INTEGER,
    "pesoObjetivo" DOUBLE PRECISION,
    "duracionObjetivoSeg" INTEGER,
    "descansoSeg" INTEGER,
    "notas" TEXT,

    CONSTRAINT "SesionEjercicio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SerieRegistrada" (
    "id" SERIAL NOT NULL,
    "sesionEjercicioId" INTEGER NOT NULL,
    "numero" INTEGER NOT NULL,
    "peso" DOUBLE PRECISION,
    "repeticiones" INTEGER,
    "duracionSeg" INTEGER,
    "completada" BOOLEAN NOT NULL DEFAULT false,
    "esRecord" BOOLEAN NOT NULL DEFAULT false,
    "completadaAt" TIMESTAMP(3),

    CONSTRAINT "SerieRegistrada_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecordPersonal" (
    "id" SERIAL NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "catalogoId" INTEGER NOT NULL,
    "tipo" "TipoRecord" NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,
    "reps" INTEGER,
    "sesionId" INTEGER,
    "logradoAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RecordPersonal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CatalogoEjercicio_slug_key" ON "CatalogoEjercicio"("slug");

-- CreateIndex
CREATE INDEX "CatalogoEjercicio_musculoPrincipal_idx" ON "CatalogoEjercicio"("musculoPrincipal");

-- CreateIndex
CREATE INDEX "CatalogoEjercicio_equipamiento_idx" ON "CatalogoEjercicio"("equipamiento");

-- CreateIndex
CREATE INDEX "CatalogoEjercicio_categoria_idx" ON "CatalogoEjercicio"("categoria");

-- CreateIndex
CREATE INDEX "SesionEntrenamiento_usuarioId_estado_iniciadaAt_idx" ON "SesionEntrenamiento"("usuarioId", "estado", "iniciadaAt");

-- CreateIndex
CREATE UNIQUE INDEX "SesionEntrenamiento_usuarioId_claveCliente_key" ON "SesionEntrenamiento"("usuarioId", "claveCliente");

-- CreateIndex
CREATE INDEX "SesionEjercicio_catalogoId_idx" ON "SesionEjercicio"("catalogoId");

-- CreateIndex
CREATE UNIQUE INDEX "SesionEjercicio_sesionId_orden_key" ON "SesionEjercicio"("sesionId", "orden");

-- CreateIndex
CREATE UNIQUE INDEX "SerieRegistrada_sesionEjercicioId_numero_key" ON "SerieRegistrada"("sesionEjercicioId", "numero");

-- CreateIndex
CREATE INDEX "RecordPersonal_usuarioId_logradoAt_idx" ON "RecordPersonal"("usuarioId", "logradoAt");

-- CreateIndex
CREATE UNIQUE INDEX "RecordPersonal_usuarioId_catalogoId_tipo_key" ON "RecordPersonal"("usuarioId", "catalogoId", "tipo");

-- CreateIndex
CREATE INDEX "Rutina_clienteId_activa_idx" ON "Rutina"("clienteId", "activa");

-- CreateIndex
CREATE INDEX "Rutina_creadorId_tipo_idx" ON "Rutina"("creadorId", "tipo");

-- CreateIndex
CREATE INDEX "Ejercicio_rutinaId_orden_idx" ON "Ejercicio"("rutinaId", "orden");

-- CreateIndex
CREATE INDEX "Ejercicio_catalogoId_idx" ON "Ejercicio"("catalogoId");

-- AddForeignKey
ALTER TABLE "Rutina" ADD CONSTRAINT "Rutina_plantillaOrigenId_fkey" FOREIGN KEY ("plantillaOrigenId") REFERENCES "Rutina"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ejercicio" ADD CONSTRAINT "Ejercicio_catalogoId_fkey" FOREIGN KEY ("catalogoId") REFERENCES "CatalogoEjercicio"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SesionEntrenamiento" ADD CONSTRAINT "SesionEntrenamiento_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SesionEntrenamiento" ADD CONSTRAINT "SesionEntrenamiento_rutinaId_fkey" FOREIGN KEY ("rutinaId") REFERENCES "Rutina"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SesionEjercicio" ADD CONSTRAINT "SesionEjercicio_sesionId_fkey" FOREIGN KEY ("sesionId") REFERENCES "SesionEntrenamiento"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SesionEjercicio" ADD CONSTRAINT "SesionEjercicio_catalogoId_fkey" FOREIGN KEY ("catalogoId") REFERENCES "CatalogoEjercicio"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SerieRegistrada" ADD CONSTRAINT "SerieRegistrada_sesionEjercicioId_fkey" FOREIGN KEY ("sesionEjercicioId") REFERENCES "SesionEjercicio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecordPersonal" ADD CONSTRAINT "RecordPersonal_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecordPersonal" ADD CONSTRAINT "RecordPersonal_catalogoId_fkey" FOREIGN KEY ("catalogoId") REFERENCES "CatalogoEjercicio"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecordPersonal" ADD CONSTRAINT "RecordPersonal_sesionId_fkey" FOREIGN KEY ("sesionId") REFERENCES "SesionEntrenamiento"("id") ON DELETE SET NULL ON UPDATE CASCADE;


-- Un usuario solo puede tener una sesión de entrenamiento en curso (índice parcial: Prisma no lo modela).
CREATE UNIQUE INDEX "SesionEntrenamiento_un_en_curso_por_usuario" ON "SesionEntrenamiento"("usuarioId") WHERE "estado" = 'EN_CURSO';
