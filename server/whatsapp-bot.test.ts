import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createGeneration: vi.fn(),
  getCreditBalance: vi.fn(),
  listGenerationsForUser: vi.fn(),
  requestWhatsappOtp: vi.fn(),
  sendText: vi.fn(),
  select: vi.fn(),
}));

vi.mock("./db", () => ({ db: { select: mocks.select }, listGenerationsForUser: mocks.listGenerationsForUser }));
vi.mock("./services/credits", () => ({ getCreditBalance: mocks.getCreditBalance }));
vi.mock("./services/generations", () => ({ createGeneration: mocks.createGeneration }));
vi.mock("./services/payments", () => ({ createPaymentOrder: vi.fn() }));
vi.mock("./services/whatsapp-otp", () => ({ requestWhatsappOtp: mocks.requestWhatsappOtp }));
vi.mock("./providers/openwa", () => ({ OpenWAProvider: class { sendText = mocks.sendText; } }));

import { handleWhatsAppMessage, parseWhatsAppGenerationCommand } from "./whatsapp-bot";

const user = { id: "user-1", email: "creator@afromuse.ai" };
const message = (body: string) => ({ from: "+22890000000", body });
const selectResult = (rows: unknown[]) => ({ from: () => ({ where: () => ({ limit: async () => rows }) }) });

function mockKnownUser() {
  mocks.select.mockReturnValueOnce(selectResult([{ userId: user.id }])).mockReturnValueOnce(selectResult([user]));
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.sendText.mockResolvedValue({ delivered: true });
  mocks.createGeneration.mockResolvedValue({ id: "generation-1", creditsReserved: 21, status: "queued" });
});

describe("parseWhatsAppGenerationCommand", () => {
  it("prépare une chanson longue à paroles assistées depuis une commande guidée", () => {
    expect(parseWhatsAppGenerationCommand("créer chanson 180 | gospel | paroles assistées | spirituel | un refrain d’espoir au lever du jour")).toEqual({
      mode: "vocal",
      durationSeconds: 180,
      style: "gospel",
      mood: "spirituel",
      prompt: "un refrain d’espoir au lever du jour",
      lyricsMode: "generate",
    });
  });

  it("prépare un instrumental avec l’humeur par défaut lorsque celle-ci est omise", () => {
    expect(parseWhatsAppGenerationCommand("creer instrumental 60 | afrobeats | une fête solaire à Lomé")).toEqual({
      mode: "instrumental",
      durationSeconds: 60,
      style: "afrobeats",
      mood: "solaire",
      prompt: "une fête solaire à Lomé",
      lyricsMode: "none",
    });
  });

  it("refuse un style, une durée ou une direction insuffisante", () => {
    expect(parseWhatsAppGenerationCommand("créer chanson 90 | jazz | idée")).toBeNull();
  });
});

describe("handleWhatsAppMessage", () => {
  it("met en file un instrumental WhatsApp avec la même réservation que le studio", async () => {
    mockKnownUser();

    await handleWhatsAppMessage(message("créer instrumental 60 | afrobeats | une fête solaire à Lomé"));

    expect(mocks.createGeneration).toHaveBeenCalledWith(user.id, expect.objectContaining({ mode: "instrumental", durationSeconds: 60, lyricsMode: "none" }));
    expect(mocks.sendText).toHaveBeenCalledWith(expect.objectContaining({ text: expect.stringContaining("en file d’attente") }));
  });

  it("met en file une chanson 180 secondes à paroles assistées", async () => {
    mockKnownUser();

    await handleWhatsAppMessage(message("créer chanson 180 | gospel | paroles assistées | spirituel | un refrain d’espoir au lever du jour"));

    expect(mocks.createGeneration).toHaveBeenCalledWith(user.id, expect.objectContaining({ mode: "vocal", durationSeconds: 180, lyricsMode: "generate" }));
  });

  it("redirige les paroles personnalisées vers le studio sans réserver de crédits", async () => {
    mockKnownUser();

    await handleWhatsAppMessage(message("créer vocal 120 | amapiano | paroles personnalisées | romantique | une déclaration tendre au coucher du soleil"));

    expect(mocks.createGeneration).not.toHaveBeenCalled();
    expect(mocks.sendText).toHaveBeenCalledWith(expect.objectContaining({ text: expect.stringContaining("studio AfroMuse") }));
  });

  it("explique les erreurs de crédits sans masquer la cause", async () => {
    mockKnownUser();
    mocks.createGeneration.mockRejectedValueOnce(new Error("Solde insuffisant pour réserver 21 crédits."));

    await handleWhatsAppMessage(message("créer chanson 120 | amapiano | paroles assistées | solaire | un hymne lumineux pour danser à Abidjan"));

    expect(mocks.sendText).toHaveBeenCalledWith(expect.objectContaining({ text: expect.stringContaining("Solde insuffisant") }));
  });

  it("guide une commande vocale incomplète au lieu de créer une génération", async () => {
    mockKnownUser();

    await handleWhatsAppMessage(message("créer chanson 120 | amapiano | une idée trop vague"));

    expect(mocks.createGeneration).not.toHaveBeenCalled();
    expect(mocks.sendText).toHaveBeenCalledWith(expect.objectContaining({ text: expect.stringContaining("paroles assistées") }));
  });
});
