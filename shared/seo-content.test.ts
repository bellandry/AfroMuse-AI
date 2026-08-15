import { describe, expect, it } from "vitest";
import { getSeoMeta, listContent } from "./seo-content";

describe("cartographie SEO AfroMuse", () => {
  it("rend la fiche afrobeats indexable avec une canonique spécifique", () => {
    const meta = getSeoMeta("/styles/afrobeats");
    expect(meta.canonicalPath).toBe("/styles/afrobeats");
    expect(meta.noindex).toBeUndefined();
    expect(meta.notFound).toBeUndefined();
    expect(meta.title).toContain("afrobeats");
  });

  it("empêche l’indexation des routes applicatives privées", () => {
    expect(getSeoMeta("/app").noindex).toBe(true);
    expect(getSeoMeta("/bibliotheque").noindex).toBe(true);
    expect(getSeoMeta("/connexion").noindex).toBe(true);
  });

  it("déclare les slugs inconnus comme pages introuvables", () => {
    expect(getSeoMeta("/styles/inexistant").notFound).toBe(true);
    expect(getSeoMeta("/inconnue").notFound).toBe(true);
  });

  it("conserve un corpus éditorial borné et non combinatoire", () => {
    expect(listContent("style").map(entry => entry.slug)).toEqual(expect.arrayContaining(["afrobeats", "amapiano", "highlife"]));
    expect(listContent("guide")).toHaveLength(1);
  });
});
