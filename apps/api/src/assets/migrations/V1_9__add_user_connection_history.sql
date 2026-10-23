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

-- Backfill only when legacy connection columns are still present on user_devices
SET @has_legacy = (
    SELECT COUNT(*)
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'user_devices'
      AND COLUMN_NAME IN ('ipAddress', 'latitude', 'longitude', 'location', 'lastSignInAt')
);

SET @backfill_sql = IF(
    @has_legacy > 0,
    'INSERT INTO `user_connection_history` (
        `id`, `userId`, `deviceId`, `source`, `ipAddress`, `latitude`, `longitude`, `location`, `createdAt`, `updatedAt`, `disconnectedAt`
     )
     SELECT
        UUID(),
        `userId`,
        `id`,
        ''migrated'',
        `ipAddress`,
        `latitude`,
        `longitude`,
        `location`,
        COALESCE(`lastSignInAt`, `createdAt`),
        COALESCE(`lastSignInAt`, `updatedAt`),
        NULL
     FROM `user_devices`
     WHERE `deletedAt` IS NULL
       AND (
           `ipAddress` IS NOT NULL
           OR `latitude` IS NOT NULL
           OR `longitude` IS NOT NULL
           OR `location` IS NOT NULL
           OR `lastSignInAt` IS NOT NULL
       )
       AND NOT EXISTS (
           SELECT 1
           FROM `user_connection_history` h
           WHERE h.`deviceId` = `user_devices`.`id`
             AND h.`source` = ''migrated''
       )',
    'SELECT 1'
);
PREPARE stmt_backfill FROM @backfill_sql;
EXECUTE stmt_backfill;
DEALLOCATE PREPARE stmt_backfill;

-- Remove connection-specific fields from user_devices (MySQL < 8.0.29 has no DROP COLUMN IF EXISTS)
SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'user_devices' AND COLUMN_NAME = 'ipAddress');
SET @sql = IF(@col_exists > 0, 'ALTER TABLE `user_devices` DROP COLUMN `ipAddress`', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'user_devices' AND COLUMN_NAME = 'latitude');
SET @sql = IF(@col_exists > 0, 'ALTER TABLE `user_devices` DROP COLUMN `latitude`', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'user_devices' AND COLUMN_NAME = 'longitude');
SET @sql = IF(@col_exists > 0, 'ALTER TABLE `user_devices` DROP COLUMN `longitude`', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'user_devices' AND COLUMN_NAME = 'location');
SET @sql = IF(@col_exists > 0, 'ALTER TABLE `user_devices` DROP COLUMN `location`', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'user_devices' AND COLUMN_NAME = 'lastSignInAt');
SET @sql = IF(@col_exists > 0, 'ALTER TABLE `user_devices` DROP COLUMN `lastSignInAt`', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @col_exists = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'user_devices' AND COLUMN_NAME = 'signInCount');
SET @sql = IF(@col_exists > 0, 'ALTER TABLE `user_devices` DROP COLUMN `signInCount`', 'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;
