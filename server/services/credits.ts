import crypto from "node:crypto";
import { and, eq, gte, sql } from "drizzle-orm";
import { creditLedgerEntries, creditWallets } from "../../drizzle/schema";
import { db } from "../db";

type CreditReference = { referenceType: string; referenceId: string };

export function assertCreditAmount(amount: number, message = "Montant de crédits invalide.") {
  if (!Number.isInteger(amount) || amount <= 0) throw new Error(message);
}

async function ensureWallet(tx: typeof db, userId: string) {
  await tx.insert(creditWallets).values({ id: crypto.randomUUID(), userId }).onDuplicateKeyUpdate({
    set: { updatedAt: new Date() },
  });
  const [wallet] = await tx.select().from(creditWallets)
    .where(eq(creditWallets.userId, userId)).limit(1);
  if (!wallet) throw new Error("Portefeuille introuvable.");
  return wallet;
}

export async function getCreditBalance(userId: string) {
  return db.transaction(async tx => ensureWallet(tx as unknown as typeof db, userId));
}

export async function reserveCredits(userId: string, amount: number, reference: CreditReference) {
  assertCreditAmount(amount);

  return db.transaction(async tx => {
    const wallet = await ensureWallet(tx as unknown as typeof db, userId);
    const [existing] = await tx.select().from(creditLedgerEntries).where(and(
      eq(creditLedgerEntries.kind, "reserve"),
      eq(creditLedgerEntries.referenceType, reference.referenceType),
      eq(creditLedgerEntries.referenceId, reference.referenceId),
    )).limit(1);
    if (existing) return wallet;
    if (wallet.balance < amount) throw new Error("Crédits insuffisants.");

    await tx.update(creditWallets).set({
      balance: sql`${creditWallets.balance} - ${amount}`,
      reserved: sql`${creditWallets.reserved} + ${amount}`,
    }).where(and(eq(creditWallets.id, wallet.id), gte(creditWallets.balance, amount)));
    await tx.insert(creditLedgerEntries).values({
      id: crypto.randomUUID(), walletId: wallet.id, userId, amount: -amount, kind: "reserve",
      referenceType: reference.referenceType, referenceId: reference.referenceId, balanceAfter: wallet.balance - amount,
    });
    return { ...wallet, balance: wallet.balance - amount, reserved: wallet.reserved + amount };
  });
}

export async function consumeReservation(userId: string, amount: number, reference: CreditReference) {
  return db.transaction(async tx => {
    const wallet = await ensureWallet(tx as unknown as typeof db, userId);
    const [existing] = await tx.select().from(creditLedgerEntries).where(and(
      eq(creditLedgerEntries.kind, "consume"),
      eq(creditLedgerEntries.referenceType, reference.referenceType),
      eq(creditLedgerEntries.referenceId, reference.referenceId),
    )).limit(1);
    if (existing) return wallet;
    await tx.update(creditWallets).set({
      reserved: sql`GREATEST(${creditWallets.reserved} - ${amount}, 0)`,
    }).where(eq(creditWallets.id, wallet.id));
    await tx.insert(creditLedgerEntries).values({
      id: crypto.randomUUID(), walletId: wallet.id, userId, amount: 0, kind: "consume",
      referenceType: reference.referenceType, referenceId: reference.referenceId, balanceAfter: wallet.balance,
    });
    return { ...wallet, reserved: Math.max(0, wallet.reserved - amount) };
  });
}

export async function releaseReservation(userId: string, amount: number, reference: CreditReference) {
  return db.transaction(async tx => {
    const wallet = await ensureWallet(tx as unknown as typeof db, userId);
    const [existing] = await tx.select().from(creditLedgerEntries).where(and(
      eq(creditLedgerEntries.kind, "release"),
      eq(creditLedgerEntries.referenceType, reference.referenceType),
      eq(creditLedgerEntries.referenceId, reference.referenceId),
    )).limit(1);
    if (existing) return wallet;
    await tx.update(creditWallets).set({
      balance: sql`${creditWallets.balance} + ${amount}`,
      reserved: sql`GREATEST(${creditWallets.reserved} - ${amount}, 0)`,
    }).where(eq(creditWallets.id, wallet.id));
    await tx.insert(creditLedgerEntries).values({
      id: crypto.randomUUID(), walletId: wallet.id, userId, amount, kind: "release",
      referenceType: reference.referenceType, referenceId: reference.referenceId, balanceAfter: wallet.balance + amount,
    });
    return { ...wallet, balance: wallet.balance + amount, reserved: Math.max(0, wallet.reserved - amount) };
  });
}

export async function creditPurchase(userId: string, amount: number, reference: CreditReference) {
  assertCreditAmount(amount);
  return db.transaction(async tx => {
    const wallet = await ensureWallet(tx as unknown as typeof db, userId);
    const [existing] = await tx.select().from(creditLedgerEntries).where(and(
      eq(creditLedgerEntries.kind, "purchase"),
      eq(creditLedgerEntries.referenceType, reference.referenceType),
      eq(creditLedgerEntries.referenceId, reference.referenceId),
    )).limit(1);
    if (existing) return wallet;
    await tx.update(creditWallets).set({ balance: sql`${creditWallets.balance} + ${amount}` })
      .where(eq(creditWallets.id, wallet.id));
    await tx.insert(creditLedgerEntries).values({
      id: crypto.randomUUID(), walletId: wallet.id, userId, amount, kind: "purchase",
      referenceType: reference.referenceType, referenceId: reference.referenceId, balanceAfter: wallet.balance + amount,
    });
    return { ...wallet, balance: wallet.balance + amount };
  });
}

export async function refundCreditPurchase(userId: string, amount: number, reference: CreditReference) {
  assertCreditAmount(amount, "Montant de remboursement invalide.");
  return db.transaction(async tx => {
    const wallet = await ensureWallet(tx as unknown as typeof db, userId);
    const [existing] = await tx.select().from(creditLedgerEntries).where(and(
      eq(creditLedgerEntries.kind, "refund"),
      eq(creditLedgerEntries.referenceType, reference.referenceType),
      eq(creditLedgerEntries.referenceId, reference.referenceId),
    )).limit(1);
    if (existing) return wallet;
    await tx.update(creditWallets).set({ balance: sql`${creditWallets.balance} - ${amount}` })
      .where(eq(creditWallets.id, wallet.id));
    await tx.insert(creditLedgerEntries).values({
      id: crypto.randomUUID(), walletId: wallet.id, userId, amount: -amount, kind: "refund",
      referenceType: reference.referenceType, referenceId: reference.referenceId, balanceAfter: wallet.balance - amount,
    });
    return { ...wallet, balance: wallet.balance - amount };
  });
}
