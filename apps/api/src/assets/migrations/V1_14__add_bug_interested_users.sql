-- Migration: V1_14__add_bug_interested_users.sql

CREATE TABLE IF NOT EXISTS `bug_interested_users` (
    `createdAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    `updatedAt` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    `deletedAt` datetime(6) DEFAULT NULL,
    `isDeletionRestricted` tinyint NOT NULL DEFAULT '0',
    `id` int NOT NULL AUTO_INCREMENT,
    `bugId` int NOT NULL,
    `userId` varchar(255) NOT NULL,
    PRIMARY KEY (`id`),
    UNIQUE KEY `UQ_bug_interested_users_bug_user` (`bugId`, `userId`),
    KEY `FK_bug_interested_users_bugId` (`bugId`),
    KEY `FK_bug_interested_users_userId` (`userId`),
    CONSTRAINT `FK_bug_interested_users_bugId` FOREIGN KEY (`bugId`) REFERENCES `bugs` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `FK_bug_interested_users_userId` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci;
