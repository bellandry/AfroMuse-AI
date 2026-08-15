import type { Express, Request } from "express";
import { CONTENT } from "../shared/seo-content";

const escapeXml = (value: string) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
const originFor = (req: Request) => (process.env.CANONICAL_ORIGIN || `${req.protocol}://${req.get("host") || "localhost"}`).replace(/\/$/, "");
const publicPaths = ["/", "/contact", "/cgu", "/confidentialite", "/mentions-legales", "/politique-cookies", "/politique-contenu-ia", "/styles", "/ambiances", "/guides", "/cas-usages"];

export function getRobotsText(origin: string) {
  return ["User-agent: GPTBot", "Disallow: /", "", "User-agent: OAI-SearchBot", "Allow: /", "", "User-agent: Claude-SearchBot", "Allow: /", "", "User-agent: *", "Allow: /", "Disallow: /connexion", "Disallow: /app", "Disallow: /creer", "Disallow: /bibliotheque", "Disallow: /credits", "Disallow: /compte", "", `Sitemap: ${origin}/sitemap.xml`].join("\n");
}

export function getSitemapXml(origin: string) {
  const urls = [...publicPaths.map(path => ({ path, lastmod: "2026-08-15" })), ...CONTENT.map(entry => ({ path: `/${entry.kind === "style" ? "styles" : entry.kind === "mood" ? "ambiances" : entry.kind === "guide" ? "guides" : "cas-usages"}/${entry.slug}`, lastmod: entry.updatedAt }))];
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map(url => `<url><loc>${escapeXml(`${origin}${url.path}`)}</loc><lastmod>${url.lastmod}</lastmod></url>`).join("")}</urlset>`;
}

export function getLlmsText(origin: string) {
  return `# AfroMuse AI\n\n> AfroMuse AI est une plateforme de création musicale IA pensée pour des univers musicaux africains, accessible depuis le web et WhatsApp.\n\n## Pages prioritaires\n- ${origin}/\n- ${origin}/styles\n- ${origin}/ambiances\n- ${origin}/guides\n- ${origin}/cas-usages\n\n## Règles de contenu\nLes guides proposent des directions originales. Les utilisateurs ne doivent pas demander l’imitation d’artistes, de paroles ou d’œuvres existantes.\n\n## Informations de confiance\n- ${origin}/cgu\n- ${origin}/confidentialite\n- ${origin}/politique-contenu-ia\n- ${origin}/contact\n`;
}

export function registerSeoRoutes(app: Express) {
  app.get("/robots.txt", (req, res) => res.type("text/plain").send(getRobotsText(originFor(req))));
  app.get("/sitemap.xml", (req, res) => res.type("application/xml").send(getSitemapXml(originFor(req))));
  app.get("/llms.txt", (req, res) => res.type("text/plain").send(getLlmsText(originFor(req))));
}
