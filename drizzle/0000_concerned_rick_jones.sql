CREATE TABLE `users` (
	`id` varchar(128) NOT NULL,
	`email` varchar(255) NOT NULL,
	`password` varchar(255) NOT NULL,
	`full_name` varchar(255) NOT NULL,
	`phone` varchar(20),
	`avatar` text,
	`role` enum('admin','stylist','customer') NOT NULL DEFAULT 'customer',
	`is_active` boolean NOT NULL DEFAULT true,
	`email_verified` boolean NOT NULL DEFAULT false,
	`email_verified_at` timestamp,
	`date_of_birth` date,
	`gender` enum('male','female'),
	`address` text,
	`preferences` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `stylist_leaves` (
	`id` varchar(128) NOT NULL,
	`stylist_id` varchar(128) NOT NULL,
	`start_date` timestamp NOT NULL,
	`end_date` timestamp NOT NULL,
	`reason` text NOT NULL,
	`is_approved` boolean NOT NULL DEFAULT false,
	`approved_by` varchar(128),
	`approved_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `stylist_leaves_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `stylist_schedules` (
	`id` varchar(128) NOT NULL,
	`stylist_id` varchar(128) NOT NULL,
	`day_of_week` int NOT NULL,
	`start_time` varchar(8) NOT NULL,
	`end_time` varchar(8) NOT NULL,
	`is_available` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `stylist_schedules_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `stylists` (
	`id` varchar(128) NOT NULL,
	`user_id` varchar(128) NOT NULL,
	`specialties` json NOT NULL DEFAULT ('[]'),
	`experience` int NOT NULL DEFAULT 0,
	`rating` decimal(3,2) NOT NULL DEFAULT '0.00',
	`total_reviews` int NOT NULL DEFAULT 0,
	`is_available` boolean NOT NULL DEFAULT true,
	`bio` text,
	`portfolio` json DEFAULT ('[]'),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `stylists_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `service_addons` (
	`id` varchar(128) NOT NULL,
	`service_id` varchar(128) NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`price` decimal(10,2) NOT NULL,
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `service_addons_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `service_categories` (
	`id` varchar(128) NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`icon` varchar(255),
	`sort_order` int NOT NULL DEFAULT 0,
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `service_categories_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `services` (
	`id` varchar(128) NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text NOT NULL,
	`category` enum('haircut','beard_trim','hair_wash','styling','coloring','treatment','package') NOT NULL,
	`price` decimal(10,2) NOT NULL,
	`duration` int NOT NULL,
	`is_active` boolean NOT NULL DEFAULT true,
	`image` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `services_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `booking_addons` (
	`id` varchar(128) NOT NULL,
	`booking_id` varchar(128) NOT NULL,
	`addon_id` varchar(128) NOT NULL,
	`name` varchar(255) NOT NULL,
	`price` decimal(10,2) NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `booking_addons_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `booking_history` (
	`id` varchar(128) NOT NULL,
	`booking_id` varchar(128) NOT NULL,
	`action` varchar(100) NOT NULL,
	`previous_status` enum('pending','confirmed','in_progress','completed','cancelled','no_show'),
	`new_status` enum('pending','confirmed','in_progress','completed','cancelled','no_show'),
	`notes` text,
	`performed_by` varchar(128),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `booking_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `bookings` (
	`id` varchar(128) NOT NULL,
	`customer_id` varchar(128) NOT NULL,
	`stylist_id` varchar(128) NOT NULL,
	`service_id` varchar(128) NOT NULL,
	`appointment_date` timestamp NOT NULL,
	`appointment_time` varchar(8) NOT NULL,
	`end_time` varchar(8),
	`status` enum('pending','confirmed','in_progress','completed','cancelled','no_show') NOT NULL DEFAULT 'pending',
	`total_amount` decimal(10,2) NOT NULL,
	`notes` text,
	`cancel_reason` text,
	`cancelled_at` timestamp,
	`confirmed_at` timestamp,
	`completed_at` timestamp,
	`reminder_sent` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `bookings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `payment_history` (
	`id` varchar(128) NOT NULL,
	`payment_id` varchar(128) NOT NULL,
	`action` varchar(100) NOT NULL,
	`previous_status` enum('pending','paid','failed','refunded','cancelled'),
	`new_status` enum('pending','paid','failed','refunded','cancelled'),
	`amount` decimal(10,2),
	`notes` text,
	`gateway_response` json,
	`performed_by` varchar(128),
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `payment_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `payment_methods` (
	`id` varchar(128) NOT NULL,
	`user_id` varchar(128) NOT NULL,
	`type` enum('credit_card','debit_card','digital_wallet','bank_account') NOT NULL,
	`provider` varchar(100) NOT NULL,
	`last_4_digits` varchar(4),
	`expiry_month` varchar(2),
	`expiry_year` varchar(4),
	`holder_name` varchar(255),
	`is_default` boolean NOT NULL DEFAULT false,
	`is_active` boolean NOT NULL DEFAULT true,
	`gateway_token` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `payment_methods_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `payment_webhooks` (
	`id` varchar(128) NOT NULL,
	`provider` varchar(100) NOT NULL,
	`event_type` varchar(100) NOT NULL,
	`event_id` varchar(255) NOT NULL,
	`payment_id` varchar(128),
	`payload` json NOT NULL,
	`signature` text,
	`processed` boolean NOT NULL DEFAULT false,
	`processed_at` timestamp,
	`error_message` text,
	`retry_count` varchar(3) DEFAULT '0',
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `payment_webhooks_id` PRIMARY KEY(`id`),
	CONSTRAINT `payment_webhooks_event_id_unique` UNIQUE(`event_id`)
);
--> statement-breakpoint
CREATE TABLE `payments` (
	`id` varchar(128) NOT NULL,
	`booking_id` varchar(128) NOT NULL,
	`customer_id` varchar(128) NOT NULL,
	`amount` decimal(10,2) NOT NULL,
	`method` enum('cash','credit_card','debit_card','digital_wallet','bank_transfer') NOT NULL,
	`status` enum('pending','paid','failed','refunded','cancelled') NOT NULL DEFAULT 'pending',
	`transaction_id` varchar(255),
	`payment_gateway_response` json,
	`gateway_provider` varchar(100),
	`currency` varchar(3) NOT NULL DEFAULT 'IDR',
	`exchange_rate` decimal(10,4) DEFAULT '1.0000',
	`fees` decimal(10,2) DEFAULT '0.00',
	`net_amount` decimal(10,2),
	`refunded_amount` decimal(10,2) DEFAULT '0.00',
	`refund_reason` text,
	`notes` text,
	`metadata` json,
	`paid_at` timestamp,
	`failed_at` timestamp,
	`refunded_at` timestamp,
	`expires_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `payments_id` PRIMARY KEY(`id`),
	CONSTRAINT `payments_transaction_id_unique` UNIQUE(`transaction_id`)
);
--> statement-breakpoint
CREATE TABLE `notification_preferences` (
	`id` varchar(128) NOT NULL,
	`user_id` varchar(128) NOT NULL,
	`type` enum('booking_confirmation','booking_reminder','booking_cancelled','booking_completed','payment_success','payment_failed','review_request','review_received','promotion','system_maintenance','account_update','security_alert') NOT NULL,
	`in_app` boolean NOT NULL DEFAULT true,
	`email` boolean NOT NULL DEFAULT true,
	`sms` boolean NOT NULL DEFAULT false,
	`push` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `notification_preferences_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notification_templates` (
	`id` varchar(128) NOT NULL,
	`name` varchar(255) NOT NULL,
	`type` enum('booking_confirmation','booking_reminder','booking_cancelled','booking_completed','payment_success','payment_failed','review_request','review_received','promotion','system_maintenance','account_update','security_alert') NOT NULL,
	`channel` enum('in_app','email','sms','push') NOT NULL,
	`subject` varchar(255),
	`title` varchar(255) NOT NULL,
	`template` text NOT NULL,
	`variables` json DEFAULT ('[]'),
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `notification_templates_id` PRIMARY KEY(`id`),
	CONSTRAINT `notification_templates_name_unique` UNIQUE(`name`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` varchar(128) NOT NULL,
	`user_id` varchar(128) NOT NULL,
	`type` enum('booking_confirmation','booking_reminder','booking_cancelled','booking_completed','payment_success','payment_failed','review_request','review_received','promotion','system_maintenance','account_update','security_alert') NOT NULL,
	`title` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`data` json,
	`priority` enum('low','normal','high','urgent') NOT NULL DEFAULT 'normal',
	`channel` enum('in_app','email','sms','push') NOT NULL DEFAULT 'in_app',
	`is_read` boolean NOT NULL DEFAULT false,
	`read_at` timestamp,
	`scheduled_for` timestamp,
	`sent_at` timestamp,
	`delivery_status` enum('pending','sent','delivered','failed','bounced') DEFAULT 'pending',
	`error_message` text,
	`retry_count` int NOT NULL DEFAULT 0,
	`expires_at` timestamp,
	`action_url` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `review_reactions` (
	`id` varchar(128) NOT NULL,
	`review_id` varchar(128) NOT NULL,
	`user_id` varchar(128) NOT NULL,
	`type` enum('like','dislike') NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `review_reactions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `review_reports` (
	`id` varchar(128) NOT NULL,
	`review_id` varchar(128) NOT NULL,
	`reported_by` varchar(128) NOT NULL,
	`reason` enum('inappropriate_content','spam','fake_review','harassment','off_topic','other') NOT NULL,
	`description` text,
	`status` enum('pending','reviewed','resolved','dismissed') NOT NULL DEFAULT 'pending',
	`reviewed_by` varchar(128),
	`reviewed_at` timestamp,
	`admin_notes` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `review_reports_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reviews` (
	`id` varchar(128) NOT NULL,
	`booking_id` varchar(128) NOT NULL,
	`customer_id` varchar(128) NOT NULL,
	`stylist_id` varchar(128) NOT NULL,
	`rating` int NOT NULL,
	`comment` text,
	`photos` json DEFAULT ('[]'),
	`is_anonymous` boolean NOT NULL DEFAULT false,
	`is_visible` boolean NOT NULL DEFAULT true,
	`admin_notes` text,
	`likes` int NOT NULL DEFAULT 0,
	`dislikes` int NOT NULL DEFAULT 0,
	`reported_count` int NOT NULL DEFAULT 0,
	`is_reported` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `reviews_id` PRIMARY KEY(`id`),
	CONSTRAINT `reviews_booking_id_unique` UNIQUE(`booking_id`)
);
--> statement-breakpoint
ALTER TABLE `stylist_leaves` ADD CONSTRAINT `stylist_leaves_stylist_id_stylists_id_fk` FOREIGN KEY (`stylist_id`) REFERENCES `stylists`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `stylist_leaves` ADD CONSTRAINT `stylist_leaves_approved_by_users_id_fk` FOREIGN KEY (`approved_by`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `stylist_schedules` ADD CONSTRAINT `stylist_schedules_stylist_id_stylists_id_fk` FOREIGN KEY (`stylist_id`) REFERENCES `stylists`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `stylists` ADD CONSTRAINT `stylists_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `service_addons` ADD CONSTRAINT `service_addons_service_id_services_id_fk` FOREIGN KEY (`service_id`) REFERENCES `services`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `booking_addons` ADD CONSTRAINT `booking_addons_booking_id_bookings_id_fk` FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `booking_history` ADD CONSTRAINT `booking_history_booking_id_bookings_id_fk` FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `booking_history` ADD CONSTRAINT `booking_history_performed_by_users_id_fk` FOREIGN KEY (`performed_by`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `bookings` ADD CONSTRAINT `bookings_customer_id_users_id_fk` FOREIGN KEY (`customer_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `bookings` ADD CONSTRAINT `bookings_stylist_id_stylists_id_fk` FOREIGN KEY (`stylist_id`) REFERENCES `stylists`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `bookings` ADD CONSTRAINT `bookings_service_id_services_id_fk` FOREIGN KEY (`service_id`) REFERENCES `services`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `payment_history` ADD CONSTRAINT `payment_history_payment_id_payments_id_fk` FOREIGN KEY (`payment_id`) REFERENCES `payments`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `payment_history` ADD CONSTRAINT `payment_history_performed_by_users_id_fk` FOREIGN KEY (`performed_by`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `payment_methods` ADD CONSTRAINT `payment_methods_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `payment_webhooks` ADD CONSTRAINT `payment_webhooks_payment_id_payments_id_fk` FOREIGN KEY (`payment_id`) REFERENCES `payments`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `payments` ADD CONSTRAINT `payments_booking_id_bookings_id_fk` FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `payments` ADD CONSTRAINT `payments_customer_id_users_id_fk` FOREIGN KEY (`customer_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `notification_preferences` ADD CONSTRAINT `notification_preferences_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `review_reactions` ADD CONSTRAINT `review_reactions_review_id_reviews_id_fk` FOREIGN KEY (`review_id`) REFERENCES `reviews`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `review_reactions` ADD CONSTRAINT `review_reactions_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `review_reports` ADD CONSTRAINT `review_reports_review_id_reviews_id_fk` FOREIGN KEY (`review_id`) REFERENCES `reviews`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `review_reports` ADD CONSTRAINT `review_reports_reported_by_users_id_fk` FOREIGN KEY (`reported_by`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `review_reports` ADD CONSTRAINT `review_reports_reviewed_by_users_id_fk` FOREIGN KEY (`reviewed_by`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `reviews` ADD CONSTRAINT `reviews_booking_id_bookings_id_fk` FOREIGN KEY (`booking_id`) REFERENCES `bookings`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `reviews` ADD CONSTRAINT `reviews_customer_id_users_id_fk` FOREIGN KEY (`customer_id`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `reviews` ADD CONSTRAINT `reviews_stylist_id_stylists_id_fk` FOREIGN KEY (`stylist_id`) REFERENCES `stylists`(`id`) ON DELETE no action ON UPDATE no action;