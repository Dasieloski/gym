-- CreateTable Punto
CREATE TABLE IF NOT EXISTS "Punto" (
    id SERIAL PRIMARY KEY,
    "usuarioId" INTEGER NOT NULL REFERENCES "Usuario"(id),
    puntos INTEGER NOT NULL DEFAULT 0,
    concepto TEXT NOT NULL,
    referencia TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "Punto_usuarioId_idx" ON "Punto"("usuarioId");

-- CreateTable Racha
CREATE TABLE IF NOT EXISTS "Racha" (
    id SERIAL PRIMARY KEY,
    "usuarioId" INTEGER NOT NULL UNIQUE REFERENCES "Usuario"(id),
    "rachaActual" INTEGER NOT NULL DEFAULT 0,
    "rachaMaxima" INTEGER NOT NULL DEFAULT 0,
    "ultimoCheckIn" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- CreateTable EncuestaNPS
CREATE TABLE IF NOT EXISTS "EncuestaNPS" (
    id SERIAL PRIMARY KEY,
    "usuarioId" INTEGER NOT NULL REFERENCES "Usuario"(id),
    puntuacion INTEGER NOT NULL,
    comentario TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "EncuestaNPS_usuarioId_idx" ON "EncuestaNPS"("usuarioId");

-- CreateTable RecompensaCumpleanios
CREATE TABLE IF NOT EXISTS "RecompensaCumpleanios" (
    id SERIAL PRIMARY KEY,
    "usuarioId" INTEGER NOT NULL UNIQUE REFERENCES "Usuario"(id),
    anio INTEGER NOT NULL,
    canjeada BOOLEAN NOT NULL DEFAULT false,
    "fechaCanje" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable Desafio
CREATE TABLE IF NOT EXISTS "Desafio" (
    id SERIAL PRIMARY KEY,
    nombre TEXT NOT NULL,
    descripcion TEXT,
    tipo TEXT NOT NULL DEFAULT 'ASISTENCIA',
    meta INTEGER NOT NULL,
    "diasDuracion" INTEGER NOT NULL DEFAULT 30,
    recompensa INTEGER NOT NULL DEFAULT 0,
    activo BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- CreateTable DesafioUsuario
CREATE TABLE IF NOT EXISTS "DesafioUsuario" (
    id SERIAL PRIMARY KEY,
    "desafioId" INTEGER NOT NULL REFERENCES "Desafio"(id),
    "usuarioId" INTEGER NOT NULL REFERENCES "Usuario"(id),
    progreso INTEGER NOT NULL DEFAULT 0,
    completado BOOLEAN NOT NULL DEFAULT false,
    "fechaCompletado" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE("desafioId", "usuarioId")
);

-- CreateTable NotificacionPush
CREATE TABLE IF NOT EXISTS "NotificacionPush" (
    id SERIAL PRIMARY KEY,
    "usuarioId" INTEGER NOT NULL REFERENCES "Usuario"(id),
    titulo TEXT NOT NULL,
    mensaje TEXT NOT NULL,
    leida BOOLEAN NOT NULL DEFAULT false,
    enviada BOOLEAN NOT NULL DEFAULT false,
    "fechaEnvio" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "NotificacionPush_usuarioId_leida_idx" ON "NotificacionPush"("usuarioId", leida);
