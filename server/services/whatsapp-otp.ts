import crypto from "node:crypto";
import { and, eq, gt, isNull } from "drizzle-orm";
import { authUsers, whatsappIdentities, whatsappOtps } from "../../drizzle/schema";
import { db } from "../db";
import { sendAuthEmail } from "../email";

const OTP_TTL_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 5;

export function normalizePhoneNumber(value: string) {
  const normalized = value.replace(/[^\d+]/g, "");
  if (!/^\+[1-9]\d{7,14}$/.test(normalized)) throw new Error("Numéro WhatsApp invalide. Utilisez le format international, par exemple +2250102030405.");
  return normalized;
}

function hashOtp(phoneNumber: string, code: string) {
  const secret = process.env.BETTER_AUTH_SECRET || "development-only-otp-secret";
  return crypto.createHmac("sha256", secret).update(`${phoneNumber}:${code}`).digest("hex");
}

export async function requestWhatsappOtp(phoneNumberInput: string, emailInput: string) {
  const phoneNumber = normalizePhoneNumber(phoneNumberInput);
  const email = emailInput.trim().toLowerCase();
  const [user] = await db.select().from(authUsers).where(eq(authUsers.email, email)).limit(1);
  if (!user) return { delivered: false, reason: "account_not_found" as const };

  const code = String(crypto.randomInt(100000, 1000000));
  const now = new Date();
  await db.insert(whatsappOtps).values({
    id: crypto.randomUUID(), email, phoneNumber, codeHash: hashOtp(phoneNumber, code), expiresAt: new Date(now.getTime() + OTP_TTL_MS),
  });
  await sendAuthEmail({
    to: user.email,
    subject: "Votre code de liaison WhatsApp AfroMuse AI",
    html: `<p>Votre code de confirmation WhatsApp est :</p><p style="font-size:24px;font-weight:700;letter-spacing:0.2em">${code}</p><p>Il expire dans 10 minutes. Ne le partagez jamais.</p>`,
  });
  return { delivered: true as const };
}

export async function verifyWhatsappOtp(phoneNumberInput: string, codeInput: string) {
  const phoneNumber = normalizePhoneNumber(phoneNumberInput);
  const code = codeInput.trim();
  if (!/^\d{6}$/.test(code)) throw new Error("Le code doit contenir 6 chiffres.");

  return db.transaction(async tx => {
    const [otp] = await tx.select().from(whatsappOtps).where(and(
      eq(whatsappOtps.phoneNumber, phoneNumber), isNull(whatsappOtps.consumedAt), gt(whatsappOtps.expiresAt, new Date()),
    )).orderBy(whatsappOtps.createdAt).limit(1);
    if (!otp || otp.attempts >= MAX_ATTEMPTS) throw new Error("Code invalide ou expiré. Demandez un nouveau code.");

    const expected = Buffer.from(otp.codeHash, "hex");
    const provided = Buffer.from(hashOtp(phoneNumber, code), "hex");
    const valid = expected.length === provided.length && crypto.timingSafeEqual(expected, provided);
    if (!valid) {
      await tx.update(whatsappOtps).set({ attempts: otp.attempts + 1 }).where(eq(whatsappOtps.id, otp.id));
      throw new Error("Code invalide ou expiré. Demandez un nouveau code.");
    }

    const [user] = await tx.select().from(authUsers).where(eq(authUsers.email, otp.email)).limit(1);
    if (!user) throw new Error("Le compte associé est introuvable.");
    const [existing] = await tx.select().from(whatsappIdentities).where(eq(whatsappIdentities.phoneNumber, phoneNumber)).limit(1);
    if (existing && existing.userId !== user.id) throw new Error("Ce numéro WhatsApp est déjà associé à un autre compte.");

    await tx.delete(whatsappIdentities).where(eq(whatsappIdentities.userId, user.id));
    await tx.insert(whatsappIdentities).values({
      id: crypto.randomUUID(), userId: user.id, phoneNumber, verifiedAt: new Date(),
    }).onDuplicateKeyUpdate({ set: { userId: user.id, verifiedAt: new Date(), updatedAt: new Date() } });
    await tx.update(authUsers).set({ phoneNumber }).where(eq(authUsers.id, user.id));
    await tx.update(whatsappOtps).set({ consumedAt: new Date() }).where(eq(whatsappOtps.id, otp.id));
    return { userId: user.id, phoneNumber };
  });
}
