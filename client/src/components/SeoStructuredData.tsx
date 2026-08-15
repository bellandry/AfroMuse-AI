import { getContent, getSeoMeta, SITE_NAME } from "@shared/seo-content";
import { useLocation } from "wouter";

export function SeoStructuredData() {
  const [location] = useLocation();
  const meta = getSeoMeta(location);
  if (meta.noindex || meta.notFound) return null;
  const path = location.split("?")[0];
  const match = path.match(/^\/(styles|ambiances|guides|cas-usages)\/([^/]+)$/);
  const kindMap: Record<string, "style" | "mood" | "guide" | "useCase"> = { styles: "style", ambiances: "mood", guides: "guide", "cas-usages": "useCase" };
  const entry = match ? getContent(kindMap[match[1]], match[2]) : undefined;
  const graph: Record<string, unknown>[] = [
    { "@context": "https://schema.org", "@type": "Organization", name: SITE_NAME, url: "/", email: "bonjour@afromuse.ai" },
    { "@context": "https://schema.org", "@type": "WebSite", name: SITE_NAME, url: "/", inLanguage: "fr" },
  ];
  if (path === "/") graph.push({ "@context": "https://schema.org", "@type": "SoftwareApplication", name: SITE_NAME, applicationCategory: "MultimediaApplication", operatingSystem: "Web", description: meta.description, inLanguage: "fr" });
  if (path === "/") graph.push({ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: [{ "@type": "Question", name: "Puis-je générer depuis WhatsApp ?", acceptedAnswer: { "@type": "Answer", text: "Après la liaison sécurisée du numéro, le bot guide la création, le suivi et la réception des morceaux." } }, { "@type": "Question", name: "Comment fonctionnent les crédits ?", acceptedAnswer: { "@type": "Answer", text: "Les crédits sont réservés avant une génération, consommés lorsqu’elle aboutit et libérés en cas d’échec." } }] });
  if (path === "/contact") graph.push({ "@context": "https://schema.org", "@type": "ContactPage", name: `Contact ${SITE_NAME}`, description: meta.description });
  if (entry) {
    const collection = match?.[1] || "";
    graph.push({ "@context": "https://schema.org", "@type": entry.kind === "guide" ? "Article" : "WebPage", headline: entry.title, description: entry.description, dateModified: entry.updatedAt, inLanguage: "fr", author: { "@type": "Organization", name: SITE_NAME } });
    graph.push({ "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "AfroMuse AI", item: "/" }, { "@type": "ListItem", position: 2, name: collection, item: `/${collection}` }, { "@type": "ListItem", position: 3, name: entry.shortTitle, item: path }] });
  }
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@graph": graph }).replace(/</g, "\\u003c") }} />;
}
