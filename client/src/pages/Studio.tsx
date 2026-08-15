import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { Loader2, Sparkles } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";

const modeButton = (active: boolean) => active
  ? "rounded-full border-amber-300 bg-amber-300 !text-zinc-950 hover:bg-amber-200"
  : "rounded-full border-white/15 bg-transparent !text-white hover:bg-white/10 hover:!text-white";

export default function Studio() {
  const [, setLocation] = useLocation();
  const [form, setForm] = useState({
    title: "", prompt: "", style: "afrobeats" as const, mood: "solaire" as const,
    durationSeconds: 60 as 30 | 60 | 120, mode: "instrumental" as "vocal" | "instrumental", language: "fr" as "fr" | "en",
  });
  const create = trpc.generations.create.useMutation({ onSuccess: () => setLocation("/bibliotheque") });

  return <DashboardLayout><div className="mx-auto max-w-4xl">
    <p className="text-sm font-semibold uppercase tracking-[.16em] text-amber-300">Studio de création</p>
    <h1 className="mt-3 font-serif text-4xl tracking-[-.04em]">Donnez un mouvement à votre idée.</h1>
    <p className="mt-2 max-w-2xl text-zinc-400">Décrivez l’énergie et le décor. AfroMuse réservera les crédits nécessaires avant la génération.</p>
    <form onSubmit={event => { event.preventDefault(); create.mutate(form); }} className="mt-10 grid gap-6 rounded-3xl border border-white/10 bg-white/[.025] p-6 sm:p-8">
      <div><Label htmlFor="title">Titre de travail</Label><Input id="title" required value={form.title} onChange={event => setForm({ ...form, title: event.target.value })} placeholder="Ex. Nuit chaude à Lomé" className="mt-2 h-12 rounded-xl border-white/10 bg-zinc-950" /></div>
      <div><Label htmlFor="prompt">Votre direction musicale</Label><Textarea id="prompt" required minLength={12} value={form.prompt} onChange={event => setForm({ ...form, prompt: event.target.value })} placeholder="Un groove solaire, percussions organiques, guitare highlife et basse profonde qui accompagne une promenade de nuit…" className="mt-2 min-h-32 rounded-xl border-white/10 bg-zinc-950" /><p className="mt-2 text-xs text-zinc-500">Évitez les noms d’artistes, les paroles ou les œuvres existantes.</p></div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div><Label>Style</Label><Select value={form.style} onValueChange={value => setForm({ ...form, style: value as typeof form.style })}><SelectTrigger className="mt-2 h-12 rounded-xl border-white/10 bg-zinc-950"><SelectValue /></SelectTrigger><SelectContent>{["afrobeats", "amapiano", "coupe-decale", "highlife", "mbalax", "rumba", "gospel", "afro-fusion"].map(value => <SelectItem value={value} key={value}>{value}</SelectItem>)}</SelectContent></Select></div>
        <div><Label>Humeur</Label><Select value={form.mood} onValueChange={value => setForm({ ...form, mood: value as typeof form.mood })}><SelectTrigger className="mt-2 h-12 rounded-xl border-white/10 bg-zinc-950"><SelectValue /></SelectTrigger><SelectContent>{["solaire", "intense", "romantique", "spirituel", "nostalgique", "festif", "cinématique"].map(value => <SelectItem value={value} key={value}>{value}</SelectItem>)}</SelectContent></Select></div>
        <div><Label>Durée</Label><Select value={String(form.durationSeconds)} onValueChange={value => setForm({ ...form, durationSeconds: Number(value) as 30 | 60 | 120 })}><SelectTrigger className="mt-2 h-12 rounded-xl border-white/10 bg-zinc-950"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="30">30 secondes</SelectItem><SelectItem value="60">60 secondes</SelectItem><SelectItem value="120">120 secondes</SelectItem></SelectContent></Select></div>
      </div>
      <div className="flex flex-wrap gap-3" aria-label="Format de la création"><Button type="button" aria-pressed={form.mode === "instrumental"} onClick={() => setForm({ ...form, mode: "instrumental" })} className={modeButton(form.mode === "instrumental")}>Instrumental</Button><Button type="button" aria-pressed={form.mode === "vocal"} onClick={() => setForm({ ...form, mode: "vocal" })} className={modeButton(form.mode === "vocal")}>Avec voix</Button></div>
      {create.error && <p className="text-sm text-red-300">{create.error.message}</p>}
      <div className="flex items-center justify-between gap-5 border-t border-white/10 pt-6"><p className="max-w-xs text-sm text-zinc-500">Le coût exact est estimé selon la durée et le format.</p><Button disabled={create.isPending} className="shrink-0 rounded-full bg-amber-300 text-zinc-950 hover:bg-amber-200">{create.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Réservation…</> : <><Sparkles className="mr-2 h-4 w-4" />Lancer la création</>}</Button></div>
    </form>
  </div></DashboardLayout>;
}
