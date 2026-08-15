import crypto from "node:crypto";
import { and, eq } from "drizzle-orm";
import { paymentEvents, paymentOrders } from "../../drizzle/schema";
import { db } from "../db";
import { createPaymentProvider } from "../providers/payments";
import { creditPurchase, refundCreditPurchase } from "./credits";

export const creditPlans = [
  { code: "starter", name: "Découverte", credits: 18, amountMinor: 1500, currency: "XOF", chariowProductEnv: "CHARIOW_PRODUCT_STARTER" },
  { code: "creator", name: "Créateur", credits: 75, amountMinor: 5000, currency: "XOF", chariowProductEnv: "CHARIOW_PRODUCT_CREATOR" },
  { code: "studio", name: "Studio", credits: 220, amountMinor: 12000, currency: "XOF", chariowProductEnv: "CHARIOW_PRODUCT_STUDIO" },
] as const;

export type PaymentProviderName = "paystack" | "flutterwave" | "chariow";

export async function createPaymentOrder(input: {
  userId: string;
  email: string;
  planCode: (typeof creditPlans)[number]["code"];
  provider: PaymentProviderName;
  callbackUrl: string;
}) {
  const plan = creditPlans.find(item => item.code === input.planCode);
  if (!plan) throw new Error("Pack de crédits introuvable.");
  const id = crypto.randomUUID();
  const provider = createPaymentProvider(input.provider);
  const checkout = await provider.createCheckout({
    orderId: id,
    amountMinor: plan.amountMinor,
    currency: plan.currency,
    customerEmail: input.email,
    callbackUrl: input.callbackUrl,
    productId: input.provider === "chariow" ? process.env[plan.chariowProductEnv] : undefined,
  });
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000);
  await db.insert(paymentOrders).values({
    id, userId: input.userId, provider: input.provider, planCode: plan.code, creditAmount: plan.credits,
    amountMinor: plan.amountMinor, currency: plan.currency, checkoutUrl: checkout.checkoutUrl,
    providerReference: checkout.providerReference, expiresAt,
  });
  return { id, checkoutUrl: checkout.checkoutUrl, expiresAt };
}

export async function recordPaymentWebhook(input: {
  provider: PaymentProviderName;
  rawBody: string;
  signature?: string;
  deliveryId?: string;
}) {
  const provider = createPaymentProvider(input.provider);
  if (!provider.verifyWebhook(input)) return { accepted: false as const, reason: "invalid_signature" as const };

  const payload = JSON.parse(input.rawBody) as Record<string, unknown>;
  const data = (payload.data ?? {}) as Record<string, unknown>;
  const sale = (data.sale ?? data.purchase ?? data) as Record<string, unknown>;
  const metadata = (sale.custom_metadata ?? data.custom_metadata ?? {}) as Record<string, unknown>;
  const reference = String(data.reference ?? data.tx_ref ?? sale.id ?? metadata.order_ref ?? "");
  const externalEventId = input.deliveryId ?? String(data.id ?? sale.id ?? `${reference}:${String(payload.event ?? payload.type ?? "unknown")}`);
  const status = String(data.status ?? sale.status ?? "").toLowerCase();
  const paid = status === "success" || status === "successful" || status === "completed" || String(payload.event ?? "").toLowerCase() === "successful.sale";
  const refunded = status === "refunded" || String(payload.event ?? "").toLowerCase().includes("refund");
  if (!reference || (!paid && !refunded)) return { accepted: true as const, credited: false as const };

  const result = await db.transaction(async tx => {
    const [order] = await tx.select().from(paymentOrders).where(and(
      eq(paymentOrders.provider, input.provider), eq(paymentOrders.providerReference, reference),
    )).limit(1);
    if (!order) return { credited: false as const };
    const [existing] = await tx.select().from(paymentEvents).where(and(
      eq(paymentEvents.provider, input.provider), eq(paymentEvents.externalEventId, externalEventId),
    )).limit(1);
    if (existing) return { credited: false as const, duplicate: true as const };

    await tx.insert(paymentEvents).values({
      id: crypto.randomUUID(), orderId: order.id, provider: input.provider, externalEventId,
      type: String(payload.event ?? payload.type ?? "payment"), signatureValid: true, payload, processedAt: new Date(),
    });
    if (paid && order.status !== "paid") {
      await tx.update(paymentOrders).set({ status: "paid", paidAt: new Date() }).where(eq(paymentOrders.id, order.id));
      return { credited: true as const, order };
    }
    if (refunded && order.status === "paid") {
      await tx.update(paymentOrders).set({ status: "refunded" }).where(eq(paymentOrders.id, order.id));
      return { refunded: true as const, order };
    }
    return { credited: false as const, refunded: false as const };
  });
  if (result.credited) await creditPurchase(result.order.userId, result.order.creditAmount, { referenceType: "payment", referenceId: result.order.id });
  if (result.refunded) await refundCreditPurchase(result.order.userId, result.order.creditAmount, { referenceType: "payment_refund", referenceId: result.order.id });
  return { accepted: true as const, credited: result.credited, refunded: Boolean(result.refunded) };
}
