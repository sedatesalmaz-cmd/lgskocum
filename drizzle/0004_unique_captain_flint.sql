ALTER TABLE `study_results` ADD `assignment_id` integer;--> statement-breakpoint
CREATE UNIQUE INDEX `uq_study_results_assignment` ON `study_results` (`assignment_id`);--> statement-breakpoint
CREATE INDEX `idx_study_results_date` ON `study_results` (`study_date`);--> statement-breakpoint
ALTER TABLE `wrong_questions` ADD `study_result_id` integer;