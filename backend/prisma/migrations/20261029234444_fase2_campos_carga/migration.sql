/*
  Warnings:

  - A unique constraint covering the columns `[cargaQuimicaId,tipoDocumento]` on the table `DocumentoCargas` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[cargaQuimicaId,step]` on the table `Movimentacoes` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "CargaQuimicas" ADD COLUMN     "dataEntrada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "origem" TEXT NOT NULL DEFAULT 'NAO INFORMADA',
ADD COLUMN     "responsavelTecnico" TEXT NOT NULL DEFAULT 'NAO INFORMADO';

-- AlterTable
ALTER TABLE "Movimentacoes" ADD COLUMN     "usuarioId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "DocumentoCargas_cargaQuimicaId_tipoDocumento_key" ON "DocumentoCargas"("cargaQuimicaId", "tipoDocumento");

-- CreateIndex
CREATE UNIQUE INDEX "Movimentacoes_cargaQuimicaId_step_key" ON "Movimentacoes"("cargaQuimicaId", "step");
