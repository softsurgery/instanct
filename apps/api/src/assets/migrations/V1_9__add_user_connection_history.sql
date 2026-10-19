-- Migration: V1_9__add_user_connection_history.sql

CREATE TABLE IF NOT EXISTS `user_connection_history` (
    `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    `deletedAt` datetime(6) DEFAULT NULL,
    `isDeletionRestricted` tinyint NOT NULL DEFAULT '0',
    `id` varchar(36) NOT NULL,
    `userId` varchar(255) NOT NULL,
    `deviceId` varchar(36) DEFAULT NULL,
    `source` varchar(50) NOT NULL DEFAULT 'mobile',
    `socketId` varchar(255) DEFAULT NULL,
    `ipAddress` varchar(255) DEFAULT NULL,
    `latitude` double DEFAULT NULL,
    `longitude` double DEFAULT NULL,
    `location` varchar(255) DEFAULT NULL,
    `disconnectedAt` timestamp NULL DEFAULT NULL,
    PRIMARY KEY (`id`),
    KEY `IDX_0bd57f7255ca793112da28184d` (`userId`, `createdAt`),
    KEY `FK_ee56c2c39c1fd772656b6b3e701` (`deviceId`),
    CONSTRAINT `FK_00fd4088d7f47b0a539d0f9517d` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    CONSTRAINT `FK_ee56c2c39c1fd772656b6b3e701` FOREIGN KEY (`deviceId`) REFERENCES `user_devices` (`id`) ON DELETE SET NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

-- Remove connection-specific fields from user_devices as they are now tracked in user_connection_history
ALTER TABLE `user_devices` DROP COLUMN IF EXISTS `ipAddress`;
ALTER TABLE `user_devices` DROP COLUMN IF EXISTS `latitude`;
ALTER TABLE `user_devices` DROP COLUMN IF EXISTS `longitude`;
ALTER TABLE `user_devices` DROP COLUMN IF EXISTS `location`;
ALTER TABLE `user_devices` DROP COLUMN IF EXISTS `lastSignInAt`;
ALTER TABLE `user_devices` DROP COLUMN IF EXISTS `signInCount`;

