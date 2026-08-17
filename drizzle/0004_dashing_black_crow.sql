ALTER TABLE `audioAssets` DROP INDEX `audio_generation_unique`;--> statement-breakpoint
ALTER TABLE `audioAssets` ADD `variant` enum('master','instrumental','vocals','stem','alternate') DEFAULT 'master' NOT NULL;--> statement-breakpoint
ALTER TABLE `audioAssets` ADD `filename` varchar(255);--> statement-breakpoint
DROP INDEX `audio_generation_unique` ON `audioAssets`;--> statement-breakpoint
CREATE INDEX `audio_generation_variant_index` ON `audioAssets` (`generationId`,`variant`);
