-- DropIndex
DROP INDEX `Account_userId_fkey` ON `account`;

-- DropIndex
DROP INDEX `Session_userId_fkey` ON `session`;

-- AlterTable
ALTER TABLE `account` MODIFY `refresh_token` VARCHAR(191) NULL,
    MODIFY `access_token` VARCHAR(191) NULL,
    MODIFY `id_token` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `devicereading` MODIFY `metadata` VARCHAR(191) NULL;
