const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
  await p.$executeRawUnsafe(
    'CREATE TABLE IF NOT EXISTS "PagoEntrenador" ("id" SERIAL PRIMARY KEY, "entrenadorId" INTEGER NOT NULL REFERENCES "Usuario"("id"), "clienteId" INTEGER NOT NULL REFERENCES "Usuario"("id"), "monto" DOUBLE PRECISION NOT NULL, "moneda" VARCHAR(10) DEFAULT \'CUP\', "metodoPago" VARCHAR(50) DEFAULT \'EFECTIVO\', "fechaPago" TIMESTAMP DEFAULT CURRENT_TIMESTAMP, "notas" TEXT, "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP, "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP)'
  );
  console.log('Table created successfully');
}

main().catch(e => console.error('Error:', e.message)).finally(() => p.$disconnect());
