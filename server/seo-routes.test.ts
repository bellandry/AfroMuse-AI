import { describe, expect, it } from "vitest";
import { render } from "../client/src/entry-server";
import { getLlmsText, getRobotsText, getSitemapXml } from "./seo";

describe("sorties de crawl AfroMuse", () => {
  const origin = "https://www.afromuse.ai";

  it("déclare les robots de recherche et protège les zones privées", () => {
    const robots = getRobotsText(origin);
    expect(robots).toContain("User-agent: OAI-SearchBot");
    expect(robots).toContain("User-agent: Claude-SearchBot");
    expect(robots).toContain("Disallow: /app");
    expect(robots).toContain(`Sitemap: ${origin}/sitemap.xml`);
  });

  it("publie un sitemap contenant les hubs et les fiches éditoriales", () => {
    const sitemap = getSitemapXml(origin);
    expect(sitemap).toContain(`${origin}/styles`);
    expect(sitemap).toContain(`${origin}/styles/afrobeats`);
    expect(sitemap).not.toContain(`${origin}/app`);
    expect(getLlmsText(origin)).toContain(`${origin}/politique-contenu-ia`);
  });

  it("rend un contenu public sans JavaScript et garde les zones privées noindex", async () => {
    const publicResult = await render("/styles/afrobeats");
    expect(publicResult.html).toContain("Créer un afrobeats avec l’IA");
    expect(publicResult.head.canonicalPath).toBe("/styles/afrobeats");
    const privateResult = await render("/app");
    expect(privateResult.shell).toBe(true);
    expect(privateResult.head.noindex).toBe(true);
  });
});
