CREATE TABLE `accounts` (
	`id` varchar(36) NOT NULL,
	`accountId` varchar(255) NOT NULL,
	`providerId` varchar(100) NOT NULL,
	`userId` varchar(36) NOT NULL,
	`accessToken` text,
	`refreshToken` text,
	`idToken` text,
	`accessTokenExpiresAt` timestamp,
	`refreshTokenExpiresAt` timestamp,
	`scope` text,
	`password` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `accounts_id` PRIMARY KEY(`id`),
	CONSTRAINT `accounts_provider_account_unique` UNIQUE(`providerId`,`accountId`)
);
--> statement-breakpoint
CREATE TABLE `audioAssets` (
	`id` varchar(36) NOT NULL,
	`generationId` varchar(36) NOT NULL,
	`userId` varchar(36) NOT NULL,
	`storageKey` varchar(512) NOT NULL,
	`publicUrl` text NOT NULL,
	`format` varchar(16) NOT NULL,
	`durationSeconds` int,
	`sizeBytes` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `audioAssets_id` PRIMARY KEY(`id`),
	CONSTRAINT `audio_generation_unique` UNIQUE(`generationId`)
);
--> statement-breakpoint
CREATE TABLE `auditLogs` (
	`id` varchar(36) NOT NULL,
	`userId` varchar(36),
	`action` varchar(128) NOT NULL,
	`entityType` varchar(64) NOT NULL,
	`entityId` varchar(64) NOT NULL,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `auditLogs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `authUsers` (
	`id` varchar(36) NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(320) NOT NULL,
	`emailVerified` boolean NOT NULL DEFAULT false,
	`image` text,
	`role` enum('user','admin') NOT NULL DEFAULT 'user',
	`phoneNumber` varchar(32),
	`locale` varchar(8) NOT NULL DEFAULT 'fr',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `authUsers_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`),
	CONSTRAINT `users_phone_unique` UNIQUE(`phoneNumber`)
);
--> statement-breakpoint
CREATE TABLE `creditLedgerEntries` (
	`id` varchar(36) NOT NULL,
	`walletId` varchar(36) NOT NULL,
	`userId` varchar(36) NOT NULL,
	`amount` int NOT NULL,
	`kind` enum('purchase','reserve','consume','release','refund','bonus','adjustment') NOT NULL,
	`referenceType` varchar(64) NOT NULL,
	`referenceId` varchar(64) NOT NULL,
	`balanceAfter` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `creditLedgerEntries_id` PRIMARY KEY(`id`),
	CONSTRAINT `ledger_reference_unique` UNIQUE(`kind`,`referenceType`,`referenceId`)
);
--> statement-breakpoint
CREATE TABLE `creditWallets` (
	`id` varchar(36) NOT NULL,
	`userId` varchar(36) NOT NULL,
	`balance` int NOT NULL DEFAULT 0,
	`reserved` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `creditWallets_id` PRIMARY KEY(`id`),
	CONSTRAINT `wallet_user_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `musicGenerations` (
	`id` varchar(36) NOT NULL,
	`userId` varchar(36) NOT NULL,
	`title` varchar(160) NOT NULL,
	`prompt` text NOT NULL,
	`style` varchar(64) NOT NULL,
	`mood` varchar(64) NOT NULL,
	`durationSeconds` int NOT NULL,
	`mode` enum('vocal','instrumental') NOT NULL,
	`language` enum('fr','en') NOT NULL DEFAULT 'fr',
	`provider` varchar(64) NOT NULL DEFAULT 'elevenlabs',
	`providerJobId` varchar(255),
	`status` enum('queued','processing','completed','failed','cancelled') NOT NULL DEFAULT 'queued',
	`creditsReserved` int NOT NULL,
	`retryCount` int NOT NULL DEFAULT 0,
	`lastError` text,
	`nextRetryAt` timestamp,
	`startedAt` timestamp,
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `musicGenerations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `paymentEvents` (
	`id` varchar(36) NOT NULL,
	`orderId` varchar(36),
	`provider` enum('paystack','flutterwave') NOT NULL,
	`externalEventId` varchar(255) NOT NULL,
	`type` varchar(128) NOT NULL,
	`signatureValid` boolean NOT NULL DEFAULT false,
	`payload` json NOT NULL,
	`processedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `paymentEvents_id` PRIMARY KEY(`id`),
	CONSTRAINT `payment_event_unique` UNIQUE(`provider`,`externalEventId`)
);
--> statement-breakpoint
CREATE TABLE `paymentOrders` (
	`id` varchar(36) NOT NULL,
	`userId` varchar(36) NOT NULL,
	`provider` enum('paystack','flutterwave') NOT NULL,
	`status` enum('pending','paid','expired','failed','refunded') NOT NULL DEFAULT 'pending',
	`planCode` varchar(64) NOT NULL,
	`creditAmount` int NOT NULL,
	`amountMinor` int NOT NULL,
	`currency` varchar(3) NOT NULL,
	`checkoutUrl` text NOT NULL,
	`providerReference` varchar(255) NOT NULL,
	`paidByEmail` varchar(320),
	`paidAt` timestamp,
	`expiresAt` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `paymentOrders_id` PRIMARY KEY(`id`),
	CONSTRAINT `payment_reference_unique` UNIQUE(`provider`,`providerReference`)
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` varchar(36) NOT NULL,
	`expiresAt` timestamp NOT NULL,
	`token` varchar(255) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`ipAddress` varchar(64),
	`userAgent` text,
	`userId` varchar(36) NOT NULL,
	CONSTRAINT `sessions_id` PRIMARY KEY(`id`),
	CONSTRAINT `sessions_token_unique` UNIQUE(`token`)
);
--> statement-breakpoint
CREATE TABLE `verifications` (
	`id` varchar(36) NOT NULL,
	`identifier` varchar(320) NOT NULL,
	`value` varchar(255) NOT NULL,
	`expiresAt` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `verifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `whatsappIdentities` (
	`id` varchar(36) NOT NULL,
	`userId` varchar(36) NOT NULL,
	`phoneNumber` varchar(32) NOT NULL,
	`verifiedAt` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `whatsappIdentities_id` PRIMARY KEY(`id`),
	CONSTRAINT `whatsapp_phone_unique` UNIQUE(`phoneNumber`),
	CONSTRAINT `whatsapp_user_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `whatsappOtps` (
	`id` varchar(36) NOT NULL,
	`email` varchar(320) NOT NULL,
	`phoneNumber` varchar(32) NOT NULL,
	`codeHash` varchar(128) NOT NULL,
	`attempts` int NOT NULL DEFAULT 0,
	`consumedAt` timestamp,
	`expiresAt` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `whatsappOtps_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `accounts_user_index` ON `accounts` (`userId`);--> statement-breakpoint
CREATE INDEX `audio_user_index` ON `audioAssets` (`userId`);--> statement-breakpoint
CREATE INDEX `audit_entity_index` ON `auditLogs` (`entityType`,`entityId`);--> statement-breakpoint
CREATE INDEX `ledger_wallet_index` ON `creditLedgerEntries` (`walletId`);--> statement-breakpoint
CREATE INDEX `ledger_user_index` ON `creditLedgerEntries` (`userId`);--> statement-breakpoint
CREATE INDEX `generations_user_status_index` ON `musicGenerations` (`userId`,`status`);--> statement-breakpoint
CREATE INDEX `generations_provider_job_index` ON `musicGenerations` (`providerJobId`);--> statement-breakpoint
CREATE INDEX `payment_user_status_index` ON `paymentOrders` (`userId`,`status`);--> statement-breakpoint
CREATE INDEX `sessions_user_index` ON `sessions` (`userId`);--> statement-breakpoint
CREATE INDEX `verifications_identifier_index` ON `verifications` (`identifier`);--> statement-breakpoint
CREATE INDEX `whatsapp_otp_phone_index` ON `whatsappOtps` (`phoneNumber`);