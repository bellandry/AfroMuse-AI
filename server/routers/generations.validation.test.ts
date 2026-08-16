import { describe, expect, it } from "vitest";
import { generationInput } from "./generations";

const base = {
  title: "Nuit chaude à Lomé",
  prompt: "Un groove solaire, percussions organiques et basse profonde pour la nuit.",
  style: "afrobeats",
  mood: "solaire",
  durationSeconds: 180,
  mode: "vocal",
  language: "fr",
  lyricsMode: "generate",
  vocalLanguage: "fr",
};

describe("validation des chansons vocales longues", () => {
  it("accepte une chanson vocale de trois minutes avec paroles assistées", () => {
    expect(generationInput.safeParse(base).success).toBe(true);
  });

  it("exige les paroles lorsqu’un utilisateur sélectionne le mode personnalisé", () => {
    const result = generationInput.safeParse({ ...base, lyricsMode: "custom" });
    expect(result.success).toBe(false);
  });

  it("refuse les paroles sur une génération instrumentale", () => {
    const result = generationInput.safeParse({ ...base, mode: "instrumental", lyricsMode: "generate" });
    expect(result.success).toBe(false);
  });

  it("refuse une durée qui ne fait pas partie des formats commercialisés", () => {
    const result = generationInput.safeParse({ ...base, durationSeconds: 150 });
    expect(result.success).toBe(false);
  });
});
