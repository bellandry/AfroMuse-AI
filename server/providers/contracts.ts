export type LyricsMode = "none" | "generate" | "custom";
export type SongSection = {
  type: "intro" | "verse" | "pre-chorus" | "chorus" | "bridge" | "outro";
  label?: string;
  durationSeconds?: number;
  lyrics?: string;
};

export type MusicGenerationInput = {
  requestId: string;
  title: string;
  prompt: string;
  style: string;
  mood: string;
  durationSeconds: number;
  mode: "vocal" | "instrumental";
  language: "fr" | "en";
  lyricsMode: LyricsMode;
  lyrics?: string | null;
  vocalLanguage: "fr" | "en" | "auto";
  songStructure?: SongSection[] | null;
};

export type MusicGenerationTask = {
  providerJobId: string;
  status: "queued" | "processing" | "completed" | "failed";
  outputUrl?: string;
  audioOutputs?: MusicAudioOutput[];
  errorMessage?: string;
  actualDurationSeconds?: number;
  providerPlanId?: string;
  generatedLyrics?: string;
};

export type MusicAudioOutput = {
  outputUrl: string;
  variant: "master" | "instrumental" | "vocals" | "stem" | "alternate";
  format?: "mp3" | "wav";
  durationSeconds?: number;
  filename?: string;
};

export const SUPPORTED_MUSIC_DURATIONS = [30, 60, 120, 180] as const;

export function estimateMusicCredits(input: Pick<MusicGenerationInput, "durationSeconds" | "mode" | "lyricsMode">) {
  const bands = Math.ceil(input.durationSeconds / 30);
  const basePerBand = input.mode === "vocal" ? 5 : 3;
  const lyricsSupplement = input.mode === "vocal" && input.lyricsMode !== "none" ? 1 : 0;
  return Math.max(input.mode === "vocal" ? 6 : 3, bands * basePerBand + lyricsSupplement);
}

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
