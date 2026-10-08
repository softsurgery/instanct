ALTER TABLE `bugs` ADD COLUMN `status` enum('Resolved', 'Not Resolved', 'Pending') NOT NULL DEFAULT 'Pending';
