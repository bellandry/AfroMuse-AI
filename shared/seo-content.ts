export type SeoMeta = {
  title: string;
  description: string;
  canonicalPath?: string;
  noindex?: boolean;
  notFound?: boolean;
  ogImage?: string;
  ogType?: "website" | "article";
};

export type ContentKind = "style" | "mood" | "guide" | "useCase";
export type ContentEntry = {
  kind: ContentKind;
  slug: string;
  title: string;
  shortTitle: string;
  description: string;
  intro: string;
  prompt: string;
  related: string[];
  updatedAt: string;
};

export const SITE_NAME = "AfroMuse AI";
export const DEFAULT_DESCRIPTION = "AfroMuse AI transforme vos intentions en créations musicales inspirées des rythmes africains, depuis le web ou WhatsApp.";
export const HERO_IMAGE = "/manus-storage/afromuse-hero-waves_5d5a8e8a.png";

export const CONTENT: ContentEntry[] = [
  { kind: "style", slug: "afrobeats", shortTitle: "Afrobeats", title: "Créer un afrobeats avec l’IA : guide, prompts et inspirations", description: "Découvrez comment décrire un afrobeats dans un prompt de musique IA : groove, percussions, énergie et structure.", intro: "L’afrobeats contemporain repose sur des rythmes dansants, une basse expressive et des textures mélodiques lumineuses. Dans AfroMuse, partez d’une intention claire plutôt que du nom d’un artiste.", prompt: "Afrobeats solaire, percussions organiques, basse dansante, guitare highlife subtile, refrain instrumental mémorable, production chaleureuse.", related: ["amapiano", "highlife", "solaire"], updatedAt: "2026-08-15" },
  { kind: "style", slug: "amapiano", shortTitle: "Amapiano", title: "Créer un amapiano avec l’IA : textures, log drum et prompts", description: "Apprenez à formuler un prompt amapiano original pour une musique IA riche en grooves, pianos et basses profondes.", intro: "L’amapiano privilégie l’espace, la progression et la tension du groove. Un bon prompt précise le tempo, l’énergie et la place des textures de piano, sans reproduire une œuvre existante.", prompt: "Amapiano nocturne et festif, piano aérien, log drum profond, percussions feutrées, montée progressive, instrumental de club élégant.", related: ["afrobeats", "rumba", "festif"], updatedAt: "2026-08-15" },
  { kind: "style", slug: "highlife", shortTitle: "Highlife", title: "Highlife et musique IA : écrire un prompt à la guitare lumineuse", description: "Repères créatifs pour imaginer un highlife original avec une IA musicale : guitare, contretemps, chaleur et arrangement.", intro: "Le highlife se prête à des créations lumineuses, portées par la guitare, les contretemps et des arrangements ouverts. Décrivez d’abord la scène, le mouvement et les instruments qui doivent dialoguer.", prompt: "Highlife chaleureux, guitares claires en contretemps, basse ronde, percussions légères, ambiance de fin d’après-midi, arrangement instrumental généreux.", related: ["afrobeats", "gospel", "solaire"], updatedAt: "2026-08-15" },
  { kind: "style", slug: "coupe-decale", shortTitle: "Coupé-décalé", title: "Composer un coupé-décalé avec l’IA : énergie et intention", description: "Structurez une idée de coupé-décalé original avec des indications de tempo, d’énergie, de percussions et de scène.", intro: "Le coupé-décalé appelle une direction énergique, des percussions affirmées et une dynamique immédiate. L’objectif est de décrire une énergie propre à votre projet, pas d’imiter un morceau connu.", prompt: "Coupé-décalé explosif, percussions sèches, synthés brillants, basse nerveuse, breaks courts et sensation de fête urbaine.", related: ["afrobeats", "mbalax", "intense"], updatedAt: "2026-08-15" },
  { kind: "mood", slug: "solaire", shortTitle: "Solaire", title: "Créer une musique IA solaire : ambiances, styles et prompts", description: "Idées de directions musicales lumineuses pour créer une ambiance solaire dans AfroMuse AI.", intro: "Une ambiance solaire se construit avec une harmonie ouverte, des textures chaleureuses et un mouvement qui laisse respirer le morceau. Elle peut servir un afrobeats, un highlife ou une afro-fusion.", prompt: "Musique afro-fusion solaire, percussions légères, accords lumineux, basse souple, sensation de route côtière au coucher du soleil.", related: ["afrobeats", "highlife", "romantique"], updatedAt: "2026-08-15" },
  { kind: "mood", slug: "festif", shortTitle: "Festif", title: "Créer une musique IA festive : rythme, énergie et progression", description: "Une méthode simple pour concevoir une direction festive sans perdre l’originalité de votre création musicale IA.", intro: "Une direction festive ne se limite pas à accélérer le tempo : elle indique une montée, une interaction entre percussions et basse, et un moment d’accroche facilement mémorisable.", prompt: "Afro-house festive, percussions entraînantes, basse énergique, synthés chaleureux, progression qui monte vers un refrain instrumental collectif.", related: ["amapiano", "coupe-decale", "solaire"], updatedAt: "2026-08-15" },
  { kind: "guide", slug: "creer-un-afrobeats-ia", shortTitle: "Créer un afrobeats IA", title: "Comment créer un afrobeats original avec une IA musicale", description: "Un guide pratique pour passer d’une intention à une création afrobeats originale dans AfroMuse AI.", intro: "Commencez par définir la scène : une soirée, une route, une célébration ou une émotion. Choisissez ensuite le style, l’ambiance, la durée et le format vocal ou instrumental avant de rédiger un prompt précis.", prompt: "Afrobeats élégant, groove medium tempo, percussions organiques, guitare en contretemps, basse profonde, énergie optimiste, instrumental de 60 secondes.", related: ["afrobeats", "solaire", "jingle-marque-africaine"], updatedAt: "2026-08-15" },
  { kind: "useCase", slug: "jingle-marque-africaine", shortTitle: "Jingle de marque", title: "Créer un jingle de marque africaine avec une IA musicale", description: "Préparez une direction musicale originale pour un jingle court, identifiable et adapté à votre marque.", intro: "Un jingle efficace part d’une signature de marque : tonalité, rythme, durée et contexte d’utilisation. Avant diffusion commerciale, vérifiez les conditions du fournisseur de génération et votre stratégie de droits.", prompt: "Jingle afro-fusion de 15 secondes, signature chaleureuse, percussion courte, motif de guitare clair, fin mémorable et espace pour une voix de marque.", related: ["afrobeats", "highlife", "festif"], updatedAt: "2026-08-15" },
];

