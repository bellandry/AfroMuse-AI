import { describe, expect, it } from "vitest";
import { canProcessGeneration } from "./generations";

describe("idempotence des jobs de génération", () => {
  it("ne relance jamais une génération terminale", () => {
    expect(canProcessGeneration("completed", 0)).toBe(false);
    expect(canProcessGeneration("cancelled", 0)).toBe(false);
    expect(canProcessGeneration("failed", 3)).toBe(false);
  });

  it("autorise uniquement les jobs en attente ou récupérables", () => {
    expect(canProcessGeneration("queued", 0)).toBe(true);
    expect(canProcessGeneration("failed", 2)).toBe(true);
  });
});
