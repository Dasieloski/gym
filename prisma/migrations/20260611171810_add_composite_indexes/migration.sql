-- Create composite indexes for query performance
CREATE INDEX IF NOT EXISTS "CheckIn_clienteId_fecha_idx" ON "CheckIn"("clienteId", "fecha");
CREATE INDEX IF NOT EXISTS "RegistroPeso_usuarioId_fecha_idx" ON "RegistroPeso"("usuarioId", "fecha");