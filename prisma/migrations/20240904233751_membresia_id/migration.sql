/*
  Warnings:

  - A unique constraint covering the columns `[membresiaActualId]` on the table `Usuario` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Membresia_clienteId_key";

-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN     "membresiaActualId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_membresiaActualId_key" ON "Usuario"("membresiaActualId");

-- AddForeignKey
ALTER TABLE "Usuario" ADD CONSTRAINT "Usuario_membresiaActualId_fkey" FOREIGN KEY ("membresiaActualId") REFERENCES "Membresia"("id") ON DELETE SET NULL ON UPDATE CASCADE;
