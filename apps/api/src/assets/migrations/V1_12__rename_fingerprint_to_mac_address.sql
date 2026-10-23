-- Migration: V1_12__rename_fingerprint_to_mac_address.sql
-- Idempotent: also ensures user_connection_history exists if an earlier
-- migration was marked applied without creating it.

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
    CONSTRAINT `FK_uch_user` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    CONSTRAINT `FK_uch_device` FOREIGN KEY (`deviceId`) REFERENCES `user_devices` (`id`) ON DELETE SET NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

-- Rename fingerprint -> macAddress only when needed
SET @has_fingerprint = (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'user_devices'
      AND COLUMN_NAME = 'fingerprint'
);
SET @has_mac = (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'user_devices'
      AND COLUMN_NAME = 'macAddress'
);

SET @rename_sql = IF(
    @has_fingerprint > 0 AND @has_mac = 0,
    'ALTER TABLE `user_devices` CHANGE COLUMN `fingerprint` `macAddress` varchar(255) NOT NULL',
    IF(
        @has_fingerprint = 0 AND @has_mac = 0,
        'ALTER TABLE `user_devices` ADD COLUMN `macAddress` varchar(255) NOT NULL DEFAULT ''''',
        'SELECT 1'
    )
);
PREPARE stmt FROM @rename_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Drop default if we added macAddress as a new column
SET @drop_default_sql = IF(
    @has_fingerprint = 0 AND @has_mac = 0,
    'ALTER TABLE `user_devices` ALTER COLUMN `macAddress` DROP DEFAULT',
    'SELECT 1'
);
PREPARE stmt_default FROM @drop_default_sql;
EXECUTE stmt_default;
DEALLOCATE PREPARE stmt_default;
