import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { useState } from "react";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const submit = trpc.contact.submit.useMutation({ onSuccess: () => setForm({ name: "", email: "", message: "" }) });
  return <main className="min-h-screen bg-[#09090b] text-white"><header className="container py-7"><Link href="/" className="font-semibold">← AfroMuse <span className="text-amber-300">AI</span></Link></header><section className="container max-w-2xl py-16"><p className="text-sm font-semibold uppercase tracking-[.16em] text-amber-300">Contact</p><h1 className="mt-4 font-serif text-5xl tracking-[-.05em]">Parlons de votre prochain mouvement.</h1><p className="mt-5 text-zinc-400">Une question sur la création, les crédits ou le partenariat ? Notre équipe vous répondra par email.</p>{submit.isSuccess ? <div className="mt-9 rounded-2xl border border-emerald-300/20 bg-emerald-300/10 p-5 text-emerald-100">Message reçu. Nous revenons vers vous rapidement.</div> : <form onSubmit={event => { event.preventDefault(); submit.mutate(form); }} className="mt-10 grid gap-5 rounded-3xl border border-white/10 bg-white/[.025] p-6"><div><Label htmlFor="contact-name">Nom</Label><Input id="contact-name" required value={form.name} onChange={event => setForm({ ...form, name: event.target.value })} className="mt-2 h-12 rounded-xl border-white/10 bg-zinc-950" /></div><div><Label htmlFor="contact-email">Email</Label><Input id="contact-email" required type="email" value={form.email} onChange={event => setForm({ ...form, email: event.target.value })} className="mt-2 h-12 rounded-xl border-white/10 bg-zinc-950" /></div><div><Label htmlFor="contact-message">Message</Label><Textarea id="contact-message" required minLength={20} value={form.message} onChange={event => setForm({ ...form, message: event.target.value })} className="mt-2 min-h-36 rounded-xl border-white/10 bg-zinc-950" /></div>{submit.error && <p className="text-sm text-red-300">{submit.error.message}</p>}<Button disabled={submit.isPending} className="w-fit rounded-full bg-amber-300 text-zinc-950 hover:bg-amber-200">{submit.isPending ? "Envoi…" : "Envoyer le message"}</Button></form>}</section></main>;
}
