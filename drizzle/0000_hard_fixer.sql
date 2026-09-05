CREATE TABLE `assignments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`due_date` text NOT NULL,
	`subject_id` text NOT NULL,
	`subject` text NOT NULL,
	`book` text NOT NULL,
	`unit` text NOT NULL,
	`topic` text NOT NULL,
	`question_count` integer NOT NULL,
	`note` text DEFAULT '' NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `study_results` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`study_date` text NOT NULL,
	`subject_id` text NOT NULL,
	`unit` text NOT NULL,
	`topic` text NOT NULL,
	`book` text NOT NULL,
	`total` integer NOT NULL,
	`correct` integer NOT NULL,
	`wrong` integer NOT NULL,
	`blank` integer NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `weekly_reports` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`week_start` text NOT NULL,
	`week_end` text NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`branch_reports` text NOT NULL,
	`general_summary` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `wrong_questions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`subject_id` text NOT NULL,
	`unit` text NOT NULL,
	`topic` text NOT NULL,
	`image_key` text NOT NULL,
	`analysis` text,
	`created_at` text NOT NULL
);
