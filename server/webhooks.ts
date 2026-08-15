import type { Express, Request, Response } from "express";
import express from "express";
import { recordPaymentWebhook } from "./services/payments";
import { handleWhatsAppMessage } from "./whatsapp-bot";
import { OpenWAProvider } from "./providers/openwa";

async function receivePaymentWebhook(provider: "paystack" | "flutterwave" | "chariow", req: Request, res: Response) {
  try {
    const rawBody = Buffer.isBuffer(req.body) ? req.body.toString("utf8") : "";
    const signature = provider === "paystack"
      ? req.header("x-paystack-signature") ?? undefined
      : provider === "flutterwave"
        ? req.header("verif-hash") ?? undefined
        : req.header("x-chariow-signature") ?? undefined;
    const deliveryId = provider === "chariow" ? req.header("x-pulse-delivery-id") ?? undefined : undefined;
    const result = await recordPaymentWebhook({ provider, rawBody, signature, deliveryId });
    if (!result.accepted) return res.status(401).json({ ok: false });
    return res.status(200).json({ ok: true, credited: result.credited });
  } catch (error) {
    console.error(`[Webhook:${provider}]`, error);
    return res.status(500).json({ ok: false });
  }
}

export function registerPaymentWebhooks(app: Express) {
  app.post("/api/webhooks/paystack", express.raw({ type: "application/json" }), (req, res) => {
    void receivePaymentWebhook("paystack", req, res);
  });
  app.post("/api/webhooks/flutterwave", express.raw({ type: "application/json" }), (req, res) => {
    void receivePaymentWebhook("flutterwave", req, res);
  });
  app.post("/api/webhooks/chariow", express.raw({ type: "application/json" }), (req, res) => {
    void receivePaymentWebhook("chariow", req, res);
  });
  app.post("/api/webhooks/openwa", express.raw({ type: "application/json" }), async (req, res) => {
    const rawBody = Buffer.isBuffer(req.body) ? req.body.toString("utf8") : "";
    const provider = new OpenWAProvider();
    if (!provider.verifyWebhook({ rawBody, signature: req.header("x-openwa-signature") ?? undefined })) return res.status(401).json({ ok: false });
    try {
      const payload = JSON.parse(rawBody) as { from?: string; body?: string; text?: string };
      const from = payload.from ?? "";
      const body = payload.body ?? payload.text ?? "";
      if (!from || !body) return res.status(400).json({ ok: false });
      await handleWhatsAppMessage({ from, body });
      return res.json({ ok: true });
    } catch (error) {
      console.error("[Webhook:openwa]", error);
      return res.status(500).json({ ok: false });
    }
  });
}
