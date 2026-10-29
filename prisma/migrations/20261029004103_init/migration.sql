-- CreateTable
CREATE TABLE `pessoas` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(150) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `papel` ENUM('SOLICITANTE', 'TECNICO') NOT NULL,
    `ativo` BOOLEAN NOT NULL DEFAULT true,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `pessoas_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tipos_problema` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(100) NOT NULL,
    `ativo` BOOLEAN NOT NULL DEFAULT true,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `tipos_problema_nome_key`(`nome`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `chamados` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `titulo` VARCHAR(100) NOT NULL,
    `descricao` TEXT NOT NULL,
    `prioridade` ENUM('BAIXA', 'MEDIA', 'ALTA', 'CRITICA') NOT NULL DEFAULT 'MEDIA',
    `status` ENUM('ABERTO', 'EM_ATENDIMENTO', 'RESOLVIDO', 'FECHADO', 'CANCELADO') NOT NULL DEFAULT 'ABERTO',
    `solicitanteId` INTEGER NOT NULL,
    `tecnicoId` INTEGER NULL,
    `tipoProblemaId` INTEGER NOT NULL,
    `resolvidoEm` DATETIME(3) NULL,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `atualizadoEm` DATETIME(3) NOT NULL,

    INDEX `chamados_status_idx`(`status`),
    INDEX `chamados_prioridade_idx`(`prioridade`),
    INDEX `chamados_tipoProblemaId_idx`(`tipoProblemaId`),
    INDEX `chamados_tecnicoId_status_idx`(`tecnicoId`, `status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `comentarios` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `texto` TEXT NOT NULL,
    `chamadoId` INTEGER NOT NULL,
    `autorId` INTEGER NOT NULL,
    `criadoEm` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `comentarios_chamadoId_idx`(`chamadoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `chamados` ADD CONSTRAINT `chamados_solicitanteId_fkey` FOREIGN KEY (`solicitanteId`) REFERENCES `pessoas`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `chamados` ADD CONSTRAINT `chamados_tecnicoId_fkey` FOREIGN KEY (`tecnicoId`) REFERENCES `pessoas`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `chamados` ADD CONSTRAINT `chamados_tipoProblemaId_fkey` FOREIGN KEY (`tipoProblemaId`) REFERENCES `tipos_problema`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `comentarios` ADD CONSTRAINT `comentarios_chamadoId_fkey` FOREIGN KEY (`chamadoId`) REFERENCES `chamados`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `comentarios` ADD CONSTRAINT `comentarios_autorId_fkey` FOREIGN KEY (`autorId`) REFERENCES `pessoas`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
