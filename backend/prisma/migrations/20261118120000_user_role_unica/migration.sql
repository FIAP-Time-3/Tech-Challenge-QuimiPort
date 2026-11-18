BEGIN;

ALTER TABLE "User" ADD COLUMN "role" TEXT;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1
        FROM "User"
        WHERE (
            cardinality("roles") = 1
            AND "roles"[array_lower("roles", 1)] IN (
                'ADMINISTRADOR', 'OPERADOR', 'DESPACHANTE'
            )
        ) IS NOT TRUE
    ) THEN
        RAISE EXCEPTION 'Cada usuário deve ter exatamente um perfil válido antes da migração';
    END IF;
END;
$$;

UPDATE "User"
SET "role" = "roles"[array_lower("roles", 1)];

ALTER TABLE "User" ALTER COLUMN "role" SET NOT NULL;
ALTER TABLE "User" DROP COLUMN "roles";

COMMIT;
