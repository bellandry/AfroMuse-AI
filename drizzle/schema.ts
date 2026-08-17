import { boolean, index, int, json, mysqlEnum, mysqlTable, text, timestamp, uniqueIndex, varchar } from "drizzle-orm/mysql-core";

/**
 * Legacy identity table retained during the authentication transition.
 * AfroMuse authentication data lives in `authUsers` and related Better Auth tables.
 */
export const legacyUsers = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const authUsers = mysqlTable("authUsers", {
  id: varchar("id", { length: 36 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  emailVerified: boolean("emailVerified").default(false).notNull(),
  image: text("image"),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  phoneNumber: varchar("phoneNumber", { length: 32 }),
  locale: varchar("locale", { length: 8 }).default("fr").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => [
  uniqueIndex("users_email_unique").on(table.email),
  uniqueIndex("users_phone_unique").on(table.phoneNumber),
]);

export const sessions = mysqlTable("sessions", {
  id: varchar("id", { length: 36 }).primaryKey(),
  expiresAt: timestamp("expiresAt").notNull(),
  token: varchar("token", { length: 255 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  ipAddress: varchar("ipAddress", { length: 64 }),
  userAgent: text("userAgent"),
  userId: varchar("userId", { length: 36 }).notNull(),
}, table => [
  uniqueIndex("sessions_token_unique").on(table.token),
  index("sessions_user_index").on(table.userId),
]);

export const accounts = mysqlTable("accounts", {
  id: varchar("id", { length: 36 }).primaryKey(),
  accountId: varchar("accountId", { length: 255 }).notNull(),
  providerId: varchar("providerId", { length: 100 }).notNull(),
  userId: varchar("userId", { length: 36 }).notNull(),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  idToken: text("idToken"),
  accessTokenExpiresAt: timestamp("accessTokenExpiresAt"),
  refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => [
  uniqueIndex("accounts_provider_account_unique").on(table.providerId, table.accountId),
  index("accounts_user_index").on(table.userId),
]);

export const verifications = mysqlTable("verifications", {
  id: varchar("id", { length: 36 }).primaryKey(),
  identifier: varchar("identifier", { length: 320 }).notNull(),
  value: varchar("value", { length: 255 }).notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => [index("verifications_identifier_index").on(table.identifier)]);

export const whatsappIdentities = mysqlTable("whatsappIdentities", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: varchar("userId", { length: 36 }).notNull(),
  phoneNumber: varchar("phoneNumber", { length: 32 }).notNull(),
  verifiedAt: timestamp("verifiedAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => [
  uniqueIndex("whatsapp_phone_unique").on(table.phoneNumber),
  uniqueIndex("whatsapp_user_unique").on(table.userId),
]);

export const whatsappOtps = mysqlTable("whatsappOtps", {
  id: varchar("id", { length: 36 }).primaryKey(),
  email: varchar("email", { length: 320 }).notNull(),
  phoneNumber: varchar("phoneNumber", { length: 32 }).notNull(),
  codeHash: varchar("codeHash", { length: 128 }).notNull(),
  attempts: int("attempts").default(0).notNull(),
  consumedAt: timestamp("consumedAt"),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, table => [index("whatsapp_otp_phone_index").on(table.phoneNumber)]);

export const creditWallets = mysqlTable("creditWallets", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: varchar("userId", { length: 36 }).notNull(),
  balance: int("balance").default(0).notNull(),
  reserved: int("reserved").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => [uniqueIndex("wallet_user_unique").on(table.userId)]);

export const creditLedgerEntries = mysqlTable("creditLedgerEntries", {
  id: varchar("id", { length: 36 }).primaryKey(),
  walletId: varchar("walletId", { length: 36 }).notNull(),
  userId: varchar("userId", { length: 36 }).notNull(),
  amount: int("amount").notNull(),
  kind: mysqlEnum("kind", ["purchase", "reserve", "consume", "release", "refund", "bonus", "adjustment"]).notNull(),
  referenceType: varchar("referenceType", { length: 64 }).notNull(),
  referenceId: varchar("referenceId", { length: 64 }).notNull(),
  balanceAfter: int("balanceAfter").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, table => [
  uniqueIndex("ledger_reference_unique").on(table.kind, table.referenceType, table.referenceId),
  index("ledger_wallet_index").on(table.walletId),
  index("ledger_user_index").on(table.userId),
]);

export const musicGenerations = mysqlTable("musicGenerations", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: varchar("userId", { length: 36 }).notNull(),
  title: varchar("title", { length: 160 }).notNull(),
  prompt: text("prompt").notNull(),
  style: varchar("style", { length: 64 }).notNull(),
  mood: varchar("mood", { length: 64 }).notNull(),
  durationSeconds: int("durationSeconds").notNull(),
  mode: mysqlEnum("mode", ["vocal", "instrumental"]).notNull(),
  language: mysqlEnum("language", ["fr", "en"]).default("fr").notNull(),
  lyricsMode: mysqlEnum("lyricsMode", ["none", "generate", "custom"]).default("none").notNull(),
  lyrics: text("lyrics"),
  vocalLanguage: mysqlEnum("vocalLanguage", ["fr", "en", "auto"]).default("auto").notNull(),
  songStructure: json("songStructure"),
  actualDurationSeconds: int("actualDurationSeconds"),
  provider: varchar("provider", { length: 64 }).default("elevenlabs").notNull(),
  providerJobId: varchar("providerJobId", { length: 255 }),
  providerPlanId: varchar("providerPlanId", { length: 255 }),
  status: mysqlEnum("status", ["queued", "processing", "completed", "failed", "cancelled"]).default("queued").notNull(),
  creditsReserved: int("creditsReserved").notNull(),
  retryCount: int("retryCount").default(0).notNull(),
  lastError: text("lastError"),
  nextRetryAt: timestamp("nextRetryAt"),
  startedAt: timestamp("startedAt"),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => [
  index("generations_user_status_index").on(table.userId, table.status),
  index("generations_provider_job_index").on(table.providerJobId),
]);

export const audioAssets = mysqlTable("audioAssets", {
  id: varchar("id", { length: 36 }).primaryKey(),
  generationId: varchar("generationId", { length: 36 }).notNull(),
  userId: varchar("userId", { length: 36 }).notNull(),
  variant: mysqlEnum("variant", ["master", "instrumental", "vocals", "stem", "alternate"]).default("master").notNull(),
  filename: varchar("filename", { length: 255 }),
  storageKey: varchar("storageKey", { length: 512 }).notNull(),
  publicUrl: text("publicUrl").notNull(),
  format: varchar("format", { length: 16 }).notNull(),
  durationSeconds: int("durationSeconds"),
  sizeBytes: int("sizeBytes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, table => [
  index("audio_generation_variant_index").on(table.generationId, table.variant),
  index("audio_user_index").on(table.userId),
]);

export const paymentOrders = mysqlTable("paymentOrders", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: varchar("userId", { length: 36 }).notNull(),
  provider: mysqlEnum("provider", ["paystack", "flutterwave", "chariow"]).notNull(),
  status: mysqlEnum("status", ["pending", "paid", "expired", "failed", "refunded"]).default("pending").notNull(),
  planCode: varchar("planCode", { length: 64 }).notNull(),
  creditAmount: int("creditAmount").notNull(),
  amountMinor: int("amountMinor").notNull(),
  currency: varchar("currency", { length: 3 }).notNull(),
  checkoutUrl: text("checkoutUrl").notNull(),
  providerReference: varchar("providerReference", { length: 255 }).notNull(),
  paidByEmail: varchar("paidByEmail", { length: 320 }),
  paidAt: timestamp("paidAt"),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => [
  uniqueIndex("payment_reference_unique").on(table.provider, table.providerReference),
  index("payment_user_status_index").on(table.userId, table.status),
]);

export const paymentEvents = mysqlTable("paymentEvents", {
  id: varchar("id", { length: 36 }).primaryKey(),
  orderId: varchar("orderId", { length: 36 }),
  provider: mysqlEnum("provider", ["paystack", "flutterwave", "chariow"]).notNull(),
  externalEventId: varchar("externalEventId", { length: 255 }).notNull(),
  type: varchar("type", { length: 128 }).notNull(),
  signatureValid: boolean("signatureValid").default(false).notNull(),
  payload: json("payload").notNull(),
  processedAt: timestamp("processedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, table => [uniqueIndex("payment_event_unique").on(table.provider, table.externalEventId)]);

export const auditLogs = mysqlTable("auditLogs", {
  id: varchar("id", { length: 36 }).primaryKey(),
  userId: varchar("userId", { length: 36 }),
  action: varchar("action", { length: 128 }).notNull(),
  entityType: varchar("entityType", { length: 64 }).notNull(),
  entityId: varchar("entityId", { length: 64 }).notNull(),
  metadata: json("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, table => [index("audit_entity_index").on(table.entityType, table.entityId)]);

export type User = typeof authUsers.$inferSelect;
export type InsertUser = typeof authUsers.$inferInsert;
