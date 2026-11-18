-- Migration: V1_17__repair_user_devices_and_log_event_enum.sql
-- Repairs schema drift in production caused by V1_9 version collision
-- (V1_9__add_user_connection_history.sql skipped when 1.9.0 was already applied)
-- and adds the missing BUG_UPDATE value to log.event enum.

-- 1. Ensure user_connection_history exists
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

-- 2. Backfill user_connection_history only when legacy connection columns are still present on user_devices
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

-- 3. Drop legacy connection-specific columns from user_devices if they still exist
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

-- 4. Add missing BUG_UPDATE value to log.event enum
ALTER TABLE `log`
MODIFY COLUMN `event` enum(
    'SIGNIN',
    'SIGNUP',
    'SIGNOUT',
    'CLIENT_SIGNIN',
    'CLIENT_SIGNUP',
    'USER_CREATE',
    'USER_UPDATE',
    'USER_DELETE',
    'USER_ACTIVATE',
    'USER_DEACTIVATE',
    'USER_APPROVE',
    'USER_DISAPPROVE',
    'USER_FOLLOW',
    'USER_UNFOLLOW',
    'USER_ADD_EXPERIENCE',
    'USER_UPDATE_EXPERIENCE',
    'USER_DELETE_EXPERIENCE',
    'USER_ADD_EDUCATION',
    'USER_UPDATE_EDUCATION',
    'USER_DELETE_EDUCATION',
    'USER_UPDATE_COVER',
    'ROLE_CREATE',
    'ROLE_UPDATE',
    'ROLE_DELETE',
    'ROLE_DUPLICATE',
    'DEVICE_INFO_CREATE',
    'DEVICE_INFO_DELETE',
    'BUG_CREATE',
    'BUG_UPDATE',
    'BUG_DELETE',
    'FEEDBACK_CREATE',
    'FEEDBACK_DELETE',
    'REF_TYPE_CREATE',
    'REF_TYPE_UPDATE',
    'REF_TYPE_DELETE',
    'REF_PARAM_CREATE',
    'REF_PARAM_UPDATE',
    'REF_PARAM_DELETE',
    'SESSION_START',
    'SESSION_UPDATE',
    'SESSION_END',
    'REQUEST_CREATED',
    'REQUEST_ACCEPTED',
    'REQUEST_REJECTED',
    'BOOKMARK_CREATED',
    'BOOKMARK_DELETED',
    'CONTENT_PAGE_CREATE',
    'CONTENT_PAGE_UPDATE',
    'CONTENT_PAGE_DELETE'
) DEFAULT NULL;
