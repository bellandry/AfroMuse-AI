import { ContentDetail, ContentHub } from "@/pages/Content";
import Contact from "@/pages/Contact";
import Home from "@/pages/Home";
import Legal from "@/pages/Legal";
import { SeoStructuredData } from "@/components/SeoStructuredData";
import Trust from "@/pages/Trust";
import { getContent } from "@shared/seo-content";
import { Route, Switch } from "wouter";

function Detail({ kind, slug }: { kind: "style" | "mood" | "guide" | "useCase"; slug?: string }) { const entry = slug ? getContent(kind, slug) : undefined; return entry ? <ContentDetail entry={entry} /> : <PublicNotFound />; }
function PublicNotFound() { return <main className="grid min-h-screen place-items-center bg-[#09090b] px-6 text-center text-white"><div><p className="text-sm font-semibold uppercase tracking-[.18em] text-amber-300">404</p><h1 className="mt-4 font-serif text-5xl">Cette page n’existe pas.</h1></div></main>; }

export default function PublicApp() { return <><SeoStructuredData /><Switch><Route path="/" component={Home} /><Route path="/contact" component={Contact} /><Route path="/cgu">{() => <Legal type="cgu" />}</Route><Route path="/confidentialite">{() => <Legal type="confidentialite" />}</Route><Route path="/mentions-legales">{() => <Trust type="mentions" />}</Route><Route path="/politique-cookies">{() => <Trust type="cookies" />}</Route><Route path="/politique-contenu-ia">{() => <Trust type="ai" />}</Route><Route path="/styles">{() => <ContentHub kind="style" />}</Route><Route path="/ambiances">{() => <ContentHub kind="mood" />}</Route><Route path="/guides">{() => <ContentHub kind="guide" />}</Route><Route path="/cas-usages">{() => <ContentHub kind="useCase" />}</Route><Route path="/styles/:slug">{({ slug }) => <Detail kind="style" slug={slug} />}</Route><Route path="/ambiances/:slug">{({ slug }) => <Detail kind="mood" slug={slug} />}</Route><Route path="/guides/:slug">{({ slug }) => <Detail kind="guide" slug={slug} />}</Route><Route path="/cas-usages/:slug">{({ slug }) => <Detail kind="useCase" slug={slug} />}</Route><Route component={PublicNotFound} /></Switch></>; }
