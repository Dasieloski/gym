-- Add new columns to existing tables
ALTER TABLE "Usuario" ADD COLUMN IF NOT EXISTS "comoConocio" TEXT;
ALTER TABLE "Membresia" ADD COLUMN IF NOT EXISTS "congelada" BOOLEAN NOT NULL DEFAULT false;

-- Create new tables
CREATE TABLE IF NOT EXISTS "NotaCliente" (
    "id" SERIAL NOT NULL,
    "contenido" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "clienteId" INTEGER NOT NULL,
    "creadoPor" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "NotaCliente_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "CongelacionMembresia" (
    "id" SERIAL NOT NULL,
    "membresiaId" INTEGER NOT NULL,
    "fechaInicio" TIMESTAMP(3) NOT NULL,
    "fechaFin" TIMESTAMP(3) NOT NULL,
    "motivo" TEXT NOT NULL,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CongelacionMembresia_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Gasto" (
    "id" SERIAL NOT NULL,
    "categoria" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "monto" DOUBLE PRECISION NOT NULL,
    "moneda" TEXT NOT NULL DEFAULT 'CUP',
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metodoPago" TEXT,
    "comprobante" TEXT,
    "registradoPor" INTEGER NOT NULL,
    "recurrente" BOOLEAN NOT NULL DEFAULT false,
    "periodicidad" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Gasto_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Pago" (
    "id" SERIAL NOT NULL,
    "clienteId" INTEGER NOT NULL,
    "membresiaId" INTEGER,
    "monto" DOUBLE PRECISION NOT NULL,
    "moneda" TEXT NOT NULL DEFAULT 'CUP',
    "metodoPago" TEXT NOT NULL,
    "referencia" TEXT,
    "fechaPago" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notas" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Pago_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "CheckIn" (
    "id" SERIAL NOT NULL,
    "clienteId" INTEGER NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tipo" TEXT NOT NULL DEFAULT 'ENTRADA',
    "metodo" TEXT NOT NULL DEFAULT 'MANUAL',
    "pin" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CheckIn_pkey" PRIMARY KEY ("id")
);

-- Add foreign key constraints
ALTER TABLE "NotaCliente" ADD CONSTRAINT "NotaCliente_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CongelacionMembresia" ADD CONSTRAINT "CongelacionMembresia_membresiaId_fkey" FOREIGN KEY ("membresiaId") REFERENCES "Membresia"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Pago" ADD CONSTRAINT "Pago_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Pago" ADD CONSTRAINT "Pago_membresiaId_fkey" FOREIGN KEY ("membresiaId") REFERENCES "Membresia"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "CheckIn" ADD CONSTRAINT "CheckIn_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE;
