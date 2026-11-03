-- CreateTable
CREATE TABLE "CargaQuimicas" (
    "id" SERIAL NOT NULL,
    "produtoQuimicoId" INTEGER NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "unidadeMedida" TEXT NOT NULL,
    "destino" TEXT NOT NULL,
    "statusCarga" TEXT NOT NULL,
    "classeRiscoONU" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CargaQuimicas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Movimentacoes" (
    "id" SERIAL NOT NULL,
    "cargaQuimicaId" INTEGER NOT NULL,
    "step" INTEGER NOT NULL,
    "statusAnterior" TEXT NOT NULL,
    "notes" TEXT NOT NULL,
    "statusAtual" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Movimentacoes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DocumentoCargas" (
    "id" SERIAL NOT NULL,
    "cargaQuimicaId" INTEGER NOT NULL,
    "tipoDocumento" TEXT NOT NULL,
    "validado" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DocumentoCargas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Inspecoes" (
    "id" SERIAL NOT NULL,
    "cargaQuimicaId" INTEGER NOT NULL,
    "resultadoInspecao" TEXT NOT NULL,
    "observacoes" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Inspecoes_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CargaQuimicas" ADD CONSTRAINT "CargaQuimicas_produtoQuimicoId_fkey" FOREIGN KEY ("produtoQuimicoId") REFERENCES "ProdutosQuimicos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Movimentacoes" ADD CONSTRAINT "Movimentacoes_cargaQuimicaId_fkey" FOREIGN KEY ("cargaQuimicaId") REFERENCES "CargaQuimicas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DocumentoCargas" ADD CONSTRAINT "DocumentoCargas_cargaQuimicaId_fkey" FOREIGN KEY ("cargaQuimicaId") REFERENCES "CargaQuimicas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inspecoes" ADD CONSTRAINT "Inspecoes_cargaQuimicaId_fkey" FOREIGN KEY ("cargaQuimicaId") REFERENCES "CargaQuimicas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
