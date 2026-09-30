/*
  Warnings:

  - You are about to drop the column `produto` on the `ProdutosQuimicos` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[nome]` on the table `ProdutosQuimicos` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `classeRisco` to the `ProdutosQuimicos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nome` to the `ProdutosQuimicos` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ProdutosQuimicos" DROP COLUMN "produto",
ADD COLUMN     "classeRisco" INTEGER NOT NULL,
ADD COLUMN     "descricao" TEXT,
ADD COLUMN     "nome" TEXT NOT NULL,
ADD COLUMN     "status" BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex
CREATE UNIQUE INDEX "ProdutosQuimicos_nome_key" ON "ProdutosQuimicos"("nome");
