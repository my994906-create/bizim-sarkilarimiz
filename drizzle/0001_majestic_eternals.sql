ALTER TABLE `tracks` ADD `coverStorageKey` varchar(512);--> statement-breakpoint
ALTER TABLE `tracks` ADD `coverUrl` varchar(1024);--> statement-breakpoint
ALTER TABLE `tracks` ADD `genre` varchar(120) DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `tracks` ADD `lyrics` text;