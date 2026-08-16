ALTER TABLE `musicGenerations` ADD `lyricsMode` enum('none','generate','custom') DEFAULT 'none' NOT NULL;--> statement-breakpoint
ALTER TABLE `musicGenerations` ADD `lyrics` text;--> statement-breakpoint
ALTER TABLE `musicGenerations` ADD `vocalLanguage` enum('fr','en','auto') DEFAULT 'auto' NOT NULL;--> statement-breakpoint
ALTER TABLE `musicGenerations` ADD `songStructure` json;--> statement-breakpoint
ALTER TABLE `musicGenerations` ADD `actualDurationSeconds` int;--> statement-breakpoint
ALTER TABLE `musicGenerations` ADD `providerPlanId` varchar(255);