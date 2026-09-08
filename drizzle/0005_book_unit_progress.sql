CREATE TABLE `book_unit_progress` (`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,`subject_id` text NOT NULL,`subject` text NOT NULL,`book` text NOT NULL,`unit` text NOT NULL,`status` text DEFAULT 'not_started' NOT NULL,`progress` integer DEFAULT 0 NOT NULL,`updated_by` text DEFAULT 'system' NOT NULL,`created_at` text NOT NULL,`updated_at` text NOT NULL);
CREATE UNIQUE INDEX `uq_book_unit_progress` ON `book_unit_progress` (`subject_id`,`book`,`unit`);
CREATE INDEX `idx_book_unit_progress_subject` ON `book_unit_progress` (`subject_id`,`status`);
