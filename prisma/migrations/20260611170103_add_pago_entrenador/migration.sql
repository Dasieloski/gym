-- CreateTable
CREATE TABLE "PagoEntrenador" (
    "id" SERIAL NOT NULL,
    "entrenadorId" INTEGER NOT NULL,
    "clienteId" INTEGER NOT NULL,
    "monto" DOUBLE PRECISION NOT NULL,
    "moneda" VARCHAR(10) NOT NULL DEFAULT 'CUP',
    "metodoPago" VARCHAR(50) NOT NULL DEFAULT 'EFECTIVO',
    "fechaPago" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notas" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PagoEntrenador_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PagoEntrenador" ADD CONSTRAINT "PagoEntrenador_entrenadorId_fkey" FOREIGN KEY ("entrenadorId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PagoEntrenador" ADD CONSTRAINT "PagoEntrenador_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX "PagoEntrenador_entrenadorId_fechaPago_idx" ON "PagoEntrenador"("entrenadorId", "fechaPago");
CREATE INDEX "PagoEntrenador_clienteId_fechaPago_idx" ON "PagoEntrenador"("clienteId", "fechaPago");