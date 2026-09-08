CREATE UNIQUE INDEX `uq_lgs_questions_year_subject_number` ON `lgs_questions` (`year`,`subject_id`,`question_number`);--> statement-breakpoint
CREATE INDEX `idx_lgs_questions_review` ON `lgs_questions` (`year`,`subject_id`,`tag_status`);--> statement-breakpoint
CREATE INDEX `idx_lgs_questions_topic` ON `lgs_questions` (`subject_id`,`topic`,`tag_status`);