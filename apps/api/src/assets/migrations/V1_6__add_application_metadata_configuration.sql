-- =============================================================================
-- Migration: V1_6__add_application_metadata_configuration.sql
-- Description: Add application metadata configuration params (name and description)
-- =============================================================================

-- Ensure the application configuration namespace exists
INSERT INTO `configuration-namespace` (`id`, `name`, `description`, `userId`)
SELECT 'application', 'application', 'application configuration', NULL
WHERE NOT EXISTS (
    SELECT 1 FROM `configuration-namespace` WHERE `id` = 'application' OR `name` = 'application'
);

-- Ensure id is 'application' for the application namespace if previously assigned a UUID
UPDATE `configuration-namespace`
SET `id` = 'application'
WHERE `name` = 'application' AND `userId` IS NULL AND `id` != 'application';

-- Insert appMetaData.name parameter if not already present
INSERT INTO `configuration-param` (
    `name`,
    `description`,
    `namespaceId`,
    `variant`,
    `value`,
    `options`,
    `schema`
)
SELECT
    'appMetaData.name',
    'Application name',
    'application',
    'string',
    'Instanct',
    NULL,
    NULL
WHERE NOT EXISTS (
    SELECT 1 FROM `configuration-param`
    WHERE `namespaceId` = 'application' AND `name` = 'appMetaData.name'
);

-- Insert appMetaData.description parameter if not already present
INSERT INTO `configuration-param` (
    `name`,
    `description`,
    `namespaceId`,
    `variant`,
    `value`,
    `options`,
    `schema`
)
SELECT
    'appMetaData.description',
    'Application description',
    'application',
    'string',
    '',
    NULL,
    NULL
WHERE NOT EXISTS (
    SELECT 1 FROM `configuration-param`
    WHERE `namespaceId` = 'application' AND `name` = 'appMetaData.description'
);
