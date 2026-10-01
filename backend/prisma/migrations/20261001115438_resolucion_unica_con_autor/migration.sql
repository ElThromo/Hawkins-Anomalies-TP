/*
  Warnings:

  - A unique constraint covering the columns `[idReporte]` on the table `Resolucion` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `resolucion` ADD COLUMN `idUsuario` INTEGER NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Resolucion_idReporte_key` ON `Resolucion`(`idReporte`);

-- AddForeignKey
ALTER TABLE `Resolucion` ADD CONSTRAINT `Resolucion_idUsuario_fkey` FOREIGN KEY (`idUsuario`) REFERENCES `Usuario`(`idUsuario`) ON DELETE SET NULL ON UPDATE CASCADE;
