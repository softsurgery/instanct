-- =============================================================================
-- Migration: V1_7__add_template_size.sql
-- Description: Add size (in octets) column to templates table
-- =============================================================================

ALTER TABLE `templates` ADD COLUMN `size` int NOT NULL DEFAULT 0;

-- Backfill size in octets for existing templates
UPDATE `templates` SET `size` = OCTET_LENGTH(`content`) WHERE `content` IS NOT NULL;
