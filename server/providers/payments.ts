import crypto from "node:crypto";
import type { PaymentProvider } from "./contracts";

type ProviderName = "paystack" | "flutterwave" | "chariow";

export function createPaymentProvider(provider: ProviderName): PaymentProvider {
  if (provider === "paystack") return new PaystackProvider();
  if (provider === "chariow") return new ChariowProvider();
  return new FlutterwaveProvider();
}

class ChariowProvider implements PaymentProvider {
  readonly id = "chariow" as const;

  async createCheckout(input: Parameters<PaymentProvider["createCheckout"]>[0]) {
    const apiKey = process.env.CHARIOW_API_KEY;
    if (!apiKey) {
      return { checkoutUrl: `/paiement/test?commande=${encodeURIComponent(input.orderId)}`, providerReference: `test-chariow-${input.orderId}` };
    }
    if (!input.productId) throw new Error("Le produit Chariow associé à ce pack n’est pas configuré.");
    const response = await fetch("https://api.chariow.com/v1/checkout", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        product_id: input.productId,
        email: input.customerEmail,
        first_name: "Client",
        last_name: "AfroMuse",
        redirect_url: input.callbackUrl,
        custom_metadata: { order_ref: input.orderId, beneficiary_order_id: input.orderId, source: "afromuse" },
      }),
    });
    const payload = await response.json() as { message?: string; data?: { step?: string; purchase?: { id: string }; payment?: { checkout_url?: string | null } } };
    const data = payload.data;
    if (!response.ok || !data?.purchase?.id) throw new Error(payload.message || "Impossible de créer le checkout Chariow.");
    if (data.step === "payment" && data.payment?.checkout_url) return { checkoutUrl: data.payment.checkout_url, providerReference: data.purchase.id };
    if (data.step === "completed") return { checkoutUrl: input.callbackUrl, providerReference: data.purchase.id };
    throw new Error("Le checkout Chariow n’est pas disponible pour ce produit.");
  }

  verifyWebhook({ signature, rawBody }: { signature?: string; rawBody: string }) {
    const secret = process.env.CHARIOW_WEBHOOK_SECRET;
    if (!secret || !signature) return false;
    const expected = `sha256=${crypto.createHmac("sha256", secret).update(rawBody).digest("hex")}`;
    const expectedBuffer = Buffer.from(expected);
    const signatureBuffer = Buffer.from(signature);
    return expectedBuffer.length === signatureBuffer.length && crypto.timingSafeEqual(expectedBuffer, signatureBuffer);
  }
}

class PaystackProvider implements PaymentProvider {
  readonly id = "paystack" as const;

  async createCheckout(input: Parameters<PaymentProvider["createCheckout"]>[0]) {
    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) {
      return {
        checkoutUrl: `/paiement/test?commande=${encodeURIComponent(input.orderId)}`,
        providerReference: `test-paystack-${input.orderId}`,
      };
    }

    const response = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: { Authorization: `Bearer ${secretKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        email: input.customerEmail,
        amount: input.amountMinor,
        currency: input.currency,
        reference: input.orderId,
        callback_url: input.callbackUrl,
        metadata: { beneficiary_user_id: input.orderId },
      }),
    });
    const payload = await response.json() as { status: boolean; data?: { authorization_url: string; reference: string }; message?: string };
    if (!response.ok || !payload.status || !payload.data) throw new Error(payload.message || "Impossible de créer le paiement Paystack.");
    return { checkoutUrl: payload.data.authorization_url, providerReference: payload.data.reference };
  }

  verifyWebhook({ signature, rawBody }: { signature?: string; rawBody: string }) {
    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey || !signature) return false;
    const expected = crypto.createHmac("sha512", secretKey).update(rawBody).digest("hex");
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  }
}

class FlutterwaveProvider implements PaymentProvider {
  readonly id = "flutterwave" as const;

  async createCheckout(input: Parameters<PaymentProvider["createCheckout"]>[0]) {
    const secretKey = process.env.FLUTTERWAVE_SECRET_KEY;
    if (!secretKey) {
      return {
        checkoutUrl: `/paiement/test?commande=${encodeURIComponent(input.orderId)}`,
        providerReference: `test-flutterwave-${input.orderId}`,
      };
    }

    const response = await fetch("https://api.flutterwave.com/v3/payments", {
      method: "POST",
      headers: { Authorization: `Bearer ${secretKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        tx_ref: input.orderId,
        amount: input.amountMinor,
        currency: input.currency,
        redirect_url: input.callbackUrl,
        customer: { email: input.customerEmail },
        meta: { beneficiary_order_id: input.orderId },
        customizations: { title: "AfroMuse AI", description: "Recharge de crédits de création musicale" },
      }),
    });
    const payload = await response.json() as { status: string; data?: { link: string }; message?: string };
    if (!response.ok || payload.status !== "success" || !payload.data) throw new Error(payload.message || "Impossible de créer le paiement Flutterwave.");
    return { checkoutUrl: payload.data.link, providerReference: input.orderId };
  }

  verifyWebhook({ signature }: { signature?: string; rawBody: string }) {
    const hash = process.env.FLUTTERWAVE_WEBHOOK_HASH;
    if (!hash || !signature) return false;
    return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(signature));
  }
}
