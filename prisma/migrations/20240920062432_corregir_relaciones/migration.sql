-- DropForeignKey
ALTER TABLE "Reserva" DROP CONSTRAINT "Reserva_entrenadorId_fkey_2";

-- AlterTable
ALTER TABLE "Reserva" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

-- RenameForeignKey
ALTER TABLE "Historial" RENAME CONSTRAINT "Historial_entrenadorId_fkey" TO "Historial_EntrenadorId_fkey";

-- RenameForeignKey
ALTER TABLE "Historial" RENAME CONSTRAINT "Historial_membresiaId_fkey" TO "Historial_MembresiaId_fkey";

-- RenameForeignKey
ALTER TABLE "Historial" RENAME CONSTRAINT "Historial_reservaId_fkey" TO "Historial_ReservaId_fkey";

-- RenameForeignKey
ALTER TABLE "Historial" RENAME CONSTRAINT "Historial_usuarioId_fkey" TO "Historial_UsuarioId_fkey";

-- RenameForeignKey
ALTER TABLE "Reserva" RENAME CONSTRAINT "Reserva_clienteId_fkey" TO "Reserva_ClienteId_fkey";

-- RenameForeignKey
ALTER TABLE "Reserva" RENAME CONSTRAINT "Reserva_entrenadorId_fkey_1" TO "Reserva_EntrenadorId_fkey";
