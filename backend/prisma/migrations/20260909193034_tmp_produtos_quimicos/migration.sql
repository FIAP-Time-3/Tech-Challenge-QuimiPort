-- CreateTable
CREATE TABLE "ProdutosQuimicos" (
    "id" SERIAL NOT NULL,
    "produto" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProdutosQuimicos_pkey" PRIMARY KEY ("id")
);
