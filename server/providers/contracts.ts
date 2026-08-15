export type MusicGenerationInput = {
  requestId: string;
  title: string;
  prompt: string;
  style: string;
  mood: string;
  durationSeconds: number;
  mode: "vocal" | "instrumental";
  language: "fr" | "en";
};

export type MusicGenerationTask = {
  providerJobId: string;
  status: "queued" | "processing" | "completed" | "failed";
  outputUrl?: string;
  errorMessage?: string;
};

export interface MusicProvider {
  readonly id: string;
  createGeneration(input: MusicGenerationInput): Promise<MusicGenerationTask>;
  getGenerationStatus(providerJobId: string): Promise<MusicGenerationTask>;
  cancelGeneration(providerJobId: string): Promise<void>;
  estimateCredits(input: MusicGenerationInput): number;
}

export type OutboundWhatsAppMessage = {
  recipient: string;
  text: string;
};

export interface WhatsAppProvider {
  readonly id: string;
  sendText(message: OutboundWhatsAppMessage): Promise<{ externalMessageId: string }>;
  sendAudio(input: { recipient: string; url: string; filename: string }): Promise<{ externalMessageId: string }>;
  verifyWebhook(input: { signature?: string; rawBody: string }): boolean;
}

export interface PaymentProvider {
  readonly id: "paystack" | "flutterwave" | "chariow";
  createCheckout(input: {
    orderId: string;
    amountMinor: number;
    currency: string;
    customerEmail: string;
    callbackUrl: string;
    productId?: string;
  }): Promise<{ checkoutUrl: string; providerReference: string }>;
  verifyWebhook(input: { signature?: string; rawBody: string }): boolean;
}
