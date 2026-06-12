-- AlterTable
ALTER TABLE "Usuario" ADD COLUMN     "visitasEsteMes" INTEGER NOT NULL DEFAULT 0;

-- RenameForeignKey
ALTER TABLE "Reserva" RENAME CONSTRAINT "Reserva_entrenadorId_fkey" TO "Reserva_entrenadorId_fkey_2";

-- RenameForeignKey
ALTER TABLE "Reserva" RENAME CONSTRAINT "Reserva_entrenadorRelacion_fkey" TO "Reserva_entrenadorId_fkey_1";
