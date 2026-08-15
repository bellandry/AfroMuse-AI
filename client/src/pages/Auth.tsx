import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AudioLines, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";

export default function Auth() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function signInWithGoogle() {
    setLoading(true); setError(null);
    const { error } = await authClient.signIn.social({ provider: "google", callbackURL: "/app" });
    if (error) { setError(error.message ?? "La connexion Google est momentanément indisponible."); setLoading(false); }
  }
  async function sendMagicLink(event: React.FormEvent) {
    event.preventDefault(); setLoading(true); setError(null);
    const { error } = await authClient.signIn.magicLink({ email, callbackURL: "/app" });
    if (error) setError(error.message ?? "L’envoi du lien sécurisé a échoué."); else setSent(true);
    setLoading(false);
  }

  return <div className="grid min-h-screen bg-[#09090b] text-white lg:grid-cols-[0.9fr_1.1fr]"><aside className="relative hidden overflow-hidden border-r border-white/10 p-12 lg:flex lg:flex-col"><div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_25%,rgba(251,191,36,.22),transparent_28%),radial-gradient(circle_at_75%_70%,rgba(124,58,237,.25),transparent_30%)]" /><Link href="/" className="relative flex items-center gap-2 text-lg font-semibold"><span className="grid h-8 w-8 place-items-center rounded-xl bg-amber-300 text-zinc-950"><AudioLines className="h-4 w-4" /></span>AfroMuse<span className="text-amber-300">AI</span></Link><div className="relative my-auto max-w-md"><p className="text-sm font-semibold uppercase tracking-[.18em] text-amber-300">Votre atelier sonore</p><h1 className="mt-5 font-serif text-5xl leading-[.95] tracking-[-.045em]">Composez sans limites. <span className="text-zinc-400">Partagez sans friction.</span></h1><p className="mt-7 leading-relaxed text-zinc-400">Un espace unique pour imaginer, générer et conserver vos musiques, avec votre conversation WhatsApp comme raccourci.</p></div><p className="relative text-sm text-zinc-500">Une connexion sécurisée, un numéro WhatsApp lié à la fois.</p></aside><main className="flex items-center justify-center p-5 sm:p-10"><div className="w-full max-w-md"><Link href="/" className="mb-12 flex items-center gap-2 text-lg font-semibold lg:hidden"><span className="grid h-8 w-8 place-items-center rounded-xl bg-amber-300 text-zinc-950"><AudioLines className="h-4 w-4" /></span>AfroMuse<span className="text-amber-300">AI</span></Link><p className="text-sm font-semibold uppercase tracking-[.18em] text-amber-300">Bienvenue</p><h2 className="mt-4 font-serif text-4xl tracking-[-.04em]">Entrez dans votre studio.</h2><p className="mt-3 text-zinc-400">Recevez un lien sécurisé par email ou connectez-vous avec Google.</p>{sent ? <div className="mt-9 rounded-2xl border border-emerald-300/20 bg-emerald-300/10 p-5"><ShieldCheck className="h-5 w-5 text-emerald-300" /><p className="mt-3 font-medium">Vérifiez votre boîte de réception.</p><p className="mt-1 text-sm leading-relaxed text-zinc-400">Nous avons envoyé un lien de connexion à {email}.</p></div> : <><Button onClick={signInWithGoogle} disabled={loading} variant="outline" className="mt-9 h-12 w-full rounded-xl border-white/15 bg-white/[.03] text-white hover:bg-white/10 hover:text-white">Continuer avec Google</Button><div className="my-7 flex items-center gap-4 text-xs text-zinc-600"><span className="h-px flex-1 bg-white/10" />ou<span className="h-px flex-1 bg-white/10" /></div><form onSubmit={sendMagicLink} className="space-y-3"><Label htmlFor="email">Adresse email</Label><Input id="email" required type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="vous@exemple.com" className="h-12 rounded-xl border-white/15 bg-white/[.03] text-white placeholder:text-zinc-600"/><Button disabled={loading} className="h-12 w-full rounded-xl bg-amber-300 text-zinc-950 hover:bg-amber-200">{loading?"Envoi en cours…":"M’envoyer un lien sécurisé"}</Button></form></>}{error && <p className="mt-4 text-sm text-red-300">{error}</p>}<p className="mt-8 text-xs leading-relaxed text-zinc-500">En continuant, vous acceptez nos <Link href="/cgu" className="text-zinc-300 underline">conditions d’utilisation</Link> et notre <Link href="/confidentialite" className="text-zinc-300 underline">politique de confidentialité</Link>.</p></div></main></div>;
}
