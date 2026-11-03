/*
  Warnings:

  - You are about to drop the column `responsavelTecnico` on the `CargaQuimicas` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "CargaQuimicas" DROP COLUMN "responsavelTecnico",
ADD COLUMN     "responsavelTecnicoId" INTEGER;

-- AddForeignKey
ALTER TABLE "CargaQuimicas" ADD CONSTRAINT "CargaQuimicas_responsavelTecnicoId_fkey" FOREIGN KEY ("responsavelTecnicoId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
