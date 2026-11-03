-- Migration: V1_13__verify_email_for_non_email_sources.sql
-- Set emailVerified timestamp for accounts that have a source different than 'email'.

UPDATE `users`
SET `emailVerified` = CURRENT_TIMESTAMP
WHERE `source` IS NOT NULL
  AND `source` != 'email'
  AND `emailVerified` IS NULL;