export const getContent = (kind: ContentKind, slug: string) => CONTENT.find(entry => entry.kind === kind && entry.slug === slug);
export const listContent = (kind: ContentKind) => CONTENT.filter(entry => entry.kind === kind);

const gatedPrefixes = ["/connexion", "/app", "/creer", "/bibliotheque", "/credits", "/compte"];

export function getSeoMeta(rawPath: string): SeoMeta {
  const path = (rawPath.split("?")[0].replace(/\/+$/, "") || "/");
  const base = { ogImage: HERO_IMAGE, ogType: "website" as const };
  if (gatedPrefixes.some(prefix => path === prefix || path.startsWith(`${prefix}/`))) return { title: SITE_NAME, description: DEFAULT_DESCRIPTION, noindex: true };
  const staticPages: Record<string, SeoMeta> = {
    "/": { title: "AfroMuse AI — Créez une musique IA pensée pour l’Afrique", description: DEFAULT_DESCRIPTION, canonicalPath: "/", ...base },
    "/contact": { title: `Contact · ${SITE_NAME}`, description: "Contactez l’équipe AfroMuse AI pour une question sur la création musicale IA, les crédits ou les partenariats.", canonicalPath: "/contact", ...base },
    "/cgu": { title: `Conditions d’utilisation · ${SITE_NAME}`, description: "Consultez les conditions d’utilisation d’AfroMuse AI.", canonicalPath: "/cgu", ...base },
    "/confidentialite": { title: `Politique de confidentialité · ${SITE_NAME}`, description: "Découvrez comment AfroMuse AI traite les données nécessaires au fonctionnement du service.", canonicalPath: "/confidentialite", ...base },
    "/mentions-legales": { title: `Mentions légales · ${SITE_NAME}`, description: "Informations d’édition, de contact et de responsabilité pour AfroMuse AI.", canonicalPath: "/mentions-legales", ...base },
    "/politique-cookies": { title: `Politique cookies · ${SITE_NAME}`, description: "Comprendre l’usage des cookies et technologies similaires par AfroMuse AI.", canonicalPath: "/politique-cookies", ...base },
    "/politique-contenu-ia": { title: `Politique de contenu IA · ${SITE_NAME}`, description: "Règles de création, contenus interdits et usages responsables d’AfroMuse AI.", canonicalPath: "/politique-contenu-ia", ...base },
    "/styles": { title: `Styles musicaux africains et IA · ${SITE_NAME}`, description: "Explorez des styles musicaux africains et apprenez à les décrire dans un prompt de musique IA.", canonicalPath: "/styles", ...base },
    "/ambiances": { title: `Ambiances musicales pour l’IA · ${SITE_NAME}`, description: "Choisissez l’énergie de votre création musicale IA : solaire, festive et plus encore.", canonicalPath: "/ambiances", ...base },
    "/guides": { title: `Guides de création musicale IA · ${SITE_NAME}`, description: "Des guides pratiques pour composer des univers musicaux originaux avec AfroMuse AI.", canonicalPath: "/guides", ...base },
    "/cas-usages": { title: `Cas d’usage de musique IA · ${SITE_NAME}`, description: "Découvrez des façons responsables d’utiliser une création musicale IA pour vos projets.", canonicalPath: "/cas-usages", ...base },
  };
  if (staticPages[path]) return staticPages[path];
  const match = path.match(/^\/(styles|ambiances|guides|cas-usages)\/([^/]+)$/);
  if (!match) return { title: `Page introuvable · ${SITE_NAME}`, description: DEFAULT_DESCRIPTION, notFound: true };
  const kindMap: Record<string, ContentKind> = { styles: "style", ambiances: "mood", guides: "guide", "cas-usages": "useCase" };
  const entry = getContent(kindMap[match[1]], match[2]);
  if (!entry) return { title: `Page introuvable · ${SITE_NAME}`, description: DEFAULT_DESCRIPTION, notFound: true };
  return { title: `${entry.title} · ${SITE_NAME}`, description: entry.description, canonicalPath: path, ogImage: HERO_IMAGE, ogType: entry.kind === "guide" ? "article" : "website" };
}
