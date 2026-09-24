-- =============================================================================
-- Migration: V1_2__update_configuration_namespace_ids.sql
-- Description: Make configuration-namespace with no users have ids like their name and update relations
-- =============================================================================

SET @OLD_UNIQUE_CHECKS = @@UNIQUE_CHECKS, UNIQUE_CHECKS = 0;

SET
    @OLD_FOREIGN_KEY_CHECKS = @@FOREIGN_KEY_CHECKS,
    FOREIGN_KEY_CHECKS = 0;

-- Update the child table (configuration-param)
UPDATE `configuration-param` cp
JOIN `configuration-namespace` cn ON cp.namespaceId = cn.id
SET
    cp.namespaceId = cn.name
WHERE
    cn.userId IS NULL;

-- Update the parent table (configuration-namespace)
UPDATE `configuration-namespace` SET id = name WHERE userId IS NULL;

SET FOREIGN_KEY_CHECKS = @OLD_FOREIGN_KEY_CHECKS;

SET UNIQUE_CHECKS = @OLD_UNIQUE_CHECKS;