-- Create device table
CREATE TABLE IF NOT EXISTS `device` (
  `id` VARCHAR(191) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `type` VARCHAR(191) NOT NULL,
  `location` VARCHAR(191) NOT NULL,
  `description` VARCHAR(191) NULL,
  `isActive` BOOLEAN NOT NULL DEFAULT true,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `Device_name_key`(`name`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create devicereading table
CREATE TABLE IF NOT EXISTS `devicereading` (
  `id` VARCHAR(191) NOT NULL,
  `deviceId` VARCHAR(191) NOT NULL,
  `temperature` DOUBLE PRECISION NULL,
  `humidity` DOUBLE PRECISION NULL,
  `pressure` DOUBLE PRECISION NULL,
  `motion` BOOLEAN NULL,
  `light` DOUBLE PRECISION NULL,
  `metadata` TEXT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci; 