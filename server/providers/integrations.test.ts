import crypto from "node:crypto";
import { afterEach, describe, expect, it } from "vitest";
import { OpenWAProvider } from "./openwa";
import { createPaymentProvider } from "./payments";

const originalEnv = { ...process.env };

afterEach(() => {
  process.env = { ...originalEnv };
});

describe("signatures de prestataires", () => {
  it("accepte uniquement une signature Chariow HMAC-SHA256 valide", () => {
    process.env.CHARIOW_WEBHOOK_SECRET = "chariow-test-secret";
    const rawBody = '{"event":"successful.sale"}';
    const signature = `sha256=${crypto.createHmac("sha256", process.env.CHARIOW_WEBHOOK_SECRET).update(rawBody).digest("hex")}`;
    const provider = createPaymentProvider("chariow");
    expect(provider.verifyWebhook({ rawBody, signature })).toBe(true);
    expect(provider.verifyWebhook({ rawBody, signature: "sha256=invalid" })).toBe(false);
  });

  it("conserve la validation HMAC-SHA512 Paystack", () => {
    process.env.PAYSTACK_SECRET_KEY = "paystack-test-secret";
    const rawBody = '{"event":"charge.success"}';
    const signature = crypto.createHmac("sha512", process.env.PAYSTACK_SECRET_KEY).update(rawBody).digest("hex");
    expect(createPaymentProvider("paystack").verifyWebhook({ rawBody, signature })).toBe(true);
  });

  it("refuse un webhook OpenWA sans secret correspondant", () => {
    process.env.OPENWA_WEBHOOK_SECRET = "openwa-test-secret";
    const provider = new OpenWAProvider();
    expect(provider.verifyWebhook({ rawBody: "{}", signature: "openwa-test-secret" })).toBe(true);
    expect(provider.verifyWebhook({ rawBody: "{}", signature: "wrong-secret" })).toBe(false);
  });
});
