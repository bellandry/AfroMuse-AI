import express, { type Express } from "express";
import fs from "fs";
import { type Server } from "http";
import { nanoid } from "nanoid";
import path from "path";
import superjson from "superjson";
import { createServer as createViteServer } from "vite";
import { DEFAULT_DESCRIPTION, getSeoMeta, SITE_NAME, type SeoMeta } from "../../shared/seo-content";
import viteConfig from "../../vite.config";

const canonicalOrigin = () => (process.env.CANONICAL_ORIGIN || "").replace(/\/$/, "");
const escapeHtml = (value: string) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
const clamp = (value: string, max: number) => (value.replace(/\s+/g, " ").trim().slice(0, max) || SITE_NAME);

function headTags(head: SeoMeta) {
  const title = escapeHtml(clamp(head.title, 70));
  const description = escapeHtml(clamp(head.description, 200));
  const origin = canonicalOrigin();
  const canonical = head.canonicalPath && origin ? `${origin}${head.canonicalPath}` : "";
  const image = head.ogImage && origin ? `${origin}${head.ogImage}` : undefined;
  const tags = [
    `<title>${title}</title>`, `<meta name="description" content="${description}" />`,
    `<meta property="og:type" content="${head.ogType || "website"}" />`, `<meta property="og:title" content="${title}" />`,
    `<meta property="og:description" content="${description}" />`, `<meta property="og:locale" content="fr_FR" />`,
    `<meta property="og:site_name" content="${escapeHtml(process.env.SITE_NAME || SITE_NAME)}" />`,
    `<meta name="twitter:card" content="${image ? "summary_large_image" : "summary"}" />`, `<meta name="twitter:title" content="${title}" />`, `<meta name="twitter:description" content="${description}" />`,
  ];
  if (canonical) tags.push(`<link rel="canonical" href="${escapeHtml(canonical)}" />`, `<meta property="og:url" content="${escapeHtml(canonical)}" />`);
  if (image) tags.push(`<meta property="og:image" content="${escapeHtml(image)}" />`, `<meta name="twitter:image" content="${escapeHtml(image)}" />`);
  if (head.noindex || head.notFound) tags.push(`<meta name="robots" content="noindex, follow" />`);
  return tags.join("\n");
}

function composeHtml(template: string, html: string, head: SeoMeta, dehydratedState: unknown, shell: boolean) {
  const serialized = JSON.stringify(superjson.serialize(dehydratedState)).replace(/</g, "\\u003c");
  const state = `<script>window.__RQ_STATE__=${serialized};window.__SSR_SHELL__=${shell ? "true" : "false"};</script>`;
  return template.replace("</body>", () => `${state}</body>`).replace("<!--app-head-->", () => headTags(head)).replace("<!--app-html-->", () => html);
}

export async function setupVite(app: Express, server: Server) {
  const vite = await createViteServer({ ...viteConfig, configFile: false, server: { middlewareMode: true, hmr: { server }, allowedHosts: true }, appType: "custom" });
  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    try {
      const templatePath = path.resolve(import.meta.dirname, "../..", "client", "index.html");
      let template = await fs.promises.readFile(templatePath, "utf-8");
      template = template.replace(`src="/src/entry-client.tsx"`, `src="/src/entry-client.tsx?v=${nanoid()}"`);
      template = await vite.transformIndexHtml(req.originalUrl, template);
      template = template.replace("</head>", `<link rel="stylesheet" href="/src/index.css?direct" data-ssr-dev-css></head>`);
      const module = await vite.ssrLoadModule("/src/entry-server.tsx");
      const result = await module.render(req.originalUrl);
      res.status(result.head.notFound ? 404 : 200).set("Cache-Control", "no-cache").type("html").end(composeHtml(template, result.html, result.head, result.dehydratedState, result.shell));
    } catch (error) {
      vite.ssrFixStacktrace(error as Error);
      next(error);
    }
  });
}

export function serveStatic(app: Express) {
  const distPath = path.resolve(import.meta.dirname, "public");
  const entryPath = path.resolve(import.meta.dirname, "server-ssr", "entry-server.js");
  app.use((req, res, next) => {
    if (req.path === "/index.html") return res.redirect(301, "/");
    if (req.path !== "/" && /\/+$/.test(req.path)) return res.redirect(301, req.path.replace(/\/+$/, "") + req.originalUrl.slice(req.path.length));
    next();
  });
  app.use(express.static(distPath, { index: false, redirect: false }));
  app.use("*", async (req, res) => {
    const template = await fs.promises.readFile(path.resolve(distPath, "index.html"), "utf-8");
    try {
      const module = await import(entryPath);
      const result = await module.render(req.originalUrl);
      res.status(result.head.notFound ? 404 : 200).set("Cache-Control", "no-cache").type("html").end(composeHtml(template, result.html, result.head, result.dehydratedState, result.shell));
    } catch (error) {
      console.error("[SSR] render failed, serving client shell", error);
      const head = getSeoMeta(req.originalUrl);
      res.status(200).set("Cache-Control", "no-cache").type("html").end(composeHtml(template, "", { ...head, title: SITE_NAME, description: DEFAULT_DESCRIPTION }, {}, true));
    }
  });
}
