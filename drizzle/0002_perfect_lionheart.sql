CREATE TABLE `stylist_services` (
	`id` varchar(128) NOT NULL,
	`stylist_id` varchar(128) NOT NULL,
	`service_id` varchar(128) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `stylist_services_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `stylists` ADD `total_bookings` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `stylists` ADD `revenue` decimal(12,2) DEFAULT '0.00' NOT NULL;--> statement-breakpoint
ALTER TABLE `stylists` ADD `commission_rate` decimal(5,2) DEFAULT '15.00' NOT NULL;--> statement-breakpoint
ALTER TABLE `stylists` ADD `schedule` json DEFAULT ('{}');--> statement-breakpoint
ALTER TABLE `services` ADD `is_popular` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `stylist_services` ADD CONSTRAINT `stylist_services_stylist_id_stylists_id_fk` FOREIGN KEY (`stylist_id`) REFERENCES `stylists`(`id`) ON DELETE no action ON UPDATE no action;