-- AlterTable - Change Float to Decimal for financial fields
ALTER TABLE "Gasto" ALTER COLUMN "monto" TYPE DECIMAL(10,2) USING "monto"::DECIMAL(10,2);
ALTER TABLE "Pago" ALTER COLUMN "monto" TYPE DECIMAL(10,2) USING "monto"::DECIMAL(10,2);
ALTER TABLE "PagoEntrenador" ALTER COLUMN "monto" TYPE DECIMAL(10,2) USING "monto"::DECIMAL(10,2);