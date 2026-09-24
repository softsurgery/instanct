-- =============================================================================
-- Migration: V1_1__init_schema.sql
-- Description: Initial database schema and baseline seeders for Instanct Production
-- =============================================================================

SET NAMES utf8mb4;

SET @OLD_UNIQUE_CHECKS = @@UNIQUE_CHECKS, UNIQUE_CHECKS = 0;

SET
    @OLD_FOREIGN_KEY_CHECKS = @@FOREIGN_KEY_CHECKS,
    FOREIGN_KEY_CHECKS = 0;

SET @OLD_SQL_MODE = @@SQL_MODE, SQL_MODE = 'NO_AUTO_VALUE_ON_ZERO';

-- =============================================================================
-- SECTION 1: TABLE DEFINITIONS (DDL)
-- =============================================================================

-- --------------------------------------------------------
-- Table structure for `bugs`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `bugs` (
    `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    `deletedAt` datetime(6) DEFAULT NULL,
    `isDeletionRestricted` tinyint NOT NULL DEFAULT '0',
    `id` int NOT NULL AUTO_INCREMENT,
    `variant` enum(
        'Crash',
        'UI Issue',
        'Performance Issue',
        'Feature Not Working',
        'Other'
    ) NOT NULL,
    `title` varchar(255) NOT NULL,
    `description` text NOT NULL,
    `deviceId` int DEFAULT NULL,
    `userId` varchar(255) NOT NULL,
    PRIMARY KEY (`id`),
    KEY `FK_4d27d4b86accd8af3f35daad8fd` (`deviceId`),
    KEY `FK_8618e646642c534f54f153fdb9e` (`userId`),
    CONSTRAINT `FK_4d27d4b86accd8af3f35daad8fd` FOREIGN KEY (`deviceId`) REFERENCES `device-infos` (`id`) ON DELETE CASCADE,
    CONSTRAINT `FK_8618e646642c534f54f153fdb9e` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

-- --------------------------------------------------------
-- Table structure for `configuration-namespace`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `configuration-namespace` (
    `id` varchar(36) NOT NULL,
    `name` varchar(255) DEFAULT NULL,
    `description` varchar(255) DEFAULT NULL,
    `userId` varchar(255) DEFAULT NULL,
    PRIMARY KEY (`id`),
    KEY `FK_4c0b737780dd31907237001c0fa` (`userId`),
    CONSTRAINT `FK_4c0b737780dd31907237001c0fa` FOREIGN KEY (`userId`) REFERENCES `users` (`id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

-- --------------------------------------------------------
-- Table structure for `configuration-param`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `configuration-param` (
    `id` int NOT NULL AUTO_INCREMENT,
    `name` varchar(255) NOT NULL,
    `description` varchar(255) DEFAULT NULL,
    `namespaceId` varchar(255) NOT NULL,
    `variant` enum(
        'string',
        'number',
        'boolean',
        'select',
        'list'
    ) NOT NULL DEFAULT 'string',
    `value` text,
    `options` json DEFAULT NULL,
    `schema` json DEFAULT NULL,
    PRIMARY KEY (`id`),
    KEY `FK_930e3128e80db91673edd2c1a2a` (`namespaceId`),
    CONSTRAINT `FK_930e3128e80db91673edd2c1a2a` FOREIGN KEY (`namespaceId`) REFERENCES `configuration-namespace` (`id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

-- --------------------------------------------------------
-- Table structure for `content-page`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `content-page` (
    `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    `deletedAt` datetime(6) DEFAULT NULL,
    `isDeletionRestricted` tinyint NOT NULL DEFAULT '0',
    `id` varchar(36) NOT NULL,
    `slug` varchar(64) NOT NULL,
    `title` varchar(255) NOT NULL,
    `subtitle` varchar(512) DEFAULT NULL,
    `body` text NOT NULL,
    `locale` varchar(8) NOT NULL DEFAULT 'fr',
    PRIMARY KEY (`id`),
    UNIQUE KEY `IDX_9e9747ec45cdbda6807766e89a` (`slug`, `locale`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

-- --------------------------------------------------------
-- Table structure for `conversation_reports`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `conversation_reports` (
    `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    `deletedAt` datetime(6) DEFAULT NULL,
    `isDeletionRestricted` tinyint NOT NULL DEFAULT '0',
    `id` int NOT NULL AUTO_INCREMENT,
    `conversationId` int NOT NULL,
    `userId` varchar(255) NOT NULL,
    `reportedUserId` varchar(255) DEFAULT NULL,
    `reason` enum(
        'Spam',
        'Harassment',
        'Inappropriate Content',
        'Scam or Fraud',
        'Other'
    ) NOT NULL,
    `description` text NOT NULL,
    PRIMARY KEY (`id`),
    KEY `FK_d2991c2d120c7b2b46c60ec6a7a` (`conversationId`),
    KEY `FK_57f90aca7e15f646d4376bd1d17` (`userId`),
    KEY `FK_5697ec9b283e46fc4563100b0b4` (`reportedUserId`),
    CONSTRAINT `FK_5697ec9b283e46fc4563100b0b4` FOREIGN KEY (`reportedUserId`) REFERENCES `users` (`id`) ON DELETE SET NULL,
    CONSTRAINT `FK_57f90aca7e15f646d4376bd1d17` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    CONSTRAINT `FK_d2991c2d120c7b2b46c60ec6a7a` FOREIGN KEY (`conversationId`) REFERENCES `conversations` (`id`) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

-- --------------------------------------------------------
-- Table structure for `conversation_users`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `conversation_users` (
    `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    `deletedAt` datetime(6) DEFAULT NULL,
    `isDeletionRestricted` tinyint NOT NULL DEFAULT '0',
    `id` int NOT NULL AUTO_INCREMENT,
    `userId` varchar(255) NOT NULL,
    `conversationId` int NOT NULL,
    `lastCheck` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (`id`),
    KEY `FK_778f4a45bab4db510a46a72cdb1` (`userId`),
    KEY `FK_2a1d82305fccfcd4236d7e9b190` (`conversationId`),
    CONSTRAINT `FK_2a1d82305fccfcd4236d7e9b190` FOREIGN KEY (`conversationId`) REFERENCES `conversations` (`id`) ON DELETE CASCADE,
    CONSTRAINT `FK_778f4a45bab4db510a46a72cdb1` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

-- --------------------------------------------------------
-- Table structure for `conversations`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `conversations` (
    `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    `deletedAt` datetime(6) DEFAULT NULL,
    `isDeletionRestricted` tinyint NOT NULL DEFAULT '0',
    `id` int NOT NULL AUTO_INCREMENT,
    `lastMessageId` int DEFAULT NULL,
    `participantsIdentifiers` text,
    `locked` tinyint NOT NULL DEFAULT '0',
    PRIMARY KEY (`id`),
    UNIQUE KEY `REL_c6e63680bca6085833f396ac1f` (`lastMessageId`),
    CONSTRAINT `FK_c6e63680bca6085833f396ac1fa` FOREIGN KEY (`lastMessageId`) REFERENCES `messages` (`id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

-- --------------------------------------------------------
-- Table structure for `device-infos`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `device-infos` (
    `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    `deletedAt` datetime(6) DEFAULT NULL,
    `isDeletionRestricted` tinyint NOT NULL DEFAULT '0',
    `id` int NOT NULL AUTO_INCREMENT,
    `model` varchar(255) DEFAULT NULL,
    `platform` varchar(255) DEFAULT NULL,
    `version` varchar(255) DEFAULT NULL,
    `manufacturer` varchar(255) DEFAULT NULL,
    PRIMARY KEY (`id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

-- --------------------------------------------------------
-- Table structure for `educations`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `educations` (
    `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    `deletedAt` datetime(6) DEFAULT NULL,
    `isDeletionRestricted` tinyint NOT NULL DEFAULT '0',
    `id` int NOT NULL AUTO_INCREMENT,
    `title` varchar(255) NOT NULL,
    `startDate` datetime DEFAULT NULL,
    `endDate` datetime DEFAULT NULL,
    `institution` varchar(255) NOT NULL,
    `description` text,
    `userId` varchar(255) NOT NULL,
    PRIMARY KEY (`id`),
    KEY `FK_86e26478ad7a3d8543cfb922358` (`userId`),
    CONSTRAINT `FK_86e26478ad7a3d8543cfb922358` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

-- --------------------------------------------------------
-- Table structure for `experiences`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `experiences` (
    `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    `deletedAt` datetime(6) DEFAULT NULL,
    `isDeletionRestricted` tinyint NOT NULL DEFAULT '0',
    `id` int NOT NULL AUTO_INCREMENT,
    `title` varchar(255) NOT NULL,
    `startDate` datetime NOT NULL,
    `endDate` datetime DEFAULT NULL,
    `company` varchar(255) NOT NULL,
    `location` varchar(255) DEFAULT NULL,
    `workType` varchar(255) NOT NULL,
    `locationType` varchar(255) NOT NULL,
    `description` text,
    `userId` varchar(255) NOT NULL,
    PRIMARY KEY (`id`),
    KEY `FK_bb3ad7f8190c033791e9f1af1ea` (`userId`),
    CONSTRAINT `FK_bb3ad7f8190c033791e9f1af1ea` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

-- --------------------------------------------------------
-- Table structure for `feedback`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `feedback` (
    `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    `deletedAt` datetime(6) DEFAULT NULL,
    `isDeletionRestricted` tinyint NOT NULL DEFAULT '0',
    `id` int NOT NULL AUTO_INCREMENT,
    `message` text,
    `category` enum(
        'General Feedback',
        'Feature Request',
        'Other'
    ) NOT NULL,
    `rating` int DEFAULT NULL,
    `deviceId` int NOT NULL,
    `userId` varchar(255) NOT NULL,
    PRIMARY KEY (`id`),
    KEY `FK_1927d990407e091b1b45add4c13` (`deviceId`),
    KEY `FK_4a39e6ac0cecdf18307a365cf3c` (`userId`),
    CONSTRAINT `FK_1927d990407e091b1b45add4c13` FOREIGN KEY (`deviceId`) REFERENCES `device-infos` (`id`) ON DELETE CASCADE,
    CONSTRAINT `FK_4a39e6ac0cecdf18307a365cf3c` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

-- --------------------------------------------------------
-- Table structure for `follows`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `follows` (
    `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    `deletedAt` datetime(6) DEFAULT NULL,
    `isDeletionRestricted` tinyint NOT NULL DEFAULT '0',
    `id` int NOT NULL AUTO_INCREMENT,
    `followerId` varchar(255) NOT NULL,
    `followingId` varchar(255) NOT NULL,
    PRIMARY KEY (`id`),
    KEY `FK_fdb91868b03a2040db408a53331` (`followerId`),
    KEY `FK_ef463dd9a2ce0d673350e36e0fb` (`followingId`),
    CONSTRAINT `FK_ef463dd9a2ce0d673350e36e0fb` FOREIGN KEY (`followingId`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    CONSTRAINT `FK_fdb91868b03a2040db408a53331` FOREIGN KEY (`followerId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

-- --------------------------------------------------------
-- Table structure for `geolocations`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `geolocations` (
    `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    `deletedAt` datetime(6) DEFAULT NULL,
    `isDeletionRestricted` tinyint NOT NULL DEFAULT '0',
    `id` int NOT NULL AUTO_INCREMENT,
    `latitude` double DEFAULT NULL,
    `longitude` double DEFAULT NULL,
    `userId` varchar(255) NOT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `IDX_ef002e16f5814d6ff44655bac9` (`userId`),
    KEY `IDX_fa1e66fc58596f20f418920ff4` (`latitude`, `longitude`),
    CONSTRAINT `FK_ef002e16f5814d6ff44655bac91` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

-- --------------------------------------------------------
-- Table structure for `log`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `log` (
    `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    `deletedAt` datetime(6) DEFAULT NULL,
    `isDeletionRestricted` tinyint NOT NULL DEFAULT '0',
    `id` int NOT NULL AUTO_INCREMENT,
    `event` enum(
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
    ) DEFAULT NULL,
    `api` varchar(255) DEFAULT NULL,
    `method` varchar(255) DEFAULT NULL,
    `userId` varchar(255) DEFAULT NULL,
    `logInfo` json DEFAULT NULL,
    PRIMARY KEY (`id`),
    KEY `FK_cea2ed3a494729d4b21edbd2983` (`userId`),
    CONSTRAINT `FK_cea2ed3a494729d4b21edbd2983` FOREIGN KEY (`userId`) REFERENCES `users` (`id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

-- --------------------------------------------------------
-- Table structure for `message_links`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `message_links` (
    `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    `deletedAt` datetime(6) DEFAULT NULL,
    `isDeletionRestricted` tinyint NOT NULL DEFAULT '0',
    `id` int NOT NULL AUTO_INCREMENT,
    `messageId` int NOT NULL,
    `url` text NOT NULL,
    `startOffset` int NOT NULL,
    `endOffset` int NOT NULL,
    `order` int NOT NULL,
    PRIMARY KEY (`id`),
    KEY `FK_6e76b2962e5fb261c67b530ae9f` (`messageId`),
    CONSTRAINT `FK_6e76b2962e5fb261c67b530ae9f` FOREIGN KEY (`messageId`) REFERENCES `messages` (`id`) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

-- --------------------------------------------------------
-- Table structure for `message_uploads`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `message_uploads` (
    `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    `deletedAt` datetime(6) DEFAULT NULL,
    `isDeletionRestricted` tinyint NOT NULL DEFAULT '0',
    `id` int NOT NULL AUTO_INCREMENT,
    `messageId` int NOT NULL,
    `uploadId` int NOT NULL,
    `order` int NOT NULL,
    PRIMARY KEY (`id`),
    KEY `FK_ca5b0b5c365206085634c155b98` (`messageId`),
    KEY `FK_5e9f4572646d1b8cb555fdc24ea` (`uploadId`),
    CONSTRAINT `FK_5e9f4572646d1b8cb555fdc24ea` FOREIGN KEY (`uploadId`) REFERENCES `storage` (`id`) ON DELETE CASCADE,
    CONSTRAINT `FK_ca5b0b5c365206085634c155b98` FOREIGN KEY (`messageId`) REFERENCES `messages` (`id`) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

-- --------------------------------------------------------
-- Table structure for `messages`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `messages` (
    `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    `deletedAt` datetime(6) DEFAULT NULL,
    `isDeletionRestricted` tinyint NOT NULL DEFAULT '0',
    `id` int NOT NULL AUTO_INCREMENT,
    `content` text,
    `userId` varchar(255) NOT NULL,
    `conversationId` int NOT NULL,
    `variant` enum(
        'text',
        'static',
        'emoji',
        'image',
        'video',
        'file'
    ) NOT NULL DEFAULT 'text',
    `static` enum('First Message', 'Poke') DEFAULT NULL,
    PRIMARY KEY (`id`),
    KEY `FK_4838cd4fc48a6ff2d4aa01aa646` (`userId`),
    KEY `FK_e5663ce0c730b2de83445e2fd19` (`conversationId`),
    CONSTRAINT `FK_4838cd4fc48a6ff2d4aa01aa646` FOREIGN KEY (`userId`) REFERENCES `users` (`id`),
    CONSTRAINT `FK_e5663ce0c730b2de83445e2fd19` FOREIGN KEY (`conversationId`) REFERENCES `conversations` (`id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

-- --------------------------------------------------------
-- Table structure for `notification`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `notification` (
    `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    `deletedAt` datetime(6) DEFAULT NULL,
    `isDeletionRestricted` tinyint NOT NULL DEFAULT '0',
    `id` int NOT NULL AUTO_INCREMENT,
    `type` enum(
        'TEST',
        'NEW_SIGNIN',
        'NEW_MESSAGE',
        'REQUEST_RECEIVED',
        'REQUEST_ACCEPTED',
        'REQUEST_REJECTED'
    ) DEFAULT NULL,
    `userId` varchar(255) DEFAULT NULL,
    `payload` json DEFAULT NULL,
    `readAt` datetime(3) DEFAULT NULL,
    PRIMARY KEY (`id`),
    KEY `FK_1ced25315eb974b73391fb1c81b` (`userId`),
    CONSTRAINT `FK_1ced25315eb974b73391fb1c81b` FOREIGN KEY (`userId`) REFERENCES `users` (`id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

-- --------------------------------------------------------
-- Table structure for `permissions`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `permissions` (
    `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    `deletedAt` datetime(6) DEFAULT NULL,
    `isDeletionRestricted` tinyint NOT NULL DEFAULT '0',
    `id` varchar(255) NOT NULL,
    `label` varchar(255) NOT NULL,
    `description` varchar(255) DEFAULT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `IDX_1d269eed4300a2aa85a201c527` (`label`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

-- --------------------------------------------------------
-- Table structure for `ref-param`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `ref-param` (
    `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    `deletedAt` datetime(6) DEFAULT NULL,
    `isDeletionRestricted` tinyint NOT NULL DEFAULT '0',
    `id` int NOT NULL AUTO_INCREMENT,
    `label` varchar(255) NOT NULL,
    `description` varchar(255) DEFAULT NULL,
    `refTypeId` varchar(255) NOT NULL,
    `extras` json DEFAULT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `IDX_a366bfb43ec868372519720a4e` (`label`),
    KEY `FK_2a50b7a51767c844b927d7fb1a4` (`refTypeId`),
    CONSTRAINT `FK_2a50b7a51767c844b927d7fb1a4` FOREIGN KEY (`refTypeId`) REFERENCES `ref-type` (`id`) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

-- --------------------------------------------------------
-- Table structure for `ref-type`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `ref-type` (
    `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    `deletedAt` datetime(6) DEFAULT NULL,
    `isDeletionRestricted` tinyint NOT NULL DEFAULT '0',
    `id` varchar(255) NOT NULL,
    `label` varchar(255) NOT NULL,
    `description` varchar(255) DEFAULT NULL,
    `parentId` varchar(255) DEFAULT NULL,
    `extras` json DEFAULT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `IDX_b97283beab082b5b015af4be4a` (`label`),
    KEY `FK_d412cdb2bb90bbc2fc9adaf017a` (`parentId`),
    CONSTRAINT `FK_d412cdb2bb90bbc2fc9adaf017a` FOREIGN KEY (`parentId`) REFERENCES `ref-type` (`id`) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

-- --------------------------------------------------------
-- Table structure for `request_receivers_users`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `request_receivers_users` (
    `requestId` int NOT NULL,
    `receiverUserId` varchar(36) NOT NULL,
    PRIMARY KEY (`requestId`, `receiverUserId`),
    KEY `IDX_d52a43808bc498f2ecdc52d3b9` (`requestId`),
    KEY `IDX_9a06de9bed22dcde074cfdfd28` (`receiverUserId`),
    CONSTRAINT `FK_9a06de9bed22dcde074cfdfd28f` FOREIGN KEY (`receiverUserId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `FK_d52a43808bc498f2ecdc52d3b97` FOREIGN KEY (`requestId`) REFERENCES `requests` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

-- --------------------------------------------------------
-- Table structure for `requests`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `requests` (
    `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    `deletedAt` datetime(6) DEFAULT NULL,
    `isDeletionRestricted` tinyint NOT NULL DEFAULT '0',
    `id` int NOT NULL AUTO_INCREMENT,
    `sessionId` int NOT NULL,
    `status` enum(
        'Sent',
        'Accepted',
        'Rejected',
        'Expired'
    ) NOT NULL DEFAULT 'Sent',
    `message` text,
    `location` varchar(255) DEFAULT NULL,
    `latitude` double DEFAULT NULL,
    `longitude` double DEFAULT NULL,
    `time` timestamp NULL DEFAULT NULL,
    PRIMARY KEY (`id`),
    KEY `FK_32467c4933fafead39cea6ada2d` (`sessionId`),
    CONSTRAINT `FK_32467c4933fafead39cea6ada2d` FOREIGN KEY (`sessionId`) REFERENCES `sessions` (`id`) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

-- --------------------------------------------------------
-- Table structure for `role_permissions`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `role_permissions` (
    `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    `deletedAt` datetime(6) DEFAULT NULL,
    `isDeletionRestricted` tinyint NOT NULL DEFAULT '0',
    `id` int NOT NULL AUTO_INCREMENT,
    `roleId` varchar(255) NOT NULL,
    `permissionId` varchar(255) NOT NULL,
    PRIMARY KEY (`id`),
    KEY `FK_b4599f8b8f548d35850afa2d12c` (`roleId`),
    KEY `FK_06792d0c62ce6b0203c03643cdd` (`permissionId`),
    CONSTRAINT `FK_06792d0c62ce6b0203c03643cdd` FOREIGN KEY (`permissionId`) REFERENCES `permissions` (`id`) ON DELETE CASCADE,
    CONSTRAINT `FK_b4599f8b8f548d35850afa2d12c` FOREIGN KEY (`roleId`) REFERENCES `roles` (`id`) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

-- --------------------------------------------------------
-- Table structure for `roles`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `roles` (
    `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    `deletedAt` datetime(6) DEFAULT NULL,
    `isDeletionRestricted` tinyint NOT NULL DEFAULT '0',
    `id` varchar(36) NOT NULL,
    `label` varchar(255) NOT NULL,
    `description` varchar(255) DEFAULT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `IDX_54dfc4a418c052c458703ae7d8` (`label`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

-- --------------------------------------------------------
-- Table structure for `sessions`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `sessions` (
    `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    `deletedAt` datetime(6) DEFAULT NULL,
    `isDeletionRestricted` tinyint NOT NULL DEFAULT '0',
    `id` int NOT NULL AUTO_INCREMENT,
    `userId` varchar(255) DEFAULT NULL,
    `sessionType` enum('map-session') DEFAULT NULL,
    `plannedStart` timestamp NULL DEFAULT NULL,
    `plannedEnd` timestamp NULL DEFAULT NULL,
    `ended` timestamp NULL DEFAULT NULL,
    `payload` json DEFAULT NULL,
    PRIMARY KEY (`id`),
    KEY `FK_57de40bc620f456c7311aa3a1e6` (`userId`),
    CONSTRAINT `FK_57de40bc620f456c7311aa3a1e6` FOREIGN KEY (`userId`) REFERENCES `users` (`id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

-- --------------------------------------------------------
-- Table structure for `storage`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `storage` (
    `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    `deletedAt` datetime(6) DEFAULT NULL,
    `isDeletionRestricted` tinyint NOT NULL DEFAULT '0',
    `id` int NOT NULL AUTO_INCREMENT,
    `slug` varchar(255) NOT NULL,
    `filename` varchar(255) NOT NULL,
    `systematicName` varchar(255) DEFAULT NULL,
    `relativePath` varchar(255) NOT NULL,
    `mimetype` varchar(255) NOT NULL,
    `size` int NOT NULL,
    `isTemporary` tinyint NOT NULL DEFAULT '0',
    `isPrivate` tinyint NOT NULL DEFAULT '1',
    PRIMARY KEY (`id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

-- --------------------------------------------------------
-- Table structure for `template-styles`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `template-styles` (
    `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    `deletedAt` datetime(6) DEFAULT NULL,
    `isDeletionRestricted` tinyint NOT NULL DEFAULT '0',
    `id` varchar(36) NOT NULL,
    `name` varchar(255) NOT NULL,
    `content` longtext,
    PRIMARY KEY (`id`),
    UNIQUE KEY `IDX_f89caee9b323abfc0abaeea8b8` (`name`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

-- --------------------------------------------------------
-- Table structure for `template_template_styles`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `template_template_styles` (
    `templateId` varchar(36) NOT NULL,
    `styleId` varchar(36) NOT NULL,
    PRIMARY KEY (`templateId`, `styleId`),
    KEY `IDX_17694cf06ef5a0e0dcc8fac049` (`templateId`),
    KEY `IDX_da6b0f561e3324d22e771e5af4` (`styleId`),
    CONSTRAINT `FK_17694cf06ef5a0e0dcc8fac0494` FOREIGN KEY (`templateId`) REFERENCES `templates` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `FK_da6b0f561e3324d22e771e5af41` FOREIGN KEY (`styleId`) REFERENCES `template-styles` (`id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

-- --------------------------------------------------------
-- Table structure for `templates`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `templates` (
    `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    `deletedAt` datetime(6) DEFAULT NULL,
    `isDeletionRestricted` tinyint NOT NULL DEFAULT '0',
    `id` varchar(36) NOT NULL,
    `name` varchar(255) DEFAULT NULL,
    `content` longtext NOT NULL,
    PRIMARY KEY (`id`)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

-- --------------------------------------------------------
-- Table structure for `user-blocks`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `user-blocks` (
    `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    `deletedAt` datetime(6) DEFAULT NULL,
    `isDeletionRestricted` tinyint NOT NULL DEFAULT '0',
    `id` int NOT NULL AUTO_INCREMENT,
    `userId` varchar(255) NOT NULL,
    `blockedUserId` varchar(255) NOT NULL,
    PRIMARY KEY (`id`),
    KEY `FK_aa4674f55d26a06e0087a45e49c` (`userId`),
    KEY `FK_56b3ff8605b4b5f3a4768546e3d` (`blockedUserId`),
    CONSTRAINT `FK_56b3ff8605b4b5f3a4768546e3d` FOREIGN KEY (`blockedUserId`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    CONSTRAINT `FK_aa4674f55d26a06e0087a45e49c` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

-- --------------------------------------------------------
-- Table structure for `user-bookmarks`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `user-bookmarks` (
    `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    `deletedAt` datetime(6) DEFAULT NULL,
    `isDeletionRestricted` tinyint NOT NULL DEFAULT '0',
    `id` int NOT NULL AUTO_INCREMENT,
    `userId` varchar(255) NOT NULL,
    `bookmarkId` varchar(255) NOT NULL,
    PRIMARY KEY (`id`),
    KEY `FK_e2520658e204cdfbdba3eafb036` (`userId`),
    KEY `FK_1b0ea785ca1f1f559957f74a623` (`bookmarkId`),
    CONSTRAINT `FK_1b0ea785ca1f1f559957f74a623` FOREIGN KEY (`bookmarkId`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    CONSTRAINT `FK_e2520658e204cdfbdba3eafb036` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

-- --------------------------------------------------------
-- Table structure for `user-industries`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `user-industries` (
    `userId` varchar(36) NOT NULL,
    `industryId` int NOT NULL,
    PRIMARY KEY (`userId`, `industryId`),
    KEY `IDX_9c00f385886f6d88bb9c32d5e7` (`userId`),
    KEY `IDX_5e8d8215a9df47f5614f105bfa` (`industryId`),
    CONSTRAINT `FK_5e8d8215a9df47f5614f105bfa9` FOREIGN KEY (`industryId`) REFERENCES `ref-param` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `FK_9c00f385886f6d88bb9c32d5e73` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

-- --------------------------------------------------------
-- Table structure for `user_devices`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `user_devices` (
    `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    `deletedAt` datetime(6) DEFAULT NULL,
    `isDeletionRestricted` tinyint NOT NULL DEFAULT '0',
    `id` varchar(36) NOT NULL,
    `userId` varchar(255) NOT NULL,
    `fingerprint` varchar(255) NOT NULL,
    `deviceName` varchar(255) DEFAULT NULL,
    `deviceModel` varchar(255) DEFAULT NULL,
    `os` varchar(255) DEFAULT NULL,
    `ipAddress` varchar(255) DEFAULT NULL,
    `latitude` double DEFAULT NULL,
    `longitude` double DEFAULT NULL,
    `location` varchar(255) DEFAULT NULL,
    `lastSignInAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `signInCount` int NOT NULL DEFAULT '1',
    `isTrusted` tinyint NOT NULL DEFAULT '1',
    PRIMARY KEY (`id`),
    KEY `FK_e12ac4f8016243ac71fd2e415af` (`userId`),
    CONSTRAINT `FK_e12ac4f8016243ac71fd2e415af` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

-- --------------------------------------------------------
-- Table structure for `user_uploads`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `user_uploads` (
    `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    `deletedAt` datetime(6) DEFAULT NULL,
    `isDeletionRestricted` tinyint NOT NULL DEFAULT '0',
    `id` int NOT NULL AUTO_INCREMENT,
    `userId` varchar(255) NOT NULL,
    `uploadId` int NOT NULL,
    `order` int NOT NULL,
    PRIMARY KEY (`id`),
    KEY `FK_0b4594df2e725bc03291a47c314` (`userId`),
    KEY `FK_1174462e01c18b3e1a3f1dfb65c` (`uploadId`),
    CONSTRAINT `FK_0b4594df2e725bc03291a47c314` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE,
    CONSTRAINT `FK_1174462e01c18b3e1a3f1dfb65c` FOREIGN KEY (`uploadId`) REFERENCES `storage` (`id`) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

-- --------------------------------------------------------
-- Table structure for `users`
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `users` (
    `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    `deletedAt` datetime(6) DEFAULT NULL,
    `isDeletionRestricted` tinyint NOT NULL DEFAULT '0',
    `id` varchar(36) NOT NULL,
    `firstName` varchar(255) DEFAULT NULL,
    `lastName` varchar(255) DEFAULT NULL,
    `dateOfBirth` datetime DEFAULT NULL,
    `isActive` tinyint NOT NULL DEFAULT '0',
    `isApproved` tinyint NOT NULL DEFAULT '0',
    `source` enum(
        'email',
        'google',
        'github',
        'linkedin',
        'apple'
    ) NOT NULL DEFAULT 'email',
    `password` varchar(255) DEFAULT NULL,
    `username` varchar(255) NOT NULL,
    `email` varchar(255) NOT NULL,
    `emailVerified` timestamp NULL DEFAULT NULL,
    `image` varchar(255) DEFAULT NULL,
    `roleId` varchar(255) NOT NULL,
    `lastSeen` timestamp NULL DEFAULT NULL,
    `phone` varchar(255) DEFAULT NULL,
    `cin` varchar(255) DEFAULT NULL,
    `bio` text,
    `gender` enum('Male', 'Female') DEFAULT NULL,
    `website` text,
    `linkedin` text,
    `pictureId` int DEFAULT NULL,
    `coverId` int DEFAULT NULL,
    `type` varchar(255) NOT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `IDX_fe0bb3f6520ee0469504521e71` (`username`),
    UNIQUE KEY `IDX_97672ac88f789774dd47f7c8be` (`email`),
    UNIQUE KEY `IDX_a000cca60bcf04454e72769949` (`phone`),
    UNIQUE KEY `IDX_9b4e53aca6ef6552d5ce3d51a3` (`cin`),
    KEY `IDX_94e2000b5f7ee1f9c491f0f8a8` (`type`),
    KEY `FK_368e146b785b574f42ae9e53d5e` (`roleId`),
    KEY `FK_ded12396ab7ff578ac34eba5b9f` (`pictureId`),
    KEY `FK_116840e70b525fd1c9a5cef06ba` (`coverId`),
    CONSTRAINT `FK_116840e70b525fd1c9a5cef06ba` FOREIGN KEY (`coverId`) REFERENCES `storage` (`id`) ON DELETE CASCADE,
    CONSTRAINT `FK_368e146b785b574f42ae9e53d5e` FOREIGN KEY (`roleId`) REFERENCES `roles` (`id`) ON DELETE CASCADE,
    CONSTRAINT `FK_ded12396ab7ff578ac34eba5b9f` FOREIGN KEY (`pictureId`) REFERENCES `storage` (`id`) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;

-- =============================================================================
-- SECTION 2: BASELINE SEEDERS (DML)
-- =============================================================================

-- --------------------------------------------------------
-- Seed data for `roles`
-- --------------------------------------------------------

INSERT IGNORE INTO
    `roles` (
        `createdAt`,
        `updatedAt`,
        `deletedAt`,
        `isDeletionRestricted`,
        `id`,
        `label`,
        `description`
    )
VALUES (
        '2026-08-06 00:02:24.872522',
        '2026-08-06 00:02:24.872522',
        NULL,
        0,
        'Admin',
        'Admin',
        'Administrator role'
    ),
    (
        '2026-08-06 00:02:24.878100',
        '2026-08-06 00:02:24.878100',
        NULL,
        0,
        'User',
        'User',
        'User role'
    );

-- --------------------------------------------------------
-- Seed data for `permissions`
-- --------------------------------------------------------

INSERT IGNORE INTO
    `permissions` (
        `createdAt`,
        `updatedAt`,
        `deletedAt`,
        `isDeletionRestricted`,
        `id`,
        `label`,
        `description`
    )
VALUES (
        '2026-08-06 00:02:12.441226',
        '2026-08-06 00:02:12.441226',
        NULL,
        0,
        'CREATE_BUG',
        'CREATE_BUG',
        'Can create Bug'
    ),
    (
        '2026-08-06 00:02:12.452915',
        '2026-08-06 00:02:12.452915',
        NULL,
        0,
        'CREATE_DEVICES',
        'CREATE_DEVICES',
        'Can create Devices'
    ),
    (
        '2026-08-06 00:02:12.447743',
        '2026-08-06 00:02:12.447743',
        NULL,
        0,
        'CREATE_FEEDBACK',
        'CREATE_FEEDBACK',
        'Can create Feedback'
    ),
    (
        '2026-08-06 00:02:12.413758',
        '2026-08-06 00:02:12.413758',
        NULL,
        0,
        'CREATE_JOB',
        'CREATE_JOB',
        'Can create Job'
    ),
    (
        '2026-08-06 00:02:12.429710',
        '2026-08-06 00:02:12.429710',
        NULL,
        0,
        'CREATE_JOB-CATEGORY',
        'CREATE_JOB-CATEGORY',
        'Can create Job-Category'
    ),
    (
        '2026-08-06 00:02:12.420201',
        '2026-08-06 00:02:12.420201',
        NULL,
        0,
        'CREATE_JOB-TAG',
        'CREATE_JOB-TAG',
        'Can create Job-Tag'
    ),
    (
        '2026-08-06 00:02:12.378691',
        '2026-08-06 00:02:12.378691',
        NULL,
        0,
        'CREATE_PERMISSION',
        'CREATE_PERMISSION',
        'Can create Permission'
    ),
    (
        '2026-08-06 00:02:12.394735',
        '2026-08-06 00:02:12.394735',
        NULL,
        0,
        'CREATE_ROLE',
        'CREATE_ROLE',
        'Can create Role'
    ),
    (
        '2026-08-06 00:02:12.435649',
        '2026-08-06 00:02:12.435649',
        NULL,
        0,
        'CREATE_STORE',
        'CREATE_STORE',
        'Can create Store'
    ),
    (
        '2026-08-06 00:02:12.459939',
        '2026-08-06 00:02:12.459939',
        NULL,
        0,
        'CREATE_UPLOAD',
        'CREATE_UPLOAD',
        'Can create Upload'
    ),
    (
        '2026-08-06 00:02:12.405173',
        '2026-08-06 00:02:12.405173',
        NULL,
        0,
        'CREATE_USER',
        'CREATE_USER',
        'Can create User'
    ),
    (
        '2026-08-06 00:02:12.446397',
        '2026-08-06 00:02:12.446397',
        NULL,
        0,
        'DELETE_BUG',
        'DELETE_BUG',
        'Can delete Bug'
    ),
    (
        '2026-08-06 00:02:12.458245',
        '2026-08-06 00:02:12.458245',
        NULL,
        0,
        'DELETE_DEVICES',
        'DELETE_DEVICES',
        'Can delete Devices'
    ),
    (
        '2026-08-06 00:02:12.451619',
        '2026-08-06 00:02:12.451619',
        NULL,
        0,
        'DELETE_FEEDBACK',
        'DELETE_FEEDBACK',
        'Can delete Feedback'
    ),
    (
        '2026-08-06 00:02:12.418596',
        '2026-08-06 00:02:12.418596',
        NULL,
        0,
        'DELETE_JOB',
        'DELETE_JOB',
        'Can delete Job'
    ),
    (
        '2026-08-06 00:02:12.434234',
        '2026-08-06 00:02:12.434234',
        NULL,
        0,
        'DELETE_JOB-CATEGORY',
        'DELETE_JOB-CATEGORY',
        'Can delete Job-Category'
    ),
    (
        '2026-08-06 00:02:12.428243',
        '2026-08-06 00:02:12.428243',
        NULL,
        0,
        'DELETE_JOB-TAG',
        'DELETE_JOB-TAG',
        'Can delete Job-Tag'
    ),
    (
        '2026-08-06 00:02:12.391817',
        '2026-08-06 00:02:12.391817',
        NULL,
        0,
        'DELETE_PERMISSION',
        'DELETE_PERMISSION',
        'Can delete Permission'
    ),
    (
        '2026-08-06 00:02:12.402327',
        '2026-08-06 00:02:12.402327',
        NULL,
        0,
        'DELETE_ROLE',
        'DELETE_ROLE',
        'Can delete Role'
    ),
    (
        '2026-08-06 00:02:12.439876',
        '2026-08-06 00:02:12.439876',
        NULL,
        0,
        'DELETE_STORE',
        'DELETE_STORE',
        'Can delete Store'
    ),
    (
        '2026-08-06 00:02:12.466951',
        '2026-08-06 00:02:12.466951',
        NULL,
        0,
        'DELETE_UPLOAD',
        'DELETE_UPLOAD',
        'Can delete Upload'
    ),
    (
        '2026-08-06 00:02:12.411946',
        '2026-08-06 00:02:12.411946',
        NULL,
        0,
        'DELETE_USER',
        'DELETE_USER',
        'Can delete User'
    ),
    (
        '2026-08-06 00:02:12.443603',
        '2026-08-06 00:02:12.443603',
        NULL,
        0,
        'READ_BUG',
        'READ_BUG',
        'Can read Bug'
    ),
    (
        '2026-08-06 00:02:12.454211',
        '2026-08-06 00:02:12.454211',
        NULL,
        0,
        'READ_DEVICES',
        'READ_DEVICES',
        'Can read Devices'
    ),
    (
        '2026-08-06 00:02:12.449035',
        '2026-08-06 00:02:12.449035',
        NULL,
        0,
        'READ_FEEDBACK',
        'READ_FEEDBACK',
        'Can read Feedback'
    ),
    (
        '2026-08-06 00:02:12.415415',
        '2026-08-06 00:02:12.415415',
        NULL,
        0,
        'READ_JOB',
        'READ_JOB',
        'Can read Job'
    ),
    (
        '2026-08-06 00:02:12.431197',
        '2026-08-06 00:02:12.431197',
        NULL,
        0,
        'READ_JOB-CATEGORY',
        'READ_JOB-CATEGORY',
        'Can read Job-Category'
    ),
    (
        '2026-08-06 00:02:12.421761',
        '2026-08-06 00:02:12.421761',
        NULL,
        0,
        'READ_JOB-TAG',
        'READ_JOB-TAG',
        'Can read Job-Tag'
    ),
    (
        '2026-08-06 00:02:12.385348',
        '2026-08-06 00:02:12.385348',
        NULL,
        0,
        'READ_PERMISSION',
        'READ_PERMISSION',
        'Can read Permission'
    ),
    (
        '2026-08-06 00:02:12.397659',
        '2026-08-06 00:02:12.397659',
        NULL,
        0,
        'READ_ROLE',
        'READ_ROLE',
        'Can read Role'
    ),
    (
        '2026-08-06 00:02:12.437036',
        '2026-08-06 00:02:12.437036',
        NULL,
        0,
        'READ_STORE',
        'READ_STORE',
        'Can read Store'
    ),
    (
        '2026-08-06 00:02:12.461199',
        '2026-08-06 00:02:12.461199',
        NULL,
        0,
        'READ_UPLOAD',
        'READ_UPLOAD',
        'Can read Upload'
    ),
    (
        '2026-08-06 00:02:12.407879',
        '2026-08-06 00:02:12.407879',
        NULL,
        0,
        'READ_USER',
        'READ_USER',
        'Can read User'
    ),
    (
        '2026-08-06 00:02:12.445077',
        '2026-08-06 00:02:12.445077',
        NULL,
        0,
        'UPDATE_BUG',
        'UPDATE_BUG',
        'Can update Bug'
    ),
    (
        '2026-08-06 00:02:12.455472',
        '2026-08-06 00:02:12.455472',
        NULL,
        0,
        'UPDATE_DEVICES',
        'UPDATE_DEVICES',
        'Can update Devices'
    ),
    (
        '2026-08-06 00:02:12.450322',
        '2026-08-06 00:02:12.450322',
        NULL,
        0,
        'UPDATE_FEEDBACK',
        'UPDATE_FEEDBACK',
        'Can update Feedback'
    ),
    (
        '2026-08-06 00:02:12.416954',
        '2026-08-06 00:02:12.416954',
        NULL,
        0,
        'UPDATE_JOB',
        'UPDATE_JOB',
        'Can update Job'
    ),
    (
        '2026-08-06 00:02:12.432647',
        '2026-08-06 00:02:12.432647',
        NULL,
        0,
        'UPDATE_JOB-CATEGORY',
        'UPDATE_JOB-CATEGORY',
        'Can update Job-Category'
    ),
    (
        '2026-08-06 00:02:12.426594',
        '2026-08-06 00:02:12.426594',
        NULL,
        0,
        'UPDATE_JOB-TAG',
        'UPDATE_JOB-TAG',
        'Can update Job-Tag'
    ),
    (
        '2026-08-06 00:02:12.388626',
        '2026-08-06 00:02:12.388626',
        NULL,
        0,
        'UPDATE_PERMISSION',
        'UPDATE_PERMISSION',
        'Can update Permission'
    ),
    (
        '2026-08-06 00:02:12.400197',
        '2026-08-06 00:02:12.400197',
        NULL,
        0,
        'UPDATE_ROLE',
        'UPDATE_ROLE',
        'Can update Role'
    ),
    (
        '2026-08-06 00:02:12.438369',
        '2026-08-06 00:02:12.438369',
        NULL,
        0,
        'UPDATE_STORE',
        'UPDATE_STORE',
        'Can update Store'
    ),
    (
        '2026-08-06 00:02:12.462675',
        '2026-08-06 00:02:12.462675',
        NULL,
        0,
        'UPDATE_UPLOAD',
        'UPDATE_UPLOAD',
        'Can update Upload'
    ),
    (
        '2026-08-06 00:02:12.410124',
        '2026-08-06 00:02:12.410124',
        NULL,
        0,
        'UPDATE_USER',
        'UPDATE_USER',
        'Can update User'
    );

-- --------------------------------------------------------
-- Seed data for `role_permissions`
-- --------------------------------------------------------

INSERT IGNORE INTO
    `role_permissions` (
        `createdAt`,
        `updatedAt`,
        `deletedAt`,
        `isDeletionRestricted`,
        `id`,
        `roleId`,
        `permissionId`
    )
VALUES (
        '2026-09-24 11:36:31.873854',
        '2026-09-24 11:36:31.873854',
        NULL,
        0,
        529,
        'Admin',
        'CREATE_BUG'
    ),
    (
        '2026-09-24 11:36:31.880521',
        '2026-09-24 11:36:31.880521',
        NULL,
        0,
        530,
        'Admin',
        'CREATE_DEVICES'
    ),
    (
        '2026-09-24 11:36:31.883216',
        '2026-09-24 11:36:31.883216',
        NULL,
        0,
        531,
        'Admin',
        'CREATE_FEEDBACK'
    ),
    (
        '2026-09-24 11:36:31.885785',
        '2026-09-24 11:36:31.885785',
        NULL,
        0,
        532,
        'Admin',
        'CREATE_JOB'
    ),
    (
        '2026-09-24 11:36:31.888235',
        '2026-09-24 11:36:31.888235',
        NULL,
        0,
        533,
        'Admin',
        'CREATE_JOB-CATEGORY'
    ),
    (
        '2026-09-24 11:36:31.890515',
        '2026-09-24 11:36:31.890515',
        NULL,
        0,
        534,
        'Admin',
        'CREATE_JOB-TAG'
    ),
    (
        '2026-09-24 11:36:31.893318',
        '2026-09-24 11:36:31.893318',
        NULL,
        0,
        535,
        'Admin',
        'CREATE_PERMISSION'
    ),
    (
        '2026-09-24 11:36:31.895378',
        '2026-09-24 11:36:31.895378',
        NULL,
        0,
        536,
        'Admin',
        'CREATE_ROLE'
    ),
    (
        '2026-09-24 11:36:31.898646',
        '2026-09-24 11:36:31.898646',
        NULL,
        0,
        537,
        'Admin',
        'CREATE_STORE'
    ),
    (
        '2026-09-24 11:36:31.901080',
        '2026-09-24 11:36:31.901080',
        NULL,
        0,
        538,
        'Admin',
        'CREATE_UPLOAD'
    ),
    (
        '2026-09-24 11:36:31.903115',
        '2026-09-24 11:36:31.903115',
        NULL,
        0,
        539,
        'Admin',
        'CREATE_USER'
    ),
    (
        '2026-09-24 11:36:31.904989',
        '2026-09-24 11:36:31.904989',
        NULL,
        0,
        540,
        'Admin',
        'DELETE_BUG'
    ),
    (
        '2026-09-24 11:36:31.906742',
        '2026-09-24 11:36:31.906742',
        NULL,
        0,
        541,
        'Admin',
        'DELETE_DEVICES'
    ),
    (
        '2026-09-24 11:36:31.908333',
        '2026-09-24 11:36:31.908333',
        NULL,
        0,
        542,
        'Admin',
        'DELETE_FEEDBACK'
    ),
    (
        '2026-09-24 11:36:31.910802',
        '2026-09-24 11:36:31.910802',
        NULL,
        0,
        543,
        'Admin',
        'DELETE_JOB'
    ),
    (
        '2026-09-24 11:36:31.915658',
        '2026-09-24 11:36:31.915658',
        NULL,
        0,
        544,
        'Admin',
        'DELETE_JOB-CATEGORY'
    ),
    (
        '2026-09-24 11:36:31.917671',
        '2026-09-24 11:36:31.917671',
        NULL,
        0,
        545,
        'Admin',
        'DELETE_JOB-TAG'
    ),
    (
        '2026-09-24 11:36:31.919326',
        '2026-09-24 11:36:31.919326',
        NULL,
        0,
        546,
        'Admin',
        'DELETE_PERMISSION'
    ),
    (
        '2026-09-24 11:36:31.920973',
        '2026-09-24 11:36:31.920973',
        NULL,
        0,
        547,
        'Admin',
        'DELETE_ROLE'
    ),
    (
        '2026-09-24 11:36:31.922688',
        '2026-09-24 11:36:31.922688',
        NULL,
        0,
        548,
        'Admin',
        'DELETE_STORE'
    ),
    (
        '2026-09-24 11:36:31.924535',
        '2026-09-24 11:36:31.924535',
        NULL,
        0,
        549,
        'Admin',
        'DELETE_UPLOAD'
    ),
    (
        '2026-09-24 11:36:31.927530',
        '2026-09-24 11:36:31.927530',
        NULL,
        0,
        550,
        'Admin',
        'DELETE_USER'
    ),
    (
        '2026-09-24 11:36:31.929343',
        '2026-09-24 11:36:31.929343',
        NULL,
        0,
        551,
        'Admin',
        'READ_BUG'
    ),
    (
        '2026-09-24 11:36:31.931010',
        '2026-09-24 11:36:31.931010',
        NULL,
        0,
        552,
        'Admin',
        'READ_DEVICES'
    ),
    (
        '2026-09-24 11:36:31.932723',
        '2026-09-24 11:36:31.932723',
        NULL,
        0,
        553,
        'Admin',
        'READ_FEEDBACK'
    ),
    (
        '2026-09-24 11:36:31.934669',
        '2026-09-24 11:36:31.934669',
        NULL,
        0,
        554,
        'Admin',
        'READ_JOB'
    ),
    (
        '2026-09-24 11:36:31.936301',
        '2026-09-24 11:36:31.936301',
        NULL,
        0,
        555,
        'Admin',
        'READ_JOB-CATEGORY'
    ),
    (
        '2026-09-24 11:36:31.938137',
        '2026-09-24 11:36:31.938137',
        NULL,
        0,
        556,
        'Admin',
        'READ_JOB-TAG'
    ),
    (
        '2026-09-24 11:36:31.939675',
        '2026-09-24 11:36:31.939675',
        NULL,
        0,
        557,
        'Admin',
        'READ_PERMISSION'
    ),
    (
        '2026-09-24 11:36:31.941325',
        '2026-09-24 11:36:31.941325',
        NULL,
        0,
        558,
        'Admin',
        'READ_ROLE'
    ),
    (
        '2026-09-24 11:36:31.943412',
        '2026-09-24 11:36:31.943412',
        NULL,
        0,
        559,
        'Admin',
        'READ_STORE'
    ),
    (
        '2026-09-24 11:36:31.945094',
        '2026-09-24 11:36:31.945094',
        NULL,
        0,
        560,
        'Admin',
        'READ_UPLOAD'
    ),
    (
        '2026-09-24 11:36:31.946520',
        '2026-09-24 11:36:31.946520',
        NULL,
        0,
        561,
        'Admin',
        'READ_USER'
    ),
    (
        '2026-09-24 11:36:31.948054',
        '2026-09-24 11:36:31.948054',
        NULL,
        0,
        562,
        'Admin',
        'UPDATE_BUG'
    ),
    (
        '2026-09-24 11:36:31.950135',
        '2026-09-24 11:36:31.950135',
        NULL,
        0,
        563,
        'Admin',
        'UPDATE_DEVICES'
    ),
    (
        '2026-09-24 11:36:31.952083',
        '2026-09-24 11:36:31.952083',
        NULL,
        0,
        564,
        'Admin',
        'UPDATE_FEEDBACK'
    ),
    (
        '2026-09-24 11:36:31.954474',
        '2026-09-24 11:36:31.954474',
        NULL,
        0,
        565,
        'Admin',
        'UPDATE_JOB'
    ),
    (
        '2026-09-24 11:36:31.956272',
        '2026-09-24 11:36:31.956272',
        NULL,
        0,
        566,
        'Admin',
        'UPDATE_JOB-CATEGORY'
    ),
    (
        '2026-09-24 11:36:31.959227',
        '2026-09-24 11:36:31.959227',
        NULL,
        0,
        567,
        'Admin',
        'UPDATE_JOB-TAG'
    ),
    (
        '2026-09-24 11:36:31.961308',
        '2026-09-24 11:36:31.961308',
        NULL,
        0,
        568,
        'Admin',
        'UPDATE_PERMISSION'
    ),
    (
        '2026-09-24 11:36:31.962996',
        '2026-09-24 11:36:31.962996',
        NULL,
        0,
        569,
        'Admin',
        'UPDATE_ROLE'
    ),
    (
        '2026-09-24 11:36:31.964606',
        '2026-09-24 11:36:31.964606',
        NULL,
        0,
        570,
        'Admin',
        'UPDATE_STORE'
    ),
    (
        '2026-09-24 11:36:31.966594',
        '2026-09-24 11:36:31.966594',
        NULL,
        0,
        571,
        'Admin',
        'UPDATE_UPLOAD'
    ),
    (
        '2026-09-24 11:36:31.968302',
        '2026-09-24 11:36:31.968302',
        NULL,
        0,
        572,
        'Admin',
        'UPDATE_USER'
    );

-- --------------------------------------------------------
-- Seed data for `users`
-- --------------------------------------------------------

INSERT IGNORE INTO
    `users` (
        `createdAt`,
        `updatedAt`,
        `deletedAt`,
        `isDeletionRestricted`,
        `id`,
        `firstName`,
        `lastName`,
        `dateOfBirth`,
        `isActive`,
        `isApproved`,
        `password`,
        `username`,
        `email`,
        `emailVerified`,
        `image`,
        `roleId`,
        `lastSeen`,
        `phone`,
        `cin`,
        `bio`,
        `gender`,
        `website`,
        `linkedin`,
        `pictureId`,
        `coverId`,
        `type`,
        `source`
    )
VALUES (
        '2026-08-06 00:02:36.463581',
        '2026-08-12 22:11:23.000000',
        NULL,
        0,
        'superadmin',
        'SUPER$',
        'SUPER$',
        NULL,
        1,
        1,
        '$2b$10$MlQ8C6h5ZBafHI2yNJr89utLWh4XT.ET6k.ATVvwA8od5SWfK.LJu',
        'superadmin',
        'superadmin@example.com',
        NULL,
        NULL,
        'Admin',
        '2026-08-12 22:11:23',
        '+33123456789',
        '123456789',
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        'Male',
        NULL,
        NULL,
        NULL,
        NULL,
        'UserEntity',
        'email'
    );

-- --------------------------------------------------------
-- Seed data for `configuration-namespace`
-- --------------------------------------------------------

INSERT IGNORE INTO
    `configuration-namespace` (
        `id`,
        `name`,
        `description`,
        `userId`
    )
VALUES (
        '34ae5f90-4e24-44f2-994e-55db11ad1489',
        'personalMap',
        'Personal map configuration',
        'superadmin'
    ),
    (
        '1cf25207-63f5-4220-a842-bf096b682637',
        'core',
        'core configuration',
        NULL
    ),
    (
        '503364d6-00e0-480c-b18b-c00ba6def18a',
        'application',
        'application configuration',
        NULL
    ),
    (
        '691b0a4b-f23e-4025-b45b-6d2c4b5a47b1',
        'maps',
        'maps configuration',
        NULL
    );

-- --------------------------------------------------------
-- Seed data for `configuration-param`
-- --------------------------------------------------------

INSERT IGNORE INTO
    `configuration-param` (
        `id`,
        `name`,
        `description`,
        `namespaceId`,
        `variant`,
        `options`,
        `schema`,
        `value`
    )
VALUES (
        1,
        'company.name',
        'Company name',
        '1cf25207-63f5-4220-a842-bf096b682637',
        'string',
        NULL,
        NULL,
        'DTA INTERNATIONAL'
    ),
    (
        2,
        'company.support',
        'Company support email',
        '1cf25207-63f5-4220-a842-bf096b682637',
        'string',
        NULL,
        NULL,
        'support@instanct.com'
    ),
    (
        3,
        'company.address',
        'Company address',
        '1cf25207-63f5-4220-a842-bf096b682637',
        'string',
        NULL,
        NULL,
        '32 RUE D\'EGUISON 13010 MARSEILLE'
    ),
    (
        78,
        'company.legalName',
        'Legal company name (raison sociale)',
        '1cf25207-63f5-4220-a842-bf096b682637',
        'string',
        NULL,
        NULL,
        'DTA INTERNATIONAL'
    ),
    (
        79,
        'company.legalForm',
        'Legal form and share capital',
        '1cf25207-63f5-4220-a842-bf096b682637',
        'string',
        NULL,
        NULL,
        'Société à responsabilité limitée (sans autre indication)'
    ),
    (
        80,
        'company.rcs',
        'RCS / SIREN number',
        '1cf25207-63f5-4220-a842-bf096b682637',
        'string',
        NULL,
        NULL,
        '981609993'
    ),
    (
        81,
        'company.privacyEmail',
        'Data protection contact email',
        '1cf25207-63f5-4220-a842-bf096b682637',
        'string',
        NULL,
        NULL,
        'support@instanct.com'
    ),
    (
        82,
        'hosting.provider',
        'Hosting provider name',
        '1cf25207-63f5-4220-a842-bf096b682637',
        'string',
        NULL,
        NULL,
        'OVH Groupe SA'
    ),
    (
        83,
        'hosting.country',
        'Hosting country',
        '1cf25207-63f5-4220-a842-bf096b682637',
        'string',
        NULL,
        NULL,
        'France'
    ),
    (
        84,
        'hosting.address',
        'Hosting provider address',
        '1cf25207-63f5-4220-a842-bf096b682637',
        'string',
        NULL,
        NULL,
        'OVHCLOUD, 2 RUE KELLERMANN 59100 ROUBAIX'
    ),
    (
        14,
        'radius',
        'Radius of the map',
        '34ae5f90-4e24-44f2-994e-55db11ad1489',
        'number',
        NULL,
        NULL,
        NULL
    ),
    (
        15,
        'showUsernames',
        'Whether to show usernames on the map',
        '34ae5f90-4e24-44f2-994e-55db11ad1489',
        'boolean',
        NULL,
        NULL,
        NULL
    ),
    (
        88,
        'languages',
        'Available languages for the application',
        '503364d6-00e0-480c-b18b-c00ba6def18a',
        'list',
        NULL,
        '[{\"key\": \"label\", \"label\": \"Language label\", \"variant\": \"string\", \"required\": true}, {\"key\": \"code\", \"label\": \"Language code (e.g. en, fr)\", \"variant\": \"string\", \"required\": true}]',
        '[{\"label\":\"English\",\"code\":\"en\"},{\"label\":\"French\",\"code\":\"fr\"}]'
    ),
    (
        4,
        'range.min',
        'Minimum range of the map',
        '691b0a4b-f23e-4025-b45b-6d2c4b5a47b1',
        'number',
        NULL,
        NULL,
        '0'
    ),
    (
        5,
        'range.max',
        'Maximum range of the map',
        '691b0a4b-f23e-4025-b45b-6d2c4b5a47b1',
        'number',
        NULL,
        NULL,
        '10000'
    ),
    (
        6,
        'range.unit',
        'Range unit',
        '691b0a4b-f23e-4025-b45b-6d2c4b5a47b1',
        'select',
        '[{\"label\": \"Kilometers\", \"value\": \"km\"}, {\"label\": \"Miles\", \"value\": \"miles\"}]',
        NULL,
        'km'
    ),
    (
        7,
        'lastUpdate.value',
        'Last update value',
        '691b0a4b-f23e-4025-b45b-6d2c4b5a47b1',
        'number',
        NULL,
        NULL,
        '15'
    ),
    (
        8,
        'lastUpdate.unit',
        'Last update unit',
        '691b0a4b-f23e-4025-b45b-6d2c4b5a47b1',
        'select',
        '[{\"label\": \"Second\", \"value\": \"s\"}, {\"label\": \"Minute\", \"value\": \"min\"}, {\"label\": \"Hour\", \"value\": \"h\"}, {\"label\": \"Day\", \"value\": \"d\"}, {\"label\": \"Week\", \"value\": \"w\"}, {\"label\": \"Month\", \"value\": \"m\"}, {\"label\": \"Year\", \"value\": \"y\"}]',
        NULL,
        's'
    ),
    (
        9,
        'reconnection.maxAttempts',
        'Max reconnection attempts',
        '691b0a4b-f23e-4025-b45b-6d2c4b5a47b1',
        'number',
        NULL,
        NULL,
        '5'
    ),
    (
        10,
        'reconnection.delay.value',
        'Reconnection delay value',
        '691b0a4b-f23e-4025-b45b-6d2c4b5a47b1',
        'number',
        NULL,
        NULL,
        '10'
    ),
    (
        11,
        'reconnection.delay.unit',
        'Reconnection delay unit',
        '691b0a4b-f23e-4025-b45b-6d2c4b5a47b1',
        'select',
        '[{\"label\": \"Second\", \"value\": \"s\"}, {\"label\": \"Minute\", \"value\": \"min\"}, {\"label\": \"Hour\", \"value\": \"h\"}, {\"label\": \"Day\", \"value\": \"d\"}, {\"label\": \"Week\", \"value\": \"w\"}, {\"label\": \"Month\", \"value\": \"m\"}, {\"label\": \"Year\", \"value\": \"y\"}]',
        NULL,
        's'
    ),
    (
        12,
        'refresh.value',
        'Refresh value',
        '691b0a4b-f23e-4025-b45b-6d2c4b5a47b1',
        'number',
        NULL,
        NULL,
        '1'
    ),
    (
        13,
        'refresh.unit',
        'Refresh unit',
        '691b0a4b-f23e-4025-b45b-6d2c4b5a47b1',
        'select',
        '[{\"label\": \"Second\", \"value\": \"s\"}, {\"label\": \"Minute\", \"value\": \"min\"}, {\"label\": \"Hour\", \"value\": \"h\"}, {\"label\": \"Day\", \"value\": \"d\"}, {\"label\": \"Week\", \"value\": \"w\"}, {\"label\": \"Month\", \"value\": \"m\"}, {\"label\": \"Year\", \"value\": \"y\"}]',
        NULL,
        'min'
    ),
    (
        87,
        'providers',
        'Map providers used by the app, with a privacy policy URL for each one',
        '691b0a4b-f23e-4025-b45b-6d2c4b5a47b1',
        'list',
        NULL,
        '[{\"key\": \"name\", \"label\": \"Provider name\", \"variant\": \"string\", \"required\": true}, {\"key\": \"privacyUrl\", \"label\": \"Privacy policy URL\", \"variant\": \"string\", \"required\": true}]',
        '[{\"name\":\"Apple Maps\",\"privacyUrl\":\"https://www.apple.com/legal/privacy/data/en/apple-maps/\"},{\"name\":\"Google Maps\",\"privacyUrl\":\"https://policies.google.com/privacy\"}]'
    );

-- --------------------------------------------------------
-- Seed data for `content-page`
-- --------------------------------------------------------

INSERT IGNORE INTO
    `content-page` (
        `createdAt`,
        `updatedAt`,
        `deletedAt`,
        `isDeletionRestricted`,
        `id`,
        `slug`,
        `title`,
        `subtitle`,
        `body`,
        `locale`
    )
VALUES (
        '2026-09-21 17:00:35.409493',
        '2026-09-24 11:35:52.000000',
        NULL,
        0,
        '5357b0d9-11c4-4293-bb20-2fcdca819dea',
        'privacy',
        'Politique de confidentialité',
        'Comment Instanct traite vos données. Les passages surlignés ne sont pas encore appliqués ou restent à confirmer.',
        '<p>Les passages surlignés identifient soit des informations encore à confirmer, soit des traitements ou fonctionnalités qui ne sont pas encore appliqués.</p>\n<h2>1. Notre engagement</h2>\n<p>Instanct est une plateforme de networking professionnel en temps réel. Elle permet aux personnes présentes dans un même lieu, un même établissement ou un même événement de se rendre volontairement visibles, de découvrir des profils professionnels pertinents et d\'entrer en relation.</p>\n<p>La protection de votre vie privée est intégrée au fonctionnement d\'Instanct. Vous conservez notamment le contrôle sur :</p>\n<ul><li>\n<p>les informations figurant sur votre profil ;</p></li><li>\n<p>votre présence dans un espace ;</p></li><li>\n<p>votre visibilité sur la carte ;</p></li><li>\n<p>les personnes pouvant vous contacter ;</p></li><li>\n<p>l\'utilisation de votre localisation ;</p></li><li>\n<p>vos connexions et conversations ;</p></li><li>\n<p>la suppression de vos données et de votre compte.</p></li></ul>\n\n<p>Instanct ne vend pas vos données personnelles.</p>\n<h2>2. Responsable du traitement</h2>\n<p>Le responsable du traitement est :</p>\n<p><strong><mark>{{company.legalName}}</mark></strong></p>\n<p><mark>{{company.legalForm}}</mark></p>\n<p>Siège social : <mark>{{company.address}}</mark></p>\n<p>RCS/SIREN : <mark>{{company.rcs}}</mark></p>\n<p>E-mail relatif à la protection des données : <mark>{{company.privacyEmail}}</mark></p>\n<p>Dans la présente politique, les termes « Instanct », « nous » et « notre » désignent cette société.</p>\n<h2>3. Services concernés</h2>\n<p>Cette politique s\'applique :</p>\n<ul><li>\n<p>à l\'application mobile Instanct ;</p></li><li>\n<p>au site internet Instanct ;</p></li><li>\n<p>aux fonctionnalités de carte, de networking, de messagerie et de prise de rendez-vous.</p></li></ul>\n\n<blockquote class=\"legal-not-applied\">\n<p>Cette politique mentionne également, pour information, les espaces publics Instanct Open, les espaces privés, semi-publics ou VIP Instanct Spaces, les espaces créés pour des hôtels, lounges, coworkings, salons, congrès, clubs d\'affaires, campus ou entreprises, ainsi que les versions bêta distribuées notamment avec TestFlight. Ces services ne sont pas encore ouverts. Les traitements qui n\'existent que pour ces espaces ne s\'appliquent pas tant qu\'ils ne sont pas mis en production.</p></blockquote>\n\n<h2>4. Données que vous nous fournissez</h2>\n<h3>4.1 Création du compte</h3>\n<p>Nous pouvons collecter :</p>\n<ul><li>\n<p>votre prénom et votre nom ;</p></li><li>\n<p>votre adresse électronique ;</p></li><li>\n<p>votre numéro de téléphone, lorsqu\'il est demandé ;</p></li><li>\n<p>votre mot de passe sous une forme sécurisée ;</p></li><li>\n<p>votre langue ;</p></li><li>\n<p>votre photographie de profil ;</p></li><li>\n<p>votre identifiant utilisateur.</p></li></ul>\n\n<h3>4.2 Profil professionnel</h3>\n<p>Vous pouvez ajouter volontairement :</p>\n<ul><li>\n<p>votre fonction ;</p></li><li>\n<p>votre entreprise ou organisation ;</p></li><li>\n<p>votre secteur d\'activité ;</p></li><li>\n<p>vos compétences et domaines d\'expertise ;</p></li><li>\n<p>une présentation professionnelle ;</p></li><li>\n<p>vos coordonnées professionnelles ;</p></li><li>\n<p>vos liens professionnels ;</p></li><li>\n<p>vos centres d\'intérêt ;</p></li><li>\n<p>vos objectifs de networking ;</p></li><li>\n<p>votre disponibilité ;</p></li><li>\n<p>les langues que vous parlez.</p></li></ul>\n\n<p>Vous ne devez pas publier d\'informations sensibles ou confidentielles que vous ne souhaitez pas rendre visibles aux autres utilisateurs autorisés.</p>\n<h3>4.3 Objectifs de networking</h3>\n<p>Vous pouvez indiquer la raison pour laquelle vous souhaitez être contacté, par exemple :</p>\n<ul><li>\n<p>rechercher un client ;</p></li><li>\n<p>rencontrer un partenaire ;</p></li><li>\n<p>trouver un investisseur ;</p></li><li>\n<p>recruter ou rechercher une opportunité professionnelle ;</p></li><li>\n<p>proposer ou rechercher une expertise ;</p></li><li>\n<p>développer votre réseau ;</p></li><li>\n<p>organiser un rendez-vous.</p></li></ul>\n\n<p>Ces informations servent à faciliter les rencontres professionnelles pertinentes.</p>\n<h3>4.4 Communications</h3>\n<p>Nous traitons les informations liées :</p>\n<ul><li>\n<p>aux demandes de connexion ;</p></li><li>\n<p>aux acceptations et refus ;</p></li><li>\n<p>aux contacts professionnels créés ;</p></li><li>\n<p>aux messages échangés ;</p></li><li>\n<p>aux rendez-vous organisés ;</p></li><li>\n<p>aux utilisateurs bloqués ;</p></li><li>\n<p>aux signalements transmis à notre équipe.</p></li></ul>\n\n<p>Le contenu des conversations privées n\'est pas communiqué aux organisateurs, hôtels ou autres partenaires, sauf lorsqu\'un utilisateur choisit lui-même de le partager ou lorsqu\'un accès est indispensable pour examiner un signalement, assurer la sécurité du service ou respecter une obligation légale.</p>\n<h2>5. Localisation et carte Instanct</h2>\n<h3>5.1 Fonctionnement général</h3>\n<p>La carte Instanct permet de visualiser des lieux, événements, espaces professionnels et, lorsque les utilisateurs l\'ont volontairement autorisé, leur présence dans une zone.</p>\n<p>La carte n\'a pas vocation à assurer une surveillance permanente des déplacements.</p>\n<p>Selon les fonctionnalités utilisées et les autorisations accordées, Instanct peut traiter :</p>\n<ul><li>\n<p>une localisation approximative déduite de l\'adresse IP ;</p></li><li>\n<p>le lieu ou l\'événement rejoint ;</p></li><li>\n<p>une zone sélectionnée manuellement ;</p></li><li>\n<p>la position de l\'appareil fournie par le système d\'exploitation ;</p></li><li>\n<p>une position GPS précise lorsque l\'utilisateur l\'autorise expressément ;</p></li><li>\n<p>la date, l\'heure et la durée de présence dans un espace ;</p></li><li>\n<p>le point ou la zone affichés sur la carte.</p></li></ul>\n\n<h3>5.2 Activation volontaire</h3>\n<p>La visibilité d\'un utilisateur sur la carte doit être activée volontairement.</p>\n<p>L\'autorisation donnée au système d\'exploitation ne signifie pas automatiquement que la position est visible par les autres utilisateurs. La visibilité sur Instanct dépend également des réglages choisis dans l\'application.</p>\n<p>L\'utilisateur peut notamment :</p>\n<ul><li>\n<p>apparaître uniquement dans un lieu ou une zone générale ;</p></li><li>\n<p>autoriser, lorsqu\'elle est proposée, une position plus précise ;</p></li><li>\n<p>limiter sa visibilité aux participants d\'un même espace ;</p></li><li>\n<p>désactiver sa présence ;</p></li><li>\n<p>quitter un lieu ou un événement ;</p></li><li>\n<p>retirer l\'autorisation de localisation dans les réglages de son téléphone.</p></li></ul>\n\n<h3>5.3 Localisation précise</h3>\n<p>Lorsque la localisation précise est nécessaire à une fonctionnalité, Instanct demande l\'autorisation de l\'utilisateur avant d\'accéder aux données GPS.</p>\n<p>Sauf indication contraire clairement présentée à l\'utilisateur :</p>\n<ul><li>\n<p>Instanct ne suit pas continuellement ses déplacements ;</p></li><li>\n<p>Instanct n\'utilise pas sa localisation en arrière-plan ;</p></li><li>\n<p>la position n\'est pas publiquement accessible sur internet ;</p></li><li>\n<p>la position n\'est pas vendue à des annonceurs ;</p></li><li>\n<p>les partenaires ne reçoivent pas l\'historique détaillé des déplacements ;</p></li><li>\n<p>une position exacte n\'est pas communiquée aux autres utilisateurs lorsqu\'une indication au niveau du lieu ou de la zone suffit.</p></li></ul>\n\n<blockquote class=\"legal-not-applied\">\n<p>Si une fonctionnalité de localisation en arrière-plan est ajoutée ultérieurement, elle fera l\'objet d\'une information spécifique et d\'une autorisation dédiée. Cette fonctionnalité n\'est pas active.</p></blockquote>\n\n<h3>5.4 Présence temporaire</h3>\n<p>La présence sur la carte est conçue comme une information temporaire.</p>\n<p>Elle peut prendre fin :</p>\n<ul><li>\n<p>lorsque l\'utilisateur désactive sa présence ;</p></li><li>\n<p>lorsqu\'il quitte volontairement l\'espace ;</p></li><li>\n<p>à l\'expiration de la session choisie ;</p></li><li>\n<p>à la fermeture de l\'événement ;</p></li><li>\n<p>après une période d\'inactivité.</p></li></ul>\n\n<p>Instanct peut conserver temporairement certaines données techniques liées à la session pour assurer la sécurité, prévenir les abus et résoudre les incidents. Ces données ne doivent pas être utilisées pour reconstituer durablement les déplacements de l\'utilisateur.</p>\n<h3>5.5 Sécurité et vigilance</h3>\n<p>Même lorsqu\'une position est présentée au niveau d\'un lieu ou d\'une zone, elle peut révéler qu\'une personne se trouve dans un établissement ou participe à un événement.</p>\n<p>Chaque utilisateur doit donc vérifier ses réglages avant d\'activer sa visibilité et ne pas afficher sa position lorsqu\'il estime que cela pourrait présenter un risque.</p>\n<p>Les autres utilisateurs peuvent effectuer des captures d\'écran ou conserver des informations vues dans l\'application. Instanct ne peut pas empêcher techniquement toutes les utilisations effectuées en dehors de la plateforme.</p>\n<h2>6. Données provenant des organisateurs et partenaires</h2>\n<blockquote class=\"legal-not-applied\">\n<p>Lorsqu\'un utilisateur participe à un salon, un congrès, un événement professionnel ou accède à un espace partenaire, l\'organisateur pourra nous transmettre certaines informations, par exemple :</p>\n<ul><li>\n<p>nom et prénom ;</p></li><li>\n<p>adresse électronique professionnelle ;</p></li><li>\n<p>entreprise et fonction ;</p></li><li>\n<p>numéro de badge ou identifiant d\'inscription ;</p></li><li>\n<p>catégorie de participant ;</p></li><li>\n<p>programme ou sessions sélectionnées ;</p></li><li>\n<p>droits d\'accès à certaines zones ;</p></li><li>\n<p>liste de participants ou d\'exposants ;</p></li><li>\n<p>rendez-vous programmés.</p></li></ul>\n\n<p>Ces traitements ne sont pas encore mis en œuvre. Ils ne s\'appliqueront que lorsqu\'un organisateur transmettra effectivement des données à Instanct et aura informé les participants de cette transmission.</p></blockquote>\n\n<h2>7. Rôles d\'Instanct et des organisateurs</h2>\n<h3>7.1 Instanct comme responsable du traitement</h3>\n<p>Instanct agit généralement comme responsable du traitement pour :</p>\n<ul><li>\n<p>la création et la gestion du compte global ;</p></li><li>\n<p>le profil Instanct ;</p></li><li>\n<p>les connexions et la messagerie ;</p></li><li>\n<p>les réglages de confidentialité ;</p></li><li>\n<p>la sécurité de la plateforme ;</p></li><li>\n<p>le fonctionnement général de la carte ;</p></li><li>\n<p>l\'amélioration du service ;</p></li><li>\n<p>la gestion des droits des utilisateurs.</p></li></ul>\n\n<h3>7.2 Instanct comme sous-traitant</h3>\n<blockquote class=\"legal-not-applied\">\n<p>Instanct pourra agir comme sous-traitant lorsqu\'un organisateur ou un partenaire nous demandera de traiter des données exclusivement pour administrer son événement ou son espace. Cette situation n\'est pas encore en production. Dans ce cas, l\'organisateur ou le partenaire déterminera les finalités du traitement et les demandes portant spécifiquement sur les données qu\'il nous aura confiées pourront devoir lui être adressées.</p></blockquote>\n\n<h3>7.3 Organisateur comme responsable distinct</h3>\n<blockquote class=\"legal-not-applied\">\n<p>Un organisateur pourra utiliser certaines données pour ses propres finalités, notamment gérer les inscriptions, contrôler les accès, organiser les rendez-vous, analyser la fréquentation, communiquer avec ses participants et respecter ses obligations de sécurité. Ces traitements relèveront alors de la politique de confidentialité de l\'organisateur. Ils ne s\'appliquent pas tant qu\'aucun espace partenaire n\'est ouvert.</p></blockquote>\n\n<h2>8. Données collectées automatiquement</h2>\n<p>Lorsque vous utilisez Instanct, nous pouvons collecter :</p>\n<ul><li>\n<p>l\'adresse IP ;</p></li><li>\n<p>le modèle de l\'appareil ;</p></li><li>\n<p>le système d\'exploitation ;</p></li><li>\n<p>la version de l\'application ;</p></li><li>\n<p>la langue et le fuseau horaire ;</p></li><li>\n<p>des identifiants techniques ;</p></li><li>\n<p>les dates et heures de connexion ;</p></li><li>\n<p>les écrans et fonctionnalités utilisés ;</p></li><li>\n<p>les rapports d\'erreur et de plantage ;</p></li><li>\n<p>les journaux de sécurité ;</p></li><li>\n<p>les réglages d\'autorisation communiqués par l\'appareil.</p></li></ul>\n\n<blockquote class=\"legal-not-applied\">\n<p>Les QR codes ou invitations utilisés pour rejoindre un espace événementiel ne sont pas encore collectés.</p></blockquote>\n\n<p>Nous limitons cette collecte aux informations nécessaires au fonctionnement, à la sécurité, aux statistiques et à l\'amélioration du service.</p>\n<h2>9. Utilisation de vos données</h2>\n<p>Nous utilisons les données pour :</p>\n<ul><li>\n<p>créer et administrer votre compte ;</p></li><li>\n<p>afficher votre profil conformément à vos réglages ;</p></li><li>\n<p>vous permettre de rejoindre un lieu ou un événement ;</p></li><li>\n<p>afficher votre présence volontaire sur la carte ;</p></li><li>\n<p>suggérer des profils correspondant à vos critères ;</p></li><li>\n<p>faciliter les connexions et rendez-vous ;</p></li><li>\n<p>assurer la messagerie ;</p></li><li>\n<p>envoyer des notifications ;</p></li><li>\n<p>personnaliser votre expérience ;</p></li><li>\n<p>établir des statistiques agrégées ;</p></li><li>\n<p>détecter les faux comptes, fraudes et comportements abusifs ;</p></li><li>\n<p>répondre aux demandes d\'assistance ;</p></li><li>\n<p>améliorer les fonctionnalités ;</p></li><li>\n<p>respecter nos obligations légales.</p></li></ul>\n\n<blockquote class=\"legal-not-applied\">\n<p>L\'administration des espaces partenaires n\'est pas encore active.</p></blockquote>\n\n<p>Instanct n\'utilise pas le contenu de vos conversations privées pour afficher de la publicité ciblée.</p>\n<p>Instanct n\'utilise pas vos conversations privées ni vos données GPS précises pour entraîner un système d\'intelligence artificielle sans vous en informer préalablement et sans disposer d\'une base juridique appropriée.</p>\n<h2>10. Bases juridiques</h2>\n<p>Les traitements reposent, selon les cas, sur :</p>\n<ul><li>\n<p>l\'exécution du contrat, pour fournir le compte, le profil, les connexions, la messagerie et les fonctionnalités demandées ;</p></li><li>\n<p>le consentement, notamment pour la localisation précise, certaines notifications, les contacts du téléphone ou les communications commerciales ;</p></li><li>\n<p>l\'intérêt légitime, pour sécuriser le service, prévenir la fraude, améliorer Instanct et produire des statistiques agrégées ;</p></li><li>\n<p>une obligation légale, lorsque nous devons conserver ou communiquer certaines informations.</p></li></ul>\n\n<p>Vous pouvez retirer votre consentement à tout moment. Ce retrait n\'affecte pas la licéité des traitements déjà effectués.</p>\n<blockquote class=\"legal-not-applied\">\n<p>L\'accès aux contacts du téléphone et les communications commerciales ne sont pas encore proposés. Le consentement correspondant n\'est donc pas recueilli à ce jour.</p></blockquote>\n\n<h2>11. Visibilité de vos informations</h2>\n<p>Selon vos réglages et l\'espace rejoint, les autres utilisateurs peuvent voir :</p>\n<ul><li>\n<p>votre nom et votre photographie ;</p></li><li>\n<p>votre fonction et votre entreprise ;</p></li><li>\n<p>votre présentation professionnelle ;</p></li><li>\n<p>vos compétences ;</p></li><li>\n<p>vos objectifs ;</p></li><li>\n<p>votre disponibilité ;</p></li><li>\n<p>votre présence dans un lieu ou une zone ;</p></li><li>\n<p>vos créneaux de rendez-vous disponibles.</p></li></ul>\n\n<p>Votre adresse électronique, votre numéro de téléphone, votre position GPS exacte et vos messages privés ne sont pas rendus visibles, sauf action ou autorisation expresse de votre part.</p>\n<h2>12. Contrôle de vos informations</h2>\n<p>Vous pouvez notamment :</p>\n<ul><li>\n<p>modifier votre profil ;</p></li><li>\n<p>masquer certaines informations ;</p></li><li>\n<p>activer ou désactiver votre présence ;</p></li><li>\n<p>contrôler votre visibilité sur la carte ;</p></li><li>\n<p>refuser ou accepter une connexion ;</p></li><li>\n<p>bloquer et signaler un utilisateur ;</p></li><li>\n<p>désactiver certaines notifications ;</p></li><li>\n<p>retirer l\'accès à la localisation ;</p></li><li>\n<p>quitter un espace ;</p></li><li>\n<p>demander une copie de vos données ;</p></li><li>\n<p>supprimer votre compte.</p></li></ul>\n\n<p>Le retrait d\'une autorisation peut empêcher certaines fonctionnalités de fonctionner, sans empêcher l\'utilisation des autres fonctions disponibles.</p>\n<h2>13. Informations accessibles aux partenaires</h2>\n<blockquote class=\"legal-not-applied\">\n<p>Les partenaires et organisateurs pourront recevoir des informations nécessaires à la gestion de leur espace ainsi que des statistiques, notamment le nombre de participants actifs, le taux de participation, le volume de connexions, le nombre de rendez-vous, les catégories générales d\'objectifs professionnels, les périodes et zones générales de fréquentation et l\'utilisation des fonctionnalités. Ces transmissions ne sont pas encore effectuées.</p>\n<p>Lorsqu\'elles le seront, les statistiques seront, autant que possible, agrégées ou anonymisées. Les partenaires ne recevront pas le contenu des conversations privées, les mots de passe, la position GPS précise, l\'historique détaillé des déplacements ni les coordonnées privées non volontairement partagées.</p></blockquote>\n\n<h2>14. Autres destinataires</h2>\n<p>Les données peuvent être traitées par :</p>\n<ul><li>\n<p>le personnel autorisé d\'Instanct ;</p></li><li>\n<p>les autres utilisateurs selon vos réglages ;</p></li><li>\n<p>les prestataires d\'hébergement ;</p></li><li>\n<p>les prestataires d\'authentification ;</p></li><li>\n<p>les services de cartographie ;</p></li><li>\n<p>les prestataires de notifications ;</p></li><li>\n<p>les outils de diagnostic et de mesure d\'audience ;</p></li><li>\n<p>les prestataires de support et de sécurité ;</p></li><li>\n<p>Apple ou Google pour la distribution de l\'application ;</p></li><li>\n<p>les autorités compétentes lorsque la loi l\'exige.</p></li></ul>\n\n<blockquote class=\"legal-not-applied\">\n<p>Les administrateurs autorisés d\'un espace partenaire ne reçoivent pas encore de données, aucun espace partenaire n\'étant ouvert.</p></blockquote>\n\n<p>Nos sous-traitants ne peuvent utiliser les données que conformément à nos instructions contractuelles.</p>\n<h2>15. Service de cartographie</h2>\n<p>La carte peut s\'appuyer sur un ou plusieurs prestataires externes.</p>\n<p>Prestataires actuellement prévus :</p>\n<mark>{{maps.providers}}</mark>\n<p>Lorsque la carte est chargée, ces prestataires peuvent recevoir certaines données techniques, notamment l\'adresse IP, le type d\'appareil, la zone affichée ou des informations nécessaires à la fourniture de la carte.</p>\n<h2>16. Contacts et calendrier</h2>\n<blockquote class=\"legal-not-applied\">\n<p>Instanct n\'accède pas actuellement au carnet d\'adresses ou au calendrier de l\'appareil. Si cette fonctionnalité est proposée, nous expliquerons quelles données sont importées, dans quel but, pendant combien de temps elles sont conservées et comment supprimer les informations importées. Le refus d\'accès n\'empêchera pas l\'utilisation des fonctions principales de networking manuel.</p></blockquote>\n\n<h2>17. Durées de conservation</h2>\n<p>Nous appliquons notamment les durées suivantes :</p>\n<ul><li>\n<p><strong>Compte et profil</strong> — Pendant l\'utilisation du compte</p></li><li>\n<p><strong>Compte inactif</strong> — Suppression ou anonymisation après 3 ans d\'inactivité</p></li><li>\n<p><strong>Présence visible sur la carte</strong> — Durée de la session ou de l\'événement</p></li><li>\n<p><strong>Position précise liée à une session</strong> — Suppression ou transformation en donnée non précise après la fin de la session, sauf incident de sécurité</p></li><li>\n<p><strong>Journaux techniques de localisation</strong> — 30 jours maximum, sauf incident ou obligation légale</p></li><li>\n<p><strong>Connexions professionnelles</strong> — Jusqu\'à leur suppression ou celle du compte</p></li><li>\n<p><strong>Messages</strong> — Jusqu\'à leur suppression ou celle du compte</p></li><li>\n<p><strong>Journaux de sécurité</strong> — 12 mois maximum</p></li><li>\n<p><strong>Demandes d\'assistance</strong> — Jusqu\'à 3 ans après leur clôture</p></li></ul>\n\n<blockquote class=\"legal-not-applied\">\n<p>Les durées suivantes ne s\'appliquent pas encore, les traitements correspondants n\'étant pas en production :</p>\n<ul><li>\n<p><strong>Données d\'un événement</strong> — Durée définie avec l\'organisateur, puis suppression ou anonymisation</p></li><li>\n<p><strong>Données de facturation</strong> — 10 ans</p></li><li>\n<p><strong>Prospection commerciale</strong> — 3 ans après le dernier contact actif</p></li></ul>\n</blockquote>\n\n<p>Les données peuvent être conservées plus longtemps lorsqu\'une obligation légale, un contentieux, un signalement grave ou une exigence de sécurité le justifie.</p>\n<p>Les copies de sauvegarde sont supprimées progressivement selon nos cycles techniques.</p>\n<h2>18. Hébergement et transferts internationaux</h2>\n<p>Les données sont hébergées par :</p>\n<p><strong><mark>{{hosting.provider}}</mark></strong></p>\n<p><mark>{{hosting.country}}</mark></p>\n<p><mark>{{hosting.address}}</mark></p>\n<p>Nous privilégions un hébergement au sein de l\'Union européenne ou de l\'Espace économique européen.</p>\n<p>Lorsque des données sont transférées vers un pays extérieur à cet espace, nous utilisons un mécanisme reconnu, comme une décision d\'adéquation ou les clauses contractuelles types de la Commission européenne.</p>\n<h2>19. Sécurité</h2>\n<p>Nous mettons en œuvre des mesures adaptées, notamment :</p>\n<ul><li>\n<p>chiffrement des communications ;</p></li><li>\n<p>protection des mots de passe ;</p></li><li>\n<p>contrôle des habilitations ;</p></li><li>\n<p>journalisation des accès sensibles ;</p></li><li>\n<p>sauvegardes ;</p></li><li>\n<p>procédures de gestion des incidents ;</p></li><li>\n<p>contrôle des sous-traitants ;</p></li><li>\n<p>mécanismes de blocage et de signalement.</p></li></ul>\n\n<blockquote class=\"legal-not-applied\">\n<p>La séparation des espaces partenaires n\'est pas encore opérationnelle, ces espaces n\'étant pas ouverts.</p></blockquote>\n\n<p>Aucun service numérique ne peut garantir une sécurité absolue. Vous devez protéger vos identifiants et nous signaler rapidement toute activité suspecte.</p>\n<h2>20. Absence de vente et de publicité comportementale</h2>\n<p>Instanct ne vend ni ne loue vos données personnelles.</p>\n<p>À la date de cette politique, Instanct n\'utilise pas votre position précise, vos messages privés ou votre activité de networking pour vous suivre sur les applications et sites internet appartenant à d\'autres entreprises.</p>\n<p>Si un modèle publicitaire ou un système de suivi interapplications devait être introduit, cette politique et les déclarations faites auprès d\'Apple et de Google seraient préalablement mises à jour. Les consentements nécessaires seraient recueillis.</p>\n<h2>21. Utilisateurs mineurs</h2>\n<p>Instanct est destiné aux professionnels âgés d\'au moins 18 ans.</p>\n<p>Nous ne cherchons pas à collecter sciemment les données de mineurs. Lorsqu\'un compte appartenant à un mineur est identifié, il peut être suspendu et supprimé.</p>\n<h2>22. Vos droits</h2>\n<p>Vous pouvez demander :</p>\n<ul><li>\n<p>l\'accès à vos données ;</p></li><li>\n<p>leur rectification ;</p></li><li>\n<p>leur effacement ;</p></li><li>\n<p>la limitation d\'un traitement ;</p></li><li>\n<p>la portabilité de certaines données ;</p></li><li>\n<p>l\'opposition à certains traitements ;</p></li><li>\n<p>le retrait de votre consentement ;</p></li><li>\n<p>une copie de vos données ;</p></li><li>\n<p>des informations relatives aux transferts internationaux ;</p></li><li>\n<p>la définition de directives relatives à vos données après votre décès.</p></li></ul>\n\n<p>Vous pouvez exercer vos droits depuis l\'application ou en écrivant à :</p>\n<p><mark>{{company.privacyEmail}}</mark></p>\n<p>Nous pouvons demander un justificatif uniquement en cas de doute raisonnable concernant votre identité.</p>\n<p>Nous répondons normalement dans un délai d\'un mois, sous réserve des prolongations autorisées par la réglementation.</p>\n<p>Vous pouvez également déposer une réclamation auprès de la CNIL :</p>\n<p>Commission nationale de l\'informatique et des libertés</p>\n<p>3 place de Fontenoy</p>\n<p>TSA 80715</p>\n<p>75334 Paris Cedex 07</p>\n<p><a target=\"_blank\" rel=\"noopener noreferrer nofollow\" href=\"https://www.cnil.fr\">www.cnil.fr</a></p>\n<h2>23. Suppression du compte</h2>\n<p>Vous pouvez demander la suppression de votre compte directement depuis l\'application ou à l\'adresse <mark>{{company.privacyEmail}}</mark>.</p>\n<p>La suppression entraîne :</p>\n<ul><li>\n<p>la désactivation du profil ;</p></li><li>\n<p>la fin de la visibilité sur la carte ;</p></li><li>\n<p>le retrait des espaces actifs ;</p></li><li>\n<p>la suppression ou l\'anonymisation des données personnelles ;</p></li><li>\n<p>la suppression des connexions et contenus selon les règles applicables.</p></li></ul>\n\n<p>Certaines informations peuvent être temporairement conservées afin de respecter une obligation légale, traiter un signalement ou défendre un droit.</p>\n<h2>24. Modification de cette politique</h2>\n<p>Nous pouvons modifier cette politique lorsque les fonctionnalités, les prestataires ou la réglementation évoluent.</p>\n<p>En cas de modification importante, nous vous en informerons dans l\'application, par e-mail ou par un autre moyen approprié avant son entrée en vigueur.</p>\n<h2>25. Nous contacter</h2>\n<p>Pour toute question concernant vos données :</p>\n<p>Instanct – Protection des données</p>\n<p><mark>{{company.legalName}}</mark></p>\n<p><mark>{{company.address}}</mark></p>\n<p><mark>{{company.privacyEmail}}</mark></p>',
        'fr'
    ),
    (
        '2026-09-21 17:00:35.384415',
        '2026-09-22 20:16:28.000000',
        NULL,
        0,
        '64bb1df3-2680-49f1-8fa3-01cd67920d3b',
        'terms',
        'Conditions générales d\'utilisation',
        'Les règles d\'utilisation d\'Instanct. Les passages surlignés ne sont pas encore appliqués ou restent à confirmer.',
        '<p>Les passages surlignés identifient soit des informations encore à confirmer (identité de la société, hébergeur, prestataire de carte), soit des fonctionnalités qui ne sont pas encore en production.</p>\n<h2>1. Objet</h2>\n<p>Instanct est une plateforme de networking professionnel en temps réel. Elle permet aux personnes présentes dans un même lieu de se rendre volontairement visibles, de découvrir des profils professionnels pertinents et d\'entrer en relation.</p>\n<p>Les présentes conditions régissent l\'accès et l\'utilisation :</p>\n<ul><li>\n<p>de l\'application mobile Instanct ;</p></li><li>\n<p>du site internet Instanct ;</p></li><li>\n<p>des fonctionnalités de carte, de networking, de messagerie et de prise de rendez-vous.</p></li></ul>\n\n<blockquote class=\"legal-not-applied\">\n<p>Les espaces Instanct Open, Instanct Spaces, les espaces VIP, hôtels, lounges, coworkings, salons, congrès, clubs d\'affaires, campus ou entreprises, ainsi que les versions bêta distribuées notamment avec TestFlight, ne sont pas encore proposés. Ces mentions n\'ont donc pas d\'effet tant que la fonctionnalité correspondante n\'est pas ouverte.</p></blockquote>\n\n<p>En créant un compte ou en utilisant Instanct, vous acceptez ces conditions et la politique de confidentialité.</p>\n<h2>2. Éditeur du service</h2>\n<p>Le service est édité par :</p>\n<p><strong><mark>{{company.legalName}}</mark></strong></p>\n<p><mark>{{company.legalForm}}</mark></p>\n<p>Siège social : <mark>{{company.address}}</mark></p>\n<p>RCS/SIREN : <mark>{{company.rcs}}</mark></p>\n<p>Dans les présentes conditions, les termes « Instanct », « nous » et « notre » désignent cette société.</p>\n<p>Pour toute question : <mark>{{company.privacyEmail}}</mark> ou <mark>{{company.support}}</mark></p>\n<h2>3. Accès au service</h2>\n<p>Instanct est destiné aux professionnels âgés d\'au moins 18 ans.</p>\n<p>Pour utiliser le service, vous devez :</p>\n<ul><li>\n<p>créer un compte avec des informations exactes et à jour ;</p></li><li>\n<p>conserver la confidentialité de vos identifiants ;</p></li><li>\n<p>nous signaler rapidement toute utilisation non autorisée de votre compte.</p></li></ul>\n\n<p>Vous êtes responsable de l\'activité réalisée depuis votre compte.</p>\n<p>Le refus de certaines autorisations du téléphone (localisation, notifications) peut limiter des fonctionnalités sans empêcher l\'usage des autres fonctions disponibles.</p>\n<h2>4. Compte et profil</h2>\n<p>Vous pouvez renseigner un profil professionnel comprenant notamment votre nom, votre photographie, votre fonction, votre entreprise, vos compétences, vos objectifs de networking et votre disponibilité.</p>\n<p>Vous ne devez pas publier d\'informations sensibles, confidentielles ou trompeuses. Vous ne devez pas usurper l\'identité d\'une autre personne.</p>\n<p>Instanct peut suspendre ou supprimer un compte en cas d\'informations manifestement fausses, d\'usurpation d\'identité ou de manquement aux présentes conditions.</p>\n<h2>5. Carte, localisation et visibilité</h2>\n<p>La carte Instanct permet de visualiser des lieux et, lorsque vous l\'avez volontairement autorisé, votre présence dans une zone.</p>\n<p>La visibilité sur la carte doit être activée volontairement. L\'autorisation donnée au système d\'exploitation ne signifie pas automatiquement que votre position est visible par les autres utilisateurs.</p>\n<p>Vous pouvez notamment :</p>\n<ul><li>\n<p>apparaître uniquement dans un lieu ou une zone générale ;</p></li><li>\n<p>limiter votre visibilité ;</p></li><li>\n<p>désactiver votre présence ;</p></li><li>\n<p>retirer l\'autorisation de localisation dans les réglages de votre téléphone.</p></li></ul>\n\n<p>Même une indication au niveau d\'un lieu peut révéler que vous vous trouvez dans un établissement. Vérifiez vos réglages avant d\'activer votre visibilité.</p>\n<blockquote class=\"legal-not-applied\">\n<p>La localisation en arrière-plan n\'est pas proposée. Si elle est ajoutée ultérieurement, elle fera l\'objet d\'une information spécifique et d\'une autorisation dédiée.</p></blockquote>\n\n<h2>6. Connexions, messagerie et rendez-vous</h2>\n<p>Instanct vous permet de demander une connexion, d\'échanger des messages et d\'organiser des rendez-vous.</p>\n<p>Vous vous engagez à utiliser ces fonctionnalités de manière professionnelle, loyale et respectueuse. Le harcèlement, les propos discriminatoires, les menaces, le spam et toute sollicitation non professionnelle répétée sont interdits.</p>\n<p>Le contenu des conversations privées n\'est pas communiqué à des partenaires, sauf si vous choisissez de le partager ou si un accès est indispensable pour examiner un signalement, assurer la sécurité du service ou respecter une obligation légale.</p>\n<h2>7. Contenus</h2>\n<p>Vous conservez vos droits sur les contenus que vous publiez. Vous concédez à Instanct une licence limitée, non exclusive et mondiale pour héberger, afficher et diffuser ces contenus afin d\'exploiter le service.</p>\n<p>Vous garantissez disposer des droits nécessaires sur les contenus que vous publiez.</p>\n<p>Les autres utilisateurs peuvent effectuer des captures d\'écran ou conserver des informations vues dans l\'application. Instanct ne peut pas empêcher techniquement toutes les utilisations effectuées en dehors de la plateforme.</p>\n<h2>8. Usages interdits</h2>\n<p>Il est interdit de :</p>\n<ul><li>\n<p>harceler, menacer ou discriminer d\'autres utilisateurs ;</p></li><li>\n<p>publier un contenu illicite, trompeur ou nuisible ;</p></li><li>\n<p>extraire, scraper ou réutiliser massivement les données de la plateforme ;</p></li><li>\n<p>contourner les mesures de sécurité ou d\'accès ;</p></li><li>\n<p>utiliser Instanct à des fins de surveillance, de publicité non sollicitée ou d\'activités contraires à l\'ordre public.</p></li></ul>\n\n<blockquote class=\"legal-not-applied\">\n<p>L\'accès au carnet d\'adresses ou au calendrier de l\'appareil n\'est pas proposé. S\'il l\'est ultérieurement, une autorisation dédiée et une information spécifique seront présentées avant tout import.</p></blockquote>\n\n<h2>9. Espaces partenaires et événements</h2>\n<blockquote class=\"legal-not-applied\">\n<p>Les espaces créés pour des organisateurs, hôtels, salons ou entreprises, la transmission de listes de participants et l\'administration d\'événements par des partenaires ne sont pas encore en service. Instanct n\'agit donc pas, à ce jour, comme sous-traitant d\'un organisateur pour ces finalités. Ces clauses s\'appliqueront uniquement lorsque la fonctionnalité correspondante sera ouverte et que l\'organisateur aura informé les participants.</p></blockquote>\n\n<h2>10. Disponibilité et évolution</h2>\n<p>Instanct est fourni en l\'état. Nous pouvons modifier, suspendre ou interrompre tout ou partie du service, notamment pour maintenance, sécurité ou évolution des fonctionnalités.</p>\n<p>Nous pouvons mettre à jour les présentes conditions. En cas de modification importante, nous vous en informerons dans l\'application, par e-mail ou par un autre moyen approprié avant son entrée en vigueur.</p>\n<h2>11. Responsabilité</h2>\n<p>Dans les limites autorisées par la loi, Instanct n\'est pas responsable :</p>\n<ul><li>\n<p>des rencontres, échanges ou rendez-vous organisés entre utilisateurs ;</p></li><li>\n<p>des contenus publiés par les utilisateurs ;</p></li><li>\n<p>des interruptions, erreurs ou pertes de données liées à un cas de force majeure, à un prestataire tiers ou à une mauvaise utilisation du service.</p></li></ul>\n\n<p>Aucun service numérique ne peut garantir une sécurité ou une disponibilité absolue. Vous devez protéger vos identifiants et nous signaler rapidement toute activité suspecte.</p>\n<h2>12. Suspension et suppression</h2>\n<p>Nous pouvons suspendre ou supprimer un compte en cas de violation des présentes conditions, de risque pour la sécurité ou d\'obligation légale.</p>\n<p>Vous pouvez demander la suppression de votre compte depuis l\'application ou à l\'adresse <mark>{{company.privacyEmail}}</mark>.</p>\n<p>La suppression entraîne la désactivation du profil, la fin de la visibilité sur la carte et la suppression ou l\'anonymisation des données personnelles, sous réserve des conservations légales ou de sécurité.</p>\n<h2>13. Données personnelles</h2>\n<p>Le traitement de vos données est décrit dans la politique de confidentialité, qui fait partie intégrante des présentes conditions.</p>\n<p>Instanct ne vend pas vos données personnelles.</p>\n<h2>14. Droit applicable</h2>\n<p>Les présentes conditions sont régies par le droit français.</p>\n<p>En cas de litige, et à défaut de résolution amiable, les tribunaux compétents seront ceux du ressort du siège social d\'Instanct, sous réserve des règles d\'ordre public applicables aux consommateurs ou professionnels concernés.</p>\n<h2>15. Contact</h2>\n<p>Instanct – Protection des données</p>\n<p><mark>{{company.legalName}}</mark></p>\n<p><mark>{{company.privacyEmail}}</mark></p>',
        'fr'
    ),
    (
        '2026-09-22 17:00:39.192518',
        '2026-09-24 11:35:52.000000',
        NULL,
        0,
        '97b62151-15af-424a-bcfd-47b60c04d2e1',
        'privacy',
        'Privacy Policy',
        'How Instanct processes your data.',
        '<p>Version of September 20, 2026</p>\n<p>Highlighted passages identify either information yet to be confirmed or processing or features that are not yet applied.</p>\n<h2>1. Our Commitment</h2>\n<p>Instanct is a real-time professional networking platform. It allows people present in the same location, establishment, or event to voluntarily make themselves visible, discover relevant professional profiles, and connect.</p>\n<p>Privacy protection is built into how Instanct operates. In particular, you retain control over:</p>\n<ul><li>\n<p>the information displayed on your profile;</p></li><li>\n<p>your presence in a space;</p></li><li>\n<p>your visibility on the map;</p></li><li>\n<p>who can contact you;</p></li><li>\n<p>the use of your location;</p></li><li>\n<p>your connections and conversations;</p></li><li>\n<p>the deletion of your data and account.</p></li></ul>\n\n<p>Instanct does not sell your personal data.</p>\n<h2>2. Data Controller</h2>\n<p>The data controller is:</p>\n<p><strong><mark>{{company.legalName}}</mark></strong></p>\n<p><mark>{{company.legalForm}}</mark></p>\n<p>Registered office: <mark>{{company.address}}</mark></p>\n<p>RCS/SIREN: <mark>{{company.rcs}}</mark></p>\n<p>Data protection email: <mark>{{company.privacyEmail}}</mark></p>\n<p>In this policy, the terms \"Instanct\", \"we\", and \"our\" refer to this company.</p>\n<h2>3. Services Covered</h2>\n<p>This policy applies:</p>\n<ul><li>\n<p>to the Instanct mobile application;</p></li><li>\n<p>to the Instanct website;</p></li><li>\n<p>to map, networking, messaging, and appointment scheduling features.</p></li></ul>\n\n<blockquote class=\"legal-not-applied\">\n<p>This policy also mentions, for information purposes, Instanct Open public spaces, Instanct Spaces private, semi-public, or VIP spaces, spaces created for hotels, lounges, coworkings, trade shows, congresses, business clubs, campuses, or companies, as well as beta versions distributed via TestFlight. These services are not yet open. Processing that exists solely for these spaces does not apply until put into production.</p></blockquote>\n\n<h2>4. Data You Provide to Us</h2>\n<h3>4.1 Account Creation</h3>\n<p>We may collect:</p>\n<ul><li>\n<p>your first and last name;</p></li><li>\n<p>your email address;</p></li><li>\n<p>your phone number, when requested;</p></li><li>\n<p>your password in a secure form;</p></li><li>\n<p>your language;</p></li><li>\n<p>your profile picture;</p></li><li>\n<p>your user ID.</p></li></ul>\n\n<h3>4.2 Professional Profile</h3>\n<p>You may voluntarily add:</p>\n<ul><li>\n<p>your job title;</p></li><li>\n<p>your company or organization;</p></li><li>\n<p>your industry / sector;</p></li><li>\n<p>your skills and areas of expertise;</p></li><li>\n<p>a professional bio / presentation;</p></li><li>\n<p>your professional contact details;</p></li><li>\n<p>your professional links;</p></li><li>\n<p>your areas of interest;</p></li><li>\n<p>your networking goals;</p></li><li>\n<p>your availability;</p></li><li>\n<p>languages you speak.</p></li></ul>\n\n<p>You must not publish sensitive or confidential information that you do not wish to make visible to other authorized users.</p>\n<h3>4.3 Networking Goals</h3>\n<p>You can indicate the reason why you wish to be contacted, for example:</p>\n<ul><li>\n<p>seeking clients;</p></li><li>\n<p>meeting partners;</p></li><li>\n<p>finding investors;</p></li><li>\n<p>recruiting or seeking career opportunities;</p></li><li>\n<p>offering or seeking expertise;</p></li><li>\n<p>expanding your network;</p></li><li>\n<p>organizing a meeting.</p></li></ul>\n\n<p>This information is used to facilitate relevant professional connections.</p>\n<h3>4.4 Communications</h3>\n<p>We process information related to:</p>\n<ul><li>\n<p>connection requests;</p></li><li>\n<p>acceptances and rejections;</p></li><li>\n<p>professional contacts created;</p></li><li>\n<p>messages exchanged;</p></li><li>\n<p>appointments organized;</p></li><li>\n<p>blocked users;</p></li><li>\n<p>reports submitted to our team.</p></li></ul>\n\n<p>The content of private conversations is not shared with organizers, hotels, or other partners, except when a user chooses to share it or access is essential to investigate a report, ensure service security, or comply with a legal obligation.</p>\n<h2>5. Location and Instanct Map</h2>\n<h3>5.1 General Operation</h3>\n<p>The Instanct map allows viewing venues, events, professional spaces, and, when users have voluntarily authorized it, their presence in an area.</p>\n<p>The map is not intended to provide continuous tracking of movements.</p>\n<p>Depending on the features used and authorizations granted, Instanct may process:</p>\n<ul><li>\n<p>an approximate location inferred from the IP address;</p></li><li>\n<p>the venue or event joined;</p></li><li>\n<p>a manually selected area;</p></li><li>\n<p>the device position provided by the operating system;</p></li><li>\n<p>a precise GPS position when the user expressly authorizes it;</p></li><li>\n<p>the date, time, and duration of presence in a space;</p></li><li>\n<p>the point or area displayed on the map.</p></li></ul>\n\n<h3>5.2 Voluntary Activation</h3>\n<p>User visibility on the map must be enabled voluntarily.</p>\n<p>Authorization given to the operating system does not automatically mean position is visible to other users. Visibility on Instanct also depends on settings chosen within the app.</p>\n<p>Users can in particular:</p>\n<ul><li>\n<p>appear only in a venue or general area;</p></li><li>\n<p>authorize a more precise position when offered;</p></li><li>\n<p>limit visibility to participants in the same space;</p></li><li>\n<p>deactivate their presence;</p></li><li>\n<p>leave a venue or event;</p></li><li>\n<p>remove location authorization in phone settings.</p></li></ul>\n\n<h3>5.3 Precise Location</h3>\n<p>When precise location is required for a feature, Instanct asks for user permission before accessing GPS data.</p>\n<p>Unless otherwise clearly presented to the user:</p>\n<ul><li>\n<p>Instanct does not continuously track movements;</p></li><li>\n<p>Instanct does not use location in the background;</p></li><li>\n<p>position is not publicly accessible on the internet;</p></li><li>\n<p>position is not sold to advertisers;</p></li><li>\n<p>partners do not receive detailed movement history;</p></li><li>\n<p>an exact position is not communicated to other users when a venue-level or area-level indication is sufficient.</p></li></ul>\n\n<blockquote class=\"legal-not-applied\">\n<p>If a background location feature is added later, it will be subject to specific information and dedicated authorization. This feature is not active.</p></blockquote>\n\n<h3>5.4 Temporary Presence</h3>\n<p>Presence on the map is designed as temporary information.</p>\n<p>It may end:</p>\n<ul><li>\n<p>when the user deactivates presence;</p></li><li>\n<p>when voluntarily leaving the space;</p></li><li>\n<p>upon expiration of the selected session;</p></li><li>\n<p>upon event closure;</p></li><li>\n<p>after a period of inactivity.</p></li></ul>\n\n<p>Instanct may temporarily retain certain technical data related to the session to ensure security, prevent abuse, and resolve incidents. This data must not be used to reconstruct user movements over time.</p>\n<h3>5.5 Security and Vigilance</h3>\n<p>Even when a position is displayed at a venue or area level, it may reveal that a person is inside an establishment or attending an event.</p>\n<p>Each user must therefore check their settings before activating visibility and avoid displaying position when they believe it could pose a risk.</p>\n<p>Other users may take screenshots or retain information seen in the application. Instanct cannot technically prevent all uses made outside the platform.</p>\n<h2>6. Data from Organizers and Partners</h2>\n<blockquote class=\"legal-not-applied\">\n<p>When a user attends a trade show, congress, professional event, or accesses a partner space, the organizer may transmit certain information to us, for example:</p>\n<ul><li>\n<p>first and last name;</p></li><li>\n<p>professional email address;</p></li><li>\n<p>company and job title;</p></li><li>\n<p>badge number or registration ID;</p></li><li>\n<p>participant category;</p></li><li>\n<p>selected program or sessions;</p></li><li>\n<p>access rights to certain areas;</p></li><li>\n<p>participant or exhibitor lists;</p></li><li>\n<p>scheduled appointments.</p></li></ul>\n\n<p>This processing is not yet implemented. It will apply only when an organizer effectively transmits data to Instanct and has informed participants of this transmission.</p></blockquote>\n\n<h2>7. Roles of Instanct and Organizers</h2>\n<h3>7.1 Instanct as Data Controller</h3>\n<p>Instanct generally acts as data controller for:</p>\n<ul><li>\n<p>creation and management of the global account;</p></li><li>\n<p>the Instanct profile;</p></li><li>\n<p>connections and messaging;</p></li><li>\n<p>privacy settings;</p></li><li>\n<p>platform security;</p></li><li>\n<p>general map operation;</p></li><li>\n<p>service improvement;</p></li><li>\n<p>user rights management.</p></li></ul>\n\n<h3>7.2 Instanct as Data Processor</h3>\n<blockquote class=\"legal-not-applied\">\n<p>Instanct may act as data processor when an organizer or partner asks us to process data exclusively to administer their event or space. This situation is not yet in production. In this case, the organizer or partner will determine processing purposes, and requests specifically concerning data entrusted to us by them may need to be addressed to them.</p></blockquote>\n\n<h3>7.3 Organizer as Separate Controller</h3>\n<blockquote class=\"legal-not-applied\">\n<p>An organizer may use certain data for its own purposes, such as managing registrations, controlling access, organizing meetings, analyzing attendance, communicating with participants, and fulfilling security obligations. Such processing will fall under the organizer\'s privacy policy. It does not apply while no partner space is open.</p></blockquote>\n\n<h2>8. Automatically Collected Data</h2>\n<p>When using Instanct, we may collect:</p>\n<ul><li>\n<p>IP address;</p></li><li>\n<p>device model;</p></li><li>\n<p>operating system;</p></li><li>\n<p>app version;</p></li><li>\n<p>language and time zone;</p></li><li>\n<p>technical identifiers;</p></li><li>\n<p>connection dates and times;</p></li><li>\n<p>screens and features used;</p></li><li>\n<p>error and crash reports;</p></li><li>\n<p>security logs;</p></li><li>\n<p>permission settings communicated by the device.</p></li></ul>\n\n<blockquote class=\"legal-not-applied\">\n<p>QR codes or invitations used to join an event space are not yet collected.</p></blockquote>\n\n<p>We limit this collection to information necessary for operation, security, statistics, and service improvement.</p>\n<h2>9. How We Use Your Data</h2>\n<p>We use data to:</p>\n<ul><li>\n<p>create and administer your account;</p></li><li>\n<p>display your profile according to your settings;</p></li><li>\n<p>allow you to join a venue or event;</p></li><li>\n<p>display your voluntary presence on the map;</p></li><li>\n<p>suggest profiles matching your criteria;</p></li><li>\n<p>facilitate connections and appointments;</p></li><li>\n<p>provide messaging;</p></li><li>\n<p>send notifications;</p></li><li>\n<p>personalize your experience;</p></li><li>\n<p>compile aggregated statistics;</p></li><li>\n<p>detect fake accounts, fraud, and abusive behavior;</p></li><li>\n<p>respond to support requests;</p></li><li>\n<p>improve features;</p></li><li>\n<p>comply with legal obligations.</p></li></ul>\n\n<blockquote class=\"legal-not-applied\">\n<p>Administration of partner spaces is not yet active.</p></blockquote>\n\n<p>Instanct does not use the content of your private conversations to display targeted advertising.</p>\n<p>Instanct does not use your private conversations or precise GPS data to train artificial intelligence systems without prior notification and an appropriate legal basis.</p>\n<h2>10. Legal Bases</h2>\n<p>Processing relies, depending on the case, on:</p>\n<ul><li>\n<p>contract performance, to provide the account, profile, connections, messaging, and requested features;</p></li><li>\n<p>consent, notably for precise location, certain notifications, device contacts, or commercial communications;</p></li><li>\n<p>legitimate interest, to secure the service, prevent fraud, improve Instanct, and generate aggregated statistics;</p></li><li>\n<p>legal obligation, when we must retain or disclose certain information.</p></li></ul>\n\n<p>You may withdraw your consent at any time. Withdrawal does not affect the lawfulness of processing carried out prior to withdrawal.</p>\n<blockquote class=\"legal-not-applied\">\n<p>Access to phone contacts and commercial communications are not yet offered. Corresponding consent is therefore not collected to date.</p></blockquote>\n\n<h2>11. Information Visibility</h2>\n<p>Depending on your settings and the space joined, other users can see:</p>\n<ul><li>\n<p>your name and photo;</p></li><li>\n<p>your job title and company;</p></li><li>\n<p>your professional bio;</p></li><li>\n<p>your skills;</p></li><li>\n<p>your goals;</p></li><li>\n<p>your availability;</p></li><li>\n<p>your presence in a venue or area;</p></li><li>\n<p>your available appointment slots.</p></li></ul>\n\n<p>Your email address, phone number, exact GPS position, and private messages are not made visible unless expressly authorized or shared by you.</p>\n<h2>12. Controlling Your Information</h2>\n<p>You can in particular:</p>\n<ul><li>\n<p>edit your profile;</p></li><li>\n<p>hide certain information;</p></li><li>\n<p>enable or disable presence;</p></li><li>\n<p>control your visibility on the map;</p></li><li>\n<p>reject or accept a connection;</p></li><li>\n<p>block and report a user;</p></li><li>\n<p>turn off certain notifications;</p></li><li>\n<p>revoke location access;</p></li><li>\n<p>leave a space;</p></li><li>\n<p>request a copy of your data;</p></li><li>\n<p>delete your account.</p></li></ul>\n\n<p>Revoking permission may prevent certain features from working without preventing the use of other available functions.</p>\n<h2>13. Information Accessible to Partners</h2>\n<blockquote class=\"legal-not-applied\">\n<p>Partners and organizers may receive information necessary for managing their space as well as statistics, such as number of active participants, participation rate, connection volume, appointment count, general professional goal categories, peak periods and areas, and feature usage. These transmissions are not yet conducted.</p>\n<p>When implemented, statistics will, as far as possible, be aggregated or anonymized. Partners will not receive private conversation content, passwords, precise GPS position, detailed movement history, or unshared private contact details.</p></blockquote>\n\n<h2>14. Other Recipients</h2>\n<p>Data may be processed by:</p>\n<ul><li>\n<p>authorized Instanct personnel;</p></li><li>\n<p>other users according to your settings;</p></li><li>\n<p>hosting providers;</p></li><li>\n<p>authentication providers;</p></li><li>\n<p>mapping services;</p></li><li>\n<p>notification providers;</p></li><li>\n<p>diagnostic and audience measurement tools;</p></li><li>\n<p>support and security providers;</p></li><li>\n<p>Apple or Google for app distribution;</p></li><li>\n<p>competent authorities when required by law.</p></li></ul>\n\n<blockquote class=\"legal-not-applied\">\n<p>Authorized administrators of a partner space do not yet receive data, as no partner space is currently open.</p></blockquote>\n\n<p>Our processors may only use data in accordance with our contractual instructions.</p>\n<h2>15. Mapping Service</h2>\n<p>The map may rely on one or more external providers.</p>\n<p>Providers currently planned:</p>\n<mark>{{maps.providers}}</mark>\n<p>When the map is loaded, these providers may receive technical data such as IP address, device type, displayed area, or information necessary to deliver the map.</p>\n<h2>16. Contacts and Calendar</h2>\n<blockquote class=\"legal-not-applied\">\n<p>Instanct does not currently access device contacts or calendar. If offered, we will explain what data is imported, for what purpose, retention duration, and how to delete imported information. Refusing access will not prevent manual networking features from working.</p></blockquote>\n\n<h2>17. Retention Periods</h2>\n<p>We apply the following retention periods:</p>\n<ul><li>\n<p><strong>Account and profile</strong> — While the account is in use</p></li><li>\n<p><strong>Inactive account</strong> — Deletion or anonymization after 3 years of inactivity</p></li><li>\n<p><strong>Visible map presence</strong> — Duration of session or event</p></li><li>\n<p><strong>Precise position linked to a session</strong> — Deletion or conversion to non-precise data after session end, except security incidents</p></li><li>\n<p><strong>Technical location logs</strong> — Maximum 30 days, except incidents or legal obligation</p></li><li>\n<p><strong>Professional connections</strong> — Until deleted by user or account deletion</p></li><li>\n<p><strong>Messages</strong> — Until deleted by user or account deletion</p></li><li>\n<p><strong>Security logs</strong> — Maximum 12 months</p></li><li>\n<p><strong>Support requests</strong> — Up to 3 years after closure</p></li></ul>\n\n<blockquote class=\"legal-not-applied\">\n<p>The following durations do not yet apply as corresponding processing is not in production:</p>\n<ul><li>\n<p><strong>Event data</strong> — Duration defined with organizer, then deletion or anonymization</p></li><li>\n<p><strong>Billing data</strong> — 10 years</p></li><li>\n<p><strong>Commercial prospecting</strong> — 3 years after last active contact</p></li></ul>\n</blockquote>\n\n<p>Data may be retained longer when justified by a legal obligation, litigation, serious report, or security requirement.</p>\n<p>Backup copies are progressively deleted according to our technical cycles.</p>\n<h2>18. Hosting and International Transfers</h2>\n<p>Data is hosted by:</p>\n<p><strong><mark>{{hosting.provider}}</mark></strong></p>\n<p><mark>{{hosting.country}}</mark></p>\n<p><mark>{{hosting.address}}</mark></p>\n<p>We prioritize hosting within the European Union or European Economic Area.</p>\n<p>When data is transferred to a country outside this area, we use a recognized mechanism such as an adequacy decision or European Commission standard contractual clauses.</p>\n<h2>19. Security</h2>\n<p>We implement appropriate measures, including:</p>\n<ul><li>\n<p>encrypted communications;</p></li><li>\n<p>password protection;</p></li><li>\n<p>access control;</p></li><li>\n<p>logging of sensitive access;</p></li><li>\n<p>backups;</p></li><li>\n<p>incident management procedures;</p></li><li>\n<p>processor monitoring;</p></li><li>\n<p>blocking and reporting mechanisms.</p></li></ul>\n\n<blockquote class=\"legal-not-applied\">\n<p>Separation of partner spaces is not yet operational, as these spaces are not open.</p></blockquote>\n\n<p>No digital service can guarantee absolute security. You must protect your credentials and promptly report suspicious activity.</p>\n<h2>20. No Data Selling or Behavioral Advertising</h2>\n<p>Instanct does not sell or rent your personal data.</p>\n<p>As of the date of this policy, Instanct does not use your precise position, private messages, or networking activity to track you across third-party apps and websites.</p>\n<p>If an ad model or cross-app tracking system were introduced, this policy and disclosures to Apple and Google would be updated beforehand, and required consents would be collected.</p>\n<h2>21. Minor Users</h2>\n<p>Instanct is intended for professionals aged at least 18 years old.</p>\n<p>We do not knowingly collect data from minors. When an account belonging to a minor is identified, it may be suspended and deleted.</p>\n<h2>22. Your Rights</h2>\n<p>You can request:</p>\n<ul><li>\n<p>access to your data;</p></li><li>\n<p>rectification;</p></li><li>\n<p>erasure;</p></li><li>\n<p>restriction of processing;</p></li><li>\n<p>data portability;</p></li><li>\n<p>objection to processing;</p></li><li>\n<p>withdrawal of consent;</p></li><li>\n<p>a copy of your data;</p></li><li>\n<p>information on international transfers;</p></li><li>\n<p>directives regarding your data after your death.</p></li></ul>\n\n<p>You can exercise your rights within the app or by writing to:</p>\n<p><mark>{{company.privacyEmail}}</mark></p>\n<p>We may request proof of identity only in case of reasonable doubt.</p>\n<p>We normally respond within one month, subject to regulatory extensions.</p>\n<p>You can also lodge a complaint with the CNIL:</p>\n<p>Commission Nationale de l\'Informatique et des Libertés</p>\n<p>3 Place de Fontenoy</p>\n<p>TSA 80715</p>\n<p>75334 Paris Cedex 07</p>\n<p><a target=\"_blank\" rel=\"noopener noreferrer nofollow\" href=\"https://www.cnil.fr\">www.cnil.fr</a></p>\n<h2>23. Account Deletion</h2>\n<p>You can request account deletion directly from the app or at <mark>{{company.privacyEmail}}</mark>.</p>\n<p>Deletion results in:</p>\n<ul><li>\n<p>profile deactivation;</p></li><li>\n<p>end of map visibility;</p></li><li>\n<p>removal from active spaces;</p></li><li>\n<p>deletion or anonymization of personal data;</p></li><li>\n<p>removal of connections and content per applicable rules.</p></li></ul>\n\n<p>Certain information may be temporarily retained to comply with legal obligations, investigate reports, or defend legal rights.</p>\n<h2>24. Changes to This Policy</h2>\n<p>We may update this policy as features, providers, or regulations evolve.</p>\n<p>In the event of material changes, we will notify you in the application, by email, or through another appropriate medium before taking effect.</p>\n<h2>25. Contact Us</h2>\n<p>For any questions regarding your data:</p>\n<p>Instanct – Data Protection</p>\n<p><mark>{{company.legalName}}</mark></p>\n<p><mark>{{company.address}}</mark></p>\n<p><mark>{{company.privacyEmail}}</mark></p>',
        'en'
    ),
    (
        '2026-09-22 17:00:39.174610',
        '2026-09-22 20:49:16.000000',
        NULL,
        0,
        '9ed3cd33-18fd-4357-8132-54d85913b610',
        'terms',
        'Terms of Service',
        'Rules for using Instanct.',
        '<p>Version of September 20, 2026</p>\n<p>Highlighted passages identify either information yet to be confirmed (company identity, host, map provider) or features that are not yet in production.</p>\n<h2>1. Purpose</h2>\n<p>Instanct is a real-time professional networking platform. It allows people present in the same location to voluntarily make themselves visible, discover relevant professional profiles, and connect.</p>\n<p>These terms govern access to and use of:</p>\n<ul><li>\n<p>the Instanct mobile application;</p></li><li>\n<p>the Instanct website;</p></li><li>\n<p>map, networking, messaging, and appointment scheduling features.</p></li></ul>\n\n<blockquote class=\"legal-not-applied\">\n<p>Instanct Open spaces, Instanct Spaces, VIP areas, hotels, lounges, coworkings, trade shows, congresses, business clubs, campuses, or companies, as well as beta versions distributed via TestFlight, are not yet offered. These mentions have no effect until the corresponding feature is opened.</p></blockquote>\n\n<p>By creating an account or using Instanct, you accept these terms and the privacy policy.</p>\n<h2>2. Service Publisher</h2>\n<p>The service is published by:</p>\n<p><strong><mark>{{company.legalName}}</mark></strong></p>\n<p><mark>{{company.legalForm}}</mark></p>\n<p>Registered office: <mark>{{company.address}}</mark></p>\n<p>RCS/SIREN: <mark>{{company.rcs}}</mark></p>\n<p>In these terms, \"Instanct\", \"we\", and \"our\" refer to this company.</p>\n<p>For any questions: <mark>{{company.privacyEmail}}</mark> or <mark>{{company.support}}</mark></p>\n<h2>3. Service Access</h2>\n<p>Instanct is intended for professionals aged at least 18 years old.</p>\n<p>To use the service, you must:</p>\n<ul><li>\n<p>create an account with accurate and up-to-date information;</p></li><li>\n<p>maintain the confidentiality of your credentials;</p></li><li>\n<p>promptly report any unauthorized use of your account to us.</p></li></ul>\n\n<p>You are responsible for all activity conducted from your account.</p>\n<p>Refusing certain phone permissions (location, notifications) may limit features without preventing the use of other available functions.</p>\n<h2>4. Account and Profile</h2>\n<p>You may fill out a professional profile including your name, photo, job title, company, skills, networking goals, and availability.</p>\n<p>You must not publish sensitive, confidential, or misleading information. You must not impersonate another person.</p>\n<p>Instanct may suspend or delete an account in the event of manifestly false information, identity theft, or breach of these terms.</p>\n<h2>5. Map, Location, and Visibility</h2>\n<p>The Instanct map allows viewing locations and, when voluntarily authorized, your presence in an area.</p>\n<p>Visibility on the map must be enabled voluntarily. Authorization given to the operating system does not automatically mean your position is visible to other users.</p>\n<p>You can in particular:</p>\n<ul><li>\n<p>appear only in a specific location or general area;</p></li><li>\n<p>limit your visibility;</p></li><li>\n<p>deactivate your presence;</p></li><li>\n<p>remove location authorization in your phone settings.</p></li></ul>\n\n<p>Even an indication at a venue level may reveal that you are inside an establishment. Check your settings before enabling visibility.</p>\n<blockquote class=\"legal-not-applied\">\n<p>Background location tracking is not offered. If added later, it will be subject to specific information and dedicated authorization.</p></blockquote>\n\n<h2>6. Connections, Messaging, and Appointments</h2>\n<p>Instanct allows you to request connections, exchange messages, and organize appointments.</p>\n<p>You commit to using these features in a professional, fair, and respectful manner. Harassment, discriminatory language, threats, spam, and repeated unsolicited requests are strictly prohibited.</p>\n<p>The content of private conversations is not shared with partners unless you choose to share it or access is essential to investigate a report, ensure service security, or comply with a legal obligation.</p>\n<h2>7. Content</h2>\n<p>You retain your rights to the content you publish. You grant Instanct a limited, non-exclusive, worldwide license to host, display, and distribute this content to operate the service.</p>\n<p>You guarantee that you hold the necessary rights to the content you publish.</p>\n<p>Other users may take screenshots or retain information seen in the application. Instanct cannot technically prevent all uses made outside the platform.</p>\n<h2>8. Prohibited Uses</h2>\n<p>It is forbidden to:</p>\n<ul><li>\n<p>harass, threaten, or discriminate against other users;</p></li><li>\n<p>publish illegal, misleading, or harmful content;</p></li><li>\n<p>extract, scrape, or massively reuse platform data;</p></li><li>\n<p>bypass security or access control measures;</p></li><li>\n<p>use Instanct for surveillance, unsolicited advertising, or activities contrary to public order.</p></li></ul>\n\n<blockquote class=\"legal-not-applied\">\n<p>Access to device contacts or calendar is not offered. If added later, dedicated authorization and specific information will be presented before any import.</p></blockquote>\n\n<h2>9. Partner Spaces and Events</h2>\n<blockquote class=\"legal-not-applied\">\n<p>Spaces created for organizers, hotels, trade shows, or companies, participant list transmission, and event administration by partners are not yet in service. Instanct does not act as a subcontractor for an organizer for these purposes. These clauses will apply only when the corresponding feature opens.</p></blockquote>\n\n<h2>10. Availability and Evolution</h2>\n<p>Instanct is provided as is. We may modify, suspend, or interrupt all or part of the service, in particular for maintenance, security, or feature evolution.</p>\n<p>We may update these terms. In the event of a material change, we will notify you in the application, by email, or through another appropriate medium before it takes effect.</p>\n<h2>11. Liability</h2>\n<p>To the extent permitted by law, Instanct is not responsible for:</p>\n<ul><li>\n<p>meetings, exchanges, or appointments organized between users;</p></li><li>\n<p>content published by users;</p></li><li>\n<p>interruptions, errors, or data losses related to force majeure, third-party providers, or misuse of the service.</p></li></ul>\n\n<p>No digital service can guarantee absolute security or availability. You must protect your credentials and promptly report any suspicious activity.</p>\n<h2>12. Suspension and Termination</h2>\n<p>We may suspend or delete an account in the event of a violation of these terms, security risk, or legal obligation.</p>\n<p>You may request account deletion from the application or at <mark>{{company.privacyEmail}}</mark>.</p>\n<p>Deletion results in profile deactivation, end of map visibility, and deletion or anonymization of personal data, subject to legal or security retention requirements.</p>\n<h2>13. Personal Data</h2>\n<p>The processing of your data is described in the Privacy Policy, which forms an integral part of these terms.</p>\n<p>Instanct does not sell your personal data.</p>\n<h2>14. Applicable Law</h2>\n<p>These terms are governed by French law.</p>\n<p>In the event of a dispute, failing amicable resolution, competent courts will be those within the jurisdiction of Instanct\'s registered office, subject to mandatory rules applicable to consumers or professionals concerned.</p>\n<h2>15. Contact</h2>\n<p>Instanct – Data Protection</p>\n<p><mark>{{company.legalName}}</mark></p>\n<p><mark>{{company.privacyEmail}}</mark></p>',
        'en'
    );

-- --------------------------------------------------------
-- Seed data for `template-styles`
-- --------------------------------------------------------

INSERT IGNORE INTO
    `template-styles` (
        `createdAt`,
        `updatedAt`,
        `deletedAt`,
        `isDeletionRestricted`,
        `id`,
        `name`,
        `content`
    )
VALUES (
        '2026-08-06 00:02:47.910213',
        '2026-08-06 00:02:47.910213',
        NULL,
        0,
        'a1f63ae3-2992-4df4-be69-ba67263940b0',
        'bootstrap',
        '@charset \"UTF-8\"; /*!\n * Bootstrap  v5.3.3 (https://getbootstrap.com/)\n * Copyright 2011-2024 The Bootstrap Authors\n * Licensed under MIT (https://github.com/twbs/bootstrap/blob/main/LICENSE)\n */\n:root,\n[data-bs-theme=\'light\'] {\n  --bs-blue: #0d6efd;\n  --bs-indigo: #6610f2;\n  --bs-purple: #6f42c1;\n  --bs-pink: #d63384;\n  --bs-red: #dc3545;\n  --bs-orange: #fd7e14;\n  --bs-yellow: #ffc107;\n  --bs-green: #198754;\n  --bs-teal: #20c997;\n  --bs-cyan: #0dcaf0;\n  --bs-black: #000;\n  --bs-white: #fff;\n  --bs-gray: #6c757d;\n  --bs-gray-dark: #343a40;\n  --bs-gray-100: #f8f9fa;\n  --bs-gray-200: #e9ecef;\n  --bs-gray-300: #dee2e6;\n  --bs-gray-400: #ced4da;\n  --bs-gray-500: #adb5bd;\n  --bs-gray-600: #6c757d;\n  --bs-gray-700: #495057;\n  --bs-gray-800: #343a40;\n  --bs-gray-900: #212529;\n  --bs-primary: #0d6efd;\n  --bs-secondary: #6c757d;\n  --bs-success: #198754;\n  --bs-info: #0dcaf0;\n  --bs-warning: #ffc107;\n  --bs-danger: #dc3545;\n  --bs-light: #f8f9fa;\n  --bs-dark: #212529;\n  --bs-primary-rgb: 13, 110, 253;\n  --bs-secondary-rgb: 108, 117, 125;\n  --bs-success-rgb: 25, 135, 84;\n  --bs-info-rgb: 13, 202, 240;\n  --bs-warning-rgb: 255, 193, 7;\n  --bs-danger-rgb: 220, 53, 69;\n  --bs-light-rgb: 248, 249, 250;\n  --bs-dark-rgb: 33, 37, 41;\n  --bs-primary-text-emphasis: #052c65;\n  --bs-secondary-text-emphasis: #2b2f32;\n  --bs-success-text-emphasis: #0a3622;\n  --bs-info-text-emphasis: #055160;\n  --bs-warning-text-emphasis: #664d03;\n  --bs-danger-text-emphasis: #58151c;\n  --bs-light-text-emphasis: #495057;\n  --bs-dark-text-emphasis: #495057;\n  --bs-primary-bg-subtle: #cfe2ff;\n  --bs-secondary-bg-subtle: #e2e3e5;\n  --bs-success-bg-subtle: #d1e7dd;\n  --bs-info-bg-subtle: #cff4fc;\n  --bs-warning-bg-subtle: #fff3cd;\n  --bs-danger-bg-subtle: #f8d7da;\n  --bs-light-bg-subtle: #fcfcfd;\n  --bs-dark-bg-subtle: #ced4da;\n  --bs-primary-border-subtle: #9ec5fe;\n  --bs-secondary-border-subtle: #c4c8cb;\n  --bs-success-border-subtle: #a3cfbb;\n  --bs-info-border-subtle: #9eeaf9;\n  --bs-warning-border-subtle: #ffe69c;\n  --bs-danger-border-subtle: #f1aeb5;\n  --bs-light-border-subtle: #e9ecef;\n  --bs-dark-border-subtle: #adb5bd;\n  --bs-white-rgb: 255, 255, 255;\n  --bs-black-rgb: 0, 0, 0;\n  --bs-font-sans-serif:\n    system-ui, -apple-system, \'Segoe UI\', Roboto, \'Helvetica Neue\', \'Noto Sans\',\n    \'Liberation Sans\', Arial, sans-serif, \'Apple Color Emoji\', \'Segoe UI Emoji\',\n    \'Segoe UI Symbol\', \'Noto Color Emoji\';\n  --bs-font-monospace:\n    SFMono-Regular, Menlo, Monaco, Consolas, \'Liberation Mono\', \'Courier New\',\n    monospace;\n  --bs-gradient: linear-gradient(\n    180deg,\n    rgba(255, 255, 255, 0.15),\n    rgba(255, 255, 255, 0)\n  );\n  --bs-body-font-family: var(--bs-font-sans-serif);\n  --bs-body-font-size: 1rem;\n  --bs-body-font-weight: 400;\n  --bs-body-line-height: 1.5;\n  --bs-body-color: #212529;\n  --bs-body-color-rgb: 33, 37, 41;\n  --bs-body-bg: #fff;\n  --bs-body-bg-rgb: 255, 255, 255;\n  --bs-emphasis-color: #000;\n  --bs-emphasis-color-rgb: 0, 0, 0;\n  --bs-secondary-color: rgba(33, 37, 41, 0.75);\n  --bs-secondary-color-rgb: 33, 37, 41;\n  --bs-secondary-bg: #e9ecef;\n  --bs-secondary-bg-rgb: 233, 236, 239;\n  --bs-tertiary-color: rgba(33, 37, 41, 0.5);\n  --bs-tertiary-color-rgb: 33, 37, 41;\n  --bs-tertiary-bg: #f8f9fa;\n  --bs-tertiary-bg-rgb: 248, 249, 250;\n  --bs-heading-color: inherit;\n  --bs-link-color: #0d6efd;\n  --bs-link-color-rgb: 13, 110, 253;\n  --bs-link-decoration: underline;\n  --bs-link-hover-color: #0a58ca;\n  --bs-link-hover-color-rgb: 10, 88, 202;\n  --bs-code-color: #d63384;\n  --bs-highlight-color: #212529;\n  --bs-highlight-bg: #fff3cd;\n  --bs-border-width: 1px;\n  --bs-border-style: solid;\n  --bs-border-color: #dee2e6;\n  --bs-border-color-translucent: rgba(0, 0, 0, 0.175);\n  --bs-border-radius: 0.375rem;\n  --bs-border-radius-sm: 0.25rem;\n  --bs-border-radius-lg: 0.5rem;\n  --bs-border-radius-xl: 1rem;\n  --bs-border-radius-xxl: 2rem;\n  --bs-border-radius-2xl: var(--bs-border-radius-xxl);\n  --bs-border-radius-pill: 50rem;\n  --bs-box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);\n  --bs-box-shadow-sm: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);\n  --bs-box-shadow-lg: 0 1rem 3rem rgba(0, 0, 0, 0.175);\n  --bs-box-shadow-inset: inset 0 1px 2px rgba(0, 0, 0, 0.075);\n  --bs-focus-ring-width: 0.25rem;\n  --bs-focus-ring-opacity: 0.25;\n  --bs-focus-ring-color: rgba(13, 110, 253, 0.25);\n  --bs-form-valid-color: #198754;\n  --bs-form-valid-border-color: #198754;\n  --bs-form-invalid-color: #dc3545;\n  --bs-form-invalid-border-color: #dc3545;\n}\n[data-bs-theme=\'dark\'] {\n  color-scheme: dark;\n  --bs-body-color: #dee2e6;\n  --bs-body-color-rgb: 222, 226, 230;\n  --bs-body-bg: #212529;\n  --bs-body-bg-rgb: 33, 37, 41;\n  --bs-emphasis-color: #fff;\n  --bs-emphasis-color-rgb: 255, 255, 255;\n  --bs-secondary-color: rgba(222, 226, 230, 0.75);\n  --bs-secondary-color-rgb: 222, 226, 230;\n  --bs-secondary-bg: #343a40;\n  --bs-secondary-bg-rgb: 52, 58, 64;\n  --bs-tertiary-color: rgba(222, 226, 230, 0.5);\n  --bs-tertiary-color-rgb: 222, 226, 230;\n  --bs-tertiary-bg: #2b3035;\n  --bs-tertiary-bg-rgb: 43, 48, 53;\n  --bs-primary-text-emphasis: #6ea8fe;\n  --bs-secondary-text-emphasis: #a7acb1;\n  --bs-success-text-emphasis: #75b798;\n  --bs-info-text-emphasis: #6edff6;\n  --bs-warning-text-emphasis: #ffda6a;\n  --bs-danger-text-emphasis: #ea868f;\n  --bs-light-text-emphasis: #f8f9fa;\n  --bs-dark-text-emphasis: #dee2e6;\n  --bs-primary-bg-subtle: #031633;\n  --bs-secondary-bg-subtle: #161719;\n  --bs-success-bg-subtle: #051b11;\n  --bs-info-bg-subtle: #032830;\n  --bs-warning-bg-subtle: #332701;\n  --bs-danger-bg-subtle: #2c0b0e;\n  --bs-light-bg-subtle: #343a40;\n  --bs-dark-bg-subtle: #1a1d20;\n  --bs-primary-border-subtle: #084298;\n  --bs-secondary-border-subtle: #41464b;\n  --bs-success-border-subtle: #0f5132;\n  --bs-info-border-subtle: #087990;\n  --bs-warning-border-subtle: #997404;\n  --bs-danger-border-subtle: #842029;\n  --bs-light-border-subtle: #495057;\n  --bs-dark-border-subtle: #343a40;\n  --bs-heading-color: inherit;\n  --bs-link-color: #6ea8fe;\n  --bs-link-hover-color: #8bb9fe;\n  --bs-link-color-rgb: 110, 168, 254;\n  --bs-link-hover-color-rgb: 139, 185, 254;\n  --bs-code-color: #e685b5;\n  --bs-highlight-color: #dee2e6;\n  --bs-highlight-bg: #664d03;\n  --bs-border-color: #495057;\n  --bs-border-color-translucent: rgba(255, 255, 255, 0.15);\n  --bs-form-valid-color: #75b798;\n  --bs-form-valid-border-color: #75b798;\n  --bs-form-invalid-color: #ea868f;\n  --bs-form-invalid-border-color: #ea868f;\n}\n*,\n::after,\n::before {\n  box-sizing: border-box;\n}\n@media (prefers-reduced-motion: no-preference) {\n  :root {\n    scroll-behavior: smooth;\n  }\n}\nbody {\n  margin: 0;\n  font-family: var(--bs-body-font-family);\n  font-size: var(--bs-body-font-size);\n  font-weight: var(--bs-body-font-weight);\n  line-height: var(--bs-body-line-height);\n  color: var(--bs-body-color);\n  text-align: var(--bs-body-text-align);\n  background-color: var(--bs-body-bg);\n  -webkit-text-size-adjust: 100%;\n  -webkit-tap-highlight-color: transparent;\n}\nhr {\n  margin: 1rem 0;\n  color: inherit;\n  border: 0;\n  border-top: var(--bs-border-width) solid;\n  opacity: 0.25;\n}\n.h1,\n.h2,\n.h3,\n.h4,\n.h5,\n.h6,\nh1,\nh2,\nh3,\nh4,\nh5,\nh6 {\n  margin-top: 0;\n  margin-bottom: 0.5rem;\n  font-weight: 500;\n  line-height: 1.2;\n  color: var(--bs-heading-color);\n}\n.h1,\nh1 {\n  font-size: calc(1.375rem + 1.5vw);\n}\n@media (min-width: 1200px) {\n  .h1,\n  h1 {\n    font-size: 2.5rem;\n  }\n}\n.h2,\nh2 {\n  font-size: calc(1.325rem + 0.9vw);\n}\n@media (min-width: 1200px) {\n  .h2,\n  h2 {\n    font-size: 2rem;\n  }\n}\n.h3,\nh3 {\n  font-size: calc(1.3rem + 0.6vw);\n}\n@media (min-width: 1200px) {\n  .h3,\n  h3 {\n    font-size: 1.75rem;\n  }\n}\n.h4,\nh4 {\n  font-size: calc(1.275rem + 0.3vw);\n}\n@media (min-width: 1200px) {\n  .h4,\n  h4 {\n    font-size: 1.5rem;\n  }\n}\n.h5,\nh5 {\n  font-size: 1.25rem;\n}\n.h6,\nh6 {\n  font-size: 1rem;\n}\np {\n  margin-top: 0;\n  margin-bottom: 1rem;\n}\nabbr[title] {\n  -webkit-text-decoration: underline dotted;\n  text-decoration: underline dotted;\n  cursor: help;\n  -webkit-text-decoration-skip-ink: none;\n  text-decoration-skip-ink: none;\n}\naddress {\n  margin-bottom: 1rem;\n  font-style: normal;\n  line-height: inherit;\n}\nol,\nul {\n  padding-left: 2rem;\n}\ndl,\nol,\nul {\n  margin-top: 0;\n  margin-bottom: 1rem;\n}\nol ol,\nol ul,\nul ol,\nul ul {\n  margin-bottom: 0;\n}\ndt {\n  font-weight: 700;\n}\ndd {\n  margin-bottom: 0.5rem;\n  margin-left: 0;\n}\nblockquote {\n  margin: 0 0 1rem;\n}\nb,\nstrong {\n  font-weight: bolder;\n}\n.small,\nsmall {\n  font-size: 0.875em;\n}\n.mark,\nmark {\n  padding: 0.1875em;\n  color: var(--bs-highlight-color);\n  background-color: var(--bs-highlight-bg);\n}\nsub,\nsup {\n  position: relative;\n  font-size: 0.75em;\n  line-height: 0;\n  vertical-align: baseline;\n}\nsub {\n  bottom: -0.25em;\n}\nsup {\n  top: -0.5em;\n}\na {\n  color: rgba(var(--bs-link-color-rgb), var(--bs-link-opacity, 1));\n  text-decoration: underline;\n}\na:hover {\n  --bs-link-color-rgb: var(--bs-link-hover-color-rgb);\n}\na:not([href]):not([class]),\na:not([href]):not([class]):hover {\n  color: inherit;\n  text-decoration: none;\n}\ncode,\nkbd,\npre,\nsamp {\n  font-family: var(--bs-font-monospace);\n  font-size: 1em;\n}\npre {\n  display: block;\n  margin-top: 0;\n  margin-bottom: 1rem;\n  overflow: auto;\n  font-size: 0.875em;\n}\npre code {\n  font-size: inherit;\n  color: inherit;\n  word-break: normal;\n}\ncode {\n  font-size: 0.875em;\n  color: var(--bs-code-color);\n  word-wrap: break-word;\n}\na > code {\n  color: inherit;\n}\nkbd {\n  padding: 0.1875rem 0.375rem;\n  font-size: 0.875em;\n  color: var(--bs-body-bg);\n  background-color: var(--bs-body-color);\n  border-radius: 0.25rem;\n}\nkbd kbd {\n  padding: 0;\n  font-size: 1em;\n}\nfigure {\n  margin: 0 0 1rem;\n}\nimg,\nsvg {\n  vertical-align: middle;\n}\ntable {\n  caption-side: bottom;\n  border-collapse: collapse;\n}\ncaption {\n  padding-top: 0.5rem;\n  padding-bottom: 0.5rem;\n  color: var(--bs-secondary-color);\n  text-align: left;\n}\nth {\n  text-align: inherit;\n  text-align: -webkit-match-parent;\n}\ntbody,\ntd,\ntfoot,\nth,\nthead,\ntr {\n  border-color: inherit;\n  border-style: solid;\n  border-width: 0;\n}\nlabel {\n  display: inline-block;\n}\nbutton {\n  border-radius: 0;\n}\nbutton:focus:not(:focus-visible) {\n  outline: 0;\n}\nbutton,\ninput,\noptgroup,\nselect,\ntextarea {\n  margin: 0;\n  font-family: inherit;\n  font-size: inherit;\n  line-height: inherit;\n}\nbutton,\nselect {\n  text-transform: none;\n}\n[role=\'button\'] {\n  cursor: pointer;\n}\nselect {\n  word-wrap: normal;\n}\nselect:disabled {\n  opacity: 1;\n}\n[list]:not([type=\'date\']):not([type=\'datetime-local\']):not([type=\'month\']):not(\n    [type=\'week\']\n  ):not([type=\'time\'])::-webkit-calendar-picker-indicator {\n  display: none !important;\n}\n[type=\'button\'],\n[type=\'reset\'],\n[type=\'submit\'],\nbutton {\n  -webkit-appearance: button;\n}\n[type=\'button\']:not(:disabled),\n[type=\'reset\']:not(:disabled),\n[type=\'submit\']:not(:disabled),\nbutton:not(:disabled) {\n  cursor: pointer;\n}\n::-moz-focus-inner {\n  padding: 0;\n  border-style: none;\n}\ntextarea {\n  resize: vertical;\n}\nfieldset {\n  min-width: 0;\n  padding: 0;\n  margin: 0;\n  border: 0;\n}\nlegend {\n  float: left;\n  width: 100%;\n  padding: 0;\n  margin-bottom: 0.5rem;\n  font-size: calc(1.275rem + 0.3vw);\n  line-height: inherit;\n}\n@media (min-width: 1200px) {\n  legend {\n    font-size: 1.5rem;\n  }\n}\nlegend + * {\n  clear: left;\n}\n::-webkit-datetime-edit-day-field,\n::-webkit-datetime-edit-fields-wrapper,\n::-webkit-datetime-edit-hour-field,\n::-webkit-datetime-edit-minute,\n::-webkit-datetime-edit-month-field,\n::-webkit-datetime-edit-text,\n::-webkit-datetime-edit-year-field {\n  padding: 0;\n}\n::-webkit-inner-spin-button {\n  height: auto;\n}\n[type=\'search\'] {\n  -webkit-appearance: textfield;\n  outline-offset: -2px;\n}\n::-webkit-search-decoration {\n  -webkit-appearance: none;\n}\n::-webkit-color-swatch-wrapper {\n  padding: 0;\n}\n::-webkit-file-upload-button {\n  font: inherit;\n  -webkit-appearance: button;\n}\n::file-selector-button {\n  font: inherit;\n  -webkit-appearance: button;\n}\noutput {\n  display: inline-block;\n}\niframe {\n  border: 0;\n}\nsummary {\n  display: list-item;\n  cursor: pointer;\n}\nprogress {\n  vertical-align: baseline;\n}\n[hidden] {\n  display: none !important;\n}\n.lead {\n  font-size: 1.25rem;\n  font-weight: 300;\n}\n.display-1 {\n  font-size: calc(1.625rem + 4.5vw);\n  font-weight: 300;\n  line-height: 1.2;\n}\n@media (min-width: 1200px) {\n  .display-1 {\n    font-size: 5rem;\n  }\n}\n.display-2 {\n  font-size: calc(1.575rem + 3.9vw);\n  font-weight: 300;\n  line-height: 1.2;\n}\n@media (min-width: 1200px) {\n  .display-2 {\n    font-size: 4.5rem;\n  }\n}\n.display-3 {\n  font-size: calc(1.525rem + 3.3vw);\n  font-weight: 300;\n  line-height: 1.2;\n}\n@media (min-width: 1200px) {\n  .display-3 {\n    font-size: 4rem;\n  }\n}\n.display-4 {\n  font-size: calc(1.475rem + 2.7vw);\n  font-weight: 300;\n  line-height: 1.2;\n}\n@media (min-width: 1200px) {\n  .display-4 {\n    font-size: 3.5rem;\n  }\n}\n.display-5 {\n  font-size: calc(1.425rem + 2.1vw);\n  font-weight: 300;\n  line-height: 1.2;\n}\n@media (min-width: 1200px) {\n  .display-5 {\n    font-size: 3rem;\n  }\n}\n.display-6 {\n  font-size: calc(1.375rem + 1.5vw);\n  font-weight: 300;\n  line-height: 1.2;\n}\n@media (min-width: 1200px) {\n  .display-6 {\n    font-size: 2.5rem;\n  }\n}\n.list-unstyled {\n  padding-left: 0;\n  list-style: none;\n}\n.list-inline {\n  padding-left: 0;\n  list-style: none;\n}\n.list-inline-item {\n  display: inline-block;\n}\n.list-inline-item:not(:last-child) {\n  margin-right: 0.5rem;\n}\n.initialism {\n  font-size: 0.875em;\n  text-transform: uppercase;\n}\n.blockquote {\n  margin-bottom: 1rem;\n  font-size: 1.25rem;\n}\n.blockquote > :last-child {\n  margin-bottom: 0;\n}\n.blockquote-footer {\n  margin-top: -1rem;\n  margin-bottom: 1rem;\n  font-size: 0.875em;\n  color: #6c757d;\n}\n.blockquote-footer::before {\n  content: \'— \';\n}\n.img-fluid {\n  max-width: 100%;\n  height: auto;\n}\n.img-thumbnail {\n  padding: 0.25rem;\n  background-color: var(--bs-body-bg);\n  border: var(--bs-border-width) solid var(--bs-border-color);\n  border-radius: var(--bs-border-radius);\n  max-width: 100%;\n  height: auto;\n}\n.figure {\n  display: inline-block;\n}\n.figure-img {\n  margin-bottom: 0.5rem;\n  line-height: 1;\n}\n.figure-caption {\n  font-size: 0.875em;\n  color: var(--bs-secondary-color);\n}\n.container,\n.container-fluid,\n.container-lg,\n.container-md,\n.container-sm,\n.container-xl,\n.container-xxl {\n  --bs-gutter-x: 1.5rem;\n  --bs-gutter-y: 0;\n  width: 100%;\n  padding-right: calc(var(--bs-gutter-x) * 0.5);\n  padding-left: calc(var(--bs-gutter-x) * 0.5);\n  margin-right: auto;\n  margin-left: auto;\n}\n@media (min-width: 576px) {\n  .container,\n  .container-sm {\n    max-width: 540px;\n  }\n}\n@media (min-width: 768px) {\n  .container,\n  .container-md,\n  .container-sm {\n    max-width: 720px;\n  }\n}\n@media (min-width: 992px) {\n  .container,\n  .container-lg,\n  .container-md,\n  .container-sm {\n    max-width: 960px;\n  }\n}\n@media (min-width: 1200px) {\n  .container,\n  .container-lg,\n  .container-md,\n  .container-sm,\n  .container-xl {\n    max-width: 1140px;\n  }\n}\n@media (min-width: 1400px) {\n  .container,\n  .container-lg,\n  .container-md,\n  .container-sm,\n  .container-xl,\n  .container-xxl {\n    max-width: 1320px;\n  }\n}\n:root {\n  --bs-breakpoint-xs: 0;\n  --bs-breakpoint-sm: 576px;\n  --bs-breakpoint-md: 768px;\n  --bs-breakpoint-lg: 992px;\n  --bs-breakpoint-xl: 1200px;\n  --bs-breakpoint-xxl: 1400px;\n}\n.row {\n  --bs-gutter-x: 1.5rem;\n  --bs-gutter-y: 0;\n  display: flex;\n  flex-wrap: wrap;\n  margin-top: calc(-1 * var(--bs-gutter-y));\n  margin-right: calc(-0.5 * var(--bs-gutter-x));\n  margin-left: calc(-0.5 * var(--bs-gutter-x));\n}\n.row > * {\n  flex-shrink: 0;\n  width: 100%;\n  max-width: 100%;\n  padding-right: calc(var(--bs-gutter-x) * 0.5);\n  padding-left: calc(var(--bs-gutter-x) * 0.5);\n  margin-top: var(--bs-gutter-y);\n}\n.col {\n  flex: 1 0 0%;\n}\n.row-cols-auto > * {\n  flex: 0 0 auto;\n  width: auto;\n}\n.row-cols-1 > * {\n  flex: 0 0 auto;\n  width: 100%;\n}\n.row-cols-2 > * {\n  flex: 0 0 auto;\n  width: 50%;\n}\n.row-cols-3 > * {\n  flex: 0 0 auto;\n  width: 33.33333333%;\n}\n.row-cols-4 > * {\n  flex: 0 0 auto;\n  width: 25%;\n}\n.row-cols-5 > * {\n  flex: 0 0 auto;\n  width: 20%;\n}\n.row-cols-6 > * {\n  flex: 0 0 auto;\n  width: 16.66666667%;\n}\n.col-auto {\n  flex: 0 0 auto;\n  width: auto;\n}\n.col-1 {\n  flex: 0 0 auto;\n  width: 8.33333333%;\n}\n.col-2 {\n  flex: 0 0 auto;\n  width: 16.66666667%;\n}\n.col-3 {\n  flex: 0 0 auto;\n  width: 25%;\n}\n.col-4 {\n  flex: 0 0 auto;\n  width: 33.33333333%;\n}\n.col-5 {\n  flex: 0 0 auto;\n  width: 41.66666667%;\n}\n.col-6 {\n  flex: 0 0 auto;\n  width: 50%;\n}\n.col-7 {\n  flex: 0 0 auto;\n  width: 58.33333333%;\n}\n.col-8 {\n  flex: 0 0 auto;\n  width: 66.66666667%;\n}\n.col-9 {\n  flex: 0 0 auto;\n  width: 75%;\n}\n.col-10 {\n  flex: 0 0 auto;\n  width: 83.33333333%;\n}\n.col-11 {\n  flex: 0 0 auto;\n  width: 91.66666667%;\n}\n.col-12 {\n  flex: 0 0 auto;\n  width: 100%;\n}\n.offset-1 {\n  margin-left: 8.33333333%;\n}\n.offset-2 {\n  margin-left: 16.66666667%;\n}\n.offset-3 {\n  margin-left: 25%;\n}\n.offset-4 {\n  margin-left: 33.33333333%;\n}\n.offset-5 {\n  margin-left: 41.66666667%;\n}\n.offset-6 {\n  margin-left: 50%;\n}\n.offset-7 {\n  margin-left: 58.33333333%;\n}\n.offset-8 {\n  margin-left: 66.66666667%;\n}\n.offset-9 {\n  margin-left: 75%;\n}\n.offset-10 {\n  margin-left: 83.33333333%;\n}\n.offset-11 {\n  margin-left: 91.66666667%;\n}\n.g-0,\n.gx-0 {\n  --bs-gutter-x: 0;\n}\n.g-0,\n.gy-0 {\n  --bs-gutter-y: 0;\n}\n.g-1,\n.gx-1 {\n  --bs-gutter-x: 0.25rem;\n}\n.g-1,\n.gy-1 {\n  --bs-gutter-y: 0.25rem;\n}\n.g-2,\n.gx-2 {\n  --bs-gutter-x: 0.5rem;\n}\n.g-2,\n.gy-2 {\n  --bs-gutter-y: 0.5rem;\n}\n.g-3,\n.gx-3 {\n  --bs-gutter-x: 1rem;\n}\n.g-3,\n.gy-3 {\n  --bs-gutter-y: 1rem;\n}\n.g-4,\n.gx-4 {\n  --bs-gutter-x: 1.5rem;\n}\n.g-4,\n.gy-4 {\n  --bs-gutter-y: 1.5rem;\n}\n.g-5,\n.gx-5 {\n  --bs-gutter-x: 3rem;\n}\n.g-5,\n.gy-5 {\n  --bs-gutter-y: 3rem;\n}\n@media (min-width: 576px) {\n  .col-sm {\n    flex: 1 0 0%;\n  }\n  .row-cols-sm-auto > * {\n    flex: 0 0 auto;\n    width: auto;\n  }\n  .row-cols-sm-1 > * {\n    flex: 0 0 auto;\n    width: 100%;\n  }\n  .row-cols-sm-2 > * {\n    flex: 0 0 auto;\n    width: 50%;\n  }\n  .row-cols-sm-3 > * {\n    flex: 0 0 auto;\n    width: 33.33333333%;\n  }\n  .row-cols-sm-4 > * {\n    flex: 0 0 auto;\n    width: 25%;\n  }\n  .row-cols-sm-5 > * {\n    flex: 0 0 auto;\n    width: 20%;\n  }\n  .row-cols-sm-6 > * {\n    flex: 0 0 auto;\n    width: 16.66666667%;\n  }\n  .col-sm-auto {\n    flex: 0 0 auto;\n    width: auto;\n  }\n  .col-sm-1 {\n    flex: 0 0 auto;\n    width: 8.33333333%;\n  }\n  .col-sm-2 {\n    flex: 0 0 auto;\n    width: 16.66666667%;\n  }\n  .col-sm-3 {\n    flex: 0 0 auto;\n    width: 25%;\n  }\n  .col-sm-4 {\n    flex: 0 0 auto;\n    width: 33.33333333%;\n  }\n  .col-sm-5 {\n    flex: 0 0 auto;\n    width: 41.66666667%;\n  }\n  .col-sm-6 {\n    flex: 0 0 auto;\n    width: 50%;\n  }\n  .col-sm-7 {\n    flex: 0 0 auto;\n    width: 58.33333333%;\n  }\n  .col-sm-8 {\n    flex: 0 0 auto;\n    width: 66.66666667%;\n  }\n  .col-sm-9 {\n    flex: 0 0 auto;\n    width: 75%;\n  }\n  .col-sm-10 {\n    flex: 0 0 auto;\n    width: 83.33333333%;\n  }\n  .col-sm-11 {\n    flex: 0 0 auto;\n    width: 91.66666667%;\n  }\n  .col-sm-12 {\n    flex: 0 0 auto;\n    width: 100%;\n  }\n  .offset-sm-0 {\n    margin-left: 0;\n  }\n  .offset-sm-1 {\n    margin-left: 8.33333333%;\n  }\n  .offset-sm-2 {\n    margin-left: 16.66666667%;\n  }\n  .offset-sm-3 {\n    margin-left: 25%;\n  }\n  .offset-sm-4 {\n    margin-left: 33.33333333%;\n  }\n  .offset-sm-5 {\n    margin-left: 41.66666667%;\n  }\n  .offset-sm-6 {\n    margin-left: 50%;\n  }\n  .offset-sm-7 {\n    margin-left: 58.33333333%;\n  }\n  .offset-sm-8 {\n    margin-left: 66.66666667%;\n  }\n  .offset-sm-9 {\n    margin-left: 75%;\n  }\n  .offset-sm-10 {\n    margin-left: 83.33333333%;\n  }\n  .offset-sm-11 {\n    margin-left: 91.66666667%;\n  }\n  .g-sm-0,\n  .gx-sm-0 {\n    --bs-gutter-x: 0;\n  }\n  .g-sm-0,\n  .gy-sm-0 {\n    --bs-gutter-y: 0;\n  }\n  .g-sm-1,\n  .gx-sm-1 {\n    --bs-gutter-x: 0.25rem;\n  }\n  .g-sm-1,\n  .gy-sm-1 {\n    --bs-gutter-y: 0.25rem;\n  }\n  .g-sm-2,\n  .gx-sm-2 {\n    --bs-gutter-x: 0.5rem;\n  }\n  .g-sm-2,\n  .gy-sm-2 {\n    --bs-gutter-y: 0.5rem;\n  }\n  .g-sm-3,\n  .gx-sm-3 {\n    --bs-gutter-x: 1rem;\n  }\n  .g-sm-3,\n  .gy-sm-3 {\n    --bs-gutter-y: 1rem;\n  }\n  .g-sm-4,\n  .gx-sm-4 {\n    --bs-gutter-x: 1.5rem;\n  }\n  .g-sm-4,\n  .gy-sm-4 {\n    --bs-gutter-y: 1.5rem;\n  }\n  .g-sm-5,\n  .gx-sm-5 {\n    --bs-gutter-x: 3rem;\n  }\n  .g-sm-5,\n  .gy-sm-5 {\n    --bs-gutter-y: 3rem;\n  }\n}\n@media (min-width: 768px) {\n  .col-md {\n    flex: 1 0 0%;\n  }\n  .row-cols-md-auto > * {\n    flex: 0 0 auto;\n    width: auto;\n  }\n  .row-cols-md-1 > * {\n    flex: 0 0 auto;\n    width: 100%;\n  }\n  .row-cols-md-2 > * {\n    flex: 0 0 auto;\n    width: 50%;\n  }\n  .row-cols-md-3 > * {\n    flex: 0 0 auto;\n    width: 33.33333333%;\n  }\n  .row-cols-md-4 > * {\n    flex: 0 0 auto;\n    width: 25%;\n  }\n  .row-cols-md-5 > * {\n    flex: 0 0 auto;\n    width: 20%;\n  }\n  .row-cols-md-6 > * {\n    flex: 0 0 auto;\n    width: 16.66666667%;\n  }\n  .col-md-auto {\n    flex: 0 0 auto;\n    width: auto;\n  }\n  .col-md-1 {\n    flex: 0 0 auto;\n    width: 8.33333333%;\n  }\n  .col-md-2 {\n    flex: 0 0 auto;\n    width: 16.66666667%;\n  }\n  .col-md-3 {\n    flex: 0 0 auto;\n    width: 25%;\n  }\n  .col-md-4 {\n    flex: 0 0 auto;\n    width: 33.33333333%;\n  }\n  .col-md-5 {\n    flex: 0 0 auto;\n    width: 41.66666667%;\n  }\n  .col-md-6 {\n    flex: 0 0 auto;\n    width: 50%;\n  }\n  .col-md-7 {\n    flex: 0 0 auto;\n    width: 58.33333333%;\n  }\n  .col-md-8 {\n    flex: 0 0 auto;\n    width: 66.66666667%;\n  }\n  .col-md-9 {\n    flex: 0 0 auto;\n    width: 75%;\n  }\n  .col-md-10 {\n    flex: 0 0 auto;\n    width: 83.33333333%;\n  }\n  .col-md-11 {\n    flex: 0 0 auto;\n    width: 91.66666667%;\n  }\n  .col-md-12 {\n    flex: 0 0 auto;\n    width: 100%;\n  }\n  .offset-md-0 {\n    margin-left: 0;\n  }\n  .offset-md-1 {\n    margin-left: 8.33333333%;\n  }\n  .offset-md-2 {\n    margin-left: 16.66666667%;\n  }\n  .offset-md-3 {\n    margin-left: 25%;\n  }\n  .offset-md-4 {\n    margin-left: 33.33333333%;\n  }\n  .offset-md-5 {\n    margin-left: 41.66666667%;\n  }\n  .offset-md-6 {\n    margin-left: 50%;\n  }\n  .offset-md-7 {\n    margin-left: 58.33333333%;\n  }\n  .offset-md-8 {\n    margin-left: 66.66666667%;\n  }\n  .offset-md-9 {\n    margin-left: 75%;\n  }\n  .offset-md-10 {\n    margin-left: 83.33333333%;\n  }\n  .offset-md-11 {\n    margin-left: 91.66666667%;\n  }\n  .g-md-0,\n  .gx-md-0 {\n    --bs-gutter-x: 0;\n  }\n  .g-md-0,\n  .gy-md-0 {\n    --bs-gutter-y: 0;\n  }\n  .g-md-1,\n  .gx-md-1 {\n    --bs-gutter-x: 0.25rem;\n  }\n  .g-md-1,\n  .gy-md-1 {\n    --bs-gutter-y: 0.25rem;\n  }\n  .g-md-2,\n  .gx-md-2 {\n    --bs-gutter-x: 0.5rem;\n  }\n  .g-md-2,\n  .gy-md-2 {\n    --bs-gutter-y: 0.5rem;\n  }\n  .g-md-3,\n  .gx-md-3 {\n    --bs-gutter-x: 1rem;\n  }\n  .g-md-3,\n  .gy-md-3 {\n    --bs-gutter-y: 1rem;\n  }\n  .g-md-4,\n  .gx-md-4 {\n    --bs-gutter-x: 1.5rem;\n  }\n  .g-md-4,\n  .gy-md-4 {\n    --bs-gutter-y: 1.5rem;\n  }\n  .g-md-5,\n  .gx-md-5 {\n    --bs-gutter-x: 3rem;\n  }\n  .g-md-5,\n  .gy-md-5 {\n    --bs-gutter-y: 3rem;\n  }\n}\n@media (min-width: 992px) {\n  .col-lg {\n    flex: 1 0 0%;\n  }\n  .row-cols-lg-auto > * {\n    flex: 0 0 auto;\n    width: auto;\n  }\n  .row-cols-lg-1 > * {\n    flex: 0 0 auto;\n    width: 100%;\n  }\n  .row-cols-lg-2 > * {\n    flex: 0 0 auto;\n    width: 50%;\n  }\n  .row-cols-lg-3 > * {\n    flex: 0 0 auto;\n    width: 33.33333333%;\n  }\n  .row-cols-lg-4 > * {\n    flex: 0 0 auto;\n    width: 25%;\n  }\n  .row-cols-lg-5 > * {\n    flex: 0 0 auto;\n    width: 20%;\n  }\n  .row-cols-lg-6 > * {\n    flex: 0 0 auto;\n    width: 16.66666667%;\n  }\n  .col-lg-auto {\n    flex: 0 0 auto;\n    width: auto;\n  }\n  .col-lg-1 {\n    flex: 0 0 auto;\n    width: 8.33333333%;\n  }\n  .col-lg-2 {\n    flex: 0 0 auto;\n    width: 16.66666667%;\n  }\n  .col-lg-3 {\n    flex: 0 0 auto;\n    width: 25%;\n  }\n  .col-lg-4 {\n    flex: 0 0 auto;\n    width: 33.33333333%;\n  }\n  .col-lg-5 {\n    flex: 0 0 auto;\n    width: 41.66666667%;\n  }\n  .col-lg-6 {\n    flex: 0 0 auto;\n    width: 50%;\n  }\n  .col-lg-7 {\n    flex: 0 0 auto;\n    width: 58.33333333%;\n  }\n  .col-lg-8 {\n    flex: 0 0 auto;\n    width: 66.66666667%;\n  }\n  .col-lg-9 {\n    flex: 0 0 auto;\n    width: 75%;\n  }\n  .col-lg-10 {\n    flex: 0 0 auto;\n    width: 83.33333333%;\n  }\n  .col-lg-11 {\n    flex: 0 0 auto;\n    width: 91.66666667%;\n  }\n  .col-lg-12 {\n    flex: 0 0 auto;\n    width: 100%;\n  }\n  .offset-lg-0 {\n    margin-left: 0;\n  }\n  .offset-lg-1 {\n    margin-left: 8.33333333%;\n  }\n  .offset-lg-2 {\n    margin-left: 16.66666667%;\n  }\n  .offset-lg-3 {\n    margin-left: 25%;\n  }\n  .offset-lg-4 {\n    margin-left: 33.33333333%;\n  }\n  .offset-lg-5 {\n    margin-left: 41.66666667%;\n  }\n  .offset-lg-6 {\n    margin-left: 50%;\n  }\n  .offset-lg-7 {\n    margin-left: 58.33333333%;\n  }\n  .offset-lg-8 {\n    margin-left: 66.66666667%;\n  }\n  .offset-lg-9 {\n    margin-left: 75%;\n  }\n  .offset-lg-10 {\n    margin-left: 83.33333333%;\n  }\n  .offset-lg-11 {\n    margin-left: 91.66666667%;\n  }\n  .g-lg-0,\n  .gx-lg-0 {\n    --bs-gutter-x: 0;\n  }\n  .g-lg-0,\n  .gy-lg-0 {\n    --bs-gutter-y: 0;\n  }\n  .g-lg-1,\n  .gx-lg-1 {\n    --bs-gutter-x: 0.25rem;\n  }\n  .g-lg-1,\n  .gy-lg-1 {\n    --bs-gutter-y: 0.25rem;\n  }\n  .g-lg-2,\n  .gx-lg-2 {\n    --bs-gutter-x: 0.5rem;\n  }\n  .g-lg-2,\n  .gy-lg-2 {\n    --bs-gutter-y: 0.5rem;\n  }\n  .g-lg-3,\n  .gx-lg-3 {\n    --bs-gutter-x: 1rem;\n  }\n  .g-lg-3,\n  .gy-lg-3 {\n    --bs-gutter-y: 1rem;\n  }\n  .g-lg-4,\n  .gx-lg-4 {\n    --bs-gutter-x: 1.5rem;\n  }\n  .g-lg-4,\n  .gy-lg-4 {\n    --bs-gutter-y: 1.5rem;\n  }\n  .g-lg-5,\n  .gx-lg-5 {\n    --bs-gutter-x: 3rem;\n  }\n  .g-lg-5,\n  .gy-lg-5 {\n    --bs-gutter-y: 3rem;\n  }\n}\n@media (min-width: 1200px) {\n  .col-xl {\n    flex: 1 0 0%;\n  }\n  .row-cols-xl-auto > * {\n    flex: 0 0 auto;\n    width: auto;\n  }\n  .row-cols-xl-1 > * {\n    flex: 0 0 auto;\n    width: 100%;\n  }\n  .row-cols-xl-2 > * {\n    flex: 0 0 auto;\n    width: 50%;\n  }\n  .row-cols-xl-3 > * {\n    flex: 0 0 auto;\n    width: 33.33333333%;\n  }\n  .row-cols-xl-4 > * {\n    flex: 0 0 auto;\n    width: 25%;\n  }\n  .row-cols-xl-5 > * {\n    flex: 0 0 auto;\n    width: 20%;\n  }\n  .row-cols-xl-6 > * {\n    flex: 0 0 auto;\n    width: 16.66666667%;\n  }\n  .col-xl-auto {\n    flex: 0 0 auto;\n    width: auto;\n  }\n  .col-xl-1 {\n    flex: 0 0 auto;\n    width: 8.33333333%;\n  }\n  .col-xl-2 {\n    flex: 0 0 auto;\n    width: 16.66666667%;\n  }\n  .col-xl-3 {\n    flex: 0 0 auto;\n    width: 25%;\n  }\n  .col-xl-4 {\n    flex: 0 0 auto;\n    width: 33.33333333%;\n  }\n  .col-xl-5 {\n    flex: 0 0 auto;\n    width: 41.66666667%;\n  }\n  .col-xl-6 {\n    flex: 0 0 auto;\n    width: 50%;\n  }\n  .col-xl-7 {\n    flex: 0 0 auto;\n    width: 58.33333333%;\n  }\n  .col-xl-8 {\n    flex: 0 0 auto;\n    width: 66.66666667%;\n  }\n  .col-xl-9 {\n    flex: 0 0 auto;\n    width: 75%;\n  }\n  .col-xl-10 {\n    flex: 0 0 auto;\n    width: 83.33333333%;\n  }\n  .col-xl-11 {\n    flex: 0 0 auto;\n    width: 91.66666667%;\n  }\n  .col-xl-12 {\n    flex: 0 0 auto;\n    width: 100%;\n  }\n  .offset-xl-0 {\n    margin-left: 0;\n  }\n  .offset-xl-1 {\n    margin-left: 8.33333333%;\n  }\n  .offset-xl-2 {\n    margin-left: 16.66666667%;\n  }\n  .offset-xl-3 {\n    margin-left: 25%;\n  }\n  .offset-xl-4 {\n    margin-left: 33.33333333%;\n  }\n  .offset-xl-5 {\n    margin-left: 41.66666667%;\n  }\n  .offset-xl-6 {\n    margin-left: 50%;\n  }\n  .offset-xl-7 {\n    margin-left: 58.33333333%;\n  }\n  .offset-xl-8 {\n    margin-left: 66.66666667%;\n  }\n  .offset-xl-9 {\n    margin-left: 75%;\n  }\n  .offset-xl-10 {\n    margin-left: 83.33333333%;\n  }\n  .offset-xl-11 {\n    margin-left: 91.66666667%;\n  }\n  .g-xl-0,\n  .gx-xl-0 {\n    --bs-gutter-x: 0;\n  }\n  .g-xl-0,\n  .gy-xl-0 {\n    --bs-gutter-y: 0;\n  }\n  .g-xl-1,\n  .gx-xl-1 {\n    --bs-gutter-x: 0.25rem;\n  }\n  .g-xl-1,\n  .gy-xl-1 {\n    --bs-gutter-y: 0.25rem;\n  }\n  .g-xl-2,\n  .gx-xl-2 {\n    --bs-gutter-x: 0.5rem;\n  }\n  .g-xl-2,\n  .gy-xl-2 {\n    --bs-gutter-y: 0.5rem;\n  }\n  .g-xl-3,\n  .gx-xl-3 {\n    --bs-gutter-x: 1rem;\n  }\n  .g-xl-3,\n  .gy-xl-3 {\n    --bs-gutter-y: 1rem;\n  }\n  .g-xl-4,\n  .gx-xl-4 {\n    --bs-gutter-x: 1.5rem;\n  }\n  .g-xl-4,\n  .gy-xl-4 {\n    --bs-gutter-y: 1.5rem;\n  }\n  .g-xl-5,\n  .gx-xl-5 {\n    --bs-gutter-x: 3rem;\n  }\n  .g-xl-5,\n  .gy-xl-5 {\n    --bs-gutter-y: 3rem;\n  }\n}\n@media (min-width: 1400px) {\n  .col-xxl {\n    flex: 1 0 0%;\n  }\n  .row-cols-xxl-auto > * {\n    flex: 0 0 auto;\n    width: auto;\n  }\n  .row-cols-xxl-1 > * {\n    flex: 0 0 auto;\n    width: 100%;\n  }\n  .row-cols-xxl-2 > * {\n    flex: 0 0 auto;\n    width: 50%;\n  }\n  .row-cols-xxl-3 > * {\n    flex: 0 0 auto;\n    width: 33.33333333%;\n  }\n  .row-cols-xxl-4 > * {\n    flex: 0 0 auto;\n    width: 25%;\n  }\n  .row-cols-xxl-5 > * {\n    flex: 0 0 auto;\n    width: 20%;\n  }\n  .row-cols-xxl-6 > * {\n    flex: 0 0 auto;\n    width: 16.66666667%;\n  }\n  .col-xxl-auto {\n    flex: 0 0 auto;\n    width: auto;\n  }\n  .col-xxl-1 {\n    flex: 0 0 auto;\n    width: 8.33333333%;\n  }\n  .col-xxl-2 {\n    flex: 0 0 auto;\n    width: 16.66666667%;\n  }\n  .col-xxl-3 {\n    flex: 0 0 auto;\n    width: 25%;\n  }\n  .col-xxl-4 {\n    flex: 0 0 auto;\n    width: 33.33333333%;\n  }\n  .col-xxl-5 {\n    flex: 0 0 auto;\n    width: 41.66666667%;\n  }\n  .col-xxl-6 {\n    flex: 0 0 auto;\n    width: 50%;\n  }\n  .col-xxl-7 {\n    flex: 0 0 auto;\n    width: 58.33333333%;\n  }\n  .col-xxl-8 {\n    flex: 0 0 auto;\n    width: 66.66666667%;\n  }\n  .col-xxl-9 {\n    flex: 0 0 auto;\n    width: 75%;\n  }\n  .col-xxl-10 {\n    flex: 0 0 auto;\n    width: 83.33333333%;\n  }\n  .col-xxl-11 {\n    flex: 0 0 auto;\n    width: 91.66666667%;\n  }\n  .col-xxl-12 {\n    flex: 0 0 auto;\n    width: 100%;\n  }\n  .offset-xxl-0 {\n    margin-left: 0;\n  }\n  .offset-xxl-1 {\n    margin-left: 8.33333333%;\n  }\n  .offset-xxl-2 {\n    margin-left: 16.66666667%;\n  }\n  .offset-xxl-3 {\n    margin-left: 25%;\n  }\n  .offset-xxl-4 {\n    margin-left: 33.33333333%;\n  }\n  .offset-xxl-5 {\n    margin-left: 41.66666667%;\n  }\n  .offset-xxl-6 {\n    margin-left: 50%;\n  }\n  .offset-xxl-7 {\n    margin-left: 58.33333333%;\n  }\n  .offset-xxl-8 {\n    margin-left: 66.66666667%;\n  }\n  .offset-xxl-9 {\n    margin-left: 75%;\n  }\n  .offset-xxl-10 {\n    margin-left: 83.33333333%;\n  }\n  .offset-xxl-11 {\n    margin-left: 91.66666667%;\n  }\n  .g-xxl-0,\n  .gx-xxl-0 {\n    --bs-gutter-x: 0;\n  }\n  .g-xxl-0,\n  .gy-xxl-0 {\n    --bs-gutter-y: 0;\n  }\n  .g-xxl-1,\n  .gx-xxl-1 {\n    --bs-gutter-x: 0.25rem;\n  }\n  .g-xxl-1,\n  .gy-xxl-1 {\n    --bs-gutter-y: 0.25rem;\n  }\n  .g-xxl-2,\n  .gx-xxl-2 {\n    --bs-gutter-x: 0.5rem;\n  }\n  .g-xxl-2,\n  .gy-xxl-2 {\n    --bs-gutter-y: 0.5rem;\n  }\n  .g-xxl-3,\n  .gx-xxl-3 {\n    --bs-gutter-x: 1rem;\n  }\n  .g-xxl-3,\n  .gy-xxl-3 {\n    --bs-gutter-y: 1rem;\n  }\n  .g-xxl-4,\n  .gx-xxl-4 {\n    --bs-gutter-x: 1.5rem;\n  }\n  .g-xxl-4,\n  .gy-xxl-4 {\n    --bs-gutter-y: 1.5rem;\n  }\n  .g-xxl-5,\n  .gx-xxl-5 {\n    --bs-gutter-x: 3rem;\n  }\n  .g-xxl-5,\n  .gy-xxl-5 {\n    --bs-gutter-y: 3rem;\n  }\n}\n.table {\n  --bs-table-color-type: initial;\n  --bs-table-bg-type: initial;\n  --bs-table-color-state: initial;\n  --bs-table-bg-state: initial;\n  --bs-table-color: var(--bs-emphasis-color);\n  --bs-table-bg: var(--bs-body-bg);\n  --bs-table-border-color: var(--bs-border-color);\n  --bs-table-accent-bg: transparent;\n  --bs-table-striped-color: var(--bs-emphasis-color);\n  --bs-table-striped-bg: rgba(var(--bs-emphasis-color-rgb), 0.05);\n  --bs-table-active-color: var(--bs-emphasis-color);\n  --bs-table-active-bg: rgba(var(--bs-emphasis-color-rgb), 0.1);\n  --bs-table-hover-color: var(--bs-emphasis-color);\n  --bs-table-hover-bg: rgba(var(--bs-emphasis-color-rgb), 0.075);\n  width: 100%;\n  margin-bottom: 1rem;\n  vertical-align: top;\n  border-color: var(--bs-table-border-color);\n}\n.table > :not(caption) > * > * {\n  padding: 0.5rem 0.5rem;\n  color: var(\n    --bs-table-color-state,\n    var(--bs-table-color-type, var(--bs-table-color))\n  );\n  background-color: var(--bs-table-bg);\n  border-bottom-width: var(--bs-border-width);\n  box-shadow: inset 0 0 0 9999px\n    var(--bs-table-bg-state, var(--bs-table-bg-type, var(--bs-table-accent-bg)));\n}\n.table > tbody {\n  vertical-align: inherit;\n}\n.table > thead {\n  vertical-align: bottom;\n}\n.table-group-divider {\n  border-top: calc(var(--bs-border-width) * 2) solid currentcolor;\n}\n.caption-top {\n  caption-side: top;\n}\n.table-sm > :not(caption) > * > * {\n  padding: 0.25rem 0.25rem;\n}\n.table-bordered > :not(caption) > * {\n  border-width: var(--bs-border-width) 0;\n}\n.table-bordered > :not(caption) > * > * {\n  border-width: 0 var(--bs-border-width);\n}\n.table-borderless > :not(caption) > * > * {\n  border-bottom-width: 0;\n}\n.table-borderless > :not(:first-child) {\n  border-top-width: 0;\n}\n.table-striped > tbody > tr:nth-of-type(odd) > * {\n  --bs-table-color-type: var(--bs-table-striped-color);\n  --bs-table-bg-type: var(--bs-table-striped-bg);\n}\n.table-striped-columns > :not(caption) > tr > :nth-child(2n) {\n  --bs-table-color-type: var(--bs-table-striped-color);\n  --bs-table-bg-type: var(--bs-table-striped-bg);\n}\n.table-active {\n  --bs-table-color-state: var(--bs-table-active-color);\n  --bs-table-bg-state: var(--bs-table-active-bg);\n}\n.table-hover > tbody > tr:hover > * {\n  --bs-table-color-state: var(--bs-table-hover-color);\n  --bs-table-bg-state: var(--bs-table-hover-bg);\n}\n.table-primary {\n  --bs-table-color: #000;\n  --bs-table-bg: #cfe2ff;\n  --bs-table-border-color: #a6b5cc;\n  --bs-table-striped-bg: #c5d7f2;\n  --bs-table-striped-color: #000;\n  --bs-table-active-bg: #bacbe6;\n  --bs-table-active-color: #000;\n  --bs-table-hover-bg: #bfd1ec;\n  --bs-table-hover-color: #000;\n  color: var(--bs-table-color);\n  border-color: var(--bs-table-border-color);\n}\n.table-secondary {\n  --bs-table-color: #000;\n  --bs-table-bg: #e2e3e5;\n  --bs-table-border-color: #b5b6b7;\n  --bs-table-striped-bg: #d7d8da;\n  --bs-table-striped-color: #000;\n  --bs-table-active-bg: #cbccce;\n  --bs-table-active-color: #000;\n  --bs-table-hover-bg: #d1d2d4;\n  --bs-table-hover-color: #000;\n  color: var(--bs-table-color);\n  border-color: var(--bs-table-border-color);\n}\n.table-success {\n  --bs-table-color: #000;\n  --bs-table-bg: #d1e7dd;\n  --bs-table-border-color: #a7b9b1;\n  --bs-table-striped-bg: #c7dbd2;\n  --bs-table-striped-color: #000;\n  --bs-table-active-bg: #bcd0c7;\n  --bs-table-active-color: #000;\n  --bs-table-hover-bg: #c1d6cc;\n  --bs-table-hover-color: #000;\n  color: var(--bs-table-color);\n  border-color: var(--bs-table-border-color);\n}\n.table-info {\n  --bs-table-color: #000;\n  --bs-table-bg: #cff4fc;\n  --bs-table-border-color: #a6c3ca;\n  --bs-table-striped-bg: #c5e8ef;\n  --bs-table-striped-color: #000;\n  --bs-table-active-bg: #badce3;\n  --bs-table-active-color: #000;\n  --bs-table-hover-bg: #bfe2e9;\n  --bs-table-hover-color: #000;\n  color: var(--bs-table-color);\n  border-color: var(--bs-table-border-color);\n}\n.table-warning {\n  --bs-table-color: #000;\n  --bs-table-bg: #fff3cd;\n  --bs-table-border-color: #ccc2a4;\n  --bs-table-striped-bg: #f2e7c3;\n  --bs-table-striped-color: #000;\n  --bs-table-active-bg: #e6dbb9;\n  --bs-table-active-color: #000;\n  --bs-table-hover-bg: #ece1be;\n  --bs-table-hover-color: #000;\n  color: var(--bs-table-color);\n  border-color: var(--bs-table-border-color);\n}\n.table-danger {\n  --bs-table-color: #000;\n  --bs-table-bg: #f8d7da;\n  --bs-table-border-color: #c6acae;\n  --bs-table-striped-bg: #eccccf;\n  --bs-table-striped-color: #000;\n  --bs-table-active-bg: #dfc2c4;\n  --bs-table-active-color: #000;\n  --bs-table-hover-bg: #e5c7ca;\n  --bs-table-hover-color: #000;\n  color: var(--bs-table-color);\n  border-color: var(--bs-table-border-color);\n}\n.table-light {\n  --bs-table-color: #000;\n  --bs-table-bg: #f8f9fa;\n  --bs-table-border-color: #c6c7c8;\n  --bs-table-striped-bg: #ecedee;\n  --bs-table-striped-color: #000;\n  --bs-table-active-bg: #dfe0e1;\n  --bs-table-active-color: #000;\n  --bs-table-hover-bg: #e5e6e7;\n  --bs-table-hover-color: #000;\n  color: var(--bs-table-color);\n  border-color: var(--bs-table-border-color);\n}\n.table-dark {\n  --bs-table-color: #fff;\n  --bs-table-bg: #212529;\n  --bs-table-border-color: #4d5154;\n  --bs-table-striped-bg: #2c3034;\n  --bs-table-striped-color: #fff;\n  --bs-table-active-bg: #373b3e;\n  --bs-table-active-color: #fff;\n  --bs-table-hover-bg: #323539;\n  --bs-table-hover-color: #fff;\n  color: var(--bs-table-color);\n  border-color: var(--bs-table-border-color);\n}\n.table-responsive {\n  overflow-x: auto;\n  -webkit-overflow-scrolling: touch;\n}\n@media (max-width: 575.98px) {\n  .table-responsive-sm {\n    overflow-x: auto;\n    -webkit-overflow-scrolling: touch;\n  }\n}\n@media (max-width: 767.98px) {\n  .table-responsive-md {\n    overflow-x: auto;\n    -webkit-overflow-scrolling: touch;\n  }\n}\n@media (max-width: 991.98px) {\n  .table-responsive-lg {\n    overflow-x: auto;\n    -webkit-overflow-scrolling: touch;\n  }\n}\n@media (max-width: 1199.98px) {\n  .table-responsive-xl {\n    overflow-x: auto;\n    -webkit-overflow-scrolling: touch;\n  }\n}\n@media (max-width: 1399.98px) {\n  .table-responsive-xxl {\n    overflow-x: auto;\n    -webkit-overflow-scrolling: touch;\n  }\n}\n.form-label {\n  margin-bottom: 0.5rem;\n}\n.col-form-label {\n  padding-top: calc(0.375rem + var(--bs-border-width));\n  padding-bottom: calc(0.375rem + var(--bs-border-width));\n  margin-bottom: 0;\n  font-size: inherit;\n  line-height: 1.5;\n}\n.col-form-label-lg {\n  padding-top: calc(0.5rem + var(--bs-border-width));\n  padding-bottom: calc(0.5rem + var(--bs-border-width));\n  font-size: 1.25rem;\n}\n.col-form-label-sm {\n  padding-top: calc(0.25rem + var(--bs-border-width));\n  padding-bottom: calc(0.25rem + var(--bs-border-width));\n  font-size: 0.875rem;\n}\n.form-text {\n  margin-top: 0.25rem;\n  font-size: 0.875em;\n  color: var(--bs-secondary-color);\n}\n.form-control {\n  display: block;\n  width: 100%;\n  padding: 0.375rem 0.75rem;\n  font-size: 1rem;\n  font-weight: 400;\n  line-height: 1.5;\n  color: var(--bs-body-color);\n  -webkit-appearance: none;\n  -moz-appearance: none;\n  appearance: none;\n  background-color: var(--bs-body-bg);\n  background-clip: padding-box;\n  border: var(--bs-border-width) solid var(--bs-border-color);\n  border-radius: var(--bs-border-radius);\n  transition:\n    border-color 0.15s ease-in-out,\n    box-shadow 0.15s ease-in-out;\n}\n@media (prefers-reduced-motion: reduce) {\n  .form-control {\n    transition: none;\n  }\n}\n.form-control[type=\'file\'] {\n  overflow: hidden;\n}\n.form-control[type=\'file\']:not(:disabled):not([readonly]) {\n  cursor: pointer;\n}\n.form-control:focus {\n  color: var(--bs-body-color);\n  background-color: var(--bs-body-bg);\n  border-color: #86b7fe;\n  outline: 0;\n  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);\n}\n.form-control::-webkit-date-and-time-value {\n  min-width: 85px;\n  height: 1.5em;\n  margin: 0;\n}\n.form-control::-webkit-datetime-edit {\n  display: block;\n  padding: 0;\n}\n.form-control::-moz-placeholder {\n  color: var(--bs-secondary-color);\n  opacity: 1;\n}\n.form-control::placeholder {\n  color: var(--bs-secondary-color);\n  opacity: 1;\n}\n.form-control:disabled {\n  background-color: var(--bs-secondary-bg);\n  opacity: 1;\n}\n.form-control::-webkit-file-upload-button {\n  padding: 0.375rem 0.75rem;\n  margin: -0.375rem -0.75rem;\n  -webkit-margin-end: 0.75rem;\n  margin-inline-end: 0.75rem;\n  color: var(--bs-body-color);\n  background-color: var(--bs-tertiary-bg);\n  pointer-events: none;\n  border-color: inherit;\n  border-style: solid;\n  border-width: 0;\n  border-inline-end-width: var(--bs-border-width);\n  border-radius: 0;\n  -webkit-transition:\n    color 0.15s ease-in-out,\n    background-color 0.15s ease-in-out,\n    border-color 0.15s ease-in-out,\n    box-shadow 0.15s ease-in-out;\n  transition:\n    color 0.15s ease-in-out,\n    background-color 0.15s ease-in-out,\n    border-color 0.15s ease-in-out,\n    box-shadow 0.15s ease-in-out;\n}\n.form-control::file-selector-button {\n  padding: 0.375rem 0.75rem;\n  margin: -0.375rem -0.75rem;\n  -webkit-margin-end: 0.75rem;\n  margin-inline-end: 0.75rem;\n  color: var(--bs-body-color);\n  background-color: var(--bs-tertiary-bg);\n  pointer-events: none;\n  border-color: inherit;\n  border-style: solid;\n  border-width: 0;\n  border-inline-end-width: var(--bs-border-width);\n  border-radius: 0;\n  transition:\n    color 0.15s ease-in-out,\n    background-color 0.15s ease-in-out,\n    border-color 0.15s ease-in-out,\n    box-shadow 0.15s ease-in-out;\n}\n@media (prefers-reduced-motion: reduce) {\n  .form-control::-webkit-file-upload-button {\n    -webkit-transition: none;\n    transition: none;\n  }\n  .form-control::file-selector-button {\n    transition: none;\n  }\n}\n.form-control:hover:not(:disabled):not([readonly])::-webkit-file-upload-button {\n  background-color: var(--bs-secondary-bg);\n}\n.form-control:hover:not(:disabled):not([readonly])::file-selector-button {\n  background-color: var(--bs-secondary-bg);\n}\n.form-control-plaintext {\n  display: block;\n  width: 100%;\n  padding: 0.375rem 0;\n  margin-bottom: 0;\n  line-height: 1.5;\n  color: var(--bs-body-color);\n  background-color: transparent;\n  border: solid transparent;\n  border-width: var(--bs-border-width) 0;\n}\n.form-control-plaintext:focus {\n  outline: 0;\n}\n.form-control-plaintext.form-control-lg,\n.form-control-plaintext.form-control-sm {\n  padding-right: 0;\n  padding-left: 0;\n}\n.form-control-sm {\n  min-height: calc(1.5em + 0.5rem + calc(var(--bs-border-width) * 2));\n  padding: 0.25rem 0.5rem;\n  font-size: 0.875rem;\n  border-radius: var(--bs-border-radius-sm);\n}\n.form-control-sm::-webkit-file-upload-button {\n  padding: 0.25rem 0.5rem;\n  margin: -0.25rem -0.5rem;\n  -webkit-margin-end: 0.5rem;\n  margin-inline-end: 0.5rem;\n}\n.form-control-sm::file-selector-button {\n  padding: 0.25rem 0.5rem;\n  margin: -0.25rem -0.5rem;\n  -webkit-margin-end: 0.5rem;\n  margin-inline-end: 0.5rem;\n}\n.form-control-lg {\n  min-height: calc(1.5em + 1rem + calc(var(--bs-border-width) * 2));\n  padding: 0.5rem 1rem;\n  font-size: 1.25rem;\n  border-radius: var(--bs-border-radius-lg);\n}\n.form-control-lg::-webkit-file-upload-button {\n  padding: 0.5rem 1rem;\n  margin: -0.5rem -1rem;\n  -webkit-margin-end: 1rem;\n  margin-inline-end: 1rem;\n}\n.form-control-lg::file-selector-button {\n  padding: 0.5rem 1rem;\n  margin: -0.5rem -1rem;\n  -webkit-margin-end: 1rem;\n  margin-inline-end: 1rem;\n}\ntextarea.form-control {\n  min-height: calc(1.5em + 0.75rem + calc(var(--bs-border-width) * 2));\n}\ntextarea.form-control-sm {\n  min-height: calc(1.5em + 0.5rem + calc(var(--bs-border-width) * 2));\n}\ntextarea.form-control-lg {\n  min-height: calc(1.5em + 1rem + calc(var(--bs-border-width) * 2));\n}\n.form-control-color {\n  width: 3rem;\n  height: calc(1.5em + 0.75rem + calc(var(--bs-border-width) * 2));\n  padding: 0.375rem;\n}\n.form-control-color:not(:disabled):not([readonly]) {\n  cursor: pointer;\n}\n.form-control-color::-moz-color-swatch {\n  border: 0 !important;\n  border-radius: var(--bs-border-radius);\n}\n.form-control-color::-webkit-color-swatch {\n  border: 0 !important;\n  border-radius: var(--bs-border-radius);\n}\n.form-control-color.form-control-sm {\n  height: calc(1.5em + 0.5rem + calc(var(--bs-border-width) * 2));\n}\n.form-control-color.form-control-lg {\n  height: calc(1.5em + 1rem + calc(var(--bs-border-width) * 2));\n}\n.form-select {\n  --bs-form-select-bg-img: url(\"data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 16 16\'%3e%3cpath fill=\'none\' stroke=\'%23343a40\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'m2 5 6 6 6-6\'/%3e%3c/svg%3e\");\n  display: block;\n  width: 100%;\n  padding: 0.375rem 2.25rem 0.375rem 0.75rem;\n  font-size: 1rem;\n  font-weight: 400;\n  line-height: 1.5;\n  color: var(--bs-body-color);\n  -webkit-appearance: none;\n  -moz-appearance: none;\n  appearance: none;\n  background-color: var(--bs-body-bg);\n  background-image:\n    var(--bs-form-select-bg-img), var(--bs-form-select-bg-icon, none);\n  background-repeat: no-repeat;\n  background-position: right 0.75rem center;\n  background-size: 16px 12px;\n  border: var(--bs-border-width) solid var(--bs-border-color);\n  border-radius: var(--bs-border-radius);\n  transition:\n    border-color 0.15s ease-in-out,\n    box-shadow 0.15s ease-in-out;\n}\n@media (prefers-reduced-motion: reduce) {\n  .form-select {\n    transition: none;\n  }\n}\n.form-select:focus {\n  border-color: #86b7fe;\n  outline: 0;\n  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);\n}\n.form-select[multiple],\n.form-select[size]:not([size=\'1\']) {\n  padding-right: 0.75rem;\n  background-image: none;\n}\n.form-select:disabled {\n  background-color: var(--bs-secondary-bg);\n}\n.form-select:-moz-focusring {\n  color: transparent;\n  text-shadow: 0 0 0 var(--bs-body-color);\n}\n.form-select-sm {\n  padding-top: 0.25rem;\n  padding-bottom: 0.25rem;\n  padding-left: 0.5rem;\n  font-size: 0.875rem;\n  border-radius: var(--bs-border-radius-sm);\n}\n.form-select-lg {\n  padding-top: 0.5rem;\n  padding-bottom: 0.5rem;\n  padding-left: 1rem;\n  font-size: 1.25rem;\n  border-radius: var(--bs-border-radius-lg);\n}\n[data-bs-theme=\'dark\'] .form-select {\n  --bs-form-select-bg-img: url(\"data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 16 16\'%3e%3cpath fill=\'none\' stroke=\'%23dee2e6\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'m2 5 6 6 6-6\'/%3e%3c/svg%3e\");\n}\n.form-check {\n  display: block;\n  min-height: 1.5rem;\n  padding-left: 1.5em;\n  margin-bottom: 0.125rem;\n}\n.form-check .form-check-input {\n  float: left;\n  margin-left: -1.5em;\n}\n.form-check-reverse {\n  padding-right: 1.5em;\n  padding-left: 0;\n  text-align: right;\n}\n.form-check-reverse .form-check-input {\n  float: right;\n  margin-right: -1.5em;\n  margin-left: 0;\n}\n.form-check-input {\n  --bs-form-check-bg: var(--bs-body-bg);\n  flex-shrink: 0;\n  width: 1em;\n  height: 1em;\n  margin-top: 0.25em;\n  vertical-align: top;\n  -webkit-appearance: none;\n  -moz-appearance: none;\n  appearance: none;\n  background-color: var(--bs-form-check-bg);\n  background-image: var(--bs-form-check-bg-image);\n  background-repeat: no-repeat;\n  background-position: center;\n  background-size: contain;\n  border: var(--bs-border-width) solid var(--bs-border-color);\n  -webkit-print-color-adjust: exact;\n  color-adjust: exact;\n  print-color-adjust: exact;\n}\n.form-check-input[type=\'checkbox\'] {\n  border-radius: 0.25em;\n}\n.form-check-input[type=\'radio\'] {\n  border-radius: 50%;\n}\n.form-check-input:active {\n  filter: brightness(90%);\n}\n.form-check-input:focus {\n  border-color: #86b7fe;\n  outline: 0;\n  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);\n}\n.form-check-input:checked {\n  background-color: #0d6efd;\n  border-color: #0d6efd;\n}\n.form-check-input:checked[type=\'checkbox\'] {\n  --bs-form-check-bg-image: url(\"data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 20 20\'%3e%3cpath fill=\'none\' stroke=\'%23fff\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'3\' d=\'m6 10 3 3 6-6\'/%3e%3c/svg%3e\");\n}\n.form-check-input:checked[type=\'radio\'] {\n  --bs-form-check-bg-image: url(\"data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'-4 -4 8 8\'%3e%3ccircle r=\'2\' fill=\'%23fff\'/%3e%3c/svg%3e\");\n}\n.form-check-input[type=\'checkbox\']:indeterminate {\n  background-color: #0d6efd;\n  border-color: #0d6efd;\n  --bs-form-check-bg-image: url(\"data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 20 20\'%3e%3cpath fill=\'none\' stroke=\'%23fff\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'3\' d=\'M6 10h8\'/%3e%3c/svg%3e\");\n}\n.form-check-input:disabled {\n  pointer-events: none;\n  filter: none;\n  opacity: 0.5;\n}\n.form-check-input:disabled ~ .form-check-label,\n.form-check-input[disabled] ~ .form-check-label {\n  cursor: default;\n  opacity: 0.5;\n}\n.form-switch {\n  padding-left: 2.5em;\n}\n.form-switch .form-check-input {\n  --bs-form-switch-bg: url(\"data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'-4 -4 8 8\'%3e%3ccircle r=\'3\' fill=\'rgba%280, 0, 0, 0.25%29\'/%3e%3c/svg%3e\");\n  width: 2em;\n  margin-left: -2.5em;\n  background-image: var(--bs-form-switch-bg);\n  background-position: left center;\n  border-radius: 2em;\n  transition: background-position 0.15s ease-in-out;\n}\n@media (prefers-reduced-motion: reduce) {\n  .form-switch .form-check-input {\n    transition: none;\n  }\n}\n.form-switch .form-check-input:focus {\n  --bs-form-switch-bg: url(\"data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'-4 -4 8 8\'%3e%3ccircle r=\'3\' fill=\'%2386b7fe\'/%3e%3c/svg%3e\");\n}\n.form-switch .form-check-input:checked {\n  background-position: right center;\n  --bs-form-switch-bg: url(\"data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'-4 -4 8 8\'%3e%3ccircle r=\'3\' fill=\'%23fff\'/%3e%3c/svg%3e\");\n}\n.form-switch.form-check-reverse {\n  padding-right: 2.5em;\n  padding-left: 0;\n}\n.form-switch.form-check-reverse .form-check-input {\n  margin-right: -2.5em;\n  margin-left: 0;\n}\n.form-check-inline {\n  display: inline-block;\n  margin-right: 1rem;\n}\n.btn-check {\n  position: absolute;\n  clip: rect(0, 0, 0, 0);\n  pointer-events: none;\n}\n.btn-check:disabled + .btn,\n.btn-check[disabled] + .btn {\n  pointer-events: none;\n  filter: none;\n  opacity: 0.65;\n}\n[data-bs-theme=\'dark\']\n  .form-switch\n  .form-check-input:not(:checked):not(:focus) {\n  --bs-form-switch-bg: url(\"data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'-4 -4 8 8\'%3e%3ccircle r=\'3\' fill=\'rgba%28255, 255, 255, 0.25%29\'/%3e%3c/svg%3e\");\n}\n.form-range {\n  width: 100%;\n  height: 1.5rem;\n  padding: 0;\n  -webkit-appearance: none;\n  -moz-appearance: none;\n  appearance: none;\n  background-color: transparent;\n}\n.form-range:focus {\n  outline: 0;\n}\n.form-range:focus::-webkit-slider-thumb {\n  box-shadow:\n    0 0 0 1px #fff,\n    0 0 0 0.25rem rgba(13, 110, 253, 0.25);\n}\n.form-range:focus::-moz-range-thumb {\n  box-shadow:\n    0 0 0 1px #fff,\n    0 0 0 0.25rem rgba(13, 110, 253, 0.25);\n}\n.form-range::-moz-focus-outer {\n  border: 0;\n}\n.form-range::-webkit-slider-thumb {\n  width: 1rem;\n  height: 1rem;\n  margin-top: -0.25rem;\n  -webkit-appearance: none;\n  appearance: none;\n  background-color: #0d6efd;\n  border: 0;\n  border-radius: 1rem;\n  -webkit-transition:\n    background-color 0.15s ease-in-out,\n    border-color 0.15s ease-in-out,\n    box-shadow 0.15s ease-in-out;\n  transition:\n    background-color 0.15s ease-in-out,\n    border-color 0.15s ease-in-out,\n    box-shadow 0.15s ease-in-out;\n}\n@media (prefers-reduced-motion: reduce) {\n  .form-range::-webkit-slider-thumb {\n    -webkit-transition: none;\n    transition: none;\n  }\n}\n.form-range::-webkit-slider-thumb:active {\n  background-color: #b6d4fe;\n}\n.form-range::-webkit-slider-runnable-track {\n  width: 100%;\n  height: 0.5rem;\n  color: transparent;\n  cursor: pointer;\n  background-color: var(--bs-secondary-bg);\n  border-color: transparent;\n  border-radius: 1rem;\n}\n.form-range::-moz-range-thumb {\n  width: 1rem;\n  height: 1rem;\n  -moz-appearance: none;\n  appearance: none;\n  background-color: #0d6efd;\n  border: 0;\n  border-radius: 1rem;\n  -moz-transition:\n    background-color 0.15s ease-in-out,\n    border-color 0.15s ease-in-out,\n    box-shadow 0.15s ease-in-out;\n  transition:\n    background-color 0.15s ease-in-out,\n    border-color 0.15s ease-in-out,\n    box-shadow 0.15s ease-in-out;\n}\n@media (prefers-reduced-motion: reduce) {\n  .form-range::-moz-range-thumb {\n    -moz-transition: none;\n    transition: none;\n  }\n}\n.form-range::-moz-range-thumb:active {\n  background-color: #b6d4fe;\n}\n.form-range::-moz-range-track {\n  width: 100%;\n  height: 0.5rem;\n  color: transparent;\n  cursor: pointer;\n  background-color: var(--bs-secondary-bg);\n  border-color: transparent;\n  border-radius: 1rem;\n}\n.form-range:disabled {\n  pointer-events: none;\n}\n.form-range:disabled::-webkit-slider-thumb {\n  background-color: var(--bs-secondary-color);\n}\n.form-range:disabled::-moz-range-thumb {\n  background-color: var(--bs-secondary-color);\n}\n.form-floating {\n  position: relative;\n}\n.form-floating > .form-control,\n.form-floating > .form-control-plaintext,\n.form-floating > .form-select {\n  height: calc(3.5rem + calc(var(--bs-border-width) * 2));\n  min-height: calc(3.5rem + calc(var(--bs-border-width) * 2));\n  line-height: 1.25;\n}\n.form-floating > label {\n  position: absolute;\n  top: 0;\n  left: 0;\n  z-index: 2;\n  height: 100%;\n  padding: 1rem 0.75rem;\n  overflow: hidden;\n  text-align: start;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n  pointer-events: none;\n  border: var(--bs-border-width) solid transparent;\n  transform-origin: 0 0;\n  transition:\n    opacity 0.1s ease-in-out,\n    transform 0.1s ease-in-out;\n}\n@media (prefers-reduced-motion: reduce) {\n  .form-floating > label {\n    transition: none;\n  }\n}\n.form-floating > .form-control,\n.form-floating > .form-control-plaintext {\n  padding: 1rem 0.75rem;\n}\n.form-floating > .form-control-plaintext::-moz-placeholder,\n.form-floating > .form-control::-moz-placeholder {\n  color: transparent;\n}\n.form-floating > .form-control-plaintext::placeholder,\n.form-floating > .form-control::placeholder {\n  color: transparent;\n}\n.form-floating > .form-control-plaintext:not(:-moz-placeholder-shown),\n.form-floating > .form-control:not(:-moz-placeholder-shown) {\n  padding-top: 1.625rem;\n  padding-bottom: 0.625rem;\n}\n.form-floating > .form-control-plaintext:focus,\n.form-floating > .form-control-plaintext:not(:placeholder-shown),\n.form-floating > .form-control:focus,\n.form-floating > .form-control:not(:placeholder-shown) {\n  padding-top: 1.625rem;\n  padding-bottom: 0.625rem;\n}\n.form-floating > .form-control-plaintext:-webkit-autofill,\n.form-floating > .form-control:-webkit-autofill {\n  padding-top: 1.625rem;\n  padding-bottom: 0.625rem;\n}\n.form-floating > .form-select {\n  padding-top: 1.625rem;\n  padding-bottom: 0.625rem;\n}\n.form-floating > .form-control:not(:-moz-placeholder-shown) ~ label {\n  color: rgba(var(--bs-body-color-rgb), 0.65);\n  transform: scale(0.85) translateY(-0.5rem) translateX(0.15rem);\n}\n.form-floating > .form-control-plaintext ~ label,\n.form-floating > .form-control:focus ~ label,\n.form-floating > .form-control:not(:placeholder-shown) ~ label,\n.form-floating > .form-select ~ label {\n  color: rgba(var(--bs-body-color-rgb), 0.65);\n  transform: scale(0.85) translateY(-0.5rem) translateX(0.15rem);\n}\n.form-floating > .form-control:not(:-moz-placeholder-shown) ~ label::after {\n  position: absolute;\n  inset: 1rem 0.375rem;\n  z-index: -1;\n  height: 1.5em;\n  content: \'\';\n  background-color: var(--bs-body-bg);\n  border-radius: var(--bs-border-radius);\n}\n.form-floating > .form-control-plaintext ~ label::after,\n.form-floating > .form-control:focus ~ label::after,\n.form-floating > .form-control:not(:placeholder-shown) ~ label::after,\n.form-floating > .form-select ~ label::after {\n  position: absolute;\n  inset: 1rem 0.375rem;\n  z-index: -1;\n  height: 1.5em;\n  content: \'\';\n  background-color: var(--bs-body-bg);\n  border-radius: var(--bs-border-radius);\n}\n.form-floating > .form-control:-webkit-autofill ~ label {\n  color: rgba(var(--bs-body-color-rgb), 0.65);\n  transform: scale(0.85) translateY(-0.5rem) translateX(0.15rem);\n}\n.form-floating > .form-control-plaintext ~ label {\n  border-width: var(--bs-border-width) 0;\n}\n.form-floating > .form-control:disabled ~ label,\n.form-floating > :disabled ~ label {\n  color: #6c757d;\n}\n.form-floating > .form-control:disabled ~ label::after,\n.form-floating > :disabled ~ label::after {\n  background-color: var(--bs-secondary-bg);\n}\n.input-group {\n  position: relative;\n  display: flex;\n  flex-wrap: wrap;\n  align-items: stretch;\n  width: 100%;\n}\n.input-group > .form-control,\n.input-group > .form-floating,\n.input-group > .form-select {\n  position: relative;\n  flex: 1 1 auto;\n  width: 1%;\n  min-width: 0;\n}\n.input-group > .form-control:focus,\n.input-group > .form-floating:focus-within,\n.input-group > .form-select:focus {\n  z-index: 5;\n}\n.input-group .btn {\n  position: relative;\n  z-index: 2;\n}\n.input-group .btn:focus {\n  z-index: 5;\n}\n.input-group-text {\n  display: flex;\n  align-items: center;\n  padding: 0.375rem 0.75rem;\n  font-size: 1rem;\n  font-weight: 400;\n  line-height: 1.5;\n  color: var(--bs-body-color);\n  text-align: center;\n  white-space: nowrap;\n  background-color: var(--bs-tertiary-bg);\n  border: var(--bs-border-width) solid var(--bs-border-color);\n  border-radius: var(--bs-border-radius);\n}\n.input-group-lg > .btn,\n.input-group-lg > .form-control,\n.input-group-lg > .form-select,\n.input-group-lg > .input-group-text {\n  padding: 0.5rem 1rem;\n  font-size: 1.25rem;\n  border-radius: var(--bs-border-radius-lg);\n}\n.input-group-sm > .btn,\n.input-group-sm > .form-control,\n.input-group-sm > .form-select,\n.input-group-sm > .input-group-text {\n  padding: 0.25rem 0.5rem;\n  font-size: 0.875rem;\n  border-radius: var(--bs-border-radius-sm);\n}\n.input-group-lg > .form-select,\n.input-group-sm > .form-select {\n  padding-right: 3rem;\n}\n.input-group:not(.has-validation) > .dropdown-toggle:nth-last-child(n + 3),\n.input-group:not(.has-validation)\n  > .form-floating:not(:last-child)\n  > .form-control,\n.input-group:not(.has-validation)\n  > .form-floating:not(:last-child)\n  > .form-select,\n.input-group:not(.has-validation)\n  > :not(:last-child):not(.dropdown-toggle):not(.dropdown-menu):not(\n    .form-floating\n  ) {\n  border-top-right-radius: 0;\n  border-bottom-right-radius: 0;\n}\n.input-group.has-validation > .dropdown-toggle:nth-last-child(n + 4),\n.input-group.has-validation\n  > .form-floating:nth-last-child(n + 3)\n  > .form-control,\n.input-group.has-validation\n  > .form-floating:nth-last-child(n + 3)\n  > .form-select,\n.input-group.has-validation\n  > :nth-last-child(n + 3):not(.dropdown-toggle):not(.dropdown-menu):not(\n    .form-floating\n  ) {\n  border-top-right-radius: 0;\n  border-bottom-right-radius: 0;\n}\n.input-group\n  > :not(:first-child):not(.dropdown-menu):not(.valid-tooltip):not(\n    .valid-feedback\n  ):not(.invalid-tooltip):not(.invalid-feedback) {\n  margin-left: calc(var(--bs-border-width) * -1);\n  border-top-left-radius: 0;\n  border-bottom-left-radius: 0;\n}\n.input-group > .form-floating:not(:first-child) > .form-control,\n.input-group > .form-floating:not(:first-child) > .form-select {\n  border-top-left-radius: 0;\n  border-bottom-left-radius: 0;\n}\n.valid-feedback {\n  display: none;\n  width: 100%;\n  margin-top: 0.25rem;\n  font-size: 0.875em;\n  color: var(--bs-form-valid-color);\n}\n.valid-tooltip {\n  position: absolute;\n  top: 100%;\n  z-index: 5;\n  display: none;\n  max-width: 100%;\n  padding: 0.25rem 0.5rem;\n  margin-top: 0.1rem;\n  font-size: 0.875rem;\n  color: #fff;\n  background-color: var(--bs-success);\n  border-radius: var(--bs-border-radius);\n}\n.is-valid ~ .valid-feedback,\n.is-valid ~ .valid-tooltip,\n.was-validated :valid ~ .valid-feedback,\n.was-validated :valid ~ .valid-tooltip {\n  display: block;\n}\n.form-control.is-valid,\n.was-validated .form-control:valid {\n  border-color: var(--bs-form-valid-border-color);\n  padding-right: calc(1.5em + 0.75rem);\n  background-image: url(\"data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 8 8\'%3e%3cpath fill=\'%23198754\' d=\'M2.3 6.73.6 4.53c-.4-1.04.46-1.4 1.1-.8l1.1 1.4 3.4-3.8c.6-.63 1.6-.27 1.2.7l-4 4.6c-.43.5-.8.4-1.1.1z\'/%3e%3c/svg%3e\");\n  background-repeat: no-repeat;\n  background-position: right calc(0.375em + 0.1875rem) center;\n  background-size: calc(0.75em + 0.375rem) calc(0.75em + 0.375rem);\n}\n.form-control.is-valid:focus,\n.was-validated .form-control:valid:focus {\n  border-color: var(--bs-form-valid-border-color);\n  box-shadow: 0 0 0 0.25rem rgba(var(--bs-success-rgb), 0.25);\n}\n.was-validated textarea.form-control:valid,\ntextarea.form-control.is-valid {\n  padding-right: calc(1.5em + 0.75rem);\n  background-position: top calc(0.375em + 0.1875rem) right\n    calc(0.375em + 0.1875rem);\n}\n.form-select.is-valid,\n.was-validated .form-select:valid {\n  border-color: var(--bs-form-valid-border-color);\n}\n.form-select.is-valid:not([multiple]):not([size]),\n.form-select.is-valid:not([multiple])[size=\'1\'],\n.was-validated .form-select:valid:not([multiple]):not([size]),\n.was-validated .form-select:valid:not([multiple])[size=\'1\'] {\n  --bs-form-select-bg-icon: url(\"data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 8 8\'%3e%3cpath fill=\'%23198754\' d=\'M2.3 6.73.6 4.53c-.4-1.04.46-1.4 1.1-.8l1.1 1.4 3.4-3.8c.6-.63 1.6-.27 1.2.7l-4 4.6c-.43.5-.8.4-1.1.1z\'/%3e%3c/svg%3e\");\n  padding-right: 4.125rem;\n  background-position:\n    right 0.75rem center,\n    center right 2.25rem;\n  background-size:\n    16px 12px,\n    calc(0.75em + 0.375rem) calc(0.75em + 0.375rem);\n}\n.form-select.is-valid:focus,\n.was-validated .form-select:valid:focus {\n  border-color: var(--bs-form-valid-border-color);\n  box-shadow: 0 0 0 0.25rem rgba(var(--bs-success-rgb), 0.25);\n}\n.form-control-color.is-valid,\n.was-validated .form-control-color:valid {\n  width: calc(3rem + calc(1.5em + 0.75rem));\n}\n.form-check-input.is-valid,\n.was-validated .form-check-input:valid {\n  border-color: var(--bs-form-valid-border-color);\n}\n.form-check-input.is-valid:checked,\n.was-validated .form-check-input:valid:checked {\n  background-color: var(--bs-form-valid-color);\n}\n.form-check-input.is-valid:focus,\n.was-validated .form-check-input:valid:focus {\n  box-shadow: 0 0 0 0.25rem rgba(var(--bs-success-rgb), 0.25);\n}\n.form-check-input.is-valid ~ .form-check-label,\n.was-validated .form-check-input:valid ~ .form-check-label {\n  color: var(--bs-form-valid-color);\n}\n.form-check-inline .form-check-input ~ .valid-feedback {\n  margin-left: 0.5em;\n}\n.input-group > .form-control:not(:focus).is-valid,\n.input-group > .form-floating:not(:focus-within).is-valid,\n.input-group > .form-select:not(:focus).is-valid,\n.was-validated .input-group > .form-control:not(:focus):valid,\n.was-validated .input-group > .form-floating:not(:focus-within):valid,\n.was-validated .input-group > .form-select:not(:focus):valid {\n  z-index: 3;\n}\n.invalid-feedback {\n  display: none;\n  width: 100%;\n  margin-top: 0.25rem;\n  font-size: 0.875em;\n  color: var(--bs-form-invalid-color);\n}\n.invalid-tooltip {\n  position: absolute;\n  top: 100%;\n  z-index: 5;\n  display: none;\n  max-width: 100%;\n  padding: 0.25rem 0.5rem;\n  margin-top: 0.1rem;\n  font-size: 0.875rem;\n  color: #fff;\n  background-color: var(--bs-danger);\n  border-radius: var(--bs-border-radius);\n}\n.is-invalid ~ .invalid-feedback,\n.is-invalid ~ .invalid-tooltip,\n.was-validated :invalid ~ .invalid-feedback,\n.was-validated :invalid ~ .invalid-tooltip {\n  display: block;\n}\n.form-control.is-invalid,\n.was-validated .form-control:invalid {\n  border-color: var(--bs-form-invalid-border-color);\n  padding-right: calc(1.5em + 0.75rem);\n  background-image: url(\"data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 12 12\' width=\'12\' height=\'12\' fill=\'none\' stroke=\'%23dc3545\'%3e%3ccircle cx=\'6\' cy=\'6\' r=\'4.5\'/%3e%3cpath stroke-linejoin=\'round\' d=\'M5.8 3.6h.4L6 6.5z\'/%3e%3ccircle cx=\'6\' cy=\'8.2\' r=\'.6\' fill=\'%23dc3545\' stroke=\'none\'/%3e%3c/svg%3e\");\n  background-repeat: no-repeat;\n  background-position: right calc(0.375em + 0.1875rem) center;\n  background-size: calc(0.75em + 0.375rem) calc(0.75em + 0.375rem);\n}\n.form-control.is-invalid:focus,\n.was-validated .form-control:invalid:focus {\n  border-color: var(--bs-form-invalid-border-color);\n  box-shadow: 0 0 0 0.25rem rgba(var(--bs-danger-rgb), 0.25);\n}\n.was-validated textarea.form-control:invalid,\ntextarea.form-control.is-invalid {\n  padding-right: calc(1.5em + 0.75rem);\n  background-position: top calc(0.375em + 0.1875rem) right\n    calc(0.375em + 0.1875rem);\n}\n.form-select.is-invalid,\n.was-validated .form-select:invalid {\n  border-color: var(--bs-form-invalid-border-color);\n}\n.form-select.is-invalid:not([multiple]):not([size]),\n.form-select.is-invalid:not([multiple])[size=\'1\'],\n.was-validated .form-select:invalid:not([multiple]):not([size]),\n.was-validated .form-select:invalid:not([multiple])[size=\'1\'] {\n  --bs-form-select-bg-icon: url(\"data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 12 12\' width=\'12\' height=\'12\' fill=\'none\' stroke=\'%23dc3545\'%3e%3ccircle cx=\'6\' cy=\'6\' r=\'4.5\'/%3e%3cpath stroke-linejoin=\'round\' d=\'M5.8 3.6h.4L6 6.5z\'/%3e%3ccircle cx=\'6\' cy=\'8.2\' r=\'.6\' fill=\'%23dc3545\' stroke=\'none\'/%3e%3c/svg%3e\");\n  padding-right: 4.125rem;\n  background-position:\n    right 0.75rem center,\n    center right 2.25rem;\n  background-size:\n    16px 12px,\n    calc(0.75em + 0.375rem) calc(0.75em + 0.375rem);\n}\n.form-select.is-invalid:focus,\n.was-validated .form-select:invalid:focus {\n  border-color: var(--bs-form-invalid-border-color);\n  box-shadow: 0 0 0 0.25rem rgba(var(--bs-danger-rgb), 0.25);\n}\n.form-control-color.is-invalid,\n.was-validated .form-control-color:invalid {\n  width: calc(3rem + calc(1.5em + 0.75rem));\n}\n.form-check-input.is-invalid,\n.was-validated .form-check-input:invalid {\n  border-color: var(--bs-form-invalid-border-color);\n}\n.form-check-input.is-invalid:checked,\n.was-validated .form-check-input:invalid:checked {\n  background-color: var(--bs-form-invalid-color);\n}\n.form-check-input.is-invalid:focus,\n.was-validated .form-check-input:invalid:focus {\n  box-shadow: 0 0 0 0.25rem rgba(var(--bs-danger-rgb), 0.25);\n}\n.form-check-input.is-invalid ~ .form-check-label,\n.was-validated .form-check-input:invalid ~ .form-check-label {\n  color: var(--bs-form-invalid-color);\n}\n.form-check-inline .form-check-input ~ .invalid-feedback {\n  margin-left: 0.5em;\n}\n.input-group > .form-control:not(:focus).is-invalid,\n.input-group > .form-floating:not(:focus-within).is-invalid,\n.input-group > .form-select:not(:focus).is-invalid,\n.was-validated .input-group > .form-control:not(:focus):invalid,\n.was-validated .input-group > .form-floating:not(:focus-within):invalid,\n.was-validated .input-group > .form-select:not(:focus):invalid {\n  z-index: 4;\n}\n.btn {\n  --bs-btn-padding-x: 0.75rem;\n  --bs-btn-padding-y: 0.375rem;\n  --bs-btn-font-family: ;\n  --bs-btn-font-size: 1rem;\n  --bs-btn-font-weight: 400;\n  --bs-btn-line-height: 1.5;\n  --bs-btn-color: var(--bs-body-color);\n  --bs-btn-bg: transparent;\n  --bs-btn-border-width: var(--bs-border-width);\n  --bs-btn-border-color: transparent;\n  --bs-btn-border-radius: var(--bs-border-radius);\n  --bs-btn-hover-border-color: transparent;\n  --bs-btn-box-shadow:\n    inset 0 1px 0 rgba(255, 255, 255, 0.15), 0 1px 1px rgba(0, 0, 0, 0.075);\n  --bs-btn-disabled-opacity: 0.65;\n  --bs-btn-focus-box-shadow: 0 0 0 0.25rem\n    rgba(var(--bs-btn-focus-shadow-rgb), 0.5);\n  display: inline-block;\n  padding: var(--bs-btn-padding-y) var(--bs-btn-padding-x);\n  font-family: var(--bs-btn-font-family);\n  font-size: var(--bs-btn-font-size);\n  font-weight: var(--bs-btn-font-weight);\n  line-height: var(--bs-btn-line-height);\n  color: var(--bs-btn-color);\n  text-align: center;\n  text-decoration: none;\n  vertical-align: middle;\n  cursor: pointer;\n  -webkit-user-select: none;\n  -moz-user-select: none;\n  user-select: none;\n  border: var(--bs-btn-border-width) solid var(--bs-btn-border-color);\n  border-radius: var(--bs-btn-border-radius);\n  background-color: var(--bs-btn-bg);\n  transition:\n    color 0.15s ease-in-out,\n    background-color 0.15s ease-in-out,\n    border-color 0.15s ease-in-out,\n    box-shadow 0.15s ease-in-out;\n}\n@media (prefers-reduced-motion: reduce) {\n  .btn {\n    transition: none;\n  }\n}\n.btn:hover {\n  color: var(--bs-btn-hover-color);\n  background-color: var(--bs-btn-hover-bg);\n  border-color: var(--bs-btn-hover-border-color);\n}\n.btn-check + .btn:hover {\n  color: var(--bs-btn-color);\n  background-color: var(--bs-btn-bg);\n  border-color: var(--bs-btn-border-color);\n}\n.btn:focus-visible {\n  color: var(--bs-btn-hover-color);\n  background-color: var(--bs-btn-hover-bg);\n  border-color: var(--bs-btn-hover-border-color);\n  outline: 0;\n  box-shadow: var(--bs-btn-focus-box-shadow);\n}\n.btn-check:focus-visible + .btn {\n  border-color: var(--bs-btn-hover-border-color);\n  outline: 0;\n  box-shadow: var(--bs-btn-focus-box-shadow);\n}\n.btn-check:checked + .btn,\n.btn.active,\n.btn.show,\n.btn:first-child:active,\n:not(.btn-check) + .btn:active {\n  color: var(--bs-btn-active-color);\n  background-color: var(--bs-btn-active-bg);\n  border-color: var(--bs-btn-active-border-color);\n}\n.btn-check:checked + .btn:focus-visible,\n.btn.active:focus-visible,\n.btn.show:focus-visible,\n.btn:first-child:active:focus-visible,\n:not(.btn-check) + .btn:active:focus-visible {\n  box-shadow: var(--bs-btn-focus-box-shadow);\n}\n.btn-check:checked:focus-visible + .btn {\n  box-shadow: var(--bs-btn-focus-box-shadow);\n}\n.btn.disabled,\n.btn:disabled,\nfieldset:disabled .btn {\n  color: var(--bs-btn-disabled-color);\n  pointer-events: none;\n  background-color: var(--bs-btn-disabled-bg);\n  border-color: var(--bs-btn-disabled-border-color);\n  opacity: var(--bs-btn-disabled-opacity);\n}\n.btn-primary {\n  --bs-btn-color: #fff;\n  --bs-btn-bg: #0d6efd;\n  --bs-btn-border-color: #0d6efd;\n  --bs-btn-hover-color: #fff;\n  --bs-btn-hover-bg: #0b5ed7;\n  --bs-btn-hover-border-color: #0a58ca;\n  --bs-btn-focus-shadow-rgb: 49, 132, 253;\n  --bs-btn-active-color: #fff;\n  --bs-btn-active-bg: #0a58ca;\n  --bs-btn-active-border-color: #0a53be;\n  --bs-btn-active-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125);\n  --bs-btn-disabled-color: #fff;\n  --bs-btn-disabled-bg: #0d6efd;\n  --bs-btn-disabled-border-color: #0d6efd;\n}\n.btn-secondary {\n  --bs-btn-color: #fff;\n  --bs-btn-bg: #6c757d;\n  --bs-btn-border-color: #6c757d;\n  --bs-btn-hover-color: #fff;\n  --bs-btn-hover-bg: #5c636a;\n  --bs-btn-hover-border-color: #565e64;\n  --bs-btn-focus-shadow-rgb: 130, 138, 145;\n  --bs-btn-active-color: #fff;\n  --bs-btn-active-bg: #565e64;\n  --bs-btn-active-border-color: #51585e;\n  --bs-btn-active-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125);\n  --bs-btn-disabled-color: #fff;\n  --bs-btn-disabled-bg: #6c757d;\n  --bs-btn-disabled-border-color: #6c757d;\n}\n.btn-success {\n  --bs-btn-color: #fff;\n  --bs-btn-bg: #198754;\n  --bs-btn-border-color: #198754;\n  --bs-btn-hover-color: #fff;\n  --bs-btn-hover-bg: #157347;\n  --bs-btn-hover-border-color: #146c43;\n  --bs-btn-focus-shadow-rgb: 60, 153, 110;\n  --bs-btn-active-color: #fff;\n  --bs-btn-active-bg: #146c43;\n  --bs-btn-active-border-color: #13653f;\n  --bs-btn-active-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125);\n  --bs-btn-disabled-color: #fff;\n  --bs-btn-disabled-bg: #198754;\n  --bs-btn-disabled-border-color: #198754;\n}\n.btn-info {\n  --bs-btn-color: #000;\n  --bs-btn-bg: #0dcaf0;\n  --bs-btn-border-color: #0dcaf0;\n  --bs-btn-hover-color: #000;\n  --bs-btn-hover-bg: #31d2f2;\n  --bs-btn-hover-border-color: #25cff2;\n  --bs-btn-focus-shadow-rgb: 11, 172, 204;\n  --bs-btn-active-color: #000;\n  --bs-btn-active-bg: #3dd5f3;\n  --bs-btn-active-border-color: #25cff2;\n  --bs-btn-active-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125);\n  --bs-btn-disabled-color: #000;\n  --bs-btn-disabled-bg: #0dcaf0;\n  --bs-btn-disabled-border-color: #0dcaf0;\n}\n.btn-warning {\n  --bs-btn-color: #000;\n  --bs-btn-bg: #ffc107;\n  --bs-btn-border-color: #ffc107;\n  --bs-btn-hover-color: #000;\n  --bs-btn-hover-bg: #ffca2c;\n  --bs-btn-hover-border-color: #ffc720;\n  --bs-btn-focus-shadow-rgb: 217, 164, 6;\n  --bs-btn-active-color: #000;\n  --bs-btn-active-bg: #ffcd39;\n  --bs-btn-active-border-color: #ffc720;\n  --bs-btn-active-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125);\n  --bs-btn-disabled-color: #000;\n  --bs-btn-disabled-bg: #ffc107;\n  --bs-btn-disabled-border-color: #ffc107;\n}\n.btn-danger {\n  --bs-btn-color: #fff;\n  --bs-btn-bg: #dc3545;\n  --bs-btn-border-color: #dc3545;\n  --bs-btn-hover-color: #fff;\n  --bs-btn-hover-bg: #bb2d3b;\n  --bs-btn-hover-border-color: #b02a37;\n  --bs-btn-focus-shadow-rgb: 225, 83, 97;\n  --bs-btn-active-color: #fff;\n  --bs-btn-active-bg: #b02a37;\n  --bs-btn-active-border-color: #a52834;\n  --bs-btn-active-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125);\n  --bs-btn-disabled-color: #fff;\n  --bs-btn-disabled-bg: #dc3545;\n  --bs-btn-disabled-border-color: #dc3545;\n}\n.btn-light {\n  --bs-btn-color: #000;\n  --bs-btn-bg: #f8f9fa;\n  --bs-btn-border-color: #f8f9fa;\n  --bs-btn-hover-color: #000;\n  --bs-btn-hover-bg: #d3d4d5;\n  --bs-btn-hover-border-color: #c6c7c8;\n  --bs-btn-focus-shadow-rgb: 211, 212, 213;\n  --bs-btn-active-color: #000;\n  --bs-btn-active-bg: #c6c7c8;\n  --bs-btn-active-border-color: #babbbc;\n  --bs-btn-active-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125);\n  --bs-btn-disabled-color: #000;\n  --bs-btn-disabled-bg: #f8f9fa;\n  --bs-btn-disabled-border-color: #f8f9fa;\n}\n.btn-dark {\n  --bs-btn-color: #fff;\n  --bs-btn-bg: #212529;\n  --bs-btn-border-color: #212529;\n  --bs-btn-hover-color: #fff;\n  --bs-btn-hover-bg: #424649;\n  --bs-btn-hover-border-color: #373b3e;\n  --bs-btn-focus-shadow-rgb: 66, 70, 73;\n  --bs-btn-active-color: #fff;\n  --bs-btn-active-bg: #4d5154;\n  --bs-btn-active-border-color: #373b3e;\n  --bs-btn-active-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125);\n  --bs-btn-disabled-color: #fff;\n  --bs-btn-disabled-bg: #212529;\n  --bs-btn-disabled-border-color: #212529;\n}\n.btn-outline-primary {\n  --bs-btn-color: #0d6efd;\n  --bs-btn-border-color: #0d6efd;\n  --bs-btn-hover-color: #fff;\n  --bs-btn-hover-bg: #0d6efd;\n  --bs-btn-hover-border-color: #0d6efd;\n  --bs-btn-focus-shadow-rgb: 13, 110, 253;\n  --bs-btn-active-color: #fff;\n  --bs-btn-active-bg: #0d6efd;\n  --bs-btn-active-border-color: #0d6efd;\n  --bs-btn-active-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125);\n  --bs-btn-disabled-color: #0d6efd;\n  --bs-btn-disabled-bg: transparent;\n  --bs-btn-disabled-border-color: #0d6efd;\n  --bs-gradient: none;\n}\n.btn-outline-secondary {\n  --bs-btn-color: #6c757d;\n  --bs-btn-border-color: #6c757d;\n  --bs-btn-hover-color: #fff;\n  --bs-btn-hover-bg: #6c757d;\n  --bs-btn-hover-border-color: #6c757d;\n  --bs-btn-focus-shadow-rgb: 108, 117, 125;\n  --bs-btn-active-color: #fff;\n  --bs-btn-active-bg: #6c757d;\n  --bs-btn-active-border-color: #6c757d;\n  --bs-btn-active-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125);\n  --bs-btn-disabled-color: #6c757d;\n  --bs-btn-disabled-bg: transparent;\n  --bs-btn-disabled-border-color: #6c757d;\n  --bs-gradient: none;\n}\n.btn-outline-success {\n  --bs-btn-color: #198754;\n  --bs-btn-border-color: #198754;\n  --bs-btn-hover-color: #fff;\n  --bs-btn-hover-bg: #198754;\n  --bs-btn-hover-border-color: #198754;\n  --bs-btn-focus-shadow-rgb: 25, 135, 84;\n  --bs-btn-active-color: #fff;\n  --bs-btn-active-bg: #198754;\n  --bs-btn-active-border-color: #198754;\n  --bs-btn-active-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125);\n  --bs-btn-disabled-color: #198754;\n  --bs-btn-disabled-bg: transparent;\n  --bs-btn-disabled-border-color: #198754;\n  --bs-gradient: none;\n}\n.btn-outline-info {\n  --bs-btn-color: #0dcaf0;\n  --bs-btn-border-color: #0dcaf0;\n  --bs-btn-hover-color: #000;\n  --bs-btn-hover-bg: #0dcaf0;\n  --bs-btn-hover-border-color: #0dcaf0;\n  --bs-btn-focus-shadow-rgb: 13, 202, 240;\n  --bs-btn-active-color: #000;\n  --bs-btn-active-bg: #0dcaf0;\n  --bs-btn-active-border-color: #0dcaf0;\n  --bs-btn-active-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125);\n  --bs-btn-disabled-color: #0dcaf0;\n  --bs-btn-disabled-bg: transparent;\n  --bs-btn-disabled-border-color: #0dcaf0;\n  --bs-gradient: none;\n}\n.btn-outline-warning {\n  --bs-btn-color: #ffc107;\n  --bs-btn-border-color: #ffc107;\n  --bs-btn-hover-color: #000;\n  --bs-btn-hover-bg: #ffc107;\n  --bs-btn-hover-border-color: #ffc107;\n  --bs-btn-focus-shadow-rgb: 255, 193, 7;\n  --bs-btn-active-color: #000;\n  --bs-btn-active-bg: #ffc107;\n  --bs-btn-active-border-color: #ffc107;\n  --bs-btn-active-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125);\n  --bs-btn-disabled-color: #ffc107;\n  --bs-btn-disabled-bg: transparent;\n  --bs-btn-disabled-border-color: #ffc107;\n  --bs-gradient: none;\n}\n.btn-outline-danger {\n  --bs-btn-color: #dc3545;\n  --bs-btn-border-color: #dc3545;\n  --bs-btn-hover-color: #fff;\n  --bs-btn-hover-bg: #dc3545;\n  --bs-btn-hover-border-color: #dc3545;\n  --bs-btn-focus-shadow-rgb: 220, 53, 69;\n  --bs-btn-active-color: #fff;\n  --bs-btn-active-bg: #dc3545;\n  --bs-btn-active-border-color: #dc3545;\n  --bs-btn-active-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125);\n  --bs-btn-disabled-color: #dc3545;\n  --bs-btn-disabled-bg: transparent;\n  --bs-btn-disabled-border-color: #dc3545;\n  --bs-gradient: none;\n}\n.btn-outline-light {\n  --bs-btn-color: #f8f9fa;\n  --bs-btn-border-color: #f8f9fa;\n  --bs-btn-hover-color: #000;\n  --bs-btn-hover-bg: #f8f9fa;\n  --bs-btn-hover-border-color: #f8f9fa;\n  --bs-btn-focus-shadow-rgb: 248, 249, 250;\n  --bs-btn-active-color: #000;\n  --bs-btn-active-bg: #f8f9fa;\n  --bs-btn-active-border-color: #f8f9fa;\n  --bs-btn-active-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125);\n  --bs-btn-disabled-color: #f8f9fa;\n  --bs-btn-disabled-bg: transparent;\n  --bs-btn-disabled-border-color: #f8f9fa;\n  --bs-gradient: none;\n}\n.btn-outline-dark {\n  --bs-btn-color: #212529;\n  --bs-btn-border-color: #212529;\n  --bs-btn-hover-color: #fff;\n  --bs-btn-hover-bg: #212529;\n  --bs-btn-hover-border-color: #212529;\n  --bs-btn-focus-shadow-rgb: 33, 37, 41;\n  --bs-btn-active-color: #fff;\n  --bs-btn-active-bg: #212529;\n  --bs-btn-active-border-color: #212529;\n  --bs-btn-active-shadow: inset 0 3px 5px rgba(0, 0, 0, 0.125);\n  --bs-btn-disabled-color: #212529;\n  --bs-btn-disabled-bg: transparent;\n  --bs-btn-disabled-border-color: #212529;\n  --bs-gradient: none;\n}\n.btn-link {\n  --bs-btn-font-weight: 400;\n  --bs-btn-color: var(--bs-link-color);\n  --bs-btn-bg: transparent;\n  --bs-btn-border-color: transparent;\n  --bs-btn-hover-color: var(--bs-link-hover-color);\n  --bs-btn-hover-border-color: transparent;\n  --bs-btn-active-color: var(--bs-link-hover-color);\n  --bs-btn-active-border-color: transparent;\n  --bs-btn-disabled-color: #6c757d;\n  --bs-btn-disabled-border-color: transparent;\n  --bs-btn-box-shadow: 0 0 0 #000;\n  --bs-btn-focus-shadow-rgb: 49, 132, 253;\n  text-decoration: underline;\n}\n.btn-link:focus-visible {\n  color: var(--bs-btn-color);\n}\n.btn-link:hover {\n  color: var(--bs-btn-hover-color);\n}\n.btn-group-lg > .btn,\n.btn-lg {\n  --bs-btn-padding-y: 0.5rem;\n  --bs-btn-padding-x: 1rem;\n  --bs-btn-font-size: 1.25rem;\n  --bs-btn-border-radius: var(--bs-border-radius-lg);\n}\n.btn-group-sm > .btn,\n.btn-sm {\n  --bs-btn-padding-y: 0.25rem;\n  --bs-btn-padding-x: 0.5rem;\n  --bs-btn-font-size: 0.875rem;\n  --bs-btn-border-radius: var(--bs-border-radius-sm);\n}\n.fade {\n  transition: opacity 0.15s linear;\n}\n@media (prefers-reduced-motion: reduce) {\n  .fade {\n    transition: none;\n  }\n}\n.fade:not(.show) {\n  opacity: 0;\n}\n.collapse:not(.show) {\n  display: none;\n}\n.collapsing {\n  height: 0;\n  overflow: hidden;\n  transition: height 0.35s ease;\n}\n@media (prefers-reduced-motion: reduce) {\n  .collapsing {\n    transition: none;\n  }\n}\n.collapsing.collapse-horizontal {\n  width: 0;\n  height: auto;\n  transition: width 0.35s ease;\n}\n@media (prefers-reduced-motion: reduce) {\n  .collapsing.collapse-horizontal {\n    transition: none;\n  }\n}\n.dropdown,\n.dropdown-center,\n.dropend,\n.dropstart,\n.dropup,\n.dropup-center {\n  position: relative;\n}\n.dropdown-toggle {\n  white-space: nowrap;\n}\n.dropdown-toggle::after {\n  display: inline-block;\n  margin-left: 0.255em;\n  vertical-align: 0.255em;\n  content: \'\';\n  border-top: 0.3em solid;\n  border-right: 0.3em solid transparent;\n  border-bottom: 0;\n  border-left: 0.3em solid transparent;\n}\n.dropdown-toggle:empty::after {\n  margin-left: 0;\n}\n.dropdown-menu {\n  --bs-dropdown-zindex: 1000;\n  --bs-dropdown-min-width: 10rem;\n  --bs-dropdown-padding-x: 0;\n  --bs-dropdown-padding-y: 0.5rem;\n  --bs-dropdown-spacer: 0.125rem;\n  --bs-dropdown-font-size: 1rem;\n  --bs-dropdown-color: var(--bs-body-color);\n  --bs-dropdown-bg: var(--bs-body-bg);\n  --bs-dropdown-border-color: var(--bs-border-color-translucent);\n  --bs-dropdown-border-radius: var(--bs-border-radius);\n  --bs-dropdown-border-width: var(--bs-border-width);\n  --bs-dropdown-inner-border-radius: calc(\n    var(--bs-border-radius) - var(--bs-border-width)\n  );\n  --bs-dropdown-divider-bg: var(--bs-border-color-translucent);\n  --bs-dropdown-divider-margin-y: 0.5rem;\n  --bs-dropdown-box-shadow: var(--bs-box-shadow);\n  --bs-dropdown-link-color: var(--bs-body-color);\n  --bs-dropdown-link-hover-color: var(--bs-body-color);\n  --bs-dropdown-link-hover-bg: var(--bs-tertiary-bg);\n  --bs-dropdown-link-active-color: #fff;\n  --bs-dropdown-link-active-bg: #0d6efd;\n  --bs-dropdown-link-disabled-color: var(--bs-tertiary-color);\n  --bs-dropdown-item-padding-x: 1rem;\n  --bs-dropdown-item-padding-y: 0.25rem;\n  --bs-dropdown-header-color: #6c757d;\n  --bs-dropdown-header-padding-x: 1rem;\n  --bs-dropdown-header-padding-y: 0.5rem;\n  position: absolute;\n  z-index: var(--bs-dropdown-zindex);\n  display: none;\n  min-width: var(--bs-dropdown-min-width);\n  padding: var(--bs-dropdown-padding-y) var(--bs-dropdown-padding-x);\n  margin: 0;\n  font-size: var(--bs-dropdown-font-size);\n  color: var(--bs-dropdown-color);\n  text-align: left;\n  list-style: none;\n  background-color: var(--bs-dropdown-bg);\n  background-clip: padding-box;\n  border: var(--bs-dropdown-border-width) solid var(--bs-dropdown-border-color);\n  border-radius: var(--bs-dropdown-border-radius);\n}\n.dropdown-menu[data-bs-popper] {\n  top: 100%;\n  left: 0;\n  margin-top: var(--bs-dropdown-spacer);\n}\n.dropdown-menu-start {\n  --bs-position: start;\n}\n.dropdown-menu-start[data-bs-popper] {\n  right: auto;\n  left: 0;\n}\n.dropdown-menu-end {\n  --bs-position: end;\n}\n.dropdown-menu-end[data-bs-popper] {\n  right: 0;\n  left: auto;\n}\n@media (min-width: 576px) {\n  .dropdown-menu-sm-start {\n    --bs-position: start;\n  }\n  .dropdown-menu-sm-start[data-bs-popper] {\n    right: auto;\n    left: 0;\n  }\n  .dropdown-menu-sm-end {\n    --bs-position: end;\n  }\n  .dropdown-menu-sm-end[data-bs-popper] {\n    right: 0;\n    left: auto;\n  }\n}\n@media (min-width: 768px) {\n  .dropdown-menu-md-start {\n    --bs-position: start;\n  }\n  .dropdown-menu-md-start[data-bs-popper] {\n    right: auto;\n    left: 0;\n  }\n  .dropdown-menu-md-end {\n    --bs-position: end;\n  }\n  .dropdown-menu-md-end[data-bs-popper] {\n    right: 0;\n    left: auto;\n  }\n}\n@media (min-width: 992px) {\n  .dropdown-menu-lg-start {\n    --bs-position: start;\n  }\n  .dropdown-menu-lg-start[data-bs-popper] {\n    right: auto;\n    left: 0;\n  }\n  .dropdown-menu-lg-end {\n    --bs-position: end;\n  }\n  .dropdown-menu-lg-end[data-bs-popper] {\n    right: 0;\n    left: auto;\n  }\n}\n@media (min-width: 1200px) {\n  .dropdown-menu-xl-start {\n    --bs-position: start;\n  }\n  .dropdown-menu-xl-start[data-bs-popper] {\n    right: auto;\n    left: 0;\n  }\n  .dropdown-menu-xl-end {\n    --bs-position: end;\n  }\n  .dropdown-menu-xl-end[data-bs-popper] {\n    right: 0;\n    left: auto;\n  }\n}\n@media (min-width: 1400px) {\n  .dropdown-menu-xxl-start {\n    --bs-position: start;\n  }\n  .dropdown-menu-xxl-start[data-bs-popper] {\n    right: auto;\n    left: 0;\n  }\n  .dropdown-menu-xxl-end {\n    --bs-position: end;\n  }\n  .dropdown-menu-xxl-end[data-bs-popper] {\n    right: 0;\n    left: auto;\n  }\n}\n.dropup .dropdown-menu[data-bs-popper] {\n  top: auto;\n  bottom: 100%;\n  margin-top: 0;\n  margin-bottom: var(--bs-dropdown-spacer);\n}\n.dropup .dropdown-toggle::after {\n  display: inline-block;\n  margin-left: 0.255em;\n  vertical-align: 0.255em;\n  content: \'\';\n  border-top: 0;\n  border-right: 0.3em solid transparent;\n  border-bottom: 0.3em solid;\n  border-left: 0.3em solid transparent;\n}\n.dropup .dropdown-toggle:empty::after {\n  margin-left: 0;\n}\n.dropend .dropdown-menu[data-bs-popper] {\n  top: 0;\n  right: auto;\n  left: 100%;\n  margin-top: 0;\n  margin-left: var(--bs-dropdown-spacer);\n}\n.dropend .dropdown-toggle::after {\n  display: inline-block;\n  margin-left: 0.255em;\n  vertical-align: 0.255em;\n  content: \'\';\n  border-top: 0.3em solid transparent;\n  border-right: 0;\n  border-bottom: 0.3em solid transparent;\n  border-left: 0.3em solid;\n}\n.dropend .dropdown-toggle:empty::after {\n  margin-left: 0;\n}\n.dropend .dropdown-toggle::after {\n  vertical-align: 0;\n}\n.dropstart .dropdown-menu[data-bs-popper] {\n  top: 0;\n  right: 100%;\n  left: auto;\n  margin-top: 0;\n  margin-right: var(--bs-dropdown-spacer);\n}\n.dropstart .dropdown-toggle::after {\n  display: inline-block;\n  margin-left: 0.255em;\n  vertical-align: 0.255em;\n  content: \'\';\n}\n.dropstart .dropdown-toggle::after {\n  display: none;\n}\n.dropstart .dropdown-toggle::before {\n  display: inline-block;\n  margin-right: 0.255em;\n  vertical-align: 0.255em;\n  content: \'\';\n  border-top: 0.3em solid transparent;\n  border-right: 0.3em solid;\n  border-bottom: 0.3em solid transparent;\n}\n.dropstart .dropdown-toggle:empty::after {\n  margin-left: 0;\n}\n.dropstart .dropdown-toggle::before {\n  vertical-align: 0;\n}\n.dropdown-divider {\n  height: 0;\n  margin: var(--bs-dropdown-divider-margin-y) 0;\n  overflow: hidden;\n  border-top: 1px solid var(--bs-dropdown-divider-bg);\n  opacity: 1;\n}\n.dropdown-item {\n  display: block;\n  width: 100%;\n  padding: var(--bs-dropdown-item-padding-y) var(--bs-dropdown-item-padding-x);\n  clear: both;\n  font-weight: 400;\n  color: var(--bs-dropdown-link-color);\n  text-align: inherit;\n  text-decoration: none;\n  white-space: nowrap;\n  background-color: transparent;\n  border: 0;\n  border-radius: var(--bs-dropdown-item-border-radius, 0);\n}\n.dropdown-item:focus,\n.dropdown-item:hover {\n  color: var(--bs-dropdown-link-hover-color);\n  background-color: var(--bs-dropdown-link-hover-bg);\n}\n.dropdown-item.active,\n.dropdown-item:active {\n  color: var(--bs-dropdown-link-active-color);\n  text-decoration: none;\n  background-color: var(--bs-dropdown-link-active-bg);\n}\n.dropdown-item.disabled,\n.dropdown-item:disabled {\n  color: var(--bs-dropdown-link-disabled-color);\n  pointer-events: none;\n  background-color: transparent;\n}\n.dropdown-menu.show {\n  display: block;\n}\n.dropdown-header {\n  display: block;\n  padding: var(--bs-dropdown-header-padding-y)\n    var(--bs-dropdown-header-padding-x);\n  margin-bottom: 0;\n  font-size: 0.875rem;\n  color: var(--bs-dropdown-header-color);\n  white-space: nowrap;\n}\n.dropdown-item-text {\n  display: block;\n  padding: var(--bs-dropdown-item-padding-y) var(--bs-dropdown-item-padding-x);\n  color: var(--bs-dropdown-link-color);\n}\n.dropdown-menu-dark {\n  --bs-dropdown-color: #dee2e6;\n  --bs-dropdown-bg: #343a40;\n  --bs-dropdown-border-color: var(--bs-border-color-translucent);\n  --bs-dropdown-box-shadow: ;\n  --bs-dropdown-link-color: #dee2e6;\n  --bs-dropdown-link-hover-color: #fff;\n  --bs-dropdown-divider-bg: var(--bs-border-color-translucent);\n  --bs-dropdown-link-hover-bg: rgba(255, 255, 255, 0.15);\n  --bs-dropdown-link-active-color: #fff;\n  --bs-dropdown-link-active-bg: #0d6efd;\n  --bs-dropdown-link-disabled-color: #adb5bd;\n  --bs-dropdown-header-color: #adb5bd;\n}\n.btn-group,\n.btn-group-vertical {\n  position: relative;\n  display: inline-flex;\n  vertical-align: middle;\n}\n.btn-group-vertical > .btn,\n.btn-group > .btn {\n  position: relative;\n  flex: 1 1 auto;\n}\n.btn-group-vertical > .btn-check:checked + .btn,\n.btn-group-vertical > .btn-check:focus + .btn,\n.btn-group-vertical > .btn.active,\n.btn-group-vertical > .btn:active,\n.btn-group-vertical > .btn:focus,\n.btn-group-vertical > .btn:hover,\n.btn-group > .btn-check:checked + .btn,\n.btn-group > .btn-check:focus + .btn,\n.btn-group > .btn.active,\n.btn-group > .btn:active,\n.btn-group > .btn:focus,\n.btn-group > .btn:hover {\n  z-index: 1;\n}\n.btn-toolbar {\n  display: flex;\n  flex-wrap: wrap;\n  justify-content: flex-start;\n}\n.btn-toolbar .input-group {\n  width: auto;\n}\n.btn-group {\n  border-radius: var(--bs-border-radius);\n}\n.btn-group > .btn-group:not(:first-child),\n.btn-group > :not(.btn-check:first-child) + .btn {\n  margin-left: calc(var(--bs-border-width) * -1);\n}\n.btn-group > .btn-group:not(:last-child) > .btn,\n.btn-group > .btn.dropdown-toggle-split:first-child,\n.btn-group > .btn:not(:last-child):not(.dropdown-toggle) {\n  border-top-right-radius: 0;\n  border-bottom-right-radius: 0;\n}\n.btn-group > .btn-group:not(:first-child) > .btn,\n.btn-group > .btn:nth-child(n + 3),\n.btn-group > :not(.btn-check) + .btn {\n  border-top-left-radius: 0;\n  border-bottom-left-radius: 0;\n}\n.dropdown-toggle-split {\n  padding-right: 0.5625rem;\n  padding-left: 0.5625rem;\n}\n.dropdown-toggle-split::after,\n.dropend .dropdown-toggle-split::after,\n.dropup .dropdown-toggle-split::after {\n  margin-left: 0;\n}\n.dropstart .dropdown-toggle-split::before {\n  margin-right: 0;\n}\n.btn-group-sm > .btn + .dropdown-toggle-split,\n.btn-sm + .dropdown-toggle-split {\n  padding-right: 0.375rem;\n  padding-left: 0.375rem;\n}\n.btn-group-lg > .btn + .dropdown-toggle-split,\n.btn-lg + .dropdown-toggle-split {\n  padding-right: 0.75rem;\n  padding-left: 0.75rem;\n}\n.btn-group-vertical {\n  flex-direction: column;\n  align-items: flex-start;\n  justify-content: center;\n}\n.btn-group-vertical > .btn,\n.btn-group-vertical > .btn-group {\n  width: 100%;\n}\n.btn-group-vertical > .btn-group:not(:first-child),\n.btn-group-vertical > .btn:not(:first-child) {\n  margin-top: calc(var(--bs-border-width) * -1);\n}\n.btn-group-vertical > .btn-group:not(:last-child) > .btn,\n.btn-group-vertical > .btn:not(:last-child):not(.dropdown-toggle) {\n  border-bottom-right-radius: 0;\n  border-bottom-left-radius: 0;\n}\n.btn-group-vertical > .btn-group:not(:first-child) > .btn,\n.btn-group-vertical > .btn ~ .btn {\n  border-top-left-radius: 0;\n  border-top-right-radius: 0;\n}\n.nav {\n  --bs-nav-link-padding-x: 1rem;\n  --bs-nav-link-padding-y: 0.5rem;\n  --bs-nav-link-font-weight: ;\n  --bs-nav-link-color: var(--bs-link-color);\n  --bs-nav-link-hover-color: var(--bs-link-hover-color);\n  --bs-nav-link-disabled-color: var(--bs-secondary-color);\n  display: flex;\n  flex-wrap: wrap;\n  padding-left: 0;\n  margin-bottom: 0;\n  list-style: none;\n}\n.nav-link {\n  display: block;\n  padding: var(--bs-nav-link-padding-y) var(--bs-nav-link-padding-x);\n  font-size: var(--bs-nav-link-font-size);\n  font-weight: var(--bs-nav-link-font-weight);\n  color: var(--bs-nav-link-color);\n  text-decoration: none;\n  background: 0 0;\n  border: 0;\n  transition:\n    color 0.15s ease-in-out,\n    background-color 0.15s ease-in-out,\n    border-color 0.15s ease-in-out;\n}\n@media (prefers-reduced-motion: reduce) {\n  .nav-link {\n    transition: none;\n  }\n}\n.nav-link:focus,\n.nav-link:hover {\n  color: var(--bs-nav-link-hover-color);\n}\n.nav-link:focus-visible {\n  outline: 0;\n  box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);\n}\n.nav-link.disabled,\n.nav-link:disabled {\n  color: var(--bs-nav-link-disabled-color);\n  pointer-events: none;\n  cursor: default;\n}\n.nav-tabs {\n  --bs-nav-tabs-border-width: var(--bs-border-width);\n  --bs-nav-tabs-border-color: var(--bs-border-color);\n  --bs-nav-tabs-border-radius: var(--bs-border-radius);\n  --bs-nav-tabs-link-hover-border-color: var(--bs-secondary-bg)\n    var(--bs-secondary-bg) var(--bs-border-color);\n  --bs-nav-tabs-link-active-color: var(--bs-emphasis-color);\n  --bs-nav-tabs-link-active-bg: var(--bs-body-bg);\n  --bs-nav-tabs-link-active-border-color: var(--bs-border-color)\n    var(--bs-border-color) var(--bs-body-bg);\n  border-bottom: var(--bs-nav-tabs-border-width) solid\n    var(--bs-nav-tabs-border-color);\n}\n.nav-tabs .nav-link {\n  margin-bottom: calc(-1 * var(--bs-nav-tabs-border-width));\n  border: var(--bs-nav-tabs-border-width) solid transparent;\n  border-top-left-radius: var(--bs-nav-tabs-border-radius);\n  border-top-right-radius: var(--bs-nav-tabs-border-radius);\n}\n.nav-tabs .nav-link:focus,\n.nav-tabs .nav-link:hover {\n  isolation: isolate;\n  border-color: var(--bs-nav-tabs-link-hover-border-color);\n}\n.nav-tabs .nav-item.show .nav-link,\n.nav-tabs .nav-link.active {\n  color: var(--bs-nav-tabs-link-active-color);\n  background-color: var(--bs-nav-tabs-link-active-bg);\n  border-color: var(--bs-nav-tabs-link-active-border-color);\n}\n.nav-tabs .dropdown-menu {\n  margin-top: calc(-1 * var(--bs-nav-tabs-border-width));\n  border-top-left-radius: 0;\n  border-top-right-radius: 0;\n}\n.nav-pills {\n  --bs-nav-pills-border-radius: var(--bs-border-radius);\n  --bs-nav-pills-link-active-color: #fff;\n  --bs-nav-pills-link-active-bg: #0d6efd;\n}\n.nav-pills .nav-link {\n  border-radius: var(--bs-nav-pills-border-radius);\n}\n.nav-pills .nav-link.active,\n.nav-pills .show > .nav-link {\n  color: var(--bs-nav-pills-link-active-color);\n  background-color: var(--bs-nav-pills-link-active-bg);\n}\n.nav-underline {\n  --bs-nav-underline-gap: 1rem;\n  --bs-nav-underline-border-width: 0.125rem;\n  --bs-nav-underline-link-active-color: var(--bs-emphasis-color);\n  gap: var(--bs-nav-underline-gap);\n}\n.nav-underline .nav-link {\n  padding-right: 0;\n  padding-left: 0;\n  border-bottom: var(--bs-nav-underline-border-width) solid transparent;\n}\n.nav-underline .nav-link:focus,\n.nav-underline .nav-link:hover {\n  border-bottom-color: currentcolor;\n}\n.nav-underline .nav-link.active,\n.nav-underline .show > .nav-link {\n  font-weight: 700;\n  color: var(--bs-nav-underline-link-active-color);\n  border-bottom-color: currentcolor;\n}\n.nav-fill .nav-item,\n.nav-fill > .nav-link {\n  flex: 1 1 auto;\n  text-align: center;\n}\n.nav-justified .nav-item,\n.nav-justified > .nav-link {\n  flex-basis: 0;\n  flex-grow: 1;\n  text-align: center;\n}\n.nav-fill .nav-item .nav-link,\n.nav-justified .nav-item .nav-link {\n  width: 100%;\n}\n.tab-content > .tab-pane {\n  display: none;\n}\n.tab-content > .active {\n  display: block;\n}\n.navbar {\n  --bs-navbar-padding-x: 0;\n  --bs-navbar-padding-y: 0.5rem;\n  --bs-navbar-color: rgba(var(--bs-emphasis-color-rgb), 0.65);\n  --bs-navbar-hover-color: rgba(var(--bs-emphasis-color-rgb), 0.8);\n  --bs-navbar-disabled-color: rgba(var(--bs-emphasis-color-rgb), 0.3);\n  --bs-navbar-active-color: rgba(var(--bs-emphasis-color-rgb), 1);\n  --bs-navbar-brand-padding-y: 0.3125rem;\n  --bs-navbar-brand-margin-end: 1rem;\n  --bs-navbar-brand-font-size: 1.25rem;\n  --bs-navbar-brand-color: rgba(var(--bs-emphasis-color-rgb), 1);\n  --bs-navbar-brand-hover-color: rgba(var(--bs-emphasis-color-rgb), 1);\n  --bs-navbar-nav-link-padding-x: 0.5rem;\n  --bs-navbar-toggler-padding-y: 0.25rem;\n  --bs-navbar-toggler-padding-x: 0.75rem;\n  --bs-navbar-toggler-font-size: 1.25rem;\n  --bs-navbar-toggler-icon-bg: url(\"data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 30 30\'%3e%3cpath stroke=\'rgba%2833, 37, 41, 0.75%29\' stroke-linecap=\'round\' stroke-miterlimit=\'10\' stroke-width=\'2\' d=\'M4 7h22M4 15h22M4 23h22\'/%3e%3c/svg%3e\");\n  --bs-navbar-toggler-border-color: rgba(var(--bs-emphasis-color-rgb), 0.15);\n  --bs-navbar-toggler-border-radius: var(--bs-border-radius);\n  --bs-navbar-toggler-focus-width: 0.25rem;\n  --bs-navbar-toggler-transition: box-shadow 0.15s ease-in-out;\n  position: relative;\n  display: flex;\n  flex-wrap: wrap;\n  align-items: center;\n  justify-content: space-between;\n  padding: var(--bs-navbar-padding-y) var(--bs-navbar-padding-x);\n}\n.navbar > .container,\n.navbar > .container-fluid,\n.navbar > .container-lg,\n.navbar > .container-md,\n.navbar > .container-sm,\n.navbar > .container-xl,\n.navbar > .container-xxl {\n  display: flex;\n  flex-wrap: inherit;\n  align-items: center;\n  justify-content: space-between;\n}\n.navbar-brand {\n  padding-top: var(--bs-navbar-brand-padding-y);\n  padding-bottom: var(--bs-navbar-brand-padding-y);\n  margin-right: var(--bs-navbar-brand-margin-end);\n  font-size: var(--bs-navbar-brand-font-size);\n  color: var(--bs-navbar-brand-color);\n  text-decoration: none;\n  white-space: nowrap;\n}\n.navbar-brand:focus,\n.navbar-brand:hover {\n  color: var(--bs-navbar-brand-hover-color);\n}\n.navbar-nav {\n  --bs-nav-link-padding-x: 0;\n  --bs-nav-link-padding-y: 0.5rem;\n  --bs-nav-link-font-weight: ;\n  --bs-nav-link-color: var(--bs-navbar-color);\n  --bs-nav-link-hover-color: var(--bs-navbar-hover-color);\n  --bs-nav-link-disabled-color: var(--bs-navbar-disabled-color);\n  display: flex;\n  flex-direction: column;\n  padding-left: 0;\n  margin-bottom: 0;\n  list-style: none;\n}\n.navbar-nav .nav-link.active,\n.navbar-nav .nav-link.show {\n  color: var(--bs-navbar-active-color);\n}\n.navbar-nav .dropdown-menu {\n  position: static;\n}\n.navbar-text {\n  padding-top: 0.5rem;\n  padding-bottom: 0.5rem;\n  color: var(--bs-navbar-color);\n}\n.navbar-text a,\n.navbar-text a:focus,\n.navbar-text a:hover {\n  color: var(--bs-navbar-active-color);\n}\n.navbar-collapse {\n  flex-basis: 100%;\n  flex-grow: 1;\n  align-items: center;\n}\n.navbar-toggler {\n  padding: var(--bs-navbar-toggler-padding-y) var(--bs-navbar-toggler-padding-x);\n  font-size: var(--bs-navbar-toggler-font-size);\n  line-height: 1;\n  color: var(--bs-navbar-color);\n  background-color: transparent;\n  border: var(--bs-border-width) solid var(--bs-navbar-toggler-border-color);\n  border-radius: var(--bs-navbar-toggler-border-radius);\n  transition: var(--bs-navbar-toggler-transition);\n}\n@media (prefers-reduced-motion: reduce) {\n  .navbar-toggler {\n    transition: none;\n  }\n}\n.navbar-toggler:hover {\n  text-decoration: none;\n}\n.navbar-toggler:focus {\n  text-decoration: none;\n  outline: 0;\n  box-shadow: 0 0 0 var(--bs-navbar-toggler-focus-width);\n}\n.navbar-toggler-icon {\n  display: inline-block;\n  width: 1.5em;\n  height: 1.5em;\n  vertical-align: middle;\n  background-image: var(--bs-navbar-toggler-icon-bg);\n  background-repeat: no-repeat;\n  background-position: center;\n  background-size: 100%;\n}\n.navbar-nav-scroll {\n  max-height: var(--bs-scroll-height, 75vh);\n  overflow-y: auto;\n}\n@media (min-width: 576px) {\n  .navbar-expand-sm {\n    flex-wrap: nowrap;\n    justify-content: flex-start;\n  }\n  .navbar-expand-sm .navbar-nav {\n    flex-direction: row;\n  }\n  .navbar-expand-sm .navbar-nav .dropdown-menu {\n    position: absolute;\n  }\n  .navbar-expand-sm .navbar-nav .nav-link {\n    padding-right: var(--bs-navbar-nav-link-padding-x);\n    padding-left: var(--bs-navbar-nav-link-padding-x);\n  }\n  .navbar-expand-sm .navbar-nav-scroll {\n    overflow: visible;\n  }\n  .navbar-expand-sm .navbar-collapse {\n    display: flex !important;\n    flex-basis: auto;\n  }\n  .navbar-expand-sm .navbar-toggler {\n    display: none;\n  }\n  .navbar-expand-sm .offcanvas {\n    position: static;\n    z-index: auto;\n    flex-grow: 1;\n    width: auto !important;\n    height: auto !important;\n    visibility: visible !important;\n    background-color: transparent !important;\n    border: 0 !important;\n    transform: none !important;\n    transition: none;\n  }\n  .navbar-expand-sm .offcanvas .offcanvas-header {\n    display: none;\n  }\n  .navbar-expand-sm .offcanvas .offcanvas-body {\n    display: flex;\n    flex-grow: 0;\n    padding: 0;\n    overflow-y: visible;\n  }\n}\n@media (min-width: 768px) {\n  .navbar-expand-md {\n    flex-wrap: nowrap;\n    justify-content: flex-start;\n  }\n  .navbar-expand-md .navbar-nav {\n    flex-direction: row;\n  }\n  .navbar-expand-md .navbar-nav .dropdown-menu {\n    position: absolute;\n  }\n  .navbar-expand-md .navbar-nav .nav-link {\n    padding-right: var(--bs-navbar-nav-link-padding-x);\n    padding-left: var(--bs-navbar-nav-link-padding-x);\n  }\n  .navbar-expand-md .navbar-nav-scroll {\n    overflow: visible;\n  }\n  .navbar-expand-md .navbar-collapse {\n    display: flex !important;\n    flex-basis: auto;\n  }\n  .navbar-expand-md .navbar-toggler {\n    display: none;\n  }\n  .navbar-expand-md .offcanvas {\n    position: static;\n    z-index: auto;\n    flex-grow: 1;\n    width: auto !important;\n    height: auto !important;\n    visibility: visible !important;\n    background-color: transparent !important;\n    border: 0 !important;\n    transform: none !important;\n    transition: none;\n  }\n  .navbar-expand-md .offcanvas .offcanvas-header {\n    display: none;\n  }\n  .navbar-expand-md .offcanvas .offcanvas-body {\n    display: flex;\n    flex-grow: 0;\n    padding: 0;\n    overflow-y: visible;\n  }\n}\n@media (min-width: 992px) {\n  .navbar-expand-lg {\n    flex-wrap: nowrap;\n    justify-content: flex-start;\n  }\n  .navbar-expand-lg .navbar-nav {\n    flex-direction: row;\n  }\n  .navbar-expand-lg .navbar-nav .dropdown-menu {\n    position: absolute;\n  }\n  .navbar-expand-lg .navbar-nav .nav-link {\n    padding-right: var(--bs-navbar-nav-link-padding-x);\n    padding-left: var(--bs-navbar-nav-link-padding-x);\n  }\n  .navbar-expand-lg .navbar-nav-scroll {\n    overflow: visible;\n  }\n  .navbar-expand-lg .navbar-collapse {\n    display: flex !important;\n    flex-basis: auto;\n  }\n  .navbar-expand-lg .navbar-toggler {\n    display: none;\n  }\n  .navbar-expand-lg .offcanvas {\n    position: static;\n    z-index: auto;\n    flex-grow: 1;\n    width: auto !important;\n    height: auto !important;\n    visibility: visible !important;\n    background-color: transparent !important;\n    border: 0 !important;\n    transform: none !important;\n    transition: none;\n  }\n  .navbar-expand-lg .offcanvas .offcanvas-header {\n    display: none;\n  }\n  .navbar-expand-lg .offcanvas .offcanvas-body {\n    display: flex;\n    flex-grow: 0;\n    padding: 0;\n    overflow-y: visible;\n  }\n}\n@media (min-width: 1200px) {\n  .navbar-expand-xl {\n    flex-wrap: nowrap;\n    justify-content: flex-start;\n  }\n  .navbar-expand-xl .navbar-nav {\n    flex-direction: row;\n  }\n  .navbar-expand-xl .navbar-nav .dropdown-menu {\n    position: absolute;\n  }\n  .navbar-expand-xl .navbar-nav .nav-link {\n    padding-right: var(--bs-navbar-nav-link-padding-x);\n    padding-left: var(--bs-navbar-nav-link-padding-x);\n  }\n  .navbar-expand-xl .navbar-nav-scroll {\n    overflow: visible;\n  }\n  .navbar-expand-xl .navbar-collapse {\n    display: flex !important;\n    flex-basis: auto;\n  }\n  .navbar-expand-xl .navbar-toggler {\n    display: none;\n  }\n  .navbar-expand-xl .offcanvas {\n    position: static;\n    z-index: auto;\n    flex-grow: 1;\n    width: auto !important;\n    height: auto !important;\n    visibility: visible !important;\n    background-color: transparent !important;\n    border: 0 !important;\n    transform: none !important;\n    transition: none;\n  }\n  .navbar-expand-xl .offcanvas .offcanvas-header {\n    display: none;\n  }\n  .navbar-expand-xl .offcanvas .offcanvas-body {\n    display: flex;\n    flex-grow: 0;\n    padding: 0;\n    overflow-y: visible;\n  }\n}\n@media (min-width: 1400px) {\n  .navbar-expand-xxl {\n    flex-wrap: nowrap;\n    justify-content: flex-start;\n  }\n  .navbar-expand-xxl .navbar-nav {\n    flex-direction: row;\n  }\n  .navbar-expand-xxl .navbar-nav .dropdown-menu {\n    position: absolute;\n  }\n  .navbar-expand-xxl .navbar-nav .nav-link {\n    padding-right: var(--bs-navbar-nav-link-padding-x);\n    padding-left: var(--bs-navbar-nav-link-padding-x);\n  }\n  .navbar-expand-xxl .navbar-nav-scroll {\n    overflow: visible;\n  }\n  .navbar-expand-xxl .navbar-collapse {\n    display: flex !important;\n    flex-basis: auto;\n  }\n  .navbar-expand-xxl .navbar-toggler {\n    display: none;\n  }\n  .navbar-expand-xxl .offcanvas {\n    position: static;\n    z-index: auto;\n    flex-grow: 1;\n    width: auto !important;\n    height: auto !important;\n    visibility: visible !important;\n    background-color: transparent !important;\n    border: 0 !important;\n    transform: none !important;\n    transition: none;\n  }\n  .navbar-expand-xxl .offcanvas .offcanvas-header {\n    display: none;\n  }\n  .navbar-expand-xxl .offcanvas .offcanvas-body {\n    display: flex;\n    flex-grow: 0;\n    padding: 0;\n    overflow-y: visible;\n  }\n}\n.navbar-expand {\n  flex-wrap: nowrap;\n  justify-content: flex-start;\n}\n.navbar-expand .navbar-nav {\n  flex-direction: row;\n}\n.navbar-expand .navbar-nav .dropdown-menu {\n  position: absolute;\n}\n.navbar-expand .navbar-nav .nav-link {\n  padding-right: var(--bs-navbar-nav-link-padding-x);\n  padding-left: var(--bs-navbar-nav-link-padding-x);\n}\n.navbar-expand .navbar-nav-scroll {\n  overflow: visible;\n}\n.navbar-expand .navbar-collapse {\n  display: flex !important;\n  flex-basis: auto;\n}\n.navbar-expand .navbar-toggler {\n  display: none;\n}\n.navbar-expand .offcanvas {\n  position: static;\n  z-index: auto;\n  flex-grow: 1;\n  width: auto !important;\n  height: auto !important;\n  visibility: visible !important;\n  background-color: transparent !important;\n  border: 0 !important;\n  transform: none !important;\n  transition: none;\n}\n.navbar-expand .offcanvas .offcanvas-header {\n  display: none;\n}\n.navbar-expand .offcanvas .offcanvas-body {\n  display: flex;\n  flex-grow: 0;\n  padding: 0;\n  overflow-y: visible;\n}\n.navbar-dark,\n.navbar[data-bs-theme=\'dark\'] {\n  --bs-navbar-color: rgba(255, 255, 255, 0.55);\n  --bs-navbar-hover-color: rgba(255, 255, 255, 0.75);\n  --bs-navbar-disabled-color: rgba(255, 255, 255, 0.25);\n  --bs-navbar-active-color: #fff;\n  --bs-navbar-brand-color: #fff;\n  --bs-navbar-brand-hover-color: #fff;\n  --bs-navbar-toggler-border-color: rgba(255, 255, 255, 0.1);\n  --bs-navbar-toggler-icon-bg: url(\"data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 30 30\'%3e%3cpath stroke=\'rgba%28255, 255, 255, 0.55%29\' stroke-linecap=\'round\' stroke-miterlimit=\'10\' stroke-width=\'2\' d=\'M4 7h22M4 15h22M4 23h22\'/%3e%3c/svg%3e\");\n}\n[data-bs-theme=\'dark\'] .navbar-toggler-icon {\n  --bs-navbar-toggler-icon-bg: url(\"data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 30 30\'%3e%3cpath stroke=\'rgba%28255, 255, 255, 0.55%29\' stroke-linecap=\'round\' stroke-miterlimit=\'10\' stroke-width=\'2\' d=\'M4 7h22M4 15h22M4 23h22\'/%3e%3c/svg%3e\");\n}\n.card {\n  --bs-card-spacer-y: 1rem;\n  --bs-card-spacer-x: 1rem;\n  --bs-card-title-spacer-y: 0.5rem;\n  --bs-card-title-color: ;\n  --bs-card-subtitle-color: ;\n  --bs-card-border-width: var(--bs-border-width);\n  --bs-card-border-color: var(--bs-border-color-translucent);\n  --bs-card-border-radius: var(--bs-border-radius);\n  --bs-card-box-shadow: ;\n  --bs-card-inner-border-radius: calc(\n    var(--bs-border-radius) - (var(--bs-border-width))\n  );\n  --bs-card-cap-padding-y: 0.5rem;\n  --bs-card-cap-padding-x: 1rem;\n  --bs-card-cap-bg: rgba(var(--bs-body-color-rgb), 0.03);\n  --bs-card-cap-color: ;\n  --bs-card-height: ;\n  --bs-card-color: ;\n  --bs-card-bg: var(--bs-body-bg);\n  --bs-card-img-overlay-padding: 1rem;\n  --bs-card-group-margin: 0.75rem;\n  position: relative;\n  display: flex;\n  flex-direction: column;\n  min-width: 0;\n  height: var(--bs-card-height);\n  color: var(--bs-body-color);\n  word-wrap: break-word;\n  background-color: var(--bs-card-bg);\n  background-clip: border-box;\n  border: var(--bs-card-border-width) solid var(--bs-card-border-color);\n  border-radius: var(--bs-card-border-radius);\n}\n.card > hr {\n  margin-right: 0;\n  margin-left: 0;\n}\n.card > .list-group {\n  border-top: inherit;\n  border-bottom: inherit;\n}\n.card > .list-group:first-child {\n  border-top-width: 0;\n  border-top-left-radius: var(--bs-card-inner-border-radius);\n  border-top-right-radius: var(--bs-card-inner-border-radius);\n}\n.card > .list-group:last-child {\n  border-bottom-width: 0;\n  border-bottom-right-radius: var(--bs-card-inner-border-radius);\n  border-bottom-left-radius: var(--bs-card-inner-border-radius);\n}\n.card > .card-header + .list-group,\n.card > .list-group + .card-footer {\n  border-top: 0;\n}\n.card-body {\n  flex: 1 1 auto;\n  padding: var(--bs-card-spacer-y) var(--bs-card-spacer-x);\n  color: var(--bs-card-color);\n}\n.card-title {\n  margin-bottom: var(--bs-card-title-spacer-y);\n  color: var(--bs-card-title-color);\n}\n.card-subtitle {\n  margin-top: calc(-0.5 * var(--bs-card-title-spacer-y));\n  margin-bottom: 0;\n  color: var(--bs-card-subtitle-color);\n}\n.card-text:last-child {\n  margin-bottom: 0;\n}\n.card-link + .card-link {\n  margin-left: var(--bs-card-spacer-x);\n}\n.card-header {\n  padding: var(--bs-card-cap-padding-y) var(--bs-card-cap-padding-x);\n  margin-bottom: 0;\n  color: var(--bs-card-cap-color);\n  background-color: var(--bs-card-cap-bg);\n  border-bottom: var(--bs-card-border-width) solid var(--bs-card-border-color);\n}\n.card-header:first-child {\n  border-radius: var(--bs-card-inner-border-radius)\n    var(--bs-card-inner-border-radius) 0 0;\n}\n.card-footer {\n  padding: var(--bs-card-cap-padding-y) var(--bs-card-cap-padding-x);\n  color: var(--bs-card-cap-color);\n  background-color: var(--bs-card-cap-bg);\n  border-top: var(--bs-card-border-width) solid var(--bs-card-border-color);\n}\n.card-footer:last-child {\n  border-radius: 0 0 var(--bs-card-inner-border-radius)\n    var(--bs-card-inner-border-radius);\n}\n.card-header-tabs {\n  margin-right: calc(-0.5 * var(--bs-card-cap-padding-x));\n  margin-bottom: calc(-1 * var(--bs-card-cap-padding-y));\n  margin-left: calc(-0.5 * var(--bs-card-cap-padding-x));\n  border-bottom: 0;\n}\n.card-header-tabs .nav-link.active {\n  background-color: var(--bs-card-bg);\n  border-bottom-color: var(--bs-card-bg);\n}\n.card-header-pills {\n  margin-right: calc(-0.5 * var(--bs-card-cap-padding-x));\n  margin-left: calc(-0.5 * var(--bs-card-cap-padding-x));\n}\n.card-img-overlay {\n  position: absolute;\n  top: 0;\n  right: 0;\n  bottom: 0;\n  left: 0;\n  padding: var(--bs-card-img-overlay-padding);\n  border-radius: var(--bs-card-inner-border-radius);\n}\n.card-img,\n.card-img-bottom,\n.card-img-top {\n  width: 100%;\n}\n.card-img,\n.card-img-top {\n  border-top-left-radius: var(--bs-card-inner-border-radius);\n  border-top-right-radius: var(--bs-card-inner-border-radius);\n}\n.card-img,\n.card-img-bottom {\n  border-bottom-right-radius: var(--bs-card-inner-border-radius);\n  border-bottom-left-radius: var(--bs-card-inner-border-radius);\n}\n.card-group > .card {\n  margin-bottom: var(--bs-card-group-margin);\n}\n@media (min-width: 576px) {\n  .card-group {\n    display: flex;\n    flex-flow: row wrap;\n  }\n  .card-group > .card {\n    flex: 1 0 0%;\n    margin-bottom: 0;\n  }\n  .card-group > .card + .card {\n    margin-left: 0;\n    border-left: 0;\n  }\n  .card-group > .card:not(:last-child) {\n    border-top-right-radius: 0;\n    border-bottom-right-radius: 0;\n  }\n  .card-group > .card:not(:last-child) .card-header,\n  .card-group > .card:not(:last-child) .card-img-top {\n    border-top-right-radius: 0;\n  }\n  .card-group > .card:not(:last-child) .card-footer,\n  .card-group > .card:not(:last-child) .card-img-bottom {\n    border-bottom-right-radius: 0;\n  }\n  .card-group > .card:not(:first-child) {\n    border-top-left-radius: 0;\n    border-bottom-left-radius: 0;\n  }\n  .card-group > .card:not(:first-child) .card-header,\n  .card-group > .card:not(:first-child) .card-img-top {\n    border-top-left-radius: 0;\n  }\n  .card-group > .card:not(:first-child) .card-footer,\n  .card-group > .card:not(:first-child) .card-img-bottom {\n    border-bottom-left-radius: 0;\n  }\n}\n.accordion {\n  --bs-accordion-color: var(--bs-body-color);\n  --bs-accordion-bg: var(--bs-body-bg);\n  --bs-accordion-transition:\n    color 0.15s ease-in-out, background-color 0.15s ease-in-out,\n    border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out,\n    border-radius 0.15s ease;\n  --bs-accordion-border-color: var(--bs-border-color);\n  --bs-accordion-border-width: var(--bs-border-width);\n  --bs-accordion-border-radius: var(--bs-border-radius);\n  --bs-accordion-inner-border-radius: calc(\n    var(--bs-border-radius) - (var(--bs-border-width))\n  );\n  --bs-accordion-btn-padding-x: 1.25rem;\n  --bs-accordion-btn-padding-y: 1rem;\n  --bs-accordion-btn-color: var(--bs-body-color);\n  --bs-accordion-btn-bg: var(--bs-accordion-bg);\n  --bs-accordion-btn-icon: url(\"data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 16 16\' fill=\'none\' stroke=\'%23212529\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpath d=\'M2 5L8 11L14 5\'/%3e%3c/svg%3e\");\n  --bs-accordion-btn-icon-width: 1.25rem;\n  --bs-accordion-btn-icon-transform: rotate(-180deg);\n  --bs-accordion-btn-icon-transition: transform 0.2s ease-in-out;\n  --bs-accordion-btn-active-icon: url(\"data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 16 16\' fill=\'none\' stroke=\'%23052c65\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpath d=\'M2 5L8 11L14 5\'/%3e%3c/svg%3e\");\n  --bs-accordion-btn-focus-box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);\n  --bs-accordion-body-padding-x: 1.25rem;\n  --bs-accordion-body-padding-y: 1rem;\n  --bs-accordion-active-color: var(--bs-primary-text-emphasis);\n  --bs-accordion-active-bg: var(--bs-primary-bg-subtle);\n}\n.accordion-button {\n  position: relative;\n  display: flex;\n  align-items: center;\n  width: 100%;\n  padding: var(--bs-accordion-btn-padding-y) var(--bs-accordion-btn-padding-x);\n  font-size: 1rem;\n  color: var(--bs-accordion-btn-color);\n  text-align: left;\n  background-color: var(--bs-accordion-btn-bg);\n  border: 0;\n  border-radius: 0;\n  overflow-anchor: none;\n  transition: var(--bs-accordion-transition);\n}\n@media (prefers-reduced-motion: reduce) {\n  .accordion-button {\n    transition: none;\n  }\n}\n.accordion-button:not(.collapsed) {\n  color: var(--bs-accordion-active-color);\n  background-color: var(--bs-accordion-active-bg);\n  box-shadow: inset 0 calc(-1 * var(--bs-accordion-border-width)) 0\n    var(--bs-accordion-border-color);\n}\n.accordion-button:not(.collapsed)::after {\n  background-image: var(--bs-accordion-btn-active-icon);\n  transform: var(--bs-accordion-btn-icon-transform);\n}\n.accordion-button::after {\n  flex-shrink: 0;\n  width: var(--bs-accordion-btn-icon-width);\n  height: var(--bs-accordion-btn-icon-width);\n  margin-left: auto;\n  content: \'\';\n  background-image: var(--bs-accordion-btn-icon);\n  background-repeat: no-repeat;\n  background-size: var(--bs-accordion-btn-icon-width);\n  transition: var(--bs-accordion-btn-icon-transition);\n}\n@media (prefers-reduced-motion: reduce) {\n  .accordion-button::after {\n    transition: none;\n  }\n}\n.accordion-button:hover {\n  z-index: 2;\n}\n.accordion-button:focus {\n  z-index: 3;\n  outline: 0;\n  box-shadow: var(--bs-accordion-btn-focus-box-shadow);\n}\n.accordion-header {\n  margin-bottom: 0;\n}\n.accordion-item {\n  color: var(--bs-accordion-color);\n  background-color: var(--bs-accordion-bg);\n  border: var(--bs-accordion-border-width) solid\n    var(--bs-accordion-border-color);\n}\n.accordion-item:first-of-type {\n  border-top-left-radius: var(--bs-accordion-border-radius);\n  border-top-right-radius: var(--bs-accordion-border-radius);\n}\n.accordion-item:first-of-type > .accordion-header .accordion-button {\n  border-top-left-radius: var(--bs-accordion-inner-border-radius);\n  border-top-right-radius: var(--bs-accordion-inner-border-radius);\n}\n.accordion-item:not(:first-of-type) {\n  border-top: 0;\n}\n.accordion-item:last-of-type {\n  border-bottom-right-radius: var(--bs-accordion-border-radius);\n  border-bottom-left-radius: var(--bs-accordion-border-radius);\n}\n.accordion-item:last-of-type > .accordion-header .accordion-button.collapsed {\n  border-bottom-right-radius: var(--bs-accordion-inner-border-radius);\n  border-bottom-left-radius: var(--bs-accordion-inner-border-radius);\n}\n.accordion-item:last-of-type > .accordion-collapse {\n  border-bottom-right-radius: var(--bs-accordion-border-radius);\n  border-bottom-left-radius: var(--bs-accordion-border-radius);\n}\n.accordion-body {\n  padding: var(--bs-accordion-body-padding-y) var(--bs-accordion-body-padding-x);\n}\n.accordion-flush > .accordion-item {\n  border-right: 0;\n  border-left: 0;\n  border-radius: 0;\n}\n.accordion-flush > .accordion-item:first-child {\n  border-top: 0;\n}\n.accordion-flush > .accordion-item:last-child {\n  border-bottom: 0;\n}\n.accordion-flush > .accordion-item > .accordion-header .accordion-button,\n.accordion-flush\n  > .accordion-item\n  > .accordion-header\n  .accordion-button.collapsed {\n  border-radius: 0;\n}\n.accordion-flush > .accordion-item > .accordion-collapse {\n  border-radius: 0;\n}\n[data-bs-theme=\'dark\'] .accordion-button::after {\n  --bs-accordion-btn-icon: url(\"data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 16 16\' fill=\'%236ea8fe\'%3e%3cpath fill-rule=\'evenodd\' d=\'M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z\'/%3e%3c/svg%3e\");\n  --bs-accordion-btn-active-icon: url(\"data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 16 16\' fill=\'%236ea8fe\'%3e%3cpath fill-rule=\'evenodd\' d=\'M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z\'/%3e%3c/svg%3e\");\n}\n.breadcrumb {\n  --bs-breadcrumb-padding-x: 0;\n  --bs-breadcrumb-padding-y: 0;\n  --bs-breadcrumb-margin-bottom: 1rem;\n  --bs-breadcrumb-bg: ;\n  --bs-breadcrumb-border-radius: ;\n  --bs-breadcrumb-divider-color: var(--bs-secondary-color);\n  --bs-breadcrumb-item-padding-x: 0.5rem;\n  --bs-breadcrumb-item-active-color: var(--bs-secondary-color);\n  display: flex;\n  flex-wrap: wrap;\n  padding: var(--bs-breadcrumb-padding-y) var(--bs-breadcrumb-padding-x);\n  margin-bottom: var(--bs-breadcrumb-margin-bottom);\n  font-size: var(--bs-breadcrumb-font-size);\n  list-style: none;\n  background-color: var(--bs-breadcrumb-bg);\n  border-radius: var(--bs-breadcrumb-border-radius);\n}\n.breadcrumb-item + .breadcrumb-item {\n  padding-left: var(--bs-breadcrumb-item-padding-x);\n}\n.breadcrumb-item + .breadcrumb-item::before {\n  float: left;\n  padding-right: var(--bs-breadcrumb-item-padding-x);\n  color: var(--bs-breadcrumb-divider-color);\n  content: var(--bs-breadcrumb-divider, \'/\');\n}\n.breadcrumb-item.active {\n  color: var(--bs-breadcrumb-item-active-color);\n}\n.pagination {\n  --bs-pagination-padding-x: 0.75rem;\n  --bs-pagination-padding-y: 0.375rem;\n  --bs-pagination-font-size: 1rem;\n  --bs-pagination-color: var(--bs-link-color);\n  --bs-pagination-bg: var(--bs-body-bg);\n  --bs-pagination-border-width: var(--bs-border-width);\n  --bs-pagination-border-color: var(--bs-border-color);\n  --bs-pagination-border-radius: var(--bs-border-radius);\n  --bs-pagination-hover-color: var(--bs-link-hover-color);\n  --bs-pagination-hover-bg: var(--bs-tertiary-bg);\n  --bs-pagination-hover-border-color: var(--bs-border-color);\n  --bs-pagination-focus-color: var(--bs-link-hover-color);\n  --bs-pagination-focus-bg: var(--bs-secondary-bg);\n  --bs-pagination-focus-box-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);\n  --bs-pagination-active-color: #fff;\n  --bs-pagination-active-bg: #0d6efd;\n  --bs-pagination-active-border-color: #0d6efd;\n  --bs-pagination-disabled-color: var(--bs-secondary-color);\n  --bs-pagination-disabled-bg: var(--bs-secondary-bg);\n  --bs-pagination-disabled-border-color: var(--bs-border-color);\n  display: flex;\n  padding-left: 0;\n  list-style: none;\n}\n.page-link {\n  position: relative;\n  display: block;\n  padding: var(--bs-pagination-padding-y) var(--bs-pagination-padding-x);\n  font-size: var(--bs-pagination-font-size);\n  color: var(--bs-pagination-color);\n  text-decoration: none;\n  background-color: var(--bs-pagination-bg);\n  border: var(--bs-pagination-border-width) solid\n    var(--bs-pagination-border-color);\n  transition:\n    color 0.15s ease-in-out,\n    background-color 0.15s ease-in-out,\n    border-color 0.15s ease-in-out,\n    box-shadow 0.15s ease-in-out;\n}\n@media (prefers-reduced-motion: reduce) {\n  .page-link {\n    transition: none;\n  }\n}\n.page-link:hover {\n  z-index: 2;\n  color: var(--bs-pagination-hover-color);\n  background-color: var(--bs-pagination-hover-bg);\n  border-color: var(--bs-pagination-hover-border-color);\n}\n.page-link:focus {\n  z-index: 3;\n  color: var(--bs-pagination-focus-color);\n  background-color: var(--bs-pagination-focus-bg);\n  outline: 0;\n  box-shadow: var(--bs-pagination-focus-box-shadow);\n}\n.active > .page-link,\n.page-link.active {\n  z-index: 3;\n  color: var(--bs-pagination-active-color);\n  background-color: var(--bs-pagination-active-bg);\n  border-color: var(--bs-pagination-active-border-color);\n}\n.disabled > .page-link,\n.page-link.disabled {\n  color: var(--bs-pagination-disabled-color);\n  pointer-events: none;\n  background-color: var(--bs-pagination-disabled-bg);\n  border-color: var(--bs-pagination-disabled-border-color);\n}\n.page-item:not(:first-child) .page-link {\n  margin-left: calc(var(--bs-border-width) * -1);\n}\n.page-item:first-child .page-link {\n  border-top-left-radius: var(--bs-pagination-border-radius);\n  border-bottom-left-radius: var(--bs-pagination-border-radius);\n}\n.page-item:last-child .page-link {\n  border-top-right-radius: var(--bs-pagination-border-radius);\n  border-bottom-right-radius: var(--bs-pagination-border-radius);\n}\n.pagination-lg {\n  --bs-pagination-padding-x: 1.5rem;\n  --bs-pagination-padding-y: 0.75rem;\n  --bs-pagination-font-size: 1.25rem;\n  --bs-pagination-border-radius: var(--bs-border-radius-lg);\n}\n.pagination-sm {\n  --bs-pagination-padding-x: 0.5rem;\n  --bs-pagination-padding-y: 0.25rem;\n  --bs-pagination-font-size: 0.875rem;\n  --bs-pagination-border-radius: var(--bs-border-radius-sm);\n}\n.badge {\n  --bs-badge-padding-x: 0.65em;\n  --bs-badge-padding-y: 0.35em;\n  --bs-badge-font-size: 0.75em;\n  --bs-badge-font-weight: 700;\n  --bs-badge-color: #fff;\n  --bs-badge-border-radius: var(--bs-border-radius);\n  display: inline-block;\n  padding: var(--bs-badge-padding-y) var(--bs-badge-padding-x);\n  font-size: var(--bs-badge-font-size);\n  font-weight: var(--bs-badge-font-weight);\n  line-height: 1;\n  color: var(--bs-badge-color);\n  text-align: center;\n  white-space: nowrap;\n  vertical-align: baseline;\n  border-radius: var(--bs-badge-border-radius);\n}\n.badge:empty {\n  display: none;\n}\n.btn .badge {\n  position: relative;\n  top: -1px;\n}\n.alert {\n  --bs-alert-bg: transparent;\n  --bs-alert-padding-x: 1rem;\n  --bs-alert-padding-y: 1rem;\n  --bs-alert-margin-bottom: 1rem;\n  --bs-alert-color: inherit;\n  --bs-alert-border-color: transparent;\n  --bs-alert-border: var(--bs-border-width) solid var(--bs-alert-border-color);\n  --bs-alert-border-radius: var(--bs-border-radius);\n  --bs-alert-link-color: inherit;\n  position: relative;\n  padding: var(--bs-alert-padding-y) var(--bs-alert-padding-x);\n  margin-bottom: var(--bs-alert-margin-bottom);\n  color: var(--bs-alert-color);\n  background-color: var(--bs-alert-bg);\n  border: var(--bs-alert-border);\n  border-radius: var(--bs-alert-border-radius);\n}\n.alert-heading {\n  color: inherit;\n}\n.alert-link {\n  font-weight: 700;\n  color: var(--bs-alert-link-color);\n}\n.alert-dismissible {\n  padding-right: 3rem;\n}\n.alert-dismissible .btn-close {\n  position: absolute;\n  top: 0;\n  right: 0;\n  z-index: 2;\n  padding: 1.25rem 1rem;\n}\n.alert-primary {\n  --bs-alert-color: var(--bs-primary-text-emphasis);\n  --bs-alert-bg: var(--bs-primary-bg-subtle);\n  --bs-alert-border-color: var(--bs-primary-border-subtle);\n  --bs-alert-link-color: var(--bs-primary-text-emphasis);\n}\n.alert-secondary {\n  --bs-alert-color: var(--bs-secondary-text-emphasis);\n  --bs-alert-bg: var(--bs-secondary-bg-subtle);\n  --bs-alert-border-color: var(--bs-secondary-border-subtle);\n  --bs-alert-link-color: var(--bs-secondary-text-emphasis);\n}\n.alert-success {\n  --bs-alert-color: var(--bs-success-text-emphasis);\n  --bs-alert-bg: var(--bs-success-bg-subtle);\n  --bs-alert-border-color: var(--bs-success-border-subtle);\n  --bs-alert-link-color: var(--bs-success-text-emphasis);\n}\n.alert-info {\n  --bs-alert-color: var(--bs-info-text-emphasis);\n  --bs-alert-bg: var(--bs-info-bg-subtle);\n  --bs-alert-border-color: var(--bs-info-border-subtle);\n  --bs-alert-link-color: var(--bs-info-text-emphasis);\n}\n.alert-warning {\n  --bs-alert-color: var(--bs-warning-text-emphasis);\n  --bs-alert-bg: var(--bs-warning-bg-subtle);\n  --bs-alert-border-color: var(--bs-warning-border-subtle);\n  --bs-alert-link-color: var(--bs-warning-text-emphasis);\n}\n.alert-danger {\n  --bs-alert-color: var(--bs-danger-text-emphasis);\n  --bs-alert-bg: var(--bs-danger-bg-subtle);\n  --bs-alert-border-color: var(--bs-danger-border-subtle);\n  --bs-alert-link-color: var(--bs-danger-text-emphasis);\n}\n.alert-light {\n  --bs-alert-color: var(--bs-light-text-emphasis);\n  --bs-alert-bg: var(--bs-light-bg-subtle);\n  --bs-alert-border-color: var(--bs-light-border-subtle);\n  --bs-alert-link-color: var(--bs-light-text-emphasis);\n}\n.alert-dark {\n  --bs-alert-color: var(--bs-dark-text-emphasis);\n  --bs-alert-bg: var(--bs-dark-bg-subtle);\n  --bs-alert-border-color: var(--bs-dark-border-subtle);\n  --bs-alert-link-color: var(--bs-dark-text-emphasis);\n}\n@keyframes progress-bar-stripes {\n  0% {\n    background-position-x: 1rem;\n  }\n}\n.progress,\n.progress-stacked {\n  --bs-progress-height: 1rem;\n  --bs-progress-font-size: 0.75rem;\n  --bs-progress-bg: var(--bs-secondary-bg);\n  --bs-progress-border-radius: var(--bs-border-radius);\n  --bs-progress-box-shadow: var(--bs-box-shadow-inset);\n  --bs-progress-bar-color: #fff;\n  --bs-progress-bar-bg: #0d6efd;\n  --bs-progress-bar-transition: width 0.6s ease;\n  display: flex;\n  height: var(--bs-progress-height);\n  overflow: hidden;\n  font-size: var(--bs-progress-font-size);\n  background-color: var(--bs-progress-bg);\n  border-radius: var(--bs-progress-border-radius);\n}\n.progress-bar {\n  display: flex;\n  flex-direction: column;\n  justify-content: center;\n  overflow: hidden;\n  color: var(--bs-progress-bar-color);\n  text-align: center;\n  white-space: nowrap;\n  background-color: var(--bs-progress-bar-bg);\n  transition: var(--bs-progress-bar-transition);\n}\n@media (prefers-reduced-motion: reduce) {\n  .progress-bar {\n    transition: none;\n  }\n}\n.progress-bar-striped {\n  background-image: linear-gradient(\n    45deg,\n    rgba(255, 255, 255, 0.15) 25%,\n    transparent 25%,\n    transparent 50%,\n    rgba(255, 255, 255, 0.15) 50%,\n    rgba(255, 255, 255, 0.15) 75%,\n    transparent 75%,\n    transparent\n  );\n  background-size: var(--bs-progress-height) var(--bs-progress-height);\n}\n.progress-stacked > .progress {\n  overflow: visible;\n}\n.progress-stacked > .progress > .progress-bar {\n  width: 100%;\n}\n.progress-bar-animated {\n  animation: 1s linear infinite progress-bar-stripes;\n}\n@media (prefers-reduced-motion: reduce) {\n  .progress-bar-animated {\n    animation: none;\n  }\n}\n.list-group {\n  --bs-list-group-color: var(--bs-body-color);\n  --bs-list-group-bg: var(--bs-body-bg);\n  --bs-list-group-border-color: var(--bs-border-color);\n  --bs-list-group-border-width: var(--bs-border-width);\n  --bs-list-group-border-radius: var(--bs-border-radius);\n  --bs-list-group-item-padding-x: 1rem;\n  --bs-list-group-item-padding-y: 0.5rem;\n  --bs-list-group-action-color: var(--bs-secondary-color);\n  --bs-list-group-action-hover-color: var(--bs-emphasis-color);\n  --bs-list-group-action-hover-bg: var(--bs-tertiary-bg);\n  --bs-list-group-action-active-color: var(--bs-body-color);\n  --bs-list-group-action-active-bg: var(--bs-secondary-bg);\n  --bs-list-group-disabled-color: var(--bs-secondary-color);\n  --bs-list-group-disabled-bg: var(--bs-body-bg);\n  --bs-list-group-active-color: #fff;\n  --bs-list-group-active-bg: #0d6efd;\n  --bs-list-group-active-border-color: #0d6efd;\n  display: flex;\n  flex-direction: column;\n  padding-left: 0;\n  margin-bottom: 0;\n  border-radius: var(--bs-list-group-border-radius);\n}\n.list-group-numbered {\n  list-style-type: none;\n  counter-reset: section;\n}\n.list-group-numbered > .list-group-item::before {\n  content: counters(section, \'.\') \'. \';\n  counter-increment: section;\n}\n.list-group-item-action {\n  width: 100%;\n  color: var(--bs-list-group-action-color);\n  text-align: inherit;\n}\n.list-group-item-action:focus,\n.list-group-item-action:hover {\n  z-index: 1;\n  color: var(--bs-list-group-action-hover-color);\n  text-decoration: none;\n  background-color: var(--bs-list-group-action-hover-bg);\n}\n.list-group-item-action:active {\n  color: var(--bs-list-group-action-active-color);\n  background-color: var(--bs-list-group-action-active-bg);\n}\n.list-group-item {\n  position: relative;\n  display: block;\n  padding: var(--bs-list-group-item-padding-y)\n    var(--bs-list-group-item-padding-x);\n  color: var(--bs-list-group-color);\n  text-decoration: none;\n  background-color: var(--bs-list-group-bg);\n  border: var(--bs-list-group-border-width) solid\n    var(--bs-list-group-border-color);\n}\n.list-group-item:first-child {\n  border-top-left-radius: inherit;\n  border-top-right-radius: inherit;\n}\n.list-group-item:last-child {\n  border-bottom-right-radius: inherit;\n  border-bottom-left-radius: inherit;\n}\n.list-group-item.disabled,\n.list-group-item:disabled {\n  color: var(--bs-list-group-disabled-color);\n  pointer-events: none;\n  background-color: var(--bs-list-group-disabled-bg);\n}\n.list-group-item.active {\n  z-index: 2;\n  color: var(--bs-list-group-active-color);\n  background-color: var(--bs-list-group-active-bg);\n  border-color: var(--bs-list-group-active-border-color);\n}\n.list-group-item + .list-group-item {\n  border-top-width: 0;\n}\n.list-group-item + .list-group-item.active {\n  margin-top: calc(-1 * var(--bs-list-group-border-width));\n  border-top-width: var(--bs-list-group-border-width);\n}\n.list-group-horizontal {\n  flex-direction: row;\n}\n.list-group-horizontal > .list-group-item:first-child:not(:last-child) {\n  border-bottom-left-radius: var(--bs-list-group-border-radius);\n  border-top-right-radius: 0;\n}\n.list-group-horizontal > .list-group-item:last-child:not(:first-child) {\n  border-top-right-radius: var(--bs-list-group-border-radius);\n  border-bottom-left-radius: 0;\n}\n.list-group-horizontal > .list-group-item.active {\n  margin-top: 0;\n}\n.list-group-horizontal > .list-group-item + .list-group-item {\n  border-top-width: var(--bs-list-group-border-width);\n  border-left-width: 0;\n}\n.list-group-horizontal > .list-group-item + .list-group-item.active {\n  margin-left: calc(-1 * var(--bs-list-group-border-width));\n  border-left-width: var(--bs-list-group-border-width);\n}\n@media (min-width: 576px) {\n  .list-group-horizontal-sm {\n    flex-direction: row;\n  }\n  .list-group-horizontal-sm > .list-group-item:first-child:not(:last-child) {\n    border-bottom-left-radius: var(--bs-list-group-border-radius);\n    border-top-right-radius: 0;\n  }\n  .list-group-horizontal-sm > .list-group-item:last-child:not(:first-child) {\n    border-top-right-radius: var(--bs-list-group-border-radius);\n    border-bottom-left-radius: 0;\n  }\n  .list-group-horizontal-sm > .list-group-item.active {\n    margin-top: 0;\n  }\n  .list-group-horizontal-sm > .list-group-item + .list-group-item {\n    border-top-width: var(--bs-list-group-border-width);\n    border-left-width: 0;\n  }\n  .list-group-horizontal-sm > .list-group-item + .list-group-item.active {\n    margin-left: calc(-1 * var(--bs-list-group-border-width));\n    border-left-width: var(--bs-list-group-border-width);\n  }\n}\n@media (min-width: 768px) {\n  .list-group-horizontal-md {\n    flex-direction: row;\n  }\n  .list-group-horizontal-md > .list-group-item:first-child:not(:last-child) {\n    border-bottom-left-radius: var(--bs-list-group-border-radius);\n    border-top-right-radius: 0;\n  }\n  .list-group-horizontal-md > .list-group-item:last-child:not(:first-child) {\n    border-top-right-radius: var(--bs-list-group-border-radius);\n    border-bottom-left-radius: 0;\n  }\n  .list-group-horizontal-md > .list-group-item.active {\n    margin-top: 0;\n  }\n  .list-group-horizontal-md > .list-group-item + .list-group-item {\n    border-top-width: var(--bs-list-group-border-width);\n    border-left-width: 0;\n  }\n  .list-group-horizontal-md > .list-group-item + .list-group-item.active {\n    margin-left: calc(-1 * var(--bs-list-group-border-width));\n    border-left-width: var(--bs-list-group-border-width);\n  }\n}\n@media (min-width: 992px) {\n  .list-group-horizontal-lg {\n    flex-direction: row;\n  }\n  .list-group-horizontal-lg > .list-group-item:first-child:not(:last-child) {\n    border-bottom-left-radius: var(--bs-list-group-border-radius);\n    border-top-right-radius: 0;\n  }\n  .list-group-horizontal-lg > .list-group-item:last-child:not(:first-child) {\n    border-top-right-radius: var(--bs-list-group-border-radius);\n    border-bottom-left-radius: 0;\n  }\n  .list-group-horizontal-lg > .list-group-item.active {\n    margin-top: 0;\n  }\n  .list-group-horizontal-lg > .list-group-item + .list-group-item {\n    border-top-width: var(--bs-list-group-border-width);\n    border-left-width: 0;\n  }\n  .list-group-horizontal-lg > .list-group-item + .list-group-item.active {\n    margin-left: calc(-1 * var(--bs-list-group-border-width));\n    border-left-width: var(--bs-list-group-border-width);\n  }\n}\n@media (min-width: 1200px) {\n  .list-group-horizontal-xl {\n    flex-direction: row;\n  }\n  .list-group-horizontal-xl > .list-group-item:first-child:not(:last-child) {\n    border-bottom-left-radius: var(--bs-list-group-border-radius);\n    border-top-right-radius: 0;\n  }\n  .list-group-horizontal-xl > .list-group-item:last-child:not(:first-child) {\n    border-top-right-radius: var(--bs-list-group-border-radius);\n    border-bottom-left-radius: 0;\n  }\n  .list-group-horizontal-xl > .list-group-item.active {\n    margin-top: 0;\n  }\n  .list-group-horizontal-xl > .list-group-item + .list-group-item {\n    border-top-width: var(--bs-list-group-border-width);\n    border-left-width: 0;\n  }\n  .list-group-horizontal-xl > .list-group-item + .list-group-item.active {\n    margin-left: calc(-1 * var(--bs-list-group-border-width));\n    border-left-width: var(--bs-list-group-border-width);\n  }\n}\n@media (min-width: 1400px) {\n  .list-group-horizontal-xxl {\n    flex-direction: row;\n  }\n  .list-group-horizontal-xxl > .list-group-item:first-child:not(:last-child) {\n    border-bottom-left-radius: var(--bs-list-group-border-radius);\n    border-top-right-radius: 0;\n  }\n  .list-group-horizontal-xxl > .list-group-item:last-child:not(:first-child) {\n    border-top-right-radius: var(--bs-list-group-border-radius);\n    border-bottom-left-radius: 0;\n  }\n  .list-group-horizontal-xxl > .list-group-item.active {\n    margin-top: 0;\n  }\n  .list-group-horizontal-xxl > .list-group-item + .list-group-item {\n    border-top-width: var(--bs-list-group-border-width);\n    border-left-width: 0;\n  }\n  .list-group-horizontal-xxl > .list-group-item + .list-group-item.active {\n    margin-left: calc(-1 * var(--bs-list-group-border-width));\n    border-left-width: var(--bs-list-group-border-width);\n  }\n}\n.list-group-flush {\n  border-radius: 0;\n}\n.list-group-flush > .list-group-item {\n  border-width: 0 0 var(--bs-list-group-border-width);\n}\n.list-group-flush > .list-group-item:last-child {\n  border-bottom-width: 0;\n}\n.list-group-item-primary {\n  --bs-list-group-color: var(--bs-primary-text-emphasis);\n  --bs-list-group-bg: var(--bs-primary-bg-subtle);\n  --bs-list-group-border-color: var(--bs-primary-border-subtle);\n  --bs-list-group-action-hover-color: var(--bs-emphasis-color);\n  --bs-list-group-action-hover-bg: var(--bs-primary-border-subtle);\n  --bs-list-group-action-active-color: var(--bs-emphasis-color);\n  --bs-list-group-action-active-bg: var(--bs-primary-border-subtle);\n  --bs-list-group-active-color: var(--bs-primary-bg-subtle);\n  --bs-list-group-active-bg: var(--bs-primary-text-emphasis);\n  --bs-list-group-active-border-color: var(--bs-primary-text-emphasis);\n}\n.list-group-item-secondary {\n  --bs-list-group-color: var(--bs-secondary-text-emphasis);\n  --bs-list-group-bg: var(--bs-secondary-bg-subtle);\n  --bs-list-group-border-color: var(--bs-secondary-border-subtle);\n  --bs-list-group-action-hover-color: var(--bs-emphasis-color);\n  --bs-list-group-action-hover-bg: var(--bs-secondary-border-subtle);\n  --bs-list-group-action-active-color: var(--bs-emphasis-color);\n  --bs-list-group-action-active-bg: var(--bs-secondary-border-subtle);\n  --bs-list-group-active-color: var(--bs-secondary-bg-subtle);\n  --bs-list-group-active-bg: var(--bs-secondary-text-emphasis);\n  --bs-list-group-active-border-color: var(--bs-secondary-text-emphasis);\n}\n.list-group-item-success {\n  --bs-list-group-color: var(--bs-success-text-emphasis);\n  --bs-list-group-bg: var(--bs-success-bg-subtle);\n  --bs-list-group-border-color: var(--bs-success-border-subtle);\n  --bs-list-group-action-hover-color: var(--bs-emphasis-color);\n  --bs-list-group-action-hover-bg: var(--bs-success-border-subtle);\n  --bs-list-group-action-active-color: var(--bs-emphasis-color);\n  --bs-list-group-action-active-bg: var(--bs-success-border-subtle);\n  --bs-list-group-active-color: var(--bs-success-bg-subtle);\n  --bs-list-group-active-bg: var(--bs-success-text-emphasis);\n  --bs-list-group-active-border-color: var(--bs-success-text-emphasis);\n}\n.list-group-item-info {\n  --bs-list-group-color: var(--bs-info-text-emphasis);\n  --bs-list-group-bg: var(--bs-info-bg-subtle);\n  --bs-list-group-border-color: var(--bs-info-border-subtle);\n  --bs-list-group-action-hover-color: var(--bs-emphasis-color);\n  --bs-list-group-action-hover-bg: var(--bs-info-border-subtle);\n  --bs-list-group-action-active-color: var(--bs-emphasis-color);\n  --bs-list-group-action-active-bg: var(--bs-info-border-subtle);\n  --bs-list-group-active-color: var(--bs-info-bg-subtle);\n  --bs-list-group-active-bg: var(--bs-info-text-emphasis);\n  --bs-list-group-active-border-color: var(--bs-info-text-emphasis);\n}\n.list-group-item-warning {\n  --bs-list-group-color: var(--bs-warning-text-emphasis);\n  --bs-list-group-bg: var(--bs-warning-bg-subtle);\n  --bs-list-group-border-color: var(--bs-warning-border-subtle);\n  --bs-list-group-action-hover-color: var(--bs-emphasis-color);\n  --bs-list-group-action-hover-bg: var(--bs-warning-border-subtle);\n  --bs-list-group-action-active-color: var(--bs-emphasis-color);\n  --bs-list-group-action-active-bg: var(--bs-warning-border-subtle);\n  --bs-list-group-active-color: var(--bs-warning-bg-subtle);\n  --bs-list-group-active-bg: var(--bs-warning-text-emphasis);\n  --bs-list-group-active-border-color: var(--bs-warning-text-emphasis);\n}\n.list-group-item-danger {\n  --bs-list-group-color: var(--bs-danger-text-emphasis);\n  --bs-list-group-bg: var(--bs-danger-bg-subtle);\n  --bs-list-group-border-color: var(--bs-danger-border-subtle);\n  --bs-list-group-action-hover-color: var(--bs-emphasis-color);\n  --bs-list-group-action-hover-bg: var(--bs-danger-border-subtle);\n  --bs-list-group-action-active-color: var(--bs-emphasis-color);\n  --bs-list-group-action-active-bg: var(--bs-danger-border-subtle);\n  --bs-list-group-active-color: var(--bs-danger-bg-subtle);\n  --bs-list-group-active-bg: var(--bs-danger-text-emphasis);\n  --bs-list-group-active-border-color: var(--bs-danger-text-emphasis);\n}\n.list-group-item-light {\n  --bs-list-group-color: var(--bs-light-text-emphasis);\n  --bs-list-group-bg: var(--bs-light-bg-subtle);\n  --bs-list-group-border-color: var(--bs-light-border-subtle);\n  --bs-list-group-action-hover-color: var(--bs-emphasis-color);\n  --bs-list-group-action-hover-bg: var(--bs-light-border-subtle);\n  --bs-list-group-action-active-color: var(--bs-emphasis-color);\n  --bs-list-group-action-active-bg: var(--bs-light-border-subtle);\n  --bs-list-group-active-color: var(--bs-light-bg-subtle);\n  --bs-list-group-active-bg: var(--bs-light-text-emphasis);\n  --bs-list-group-active-border-color: var(--bs-light-text-emphasis);\n}\n.list-group-item-dark {\n  --bs-list-group-color: var(--bs-dark-text-emphasis);\n  --bs-list-group-bg: var(--bs-dark-bg-subtle);\n  --bs-list-group-border-color: var(--bs-dark-border-subtle);\n  --bs-list-group-action-hover-color: var(--bs-emphasis-color);\n  --bs-list-group-action-hover-bg: var(--bs-dark-border-subtle);\n  --bs-list-group-action-active-color: var(--bs-emphasis-color);\n  --bs-list-group-action-active-bg: var(--bs-dark-border-subtle);\n  --bs-list-group-active-color: var(--bs-dark-bg-subtle);\n  --bs-list-group-active-bg: var(--bs-dark-text-emphasis);\n  --bs-list-group-active-border-color: var(--bs-dark-text-emphasis);\n}\n.btn-close {\n  --bs-btn-close-color: #000;\n  --bs-btn-close-bg: url(\"data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 16 16\' fill=\'%23000\'%3e%3cpath d=\'M.293.293a1 1 0 0 1 1.414 0L8 6.586 14.293.293a1 1 0 1 1 1.414 1.414L9.414 8l6.293 6.293a1 1 0 0 1-1.414 1.414L8 9.414l-6.293 6.293a1 1 0 0 1-1.414-1.414L6.586 8 .293 1.707a1 1 0 0 1 0-1.414z\'/%3e%3c/svg%3e\");\n  --bs-btn-close-opacity: 0.5;\n  --bs-btn-close-hover-opacity: 0.75;\n  --bs-btn-close-focus-shadow: 0 0 0 0.25rem rgba(13, 110, 253, 0.25);\n  --bs-btn-close-focus-opacity: 1;\n  --bs-btn-close-disabled-opacity: 0.25;\n  --bs-btn-close-white-filter: invert(1) grayscale(100%) brightness(200%);\n  box-sizing: content-box;\n  width: 1em;\n  height: 1em;\n  padding: 0.25em 0.25em;\n  color: var(--bs-btn-close-color);\n  background: transparent var(--bs-btn-close-bg) center/1em auto no-repeat;\n  border: 0;\n  border-radius: 0.375rem;\n  opacity: var(--bs-btn-close-opacity);\n}\n.btn-close:hover {\n  color: var(--bs-btn-close-color);\n  text-decoration: none;\n  opacity: var(--bs-btn-close-hover-opacity);\n}\n.btn-close:focus {\n  outline: 0;\n  box-shadow: var(--bs-btn-close-focus-shadow);\n  opacity: var(--bs-btn-close-focus-opacity);\n}\n.btn-close.disabled,\n.btn-close:disabled {\n  pointer-events: none;\n  -webkit-user-select: none;\n  -moz-user-select: none;\n  user-select: none;\n  opacity: var(--bs-btn-close-disabled-opacity);\n}\n.btn-close-white {\n  filter: var(--bs-btn-close-white-filter);\n}\n[data-bs-theme=\'dark\'] .btn-close {\n  filter: var(--bs-btn-close-white-filter);\n}\n.toast {\n  --bs-toast-zindex: 1090;\n  --bs-toast-padding-x: 0.75rem;\n  --bs-toast-padding-y: 0.5rem;\n  --bs-toast-spacing: 1.5rem;\n  --bs-toast-max-width: 350px;\n  --bs-toast-font-size: 0.875rem;\n  --bs-toast-color: ;\n  --bs-toast-bg: rgba(var(--bs-body-bg-rgb), 0.85);\n  --bs-toast-border-width: var(--bs-border-width);\n  --bs-toast-border-color: var(--bs-border-color-translucent);\n  --bs-toast-border-radius: var(--bs-border-radius);\n  --bs-toast-box-shadow: var(--bs-box-shadow);\n  --bs-toast-header-color: var(--bs-secondary-color);\n  --bs-toast-header-bg: rgba(var(--bs-body-bg-rgb), 0.85);\n  --bs-toast-header-border-color: var(--bs-border-color-translucent);\n  width: var(--bs-toast-max-width);\n  max-width: 100%;\n  font-size: var(--bs-toast-font-size);\n  color: var(--bs-toast-color);\n  pointer-events: auto;\n  background-color: var(--bs-toast-bg);\n  background-clip: padding-box;\n  border: var(--bs-toast-border-width) solid var(--bs-toast-border-color);\n  box-shadow: var(--bs-toast-box-shadow);\n  border-radius: var(--bs-toast-border-radius);\n}\n.toast.showing {\n  opacity: 0;\n}\n.toast:not(.show) {\n  display: none;\n}\n.toast-container {\n  --bs-toast-zindex: 1090;\n  position: absolute;\n  z-index: var(--bs-toast-zindex);\n  width: -webkit-max-content;\n  width: -moz-max-content;\n  width: max-content;\n  max-width: 100%;\n  pointer-events: none;\n}\n.toast-container > :not(:last-child) {\n  margin-bottom: var(--bs-toast-spacing);\n}\n.toast-header {\n  display: flex;\n  align-items: center;\n  padding: var(--bs-toast-padding-y) var(--bs-toast-padding-x);\n  color: var(--bs-toast-header-color);\n  background-color: var(--bs-toast-header-bg);\n  background-clip: padding-box;\n  border-bottom: var(--bs-toast-border-width) solid\n    var(--bs-toast-header-border-color);\n  border-top-left-radius: calc(\n    var(--bs-toast-border-radius) - var(--bs-toast-border-width)\n  );\n  border-top-right-radius: calc(\n    var(--bs-toast-border-radius) - var(--bs-toast-border-width)\n  );\n}\n.toast-header .btn-close {\n  margin-right: calc(-0.5 * var(--bs-toast-padding-x));\n  margin-left: var(--bs-toast-padding-x);\n}\n.toast-body {\n  padding: var(--bs-toast-padding-x);\n  word-wrap: break-word;\n}\n.modal {\n  --bs-modal-zindex: 1055;\n  --bs-modal-width: 500px;\n  --bs-modal-padding: 1rem;\n  --bs-modal-margin: 0.5rem;\n  --bs-modal-color: ;\n  --bs-modal-bg: var(--bs-body-bg);\n  --bs-modal-border-color: var(--bs-border-color-translucent);\n  --bs-modal-border-width: var(--bs-border-width);\n  --bs-modal-border-radius: var(--bs-border-radius-lg);\n  --bs-modal-box-shadow: var(--bs-box-shadow-sm);\n  --bs-modal-inner-border-radius: calc(\n    var(--bs-border-radius-lg) - (var(--bs-border-width))\n  );\n  --bs-modal-header-padding-x: 1rem;\n  --bs-modal-header-padding-y: 1rem;\n  --bs-modal-header-padding: 1rem 1rem;\n  --bs-modal-header-border-color: var(--bs-border-color);\n  --bs-modal-header-border-width: var(--bs-border-width);\n  --bs-modal-title-line-height: 1.5;\n  --bs-modal-footer-gap: 0.5rem;\n  --bs-modal-footer-bg: ;\n  --bs-modal-footer-border-color: var(--bs-border-color);\n  --bs-modal-footer-border-width: var(--bs-border-width);\n  position: fixed;\n  top: 0;\n  left: 0;\n  z-index: var(--bs-modal-zindex);\n  display: none;\n  width: 100%;\n  height: 100%;\n  overflow-x: hidden;\n  overflow-y: auto;\n  outline: 0;\n}\n.modal-dialog {\n  position: relative;\n  width: auto;\n  margin: var(--bs-modal-margin);\n  pointer-events: none;\n}\n.modal.fade .modal-dialog {\n  transition: transform 0.3s ease-out;\n  transform: translate(0, -50px);\n}\n@media (prefers-reduced-motion: reduce) {\n  .modal.fade .modal-dialog {\n    transition: none;\n  }\n}\n.modal.show .modal-dialog {\n  transform: none;\n}\n.modal.modal-static .modal-dialog {\n  transform: scale(1.02);\n}\n.modal-dialog-scrollable {\n  height: calc(100% - var(--bs-modal-margin) * 2);\n}\n.modal-dialog-scrollable .modal-content {\n  max-height: 100%;\n  overflow: hidden;\n}\n.modal-dialog-scrollable .modal-body {\n  overflow-y: auto;\n}\n.modal-dialog-centered {\n  display: flex;\n  align-items: center;\n  min-height: calc(100% - var(--bs-modal-margin) * 2);\n}\n.modal-content {\n  position: relative;\n  display: flex;\n  flex-direction: column;\n  width: 100%;\n  color: var(--bs-modal-color);\n  pointer-events: auto;\n  background-color: var(--bs-modal-bg);\n  background-clip: padding-box;\n  border: var(--bs-modal-border-width) solid var(--bs-modal-border-color);\n  border-radius: var(--bs-modal-border-radius);\n  outline: 0;\n}\n.modal-backdrop {\n  --bs-backdrop-zindex: 1050;\n  --bs-backdrop-bg: #000;\n  --bs-backdrop-opacity: 0.5;\n  position: fixed;\n  top: 0;\n  left: 0;\n  z-index: var(--bs-backdrop-zindex);\n  width: 100vw;\n  height: 100vh;\n  background-color: var(--bs-backdrop-bg);\n}\n.modal-backdrop.fade {\n  opacity: 0;\n}\n.modal-backdrop.show {\n  opacity: var(--bs-backdrop-opacity);\n}\n.modal-header {\n  display: flex;\n  flex-shrink: 0;\n  align-items: center;\n  padding: var(--bs-modal-header-padding);\n  border-bottom: var(--bs-modal-header-border-width) solid\n    var(--bs-modal-header-border-color);\n  border-top-left-radius: var(--bs-modal-inner-border-radius);\n  border-top-right-radius: var(--bs-modal-inner-border-radius);\n}\n.modal-header .btn-close {\n  padding: calc(var(--bs-modal-header-padding-y) * 0.5)\n    calc(var(--bs-modal-header-padding-x) * 0.5);\n  margin: calc(-0.5 * var(--bs-modal-header-padding-y))\n    calc(-0.5 * var(--bs-modal-header-padding-x))\n    calc(-0.5 * var(--bs-modal-header-padding-y)) auto;\n}\n.modal-title {\n  margin-bottom: 0;\n  line-height: var(--bs-modal-title-line-height);\n}\n.modal-body {\n  position: relative;\n  flex: 1 1 auto;\n  padding: var(--bs-modal-padding);\n}\n.modal-footer {\n  display: flex;\n  flex-shrink: 0;\n  flex-wrap: wrap;\n  align-items: center;\n  justify-content: flex-end;\n  padding: calc(var(--bs-modal-padding) - var(--bs-modal-footer-gap) * 0.5);\n  background-color: var(--bs-modal-footer-bg);\n  border-top: var(--bs-modal-footer-border-width) solid\n    var(--bs-modal-footer-border-color);\n  border-bottom-right-radius: var(--bs-modal-inner-border-radius);\n  border-bottom-left-radius: var(--bs-modal-inner-border-radius);\n}\n.modal-footer > * {\n  margin: calc(var(--bs-modal-footer-gap) * 0.5);\n}\n@media (min-width: 576px) {\n  .modal {\n    --bs-modal-margin: 1.75rem;\n    --bs-modal-box-shadow: var(--bs-box-shadow);\n  }\n  .modal-dialog {\n    max-width: var(--bs-modal-width);\n    margin-right: auto;\n    margin-left: auto;\n  }\n  .modal-sm {\n    --bs-modal-width: 300px;\n  }\n}\n@media (min-width: 992px) {\n  .modal-lg,\n  .modal-xl {\n    --bs-modal-width: 800px;\n  }\n}\n@media (min-width: 1200px) {\n  .modal-xl {\n    --bs-modal-width: 1140px;\n  }\n}\n.modal-fullscreen {\n  width: 100vw;\n  max-width: none;\n  height: 100%;\n  margin: 0;\n}\n.modal-fullscreen .modal-content {\n  height: 100%;\n  border: 0;\n  border-radius: 0;\n}\n.modal-fullscreen .modal-footer,\n.modal-fullscreen .modal-header {\n  border-radius: 0;\n}\n.modal-fullscreen .modal-body {\n  overflow-y: auto;\n}\n@media (max-width: 575.98px) {\n  .modal-fullscreen-sm-down {\n    width: 100vw;\n    max-width: none;\n    height: 100%;\n    margin: 0;\n  }\n  .modal-fullscreen-sm-down .modal-content {\n    height: 100%;\n    border: 0;\n    border-radius: 0;\n  }\n  .modal-fullscreen-sm-down .modal-footer,\n  .modal-fullscreen-sm-down .modal-header {\n    border-radius: 0;\n  }\n  .modal-fullscreen-sm-down .modal-body {\n    overflow-y: auto;\n  }\n}\n@media (max-width: 767.98px) {\n  .modal-fullscreen-md-down {\n    width: 100vw;\n    max-width: none;\n    height: 100%;\n    margin: 0;\n  }\n  .modal-fullscreen-md-down .modal-content {\n    height: 100%;\n    border: 0;\n    border-radius: 0;\n  }\n  .modal-fullscreen-md-down .modal-footer,\n  .modal-fullscreen-md-down .modal-header {\n    border-radius: 0;\n  }\n  .modal-fullscreen-md-down .modal-body {\n    overflow-y: auto;\n  }\n}\n@media (max-width: 991.98px) {\n  .modal-fullscreen-lg-down {\n    width: 100vw;\n    max-width: none;\n    height: 100%;\n    margin: 0;\n  }\n  .modal-fullscreen-lg-down .modal-content {\n    height: 100%;\n    border: 0;\n    border-radius: 0;\n  }\n  .modal-fullscreen-lg-down .modal-footer,\n  .modal-fullscreen-lg-down .modal-header {\n    border-radius: 0;\n  }\n  .modal-fullscreen-lg-down .modal-body {\n    overflow-y: auto;\n  }\n}\n@media (max-width: 1199.98px) {\n  .modal-fullscreen-xl-down {\n    width: 100vw;\n    max-width: none;\n    height: 100%;\n    margin: 0;\n  }\n  .modal-fullscreen-xl-down .modal-content {\n    height: 100%;\n    border: 0;\n    border-radius: 0;\n  }\n  .modal-fullscreen-xl-down .modal-footer,\n  .modal-fullscreen-xl-down .modal-header {\n    border-radius: 0;\n  }\n  .modal-fullscreen-xl-down .modal-body {\n    overflow-y: auto;\n  }\n}\n@media (max-width: 1399.98px) {\n  .modal-fullscreen-xxl-down {\n    width: 100vw;\n    max-width: none;\n    height: 100%;\n    margin: 0;\n  }\n  .modal-fullscreen-xxl-down .modal-content {\n    height: 100%;\n    border: 0;\n    border-radius: 0;\n  }\n  .modal-fullscreen-xxl-down .modal-footer,\n  .modal-fullscreen-xxl-down .modal-header {\n    border-radius: 0;\n  }\n  .modal-fullscreen-xxl-down .modal-body {\n    overflow-y: auto;\n  }\n}\n.tooltip {\n  --bs-tooltip-zindex: 1080;\n  --bs-tooltip-max-width: 200px;\n  --bs-tooltip-padding-x: 0.5rem;\n  --bs-tooltip-padding-y: 0.25rem;\n  --bs-tooltip-margin: ;\n  --bs-tooltip-font-size: 0.875rem;\n  --bs-tooltip-color: var(--bs-body-bg);\n  --bs-tooltip-bg: var(--bs-emphasis-color);\n  --bs-tooltip-border-radius: var(--bs-border-radius);\n  --bs-tooltip-opacity: 0.9;\n  --bs-tooltip-arrow-width: 0.8rem;\n  --bs-tooltip-arrow-height: 0.4rem;\n  z-index: var(--bs-tooltip-zindex);\n  display: block;\n  margin: var(--bs-tooltip-margin);\n  font-family: var(--bs-font-sans-serif);\n  font-style: normal;\n  font-weight: 400;\n  line-height: 1.5;\n  text-align: left;\n  text-align: start;\n  text-decoration: none;\n  text-shadow: none;\n  text-transform: none;\n  letter-spacing: normal;\n  word-break: normal;\n  white-space: normal;\n  word-spacing: normal;\n  line-break: auto;\n  font-size: var(--bs-tooltip-font-size);\n  word-wrap: break-word;\n  opacity: 0;\n}\n.tooltip.show {\n  opacity: var(--bs-tooltip-opacity);\n}\n.tooltip .tooltip-arrow {\n  display: block;\n  width: var(--bs-tooltip-arrow-width);\n  height: var(--bs-tooltip-arrow-height);\n}\n.tooltip .tooltip-arrow::before {\n  position: absolute;\n  content: \'\';\n  border-color: transparent;\n  border-style: solid;\n}\n.bs-tooltip-auto[data-popper-placement^=\'top\'] .tooltip-arrow,\n.bs-tooltip-top .tooltip-arrow {\n  bottom: calc(-1 * var(--bs-tooltip-arrow-height));\n}\n.bs-tooltip-auto[data-popper-placement^=\'top\'] .tooltip-arrow::before,\n.bs-tooltip-top .tooltip-arrow::before {\n  top: -1px;\n  border-width: var(--bs-tooltip-arrow-height)\n    calc(var(--bs-tooltip-arrow-width) * 0.5) 0;\n  border-top-color: var(--bs-tooltip-bg);\n}\n.bs-tooltip-auto[data-popper-placement^=\'right\'] .tooltip-arrow,\n.bs-tooltip-end .tooltip-arrow {\n  left: calc(-1 * var(--bs-tooltip-arrow-height));\n  width: var(--bs-tooltip-arrow-height);\n  height: var(--bs-tooltip-arrow-width);\n}\n.bs-tooltip-auto[data-popper-placement^=\'right\'] .tooltip-arrow::before,\n.bs-tooltip-end .tooltip-arrow::before {\n  right: -1px;\n  border-width: calc(var(--bs-tooltip-arrow-width) * 0.5)\n    var(--bs-tooltip-arrow-height) calc(var(--bs-tooltip-arrow-width) * 0.5) 0;\n  border-right-color: var(--bs-tooltip-bg);\n}\n.bs-tooltip-auto[data-popper-placement^=\'bottom\'] .tooltip-arrow,\n.bs-tooltip-bottom .tooltip-arrow {\n  top: calc(-1 * var(--bs-tooltip-arrow-height));\n}\n.bs-tooltip-auto[data-popper-placement^=\'bottom\'] .tooltip-arrow::before,\n.bs-tooltip-bottom .tooltip-arrow::before {\n  bottom: -1px;\n  border-width: 0 calc(var(--bs-tooltip-arrow-width) * 0.5)\n    var(--bs-tooltip-arrow-height);\n  border-bottom-color: var(--bs-tooltip-bg);\n}\n.bs-tooltip-auto[data-popper-placement^=\'left\'] .tooltip-arrow,\n.bs-tooltip-start .tooltip-arrow {\n  right: calc(-1 * var(--bs-tooltip-arrow-height));\n  width: var(--bs-tooltip-arrow-height);\n  height: var(--bs-tooltip-arrow-width);\n}\n.bs-tooltip-auto[data-popper-placement^=\'left\'] .tooltip-arrow::before,\n.bs-tooltip-start .tooltip-arrow::before {\n  left: -1px;\n  border-width: calc(var(--bs-tooltip-arrow-width) * 0.5) 0\n    calc(var(--bs-tooltip-arrow-width) * 0.5) var(--bs-tooltip-arrow-height);\n  border-left-color: var(--bs-tooltip-bg);\n}\n.tooltip-inner {\n  max-width: var(--bs-tooltip-max-width);\n  padding: var(--bs-tooltip-padding-y) var(--bs-tooltip-padding-x);\n  color: var(--bs-tooltip-color);\n  text-align: center;\n  background-color: var(--bs-tooltip-bg);\n  border-radius: var(--bs-tooltip-border-radius);\n}\n.popover {\n  --bs-popover-zindex: 1070;\n  --bs-popover-max-width: 276px;\n  --bs-popover-font-size: 0.875rem;\n  --bs-popover-bg: var(--bs-body-bg);\n  --bs-popover-border-width: var(--bs-border-width);\n  --bs-popover-border-color: var(--bs-border-color-translucent);\n  --bs-popover-border-radius: var(--bs-border-radius-lg);\n  --bs-popover-inner-border-radius: calc(\n    var(--bs-border-radius-lg) - var(--bs-border-width)\n  );\n  --bs-popover-box-shadow: var(--bs-box-shadow);\n  --bs-popover-header-padding-x: 1rem;\n  --bs-popover-header-padding-y: 0.5rem;\n  --bs-popover-header-font-size: 1rem;\n  --bs-popover-header-color: inherit;\n  --bs-popover-header-bg: var(--bs-secondary-bg);\n  --bs-popover-body-padding-x: 1rem;\n  --bs-popover-body-padding-y: 1rem;\n  --bs-popover-body-color: var(--bs-body-color);\n  --bs-popover-arrow-width: 1rem;\n  --bs-popover-arrow-height: 0.5rem;\n  --bs-popover-arrow-border: var(--bs-popover-border-color);\n  z-index: var(--bs-popover-zindex);\n  display: block;\n  max-width: var(--bs-popover-max-width);\n  font-family: var(--bs-font-sans-serif);\n  font-style: normal;\n  font-weight: 400;\n  line-height: 1.5;\n  text-align: left;\n  text-align: start;\n  text-decoration: none;\n  text-shadow: none;\n  text-transform: none;\n  letter-spacing: normal;\n  word-break: normal;\n  white-space: normal;\n  word-spacing: normal;\n  line-break: auto;\n  font-size: var(--bs-popover-font-size);\n  word-wrap: break-word;\n  background-color: var(--bs-popover-bg);\n  background-clip: padding-box;\n  border: var(--bs-popover-border-width) solid var(--bs-popover-border-color);\n  border-radius: var(--bs-popover-border-radius);\n}\n.popover .popover-arrow {\n  display: block;\n  width: var(--bs-popover-arrow-width);\n  height: var(--bs-popover-arrow-height);\n}\n.popover .popover-arrow::after,\n.popover .popover-arrow::before {\n  position: absolute;\n  display: block;\n  content: \'\';\n  border-color: transparent;\n  border-style: solid;\n  border-width: 0;\n}\n.bs-popover-auto[data-popper-placement^=\'top\'] > .popover-arrow,\n.bs-popover-top > .popover-arrow {\n  bottom: calc(\n    -1 * (var(--bs-popover-arrow-height)) - var(--bs-popover-border-width)\n  );\n}\n.bs-popover-auto[data-popper-placement^=\'top\'] > .popover-arrow::after,\n.bs-popover-auto[data-popper-placement^=\'top\'] > .popover-arrow::before,\n.bs-popover-top > .popover-arrow::after,\n.bs-popover-top > .popover-arrow::before {\n  border-width: var(--bs-popover-arrow-height)\n    calc(var(--bs-popover-arrow-width) * 0.5) 0;\n}\n.bs-popover-auto[data-popper-placement^=\'top\'] > .popover-arrow::before,\n.bs-popover-top > .popover-arrow::before {\n  bottom: 0;\n  border-top-color: var(--bs-popover-arrow-border);\n}\n.bs-popover-auto[data-popper-placement^=\'top\'] > .popover-arrow::after,\n.bs-popover-top > .popover-arrow::after {\n  bottom: var(--bs-popover-border-width);\n  border-top-color: var(--bs-popover-bg);\n}\n.bs-popover-auto[data-popper-placement^=\'right\'] > .popover-arrow,\n.bs-popover-end > .popover-arrow {\n  left: calc(\n    -1 * (var(--bs-popover-arrow-height)) - var(--bs-popover-border-width)\n  );\n  width: var(--bs-popover-arrow-height);\n  height: var(--bs-popover-arrow-width);\n}\n.bs-popover-auto[data-popper-placement^=\'right\'] > .popover-arrow::after,\n.bs-popover-auto[data-popper-placement^=\'right\'] > .popover-arrow::before,\n.bs-popover-end > .popover-arrow::after,\n.bs-popover-end > .popover-arrow::before {\n  border-width: calc(var(--bs-popover-arrow-width) * 0.5)\n    var(--bs-popover-arrow-height) calc(var(--bs-popover-arrow-width) * 0.5) 0;\n}\n.bs-popover-auto[data-popper-placement^=\'right\'] > .popover-arrow::before,\n.bs-popover-end > .popover-arrow::before {\n  left: 0;\n  border-right-color: var(--bs-popover-arrow-border);\n}\n.bs-popover-auto[data-popper-placement^=\'right\'] > .popover-arrow::after,\n.bs-popover-end > .popover-arrow::after {\n  left: var(--bs-popover-border-width);\n  border-right-color: var(--bs-popover-bg);\n}\n.bs-popover-auto[data-popper-placement^=\'bottom\'] > .popover-arrow,\n.bs-popover-bottom > .popover-arrow {\n  top: calc(\n    -1 * (var(--bs-popover-arrow-height)) - var(--bs-popover-border-width)\n  );\n}\n.bs-popover-auto[data-popper-placement^=\'bottom\'] > .popover-arrow::after,\n.bs-popover-auto[data-popper-placement^=\'bottom\'] > .popover-arrow::before,\n.bs-popover-bottom > .popover-arrow::after,\n.bs-popover-bottom > .popover-arrow::before {\n  border-width: 0 calc(var(--bs-popover-arrow-width) * 0.5)\n    var(--bs-popover-arrow-height);\n}\n.bs-popover-auto[data-popper-placement^=\'bottom\'] > .popover-arrow::before,\n.bs-popover-bottom > .popover-arrow::before {\n  top: 0;\n  border-bottom-color: var(--bs-popover-arrow-border);\n}\n.bs-popover-auto[data-popper-placement^=\'bottom\'] > .popover-arrow::after,\n.bs-popover-bottom > .popover-arrow::after {\n  top: var(--bs-popover-border-width);\n  border-bottom-color: var(--bs-popover-bg);\n}\n.bs-popover-auto[data-popper-placement^=\'bottom\'] .popover-header::before,\n.bs-popover-bottom .popover-header::before {\n  position: absolute;\n  top: 0;\n  left: 50%;\n  display: block;\n  width: var(--bs-popover-arrow-width);\n  margin-left: calc(-0.5 * var(--bs-popover-arrow-width));\n  content: \'\';\n  border-bottom: var(--bs-popover-border-width) solid\n    var(--bs-popover-header-bg);\n}\n.bs-popover-auto[data-popper-placement^=\'left\'] > .popover-arrow,\n.bs-popover-start > .popover-arrow {\n  right: calc(\n    -1 * (var(--bs-popover-arrow-height)) - var(--bs-popover-border-width)\n  );\n  width: var(--bs-popover-arrow-height);\n  height: var(--bs-popover-arrow-width);\n}\n.bs-popover-auto[data-popper-placement^=\'left\'] > .popover-arrow::after,\n.bs-popover-auto[data-popper-placement^=\'left\'] > .popover-arrow::before,\n.bs-popover-start > .popover-arrow::after,\n.bs-popover-start > .popover-arrow::before {\n  border-width: calc(var(--bs-popover-arrow-width) * 0.5) 0\n    calc(var(--bs-popover-arrow-width) * 0.5) var(--bs-popover-arrow-height);\n}\n.bs-popover-auto[data-popper-placement^=\'left\'] > .popover-arrow::before,\n.bs-popover-start > .popover-arrow::before {\n  right: 0;\n  border-left-color: var(--bs-popover-arrow-border);\n}\n.bs-popover-auto[data-popper-placement^=\'left\'] > .popover-arrow::after,\n.bs-popover-start > .popover-arrow::after {\n  right: var(--bs-popover-border-width);\n  border-left-color: var(--bs-popover-bg);\n}\n.popover-header {\n  padding: var(--bs-popover-header-padding-y) var(--bs-popover-header-padding-x);\n  margin-bottom: 0;\n  font-size: var(--bs-popover-header-font-size);\n  color: var(--bs-popover-header-color);\n  background-color: var(--bs-popover-header-bg);\n  border-bottom: var(--bs-popover-border-width) solid\n    var(--bs-popover-border-color);\n  border-top-left-radius: var(--bs-popover-inner-border-radius);\n  border-top-right-radius: var(--bs-popover-inner-border-radius);\n}\n.popover-header:empty {\n  display: none;\n}\n.popover-body {\n  padding: var(--bs-popover-body-padding-y) var(--bs-popover-body-padding-x);\n  color: var(--bs-popover-body-color);\n}\n.carousel {\n  position: relative;\n}\n.carousel.pointer-event {\n  touch-action: pan-y;\n}\n.carousel-inner {\n  position: relative;\n  width: 100%;\n  overflow: hidden;\n}\n.carousel-inner::after {\n  display: block;\n  clear: both;\n  content: \'\';\n}\n.carousel-item {\n  position: relative;\n  display: none;\n  float: left;\n  width: 100%;\n  margin-right: -100%;\n  -webkit-backface-visibility: hidden;\n  backface-visibility: hidden;\n  transition: transform 0.6s ease-in-out;\n}\n@media (prefers-reduced-motion: reduce) {\n  .carousel-item {\n    transition: none;\n  }\n}\n.carousel-item-next,\n.carousel-item-prev,\n.carousel-item.active {\n  display: block;\n}\n.active.carousel-item-end,\n.carousel-item-next:not(.carousel-item-start) {\n  transform: translateX(100%);\n}\n.active.carousel-item-start,\n.carousel-item-prev:not(.carousel-item-end) {\n  transform: translateX(-100%);\n}\n.carousel-fade .carousel-item {\n  opacity: 0;\n  transition-property: opacity;\n  transform: none;\n}\n.carousel-fade .carousel-item-next.carousel-item-start,\n.carousel-fade .carousel-item-prev.carousel-item-end,\n.carousel-fade .carousel-item.active {\n  z-index: 1;\n  opacity: 1;\n}\n.carousel-fade .active.carousel-item-end,\n.carousel-fade .active.carousel-item-start {\n  z-index: 0;\n  opacity: 0;\n  transition: opacity 0s 0.6s;\n}\n@media (prefers-reduced-motion: reduce) {\n  .carousel-fade .active.carousel-item-end,\n  .carousel-fade .active.carousel-item-start {\n    transition: none;\n  }\n}\n.carousel-control-next,\n.carousel-control-prev {\n  position: absolute;\n  top: 0;\n  bottom: 0;\n  z-index: 1;\n  display: flex;\n  align-items: center;\n  justify-content: center;\n  width: 15%;\n  padding: 0;\n  color: #fff;\n  text-align: center;\n  background: 0 0;\n  border: 0;\n  opacity: 0.5;\n  transition: opacity 0.15s ease;\n}\n@media (prefers-reduced-motion: reduce) {\n  .carousel-control-next,\n  .carousel-control-prev {\n    transition: none;\n  }\n}\n.carousel-control-next:focus,\n.carousel-control-next:hover,\n.carousel-control-prev:focus,\n.carousel-control-prev:hover {\n  color: #fff;\n  text-decoration: none;\n  outline: 0;\n  opacity: 0.9;\n}\n.carousel-control-prev {\n  left: 0;\n}\n.carousel-control-next {\n  right: 0;\n}\n.carousel-control-next-icon,\n.carousel-control-prev-icon {\n  display: inline-block;\n  width: 2rem;\n  height: 2rem;\n  background-repeat: no-repeat;\n  background-position: 50%;\n  background-size: 100% 100%;\n}\n.carousel-control-prev-icon {\n  background-image: url(\"data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 16 16\' fill=\'%23fff\'%3e%3cpath d=\'M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z\'/%3e%3c/svg%3e\");\n}\n.carousel-control-next-icon {\n  background-image: url(\"data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 16 16\' fill=\'%23fff\'%3e%3cpath d=\'M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z\'/%3e%3c/svg%3e\");\n}\n.carousel-indicators {\n  position: absolute;\n  right: 0;\n  bottom: 0;\n  left: 0;\n  z-index: 2;\n  display: flex;\n  justify-content: center;\n  padding: 0;\n  margin-right: 15%;\n  margin-bottom: 1rem;\n  margin-left: 15%;\n}\n.carousel-indicators [data-bs-target] {\n  box-sizing: content-box;\n  flex: 0 1 auto;\n  width: 30px;\n  height: 3px;\n  padding: 0;\n  margin-right: 3px;\n  margin-left: 3px;\n  text-indent: -999px;\n  cursor: pointer;\n  background-color: #fff;\n  background-clip: padding-box;\n  border: 0;\n  border-top: 10px solid transparent;\n  border-bottom: 10px solid transparent;\n  opacity: 0.5;\n  transition: opacity 0.6s ease;\n}\n@media (prefers-reduced-motion: reduce) {\n  .carousel-indicators [data-bs-target] {\n    transition: none;\n  }\n}\n.carousel-indicators .active {\n  opacity: 1;\n}\n.carousel-caption {\n  position: absolute;\n  right: 15%;\n  bottom: 1.25rem;\n  left: 15%;\n  padding-top: 1.25rem;\n  padding-bottom: 1.25rem;\n  color: #fff;\n  text-align: center;\n}\n.carousel-dark .carousel-control-next-icon,\n.carousel-dark .carousel-control-prev-icon {\n  filter: invert(1) grayscale(100);\n}\n.carousel-dark .carousel-indicators [data-bs-target] {\n  background-color: #000;\n}\n.carousel-dark .carousel-caption {\n  color: #000;\n}\n[data-bs-theme=\'dark\'] .carousel .carousel-control-next-icon,\n[data-bs-theme=\'dark\'] .carousel .carousel-control-prev-icon,\n[data-bs-theme=\'dark\'].carousel .carousel-control-next-icon,\n[data-bs-theme=\'dark\'].carousel .carousel-control-prev-icon {\n  filter: invert(1) grayscale(100);\n}\n[data-bs-theme=\'dark\'] .carousel .carousel-indicators [data-bs-target],\n[data-bs-theme=\'dark\'].carousel .carousel-indicators [data-bs-target] {\n  background-color: #000;\n}\n[data-bs-theme=\'dark\'] .carousel .carousel-caption,\n[data-bs-theme=\'dark\'].carousel .carousel-caption {\n  color: #000;\n}\n.spinner-border,\n.spinner-grow {\n  display: inline-block;\n  width: var(--bs-spinner-width);\n  height: var(--bs-spinner-height);\n  vertical-align: var(--bs-spinner-vertical-align);\n  border-radius: 50%;\n  animation: var(--bs-spinner-animation-speed) linear infinite\n    var(--bs-spinner-animation-name);\n}\n@keyframes spinner-border {\n  to {\n    transform: rotate(360deg);\n  }\n}\n.spinner-border {\n  --bs-spinner-width: 2rem;\n  --bs-spinner-height: 2rem;\n  --bs-spinner-vertical-align: -0.125em;\n  --bs-spinner-border-width: 0.25em;\n  --bs-spinner-animation-speed: 0.75s;\n  --bs-spinner-animation-name: spinner-border;\n  border: var(--bs-spinner-border-width) solid currentcolor;\n  border-right-color: transparent;\n}\n.spinner-border-sm {\n  --bs-spinner-width: 1rem;\n  --bs-spinner-height: 1rem;\n  --bs-spinner-border-width: 0.2em;\n}\n@keyframes spinner-grow {\n  0% {\n    transform: scale(0);\n  }\n  50% {\n    opacity: 1;\n    transform: none;\n  }\n}\n.spinner-grow {\n  --bs-spinner-width: 2rem;\n  --bs-spinner-height: 2rem;\n  --bs-spinner-vertical-align: -0.125em;\n  --bs-spinner-animation-speed: 0.75s;\n  --bs-spinner-animation-name: spinner-grow;\n  background-color: currentcolor;\n  opacity: 0;\n}\n.spinner-grow-sm {\n  --bs-spinner-width: 1rem;\n  --bs-spinner-height: 1rem;\n}\n@media (prefers-reduced-motion: reduce) {\n  .spinner-border,\n  .spinner-grow {\n    --bs-spinner-animation-speed: 1.5s;\n  }\n}\n.offcanvas,\n.offcanvas-lg,\n.offcanvas-md,\n.offcanvas-sm,\n.offcanvas-xl,\n.offcanvas-xxl {\n  --bs-offcanvas-zindex: 1045;\n  --bs-offcanvas-width: 400px;\n  --bs-offcanvas-height: 30vh;\n  --bs-offcanvas-padding-x: 1rem;\n  --bs-offcanvas-padding-y: 1rem;\n  --bs-offcanvas-color: var(--bs-body-color);\n  --bs-offcanvas-bg: var(--bs-body-bg);\n  --bs-offcanvas-border-width: var(--bs-border-width);\n  --bs-offcanvas-border-color: var(--bs-border-color-translucent);\n  --bs-offcanvas-box-shadow: var(--bs-box-shadow-sm);\n  --bs-offcanvas-transition: transform 0.3s ease-in-out;\n  --bs-offcanvas-title-line-height: 1.5;\n}\n@media (max-width: 575.98px) {\n  .offcanvas-sm {\n    position: fixed;\n    bottom: 0;\n    z-index: var(--bs-offcanvas-zindex);\n    display: flex;\n    flex-direction: column;\n    max-width: 100%;\n    color: var(--bs-offcanvas-color);\n    visibility: hidden;\n    background-color: var(--bs-offcanvas-bg);\n    background-clip: padding-box;\n    outline: 0;\n    transition: var(--bs-offcanvas-transition);\n  }\n}\n@media (max-width: 575.98px) and (prefers-reduced-motion: reduce) {\n  .offcanvas-sm {\n    transition: none;\n  }\n}\n@media (max-width: 575.98px) {\n  .offcanvas-sm.offcanvas-start {\n    top: 0;\n    left: 0;\n    width: var(--bs-offcanvas-width);\n    border-right: var(--bs-offcanvas-border-width) solid\n      var(--bs-offcanvas-border-color);\n    transform: translateX(-100%);\n  }\n  .offcanvas-sm.offcanvas-end {\n    top: 0;\n    right: 0;\n    width: var(--bs-offcanvas-width);\n    border-left: var(--bs-offcanvas-border-width) solid\n      var(--bs-offcanvas-border-color);\n    transform: translateX(100%);\n  }\n  .offcanvas-sm.offcanvas-top {\n    top: 0;\n    right: 0;\n    left: 0;\n    height: var(--bs-offcanvas-height);\n    max-height: 100%;\n    border-bottom: var(--bs-offcanvas-border-width) solid\n      var(--bs-offcanvas-border-color);\n    transform: translateY(-100%);\n  }\n  .offcanvas-sm.offcanvas-bottom {\n    right: 0;\n    left: 0;\n    height: var(--bs-offcanvas-height);\n    max-height: 100%;\n    border-top: var(--bs-offcanvas-border-width) solid\n      var(--bs-offcanvas-border-color);\n    transform: translateY(100%);\n  }\n  .offcanvas-sm.show:not(.hiding),\n  .offcanvas-sm.showing {\n    transform: none;\n  }\n  .offcanvas-sm.hiding,\n  .offcanvas-sm.show,\n  .offcanvas-sm.showing {\n    visibility: visible;\n  }\n}\n@media (min-width: 576px) {\n  .offcanvas-sm {\n    --bs-offcanvas-height: auto;\n    --bs-offcanvas-border-width: 0;\n    background-color: transparent !important;\n  }\n  .offcanvas-sm .offcanvas-header {\n    display: none;\n  }\n  .offcanvas-sm .offcanvas-body {\n    display: flex;\n    flex-grow: 0;\n    padding: 0;\n    overflow-y: visible;\n    background-color: transparent !important;\n  }\n}\n@media (max-width: 767.98px) {\n  .offcanvas-md {\n    position: fixed;\n    bottom: 0;\n    z-index: var(--bs-offcanvas-zindex);\n    display: flex;\n    flex-direction: column;\n    max-width: 100%;\n    color: var(--bs-offcanvas-color);\n    visibility: hidden;\n    background-color: var(--bs-offcanvas-bg);\n    background-clip: padding-box;\n    outline: 0;\n    transition: var(--bs-offcanvas-transition);\n  }\n}\n@media (max-width: 767.98px) and (prefers-reduced-motion: reduce) {\n  .offcanvas-md {\n    transition: none;\n  }\n}\n@media (max-width: 767.98px) {\n  .offcanvas-md.offcanvas-start {\n    top: 0;\n    left: 0;\n    width: var(--bs-offcanvas-width);\n    border-right: var(--bs-offcanvas-border-width) solid\n      var(--bs-offcanvas-border-color);\n    transform: translateX(-100%);\n  }\n  .offcanvas-md.offcanvas-end {\n    top: 0;\n    right: 0;\n    width: var(--bs-offcanvas-width);\n    border-left: var(--bs-offcanvas-border-width) solid\n      var(--bs-offcanvas-border-color);\n    transform: translateX(100%);\n  }\n  .offcanvas-md.offcanvas-top {\n    top: 0;\n    right: 0;\n    left: 0;\n    height: var(--bs-offcanvas-height);\n    max-height: 100%;\n    border-bottom: var(--bs-offcanvas-border-width) solid\n      var(--bs-offcanvas-border-color);\n    transform: translateY(-100%);\n  }\n  .offcanvas-md.offcanvas-bottom {\n    right: 0;\n    left: 0;\n    height: var(--bs-offcanvas-height);\n    max-height: 100%;\n    border-top: var(--bs-offcanvas-border-width) solid\n      var(--bs-offcanvas-border-color);\n    transform: translateY(100%);\n  }\n  .offcanvas-md.show:not(.hiding),\n  .offcanvas-md.showing {\n    transform: none;\n  }\n  .offcanvas-md.hiding,\n  .offcanvas-md.show,\n  .offcanvas-md.showing {\n    visibility: visible;\n  }\n}\n@media (min-width: 768px) {\n  .offcanvas-md {\n    --bs-offcanvas-height: auto;\n    --bs-offcanvas-border-width: 0;\n    background-color: transparent !important;\n  }\n  .offcanvas-md .offcanvas-header {\n    display: none;\n  }\n  .offcanvas-md .offcanvas-body {\n    display: flex;\n    flex-grow: 0;\n    padding: 0;\n    overflow-y: visible;\n    background-color: transparent !important;\n  }\n}\n@media (max-width: 991.98px) {\n  .offcanvas-lg {\n    position: fixed;\n    bottom: 0;\n    z-index: var(--bs-offcanvas-zindex);\n    display: flex;\n    flex-direction: column;\n    max-width: 100%;\n    color: var(--bs-offcanvas-color);\n    visibility: hidden;\n    background-color: var(--bs-offcanvas-bg);\n    background-clip: padding-box;\n    outline: 0;\n    transition: var(--bs-offcanvas-transition);\n  }\n}\n@media (max-width: 991.98px) and (prefers-reduced-motion: reduce) {\n  .offcanvas-lg {\n    transition: none;\n  }\n}\n@media (max-width: 991.98px) {\n  .offcanvas-lg.offcanvas-start {\n    top: 0;\n    left: 0;\n    width: var(--bs-offcanvas-width);\n    border-right: var(--bs-offcanvas-border-width) solid\n      var(--bs-offcanvas-border-color);\n    transform: translateX(-100%);\n  }\n  .offcanvas-lg.offcanvas-end {\n    top: 0;\n    right: 0;\n    width: var(--bs-offcanvas-width);\n    border-left: var(--bs-offcanvas-border-width) solid\n      var(--bs-offcanvas-border-color);\n    transform: translateX(100%);\n  }\n  .offcanvas-lg.offcanvas-top {\n    top: 0;\n    right: 0;\n    left: 0;\n    height: var(--bs-offcanvas-height);\n    max-height: 100%;\n    border-bottom: var(--bs-offcanvas-border-width) solid\n      var(--bs-offcanvas-border-color);\n    transform: translateY(-100%);\n  }\n  .offcanvas-lg.offcanvas-bottom {\n    right: 0;\n    left: 0;\n    height: var(--bs-offcanvas-height);\n    max-height: 100%;\n    border-top: var(--bs-offcanvas-border-width) solid\n      var(--bs-offcanvas-border-color);\n    transform: translateY(100%);\n  }\n  .offcanvas-lg.show:not(.hiding),\n  .offcanvas-lg.showing {\n    transform: none;\n  }\n  .offcanvas-lg.hiding,\n  .offcanvas-lg.show,\n  .offcanvas-lg.showing {\n    visibility: visible;\n  }\n}\n@media (min-width: 992px) {\n  .offcanvas-lg {\n    --bs-offcanvas-height: auto;\n    --bs-offcanvas-border-width: 0;\n    background-color: transparent !important;\n  }\n  .offcanvas-lg .offcanvas-header {\n    display: none;\n  }\n  .offcanvas-lg .offcanvas-body {\n    display: flex;\n    flex-grow: 0;\n    padding: 0;\n    overflow-y: visible;\n    background-color: transparent !important;\n  }\n}\n@media (max-width: 1199.98px) {\n  .offcanvas-xl {\n    position: fixed;\n    bottom: 0;\n    z-index: var(--bs-offcanvas-zindex);\n    display: flex;\n    flex-direction: column;\n    max-width: 100%;\n    color: var(--bs-offcanvas-color);\n    visibility: hidden;\n    background-color: var(--bs-offcanvas-bg);\n    background-clip: padding-box;\n    outline: 0;\n    transition: var(--bs-offcanvas-transition);\n  }\n}\n@media (max-width: 1199.98px) and (prefers-reduced-motion: reduce) {\n  .offcanvas-xl {\n    transition: none;\n  }\n}\n@media (max-width: 1199.98px) {\n  .offcanvas-xl.offcanvas-start {\n    top: 0;\n    left: 0;\n    width: var(--bs-offcanvas-width);\n    border-right: var(--bs-offcanvas-border-width) solid\n      var(--bs-offcanvas-border-color);\n    transform: translateX(-100%);\n  }\n  .offcanvas-xl.offcanvas-end {\n    top: 0;\n    right: 0;\n    width: var(--bs-offcanvas-width);\n    border-left: var(--bs-offcanvas-border-width) solid\n      var(--bs-offcanvas-border-color);\n    transform: translateX(100%);\n  }\n  .offcanvas-xl.offcanvas-top {\n    top: 0;\n    right: 0;\n    left: 0;\n    height: var(--bs-offcanvas-height);\n    max-height: 100%;\n    border-bottom: var(--bs-offcanvas-border-width) solid\n      var(--bs-offcanvas-border-color);\n    transform: translateY(-100%);\n  }\n  .offcanvas-xl.offcanvas-bottom {\n    right: 0;\n    left: 0;\n    height: var(--bs-offcanvas-height);\n    max-height: 100%;\n    border-top: var(--bs-offcanvas-border-width) solid\n      var(--bs-offcanvas-border-color);\n    transform: translateY(100%);\n  }\n  .offcanvas-xl.show:not(.hiding),\n  .offcanvas-xl.showing {\n    transform: none;\n  }\n  .offcanvas-xl.hiding,\n  .offcanvas-xl.show,\n  .offcanvas-xl.showing {\n    visibility: visible;\n  }\n}\n@media (min-width: 1200px) {\n  .offcanvas-xl {\n    --bs-offcanvas-height: auto;\n    --bs-offcanvas-border-width: 0;\n    background-color: transparent !important;\n  }\n  .offcanvas-xl .offcanvas-header {\n    display: none;\n  }\n  .offcanvas-xl .offcanvas-body {\n    display: flex;\n    flex-grow: 0;\n    padding: 0;\n    overflow-y: visible;\n    background-color: transparent !important;\n  }\n}\n@media (max-width: 1399.98px) {\n  .offcanvas-xxl {\n    position: fixed;\n    bottom: 0;\n    z-index: var(--bs-offcanvas-zindex);\n    display: flex;\n    flex-direction: column;\n    max-width: 100%;\n    color: var(--bs-offcanvas-color);\n    visibility: hidden;\n    background-color: var(--bs-offcanvas-bg);\n    background-clip: padding-box;\n    outline: 0;\n    transition: var(--bs-offcanvas-transition);\n  }\n}\n@media (max-width: 1399.98px) and (prefers-reduced-motion: reduce) {\n  .offcanvas-xxl {\n    transition: none;\n  }\n}\n@media (max-width: 1399.98px) {\n  .offcanvas-xxl.offcanvas-start {\n    top: 0;\n    left: 0;\n    width: var(--bs-offcanvas-width);\n    border-right: var(--bs-offcanvas-border-width) solid\n      var(--bs-offcanvas-border-color);\n    transform: translateX(-100%);\n  }\n  .offcanvas-xxl.offcanvas-end {\n    top: 0;\n    right: 0;\n    width: var(--bs-offcanvas-width);\n    border-left: var(--bs-offcanvas-border-width) solid\n      var(--bs-offcanvas-border-color);\n    transform: translateX(100%);\n  }\n  .offcanvas-xxl.offcanvas-top {\n    top: 0;\n    right: 0;\n    left: 0;\n    height: var(--bs-offcanvas-height);\n    max-height: 100%;\n    border-bottom: var(--bs-offcanvas-border-width) solid\n      var(--bs-offcanvas-border-color);\n    transform: translateY(-100%);\n  }\n  .offcanvas-xxl.offcanvas-bottom {\n    right: 0;\n    left: 0;\n    height: var(--bs-offcanvas-height);\n    max-height: 100%;\n    border-top: var(--bs-offcanvas-border-width) solid\n      var(--bs-offcanvas-border-color);\n    transform: translateY(100%);\n  }\n  .offcanvas-xxl.show:not(.hiding),\n  .offcanvas-xxl.showing {\n    transform: none;\n  }\n  .offcanvas-xxl.hiding,\n  .offcanvas-xxl.show,\n  .offcanvas-xxl.showing {\n    visibility: visible;\n  }\n}\n@media (min-width: 1400px) {\n  .offcanvas-xxl {\n    --bs-offcanvas-height: auto;\n    --bs-offcanvas-border-width: 0;\n    background-color: transparent !important;\n  }\n  .offcanvas-xxl .offcanvas-header {\n    display: none;\n  }\n  .offcanvas-xxl .offcanvas-body {\n    display: flex;\n    flex-grow: 0;\n    padding: 0;\n    overflow-y: visible;\n    background-color: transparent !important;\n  }\n}\n.offcanvas {\n  position: fixed;\n  bottom: 0;\n  z-index: var(--bs-offcanvas-zindex);\n  display: flex;\n  flex-direction: column;\n  max-width: 100%;\n  color: var(--bs-offcanvas-color);\n  visibility: hidden;\n  background-color: var(--bs-offcanvas-bg);\n  background-clip: padding-box;\n  outline: 0;\n  transition: var(--bs-offcanvas-transition);\n}\n@media (prefers-reduced-motion: reduce) {\n  .offcanvas {\n    transition: none;\n  }\n}\n.offcanvas.offcanvas-start {\n  top: 0;\n  left: 0;\n  width: var(--bs-offcanvas-width);\n  border-right: var(--bs-offcanvas-border-width) solid\n    var(--bs-offcanvas-border-color);\n  transform: translateX(-100%);\n}\n.offcanvas.offcanvas-end {\n  top: 0;\n  right: 0;\n  width: var(--bs-offcanvas-width);\n  border-left: var(--bs-offcanvas-border-width) solid\n    var(--bs-offcanvas-border-color);\n  transform: translateX(100%);\n}\n.offcanvas.offcanvas-top {\n  top: 0;\n  right: 0;\n  left: 0;\n  height: var(--bs-offcanvas-height);\n  max-height: 100%;\n  border-bottom: var(--bs-offcanvas-border-width) solid\n    var(--bs-offcanvas-border-color);\n  transform: translateY(-100%);\n}\n.offcanvas.offcanvas-bottom {\n  right: 0;\n  left: 0;\n  height: var(--bs-offcanvas-height);\n  max-height: 100%;\n  border-top: var(--bs-offcanvas-border-width) solid\n    var(--bs-offcanvas-border-color);\n  transform: translateY(100%);\n}\n.offcanvas.show:not(.hiding),\n.offcanvas.showing {\n  transform: none;\n}\n.offcanvas.hiding,\n.offcanvas.show,\n.offcanvas.showing {\n  visibility: visible;\n}\n.offcanvas-backdrop {\n  position: fixed;\n  top: 0;\n  left: 0;\n  z-index: 1040;\n  width: 100vw;\n  height: 100vh;\n  background-color: #000;\n}\n.offcanvas-backdrop.fade {\n  opacity: 0;\n}\n.offcanvas-backdrop.show {\n  opacity: 0.5;\n}\n.offcanvas-header {\n  display: flex;\n  align-items: center;\n  padding: var(--bs-offcanvas-padding-y) var(--bs-offcanvas-padding-x);\n}\n.offcanvas-header .btn-close {\n  padding: calc(var(--bs-offcanvas-padding-y) * 0.5)\n    calc(var(--bs-offcanvas-padding-x) * 0.5);\n  margin: calc(-0.5 * var(--bs-offcanvas-padding-y))\n    calc(-0.5 * var(--bs-offcanvas-padding-x))\n    calc(-0.5 * var(--bs-offcanvas-padding-y)) auto;\n}\n.offcanvas-title {\n  margin-bottom: 0;\n  line-height: var(--bs-offcanvas-title-line-height);\n}\n.offcanvas-body {\n  flex-grow: 1;\n  padding: var(--bs-offcanvas-padding-y) var(--bs-offcanvas-padding-x);\n  overflow-y: auto;\n}\n.placeholder {\n  display: inline-block;\n  min-height: 1em;\n  vertical-align: middle;\n  cursor: wait;\n  background-color: currentcolor;\n  opacity: 0.5;\n}\n.placeholder.btn::before {\n  display: inline-block;\n  content: \'\';\n}\n.placeholder-xs {\n  min-height: 0.6em;\n}\n.placeholder-sm {\n  min-height: 0.8em;\n}\n.placeholder-lg {\n  min-height: 1.2em;\n}\n.placeholder-glow .placeholder {\n  animation: placeholder-glow 2s ease-in-out infinite;\n}\n@keyframes placeholder-glow {\n  50% {\n    opacity: 0.2;\n  }\n}\n.placeholder-wave {\n  -webkit-mask-image: linear-gradient(\n    130deg,\n    #000 55%,\n    rgba(0, 0, 0, 0.8) 75%,\n    #000 95%\n  );\n  mask-image: linear-gradient(\n    130deg,\n    #000 55%,\n    rgba(0, 0, 0, 0.8) 75%,\n    #000 95%\n  );\n  -webkit-mask-size: 200% 100%;\n  mask-size: 200% 100%;\n  animation: placeholder-wave 2s linear infinite;\n}\n@keyframes placeholder-wave {\n  100% {\n    -webkit-mask-position: -200% 0%;\n    mask-position: -200% 0%;\n  }\n}\n.clearfix::after {\n  display: block;\n  clear: both;\n  content: \'\';\n}\n.text-bg-primary {\n  color: #fff !important;\n  background-color: RGBA(\n    var(--bs-primary-rgb),\n    var(--bs-bg-opacity, 1)\n  ) !important;\n}\n.text-bg-secondary {\n  color: #fff !important;\n  background-color: RGBA(\n    var(--bs-secondary-rgb),\n    var(--bs-bg-opacity, 1)\n  ) !important;\n}\n.text-bg-success {\n  color: #fff !important;\n  background-color: RGBA(\n    var(--bs-success-rgb),\n    var(--bs-bg-opacity, 1)\n  ) !important;\n}\n.text-bg-info {\n  color: #000 !important;\n  background-color: RGBA(\n    var(--bs-info-rgb),\n    var(--bs-bg-opacity, 1)\n  ) !important;\n}\n.text-bg-warning {\n  color: #000 !important;\n  background-color: RGBA(\n    var(--bs-warning-rgb),\n    var(--bs-bg-opacity, 1)\n  ) !important;\n}\n.text-bg-danger {\n  color: #fff !important;\n  background-color: RGBA(\n    var(--bs-danger-rgb),\n    var(--bs-bg-opacity, 1)\n  ) !important;\n}\n.text-bg-light {\n  color: #000 !important;\n  background-color: RGBA(\n    var(--bs-light-rgb),\n    var(--bs-bg-opacity, 1)\n  ) !important;\n}\n.text-bg-dark {\n  color: #fff !important;\n  background-color: RGBA(\n    var(--bs-dark-rgb),\n    var(--bs-bg-opacity, 1)\n  ) !important;\n}\n.link-primary {\n  color: RGBA(var(--bs-primary-rgb), var(--bs-link-opacity, 1)) !important;\n  -webkit-text-decoration-color: RGBA(\n    var(--bs-primary-rgb),\n    var(--bs-link-underline-opacity, 1)\n  ) !important;\n  text-decoration-color: RGBA(\n    var(--bs-primary-rgb),\n    var(--bs-link-underline-opacity, 1)\n  ) !important;\n}\n.link-primary:focus,\n.link-primary:hover {\n  color: RGBA(10, 88, 202, var(--bs-link-opacity, 1)) !important;\n  -webkit-text-decoration-color: RGBA(\n    10,\n    88,\n    202,\n    var(--bs-link-underline-opacity, 1)\n  ) !important;\n  text-decoration-color: RGBA(\n    10,\n    88,\n    202,\n    var(--bs-link-underline-opacity, 1)\n  ) !important;\n}\n.link-secondary {\n  color: RGBA(var(--bs-secondary-rgb), var(--bs-link-opacity, 1)) !important;\n  -webkit-text-decoration-color: RGBA(\n    var(--bs-secondary-rgb),\n    var(--bs-link-underline-opacity, 1)\n  ) !important;\n  text-decoration-color: RGBA(\n    var(--bs-secondary-rgb),\n    var(--bs-link-underline-opacity, 1)\n  ) !important;\n}\n.link-secondary:focus,\n.link-secondary:hover {\n  color: RGBA(86, 94, 100, var(--bs-link-opacity, 1)) !important;\n  -webkit-text-decoration-color: RGBA(\n    86,\n    94,\n    100,\n    var(--bs-link-underline-opacity, 1)\n  ) !important;\n  text-decoration-color: RGBA(\n    86,\n    94,\n    100,\n    var(--bs-link-underline-opacity, 1)\n  ) !important;\n}\n.link-success {\n  color: RGBA(var(--bs-success-rgb), var(--bs-link-opacity, 1)) !important;\n  -webkit-text-decoration-color: RGBA(\n    var(--bs-success-rgb),\n    var(--bs-link-underline-opacity, 1)\n  ) !important;\n  text-decoration-color: RGBA(\n    var(--bs-success-rgb),\n    var(--bs-link-underline-opacity, 1)\n  ) !important;\n}\n.link-success:focus,\n.link-success:hover {\n  color: RGBA(20, 108, 67, var(--bs-link-opacity, 1)) !important;\n  -webkit-text-decoration-color: RGBA(\n    20,\n    108,\n    67,\n    var(--bs-link-underline-opacity, 1)\n  ) !important;\n  text-decoration-color: RGBA(\n    20,\n    108,\n    67,\n    var(--bs-link-underline-opacity, 1)\n  ) !important;\n}\n.link-info {\n  color: RGBA(var(--bs-info-rgb), var(--bs-link-opacity, 1)) !important;\n  -webkit-text-decoration-color: RGBA(\n    var(--bs-info-rgb),\n    var(--bs-link-underline-opacity, 1)\n  ) !important;\n  text-decoration-color: RGBA(\n    var(--bs-info-rgb),\n    var(--bs-link-underline-opacity, 1)\n  ) !important;\n}\n.link-info:focus,\n.link-info:hover {\n  color: RGBA(61, 213, 243, var(--bs-link-opacity, 1)) !important;\n  -webkit-text-decoration-color: RGBA(\n    61,\n    213,\n    243,\n    var(--bs-link-underline-opacity, 1)\n  ) !important;\n  text-decoration-color: RGBA(\n    61,\n    213,\n    243,\n    var(--bs-link-underline-opacity, 1)\n  ) !important;\n}\n.link-warning {\n  color: RGBA(var(--bs-warning-rgb), var(--bs-link-opacity, 1)) !important;\n  -webkit-text-decoration-color: RGBA(\n    var(--bs-warning-rgb),\n    var(--bs-link-underline-opacity, 1)\n  ) !important;\n  text-decoration-color: RGBA(\n    var(--bs-warning-rgb),\n    var(--bs-link-underline-opacity, 1)\n  ) !important;\n}\n.link-warning:focus,\n.link-warning:hover {\n  color: RGBA(255, 205, 57, var(--bs-link-opacity, 1)) !important;\n  -webkit-text-decoration-color: RGBA(\n    255,\n    205,\n    57,\n    var(--bs-link-underline-opacity, 1)\n  ) !important;\n  text-decoration-color: RGBA(\n    255,\n    205,\n    57,\n    var(--bs-link-underline-opacity, 1)\n  ) !important;\n}\n.link-danger {\n  color: RGBA(var(--bs-danger-rgb), var(--bs-link-opacity, 1)) !important;\n  -webkit-text-decoration-color: RGBA(\n    var(--bs-danger-rgb),\n    var(--bs-link-underline-opacity, 1)\n  ) !important;\n  text-decoration-color: RGBA(\n    var(--bs-danger-rgb),\n    var(--bs-link-underline-opacity, 1)\n  ) !important;\n}\n.link-danger:focus,\n.link-danger:hover {\n  color: RGBA(176, 42, 55, var(--bs-link-opacity, 1)) !important;\n  -webkit-text-decoration-color: RGBA(\n    176,\n    42,\n    55,\n    var(--bs-link-underline-opacity, 1)\n  ) !important;\n  text-decoration-color: RGBA(\n    176,\n    42,\n    55,\n    var(--bs-link-underline-opacity, 1)\n  ) !important;\n}\n.link-light {\n  color: RGBA(var(--bs-light-rgb), var(--bs-link-opacity, 1)) !important;\n  -webkit-text-decoration-color: RGBA(\n    var(--bs-light-rgb),\n    var(--bs-link-underline-opacity, 1)\n  ) !important;\n  text-decoration-color: RGBA(\n    var(--bs-light-rgb),\n    var(--bs-link-underline-opacity, 1)\n  ) !important;\n}\n.link-light:focus,\n.link-light:hover {\n  color: RGBA(249, 250, 251, var(--bs-link-opacity, 1)) !important;\n  -webkit-text-decoration-color: RGBA(\n    249,\n    250,\n    251,\n    var(--bs-link-underline-opacity, 1)\n  ) !important;\n  text-decoration-color: RGBA(\n    249,\n    250,\n    251,\n    var(--bs-link-underline-opacity, 1)\n  ) !important;\n}\n.link-dark {\n  color: RGBA(var(--bs-dark-rgb), var(--bs-link-opacity, 1)) !important;\n  -webkit-text-decoration-color: RGBA(\n    var(--bs-dark-rgb),\n    var(--bs-link-underline-opacity, 1)\n  ) !important;\n  text-decoration-color: RGBA(\n    var(--bs-dark-rgb),\n    var(--bs-link-underline-opacity, 1)\n  ) !important;\n}\n.link-dark:focus,\n.link-dark:hover {\n  color: RGBA(26, 30, 33, var(--bs-link-opacity, 1)) !important;\n  -webkit-text-decoration-color: RGBA(\n    26,\n    30,\n    33,\n    var(--bs-link-underline-opacity, 1)\n  ) !important;\n  text-decoration-color: RGBA(\n    26,\n    30,\n    33,\n    var(--bs-link-underline-opacity, 1)\n  ) !important;\n}\n.link-body-emphasis {\n  color: RGBA(\n    var(--bs-emphasis-color-rgb),\n    var(--bs-link-opacity, 1)\n  ) !important;\n  -webkit-text-decoration-color: RGBA(\n    var(--bs-emphasis-color-rgb),\n    var(--bs-link-underline-opacity, 1)\n  ) !important;\n  text-decoration-color: RGBA(\n    var(--bs-emphasis-color-rgb),\n    var(--bs-link-underline-opacity, 1)\n  ) !important;\n}\n.link-body-emphasis:focus,\n.link-body-emphasis:hover {\n  color: RGBA(\n    var(--bs-emphasis-color-rgb),\n    var(--bs-link-opacity, 0.75)\n  ) !important;\n  -webkit-text-decoration-color: RGBA(\n    var(--bs-emphasis-color-rgb),\n    var(--bs-link-underline-opacity, 0.75)\n  ) !important;\n  text-decoration-color: RGBA(\n    var(--bs-emphasis-color-rgb),\n    var(--bs-link-underline-opacity, 0.75)\n  ) !important;\n}\n.focus-ring:focus {\n  outline: 0;\n  box-shadow: var(--bs-focus-ring-x, 0) var(--bs-focus-ring-y, 0)\n    var(--bs-focus-ring-blur, 0) var(--bs-focus-ring-width)\n    var(--bs-focus-ring-color);\n}\n.icon-link {\n  display: inline-flex;\n  gap: 0.375rem;\n  align-items: center;\n  -webkit-text-decoration-color: rgba(\n    var(--bs-link-color-rgb),\n    var(--bs-link-opacity, 0.5)\n  );\n  text-decoration-color: rgba(\n    var(--bs-link-color-rgb),\n    var(--bs-link-opacity, 0.5)\n  );\n  text-underline-offset: 0.25em;\n  -webkit-backface-visibility: hidden;\n  backface-visibility: hidden;\n}\n.icon-link > .bi {\n  flex-shrink: 0;\n  width: 1em;\n  height: 1em;\n  fill: currentcolor;\n  transition: 0.2s ease-in-out transform;\n}\n@media (prefers-reduced-motion: reduce) {\n  .icon-link > .bi {\n    transition: none;\n  }\n}\n.icon-link-hover:focus-visible > .bi,\n.icon-link-hover:hover > .bi {\n  transform: var(--bs-icon-link-transform, translate3d(0.25em, 0, 0));\n}\n.ratio {\n  position: relative;\n  width: 100%;\n}\n.ratio::before {\n  display: block;\n  padding-top: var(--bs-aspect-ratio);\n  content: \'\';\n}\n.ratio > * {\n  position: absolute;\n  top: 0;\n  left: 0;\n  width: 100%;\n  height: 100%;\n}\n.ratio-1x1 {\n  --bs-aspect-ratio: 100%;\n}\n.ratio-4x3 {\n  --bs-aspect-ratio: 75%;\n}\n.ratio-16x9 {\n  --bs-aspect-ratio: 56.25%;\n}\n.ratio-21x9 {\n  --bs-aspect-ratio: 42.8571428571%;\n}\n.fixed-top {\n  position: fixed;\n  top: 0;\n  right: 0;\n  left: 0;\n  z-index: 1030;\n}\n.fixed-bottom {\n  position: fixed;\n  right: 0;\n  bottom: 0;\n  left: 0;\n  z-index: 1030;\n}\n.sticky-top {\n  position: -webkit-sticky;\n  position: sticky;\n  top: 0;\n  z-index: 1020;\n}\n.sticky-bottom {\n  position: -webkit-sticky;\n  position: sticky;\n  bottom: 0;\n  z-index: 1020;\n}\n@media (min-width: 576px) {\n  .sticky-sm-top {\n    position: -webkit-sticky;\n    position: sticky;\n    top: 0;\n    z-index: 1020;\n  }\n  .sticky-sm-bottom {\n    position: -webkit-sticky;\n    position: sticky;\n    bottom: 0;\n    z-index: 1020;\n  }\n}\n@media (min-width: 768px) {\n  .sticky-md-top {\n    position: -webkit-sticky;\n    position: sticky;\n    top: 0;\n    z-index: 1020;\n  }\n  .sticky-md-bottom {\n    position: -webkit-sticky;\n    position: sticky;\n    bottom: 0;\n    z-index: 1020;\n  }\n}\n@media (min-width: 992px) {\n  .sticky-lg-top {\n    position: -webkit-sticky;\n    position: sticky;\n    top: 0;\n    z-index: 1020;\n  }\n  .sticky-lg-bottom {\n    position: -webkit-sticky;\n    position: sticky;\n    bottom: 0;\n    z-index: 1020;\n  }\n}\n@media (min-width: 1200px) {\n  .sticky-xl-top {\n    position: -webkit-sticky;\n    position: sticky;\n    top: 0;\n    z-index: 1020;\n  }\n  .sticky-xl-bottom {\n    position: -webkit-sticky;\n    position: sticky;\n    bottom: 0;\n    z-index: 1020;\n  }\n}\n@media (min-width: 1400px) {\n  .sticky-xxl-top {\n    position: -webkit-sticky;\n    position: sticky;\n    top: 0;\n    z-index: 1020;\n  }\n  .sticky-xxl-bottom {\n    position: -webkit-sticky;\n    position: sticky;\n    bottom: 0;\n    z-index: 1020;\n  }\n}\n.hstack {\n  display: flex;\n  flex-direction: row;\n  align-items: center;\n  align-self: stretch;\n}\n.vstack {\n  display: flex;\n  flex: 1 1 auto;\n  flex-direction: column;\n  align-self: stretch;\n}\n.visually-hidden,\n.visually-hidden-focusable:not(:focus):not(:focus-within) {\n  width: 1px !important;\n  height: 1px !important;\n  padding: 0 !important;\n  margin: -1px !important;\n  overflow: hidden !important;\n  clip: rect(0, 0, 0, 0) !important;\n  white-space: nowrap !important;\n  border: 0 !important;\n}\n.visually-hidden-focusable:not(:focus):not(:focus-within):not(caption),\n.visually-hidden:not(caption) {\n  position: absolute !important;\n}\n.stretched-link::after {\n  position: absolute;\n  top: 0;\n  right: 0;\n  bottom: 0;\n  left: 0;\n  z-index: 1;\n  content: \'\';\n}\n.text-truncate {\n  overflow: hidden;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n}\n.vr {\n  display: inline-block;\n  align-self: stretch;\n  width: var(--bs-border-width);\n  min-height: 1em;\n  background-color: currentcolor;\n  opacity: 0.25;\n}\n.align-baseline {\n  vertical-align: baseline !important;\n}\n.align-top {\n  vertical-align: top !important;\n}\n.align-middle {\n  vertical-align: middle !important;\n}\n.align-bottom {\n  vertical-align: bottom !important;\n}\n.align-text-bottom {\n  vertical-align: text-bottom !important;\n}\n.align-text-top {\n  vertical-align: text-top !important;\n}\n.float-start {\n  float: left !important;\n}\n.float-end {\n  float: right !important;\n}\n.float-none {\n  float: none !important;\n}\n.object-fit-contain {\n  -o-object-fit: contain !important;\n  object-fit: contain !important;\n}\n.object-fit-cover {\n  -o-object-fit: cover !important;\n  object-fit: cover !important;\n}\n.object-fit-fill {\n  -o-object-fit: fill !important;\n  object-fit: fill !important;\n}\n.object-fit-scale {\n  -o-object-fit: scale-down !important;\n  object-fit: scale-down !important;\n}\n.object-fit-none {\n  -o-object-fit: none !important;\n  object-fit: none !important;\n}\n.opacity-0 {\n  opacity: 0 !important;\n}\n.opacity-25 {\n  opacity: 0.25 !important;\n}\n.opacity-50 {\n  opacity: 0.5 !important;\n}\n.opacity-75 {\n  opacity: 0.75 !important;\n}\n.opacity-100 {\n  opacity: 1 !important;\n}\n.overflow-auto {\n  overflow: auto !important;\n}\n.overflow-hidden {\n  overflow: hidden !important;\n}\n.overflow-visible {\n  overflow: visible !important;\n}\n.overflow-scroll {\n  overflow: scroll !important;\n}\n.overflow-x-auto {\n  overflow-x: auto !important;\n}\n.overflow-x-hidden {\n  overflow-x: hidden !important;\n}\n.overflow-x-visible {\n  overflow-x: visible !important;\n}\n.overflow-x-scroll {\n  overflow-x: scroll !important;\n}\n.overflow-y-auto {\n  overflow-y: auto !important;\n}\n.overflow-y-hidden {\n  overflow-y: hidden !important;\n}\n.overflow-y-visible {\n  overflow-y: visible !important;\n}\n.overflow-y-scroll {\n  overflow-y: scroll !important;\n}\n.d-inline {\n  display: inline !important;\n}\n.d-inline-block {\n  display: inline-block !important;\n}\n.d-block {\n  display: block !important;\n}\n.d-grid {\n  display: grid !important;\n}\n.d-inline-grid {\n  display: inline-grid !important;\n}\n.d-table {\n  display: table !important;\n}\n.d-table-row {\n  display: table-row !important;\n}\n.d-table-cell {\n  display: table-cell !important;\n}\n.d-flex {\n  display: flex !important;\n}\n.d-inline-flex {\n  display: inline-flex !important;\n}\n.d-none {\n  display: none !important;\n}\n.shadow {\n  box-shadow: var(--bs-box-shadow) !important;\n}\n.shadow-sm {\n  box-shadow: var(--bs-box-shadow-sm) !important;\n}\n.shadow-lg {\n  box-shadow: var(--bs-box-shadow-lg) !important;\n}\n.shadow-none {\n  box-shadow: none !important;\n}\n.focus-ring-primary {\n  --bs-focus-ring-color: rgba(\n    var(--bs-primary-rgb),\n    var(--bs-focus-ring-opacity)\n  );\n}\n.focus-ring-secondary {\n  --bs-focus-ring-color: rgba(\n    var(--bs-secondary-rgb),\n    var(--bs-focus-ring-opacity)\n  );\n}\n.focus-ring-success {\n  --bs-focus-ring-color: rgba(\n    var(--bs-success-rgb),\n    var(--bs-focus-ring-opacity)\n  );\n}\n.focus-ring-info {\n  --bs-focus-ring-color: rgba(var(--bs-info-rgb), var(--bs-focus-ring-opacity));\n}\n.focus-ring-warning {\n  --bs-focus-ring-color: rgba(\n    var(--bs-warning-rgb),\n    var(--bs-focus-ring-opacity)\n  );\n}\n.focus-ring-danger {\n  --bs-focus-ring-color: rgba(\n    var(--bs-danger-rgb),\n    var(--bs-focus-ring-opacity)\n  );\n}\n.focus-ring-light {\n  --bs-focus-ring-color: rgba(\n    var(--bs-light-rgb),\n    var(--bs-focus-ring-opacity)\n  );\n}\n.focus-ring-dark {\n  --bs-focus-ring-color: rgba(var(--bs-dark-rgb), var(--bs-focus-ring-opacity));\n}\n.position-static {\n  position: static !important;\n}\n.position-relative {\n  position: relative !important;\n}\n.position-absolute {\n  position: absolute !important;\n}\n.position-fixed {\n  position: fixed !important;\n}\n.position-sticky {\n  position: -webkit-sticky !important;\n  position: sticky !important;\n}\n.top-0 {\n  top: 0 !important;\n}\n.top-50 {\n  top: 50% !important;\n}\n.top-100 {\n  top: 100% !important;\n}\n.bottom-0 {\n  bottom: 0 !important;\n}\n.bottom-50 {\n  bottom: 50% !important;\n}\n.bottom-100 {\n  bottom: 100% !important;\n}\n.start-0 {\n  left: 0 !important;\n}\n.start-50 {\n  left: 50% !important;\n}\n.start-100 {\n  left: 100% !important;\n}\n.end-0 {\n  right: 0 !important;\n}\n.end-50 {\n  right: 50% !important;\n}\n.end-100 {\n  right: 100% !important;\n}\n.translate-middle {\n  transform: translate(-50%, -50%) !important;\n}\n.translate-middle-x {\n  transform: translateX(-50%) !important;\n}\n.translate-middle-y {\n  transform: translateY(-50%) !important;\n}\n.border {\n  border: var(--bs-border-width) var(--bs-border-style) var(--bs-border-color) !important;\n}\n.border-0 {\n  border: 0 !important;\n}\n.border-top {\n  border-top: var(--bs-border-width) var(--bs-border-style)\n    var(--bs-border-color) !important;\n}\n.border-top-0 {\n  border-top: 0 !important;\n}\n.border-end {\n  border-right: var(--bs-border-width) var(--bs-border-style)\n    var(--bs-border-color) !important;\n}\n.border-end-0 {\n  border-right: 0 !important;\n}\n.border-bottom {\n  border-bottom: var(--bs-border-width) var(--bs-border-style)\n    var(--bs-border-color) !important;\n}\n.border-bottom-0 {\n  border-bottom: 0 !important;\n}\n.border-start {\n  border-left: var(--bs-border-width) var(--bs-border-style)\n    var(--bs-border-color) !important;\n}\n.border-start-0 {\n  border-left: 0 !important;\n}\n.border-primary {\n  --bs-border-opacity: 1;\n  border-color: rgba(\n    var(--bs-primary-rgb),\n    var(--bs-border-opacity)\n  ) !important;\n}\n.border-secondary {\n  --bs-border-opacity: 1;\n  border-color: rgba(\n    var(--bs-secondary-rgb),\n    var(--bs-border-opacity)\n  ) !important;\n}\n.border-success {\n  --bs-border-opacity: 1;\n  border-color: rgba(\n    var(--bs-success-rgb),\n    var(--bs-border-opacity)\n  ) !important;\n}\n.border-info {\n  --bs-border-opacity: 1;\n  border-color: rgba(var(--bs-info-rgb), var(--bs-border-opacity)) !important;\n}\n.border-warning {\n  --bs-border-opacity: 1;\n  border-color: rgba(\n    var(--bs-warning-rgb),\n    var(--bs-border-opacity)\n  ) !important;\n}\n.border-danger {\n  --bs-border-opacity: 1;\n  border-color: rgba(var(--bs-danger-rgb), var(--bs-border-opacity)) !important;\n}\n.border-light {\n  --bs-border-opacity: 1;\n  border-color: rgba(var(--bs-light-rgb), var(--bs-border-opacity)) !important;\n}\n.border-dark {\n  --bs-border-opacity: 1;\n  border-color: rgba(var(--bs-dark-rgb), var(--bs-border-opacity)) !important;\n}\n.border-black {\n  --bs-border-opacity: 1;\n  border-color: rgba(var(--bs-black-rgb), var(--bs-border-opacity)) !important;\n}\n.border-white {\n  --bs-border-opacity: 1;\n  border-color: rgba(var(--bs-white-rgb), var(--bs-border-opacity)) !important;\n}\n.border-primary-subtle {\n  border-color: var(--bs-primary-border-subtle) !important;\n}\n.border-secondary-subtle {\n  border-color: var(--bs-secondary-border-subtle) !important;\n}\n.border-success-subtle {\n  border-color: var(--bs-success-border-subtle) !important;\n}\n.border-info-subtle {\n  border-color: var(--bs-info-border-subtle) !important;\n}\n.border-warning-subtle {\n  border-color: var(--bs-warning-border-subtle) !important;\n}\n.border-danger-subtle {\n  border-color: var(--bs-danger-border-subtle) !important;\n}\n.border-light-subtle {\n  border-color: var(--bs-light-border-subtle) !important;\n}\n.border-dark-subtle {\n  border-color: var(--bs-dark-border-subtle) !important;\n}\n.border-1 {\n  border-width: 1px !important;\n}\n.border-2 {\n  border-width: 2px !important;\n}\n.border-3 {\n  border-width: 3px !important;\n}\n.border-4 {\n  border-width: 4px !important;\n}\n.border-5 {\n  border-width: 5px !important;\n}\n.border-opacity-10 {\n  --bs-border-opacity: 0.1;\n}\n.border-opacity-25 {\n  --bs-border-opacity: 0.25;\n}\n.border-opacity-50 {\n  --bs-border-opacity: 0.5;\n}\n.border-opacity-75 {\n  --bs-border-opacity: 0.75;\n}\n.border-opacity-100 {\n  --bs-border-opacity: 1;\n}\n.w-25 {\n  width: 25% !important;\n}\n.w-50 {\n  width: 50% !important;\n}\n.w-75 {\n  width: 75% !important;\n}\n.w-100 {\n  width: 100% !important;\n}\n.w-auto {\n  width: auto !important;\n}\n.mw-100 {\n  max-width: 100% !important;\n}\n.vw-100 {\n  width: 100vw !important;\n}\n.min-vw-100 {\n  min-width: 100vw !important;\n}\n.h-25 {\n  height: 25% !important;\n}\n.h-50 {\n  height: 50% !important;\n}\n.h-75 {\n  height: 75% !important;\n}\n.h-100 {\n  height: 100% !important;\n}\n.h-auto {\n  height: auto !important;\n}\n.mh-100 {\n  max-height: 100% !important;\n}\n.vh-100 {\n  height: 100vh !important;\n}\n.min-vh-100 {\n  min-height: 100vh !important;\n}\n.flex-fill {\n  flex: 1 1 auto !important;\n}\n.flex-row {\n  flex-direction: row !important;\n}\n.flex-column {\n  flex-direction: column !important;\n}\n.flex-row-reverse {\n  flex-direction: row-reverse !important;\n}\n.flex-column-reverse {\n  flex-direction: column-reverse !important;\n}\n.flex-grow-0 {\n  flex-grow: 0 !important;\n}\n.flex-grow-1 {\n  flex-grow: 1 !important;\n}\n.flex-shrink-0 {\n  flex-shrink: 0 !important;\n}\n.flex-shrink-1 {\n  flex-shrink: 1 !important;\n}\n.flex-wrap {\n  flex-wrap: wrap !important;\n}\n.flex-nowrap {\n  flex-wrap: nowrap !important;\n}\n.flex-wrap-reverse {\n  flex-wrap: wrap-reverse !important;\n}\n.justify-content-start {\n  justify-content: flex-start !important;\n}\n.justify-content-end {\n  justify-content: flex-end !important;\n}\n.justify-content-center {\n  justify-content: center !important;\n}\n.justify-content-between {\n  justify-content: space-between !important;\n}\n.justify-content-around {\n  justify-content: space-around !important;\n}\n.justify-content-evenly {\n  justify-content: space-evenly !important;\n}\n.align-items-start {\n  align-items: flex-start !important;\n}\n.align-items-end {\n  align-items: flex-end !important;\n}\n.align-items-center {\n  align-items: center !important;\n}\n.align-items-baseline {\n  align-items: baseline !important;\n}\n.align-items-stretch {\n  align-items: stretch !important;\n}\n.align-content-start {\n  align-content: flex-start !important;\n}\n.align-content-end {\n  align-content: flex-end !important;\n}\n.align-content-center {\n  align-content: center !important;\n}\n.align-content-between {\n  align-content: space-between !important;\n}\n.align-content-around {\n  align-content: space-around !important;\n}\n.align-content-stretch {\n  align-content: stretch !important;\n}\n.align-self-auto {\n  align-self: auto !important;\n}\n.align-self-start {\n  align-self: flex-start !important;\n}\n.align-self-end {\n  align-self: flex-end !important;\n}\n.align-self-center {\n  align-self: center !important;\n}\n.align-self-baseline {\n  align-self: baseline !important;\n}\n.align-self-stretch {\n  align-self: stretch !important;\n}\n.order-first {\n  order: -1 !important;\n}\n.order-0 {\n  order: 0 !important;\n}\n.order-1 {\n  order: 1 !important;\n}\n.order-2 {\n  order: 2 !important;\n}\n.order-3 {\n  order: 3 !important;\n}\n.order-4 {\n  order: 4 !important;\n}\n.order-5 {\n  order: 5 !important;\n}\n.order-last {\n  order: 6 !important;\n}\n.m-0 {\n  margin: 0 !important;\n}\n.m-1 {\n  margin: 0.25rem !important;\n}\n.m-2 {\n  margin: 0.5rem !important;\n}\n.m-3 {\n  margin: 1rem !important;\n}\n.m-4 {\n  margin: 1.5rem !important;\n}\n.m-5 {\n  margin: 3rem !important;\n}\n.m-auto {\n  margin: auto !important;\n}\n.mx-0 {\n  margin-right: 0 !important;\n  margin-left: 0 !important;\n}\n.mx-1 {\n  margin-right: 0.25rem !important;\n  margin-left: 0.25rem !important;\n}\n.mx-2 {\n  margin-right: 0.5rem !important;\n  margin-left: 0.5rem !important;\n}\n.mx-3 {\n  margin-right: 1rem !important;\n  margin-left: 1rem !important;\n}\n.mx-4 {\n  margin-right: 1.5rem !important;\n  margin-left: 1.5rem !important;\n}\n.mx-5 {\n  margin-right: 3rem !important;\n  margin-left: 3rem !important;\n}\n.mx-auto {\n  margin-right: auto !important;\n  margin-left: auto !important;\n}\n.my-0 {\n  margin-top: 0 !important;\n  margin-bottom: 0 !important;\n}\n.my-1 {\n  margin-top: 0.25rem !important;\n  margin-bottom: 0.25rem !important;\n}\n.my-2 {\n  margin-top: 0.5rem !important;\n  margin-bottom: 0.5rem !important;\n}\n.my-3 {\n  margin-top: 1rem !important;\n  margin-bottom: 1rem !important;\n}\n.my-4 {\n  margin-top: 1.5rem !important;\n  margin-bottom: 1.5rem !important;\n}\n.my-5 {\n  margin-top: 3rem !important;\n  margin-bottom: 3rem !important;\n}\n.my-auto {\n  margin-top: auto !important;\n  margin-bottom: auto !important;\n}\n.mt-0 {\n  margin-top: 0 !important;\n}\n.mt-1 {\n  margin-top: 0.25rem !important;\n}\n.mt-2 {\n  margin-top: 0.5rem !important;\n}\n.mt-3 {\n  margin-top: 1rem !important;\n}\n.mt-4 {\n  margin-top: 1.5rem !important;\n}\n.mt-5 {\n  margin-top: 3rem !important;\n}\n.mt-auto {\n  margin-top: auto !important;\n}\n.me-0 {\n  margin-right: 0 !important;\n}\n.me-1 {\n  margin-right: 0.25rem !important;\n}\n.me-2 {\n  margin-right: 0.5rem !important;\n}\n.me-3 {\n  margin-right: 1rem !important;\n}\n.me-4 {\n  margin-right: 1.5rem !important;\n}\n.me-5 {\n  margin-right: 3rem !important;\n}\n.me-auto {\n  margin-right: auto !important;\n}\n.mb-0 {\n  margin-bottom: 0 !important;\n}\n.mb-1 {\n  margin-bottom: 0.25rem !important;\n}\n.mb-2 {\n  margin-bottom: 0.5rem !important;\n}\n.mb-3 {\n  margin-bottom: 1rem !important;\n}\n.mb-4 {\n  margin-bottom: 1.5rem !important;\n}\n.mb-5 {\n  margin-bottom: 3rem !important;\n}\n.mb-auto {\n  margin-bottom: auto !important;\n}\n.ms-0 {\n  margin-left: 0 !important;\n}\n.ms-1 {\n  margin-left: 0.25rem !important;\n}\n.ms-2 {\n  margin-left: 0.5rem !important;\n}\n.ms-3 {\n  margin-left: 1rem !important;\n}\n.ms-4 {\n  margin-left: 1.5rem !important;\n}\n.ms-5 {\n  margin-left: 3rem !important;\n}\n.ms-auto {\n  margin-left: auto !important;\n}\n.p-0 {\n  padding: 0 !important;\n}\n.p-1 {\n  padding: 0.25rem !important;\n}\n.p-2 {\n  padding: 0.5rem !important;\n}\n.p-3 {\n  padding: 1rem !important;\n}\n.p-4 {\n  padding: 1.5rem !important;\n}\n.p-5 {\n  padding: 3rem !important;\n}\n.px-0 {\n  padding-right: 0 !important;\n  padding-left: 0 !important;\n}\n.px-1 {\n  padding-right: 0.25rem !important;\n  padding-left: 0.25rem !important;\n}\n.px-2 {\n  padding-right: 0.5rem !important;\n  padding-left: 0.5rem !important;\n}\n.px-3 {\n  padding-right: 1rem !important;\n  padding-left: 1rem !important;\n}\n.px-4 {\n  padding-right: 1.5rem !important;\n  padding-left: 1.5rem !important;\n}\n.px-5 {\n  padding-right: 3rem !important;\n  padding-left: 3rem !important;\n}\n.py-0 {\n  padding-top: 0 !important;\n  padding-bottom: 0 !important;\n}\n.py-1 {\n  padding-top: 0.25rem !important;\n  padding-bottom: 0.25rem !important;\n}\n.py-2 {\n  padding-top: 0.5rem !important;\n  padding-bottom: 0.5rem !important;\n}\n.py-3 {\n  padding-top: 1rem !important;\n  padding-bottom: 1rem !important;\n}\n.py-4 {\n  padding-top: 1.5rem !important;\n  padding-bottom: 1.5rem !important;\n}\n.py-5 {\n  padding-top: 3rem !important;\n  padding-bottom: 3rem !important;\n}\n.pt-0 {\n  padding-top: 0 !important;\n}\n.pt-1 {\n  padding-top: 0.25rem !important;\n}\n.pt-2 {\n  padding-top: 0.5rem !important;\n}\n.pt-3 {\n  padding-top: 1rem !important;\n}\n.pt-4 {\n  padding-top: 1.5rem !important;\n}\n.pt-5 {\n  padding-top: 3rem !important;\n}\n.pe-0 {\n  padding-right: 0 !important;\n}\n.pe-1 {\n  padding-right: 0.25rem !important;\n}\n.pe-2 {\n  padding-right: 0.5rem !important;\n}\n.pe-3 {\n  padding-right: 1rem !important;\n}\n.pe-4 {\n  padding-right: 1.5rem !important;\n}\n.pe-5 {\n  padding-right: 3rem !important;\n}\n.pb-0 {\n  padding-bottom: 0 !important;\n}\n.pb-1 {\n  padding-bottom: 0.25rem !important;\n}\n.pb-2 {\n  padding-bottom: 0.5rem !important;\n}\n.pb-3 {\n  padding-bottom: 1rem !important;\n}\n.pb-4 {\n  padding-bottom: 1.5rem !important;\n}\n.pb-5 {\n  padding-bottom: 3rem !important;\n}\n.ps-0 {\n  padding-left: 0 !important;\n}\n.ps-1 {\n  padding-left: 0.25rem !important;\n}\n.ps-2 {\n  padding-left: 0.5rem !important;\n}\n.ps-3 {\n  padding-left: 1rem !important;\n}\n.ps-4 {\n  padding-left: 1.5rem !important;\n}\n.ps-5 {\n  padding-left: 3rem !important;\n}\n.gap-0 {\n  gap: 0 !important;\n}\n.gap-1 {\n  gap: 0.25rem !important;\n}\n.gap-2 {\n  gap: 0.5rem !important;\n}\n.gap-3 {\n  gap: 1rem !important;\n}\n.gap-4 {\n  gap: 1.5rem !important;\n}\n.gap-5 {\n  gap: 3rem !important;\n}\n.row-gap-0 {\n  row-gap: 0 !important;\n}\n.row-gap-1 {\n  row-gap: 0.25rem !important;\n}\n.row-gap-2 {\n  row-gap: 0.5rem !important;\n}\n.row-gap-3 {\n  row-gap: 1rem !important;\n}\n.row-gap-4 {\n  row-gap: 1.5rem !important;\n}\n.row-gap-5 {\n  row-gap: 3rem !important;\n}\n.column-gap-0 {\n  -moz-column-gap: 0 !important;\n  column-gap: 0 !important;\n}\n.column-gap-1 {\n  -moz-column-gap: 0.25rem !important;\n  column-gap: 0.25rem !important;\n}\n.column-gap-2 {\n  -moz-column-gap: 0.5rem !important;\n  column-gap: 0.5rem !important;\n}\n.column-gap-3 {\n  -moz-column-gap: 1rem !important;\n  column-gap: 1rem !important;\n}\n.column-gap-4 {\n  -moz-column-gap: 1.5rem !important;\n  column-gap: 1.5rem !important;\n}\n.column-gap-5 {\n  -moz-column-gap: 3rem !important;\n  column-gap: 3rem !important;\n}\n.font-monospace {\n  font-family: var(--bs-font-monospace) !important;\n}\n.fs-1 {\n  font-size: calc(1.375rem + 1.5vw) !important;\n}\n.fs-2 {\n  font-size: calc(1.325rem + 0.9vw) !important;\n}\n.fs-3 {\n  font-size: calc(1.3rem + 0.6vw) !important;\n}\n.fs-4 {\n  font-size: calc(1.275rem + 0.3vw) !important;\n}\n.fs-5 {\n  font-size: 1.25rem !important;\n}\n.fs-6 {\n  font-size: 1rem !important;\n}\n.fst-italic {\n  font-style: italic !important;\n}\n.fst-normal {\n  font-style: normal !important;\n}\n.fw-lighter {\n  font-weight: lighter !important;\n}\n.fw-light {\n  font-weight: 300 !important;\n}\n.fw-normal {\n  font-weight: 400 !important;\n}\n.fw-medium {\n  font-weight: 500 !important;\n}\n.fw-semibold {\n  font-weight: 600 !important;\n}\n.fw-bold {\n  font-weight: 700 !important;\n}\n.fw-bolder {\n  font-weight: bolder !important;\n}\n.lh-1 {\n  line-height: 1 !important;\n}\n.lh-sm {\n  line-height: 1.25 !important;\n}\n.lh-base {\n  line-height: 1.5 !important;\n}\n.lh-lg {\n  line-height: 2 !important;\n}\n.text-start {\n  text-align: left !important;\n}\n.text-end {\n  text-align: right !important;\n}\n.text-center {\n  text-align: center !important;\n}\n.text-decoration-none {\n  text-decoration: none !important;\n}\n.text-decoration-underline {\n  text-decoration: underline !important;\n}\n.text-decoration-line-through {\n  text-decoration: line-through !important;\n}\n.text-lowercase {\n  text-transform: lowercase !important;\n}\n.text-uppercase {\n  text-transform: uppercase !important;\n}\n.text-capitalize {\n  text-transform: capitalize !important;\n}\n.text-wrap {\n  white-space: normal !important;\n}\n.text-nowrap {\n  white-space: nowrap !important;\n}\n.text-break {\n  word-wrap: break-word !important;\n  word-break: break-word !important;\n}\n.text-primary {\n  --bs-text-opacity: 1;\n  color: rgba(var(--bs-primary-rgb), var(--bs-text-opacity)) !important;\n}\n.text-secondary {\n  --bs-text-opacity: 1;\n  color: rgba(var(--bs-secondary-rgb), var(--bs-text-opacity)) !important;\n}\n.text-success {\n  --bs-text-opacity: 1;\n  color: rgba(var(--bs-success-rgb), var(--bs-text-opacity)) !important;\n}\n.text-info {\n  --bs-text-opacity: 1;\n  color: rgba(var(--bs-info-rgb), var(--bs-text-opacity)) !important;\n}\n.text-warning {\n  --bs-text-opacity: 1;\n  color: rgba(var(--bs-warning-rgb), var(--bs-text-opacity)) !important;\n}\n.text-danger {\n  --bs-text-opacity: 1;\n  color: rgba(var(--bs-danger-rgb), var(--bs-text-opacity)) !important;\n}\n.text-light {\n  --bs-text-opacity: 1;\n  color: rgba(var(--bs-light-rgb), var(--bs-text-opacity)) !important;\n}\n.text-dark {\n  --bs-text-opacity: 1;\n  color: rgba(var(--bs-dark-rgb), var(--bs-text-opacity)) !important;\n}\n.text-black {\n  --bs-text-opacity: 1;\n  color: rgba(var(--bs-black-rgb), var(--bs-text-opacity)) !important;\n}\n.text-white {\n  --bs-text-opacity: 1;\n  color: rgba(var(--bs-white-rgb), var(--bs-text-opacity)) !important;\n}\n.text-body {\n  --bs-text-opacity: 1;\n  color: rgba(var(--bs-body-color-rgb), var(--bs-text-opacity)) !important;\n}\n.text-muted {\n  --bs-text-opacity: 1;\n  color: var(--bs-secondary-color) !important;\n}\n.text-black-50 {\n  --bs-text-opacity: 1;\n  color: rgba(0, 0, 0, 0.5) !important;\n}\n.text-white-50 {\n  --bs-text-opacity: 1;\n  color: rgba(255, 255, 255, 0.5) !important;\n}\n.text-body-secondary {\n  --bs-text-opacity: 1;\n  color: var(--bs-secondary-color) !important;\n}\n.text-body-tertiary {\n  --bs-text-opacity: 1;\n  color: var(--bs-tertiary-color) !important;\n}\n.text-body-emphasis {\n  --bs-text-opacity: 1;\n  color: var(--bs-emphasis-color) !important;\n}\n.text-reset {\n  --bs-text-opacity: 1;\n  color: inherit !important;\n}\n.text-opacity-25 {\n  --bs-text-opacity: 0.25;\n}\n.text-opacity-50 {\n  --bs-text-opacity: 0.5;\n}\n.text-opacity-75 {\n  --bs-text-opacity: 0.75;\n}\n.text-opacity-100 {\n  --bs-text-opacity: 1;\n}\n.text-primary-emphasis {\n  color: var(--bs-primary-text-emphasis) !important;\n}\n.text-secondary-emphasis {\n  color: var(--bs-secondary-text-emphasis) !important;\n}\n.text-success-emphasis {\n  color: var(--bs-success-text-emphasis) !important;\n}\n.text-info-emphasis {\n  color: var(--bs-info-text-emphasis) !important;\n}\n.text-warning-emphasis {\n  color: var(--bs-warning-text-emphasis) !important;\n}\n.text-danger-emphasis {\n  color: var(--bs-danger-text-emphasis) !important;\n}\n.text-light-emphasis {\n  color: var(--bs-light-text-emphasis) !important;\n}\n.text-dark-emphasis {\n  color: var(--bs-dark-text-emphasis) !important;\n}\n.link-opacity-10 {\n  --bs-link-opacity: 0.1;\n}\n.link-opacity-10-hover:hover {\n  --bs-link-opacity: 0.1;\n}\n.link-opacity-25 {\n  --bs-link-opacity: 0.25;\n}\n.link-opacity-25-hover:hover {\n  --bs-link-opacity: 0.25;\n}\n.link-opacity-50 {\n  --bs-link-opacity: 0.5;\n}\n.link-opacity-50-hover:hover {\n  --bs-link-opacity: 0.5;\n}\n.link-opacity-75 {\n  --bs-link-opacity: 0.75;\n}\n.link-opacity-75-hover:hover {\n  --bs-link-opacity: 0.75;\n}\n.link-opacity-100 {\n  --bs-link-opacity: 1;\n}\n.link-opacity-100-hover:hover {\n  --bs-link-opacity: 1;\n}\n.link-offset-1 {\n  text-underline-offset: 0.125em !important;\n}\n.link-offset-1-hover:hover {\n  text-underline-offset: 0.125em !important;\n}\n.link-offset-2 {\n  text-underline-offset: 0.25em !important;\n}\n.link-offset-2-hover:hover {\n  text-underline-offset: 0.25em !important;\n}\n.link-offset-3 {\n  text-underline-offset: 0.375em !important;\n}\n.link-offset-3-hover:hover {\n  text-underline-offset: 0.375em !important;\n}\n.link-underline-primary {\n  --bs-link-underline-opacity: 1;\n  -webkit-text-decoration-color: rgba(\n    var(--bs-primary-rgb),\n    var(--bs-link-underline-opacity)\n  ) !important;\n  text-decoration-color: rgba(\n    var(--bs-primary-rgb),\n    var(--bs-link-underline-opacity)\n  ) !important;\n}\n.link-underline-secondary {\n  --bs-link-underline-opacity: 1;\n  -webkit-text-decoration-color: rgba(\n    var(--bs-secondary-rgb),\n    var(--bs-link-underline-opacity)\n  ) !important;\n  text-decoration-color: rgba(\n    var(--bs-secondary-rgb),\n    var(--bs-link-underline-opacity)\n  ) !important;\n}\n.link-underline-success {\n  --bs-link-underline-opacity: 1;\n  -webkit-text-decoration-color: rgba(\n    var(--bs-success-rgb),\n    var(--bs-link-underline-opacity)\n  ) !important;\n  text-decoration-color: rgba(\n    var(--bs-success-rgb),\n    var(--bs-link-underline-opacity)\n  ) !important;\n}\n.link-underline-info {\n  --bs-link-underline-opacity: 1;\n  -webkit-text-decoration-color: rgba(\n    var(--bs-info-rgb),\n    var(--bs-link-underline-opacity)\n  ) !important;\n  text-decoration-color: rgba(\n    var(--bs-info-rgb),\n    var(--bs-link-underline-opacity)\n  ) !important;\n}\n.link-underline-warning {\n  --bs-link-underline-opacity: 1;\n  -webkit-text-decoration-color: rgba(\n    var(--bs-warning-rgb),\n    var(--bs-link-underline-opacity)\n  ) !important;\n  text-decoration-color: rgba(\n    var(--bs-warning-rgb),\n    var(--bs-link-underline-opacity)\n  ) !important;\n}\n.link-underline-danger {\n  --bs-link-underline-opacity: 1;\n  -webkit-text-decoration-color: rgba(\n    var(--bs-danger-rgb),\n    var(--bs-link-underline-opacity)\n  ) !important;\n  text-decoration-color: rgba(\n    var(--bs-danger-rgb),\n    var(--bs-link-underline-opacity)\n  ) !important;\n}\n.link-underline-light {\n  --bs-link-underline-opacity: 1;\n  -webkit-text-decoration-color: rgba(\n    var(--bs-light-rgb),\n    var(--bs-link-underline-opacity)\n  ) !important;\n  text-decoration-color: rgba(\n    var(--bs-light-rgb),\n    var(--bs-link-underline-opacity)\n  ) !important;\n}\n.link-underline-dark {\n  --bs-link-underline-opacity: 1;\n  -webkit-text-decoration-color: rgba(\n    var(--bs-dark-rgb),\n    var(--bs-link-underline-opacity)\n  ) !important;\n  text-decoration-color: rgba(\n    var(--bs-dark-rgb),\n    var(--bs-link-underline-opacity)\n  ) !important;\n}\n.link-underline {\n  --bs-link-underline-opacity: 1;\n  -webkit-text-decoration-color: rgba(\n    var(--bs-link-color-rgb),\n    var(--bs-link-underline-opacity, 1)\n  ) !important;\n  text-decoration-color: rgba(\n    var(--bs-link-color-rgb),\n    var(--bs-link-underline-opacity, 1)\n  ) !important;\n}\n.link-underline-opacity-0 {\n  --bs-link-underline-opacity: 0;\n}\n.link-underline-opacity-0-hover:hover {\n  --bs-link-underline-opacity: 0;\n}\n.link-underline-opacity-10 {\n  --bs-link-underline-opacity: 0.1;\n}\n.link-underline-opacity-10-hover:hover {\n  --bs-link-underline-opacity: 0.1;\n}\n.link-underline-opacity-25 {\n  --bs-link-underline-opacity: 0.25;\n}\n.link-underline-opacity-25-hover:hover {\n  --bs-link-underline-opacity: 0.25;\n}\n.link-underline-opacity-50 {\n  --bs-link-underline-opacity: 0.5;\n}\n.link-underline-opacity-50-hover:hover {\n  --bs-link-underline-opacity: 0.5;\n}\n.link-underline-opacity-75 {\n  --bs-link-underline-opacity: 0.75;\n}\n.link-underline-opacity-75-hover:hover {\n  --bs-link-underline-opacity: 0.75;\n}\n.link-underline-opacity-100 {\n  --bs-link-underline-opacity: 1;\n}\n.link-underline-opacity-100-hover:hover {\n  --bs-link-underline-opacity: 1;\n}\n.bg-primary {\n  --bs-bg-opacity: 1;\n  background-color: rgba(\n    var(--bs-primary-rgb),\n    var(--bs-bg-opacity)\n  ) !important;\n}\n.bg-secondary {\n  --bs-bg-opacity: 1;\n  background-color: rgba(\n    var(--bs-secondary-rgb),\n    var(--bs-bg-opacity)\n  ) !important;\n}\n.bg-success {\n  --bs-bg-opacity: 1;\n  background-color: rgba(\n    var(--bs-success-rgb),\n    var(--bs-bg-opacity)\n  ) !important;\n}\n.bg-info {\n  --bs-bg-opacity: 1;\n  background-color: rgba(var(--bs-info-rgb), var(--bs-bg-opacity)) !important;\n}\n.bg-warning {\n  --bs-bg-opacity: 1;\n  background-color: rgba(\n    var(--bs-warning-rgb),\n    var(--bs-bg-opacity)\n  ) !important;\n}\n.bg-danger {\n  --bs-bg-opacity: 1;\n  background-color: rgba(var(--bs-danger-rgb), var(--bs-bg-opacity)) !important;\n}\n.bg-light {\n  --bs-bg-opacity: 1;\n  background-color: rgba(var(--bs-light-rgb), var(--bs-bg-opacity)) !important;\n}\n.bg-dark {\n  --bs-bg-opacity: 1;\n  background-color: rgba(var(--bs-dark-rgb), var(--bs-bg-opacity)) !important;\n}\n.bg-black {\n  --bs-bg-opacity: 1;\n  background-color: rgba(var(--bs-black-rgb), var(--bs-bg-opacity)) !important;\n}\n.bg-white {\n  --bs-bg-opacity: 1;\n  background-color: rgba(var(--bs-white-rgb), var(--bs-bg-opacity)) !important;\n}\n.bg-body {\n  --bs-bg-opacity: 1;\n  background-color: rgba(\n    var(--bs-body-bg-rgb),\n    var(--bs-bg-opacity)\n  ) !important;\n}\n.bg-transparent {\n  --bs-bg-opacity: 1;\n  background-color: transparent !important;\n}\n.bg-body-secondary {\n  --bs-bg-opacity: 1;\n  background-color: rgba(\n    var(--bs-secondary-bg-rgb),\n    var(--bs-bg-opacity)\n  ) !important;\n}\n.bg-body-tertiary {\n  --bs-bg-opacity: 1;\n  background-color: rgba(\n    var(--bs-tertiary-bg-rgb),\n    var(--bs-bg-opacity)\n  ) !important;\n}\n.bg-opacity-10 {\n  --bs-bg-opacity: 0.1;\n}\n.bg-opacity-25 {\n  --bs-bg-opacity: 0.25;\n}\n.bg-opacity-50 {\n  --bs-bg-opacity: 0.5;\n}\n.bg-opacity-75 {\n  --bs-bg-opacity: 0.75;\n}\n.bg-opacity-100 {\n  --bs-bg-opacity: 1;\n}\n.bg-primary-subtle {\n  background-color: var(--bs-primary-bg-subtle) !important;\n}\n.bg-secondary-subtle {\n  background-color: var(--bs-secondary-bg-subtle) !important;\n}\n.bg-success-subtle {\n  background-color: var(--bs-success-bg-subtle) !important;\n}\n.bg-info-subtle {\n  background-color: var(--bs-info-bg-subtle) !important;\n}\n.bg-warning-subtle {\n  background-color: var(--bs-warning-bg-subtle) !important;\n}\n.bg-danger-subtle {\n  background-color: var(--bs-danger-bg-subtle) !important;\n}\n.bg-light-subtle {\n  background-color: var(--bs-light-bg-subtle) !important;\n}\n.bg-dark-subtle {\n  background-color: var(--bs-dark-bg-subtle) !important;\n}\n.bg-gradient {\n  background-image: var(--bs-gradient) !important;\n}\n.user-select-all {\n  -webkit-user-select: all !important;\n  -moz-user-select: all !important;\n  user-select: all !important;\n}\n.user-select-auto {\n  -webkit-user-select: auto !important;\n  -moz-user-select: auto !important;\n  user-select: auto !important;\n}\n.user-select-none {\n  -webkit-user-select: none !important;\n  -moz-user-select: none !important;\n  user-select: none !important;\n}\n.pe-none {\n  pointer-events: none !important;\n}\n.pe-auto {\n  pointer-events: auto !important;\n}\n.rounded {\n  border-radius: var(--bs-border-radius) !important;\n}\n.rounded-0 {\n  border-radius: 0 !important;\n}\n.rounded-1 {\n  border-radius: var(--bs-border-radius-sm) !important;\n}\n.rounded-2 {\n  border-radius: var(--bs-border-radius) !important;\n}\n.rounded-3 {\n  border-radius: var(--bs-border-radius-lg) !important;\n}\n.rounded-4 {\n  border-radius: var(--bs-border-radius-xl) !important;\n}\n.rounded-5 {\n  border-radius: var(--bs-border-radius-xxl) !important;\n}\n.rounded-circle {\n  border-radius: 50% !important;\n}\n.rounded-pill {\n  border-radius: var(--bs-border-radius-pill) !important;\n}\n.rounded-top {\n  border-top-left-radius: var(--bs-border-radius) !important;\n  border-top-right-radius: var(--bs-border-radius) !important;\n}\n.rounded-top-0 {\n  border-top-left-radius: 0 !important;\n  border-top-right-radius: 0 !important;\n}\n.rounded-top-1 {\n  border-top-left-radius: var(--bs-border-radius-sm) !important;\n  border-top-right-radius: var(--bs-border-radius-sm) !important;\n}\n.rounded-top-2 {\n  border-top-left-radius: var(--bs-border-radius) !important;\n  border-top-right-radius: var(--bs-border-radius) !important;\n}\n.rounded-top-3 {\n  border-top-left-radius: var(--bs-border-radius-lg) !important;\n  border-top-right-radius: var(--bs-border-radius-lg) !important;\n}\n.rounded-top-4 {\n  border-top-left-radius: var(--bs-border-radius-xl) !important;\n  border-top-right-radius: var(--bs-border-radius-xl) !important;\n}\n.rounded-top-5 {\n  border-top-left-radius: var(--bs-border-radius-xxl) !important;\n  border-top-right-radius: var(--bs-border-radius-xxl) !important;\n}\n.rounded-top-circle {\n  border-top-left-radius: 50% !important;\n  border-top-right-radius: 50% !important;\n}\n.rounded-top-pill {\n  border-top-left-radius: var(--bs-border-radius-pill) !important;\n  border-top-right-radius: var(--bs-border-radius-pill) !important;\n}\n.rounded-end {\n  border-top-right-radius: var(--bs-border-radius) !important;\n  border-bottom-right-radius: var(--bs-border-radius) !important;\n}\n.rounded-end-0 {\n  border-top-right-radius: 0 !important;\n  border-bottom-right-radius: 0 !important;\n}\n.rounded-end-1 {\n  border-top-right-radius: var(--bs-border-radius-sm) !important;\n  border-bottom-right-radius: var(--bs-border-radius-sm) !important;\n}\n.rounded-end-2 {\n  border-top-right-radius: var(--bs-border-radius) !important;\n  border-bottom-right-radius: var(--bs-border-radius) !important;\n}\n.rounded-end-3 {\n  border-top-right-radius: var(--bs-border-radius-lg) !important;\n  border-bottom-right-radius: var(--bs-border-radius-lg) !important;\n}\n.rounded-end-4 {\n  border-top-right-radius: var(--bs-border-radius-xl) !important;\n  border-bottom-right-radius: var(--bs-border-radius-xl) !important;\n}\n.rounded-end-5 {\n  border-top-right-radius: var(--bs-border-radius-xxl) !important;\n  border-bottom-right-radius: var(--bs-border-radius-xxl) !important;\n}\n.rounded-end-circle {\n  border-top-right-radius: 50% !important;\n  border-bottom-right-radius: 50% !important;\n}\n.rounded-end-pill {\n  border-top-right-radius: var(--bs-border-radius-pill) !important;\n  border-bottom-right-radius: var(--bs-border-radius-pill) !important;\n}\n.rounded-bottom {\n  border-bottom-right-radius: var(--bs-border-radius) !important;\n  border-bottom-left-radius: var(--bs-border-radius) !important;\n}\n.rounded-bottom-0 {\n  border-bottom-right-radius: 0 !important;\n  border-bottom-left-radius: 0 !important;\n}\n.rounded-bottom-1 {\n  border-bottom-right-radius: var(--bs-border-radius-sm) !important;\n  border-bottom-left-radius: var(--bs-border-radius-sm) !important;\n}\n.rounded-bottom-2 {\n  border-bottom-right-radius: var(--bs-border-radius) !important;\n  border-bottom-left-radius: var(--bs-border-radius) !important;\n}\n.rounded-bottom-3 {\n  border-bottom-right-radius: var(--bs-border-radius-lg) !important;\n  border-bottom-left-radius: var(--bs-border-radius-lg) !important;\n}\n.rounded-bottom-4 {\n  border-bottom-right-radius: var(--bs-border-radius-xl) !important;\n  border-bottom-left-radius: var(--bs-border-radius-xl) !important;\n}\n.rounded-bottom-5 {\n  border-bottom-right-radius: var(--bs-border-radius-xxl) !important;\n  border-bottom-left-radius: var(--bs-border-radius-xxl) !important;\n}\n.rounded-bottom-circle {\n  border-bottom-right-radius: 50% !important;\n  border-bottom-left-radius: 50% !important;\n}\n.rounded-bottom-pill {\n  border-bottom-right-radius: var(--bs-border-radius-pill) !important;\n  border-bottom-left-radius: var(--bs-border-radius-pill) !important;\n}\n.rounded-start {\n  border-bottom-left-radius: var(--bs-border-radius) !important;\n  border-top-left-radius: var(--bs-border-radius) !important;\n}\n.rounded-start-0 {\n  border-bottom-left-radius: 0 !important;\n  border-top-left-radius: 0 !important;\n}\n.rounded-start-1 {\n  border-bottom-left-radius: var(--bs-border-radius-sm) !important;\n  border-top-left-radius: var(--bs-border-radius-sm) !important;\n}\n.rounded-start-2 {\n  border-bottom-left-radius: var(--bs-border-radius) !important;\n  border-top-left-radius: var(--bs-border-radius) !important;\n}\n.rounded-start-3 {\n  border-bottom-left-radius: var(--bs-border-radius-lg) !important;\n  border-top-left-radius: var(--bs-border-radius-lg) !important;\n}\n.rounded-start-4 {\n  border-bottom-left-radius: var(--bs-border-radius-xl) !important;\n  border-top-left-radius: var(--bs-border-radius-xl) !important;\n}\n.rounded-start-5 {\n  border-bottom-left-radius: var(--bs-border-radius-xxl) !important;\n  border-top-left-radius: var(--bs-border-radius-xxl) !important;\n}\n.rounded-start-circle {\n  border-bottom-left-radius: 50% !important;\n  border-top-left-radius: 50% !important;\n}\n.rounded-start-pill {\n  border-bottom-left-radius: var(--bs-border-radius-pill) !important;\n  border-top-left-radius: var(--bs-border-radius-pill) !important;\n}\n.visible {\n  visibility: visible !important;\n}\n.invisible {\n  visibility: hidden !important;\n}\n.z-n1 {\n  z-index: -1 !important;\n}\n.z-0 {\n  z-index: 0 !important;\n}\n.z-1 {\n  z-index: 1 !important;\n}\n.z-2 {\n  z-index: 2 !important;\n}\n.z-3 {\n  z-index: 3 !important;\n}\n@media (min-width: 576px) {\n  .float-sm-start {\n    float: left !important;\n  }\n  .float-sm-end {\n    float: right !important;\n  }\n  .float-sm-none {\n    float: none !important;\n  }\n  .object-fit-sm-contain {\n    -o-object-fit: contain !important;\n    object-fit: contain !important;\n  }\n  .object-fit-sm-cover {\n    -o-object-fit: cover !important;\n    object-fit: cover !important;\n  }\n  .object-fit-sm-fill {\n    -o-object-fit: fill !important;\n    object-fit: fill !important;\n  }\n  .object-fit-sm-scale {\n    -o-object-fit: scale-down !important;\n    object-fit: scale-down !important;\n  }\n  .object-fit-sm-none {\n    -o-object-fit: none !important;\n    object-fit: none !important;\n  }\n  .d-sm-inline {\n    display: inline !important;\n  }\n  .d-sm-inline-block {\n    display: inline-block !important;\n  }\n  .d-sm-block {\n    display: block !important;\n  }\n  .d-sm-grid {\n    display: grid !important;\n  }\n  .d-sm-inline-grid {\n    display: inline-grid !important;\n  }\n  .d-sm-table {\n    display: table !important;\n  }\n  .d-sm-table-row {\n    display: table-row !important;\n  }\n  .d-sm-table-cell {\n    display: table-cell !important;\n  }\n  .d-sm-flex {\n    display: flex !important;\n  }\n  .d-sm-inline-flex {\n    display: inline-flex !important;\n  }\n  .d-sm-none {\n    display: none !important;\n  }\n  .flex-sm-fill {\n    flex: 1 1 auto !important;\n  }\n  .flex-sm-row {\n    flex-direction: row !important;\n  }\n  .flex-sm-column {\n    flex-direction: column !important;\n  }\n  .flex-sm-row-reverse {\n    flex-direction: row-reverse !important;\n  }\n  .flex-sm-column-reverse {\n    flex-direction: column-reverse !important;\n  }\n  .flex-sm-grow-0 {\n    flex-grow: 0 !important;\n  }\n  .flex-sm-grow-1 {\n    flex-grow: 1 !important;\n  }\n  .flex-sm-shrink-0 {\n    flex-shrink: 0 !important;\n  }\n  .flex-sm-shrink-1 {\n    flex-shrink: 1 !important;\n  }\n  .flex-sm-wrap {\n    flex-wrap: wrap !important;\n  }\n  .flex-sm-nowrap {\n    flex-wrap: nowrap !important;\n  }\n  .flex-sm-wrap-reverse {\n    flex-wrap: wrap-reverse !important;\n  }\n  .justify-content-sm-start {\n    justify-content: flex-start !important;\n  }\n  .justify-content-sm-end {\n    justify-content: flex-end !important;\n  }\n  .justify-content-sm-center {\n    justify-content: center !important;\n  }\n  .justify-content-sm-between {\n    justify-content: space-between !important;\n  }\n  .justify-content-sm-around {\n    justify-content: space-around !important;\n  }\n  .justify-content-sm-evenly {\n    justify-content: space-evenly !important;\n  }\n  .align-items-sm-start {\n    align-items: flex-start !important;\n  }\n  .align-items-sm-end {\n    align-items: flex-end !important;\n  }\n  .align-items-sm-center {\n    align-items: center !important;\n  }\n  .align-items-sm-baseline {\n    align-items: baseline !important;\n  }\n  .align-items-sm-stretch {\n    align-items: stretch !important;\n  }\n  .align-content-sm-start {\n    align-content: flex-start !important;\n  }\n  .align-content-sm-end {\n    align-content: flex-end !important;\n  }\n  .align-content-sm-center {\n    align-content: center !important;\n  }\n  .align-content-sm-between {\n    align-content: space-between !important;\n  }\n  .align-content-sm-around {\n    align-content: space-around !important;\n  }\n  .align-content-sm-stretch {\n    align-content: stretch !important;\n  }\n  .align-self-sm-auto {\n    align-self: auto !important;\n  }\n  .align-self-sm-start {\n    align-self: flex-start !important;\n  }\n  .align-self-sm-end {\n    align-self: flex-end !important;\n  }\n  .align-self-sm-center {\n    align-self: center !important;\n  }\n  .align-self-sm-baseline {\n    align-self: baseline !important;\n  }\n  .align-self-sm-stretch {\n    align-self: stretch !important;\n  }\n  .order-sm-first {\n    order: -1 !important;\n  }\n  .order-sm-0 {\n    order: 0 !important;\n  }\n  .order-sm-1 {\n    order: 1 !important;\n  }\n  .order-sm-2 {\n    order: 2 !important;\n  }\n  .order-sm-3 {\n    order: 3 !important;\n  }\n  .order-sm-4 {\n    order: 4 !important;\n  }\n  .order-sm-5 {\n    order: 5 !important;\n  }\n  .order-sm-last {\n    order: 6 !important;\n  }\n  .m-sm-0 {\n    margin: 0 !important;\n  }\n  .m-sm-1 {\n    margin: 0.25rem !important;\n  }\n  .m-sm-2 {\n    margin: 0.5rem !important;\n  }\n  .m-sm-3 {\n    margin: 1rem !important;\n  }\n  .m-sm-4 {\n    margin: 1.5rem !important;\n  }\n  .m-sm-5 {\n    margin: 3rem !important;\n  }\n  .m-sm-auto {\n    margin: auto !important;\n  }\n  .mx-sm-0 {\n    margin-right: 0 !important;\n    margin-left: 0 !important;\n  }\n  .mx-sm-1 {\n    margin-right: 0.25rem !important;\n    margin-left: 0.25rem !important;\n  }\n  .mx-sm-2 {\n    margin-right: 0.5rem !important;\n    margin-left: 0.5rem !important;\n  }\n  .mx-sm-3 {\n    margin-right: 1rem !important;\n    margin-left: 1rem !important;\n  }\n  .mx-sm-4 {\n    margin-right: 1.5rem !important;\n    margin-left: 1.5rem !important;\n  }\n  .mx-sm-5 {\n    margin-right: 3rem !important;\n    margin-left: 3rem !important;\n  }\n  .mx-sm-auto {\n    margin-right: auto !important;\n    margin-left: auto !important;\n  }\n  .my-sm-0 {\n    margin-top: 0 !important;\n    margin-bottom: 0 !important;\n  }\n  .my-sm-1 {\n    margin-top: 0.25rem !important;\n    margin-bottom: 0.25rem !important;\n  }\n  .my-sm-2 {\n    margin-top: 0.5rem !important;\n    margin-bottom: 0.5rem !important;\n  }\n  .my-sm-3 {\n    margin-top: 1rem !important;\n    margin-bottom: 1rem !important;\n  }\n  .my-sm-4 {\n    margin-top: 1.5rem !important;\n    margin-bottom: 1.5rem !important;\n  }\n  .my-sm-5 {\n    margin-top: 3rem !important;\n    margin-bottom: 3rem !important;\n  }\n  .my-sm-auto {\n    margin-top: auto !important;\n    margin-bottom: auto !important;\n  }\n  .mt-sm-0 {\n    margin-top: 0 !important;\n  }\n  .mt-sm-1 {\n    margin-top: 0.25rem !important;\n  }\n  .mt-sm-2 {\n    margin-top: 0.5rem !important;\n  }\n  .mt-sm-3 {\n    margin-top: 1rem !important;\n  }\n  .mt-sm-4 {\n    margin-top: 1.5rem !important;\n  }\n  .mt-sm-5 {\n    margin-top: 3rem !important;\n  }\n  .mt-sm-auto {\n    margin-top: auto !important;\n  }\n  .me-sm-0 {\n    margin-right: 0 !important;\n  }\n  .me-sm-1 {\n    margin-right: 0.25rem !important;\n  }\n  .me-sm-2 {\n    margin-right: 0.5rem !important;\n  }\n  .me-sm-3 {\n    margin-right: 1rem !important;\n  }\n  .me-sm-4 {\n    margin-right: 1.5rem !important;\n  }\n  .me-sm-5 {\n    margin-right: 3rem !important;\n  }\n  .me-sm-auto {\n    margin-right: auto !important;\n  }\n  .mb-sm-0 {\n    margin-bottom: 0 !important;\n  }\n  .mb-sm-1 {\n    margin-bottom: 0.25rem !important;\n  }\n  .mb-sm-2 {\n    margin-bottom: 0.5rem !important;\n  }\n  .mb-sm-3 {\n    margin-bottom: 1rem !important;\n  }\n  .mb-sm-4 {\n    margin-bottom: 1.5rem !important;\n  }\n  .mb-sm-5 {\n    margin-bottom: 3rem !important;\n  }\n  .mb-sm-auto {\n    margin-bottom: auto !important;\n  }\n  .ms-sm-0 {\n    margin-left: 0 !important;\n  }\n  .ms-sm-1 {\n    margin-left: 0.25rem !important;\n  }\n  .ms-sm-2 {\n    margin-left: 0.5rem !important;\n  }\n  .ms-sm-3 {\n    margin-left: 1rem !important;\n  }\n  .ms-sm-4 {\n    margin-left: 1.5rem !important;\n  }\n  .ms-sm-5 {\n    margin-left: 3rem !important;\n  }\n  .ms-sm-auto {\n    margin-left: auto !important;\n  }\n  .p-sm-0 {\n    padding: 0 !important;\n  }\n  .p-sm-1 {\n    padding: 0.25rem !important;\n  }\n  .p-sm-2 {\n    padding: 0.5rem !important;\n  }\n  .p-sm-3 {\n    padding: 1rem !important;\n  }\n  .p-sm-4 {\n    padding: 1.5rem !important;\n  }\n  .p-sm-5 {\n    padding: 3rem !important;\n  }\n  .px-sm-0 {\n    padding-right: 0 !important;\n    padding-left: 0 !important;\n  }\n  .px-sm-1 {\n    padding-right: 0.25rem !important;\n    padding-left: 0.25rem !important;\n  }\n  .px-sm-2 {\n    padding-right: 0.5rem !important;\n    padding-left: 0.5rem !important;\n  }\n  .px-sm-3 {\n    padding-right: 1rem !important;\n    padding-left: 1rem !important;\n  }\n  .px-sm-4 {\n    padding-right: 1.5rem !important;\n    padding-left: 1.5rem !important;\n  }\n  .px-sm-5 {\n    padding-right: 3rem !important;\n    padding-left: 3rem !important;\n  }\n  .py-sm-0 {\n    padding-top: 0 !important;\n    padding-bottom: 0 !important;\n  }\n  .py-sm-1 {\n    padding-top: 0.25rem !important;\n    padding-bottom: 0.25rem !important;\n  }\n  .py-sm-2 {\n    padding-top: 0.5rem !important;\n    padding-bottom: 0.5rem !important;\n  }\n  .py-sm-3 {\n    padding-top: 1rem !important;\n    padding-bottom: 1rem !important;\n  }\n  .py-sm-4 {\n    padding-top: 1.5rem !important;\n    padding-bottom: 1.5rem !important;\n  }\n  .py-sm-5 {\n    padding-top: 3rem !important;\n    padding-bottom: 3rem !important;\n  }\n  .pt-sm-0 {\n    padding-top: 0 !important;\n  }\n  .pt-sm-1 {\n    padding-top: 0.25rem !important;\n  }\n  .pt-sm-2 {\n    padding-top: 0.5rem !important;\n  }\n  .pt-sm-3 {\n    padding-top: 1rem !important;\n  }\n  .pt-sm-4 {\n    padding-top: 1.5rem !important;\n  }\n  .pt-sm-5 {\n    padding-top: 3rem !important;\n  }\n  .pe-sm-0 {\n    padding-right: 0 !important;\n  }\n  .pe-sm-1 {\n    padding-right: 0.25rem !important;\n  }\n  .pe-sm-2 {\n    padding-right: 0.5rem !important;\n  }\n  .pe-sm-3 {\n    padding-right: 1rem !important;\n  }\n  .pe-sm-4 {\n    padding-right: 1.5rem !important;\n  }\n  .pe-sm-5 {\n    padding-right: 3rem !important;\n  }\n  .pb-sm-0 {\n    padding-bottom: 0 !important;\n  }\n  .pb-sm-1 {\n    padding-bottom: 0.25rem !important;\n  }\n  .pb-sm-2 {\n    padding-bottom: 0.5rem !important;\n  }\n  .pb-sm-3 {\n    padding-bottom: 1rem !important;\n  }\n  .pb-sm-4 {\n    padding-bottom: 1.5rem !important;\n  }\n  .pb-sm-5 {\n    padding-bottom: 3rem !important;\n  }\n  .ps-sm-0 {\n    padding-left: 0 !important;\n  }\n  .ps-sm-1 {\n    padding-left: 0.25rem !important;\n  }\n  .ps-sm-2 {\n    padding-left: 0.5rem !important;\n  }\n  .ps-sm-3 {\n    padding-left: 1rem !important;\n  }\n  .ps-sm-4 {\n    padding-left: 1.5rem !important;\n  }\n  .ps-sm-5 {\n    padding-left: 3rem !important;\n  }\n  .gap-sm-0 {\n    gap: 0 !important;\n  }\n  .gap-sm-1 {\n    gap: 0.25rem !important;\n  }\n  .gap-sm-2 {\n    gap: 0.5rem !important;\n  }\n  .gap-sm-3 {\n    gap: 1rem !important;\n  }\n  .gap-sm-4 {\n    gap: 1.5rem !important;\n  }\n  .gap-sm-5 {\n    gap: 3rem !important;\n  }\n  .row-gap-sm-0 {\n    row-gap: 0 !important;\n  }\n  .row-gap-sm-1 {\n    row-gap: 0.25rem !important;\n  }\n  .row-gap-sm-2 {\n    row-gap: 0.5rem !important;\n  }\n  .row-gap-sm-3 {\n    row-gap: 1rem !important;\n  }\n  .row-gap-sm-4 {\n    row-gap: 1.5rem !important;\n  }\n  .row-gap-sm-5 {\n    row-gap: 3rem !important;\n  }\n  .column-gap-sm-0 {\n    -moz-column-gap: 0 !important;\n    column-gap: 0 !important;\n  }\n  .column-gap-sm-1 {\n    -moz-column-gap: 0.25rem !important;\n    column-gap: 0.25rem !important;\n  }\n  .column-gap-sm-2 {\n    -moz-column-gap: 0.5rem !important;\n    column-gap: 0.5rem !important;\n  }\n  .column-gap-sm-3 {\n    -moz-column-gap: 1rem !important;\n    column-gap: 1rem !important;\n  }\n  .column-gap-sm-4 {\n    -moz-column-gap: 1.5rem !important;\n    column-gap: 1.5rem !important;\n  }\n  .column-gap-sm-5 {\n    -moz-column-gap: 3rem !important;\n    column-gap: 3rem !important;\n  }\n  .text-sm-start {\n    text-align: left !important;\n  }\n  .text-sm-end {\n    text-align: right !important;\n  }\n  .text-sm-center {\n    text-align: center !important;\n  }\n}\n@media (min-width: 768px) {\n  .float-md-start {\n    float: left !important;\n  }\n  .float-md-end {\n    float: right !important;\n  }\n  .float-md-none {\n    float: none !important;\n  }\n  .object-fit-md-contain {\n    -o-object-fit: contain !important;\n    object-fit: contain !important;\n  }\n  .object-fit-md-cover {\n    -o-object-fit: cover !important;\n    object-fit: cover !important;\n  }\n  .object-fit-md-fill {\n    -o-object-fit: fill !important;\n    object-fit: fill !important;\n  }\n  .object-fit-md-scale {\n    -o-object-fit: scale-down !important;\n    object-fit: scale-down !important;\n  }\n  .object-fit-md-none {\n    -o-object-fit: none !important;\n    object-fit: none !important;\n  }\n  .d-md-inline {\n    display: inline !important;\n  }\n  .d-md-inline-block {\n    display: inline-block !important;\n  }\n  .d-md-block {\n    display: block !important;\n  }\n  .d-md-grid {\n    display: grid !important;\n  }\n  .d-md-inline-grid {\n    display: inline-grid !important;\n  }\n  .d-md-table {\n    display: table !important;\n  }\n  .d-md-table-row {\n    display: table-row !important;\n  }\n  .d-md-table-cell {\n    display: table-cell !important;\n  }\n  .d-md-flex {\n    display: flex !important;\n  }\n  .d-md-inline-flex {\n    display: inline-flex !important;\n  }\n  .d-md-none {\n    display: none !important;\n  }\n  .flex-md-fill {\n    flex: 1 1 auto !important;\n  }\n  .flex-md-row {\n    flex-direction: row !important;\n  }\n  .flex-md-column {\n    flex-direction: column !important;\n  }\n  .flex-md-row-reverse {\n    flex-direction: row-reverse !important;\n  }\n  .flex-md-column-reverse {\n    flex-direction: column-reverse !important;\n  }\n  .flex-md-grow-0 {\n    flex-grow: 0 !important;\n  }\n  .flex-md-grow-1 {\n    flex-grow: 1 !important;\n  }\n  .flex-md-shrink-0 {\n    flex-shrink: 0 !important;\n  }\n  .flex-md-shrink-1 {\n    flex-shrink: 1 !important;\n  }\n  .flex-md-wrap {\n    flex-wrap: wrap !important;\n  }\n  .flex-md-nowrap {\n    flex-wrap: nowrap !important;\n  }\n  .flex-md-wrap-reverse {\n    flex-wrap: wrap-reverse !important;\n  }\n  .justify-content-md-start {\n    justify-content: flex-start !important;\n  }\n  .justify-content-md-end {\n    justify-content: flex-end !important;\n  }\n  .justify-content-md-center {\n    justify-content: center !important;\n  }\n  .justify-content-md-between {\n    justify-content: space-between !important;\n  }\n  .justify-content-md-around {\n    justify-content: space-around !important;\n  }\n  .justify-content-md-evenly {\n    justify-content: space-evenly !important;\n  }\n  .align-items-md-start {\n    align-items: flex-start !important;\n  }\n  .align-items-md-end {\n    align-items: flex-end !important;\n  }\n  .align-items-md-center {\n    align-items: center !important;\n  }\n  .align-items-md-baseline {\n    align-items: baseline !important;\n  }\n  .align-items-md-stretch {\n    align-items: stretch !important;\n  }\n  .align-content-md-start {\n    align-content: flex-start !important;\n  }\n  .align-content-md-end {\n    align-content: flex-end !important;\n  }\n  .align-content-md-center {\n    align-content: center !important;\n  }\n  .align-content-md-between {\n    align-content: space-between !important;\n  }\n  .align-content-md-around {\n    align-content: space-around !important;\n  }\n  .align-content-md-stretch {\n    align-content: stretch !important;\n  }\n  .align-self-md-auto {\n    align-self: auto !important;\n  }\n  .align-self-md-start {\n    align-self: flex-start !important;\n  }\n  .align-self-md-end {\n    align-self: flex-end !important;\n  }\n  .align-self-md-center {\n    align-self: center !important;\n  }\n  .align-self-md-baseline {\n    align-self: baseline !important;\n  }\n  .align-self-md-stretch {\n    align-self: stretch !important;\n  }\n  .order-md-first {\n    order: -1 !important;\n  }\n  .order-md-0 {\n    order: 0 !important;\n  }\n  .order-md-1 {\n    order: 1 !important;\n  }\n  .order-md-2 {\n    order: 2 !important;\n  }\n  .order-md-3 {\n    order: 3 !important;\n  }\n  .order-md-4 {\n    order: 4 !important;\n  }\n  .order-md-5 {\n    order: 5 !important;\n  }\n  .order-md-last {\n    order: 6 !important;\n  }\n  .m-md-0 {\n    margin: 0 !important;\n  }\n  .m-md-1 {\n    margin: 0.25rem !important;\n  }\n  .m-md-2 {\n    margin: 0.5rem !important;\n  }\n  .m-md-3 {\n    margin: 1rem !important;\n  }\n  .m-md-4 {\n    margin: 1.5rem !important;\n  }\n  .m-md-5 {\n    margin: 3rem !important;\n  }\n  .m-md-auto {\n    margin: auto !important;\n  }\n  .mx-md-0 {\n    margin-right: 0 !important;\n    margin-left: 0 !important;\n  }\n  .mx-md-1 {\n    margin-right: 0.25rem !important;\n    margin-left: 0.25rem !important;\n  }\n  .mx-md-2 {\n    margin-right: 0.5rem !important;\n    margin-left: 0.5rem !important;\n  }\n  .mx-md-3 {\n    margin-right: 1rem !important;\n    margin-left: 1rem !important;\n  }\n  .mx-md-4 {\n    margin-right: 1.5rem !important;\n    margin-left: 1.5rem !important;\n  }\n  .mx-md-5 {\n    margin-right: 3rem !important;\n    margin-left: 3rem !important;\n  }\n  .mx-md-auto {\n    margin-right: auto !important;\n    margin-left: auto !important;\n  }\n  .my-md-0 {\n    margin-top: 0 !important;\n    margin-bottom: 0 !important;\n  }\n  .my-md-1 {\n    margin-top: 0.25rem !important;\n    margin-bottom: 0.25rem !important;\n  }\n  .my-md-2 {\n    margin-top: 0.5rem !important;\n    margin-bottom: 0.5rem !important;\n  }\n  .my-md-3 {\n    margin-top: 1rem !important;\n    margin-bottom: 1rem !important;\n  }\n  .my-md-4 {\n    margin-top: 1.5rem !important;\n    margin-bottom: 1.5rem !important;\n  }\n  .my-md-5 {\n    margin-top: 3rem !important;\n    margin-bottom: 3rem !important;\n  }\n  .my-md-auto {\n    margin-top: auto !important;\n    margin-bottom: auto !important;\n  }\n  .mt-md-0 {\n    margin-top: 0 !important;\n  }\n  .mt-md-1 {\n    margin-top: 0.25rem !important;\n  }\n  .mt-md-2 {\n    margin-top: 0.5rem !important;\n  }\n  .mt-md-3 {\n    margin-top: 1rem !important;\n  }\n  .mt-md-4 {\n    margin-top: 1.5rem !important;\n  }\n  .mt-md-5 {\n    margin-top: 3rem !important;\n  }\n  .mt-md-auto {\n    margin-top: auto !important;\n  }\n  .me-md-0 {\n    margin-right: 0 !important;\n  }\n  .me-md-1 {\n    margin-right: 0.25rem !important;\n  }\n  .me-md-2 {\n    margin-right: 0.5rem !important;\n  }\n  .me-md-3 {\n    margin-right: 1rem !important;\n  }\n  .me-md-4 {\n    margin-right: 1.5rem !important;\n  }\n  .me-md-5 {\n    margin-right: 3rem !important;\n  }\n  .me-md-auto {\n    margin-right: auto !important;\n  }\n  .mb-md-0 {\n    margin-bottom: 0 !important;\n  }\n  .mb-md-1 {\n    margin-bottom: 0.25rem !important;\n  }\n  .mb-md-2 {\n    margin-bottom: 0.5rem !important;\n  }\n  .mb-md-3 {\n    margin-bottom: 1rem !important;\n  }\n  .mb-md-4 {\n    margin-bottom: 1.5rem !important;\n  }\n  .mb-md-5 {\n    margin-bottom: 3rem !important;\n  }\n  .mb-md-auto {\n    margin-bottom: auto !important;\n  }\n  .ms-md-0 {\n    margin-left: 0 !important;\n  }\n  .ms-md-1 {\n    margin-left: 0.25rem !important;\n  }\n  .ms-md-2 {\n    margin-left: 0.5rem !important;\n  }\n  .ms-md-3 {\n    margin-left: 1rem !important;\n  }\n  .ms-md-4 {\n    margin-left: 1.5rem !important;\n  }\n  .ms-md-5 {\n    margin-left: 3rem !important;\n  }\n  .ms-md-auto {\n    margin-left: auto !important;\n  }\n  .p-md-0 {\n    padding: 0 !important;\n  }\n  .p-md-1 {\n    padding: 0.25rem !important;\n  }\n  .p-md-2 {\n    padding: 0.5rem !important;\n  }\n  .p-md-3 {\n    padding: 1rem !important;\n  }\n  .p-md-4 {\n    padding: 1.5rem !important;\n  }\n  .p-md-5 {\n    padding: 3rem !important;\n  }\n  .px-md-0 {\n    padding-right: 0 !important;\n    padding-left: 0 !important;\n  }\n  .px-md-1 {\n    padding-right: 0.25rem !important;\n    padding-left: 0.25rem !important;\n  }\n  .px-md-2 {\n    padding-right: 0.5rem !important;\n    padding-left: 0.5rem !important;\n  }\n  .px-md-3 {\n    padding-right: 1rem !important;\n    padding-left: 1rem !important;\n  }\n  .px-md-4 {\n    padding-right: 1.5rem !important;\n    padding-left: 1.5rem !important;\n  }\n  .px-md-5 {\n    padding-right: 3rem !important;\n    padding-left: 3rem !important;\n  }\n  .py-md-0 {\n    padding-top: 0 !important;\n    padding-bottom: 0 !important;\n  }\n  .py-md-1 {\n    padding-top: 0.25rem !important;\n    padding-bottom: 0.25rem !important;\n  }\n  .py-md-2 {\n    padding-top: 0.5rem !important;\n    padding-bottom: 0.5rem !important;\n  }\n  .py-md-3 {\n    padding-top: 1rem !important;\n    padding-bottom: 1rem !important;\n  }\n  .py-md-4 {\n    padding-top: 1.5rem !important;\n    padding-bottom: 1.5rem !important;\n  }\n  .py-md-5 {\n    padding-top: 3rem !important;\n    padding-bottom: 3rem !important;\n  }\n  .pt-md-0 {\n    padding-top: 0 !important;\n  }\n  .pt-md-1 {\n    padding-top: 0.25rem !important;\n  }\n  .pt-md-2 {\n    padding-top: 0.5rem !important;\n  }\n  .pt-md-3 {\n    padding-top: 1rem !important;\n  }\n  .pt-md-4 {\n    padding-top: 1.5rem !important;\n  }\n  .pt-md-5 {\n    padding-top: 3rem !important;\n  }\n  .pe-md-0 {\n    padding-right: 0 !important;\n  }\n  .pe-md-1 {\n    padding-right: 0.25rem !important;\n  }\n  .pe-md-2 {\n    padding-right: 0.5rem !important;\n  }\n  .pe-md-3 {\n    padding-right: 1rem !important;\n  }\n  .pe-md-4 {\n    padding-right: 1.5rem !important;\n  }\n  .pe-md-5 {\n    padding-right: 3rem !important;\n  }\n  .pb-md-0 {\n    padding-bottom: 0 !important;\n  }\n  .pb-md-1 {\n    padding-bottom: 0.25rem !important;\n  }\n  .pb-md-2 {\n    padding-bottom: 0.5rem !important;\n  }\n  .pb-md-3 {\n    padding-bottom: 1rem !important;\n  }\n  .pb-md-4 {\n    padding-bottom: 1.5rem !important;\n  }\n  .pb-md-5 {\n    padding-bottom: 3rem !important;\n  }\n  .ps-md-0 {\n    padding-left: 0 !important;\n  }\n  .ps-md-1 {\n    padding-left: 0.25rem !important;\n  }\n  .ps-md-2 {\n    padding-left: 0.5rem !important;\n  }\n  .ps-md-3 {\n    padding-left: 1rem !important;\n  }\n  .ps-md-4 {\n    padding-left: 1.5rem !important;\n  }\n  .ps-md-5 {\n    padding-left: 3rem !important;\n  }\n  .gap-md-0 {\n    gap: 0 !important;\n  }\n  .gap-md-1 {\n    gap: 0.25rem !important;\n  }\n  .gap-md-2 {\n    gap: 0.5rem !important;\n  }\n  .gap-md-3 {\n    gap: 1rem !important;\n  }\n  .gap-md-4 {\n    gap: 1.5rem !important;\n  }\n  .gap-md-5 {\n    gap: 3rem !important;\n  }\n  .row-gap-md-0 {\n    row-gap: 0 !important;\n  }\n  .row-gap-md-1 {\n    row-gap: 0.25rem !important;\n  }\n  .row-gap-md-2 {\n    row-gap: 0.5rem !important;\n  }\n  .row-gap-md-3 {\n    row-gap: 1rem !important;\n  }\n  .row-gap-md-4 {\n    row-gap: 1.5rem !important;\n  }\n  .row-gap-md-5 {\n    row-gap: 3rem !important;\n  }\n  .column-gap-md-0 {\n    -moz-column-gap: 0 !important;\n    column-gap: 0 !important;\n  }\n  .column-gap-md-1 {\n    -moz-column-gap: 0.25rem !important;\n    column-gap: 0.25rem !important;\n  }\n  .column-gap-md-2 {\n    -moz-column-gap: 0.5rem !important;\n    column-gap: 0.5rem !important;\n  }\n  .column-gap-md-3 {\n    -moz-column-gap: 1rem !important;\n    column-gap: 1rem !important;\n  }\n  .column-gap-md-4 {\n    -moz-column-gap: 1.5rem !important;\n    column-gap: 1.5rem !important;\n  }\n  .column-gap-md-5 {\n    -moz-column-gap: 3rem !important;\n    column-gap: 3rem !important;\n  }\n  .text-md-start {\n    text-align: left !important;\n  }\n  .text-md-end {\n    text-align: right !important;\n  }\n  .text-md-center {\n    text-align: center !important;\n  }\n}\n@media (min-width: 992px) {\n  .float-lg-start {\n    float: left !important;\n  }\n  .float-lg-end {\n    float: right !important;\n  }\n  .float-lg-none {\n    float: none !important;\n  }\n  .object-fit-lg-contain {\n    -o-object-fit: contain !important;\n    object-fit: contain !important;\n  }\n  .object-fit-lg-cover {\n    -o-object-fit: cover !important;\n    object-fit: cover !important;\n  }\n  .object-fit-lg-fill {\n    -o-object-fit: fill !important;\n    object-fit: fill !important;\n  }\n  .object-fit-lg-scale {\n    -o-object-fit: scale-down !important;\n    object-fit: scale-down !important;\n  }\n  .object-fit-lg-none {\n    -o-object-fit: none !important;\n    object-fit: none !important;\n  }\n  .d-lg-inline {\n    display: inline !important;\n  }\n  .d-lg-inline-block {\n    display: inline-block !important;\n  }\n  .d-lg-block {\n    display: block !important;\n  }\n  .d-lg-grid {\n    display: grid !important;\n  }\n  .d-lg-inline-grid {\n    display: inline-grid !important;\n  }\n  .d-lg-table {\n    display: table !important;\n  }\n  .d-lg-table-row {\n    display: table-row !important;\n  }\n  .d-lg-table-cell {\n    display: table-cell !important;\n  }\n  .d-lg-flex {\n    display: flex !important;\n  }\n  .d-lg-inline-flex {\n    display: inline-flex !important;\n  }\n  .d-lg-none {\n    display: none !important;\n  }\n  .flex-lg-fill {\n    flex: 1 1 auto !important;\n  }\n  .flex-lg-row {\n    flex-direction: row !important;\n  }\n  .flex-lg-column {\n    flex-direction: column !important;\n  }\n  .flex-lg-row-reverse {\n    flex-direction: row-reverse !important;\n  }\n  .flex-lg-column-reverse {\n    flex-direction: column-reverse !important;\n  }\n  .flex-lg-grow-0 {\n    flex-grow: 0 !important;\n  }\n  .flex-lg-grow-1 {\n    flex-grow: 1 !important;\n  }\n  .flex-lg-shrink-0 {\n    flex-shrink: 0 !important;\n  }\n  .flex-lg-shrink-1 {\n    flex-shrink: 1 !important;\n  }\n  .flex-lg-wrap {\n    flex-wrap: wrap !important;\n  }\n  .flex-lg-nowrap {\n    flex-wrap: nowrap !important;\n  }\n  .flex-lg-wrap-reverse {\n    flex-wrap: wrap-reverse !important;\n  }\n  .justify-content-lg-start {\n    justify-content: flex-start !important;\n  }\n  .justify-content-lg-end {\n    justify-content: flex-end !important;\n  }\n  .justify-content-lg-center {\n    justify-content: center !important;\n  }\n  .justify-content-lg-between {\n    justify-content: space-between !important;\n  }\n  .justify-content-lg-around {\n    justify-content: space-around !important;\n  }\n  .justify-content-lg-evenly {\n    justify-content: space-evenly !important;\n  }\n  .align-items-lg-start {\n    align-items: flex-start !important;\n  }\n  .align-items-lg-end {\n    align-items: flex-end !important;\n  }\n  .align-items-lg-center {\n    align-items: center !important;\n  }\n  .align-items-lg-baseline {\n    align-items: baseline !important;\n  }\n  .align-items-lg-stretch {\n    align-items: stretch !important;\n  }\n  .align-content-lg-start {\n    align-content: flex-start !important;\n  }\n  .align-content-lg-end {\n    align-content: flex-end !important;\n  }\n  .align-content-lg-center {\n    align-content: center !important;\n  }\n  .align-content-lg-between {\n    align-content: space-between !important;\n  }\n  .align-content-lg-around {\n    align-content: space-around !important;\n  }\n  .align-content-lg-stretch {\n    align-content: stretch !important;\n  }\n  .align-self-lg-auto {\n    align-self: auto !important;\n  }\n  .align-self-lg-start {\n    align-self: flex-start !important;\n  }\n  .align-self-lg-end {\n    align-self: flex-end !important;\n  }\n  .align-self-lg-center {\n    align-self: center !important;\n  }\n  .align-self-lg-baseline {\n    align-self: baseline !important;\n  }\n  .align-self-lg-stretch {\n    align-self: stretch !important;\n  }\n  .order-lg-first {\n    order: -1 !important;\n  }\n  .order-lg-0 {\n    order: 0 !important;\n  }\n  .order-lg-1 {\n    order: 1 !important;\n  }\n  .order-lg-2 {\n    order: 2 !important;\n  }\n  .order-lg-3 {\n    order: 3 !important;\n  }\n  .order-lg-4 {\n    order: 4 !important;\n  }\n  .order-lg-5 {\n    order: 5 !important;\n  }\n  .order-lg-last {\n    order: 6 !important;\n  }\n  .m-lg-0 {\n    margin: 0 !important;\n  }\n  .m-lg-1 {\n    margin: 0.25rem !important;\n  }\n  .m-lg-2 {\n    margin: 0.5rem !important;\n  }\n  .m-lg-3 {\n    margin: 1rem !important;\n  }\n  .m-lg-4 {\n    margin: 1.5rem !important;\n  }\n  .m-lg-5 {\n    margin: 3rem !important;\n  }\n  .m-lg-auto {\n    margin: auto !important;\n  }\n  .mx-lg-0 {\n    margin-right: 0 !important;\n    margin-left: 0 !important;\n  }\n  .mx-lg-1 {\n    margin-right: 0.25rem !important;\n    margin-left: 0.25rem !important;\n  }\n  .mx-lg-2 {\n    margin-right: 0.5rem !important;\n    margin-left: 0.5rem !important;\n  }\n  .mx-lg-3 {\n    margin-right: 1rem !important;\n    margin-left: 1rem !important;\n  }\n  .mx-lg-4 {\n    margin-right: 1.5rem !important;\n    margin-left: 1.5rem !important;\n  }\n  .mx-lg-5 {\n    margin-right: 3rem !important;\n    margin-left: 3rem !important;\n  }\n  .mx-lg-auto {\n    margin-right: auto !important;\n    margin-left: auto !important;\n  }\n  .my-lg-0 {\n    margin-top: 0 !important;\n    margin-bottom: 0 !important;\n  }\n  .my-lg-1 {\n    margin-top: 0.25rem !important;\n    margin-bottom: 0.25rem !important;\n  }\n  .my-lg-2 {\n    margin-top: 0.5rem !important;\n    margin-bottom: 0.5rem !important;\n  }\n  .my-lg-3 {\n    margin-top: 1rem !important;\n    margin-bottom: 1rem !important;\n  }\n  .my-lg-4 {\n    margin-top: 1.5rem !important;\n    margin-bottom: 1.5rem !important;\n  }\n  .my-lg-5 {\n    margin-top: 3rem !important;\n    margin-bottom: 3rem !important;\n  }\n  .my-lg-auto {\n    margin-top: auto !important;\n    margin-bottom: auto !important;\n  }\n  .mt-lg-0 {\n    margin-top: 0 !important;\n  }\n  .mt-lg-1 {\n    margin-top: 0.25rem !important;\n  }\n  .mt-lg-2 {\n    margin-top: 0.5rem !important;\n  }\n  .mt-lg-3 {\n    margin-top: 1rem !important;\n  }\n  .mt-lg-4 {\n    margin-top: 1.5rem !important;\n  }\n  .mt-lg-5 {\n    margin-top: 3rem !important;\n  }\n  .mt-lg-auto {\n    margin-top: auto !important;\n  }\n  .me-lg-0 {\n    margin-right: 0 !important;\n  }\n  .me-lg-1 {\n    margin-right: 0.25rem !important;\n  }\n  .me-lg-2 {\n    margin-right: 0.5rem !important;\n  }\n  .me-lg-3 {\n    margin-right: 1rem !important;\n  }\n  .me-lg-4 {\n    margin-right: 1.5rem !important;\n  }\n  .me-lg-5 {\n    margin-right: 3rem !important;\n  }\n  .me-lg-auto {\n    margin-right: auto !important;\n  }\n  .mb-lg-0 {\n    margin-bottom: 0 !important;\n  }\n  .mb-lg-1 {\n    margin-bottom: 0.25rem !important;\n  }\n  .mb-lg-2 {\n    margin-bottom: 0.5rem !important;\n  }\n  .mb-lg-3 {\n    margin-bottom: 1rem !important;\n  }\n  .mb-lg-4 {\n    margin-bottom: 1.5rem !important;\n  }\n  .mb-lg-5 {\n    margin-bottom: 3rem !important;\n  }\n  .mb-lg-auto {\n    margin-bottom: auto !important;\n  }\n  .ms-lg-0 {\n    margin-left: 0 !important;\n  }\n  .ms-lg-1 {\n    margin-left: 0.25rem !important;\n  }\n  .ms-lg-2 {\n    margin-left: 0.5rem !important;\n  }\n  .ms-lg-3 {\n    margin-left: 1rem !important;\n  }\n  .ms-lg-4 {\n    margin-left: 1.5rem !important;\n  }\n  .ms-lg-5 {\n    margin-left: 3rem !important;\n  }\n  .ms-lg-auto {\n    margin-left: auto !important;\n  }\n  .p-lg-0 {\n    padding: 0 !important;\n  }\n  .p-lg-1 {\n    padding: 0.25rem !important;\n  }\n  .p-lg-2 {\n    padding: 0.5rem !important;\n  }\n  .p-lg-3 {\n    padding: 1rem !important;\n  }\n  .p-lg-4 {\n    padding: 1.5rem !important;\n  }\n  .p-lg-5 {\n    padding: 3rem !important;\n  }\n  .px-lg-0 {\n    padding-right: 0 !important;\n    padding-left: 0 !important;\n  }\n  .px-lg-1 {\n    padding-right: 0.25rem !important;\n    padding-left: 0.25rem !important;\n  }\n  .px-lg-2 {\n    padding-right: 0.5rem !important;\n    padding-left: 0.5rem !important;\n  }\n  .px-lg-3 {\n    padding-right: 1rem !important;\n    padding-left: 1rem !important;\n  }\n  .px-lg-4 {\n    padding-right: 1.5rem !important;\n    padding-left: 1.5rem !important;\n  }\n  .px-lg-5 {\n    padding-right: 3rem !important;\n    padding-left: 3rem !important;\n  }\n  .py-lg-0 {\n    padding-top: 0 !important;\n    padding-bottom: 0 !important;\n  }\n  .py-lg-1 {\n    padding-top: 0.25rem !important;\n    padding-bottom: 0.25rem !important;\n  }\n  .py-lg-2 {\n    padding-top: 0.5rem !important;\n    padding-bottom: 0.5rem !important;\n  }\n  .py-lg-3 {\n    padding-top: 1rem !important;\n    padding-bottom: 1rem !important;\n  }\n  .py-lg-4 {\n    padding-top: 1.5rem !important;\n    padding-bottom: 1.5rem !important;\n  }\n  .py-lg-5 {\n    padding-top: 3rem !important;\n    padding-bottom: 3rem !important;\n  }\n  .pt-lg-0 {\n    padding-top: 0 !important;\n  }\n  .pt-lg-1 {\n    padding-top: 0.25rem !important;\n  }\n  .pt-lg-2 {\n    padding-top: 0.5rem !important;\n  }\n  .pt-lg-3 {\n    padding-top: 1rem !important;\n  }\n  .pt-lg-4 {\n    padding-top: 1.5rem !important;\n  }\n  .pt-lg-5 {\n    padding-top: 3rem !important;\n  }\n  .pe-lg-0 {\n    padding-right: 0 !important;\n  }\n  .pe-lg-1 {\n    padding-right: 0.25rem !important;\n  }\n  .pe-lg-2 {\n    padding-right: 0.5rem !important;\n  }\n  .pe-lg-3 {\n    padding-right: 1rem !important;\n  }\n  .pe-lg-4 {\n    padding-right: 1.5rem !important;\n  }\n  .pe-lg-5 {\n    padding-right: 3rem !important;\n  }\n  .pb-lg-0 {\n    padding-bottom: 0 !important;\n  }\n  .pb-lg-1 {\n    padding-bottom: 0.25rem !important;\n  }\n  .pb-lg-2 {\n    padding-bottom: 0.5rem !important;\n  }\n  .pb-lg-3 {\n    padding-bottom: 1rem !important;\n  }\n  .pb-lg-4 {\n    padding-bottom: 1.5rem !important;\n  }\n  .pb-lg-5 {\n    padding-bottom: 3rem !important;\n  }\n  .ps-lg-0 {\n    padding-left: 0 !important;\n  }\n  .ps-lg-1 {\n    padding-left: 0.25rem !important;\n  }\n  .ps-lg-2 {\n    padding-left: 0.5rem !important;\n  }\n  .ps-lg-3 {\n    padding-left: 1rem !important;\n  }\n  .ps-lg-4 {\n    padding-left: 1.5rem !important;\n  }\n  .ps-lg-5 {\n    padding-left: 3rem !important;\n  }\n  .gap-lg-0 {\n    gap: 0 !important;\n  }\n  .gap-lg-1 {\n    gap: 0.25rem !important;\n  }\n  .gap-lg-2 {\n    gap: 0.5rem !important;\n  }\n  .gap-lg-3 {\n    gap: 1rem !important;\n  }\n  .gap-lg-4 {\n    gap: 1.5rem !important;\n  }\n  .gap-lg-5 {\n    gap: 3rem !important;\n  }\n  .row-gap-lg-0 {\n    row-gap: 0 !important;\n  }\n  .row-gap-lg-1 {\n    row-gap: 0.25rem !important;\n  }\n  .row-gap-lg-2 {\n    row-gap: 0.5rem !important;\n  }\n  .row-gap-lg-3 {\n    row-gap: 1rem !important;\n  }\n  .row-gap-lg-4 {\n    row-gap: 1.5rem !important;\n  }\n  .row-gap-lg-5 {\n    row-gap: 3rem !important;\n  }\n  .column-gap-lg-0 {\n    -moz-column-gap: 0 !important;\n    column-gap: 0 !important;\n  }\n  .column-gap-lg-1 {\n    -moz-column-gap: 0.25rem !important;\n    column-gap: 0.25rem !important;\n  }\n  .column-gap-lg-2 {\n    -moz-column-gap: 0.5rem !important;\n    column-gap: 0.5rem !important;\n  }\n  .column-gap-lg-3 {\n    -moz-column-gap: 1rem !important;\n    column-gap: 1rem !important;\n  }\n  .column-gap-lg-4 {\n    -moz-column-gap: 1.5rem !important;\n    column-gap: 1.5rem !important;\n  }\n  .column-gap-lg-5 {\n    -moz-column-gap: 3rem !important;\n    column-gap: 3rem !important;\n  }\n  .text-lg-start {\n    text-align: left !important;\n  }\n  .text-lg-end {\n    text-align: right !important;\n  }\n  .text-lg-center {\n    text-align: center !important;\n  }\n}\n@media (min-width: 1200px) {\n  .float-xl-start {\n    float: left !important;\n  }\n  .float-xl-end {\n    float: right !important;\n  }\n  .float-xl-none {\n    float: none !important;\n  }\n  .object-fit-xl-contain {\n    -o-object-fit: contain !important;\n    object-fit: contain !important;\n  }\n  .object-fit-xl-cover {\n    -o-object-fit: cover !important;\n    object-fit: cover !important;\n  }\n  .object-fit-xl-fill {\n    -o-object-fit: fill !important;\n    object-fit: fill !important;\n  }\n  .object-fit-xl-scale {\n    -o-object-fit: scale-down !important;\n    object-fit: scale-down !important;\n  }\n  .object-fit-xl-none {\n    -o-object-fit: none !important;\n    object-fit: none !important;\n  }\n  .d-xl-inline {\n    display: inline !important;\n  }\n  .d-xl-inline-block {\n    display: inline-block !important;\n  }\n  .d-xl-block {\n    display: block !important;\n  }\n  .d-xl-grid {\n    display: grid !important;\n  }\n  .d-xl-inline-grid {\n    display: inline-grid !important;\n  }\n  .d-xl-table {\n    display: table !important;\n  }\n  .d-xl-table-row {\n    display: table-row !important;\n  }\n  .d-xl-table-cell {\n    display: table-cell !important;\n  }\n  .d-xl-flex {\n    display: flex !important;\n  }\n  .d-xl-inline-flex {\n    display: inline-flex !important;\n  }\n  .d-xl-none {\n    display: none !important;\n  }\n  .flex-xl-fill {\n    flex: 1 1 auto !important;\n  }\n  .flex-xl-row {\n    flex-direction: row !important;\n  }\n  .flex-xl-column {\n    flex-direction: column !important;\n  }\n  .flex-xl-row-reverse {\n    flex-direction: row-reverse !important;\n  }\n  .flex-xl-column-reverse {\n    flex-direction: column-reverse !important;\n  }\n  .flex-xl-grow-0 {\n    flex-grow: 0 !important;\n  }\n  .flex-xl-grow-1 {\n    flex-grow: 1 !important;\n  }\n  .flex-xl-shrink-0 {\n    flex-shrink: 0 !important;\n  }\n  .flex-xl-shrink-1 {\n    flex-shrink: 1 !important;\n  }\n  .flex-xl-wrap {\n    flex-wrap: wrap !important;\n  }\n  .flex-xl-nowrap {\n    flex-wrap: nowrap !important;\n  }\n  .flex-xl-wrap-reverse {\n    flex-wrap: wrap-reverse !important;\n  }\n  .justify-content-xl-start {\n    justify-content: flex-start !important;\n  }\n  .justify-content-xl-end {\n    justify-content: flex-end !important;\n  }\n  .justify-content-xl-center {\n    justify-content: center !important;\n  }\n  .justify-content-xl-between {\n    justify-content: space-between !important;\n  }\n  .justify-content-xl-around {\n    justify-content: space-around !important;\n  }\n  .justify-content-xl-evenly {\n    justify-content: space-evenly !important;\n  }\n  .align-items-xl-start {\n    align-items: flex-start !important;\n  }\n  .align-items-xl-end {\n    align-items: flex-end !important;\n  }\n  .align-items-xl-center {\n    align-items: center !important;\n  }\n  .align-items-xl-baseline {\n    align-items: baseline !important;\n  }\n  .align-items-xl-stretch {\n    align-items: stretch !important;\n  }\n  .align-content-xl-start {\n    align-content: flex-start !important;\n  }\n  .align-content-xl-end {\n    align-content: flex-end !important;\n  }\n  .align-content-xl-center {\n    align-content: center !important;\n  }\n  .align-content-xl-between {\n    align-content: space-between !important;\n  }\n  .align-content-xl-around {\n    align-content: space-around !important;\n  }\n  .align-content-xl-stretch {\n    align-content: stretch !important;\n  }\n  .align-self-xl-auto {\n    align-self: auto !important;\n  }\n  .align-self-xl-start {\n    align-self: flex-start !important;\n  }\n  .align-self-xl-end {\n    align-self: flex-end !important;\n  }\n  .align-self-xl-center {\n    align-self: center !important;\n  }\n  .align-self-xl-baseline {\n    align-self: baseline !important;\n  }\n  .align-self-xl-stretch {\n    align-self: stretch !important;\n  }\n  .order-xl-first {\n    order: -1 !important;\n  }\n  .order-xl-0 {\n    order: 0 !important;\n  }\n  .order-xl-1 {\n    order: 1 !important;\n  }\n  .order-xl-2 {\n    order: 2 !important;\n  }\n  .order-xl-3 {\n    order: 3 !important;\n  }\n  .order-xl-4 {\n    order: 4 !important;\n  }\n  .order-xl-5 {\n    order: 5 !important;\n  }\n  .order-xl-last {\n    order: 6 !important;\n  }\n  .m-xl-0 {\n    margin: 0 !important;\n  }\n  .m-xl-1 {\n    margin: 0.25rem !important;\n  }\n  .m-xl-2 {\n    margin: 0.5rem !important;\n  }\n  .m-xl-3 {\n    margin: 1rem !important;\n  }\n  .m-xl-4 {\n    margin: 1.5rem !important;\n  }\n  .m-xl-5 {\n    margin: 3rem !important;\n  }\n  .m-xl-auto {\n    margin: auto !important;\n  }\n  .mx-xl-0 {\n    margin-right: 0 !important;\n    margin-left: 0 !important;\n  }\n  .mx-xl-1 {\n    margin-right: 0.25rem !important;\n    margin-left: 0.25rem !important;\n  }\n  .mx-xl-2 {\n    margin-right: 0.5rem !important;\n    margin-left: 0.5rem !important;\n  }\n  .mx-xl-3 {\n    margin-right: 1rem !important;\n    margin-left: 1rem !important;\n  }\n  .mx-xl-4 {\n    margin-right: 1.5rem !important;\n    margin-left: 1.5rem !important;\n  }\n  .mx-xl-5 {\n    margin-right: 3rem !important;\n    margin-left: 3rem !important;\n  }\n  .mx-xl-auto {\n    margin-right: auto !important;\n    margin-left: auto !important;\n  }\n  .my-xl-0 {\n    margin-top: 0 !important;\n    margin-bottom: 0 !important;\n  }\n  .my-xl-1 {\n    margin-top: 0.25rem !important;\n    margin-bottom: 0.25rem !important;\n  }\n  .my-xl-2 {\n    margin-top: 0.5rem !important;\n    margin-bottom: 0.5rem !important;\n  }\n  .my-xl-3 {\n    margin-top: 1rem !important;\n    margin-bottom: 1rem !important;\n  }\n  .my-xl-4 {\n    margin-top: 1.5rem !important;\n    margin-bottom: 1.5rem !important;\n  }\n  .my-xl-5 {\n    margin-top: 3rem !important;\n    margin-bottom: 3rem !important;\n  }\n  .my-xl-auto {\n    margin-top: auto !important;\n    margin-bottom: auto !important;\n  }\n  .mt-xl-0 {\n    margin-top: 0 !important;\n  }\n  .mt-xl-1 {\n    margin-top: 0.25rem !important;\n  }\n  .mt-xl-2 {\n    margin-top: 0.5rem !important;\n  }\n  .mt-xl-3 {\n    margin-top: 1rem !important;\n  }\n  .mt-xl-4 {\n    margin-top: 1.5rem !important;\n  }\n  .mt-xl-5 {\n    margin-top: 3rem !important;\n  }\n  .mt-xl-auto {\n    margin-top: auto !important;\n  }\n  .me-xl-0 {\n    margin-right: 0 !important;\n  }\n  .me-xl-1 {\n    margin-right: 0.25rem !important;\n  }\n  .me-xl-2 {\n    margin-right: 0.5rem !important;\n  }\n  .me-xl-3 {\n    margin-right: 1rem !important;\n  }\n  .me-xl-4 {\n    margin-right: 1.5rem !important;\n  }\n  .me-xl-5 {\n    margin-right: 3rem !important;\n  }\n  .me-xl-auto {\n    margin-right: auto !important;\n  }\n  .mb-xl-0 {\n    margin-bottom: 0 !important;\n  }\n  .mb-xl-1 {\n    margin-bottom: 0.25rem !important;\n  }\n  .mb-xl-2 {\n    margin-bottom: 0.5rem !important;\n  }\n  .mb-xl-3 {\n    margin-bottom: 1rem !important;\n  }\n  .mb-xl-4 {\n    margin-bottom: 1.5rem !important;\n  }\n  .mb-xl-5 {\n    margin-bottom: 3rem !important;\n  }\n  .mb-xl-auto {\n    margin-bottom: auto !important;\n  }\n  .ms-xl-0 {\n    margin-left: 0 !important;\n  }\n  .ms-xl-1 {\n    margin-left: 0.25rem !important;\n  }\n  .ms-xl-2 {\n    margin-left: 0.5rem !important;\n  }\n  .ms-xl-3 {\n    margin-left: 1rem !important;\n  }\n  .ms-xl-4 {\n    margin-left: 1.5rem !important;\n  }\n  .ms-xl-5 {\n    margin-left: 3rem !important;\n  }\n  .ms-xl-auto {\n    margin-left: auto !important;\n  }\n  .p-xl-0 {\n    padding: 0 !important;\n  }\n  .p-xl-1 {\n    padding: 0.25rem !important;\n  }\n  .p-xl-2 {\n    padding: 0.5rem !important;\n  }\n  .p-xl-3 {\n    padding: 1rem !important;\n  }\n  .p-xl-4 {\n    padding: 1.5rem !important;\n  }\n  .p-xl-5 {\n    padding: 3rem !important;\n  }\n  .px-xl-0 {\n    padding-right: 0 !important;\n    padding-left: 0 !important;\n  }\n  .px-xl-1 {\n    padding-right: 0.25rem !important;\n    padding-left: 0.25rem !important;\n  }\n  .px-xl-2 {\n    padding-right: 0.5rem !important;\n    padding-left: 0.5rem !important;\n  }\n  .px-xl-3 {\n    padding-right: 1rem !important;\n    padding-left: 1rem !important;\n  }\n  .px-xl-4 {\n    padding-right: 1.5rem !important;\n    padding-left: 1.5rem !important;\n  }\n  .px-xl-5 {\n    padding-right: 3rem !important;\n    padding-left: 3rem !important;\n  }\n  .py-xl-0 {\n    padding-top: 0 !important;\n    padding-bottom: 0 !important;\n  }\n  .py-xl-1 {\n    padding-top: 0.25rem !important;\n    padding-bottom: 0.25rem !important;\n  }\n  .py-xl-2 {\n    padding-top: 0.5rem !important;\n    padding-bottom: 0.5rem !important;\n  }\n  .py-xl-3 {\n    padding-top: 1rem !important;\n    padding-bottom: 1rem !important;\n  }\n  .py-xl-4 {\n    padding-top: 1.5rem !important;\n    padding-bottom: 1.5rem !important;\n  }\n  .py-xl-5 {\n    padding-top: 3rem !important;\n    padding-bottom: 3rem !important;\n  }\n  .pt-xl-0 {\n    padding-top: 0 !important;\n  }\n  .pt-xl-1 {\n    padding-top: 0.25rem !important;\n  }\n  .pt-xl-2 {\n    padding-top: 0.5rem !important;\n  }\n  .pt-xl-3 {\n    padding-top: 1rem !important;\n  }\n  .pt-xl-4 {\n    padding-top: 1.5rem !important;\n  }\n  .pt-xl-5 {\n    padding-top: 3rem !important;\n  }\n  .pe-xl-0 {\n    padding-right: 0 !important;\n  }\n  .pe-xl-1 {\n    padding-right: 0.25rem !important;\n  }\n  .pe-xl-2 {\n    padding-right: 0.5rem !important;\n  }\n  .pe-xl-3 {\n    padding-right: 1rem !important;\n  }\n  .pe-xl-4 {\n    padding-right: 1.5rem !important;\n  }\n  .pe-xl-5 {\n    padding-right: 3rem !important;\n  }\n  .pb-xl-0 {\n    padding-bottom: 0 !important;\n  }\n  .pb-xl-1 {\n    padding-bottom: 0.25rem !important;\n  }\n  .pb-xl-2 {\n    padding-bottom: 0.5rem !important;\n  }\n  .pb-xl-3 {\n    padding-bottom: 1rem !important;\n  }\n  .pb-xl-4 {\n    padding-bottom: 1.5rem !important;\n  }\n  .pb-xl-5 {\n    padding-bottom: 3rem !important;\n  }\n  .ps-xl-0 {\n    padding-left: 0 !important;\n  }\n  .ps-xl-1 {\n    padding-left: 0.25rem !important;\n  }\n  .ps-xl-2 {\n    padding-left: 0.5rem !important;\n  }\n  .ps-xl-3 {\n    padding-left: 1rem !important;\n  }\n  .ps-xl-4 {\n    padding-left: 1.5rem !important;\n  }\n  .ps-xl-5 {\n    padding-left: 3rem !important;\n  }\n  .gap-xl-0 {\n    gap: 0 !important;\n  }\n  .gap-xl-1 {\n    gap: 0.25rem !important;\n  }\n  .gap-xl-2 {\n    gap: 0.5rem !important;\n  }\n  .gap-xl-3 {\n    gap: 1rem !important;\n  }\n  .gap-xl-4 {\n    gap: 1.5rem !important;\n  }\n  .gap-xl-5 {\n    gap: 3rem !important;\n  }\n  .row-gap-xl-0 {\n    row-gap: 0 !important;\n  }\n  .row-gap-xl-1 {\n    row-gap: 0.25rem !important;\n  }\n  .row-gap-xl-2 {\n    row-gap: 0.5rem !important;\n  }\n  .row-gap-xl-3 {\n    row-gap: 1rem !important;\n  }\n  .row-gap-xl-4 {\n    row-gap: 1.5rem !important;\n  }\n  .row-gap-xl-5 {\n    row-gap: 3rem !important;\n  }\n  .column-gap-xl-0 {\n    -moz-column-gap: 0 !important;\n    column-gap: 0 !important;\n  }\n  .column-gap-xl-1 {\n    -moz-column-gap: 0.25rem !important;\n    column-gap: 0.25rem !important;\n  }\n  .column-gap-xl-2 {\n    -moz-column-gap: 0.5rem !important;\n    column-gap: 0.5rem !important;\n  }\n  .column-gap-xl-3 {\n    -moz-column-gap: 1rem !important;\n    column-gap: 1rem !important;\n  }\n  .column-gap-xl-4 {\n    -moz-column-gap: 1.5rem !important;\n    column-gap: 1.5rem !important;\n  }\n  .column-gap-xl-5 {\n    -moz-column-gap: 3rem !important;\n    column-gap: 3rem !important;\n  }\n  .text-xl-start {\n    text-align: left !important;\n  }\n  .text-xl-end {\n    text-align: right !important;\n  }\n  .text-xl-center {\n    text-align: center !important;\n  }\n}\n@media (min-width: 1400px) {\n  .float-xxl-start {\n    float: left !important;\n  }\n  .float-xxl-end {\n    float: right !important;\n  }\n  .float-xxl-none {\n    float: none !important;\n  }\n  .object-fit-xxl-contain {\n    -o-object-fit: contain !important;\n    object-fit: contain !important;\n  }\n  .object-fit-xxl-cover {\n    -o-object-fit: cover !important;\n    object-fit: cover !important;\n  }\n  .object-fit-xxl-fill {\n    -o-object-fit: fill !important;\n    object-fit: fill !important;\n  }\n  .object-fit-xxl-scale {\n    -o-object-fit: scale-down !important;\n    object-fit: scale-down !important;\n  }\n  .object-fit-xxl-none {\n    -o-object-fit: none !important;\n    object-fit: none !important;\n  }\n  .d-xxl-inline {\n    display: inline !important;\n  }\n  .d-xxl-inline-block {\n    display: inline-block !important;\n  }\n  .d-xxl-block {\n    display: block !important;\n  }\n  .d-xxl-grid {\n    display: grid !important;\n  }\n  .d-xxl-inline-grid {\n    display: inline-grid !important;\n  }\n  .d-xxl-table {\n    display: table !important;\n  }\n  .d-xxl-table-row {\n    display: table-row !important;\n  }\n  .d-xxl-table-cell {\n    display: table-cell !important;\n  }\n  .d-xxl-flex {\n    display: flex !important;\n  }\n  .d-xxl-inline-flex {\n    display: inline-flex !important;\n  }\n  .d-xxl-none {\n    display: none !important;\n  }\n  .flex-xxl-fill {\n    flex: 1 1 auto !important;\n  }\n  .flex-xxl-row {\n    flex-direction: row !important;\n  }\n  .flex-xxl-column {\n    flex-direction: column !important;\n  }\n  .flex-xxl-row-reverse {\n    flex-direction: row-reverse !important;\n  }\n  .flex-xxl-column-reverse {\n    flex-direction: column-reverse !important;\n  }\n  .flex-xxl-grow-0 {\n    flex-grow: 0 !important;\n  }\n  .flex-xxl-grow-1 {\n    flex-grow: 1 !important;\n  }\n  .flex-xxl-shrink-0 {\n    flex-shrink: 0 !important;\n  }\n  .flex-xxl-shrink-1 {\n    flex-shrink: 1 !important;\n  }\n  .flex-xxl-wrap {\n    flex-wrap: wrap !important;\n  }\n  .flex-xxl-nowrap {\n    flex-wrap: nowrap !important;\n  }\n  .flex-xxl-wrap-reverse {\n    flex-wrap: wrap-reverse !important;\n  }\n  .justify-content-xxl-start {\n    justify-content: flex-start !important;\n  }\n  .justify-content-xxl-end {\n    justify-content: flex-end !important;\n  }\n  .justify-content-xxl-center {\n    justify-content: center !important;\n  }\n  .justify-content-xxl-between {\n    justify-content: space-between !important;\n  }\n  .justify-content-xxl-around {\n    justify-content: space-around !important;\n  }\n  .justify-content-xxl-evenly {\n    justify-content: space-evenly !important;\n  }\n  .align-items-xxl-start {\n    align-items: flex-start !important;\n  }\n  .align-items-xxl-end {\n    align-items: flex-end !important;\n  }\n  .align-items-xxl-center {\n    align-items: center !important;\n  }\n  .align-items-xxl-baseline {\n    align-items: baseline !important;\n  }\n  .align-items-xxl-stretch {\n    align-items: stretch !important;\n  }\n  .align-content-xxl-start {\n    align-content: flex-start !important;\n  }\n  .align-content-xxl-end {\n    align-content: flex-end !important;\n  }\n  .align-content-xxl-center {\n    align-content: center !important;\n  }\n  .align-content-xxl-between {\n    align-content: space-between !important;\n  }\n  .align-content-xxl-around {\n    align-content: space-around !important;\n  }\n  .align-content-xxl-stretch {\n    align-content: stretch !important;\n  }\n  .align-self-xxl-auto {\n    align-self: auto !important;\n  }\n  .align-self-xxl-start {\n    align-self: flex-start !important;\n  }\n  .align-self-xxl-end {\n    align-self: flex-end !important;\n  }\n  .align-self-xxl-center {\n    align-self: center !important;\n  }\n  .align-self-xxl-baseline {\n    align-self: baseline !important;\n  }\n  .align-self-xxl-stretch {\n    align-self: stretch !important;\n  }\n  .order-xxl-first {\n    order: -1 !important;\n  }\n  .order-xxl-0 {\n    order: 0 !important;\n  }\n  .order-xxl-1 {\n    order: 1 !important;\n  }\n  .order-xxl-2 {\n    order: 2 !important;\n  }\n  .order-xxl-3 {\n    order: 3 !important;\n  }\n  .order-xxl-4 {\n    order: 4 !important;\n  }\n  .order-xxl-5 {\n    order: 5 !important;\n  }\n  .order-xxl-last {\n    order: 6 !important;\n  }\n  .m-xxl-0 {\n    margin: 0 !important;\n  }\n  .m-xxl-1 {\n    margin: 0.25rem !important;\n  }\n  .m-xxl-2 {\n    margin: 0.5rem !important;\n  }\n  .m-xxl-3 {\n    margin: 1rem !important;\n  }\n  .m-xxl-4 {\n    margin: 1.5rem !important;\n  }\n  .m-xxl-5 {\n    margin: 3rem !important;\n  }\n  .m-xxl-auto {\n    margin: auto !important;\n  }\n  .mx-xxl-0 {\n    margin-right: 0 !important;\n    margin-left: 0 !important;\n  }\n  .mx-xxl-1 {\n    margin-right: 0.25rem !important;\n    margin-left: 0.25rem !important;\n  }\n  .mx-xxl-2 {\n    margin-right: 0.5rem !important;\n    margin-left: 0.5rem !important;\n  }\n  .mx-xxl-3 {\n    margin-right: 1rem !important;\n    margin-left: 1rem !important;\n  }\n  .mx-xxl-4 {\n    margin-right: 1.5rem !important;\n    margin-left: 1.5rem !important;\n  }\n  .mx-xxl-5 {\n    margin-right: 3rem !important;\n    margin-left: 3rem !important;\n  }\n  .mx-xxl-auto {\n    margin-right: auto !important;\n    margin-left: auto !important;\n  }\n  .my-xxl-0 {\n    margin-top: 0 !important;\n    margin-bottom: 0 !important;\n  }\n  .my-xxl-1 {\n    margin-top: 0.25rem !important;\n    margin-bottom: 0.25rem !important;\n  }\n  .my-xxl-2 {\n    margin-top: 0.5rem !important;\n    margin-bottom: 0.5rem !important;\n  }\n  .my-xxl-3 {\n    margin-top: 1rem !important;\n    margin-bottom: 1rem !important;\n  }\n  .my-xxl-4 {\n    margin-top: 1.5rem !important;\n    margin-bottom: 1.5rem !important;\n  }\n  .my-xxl-5 {\n    margin-top: 3rem !important;\n    margin-bottom: 3rem !important;\n  }\n  .my-xxl-auto {\n    margin-top: auto !important;\n    margin-bottom: auto !important;\n  }\n  .mt-xxl-0 {\n    margin-top: 0 !important;\n  }\n  .mt-xxl-1 {\n    margin-top: 0.25rem !important;\n  }\n  .mt-xxl-2 {\n    margin-top: 0.5rem !important;\n  }\n  .mt-xxl-3 {\n    margin-top: 1rem !important;\n  }\n  .mt-xxl-4 {\n    margin-top: 1.5rem !important;\n  }\n  .mt-xxl-5 {\n    margin-top: 3rem !important;\n  }\n  .mt-xxl-auto {\n    margin-top: auto !important;\n  }\n  .me-xxl-0 {\n    margin-right: 0 !important;\n  }\n  .me-xxl-1 {\n    margin-right: 0.25rem !important;\n  }\n  .me-xxl-2 {\n    margin-right: 0.5rem !important;\n  }\n  .me-xxl-3 {\n    margin-right: 1rem !important;\n  }\n  .me-xxl-4 {\n    margin-right: 1.5rem !important;\n  }\n  .me-xxl-5 {\n    margin-right: 3rem !important;\n  }\n  .me-xxl-auto {\n    margin-right: auto !important;\n  }\n  .mb-xxl-0 {\n    margin-bottom: 0 !important;\n  }\n  .mb-xxl-1 {\n    margin-bottom: 0.25rem !important;\n  }\n  .mb-xxl-2 {\n    margin-bottom: 0.5rem !important;\n  }\n  .mb-xxl-3 {\n    margin-bottom: 1rem !important;\n  }\n  .mb-xxl-4 {\n    margin-bottom: 1.5rem !important;\n  }\n  .mb-xxl-5 {\n    margin-bottom: 3rem !important;\n  }\n  .mb-xxl-auto {\n    margin-bottom: auto !important;\n  }\n  .ms-xxl-0 {\n    margin-left: 0 !important;\n  }\n  .ms-xxl-1 {\n    margin-left: 0.25rem !important;\n  }\n  .ms-xxl-2 {\n    margin-left: 0.5rem !important;\n  }\n  .ms-xxl-3 {\n    margin-left: 1rem !important;\n  }\n  .ms-xxl-4 {\n    margin-left: 1.5rem !important;\n  }\n  .ms-xxl-5 {\n    margin-left: 3rem !important;\n  }\n  .ms-xxl-auto {\n    margin-left: auto !important;\n  }\n  .p-xxl-0 {\n    padding: 0 !important;\n  }\n  .p-xxl-1 {\n    padding: 0.25rem !important;\n  }\n  .p-xxl-2 {\n    padding: 0.5rem !important;\n  }\n  .p-xxl-3 {\n    padding: 1rem !important;\n  }\n  .p-xxl-4 {\n    padding: 1.5rem !important;\n  }\n  .p-xxl-5 {\n    padding: 3rem !important;\n  }\n  .px-xxl-0 {\n    padding-right: 0 !important;\n    padding-left: 0 !important;\n  }\n  .px-xxl-1 {\n    padding-right: 0.25rem !important;\n    padding-left: 0.25rem !important;\n  }\n  .px-xxl-2 {\n    padding-right: 0.5rem !important;\n    padding-left: 0.5rem !important;\n  }\n  .px-xxl-3 {\n    padding-right: 1rem !important;\n    padding-left: 1rem !important;\n  }\n  .px-xxl-4 {\n    padding-right: 1.5rem !important;\n    padding-left: 1.5rem !important;\n  }\n  .px-xxl-5 {\n    padding-right: 3rem !important;\n    padding-left: 3rem !important;\n  }\n  .py-xxl-0 {\n    padding-top: 0 !important;\n    padding-bottom: 0 !important;\n  }\n  .py-xxl-1 {\n    padding-top: 0.25rem !important;\n    padding-bottom: 0.25rem !important;\n  }\n  .py-xxl-2 {\n    padding-top: 0.5rem !important;\n    padding-bottom: 0.5rem !important;\n  }\n  .py-xxl-3 {\n    padding-top: 1rem !important;\n    padding-bottom: 1rem !important;\n  }\n  .py-xxl-4 {\n    padding-top: 1.5rem !important;\n    padding-bottom: 1.5rem !important;\n  }\n  .py-xxl-5 {\n    padding-top: 3rem !important;\n    padding-bottom: 3rem !important;\n  }\n  .pt-xxl-0 {\n    padding-top: 0 !important;\n  }\n  .pt-xxl-1 {\n    padding-top: 0.25rem !important;\n  }\n  .pt-xxl-2 {\n    padding-top: 0.5rem !important;\n  }\n  .pt-xxl-3 {\n    padding-top: 1rem !important;\n  }\n  .pt-xxl-4 {\n    padding-top: 1.5rem !important;\n  }\n  .pt-xxl-5 {\n    padding-top: 3rem !important;\n  }\n  .pe-xxl-0 {\n    padding-right: 0 !important;\n  }\n  .pe-xxl-1 {\n    padding-right: 0.25rem !important;\n  }\n  .pe-xxl-2 {\n    padding-right: 0.5rem !important;\n  }\n  .pe-xxl-3 {\n    padding-right: 1rem !important;\n  }\n  .pe-xxl-4 {\n    padding-right: 1.5rem !important;\n  }\n  .pe-xxl-5 {\n    padding-right: 3rem !important;\n  }\n  .pb-xxl-0 {\n    padding-bottom: 0 !important;\n  }\n  .pb-xxl-1 {\n    padding-bottom: 0.25rem !important;\n  }\n  .pb-xxl-2 {\n    padding-bottom: 0.5rem !important;\n  }\n  .pb-xxl-3 {\n    padding-bottom: 1rem !important;\n  }\n  .pb-xxl-4 {\n    padding-bottom: 1.5rem !important;\n  }\n  .pb-xxl-5 {\n    padding-bottom: 3rem !important;\n  }\n  .ps-xxl-0 {\n    padding-left: 0 !important;\n  }\n  .ps-xxl-1 {\n    padding-left: 0.25rem !important;\n  }\n  .ps-xxl-2 {\n    padding-left: 0.5rem !important;\n  }\n  .ps-xxl-3 {\n    padding-left: 1rem !important;\n  }\n  .ps-xxl-4 {\n    padding-left: 1.5rem !important;\n  }\n  .ps-xxl-5 {\n    padding-left: 3rem !important;\n  }\n  .gap-xxl-0 {\n    gap: 0 !important;\n  }\n  .gap-xxl-1 {\n    gap: 0.25rem !important;\n  }\n  .gap-xxl-2 {\n    gap: 0.5rem !important;\n  }\n  .gap-xxl-3 {\n    gap: 1rem !important;\n  }\n  .gap-xxl-4 {\n    gap: 1.5rem !important;\n  }\n  .gap-xxl-5 {\n    gap: 3rem !important;\n  }\n  .row-gap-xxl-0 {\n    row-gap: 0 !important;\n  }\n  .row-gap-xxl-1 {\n    row-gap: 0.25rem !important;\n  }\n  .row-gap-xxl-2 {\n    row-gap: 0.5rem !important;\n  }\n  .row-gap-xxl-3 {\n    row-gap: 1rem !important;\n  }\n  .row-gap-xxl-4 {\n    row-gap: 1.5rem !important;\n  }\n  .row-gap-xxl-5 {\n    row-gap: 3rem !important;\n  }\n  .column-gap-xxl-0 {\n    -moz-column-gap: 0 !important;\n    column-gap: 0 !important;\n  }\n  .column-gap-xxl-1 {\n    -moz-column-gap: 0.25rem !important;\n    column-gap: 0.25rem !important;\n  }\n  .column-gap-xxl-2 {\n    -moz-column-gap: 0.5rem !important;\n    column-gap: 0.5rem !important;\n  }\n  .column-gap-xxl-3 {\n    -moz-column-gap: 1rem !important;\n    column-gap: 1rem !important;\n  }\n  .column-gap-xxl-4 {\n    -moz-column-gap: 1.5rem !important;\n    column-gap: 1.5rem !important;\n  }\n  .column-gap-xxl-5 {\n    -moz-column-gap: 3rem !important;\n    column-gap: 3rem !important;\n  }\n  .text-xxl-start {\n    text-align: left !important;\n  }\n  .text-xxl-end {\n    text-align: right !important;\n  }\n  .text-xxl-center {\n    text-align: center !important;\n  }\n}\n@media (min-width: 1200px) {\n  .fs-1 {\n    font-size: 2.5rem !important;\n  }\n  .fs-2 {\n    font-size: 2rem !important;\n  }\n  .fs-3 {\n    font-size: 1.75rem !important;\n  }\n  .fs-4 {\n    font-size: 1.5rem !important;\n  }\n}\n@media print {\n  .d-print-inline {\n    display: inline !important;\n  }\n  .d-print-inline-block {\n    display: inline-block !important;\n  }\n  .d-print-block {\n    display: block !important;\n  }\n  .d-print-grid {\n    display: grid !important;\n  }\n  .d-print-inline-grid {\n    display: inline-grid !important;\n  }\n  .d-print-table {\n    display: table !important;\n  }\n  .d-print-table-row {\n    display: table-row !important;\n  }\n  .d-print-table-cell {\n    display: table-cell !important;\n  }\n  .d-print-flex {\n    display: flex !important;\n  }\n  .d-print-inline-flex {\n    display: inline-flex !important;\n  }\n  .d-print-none {\n    display: none !important;\n  }\n}\n/*# sourceMappingURL=bootstrap.min.css.map */\n'
    );

-- --------------------------------------------------------
-- Seed data for `templates`
-- --------------------------------------------------------

INSERT IGNORE INTO
    `templates` (
        `createdAt`,
        `updatedAt`,
        `deletedAt`,
        `isDeletionRestricted`,
        `id`,
        `name`,
        `content`
    )
VALUES (
        '2026-08-06 00:02:48.007743',
        '2026-08-06 00:02:48.007743',
        NULL,
        0,
        '991b9bd3-75a8-42ea-9158-78934b409ad5',
        'enterprise-invitation',
        '<!DOCTYPE html>\n<html>\n  <head>\n    <meta charset=\"UTF-8\" />\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />\n    <title>Email Notification</title>\n    <link\n      href=\"https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css\"\n      rel=\"stylesheet\"\n    />\n  </head>\n  <body\n    style=\"\n      font-family: sans-serif;\n      color: #343a40;\n      max-width: 600px;\n      margin: auto;\n      padding: 20px;\n    \"\n  >\n    <div class=\"text-center mb-4\">\n      <img\n        src=\"<%= logo %>\"\n        alt=\"<%= name %>\"\n        style=\"max-height: 64px; margin-bottom: 20px\"\n      />\n      <h1 class=\"text-primary fs-4 fw-bold\"><%= name %></h1>\n    </div>\n\n    <div class=\"bg-light p-4 rounded mb-4 shadow-sm\">\n      <h2 class=\"fs-5 fw-semibold mb-3\">Hello <%= client %>,</h2>\n\n      <p class=\"mb-3\">\n        We hope this email finds you well. You have been invited to access your\n        account with <%= clientEnterprise %>.\n      </p>\n\n      <p class=\"mb-3\"><%= custom %></p>\n\n      <p class=\"mb-3\">\n        To get started, please log in to your account using the button below:\n      </p>\n\n      <div class=\"text-center my-4\">\n        <a\n          href=\"<%= url %>\"\n          class=\"btn btn-primary fw-bold px-4 py-2\"\n          style=\"text-decoration: none\"\n        >\n          Log In to Your Account\n        </a>\n      </div>\n\n      <p class=\"mb-2\">\n        If the button above doesn\'t work, you can also copy and paste this link\n        into your browser:\n      </p>\n      <p style=\"word-break: break-word\" class=\"text-primary\"><%= url %></p>\n    </div>\n\n    <div class=\"border-top pt-4 text-muted small\">\n      <p class=\"fw-semibold mb-2\">Need Help?</p>\n      <p class=\"mb-4\">\n        If you have any questions or need assistance, please don\'t hesitate to\n        contact our support team at\n        <a\n          href=\"mailto:<%= support %>\"\n          class=\"text-primary text-decoration-none\"\n          ><%= support %></a\n        >\n      </p>\n\n      <p class=\"mb-4\">\n        Best regards,<br />\n        The <%= name %> Team\n      </p>\n\n      <div class=\"pt-3 border-top text-secondary small\">\n        <p><%= name %><br /><%= address %></p>\n        <p class=\"mt-3\">\n          This email was sent to <%= email %>. If you received this email in\n          error, please ignore it.\n        </p>\n      </div>\n    </div>\n  </body>\n</html>\n'
    ),
    (
        '2026-08-06 00:02:48.060447',
        '2026-08-06 00:02:48.060447',
        NULL,
        0,
        'ac1bc82f-5ddf-49ee-8138-b484cf6613d1',
        'forget-password',
        '<!DOCTYPE html>\n<html>\n  <head>\n    <meta charset=\"UTF-8\" />\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />\n    <title>Reset Your Password</title>\n  </head>\n  <body\n    style=\"\n      font-family: sans-serif;\n      color: #343a40;\n      max-width: 600px;\n      margin: auto;\n      padding: 20px;\n      background-color: #ffffff;\n    \"\n  >\n    <!-- Header -->\n    <div class=\"text-center mb-4\">\n      <img\n        src=\"<%= logo %>\"\n        alt=\"<%= name %>\"\n        style=\"max-height: 64px; margin-bottom: 20px\"\n      />\n      <h1 class=\"text-primary fs-4 fw-bold\"><%= name %></h1>\n    </div>\n\n    <!-- Content Box -->\n    <div class=\"bg-light p-4 rounded shadow-sm mb-4\">\n      <h2 class=\"fs-5 fw-semibold mb-3\">Reset Your Password</h2>\n\n      <p class=\"mb-3\">Hi <%= client %>,</p>\n\n      <p class=\"mb-3\">\n        We received a request to reset the password for your account. If you\n        made this request, you can reset your password using the button below.\n      </p>\n\n      <div class=\"text-center my-4\">\n        <a\n          href=\"<%= url %>\"\n          class=\"btn btn-primary fw-bold px-4 py-2\"\n          style=\"text-decoration: none\"\n        >\n          Reset Password\n        </a>\n      </div>\n\n      <p class=\"mb-2\">\n        If the button above doesn\'t work, copy and paste this link into your\n        browser:\n      </p>\n      <p style=\"word-break: break-word\" class=\"text-primary\"><%= url %></p>\n\n      <p class=\"mt-4 small text-muted\">\n        If you did not request a password reset, please ignore this email or\n        contact our support if you have concerns.\n      </p>\n    </div>\n\n    <!-- Footer -->\n    <div class=\"border-top pt-4 small text-muted\">\n      <p class=\"fw-semibold mb-2\">Need Help?</p>\n      <p class=\"mb-4\">\n        Contact our support team at\n        <a\n          href=\"mailto:<%= support %>\"\n          class=\"text-primary text-decoration-none\"\n          ><%= support %></a\n        >.\n      </p>\n\n      <p class=\"mb-4\">\n        Best regards,<br />\n        The <%= name %> Team\n      </p>\n\n      <div class=\"pt-3 border-top text-secondary small\">\n        <p><%= name %><br /><%= address %></p>\n        <p class=\"mt-3\">\n          This email was sent to <%= email %>. If you did not request a password\n          reset, no action is needed.\n        </p>\n      </div>\n    </div>\n  </body>\n</html>\n'
    ),
    (
        '2026-08-06 00:02:48.102031',
        '2026-08-06 00:02:48.102031',
        NULL,
        0,
        'b043ce71-23a5-4faa-9765-8809d03ebecf',
        'verify-email',
        '<!DOCTYPE html>\n<html>\n\n<head>\n  <meta charset=\"UTF-8\" />\n  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />\n  <title>Email Notification</title>\n  <link href=\"https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css\" rel=\"stylesheet\" />\n</head>\n\n<body style=\"\n      font-family: sans-serif;\n      color: #343a40;\n      max-width: 600px;\n      margin: auto;\n      padding: 20px;\n    \">\n  <div class=\"text-center mb-4\">\n    <img src=\"<%= logo %>\" alt=\"<%= name %>\" style=\"max-height: 64px; margin-bottom: 20px\" />\n    <h1 class=\"text-primary fs-4 fw-bold\">\n      <%= name %>\n    </h1>\n  </div>\n\n  <div class=\"bg-light p-4 rounded mb-4 shadow-sm\">\n    <h2 class=\"fs-5 fw-semibold mb-3\">Hello <%= client %>,</h2>\n\n    <p class=\"mb-3\">\n      We hope this email finds you well. Please verify your email address to complete your registration.\n    </p>\n\n    <p class=\"mb-3\">\n      To verify your email address, please click the button below:\n    </p>\n\n    <div class=\"text-center my-4\">\n      <a href=\"<%= url %>\" class=\"btn btn-primary fw-bold px-4 py-2\" style=\"text-decoration: none\">\n        Verify Email Address\n      </a>\n    </div>\n\n    <p class=\"mb-2\">\n      If the button above doesn\'t work, you can also copy and paste this link\n      into your browser:\n    </p>\n    <p style=\"word-break: break-word\" class=\"text-primary\">\n      <%= url %>\n    </p>\n  </div>\n\n  <div class=\"border-top pt-4 text-muted small\">\n    <p class=\"fw-semibold mb-2\">Need Help?</p>\n    <p class=\"mb-4\">\n      If you have any questions or need assistance, please don\'t hesitate to\n      contact our support team at\n      <a href=\"mailto:<%= support %>\" class=\"text-primary text-decoration-none\">\n        <%= support %>\n      </a>\n    </p>\n\n    <p class=\"mb-4\">\n      Best regards,<br />\n      The <%= name %> Team\n    </p>\n\n    <div class=\"pt-3 border-top text-secondary small\">\n      <p>\n        <%= name %><br />\n          <%= address %>\n      </p>\n      <p class=\"mt-3\">\n        This email was sent to <%= email %>. If you received this email in\n          error, please ignore it.\n      </p>\n    </div>\n  </div>\n</body>\n\n</html>'
    );

-- --------------------------------------------------------
-- Seed data for `template_template_styles`
-- --------------------------------------------------------

INSERT IGNORE INTO
    `template_template_styles` (`templateId`, `styleId`)
VALUES (
        '991b9bd3-75a8-42ea-9158-78934b409ad5',
        'a1f63ae3-2992-4df4-be69-ba67263940b0'
    ),
    (
        'ac1bc82f-5ddf-49ee-8138-b484cf6613d1',
        'a1f63ae3-2992-4df4-be69-ba67263940b0'
    ),
    (
        'b043ce71-23a5-4faa-9765-8809d03ebecf',
        'a1f63ae3-2992-4df4-be69-ba67263940b0'
    );

-- --------------------------------------------------------
-- Seed data for `ref-type`
-- --------------------------------------------------------

INSERT IGNORE INTO
    `ref-type` (
        `createdAt`,
        `updatedAt`,
        `deletedAt`,
        `isDeletionRestricted`,
        `id`,
        `label`,
        `description`,
        `parentId`,
        `extras`
    )
VALUES (
        '2026-08-06 00:07:28.979183',
        '2026-08-06 00:07:28.979183',
        NULL,
        0,
        'agriculture-&-environnement',
        'Agriculture & Environnement',
        'Agriculture & Environnement sector',
        'industry',
        '{\"color\": \"#d004ee\"}'
    ),
    (
        '2026-08-06 00:07:39.652191',
        '2026-08-06 00:07:39.652191',
        NULL,
        0,
        'casual-&-social',
        'Casual & Social',
        'Casual & Social sector',
        'objectif',
        '{\"color\": \"#626d4d\"}'
    ),
    (
        '2026-08-06 00:07:28.940547',
        '2026-08-06 00:07:28.940547',
        NULL,
        0,
        'commerce,-retail-&-luxe',
        'Commerce, Retail & Luxe',
        'Commerce, Retail & Luxe sector',
        'industry',
        '{\"color\": \"#f18a87\"}'
    ),
    (
        '2026-08-06 00:07:28.828430',
        '2026-08-06 00:07:28.828430',
        NULL,
        0,
        'construction-&-btp',
        'Construction & BTP',
        'Construction & BTP sector',
        'industry',
        '{\"color\": \"#89c1b1\"}'
    ),
    (
        '2026-08-06 00:07:28.999267',
        '2026-08-06 00:07:28.999267',
        NULL,
        0,
        'culture,-médias-&-création',
        'Culture, Médias & Création',
        'Culture, Médias & Création sector',
        'industry',
        '{\"color\": \"#bd15f5\"}'
    ),
    (
        '2026-08-06 00:07:28.960803',
        '2026-08-06 00:07:28.960803',
        NULL,
        0,
        'éducation-&-recherche',
        'Éducation & Recherche',
        'Éducation & Recherche sector',
        'industry',
        '{\"color\": \"#551540\"}'
    ),
    (
        '2026-08-06 00:07:39.686161',
        '2026-08-06 00:07:39.686161',
        NULL,
        0,
        'explore-mode',
        'Explore Mode',
        'Explore Mode sector',
        'objectif',
        '{\"color\": \"#bcfd8e\"}'
    ),
    (
        '2026-08-06 00:07:28.919684',
        '2026-08-06 00:07:28.919684',
        NULL,
        0,
        'finance-&-services',
        'Finance & Services',
        'Finance & Services sector',
        'industry',
        '{\"color\": \"#279a0a\"}'
    ),
    (
        '2026-08-06 00:07:28.731691',
        '2026-08-06 00:07:28.731691',
        NULL,
        0,
        'industry',
        'Industry',
        'Parent reference type for all industries',
        NULL,
        NULL
    ),
    (
        '2026-08-06 00:07:28.868934',
        '2026-08-06 00:07:28.868934',
        NULL,
        0,
        'infrastructures-&-villes',
        'Infrastructures & Villes',
        'Infrastructures & Villes sector',
        'industry',
        '{\"color\": \"#126306\"}'
    ),
    (
        '2026-08-06 00:07:28.805822',
        '2026-08-06 00:07:28.805822',
        NULL,
        0,
        'ingénierie-&-industrie',
        'Ingénierie & Industrie',
        'Ingénierie & Industrie sector',
        'industry',
        '{\"color\": \"#52647a\"}'
    ),
    (
        '2026-08-06 00:07:28.848301',
        '2026-08-06 00:07:28.848301',
        NULL,
        0,
        'mobilité,-transport-&-logistique',
        'Mobilité, Transport & Logistique',
        'Mobilité, Transport & Logistique sector',
        'industry',
        '{\"color\": \"#77ad09\"}'
    ),
    (
        '2026-08-06 00:07:39.631155',
        '2026-08-06 00:07:39.631155',
        NULL,
        0,
        'networking-&-collaboration',
        'Networking & Collaboration',
        'Networking & Collaboration sector',
        'objectif',
        '{\"color\": \"#300070\"}'
    ),
    (
        '2026-08-06 00:07:39.563610',
        '2026-08-06 00:07:39.563610',
        NULL,
        0,
        'objectif',
        'Objectif',
        'Parent reference type for all Objectives',
        NULL,
        NULL
    ),
    (
        '2026-08-06 00:07:39.670656',
        '2026-08-06 00:07:39.670656',
        NULL,
        0,
        'personal-development',
        'Personal Development',
        'Personal Development sector',
        'objectif',
        '{\"color\": \"#2a4a8b\"}'
    ),
    (
        '2026-08-06 00:07:39.577188',
        '2026-08-06 00:07:39.577188',
        NULL,
        0,
        'professional-growth',
        'Professional Growth',
        'Professional Growth sector',
        'objectif',
        '{\"color\": \"#74d94c\"}'
    ),
    (
        '2026-08-06 00:07:29.018959',
        '2026-08-06 00:07:29.018959',
        NULL,
        0,
        'public,-ong-&-organisations-internationales',
        'Public, ONG & Organisations Internationales',
        'Public, ONG & Organisations Internationales sector',
        'industry',
        '{\"color\": \"#dbc8fa\"}'
    ),
    (
        '2026-08-06 00:07:28.889453',
        '2026-08-06 00:07:28.889453',
        NULL,
        0,
        'santé-&-sciences-de-la-vie',
        'Santé & Sciences de la Vie',
        'Santé & Sciences de la Vie sector',
        'industry',
        '{\"color\": \"#89a70a\"}'
    ),
    (
        '2026-08-06 00:07:28.747337',
        '2026-08-06 00:07:28.747337',
        NULL,
        0,
        'technologies-&-informatique',
        'Technologies & Informatique',
        'Technologies & Informatique sector',
        'industry',
        '{\"color\": \"#d1579e\"}'
    );

-- --------------------------------------------------------
-- Seed data for `ref-param`
-- --------------------------------------------------------

INSERT IGNORE INTO
    `ref-param` (
        `createdAt`,
        `updatedAt`,
        `deletedAt`,
        `isDeletionRestricted`,
        `id`,
        `label`,
        `description`,
        `refTypeId`,
        `extras`
    )
VALUES (
        '2026-08-06 00:07:28.780851',
        '2026-08-06 00:07:28.780851',
        NULL,
        0,
        1,
        'Développement logiciel',
        'Développement logiciel within Technologies & Informatique',
        'technologies-&-informatique',
        '{\"color\": \"#c7ebc0\"}'
    ),
    (
        '2026-08-06 00:07:28.785321',
        '2026-08-06 00:07:28.785321',
        NULL,
        0,
        2,
        'Data & IA',
        'Data & IA within Technologies & Informatique',
        'technologies-&-informatique',
        '{\"color\": \"#1f7f39\"}'
    ),
    (
        '2026-08-06 00:07:28.786071',
        '2026-08-06 00:07:28.786071',
        NULL,
        0,
        3,
        'Cybersécurité',
        'Cybersécurité within Technologies & Informatique',
        'technologies-&-informatique',
        '{\"color\": \"#2f0211\"}'
    ),
    (
        '2026-08-06 00:07:28.786792',
        '2026-08-06 00:07:28.786792',
        NULL,
        0,
        4,
        'Cloud & DevOps',
        'Cloud & DevOps within Technologies & Informatique',
        'technologies-&-informatique',
        '{\"color\": \"#eca8aa\"}'
    ),
    (
        '2026-08-06 00:07:28.787452',
        '2026-08-06 00:07:28.787452',
        NULL,
        0,
        5,
        'Télécoms / IoT',
        'Télécoms / IoT within Technologies & Informatique',
        'technologies-&-informatique',
        '{\"color\": \"#81d1fe\"}'
    ),
    (
        '2026-08-06 00:07:28.788237',
        '2026-08-06 00:07:28.788237',
        NULL,
        0,
        6,
        'Blockchain / Web3',
        'Blockchain / Web3 within Technologies & Informatique',
        'technologies-&-informatique',
        '{\"color\": \"#c0d7c8\"}'
    ),
    (
        '2026-08-06 00:07:28.798115',
        '2026-08-06 00:07:28.798115',
        NULL,
        0,
        7,
        'Réalité virtuelle & immersive',
        'Réalité virtuelle & immersive within Technologies & Informatique',
        'technologies-&-informatique',
        '{\"color\": \"#132b3a\"}'
    ),
    (
        '2026-08-06 00:07:28.813727',
        '2026-08-06 00:07:28.813727',
        NULL,
        0,
        8,
        'Ingénierie générale',
        'Ingénierie générale within Ingénierie & Industrie',
        'ingénierie-&-industrie',
        '{\"color\": \"#9423e7\"}'
    ),
    (
        '2026-08-06 00:07:28.814291',
        '2026-08-06 00:07:28.814291',
        NULL,
        0,
        9,
        'Industrie lourde / manufacturière',
        'Industrie lourde / manufacturière within Ingénierie & Industrie',
        'ingénierie-&-industrie',
        '{\"color\": \"#548c8e\"}'
    ),
    (
        '2026-08-06 00:07:28.817019',
        '2026-08-06 00:07:28.817019',
        NULL,
        0,
        10,
        'Énergie / Hydrogène / Renouvelables',
        'Énergie / Hydrogène / Renouvelables within Ingénierie & Industrie',
        'ingénierie-&-industrie',
        '{\"color\": \"#c02e0a\"}'
    ),
    (
        '2026-08-06 00:07:28.817595',
        '2026-08-06 00:07:28.817595',
        NULL,
        0,
        11,
        'Robotique & automatisation',
        'Robotique & automatisation within Ingénierie & Industrie',
        'ingénierie-&-industrie',
        '{\"color\": \"#746b90\"}'
    ),
    (
        '2026-08-06 00:07:28.818016',
        '2026-08-06 00:07:28.818016',
        NULL,
        0,
        12,
        'Aéronautique & spatial',
        'Aéronautique & spatial within Ingénierie & Industrie',
        'ingénierie-&-industrie',
        '{\"color\": \"#f31e1b\"}'
    ),
    (
        '2026-08-06 00:07:28.819938',
        '2026-08-06 00:07:28.819938',
        NULL,
        0,
        13,
        'Maintenance industrielle',
        'Maintenance industrielle within Ingénierie & Industrie',
        'ingénierie-&-industrie',
        '{\"color\": \"#be7fb7\"}'
    ),
    (
        '2026-08-06 00:07:28.837144',
        '2026-08-06 00:07:28.837144',
        NULL,
        0,
        14,
        'Travaux publics',
        'Travaux publics within Construction & BTP',
        'construction-&-btp',
        '{\"color\": \"#1b38d4\"}'
    ),
    (
        '2026-08-06 00:07:28.837184',
        '2026-08-06 00:07:28.837184',
        NULL,
        0,
        15,
        'Urbanisme / aménagement',
        'Urbanisme / aménagement within Construction & BTP',
        'construction-&-btp',
        '{\"color\": \"#67e79a\"}'
    ),
    (
        '2026-08-06 00:07:28.837604',
        '2026-08-06 00:07:28.837604',
        NULL,
        0,
        16,
        'Immobilier & foncier',
        'Immobilier & foncier within Construction & BTP',
        'construction-&-btp',
        '{\"color\": \"#10ff08\"}'
    ),
    (
        '2026-08-06 00:07:28.838085',
        '2026-08-06 00:07:28.838085',
        NULL,
        0,
        17,
        'Rénovation énergétique / Décret tertiaire',
        'Rénovation énergétique / Décret tertiaire within Construction & BTP',
        'construction-&-btp',
        '{\"color\": \"#b10f22\"}'
    ),
    (
        '2026-08-06 00:07:28.838539',
        '2026-08-06 00:07:28.838539',
        NULL,
        0,
        18,
        'Bâtiment / Génie civil',
        'Bâtiment / Génie civil within Construction & BTP',
        'construction-&-btp',
        '{\"color\": \"#d5253a\"}'
    ),
    (
        '2026-08-06 00:07:28.840711',
        '2026-08-06 00:07:28.840711',
        NULL,
        0,
        19,
        'Architecture',
        'Architecture within Construction & BTP',
        'construction-&-btp',
        '{\"color\": \"#25d94c\"}'
    ),
    (
        '2026-08-06 00:07:28.854978',
        '2026-08-06 00:07:28.854978',
        NULL,
        0,
        20,
        'Transport terrestre',
        'Transport terrestre within Mobilité, Transport & Logistique',
        'mobilité,-transport-&-logistique',
        '{\"color\": \"#c1c1ac\"}'
    ),
    (
        '2026-08-06 00:07:28.857674',
        '2026-08-06 00:07:28.857674',
        NULL,
        0,
        21,
        'Transport maritime / ports',
        'Transport maritime / ports within Mobilité, Transport & Logistique',
        'mobilité,-transport-&-logistique',
        '{\"color\": \"#7233fd\"}'
    ),
    (
        '2026-08-06 00:07:28.858058',
        '2026-08-06 00:07:28.858058',
        NULL,
        0,
        22,
        'Logistique & supply chain',
        'Logistique & supply chain within Mobilité, Transport & Logistique',
        'mobilité,-transport-&-logistique',
        '{\"color\": \"#37a075\"}'
    ),
    (
        '2026-08-06 00:07:28.858585',
        '2026-08-06 00:07:28.858585',
        NULL,
        0,
        23,
        'Mobility-as-a-Service',
        'Mobility-as-a-Service within Mobilité, Transport & Logistique',
        'mobilité,-transport-&-logistique',
        '{\"color\": \"#30a82c\"}'
    ),
    (
        '2026-08-06 00:07:28.859094',
        '2026-08-06 00:07:28.859094',
        NULL,
        0,
        24,
        'Transport aérien / AAM / Drones',
        'Transport aérien / AAM / Drones within Mobilité, Transport & Logistique',
        'mobilité,-transport-&-logistique',
        '{\"color\": \"#92e59d\"}'
    ),
    (
        '2026-08-06 00:07:28.861250',
        '2026-08-06 00:07:28.861250',
        NULL,
        0,
        25,
        'Infrastructures de transport',
        'Infrastructures de transport within Mobilité, Transport & Logistique',
        'mobilité,-transport-&-logistique',
        '{\"color\": \"#341a0c\"}'
    ),
    (
        '2026-08-06 00:07:28.875636',
        '2026-08-06 00:07:28.875636',
        NULL,
        0,
        26,
        'Smart City',
        'Smart City within Infrastructures & Villes',
        'infrastructures-&-villes',
        '{\"color\": \"#a096d6\"}'
    ),
    (
        '2026-08-06 00:07:28.877943',
        '2026-08-06 00:07:28.877943',
        NULL,
        0,
        27,
        'Infrastructures publiques',
        'Infrastructures publiques within Infrastructures & Villes',
        'infrastructures-&-villes',
        '{\"color\": \"#30c8fc\"}'
    ),
    (
        '2026-08-06 00:07:28.878391',
        '2026-08-06 00:07:28.878391',
        NULL,
        0,
        28,
        'Gestion des déchets',
        'Gestion des déchets within Infrastructures & Villes',
        'infrastructures-&-villes',
        '{\"color\": \"#d5db3f\"}'
    ),
    (
        '2026-08-06 00:07:28.878942',
        '2026-08-06 00:07:28.878942',
        NULL,
        0,
        29,
        'Éclairage public / Energie urbaine',
        'Éclairage public / Energie urbaine within Infrastructures & Villes',
        'infrastructures-&-villes',
        '{\"color\": \"#8cb92c\"}'
    ),
    (
        '2026-08-06 00:07:28.879461',
        '2026-08-06 00:07:28.879461',
        NULL,
        0,
        30,
        'Eau / Assainissement',
        'Eau / Assainissement within Infrastructures & Villes',
        'infrastructures-&-villes',
        '{\"color\": \"#ed38e3\"}'
    ),
    (
        '2026-08-06 00:07:28.881534',
        '2026-08-06 00:07:28.881534',
        NULL,
        0,
        31,
        'Aménagement territorial',
        'Aménagement territorial within Infrastructures & Villes',
        'infrastructures-&-villes',
        '{\"color\": \"#8f4365\"}'
    ),
    (
        '2026-08-06 00:07:28.896476',
        '2026-08-06 00:07:28.896476',
        NULL,
        0,
        32,
        'Biotechnologies',
        'Biotechnologies within Santé & Sciences de la Vie',
        'santé-&-sciences-de-la-vie',
        '{\"color\": \"#736e3e\"}'
    ),
    (
        '2026-08-06 00:07:28.896827',
        '2026-08-06 00:07:28.896827',
        NULL,
        0,
        33,
        'Pharmaceutique',
        'Pharmaceutique within Santé & Sciences de la Vie',
        'santé-&-sciences-de-la-vie',
        '{\"color\": \"#be27f8\"}'
    ),
    (
        '2026-08-06 00:07:28.897371',
        '2026-08-06 00:07:28.897371',
        NULL,
        0,
        34,
        'Médecine digitale',
        'Médecine digitale within Santé & Sciences de la Vie',
        'santé-&-sciences-de-la-vie',
        '{\"color\": \"#25fde9\"}'
    ),
    (
        '2026-08-06 00:07:28.897714',
        '2026-08-06 00:07:28.897714',
        NULL,
        0,
        35,
        'Santé / Hôpitaux',
        'Santé / Hôpitaux within Santé & Sciences de la Vie',
        'santé-&-sciences-de-la-vie',
        '{\"color\": \"#730850\"}'
    ),
    (
        '2026-08-06 00:07:28.899179',
        '2026-08-06 00:07:28.899179',
        NULL,
        0,
        36,
        'Dispositifs médicaux',
        'Dispositifs médicaux within Santé & Sciences de la Vie',
        'santé-&-sciences-de-la-vie',
        '{\"color\": \"#5a5f6d\"}'
    ),
    (
        '2026-08-06 00:07:28.926209',
        '2026-08-06 00:07:28.926209',
        NULL,
        0,
        37,
        'Banque',
        'Banque within Finance & Services',
        'finance-&-services',
        '{\"color\": \"#cb43ae\"}'
    ),
    (
        '2026-08-06 00:07:28.928578',
        '2026-08-06 00:07:28.928578',
        NULL,
        0,
        38,
        'Audit / Conseil',
        'Audit / Conseil within Finance & Services',
        'finance-&-services',
        '{\"color\": \"#ff3177\"}'
    ),
    (
        '2026-08-06 00:07:28.928991',
        '2026-08-06 00:07:28.928991',
        NULL,
        0,
        39,
        'Comptabilité',
        'Comptabilité within Finance & Services',
        'finance-&-services',
        '{\"color\": \"#fdf11f\"}'
    ),
    (
        '2026-08-06 00:07:28.929443',
        '2026-08-06 00:07:28.929443',
        NULL,
        0,
        40,
        'FinTech',
        'FinTech within Finance & Services',
        'finance-&-services',
        '{\"color\": \"#1143a4\"}'
    ),
    (
        '2026-08-06 00:07:28.929942',
        '2026-08-06 00:07:28.929942',
        NULL,
        0,
        41,
        'Assurance',
        'Assurance within Finance & Services',
        'finance-&-services',
        '{\"color\": \"#7b6dc0\"}'
    ),
    (
        '2026-08-06 00:07:28.932660',
        '2026-08-06 00:07:28.932660',
        NULL,
        0,
        42,
        'Gestion d’actifs & investissements',
        'Gestion d’actifs & investissements within Finance & Services',
        'finance-&-services',
        '{\"color\": \"#e78301\"}'
    ),
    (
        '2026-08-06 00:07:28.948756',
        '2026-08-06 00:07:28.948756',
        NULL,
        0,
        43,
        'E-commerce',
        'E-commerce within Commerce, Retail & Luxe',
        'commerce,-retail-&-luxe',
        '{\"color\": \"#e956c8\"}'
    ),
    (
        '2026-08-06 00:07:28.949197',
        '2026-08-06 00:07:28.949197',
        NULL,
        0,
        44,
        'Produits de luxe',
        'Produits de luxe within Commerce, Retail & Luxe',
        'commerce,-retail-&-luxe',
        '{\"color\": \"#83f942\"}'
    ),
    (
        '2026-08-06 00:07:28.949532',
        '2026-08-06 00:07:28.949532',
        NULL,
        0,
        45,
        'Mode & design',
        'Mode & design within Commerce, Retail & Luxe',
        'commerce,-retail-&-luxe',
        '{\"color\": \"#7fe773\"}'
    ),
    (
        '2026-08-06 00:07:28.950265',
        '2026-08-06 00:07:28.950265',
        NULL,
        0,
        46,
        'Distribution',
        'Distribution within Commerce, Retail & Luxe',
        'commerce,-retail-&-luxe',
        '{\"color\": \"#f4952a\"}'
    ),
    (
        '2026-08-06 00:07:28.952101',
        '2026-08-06 00:07:28.952101',
        NULL,
        0,
        47,
        'Hôtellerie / restauration / tourisme',
        'Hôtellerie / restauration / tourisme within Commerce, Retail & Luxe',
        'commerce,-retail-&-luxe',
        '{\"color\": \"#442e03\"}'
    ),
    (
        '2026-08-06 00:07:28.968279',
        '2026-08-06 00:07:28.968279',
        NULL,
        0,
        48,
        'Enseignement supérieur',
        'Enseignement supérieur within Éducation & Recherche',
        'éducation-&-recherche',
        '{\"color\": \"#2b2bca\"}'
    ),
    (
        '2026-08-06 00:07:28.969876',
        '2026-08-06 00:07:28.969876',
        NULL,
        0,
        49,
        'Recherche scientifique',
        'Recherche scientifique within Éducation & Recherche',
        'éducation-&-recherche',
        '{\"color\": \"#3e6297\"}'
    ),
    (
        '2026-08-06 00:07:28.970385',
        '2026-08-06 00:07:28.970385',
        NULL,
        0,
        50,
        'E-learning / EdTech',
        'E-learning / EdTech within Éducation & Recherche',
        'éducation-&-recherche',
        '{\"color\": \"#17a008\"}'
    ),
    (
        '2026-08-06 00:07:28.971747',
        '2026-08-06 00:07:28.971747',
        NULL,
        0,
        51,
        'Formation professionnelle',
        'Formation professionnelle within Éducation & Recherche',
        'éducation-&-recherche',
        '{\"color\": \"#75d260\"}'
    ),
    (
        '2026-08-06 00:07:28.986238',
        '2026-08-06 00:07:28.986238',
        NULL,
        0,
        52,
        'Agriculture',
        'Agriculture within Agriculture & Environnement',
        'agriculture-&-environnement',
        '{\"color\": \"#9dbe41\"}'
    ),
    (
        '2026-08-06 00:07:28.988499',
        '2026-08-06 00:07:28.988499',
        NULL,
        0,
        53,
        'Environnement & climat',
        'Environnement & climat within Agriculture & Environnement',
        'agriculture-&-environnement',
        '{\"color\": \"#58029a\"}'
    ),
    (
        '2026-08-06 00:07:28.989012',
        '2026-08-06 00:07:28.989012',
        NULL,
        0,
        54,
        'Ressources naturelles',
        'Ressources naturelles within Agriculture & Environnement',
        'agriculture-&-environnement',
        '{\"color\": \"#b8f8cb\"}'
    ),
    (
        '2026-08-06 00:07:28.989515',
        '2026-08-06 00:07:28.989515',
        NULL,
        0,
        55,
        'Agroalimentaire',
        'Agroalimentaire within Agriculture & Environnement',
        'agriculture-&-environnement',
        '{\"color\": \"#b1a781\"}'
    ),
    (
        '2026-08-06 00:07:28.991312',
        '2026-08-06 00:07:28.991312',
        NULL,
        0,
        56,
        'Économie circulaire',
        'Économie circulaire within Agriculture & Environnement',
        'agriculture-&-environnement',
        '{\"color\": \"#093215\"}'
    ),
    (
        '2026-08-06 00:07:29.007720',
        '2026-08-06 00:07:29.007720',
        NULL,
        0,
        57,
        'Design / création',
        'Design / création within Culture, Médias & Création',
        'culture,-médias-&-création',
        '{\"color\": \"#7b6d97\"}'
    ),
    (
        '2026-08-06 00:07:29.008265',
        '2026-08-06 00:07:29.008265',
        NULL,
        0,
        58,
        'Art, culture & patrimoine',
        'Art, culture & patrimoine within Culture, Médias & Création',
        'culture,-médias-&-création',
        '{\"color\": \"#8a98e7\"}'
    ),
    (
        '2026-08-06 00:07:29.008704',
        '2026-08-06 00:07:29.008704',
        NULL,
        0,
        59,
        'Média & audiovisuel',
        'Média & audiovisuel within Culture, Médias & Création',
        'culture,-médias-&-création',
        '{\"color\": \"#65d284\"}'
    ),
    (
        '2026-08-06 00:07:29.009115',
        '2026-08-06 00:07:29.009115',
        NULL,
        0,
        60,
        'Marketing & communication',
        'Marketing & communication within Culture, Médias & Création',
        'culture,-médias-&-création',
        '{\"color\": \"#dad2be\"}'
    ),
    (
        '2026-08-06 00:07:29.010839',
        '2026-08-06 00:07:29.010839',
        NULL,
        0,
        61,
        'Événementiel',
        'Événementiel within Culture, Médias & Création',
        'culture,-médias-&-création',
        '{\"color\": \"#65bd68\"}'
    ),
    (
        '2026-08-06 00:07:29.027823',
        '2026-08-06 00:07:29.027823',
        NULL,
        0,
        62,
        'Secteur public',
        'Secteur public within Public, ONG & Organisations Internationales',
        'public,-ong-&-organisations-internationales',
        '{\"color\": \"#3d2fdc\"}'
    ),
    (
        '2026-08-06 00:07:29.029861',
        '2026-08-06 00:07:29.029861',
        NULL,
        0,
        63,
        'ONG & associations',
        'ONG & associations within Public, ONG & Organisations Internationales',
        'public,-ong-&-organisations-internationales',
        '{\"color\": \"#a13856\"}'
    ),
    (
        '2026-08-06 00:07:29.030337',
        '2026-08-06 00:07:29.030337',
        NULL,
        0,
        64,
        'Coopération internationale',
        'Coopération internationale within Public, ONG & Organisations Internationales',
        'public,-ong-&-organisations-internationales',
        '{\"color\": \"#e3deec\"}'
    ),
    (
        '2026-08-06 00:07:29.031017',
        '2026-08-06 00:07:29.031017',
        NULL,
        0,
        65,
        'Collectivités territoriales',
        'Collectivités territoriales within Public, ONG & Organisations Internationales',
        'public,-ong-&-organisations-internationales',
        '{\"color\": \"#f55919\"}'
    ),
    (
        '2026-08-06 00:07:29.032533',
        '2026-08-06 00:07:29.032533',
        NULL,
        0,
        66,
        'Institutions financières internationales (IFIs)',
        'Institutions financières internationales (IFIs) within Public, ONG & Organisations Internationales',
        'public,-ong-&-organisations-internationales',
        '{\"color\": \"#1fa204\"}'
    ),
    (
        '2026-08-06 00:07:39.602950',
        '2026-08-06 00:07:39.602950',
        NULL,
        0,
        67,
        'Find a Co-Founder',
        'Find a Co-Founder within Professional Growth',
        'professional-growth',
        '{\"color\": \"#215571\"}'
    ),
    (
        '2026-08-06 00:07:39.607818',
        '2026-08-06 00:07:39.607818',
        NULL,
        0,
        68,
        'Build My Team',
        'Build My Team within Professional Growth',
        'professional-growth',
        '{\"color\": \"#93324e\"}'
    ),
    (
        '2026-08-06 00:07:39.608569',
        '2026-08-06 00:07:39.608569',
        NULL,
        0,
        69,
        'Join a Startup',
        'Join a Startup within Professional Growth',
        'professional-growth',
        '{\"color\": \"#93e075\"}'
    ),
    (
        '2026-08-06 00:07:39.609094',
        '2026-08-06 00:07:39.609094',
        NULL,
        0,
        70,
        'Find an Investor / Raise Funding',
        'Find an Investor / Raise Funding within Professional Growth',
        'professional-growth',
        '{\"color\": \"#5a169e\"}'
    ),
    (
        '2026-08-06 00:07:39.609746',
        '2026-08-06 00:07:39.609746',
        NULL,
        0,
        71,
        'Looking to Invest',
        'Looking to Invest within Professional Growth',
        'professional-growth',
        '{\"color\": \"#438aae\"}'
    ),
    (
        '2026-08-06 00:07:39.610634',
        '2026-08-06 00:07:39.610634',
        NULL,
        0,
        72,
        'Find Clients or Partners',
        'Find Clients or Partners within Professional Growth',
        'professional-growth',
        '{\"color\": \"#ba6772\"}'
    ),
    (
        '2026-08-06 00:07:39.620541',
        '2026-08-06 00:07:39.620541',
        NULL,
        0,
        73,
        'Get Mentorship / Advice',
        'Get Mentorship / Advice within Professional Growth',
        'professional-growth',
        '{\"color\": \"#7b3a80\"}'
    ),
    (
        '2026-08-06 00:07:39.623275',
        '2026-08-06 00:07:39.623275',
        NULL,
        0,
        74,
        'Offer Mentorship / Consulting',
        'Offer Mentorship / Consulting within Professional Growth',
        'professional-growth',
        '{\"color\": \"#388151\"}'
    ),
    (
        '2026-08-06 00:07:39.639392',
        '2026-08-06 00:07:39.639392',
        NULL,
        0,
        75,
        'Networking & Connections',
        'Networking & Connections within Networking & Collaboration',
        'networking-&-collaboration',
        '{\"color\": \"#c0f1be\"}'
    ),
    (
        '2026-08-06 00:07:39.641591',
        '2026-08-06 00:07:39.641591',
        NULL,
        0,
        76,
        'Brainstorming Sessions',
        'Brainstorming Sessions within Networking & Collaboration',
        'networking-&-collaboration',
        '{\"color\": \"#6c98f2\"}'
    ),
    (
        '2026-08-06 00:07:39.642029',
        '2026-08-06 00:07:39.642029',
        NULL,
        0,
        77,
        'Knowledge Exchange',
        'Knowledge Exchange within Networking & Collaboration',
        'networking-&-collaboration',
        '{\"color\": \"#f1e1ff\"}'
    ),
    (
        '2026-08-06 00:07:39.642490',
        '2026-08-06 00:07:39.642490',
        NULL,
        0,
        78,
        'Collaboration on Projects',
        'Collaboration on Projects within Networking & Collaboration',
        'networking-&-collaboration',
        '{\"color\": \"#fd7d13\"}'
    ),
    (
        '2026-08-06 00:07:39.644278',
        '2026-08-06 00:07:39.644278',
        NULL,
        0,
        79,
        'Community Building',
        'Community Building within Networking & Collaboration',
        'networking-&-collaboration',
        '{\"color\": \"#20d3ed\"}'
    ),
    (
        '2026-08-06 00:07:39.658607',
        '2026-08-06 00:07:39.658607',
        NULL,
        0,
        80,
        'Grab a Coffee',
        'Grab a Coffee within Casual & Social',
        'casual-&-social',
        '{\"color\": \"#957427\"}'
    ),
    (
        '2026-08-06 00:07:39.661234',
        '2026-08-06 00:07:39.661234',
        NULL,
        0,
        81,
        'Attend Local Events Together',
        'Attend Local Events Together within Casual & Social',
        'casual-&-social',
        '{\"color\": \"#a9aa89\"}'
    ),
    (
        '2026-08-06 00:07:39.661760',
        '2026-08-06 00:07:39.661760',
        NULL,
        0,
        82,
        'Work Buddy / Cowork Together',
        'Work Buddy / Cowork Together within Casual & Social',
        'casual-&-social',
        '{\"color\": \"#14805d\"}'
    ),
    (
        '2026-08-06 00:07:39.662186',
        '2026-08-06 00:07:39.662186',
        NULL,
        0,
        83,
        'Expand My Circle',
        'Expand My Circle within Casual & Social',
        'casual-&-social',
        '{\"color\": \"#7eeba2\"}'
    ),
    (
        '2026-08-06 00:07:39.663849',
        '2026-08-06 00:07:39.663849',
        NULL,
        0,
        84,
        'Inspiration & Motivation',
        'Inspiration & Motivation within Casual & Social',
        'casual-&-social',
        '{\"color\": \"#e45901\"}'
    ),
    (
        '2026-08-06 00:07:39.677185',
        '2026-08-06 00:07:39.677185',
        NULL,
        0,
        85,
        'Public Speaking / Pitch Practice',
        'Public Speaking / Pitch Practice within Personal Development',
        'personal-development',
        '{\"color\": \"#419c3a\"}'
    ),
    (
        '2026-08-06 00:07:39.677527',
        '2026-08-06 00:07:39.677527',
        NULL,
        0,
        86,
        'Build My Personal Brand',
        'Build My Personal Brand within Personal Development',
        'personal-development',
        '{\"color\": \"#36e014\"}'
    ),
    (
        '2026-08-06 00:07:39.678019',
        '2026-08-06 00:07:39.678019',
        NULL,
        0,
        87,
        'Learn a New Skill',
        'Learn a New Skill within Personal Development',
        'personal-development',
        '{\"color\": \"#19f8d9\"}'
    ),
    (
        '2026-08-06 00:07:39.679295',
        '2026-08-06 00:07:39.679295',
        NULL,
        0,
        88,
        'Accountability Partner',
        'Accountability Partner within Personal Development',
        'personal-development',
        '{\"color\": \"#e9971e\"}'
    ),
    (
        '2026-08-06 00:07:39.693335',
        '2026-08-06 00:07:39.693335',
        NULL,
        0,
        89,
        'Creative Collab',
        'Creative Collab within Explore Mode',
        'explore-mode',
        '{\"color\": \"#056c5d\"}'
    ),
    (
        '2026-08-06 00:07:39.693832',
        '2026-08-06 00:07:39.693832',
        NULL,
        0,
        90,
        'Investor Connect',
        'Investor Connect within Explore Mode',
        'explore-mode',
        '{\"color\": \"#13f433\"}'
    ),
    (
        '2026-08-06 00:07:39.694604',
        '2026-08-06 00:07:39.694604',
        NULL,
        0,
        91,
        'Startup Dating',
        'Startup Dating within Explore Mode',
        'explore-mode',
        '{\"color\": \"#15ff32\"}'
    ),
    (
        '2026-08-06 00:07:39.695892',
        '2026-08-06 00:07:39.695892',
        NULL,
        0,
        92,
        'Tech Talks Nearby',
        'Tech Talks Nearby within Explore Mode',
        'explore-mode',
        '{\"color\": \"#10b22e\"}'
    ),
    (
        '2026-08-06 00:07:39.696248',
        '2026-08-06 00:07:39.696248',
        NULL,
        0,
        93,
        'Coffee Chats',
        'Coffee Chats within Explore Mode',
        'explore-mode',
        '{\"color\": \"#80fe06\"}'
    );

-- --------------------------------------------------------
-- Seed data for `storage`
-- --------------------------------------------------------

INSERT IGNORE INTO
    `storage` (
        `createdAt`,
        `updatedAt`,
        `deletedAt`,
        `isDeletionRestricted`,
        `id`,
        `slug`,
        `filename`,
        `systematicName`,
        `relativePath`,
        `mimetype`,
        `size`,
        `isTemporary`,
        `isPrivate`
    )
VALUES (
        '2026-08-06 00:07:17.803334',
        '2026-08-06 00:07:17.803334',
        NULL,
        0,
        1,
        '5fb8cd8f-0b02-4d83-b026-b420306c5b75',
        'logo.png',
        'application-logo',
        '5fb8cd8f-0b02-4d83-b026-b420306c5b75.png',
        'image/png',
        67444,
        0,
        0
    );

-- =============================================================================
-- RESTORE SETTINGS
-- =============================================================================
SET FOREIGN_KEY_CHECKS = @OLD_FOREIGN_KEY_CHECKS;

SET UNIQUE_CHECKS = @OLD_UNIQUE_CHECKS;

SET SQL_MODE = @OLD_SQL_MODE;