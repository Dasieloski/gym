   -- prisma/migrations/20240905023110_add_registro_peso/migration.sql

   CREATE TABLE "RegistroPeso" (
       "id" SERIAL PRIMARY KEY,
       "fecha" TIMESTAMP NOT NULL DEFAULT now(),
       "peso" FLOAT NOT NULL,
       "altura" FLOAT NOT NULL,
       "imc" FLOAT NOT NULL,
       "grasaCorporal" FLOAT NOT NULL,
       "cuello" FLOAT NOT NULL,
       "pecho" FLOAT NOT NULL,
       "brazo" FLOAT NOT NULL,
       "cintura" FLOAT NOT NULL,
       "cadera" FLOAT NOT NULL,
       "muslo" FLOAT NOT NULL,
       "usuarioId" INTEGER NOT NULL REFERENCES "Usuario"("id") ON DELETE CASCADE ON UPDATE CASCADE,
       "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
       "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
   );