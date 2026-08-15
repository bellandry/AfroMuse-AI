import crypto from "node:crypto";
import type { OutboundWhatsAppMessage, WhatsAppProvider } from "./contracts";

export class OpenWAProvider implements WhatsAppProvider {
  readonly id = "openwa";
  private get baseUrl() { return process.env.OPENWA_BASE_URL?.replace(/\/$/, ""); }

  async sendText(message: OutboundWhatsAppMessage) {
    if (!this.baseUrl || !process.env.OPENWA_API_KEY) return { externalMessageId: `development-${crypto.randomUUID()}` };
    const response = await fetch(`${this.baseUrl}/sendText`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.OPENWA_API_KEY}` }, body: JSON.stringify({ to: message.recipient, content: message.text }) });
    if (!response.ok) throw new Error("OpenWA n’a pas pu envoyer le message.");
    return { externalMessageId: crypto.randomUUID() };
  }

  async sendAudio(input: { recipient: string; url: string; filename: string }) {
    if (!this.baseUrl || !process.env.OPENWA_API_KEY) return { externalMessageId: `development-${crypto.randomUUID()}` };
    const response = await fetch(`${this.baseUrl}/sendFileFromUrl`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.OPENWA_API_KEY}` }, body: JSON.stringify({ to: input.recipient, url: input.url, filename: input.filename, caption: "Votre création AfroMuse AI" }) });
    if (!response.ok) throw new Error("OpenWA n’a pas pu envoyer l’audio.");
    return { externalMessageId: crypto.randomUUID() };
  }

  verifyWebhook({ signature }: { signature?: string; rawBody: string }) {
    const secret = process.env.OPENWA_WEBHOOK_SECRET;
    if (!secret || !signature) return false;
    const expected = Buffer.from(secret);
    const received = Buffer.from(signature);
    return expected.length === received.length && crypto.timingSafeEqual(expected, received);
  }
}
