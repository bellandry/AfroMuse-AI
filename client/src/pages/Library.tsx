import DashboardLayout from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { CheckCircle2, Download, Loader2, Music2, RefreshCw, TriangleAlert } from "lucide-react";
import { Link } from "wouter";

const statusCopy = {
  queued: { label: "En attente", className: "border-amber-300/20 bg-amber-300/10 text-amber-200", icon: Loader2, detail: "Votre création est dans la file et sera traitée automatiquement." },
  processing: { label: "En cours", className: "border-violet-300/20 bg-violet-300/10 text-violet-100", icon: Loader2, detail: "Votre morceau est en cours de composition." },
  completed: { label: "Prête", className: "border-emerald-300/20 bg-emerald-300/10 text-emerald-100", icon: CheckCircle2, detail: "Votre audio est disponible à l’écoute et au téléchargement." },
  failed: { label: "À vérifier", className: "border-red-300/20 bg-red-300/10 text-red-100", icon: TriangleAlert, detail: "La génération n’a pas abouti. Les crédits réservés sont libérés lorsque les tentatives sont épuisées." },
  cancelled: { label: "Annulée", className: "border-white/10 bg-white/[.05] text-zinc-300", icon: TriangleAlert, detail: "Cette création a été annulée." },
} as const;

function formatDuration(seconds: number | null | undefined) {
  if (!seconds) return "Durée à confirmer";
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return minutes ? `${minutes} min ${remainingSeconds.toString().padStart(2, "0")} s` : `${seconds} s`;
}

function formatFileSize(sizeBytes: number | null | undefined) {
  if (!sizeBytes) return null;
  return sizeBytes >= 1_000_000 ? `${(sizeBytes / 1_000_000).toFixed(1)} Mo` : `${Math.ceil(sizeBytes / 1_000)} Ko`;
}

function lyricsLabel(lyricsMode: "none" | "generate" | "custom") {
  if (lyricsMode === "generate") return "Paroles assistées";
  if (lyricsMode === "custom") return "Paroles personnalisées";
  return "Sans paroles";
}

function variantLabel(variant: string) {
  return ({ master: "Mix principal", instrumental: "Instrumental", vocals: "Voix isolée", stem: "Stem", alternate: "Version alternative" } as Record<string, string>)[variant] ?? variant;
}

export default function Library() {
  const { data, isLoading, isFetching, refetch } = trpc.dashboard.library.useQuery(undefined, { refetchInterval: query => query.state.data?.some(item => item.status === "queued" || item.status === "processing") ? 8_000 : false, refetchOnWindowFocus: true });

  return <DashboardLayout><div className="mx-auto max-w-5xl"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-semibold uppercase tracking-[.16em] text-amber-300">Bibliothèque</p><h1 className="mt-3 font-serif text-4xl tracking-[-.04em]">Vos morceaux, à votre rythme.</h1><p className="mt-2 text-sm text-zinc-500">Les créations en attente s’actualisent automatiquement toutes les huit secondes.</p></div><div className="flex gap-3"><Button type="button" variant="outline" onClick={() => refetch()} disabled={isFetching} className="rounded-full border-white/15 bg-transparent text-white hover:bg-white/10 hover:text-white"><RefreshCw className={`mr-2 h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />Actualiser</Button><Link href="/creer"><Button className="shrink-0 rounded-full bg-amber-300 text-zinc-950 hover:bg-amber-200">Créer un morceau</Button></Link></div></div><div className="mt-10 grid gap-4 sm:grid-cols-2">{isLoading ? <p className="text-zinc-500">Chargement de vos créations…</p> : data?.length ? data.map(g => { const status = statusCopy[g.status as keyof typeof statusCopy] || statusCopy.queued; const StatusIcon = status.icon; const fileSize = formatFileSize(g.audio?.sizeBytes); return <article className="rounded-3xl border border-white/10 bg-white/[.025] p-5" key={g.id}><div className="flex justify-between gap-4"><span className="grid h-11 w-11 place-items-center rounded-xl bg-violet-500/15 text-violet-200"><Music2 className="h-5 w-5" /></span><Badge className={`h-fit ${status.className}`}><StatusIcon className={`mr-1.5 h-3.5 w-3.5 ${g.status === "queued" || g.status === "processing" ? "animate-spin" : ""}`} />{status.label}</Badge></div><h2 className="mt-7 font-medium">{g.title}</h2><p className="mt-1 text-sm capitalize text-zinc-500">{g.style} · {g.mood} · {g.mode === "vocal" ? "Voix" : "Instrumental"}</p><div className="mt-3 flex flex-wrap gap-2 text-xs"><span className="rounded-full border border-white/10 px-2.5 py-1 text-zinc-300">{lyricsLabel(g.lyricsMode)}</span><span className="rounded-full border border-white/10 px-2.5 py-1 text-zinc-300">{g.status === "completed" && g.effectiveDurationSeconds ? `Durée effective : ${formatDuration(g.effectiveDurationSeconds)}` : `Prévue : ${formatDuration(g.durationSeconds)}`}</span>{g.mode === "vocal" && <span className="rounded-full border border-white/10 px-2.5 py-1 text-zinc-300">{g.vocalLanguage === "auto" ? "Langue selon l’intention" : g.vocalLanguage.toUpperCase()}</span>}</div>{g.status === "completed" && g.audioUrl ? <><audio className="mt-5 w-full" controls preload="metadata" src={g.audioUrl}>Votre navigateur ne peut pas lire cet audio.</audio><p className="mt-3 text-xs text-zinc-500">{[g.audio?.format?.toUpperCase(), fileSize].filter(Boolean).join(" · ") || "Audio disponible"}</p><div className="mt-3 flex flex-wrap gap-2">{g.audioVariants.map(asset => <a href={asset.publicUrl} download={asset.filename ?? `${g.title}-${asset.variant}.${asset.format}`} key={asset.id}><Button size="sm" variant="outline" className="rounded-full border-white/10 bg-transparent text-white hover:bg-white/10 hover:text-white"><Download className="mr-2 h-3.5 w-3.5" />{variantLabel(asset.variant)}</Button></a>)}</div></> : <p className="mt-5 text-xs leading-relaxed text-zinc-400">{status.detail}</p>}{g.mode === "vocal" && g.lyrics && <details className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-3"><summary className="cursor-pointer text-sm font-medium text-amber-200">Voir les paroles</summary><p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-zinc-300">{g.lyrics}</p></details>}{g.lastError && g.status === "failed" && <p className="mt-3 rounded-xl bg-red-300/10 p-3 text-xs text-red-100">Dernier détail : {g.lastError}</p>}</article>; }) : <div className="col-span-full rounded-3xl border border-dashed border-white/15 p-12 text-center"><p className="font-medium">La première piste est toujours la plus belle à imaginer.</p><p className="mx-auto mt-2 max-w-md text-sm text-zinc-500">Créez votre premier morceau dans le studio : il apparaîtra ici avec son statut, ses variantes disponibles, son lecteur et ses téléchargements.</p><Link href="/creer"><Button className="mt-5 rounded-full bg-amber-300 text-zinc-950 hover:bg-amber-200">Ouvrir le studio</Button></Link></div>}</div></div></DashboardLayout>;
}
