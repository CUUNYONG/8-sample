CREATE TABLE `payment_events` (
	`id` text PRIMARY KEY NOT NULL,
	`reservation_id` text NOT NULL,
	`provider_payment_id` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`reservation_id`) REFERENCES `reservations`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `unique_payment` ON `payment_events` (`provider_payment_id`);--> statement-breakpoint
CREATE TABLE `reservations` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`slot_id` text NOT NULL,
	`name` text NOT NULL,
	`phone` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`created_at` integer NOT NULL,
	`approved_at` integer,
	`expires_at` integer,
	`paid_at` integer,
	`amount` integer DEFAULT 100000 NOT NULL,
	`refund_requested_at` integer,
	FOREIGN KEY (`slot_id`) REFERENCES `slots`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `slots` (
	`id` text PRIMARY KEY NOT NULL,
	`start_at` integer NOT NULL,
	`end_at` integer NOT NULL,
	`active` integer DEFAULT 1 NOT NULL
);
