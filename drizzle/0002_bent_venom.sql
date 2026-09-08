CREATE TABLE `lgs_questions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`source_id` integer NOT NULL,
	`year` integer NOT NULL,
	`subject_id` text NOT NULL,
	`question_number` integer NOT NULL,
	`unit` text,
	`topic` text,
	`tag_status` text DEFAULT 'pending' NOT NULL,
	`approved_by` text,
	`approved_at` text,
	`created_at` text NOT NULL,
	FOREIGN KEY (`source_id`) REFERENCES `source_documents`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `source_documents` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`year` integer NOT NULL,
	`title` text NOT NULL,
	`official_url` text NOT NULL,
	`publisher` text DEFAULT 'MEB' NOT NULL,
	`checked_at` text NOT NULL,
	`status` text DEFAULT 'active' NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `source_documents_year_unique` ON `source_documents` (`year`);