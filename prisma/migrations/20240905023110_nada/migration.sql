/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Entrenador` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Entrenador` table. All the data in the column will be lost.
  - You are about to drop the column `horarioId` on the `Historial` table. All the data in the column will be lost.
  - You are about to drop the column `horarioId` on the `Reserva` table. All the data in the column will be lost.
  - You are about to drop the column `entrenadorId` on the `Usuario` table. All the data in the column will be lost.
  - You are about to drop the `Horario` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[usuarioId]` on the table `Entrenador` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `usuarioId` to the `Entrenador` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fecha` to the `Reserva` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fechaHora` to the `Reserva` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Historial" DROP CONSTRAINT "Historial_horarioId_fkey";

-- DropForeignKey
ALTER TABLE "Horario" DROP CONSTRAINT "Horario_entrenadorId_fkey";

-- DropForeignKey
ALTER TABLE "Reserva" DROP CONSTRAINT "Reserva_entrenadorId_fkey";

-- DropForeignKey
ALTER TABLE "Reserva" DROP CONSTRAINT "Reserva_horarioId_fkey";

-- DropForeignKey
ALTER TABLE "Usuario" DROP CONSTRAINT "Usuario_entrenadorId_fkey";

-- AlterTable
ALTER TABLE "Entrenador" DROP COLUMN "createdAt",
DROP COLUMN "updatedAt",
ADD COLUMN     "usuarioId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Historial" DROP COLUMN "horarioId";

-- AlterTable
ALTER TABLE "Reserva" DROP COLUMN "horarioId",
ADD COLUMN     "fecha" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "fechaHora" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "entrenadorId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Usuario" DROP COLUMN "entrenadorId",
ADD COLUMN     "entrenadorAsignadoId" INTEGER;

-- DropTable
DROP TABLE "Horario";

-- CreateIndex
CREATE UNIQUE INDEX "Entrenador_usuarioId_key" ON "Entrenador"("usuarioId");

-- AddForeignKey
ALTER TABLE "Usuario" ADD CONSTRAINT "Usuario_entrenadorAsignadoId_fkey" FOREIGN KEY ("entrenadorAsignadoId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Entrenador" ADD CONSTRAINT "Entrenador_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reserva" ADD CONSTRAINT "Reserva_entrenadorId_fkey" FOREIGN KEY ("entrenadorId") REFERENCES "Usuario"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reserva" ADD CONSTRAINT "Reserva_entrenadorRelacion_fkey" FOREIGN KEY ("entrenadorId") REFERENCES "Entrenador"("id") ON DELETE SET NULL ON UPDATE CASCADE;
