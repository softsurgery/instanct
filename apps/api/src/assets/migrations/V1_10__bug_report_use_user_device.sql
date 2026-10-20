-- Migration: V1_10__bug_report_use_user_device.sql

-- Drop foreign key to device-infos if it exists
SET @fk_name = (
    SELECT CONSTRAINT_NAME
    FROM information_schema.KEY_COLUMN_USAGE
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'bugs'
      AND COLUMN_NAME = 'deviceId'
      AND REFERENCED_TABLE_NAME = 'device-infos'
    LIMIT 1
);

SET @drop_fk_sql = IF(@fk_name IS NOT NULL, CONCAT('ALTER TABLE `bugs` DROP FOREIGN KEY `', @fk_name, '`'), 'SELECT 1');
PREPARE stmt FROM @drop_fk_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Drop userDeviceId fk and column if they exist from any intermediate migration
SET @temp_fk_name = (
    SELECT CONSTRAINT_NAME
    FROM information_schema.KEY_COLUMN_USAGE
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'bugs'
      AND COLUMN_NAME = 'userDeviceId'
      AND REFERENCED_TABLE_NAME IS NOT NULL
    LIMIT 1
);
SET @drop_temp_fk_sql = IF(@temp_fk_name IS NOT NULL, CONCAT('ALTER TABLE `bugs` DROP FOREIGN KEY `', @temp_fk_name, '`'), 'SELECT 1');
PREPARE stmt_temp_fk FROM @drop_temp_fk_sql;
EXECUTE stmt_temp_fk;
DEALLOCATE PREPARE stmt_temp_fk;
ALTER TABLE `bugs` DROP COLUMN IF EXISTS `userDeviceId`;

-- Ensure deviceId column exists with varchar(36)
ALTER TABLE `bugs` ADD COLUMN IF NOT EXISTS `deviceId` varchar(36) DEFAULT NULL;
ALTER TABLE `bugs` MODIFY COLUMN `deviceId` varchar(36) DEFAULT NULL;

-- Add foreign key to user_devices
SET @new_fk_name = (
    SELECT CONSTRAINT_NAME
    FROM information_schema.KEY_COLUMN_USAGE
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'bugs'
      AND COLUMN_NAME = 'deviceId'
      AND REFERENCED_TABLE_NAME = 'user_devices'
    LIMIT 1
);

SET @add_fk_sql = IF(@new_fk_name IS NULL, 'ALTER TABLE `bugs` ADD CONSTRAINT `FK_bugs_user_devices` FOREIGN KEY (`deviceId`) REFERENCES `user_devices` (`id`) ON DELETE SET NULL', 'SELECT 1');
PREPARE stmt_fk FROM @add_fk_sql;
EXECUTE stmt_fk;
DEALLOCATE PREPARE stmt_fk;
