import crypto from "node:crypto";
import { afterEach, describe, expect, it } from "vitest";
import { OpenWAProvider } from "./openwa";
import { createPaymentProvider } from "./payments";
import { buildElevenMusicPayload, ElevenMusicProvider } from "./eleven-music";
import { estimateMusicCredits } from "./contracts";

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

describe("règles de génération musicale", () => {
  const provider = new ElevenMusicProvider();
  const baseInput = { requestId: "test", title: "Test", prompt: "Une composition lumineuse et organique", style: "afrobeats", mood: "solaire", durationSeconds: 60, mode: "instrumental" as const, language: "fr" as const, lyricsMode: "none" as const, vocalLanguage: "auto" as const };
  it("estime les crédits selon la durée et le format", () => {
    expect(provider.estimateCredits(baseInput)).toBe(6);
    expect(provider.estimateCredits({ ...baseInput, mode: "vocal" })).toBe(10);
    expect(provider.estimateCredits({ ...baseInput, durationSeconds: 120 })).toBe(12);
  });

  it("calibre les chansons vocales longues avec paroles", () => {
    expect(estimateMusicCredits({ durationSeconds: 180, mode: "instrumental", lyricsMode: "none" })).toBe(18);
    expect(estimateMusicCredits({ durationSeconds: 120, mode: "vocal", lyricsMode: "generate" })).toBe(21);
    expect(estimateMusicCredits({ durationSeconds: 180, mode: "vocal", lyricsMode: "custom" })).toBe(31);
  });

  it("construit des requêtes distinctes pour instrumental, paroles assistées et paroles personnalisées", () => {
    const instrumental = buildElevenMusicPayload(baseInput);
    expect(instrumental.force_instrumental).toBe(true);
    expect(instrumental.prompt).toContain("Instrumental sans voix");
    const vocal = buildElevenMusicPayload({ ...baseInput, durationSeconds: 180, mode: "vocal", lyricsMode: "custom", lyrics: "[Refrain] Une lumière se lève", vocalLanguage: "fr" });
    expect(vocal.force_instrumental).toBe(false);
    expect(vocal.music_length_ms).toBe(180000);
    expect(vocal.prompt).toContain("Paroles à respecter");
    expect(vocal.prompt).toContain("Une lumière se lève");
    const assisted = buildElevenMusicPayload({ ...baseInput, mode: "vocal", lyricsMode: "generate" });
    expect(assisted.prompt).toContain("Écrivez des paroles originales");
  });

  it("reste en état de traitement sans clé ElevenLabs en développement", async () => {
    delete process.env.ELEVENLABS_API_KEY;
    await expect(provider.createGeneration(baseInput)).resolves.toMatchObject({ status: "processing", providerJobId: "development-test" });
  });
});
