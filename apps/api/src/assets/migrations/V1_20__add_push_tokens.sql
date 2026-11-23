-- =============================================================================
-- Migration: V1_20__add_push_tokens.sql
-- Description: Add push_tokens table for Expo / APNs / FCM remote push delivery
-- =============================================================================

CREATE TABLE IF NOT EXISTS `push_tokens` (
    `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    `deletedAt` datetime(6) DEFAULT NULL,
    `isDeletionRestricted` tinyint NOT NULL DEFAULT '0',
    `id` int NOT NULL AUTO_INCREMENT,
    `userId` varchar(255) NOT NULL,
    `token` varchar(255) NOT NULL,
    `platform` varchar(32) DEFAULT NULL,
    `deviceName` varchar(255) DEFAULT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `IDX_push_tokens_token` (`token`),
    KEY `IDX_push_tokens_userId` (`userId`),
    CONSTRAINT `FK_push_tokens_userId` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;
