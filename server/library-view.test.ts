import { describe, expect, it } from "vitest";
import { toLibraryItemWithAssets } from "./db";

describe("toLibraryItemWithAssets", () => {
  it("priorise la durée effective fournie par le fournisseur et préserve les métadonnées audio", () => {
    const item = toLibraryItemWithAssets(
      { id: "generation-1", durationSeconds: 180, actualDurationSeconds: 174, lyrics: "Un refrain original", title: "Nuit", status: "completed" } as never,
      [
        { id: "audio-1", variant: "master", filename: "master.mp3", publicUrl: "https://storage.example/music.mp3", format: "mp3", durationSeconds: 172, sizeBytes: 2_400_000 } as never,
        { id: "audio-2", variant: "instrumental", filename: "instrumental.mp3", publicUrl: "https://storage.example/music-instrumental.mp3", format: "mp3", durationSeconds: 174, sizeBytes: 2_100_000 } as never,
      ],
    );

    expect(item.effectiveDurationSeconds).toBe(174);
    expect(item.audioUrl).toBe("https://storage.example/music.mp3");
    expect(item.audio).toMatchObject({ format: "mp3", durationSeconds: 172, sizeBytes: 2_400_000 });
    expect(item.audioVariants).toHaveLength(2);
    expect(item.lyrics).toBe("Un refrain original");
  });

  it("retombe sur la durée du fichier lorsqu’aucune durée fournisseur n’est disponible", () => {
    const item = toLibraryItemWithAssets(
      { id: "generation-2", durationSeconds: 120, actualDurationSeconds: null } as never,
      [{ id: "audio-2", variant: "master", filename: "master.mp3", publicUrl: "https://storage.example/music.mp3", format: "mp3", durationSeconds: 118, sizeBytes: null } as never],
    );

    expect(item.effectiveDurationSeconds).toBe(118);
  });
});
