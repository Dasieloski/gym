-- Add missing columns to Usuario table
ALTER TABLE "Usuario" ADD COLUMN IF NOT EXISTS "email" TEXT;
ALTER TABLE "Usuario" ADD COLUMN IF NOT EXISTS "instagram" TEXT;
ALTER TABLE "Usuario" ADD COLUMN IF NOT EXISTS "fechaNacimiento" TIMESTAMP(3);
