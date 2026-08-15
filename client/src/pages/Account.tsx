import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { useState } from "react";

export default function Account() {
  const { user } = useAuth(); const [phoneNumber, setPhoneNumber] = useState(""); const [code, setCode] = useState(""); const [pending, setPending] = useState(false);
  const request = trpc.whatsapp.updatePhone.useMutation({ onSuccess: () => setPending(true) });
  const verify = trpc.whatsapp.verifyOtp.useMutation({ onSuccess: () => { setPending(false); setCode(""); } });
  return <DashboardLayout><div className="mx-auto max-w-2xl"><p className="text-sm font-semibold uppercase tracking-[.16em] text-amber-300">Compte</p><h1 className="mt-3 font-serif text-4xl tracking-[-.04em]">Votre identité, sous contrôle.</h1><div className="mt-10 rounded-3xl border border-white/10 bg-white/[.025] p-6 sm:p-8"><p className="font-medium">{user?.name || "Votre compte AfroMuse"}</p><p className="mt-1 text-sm text-zinc-500">{user?.email}</p><div className="mt-8 border-t border-white/10 pt-7"><Label htmlFor="phone">Numéro WhatsApp</Label><p className="mt-2 text-sm leading-relaxed text-zinc-500">Un seul numéro est lié à votre compte. Pour le remplacer, nous envoyons un code sur votre adresse email.</p><Input id="phone" type="tel" value={phoneNumber} onChange={event => setPhoneNumber(event.target.value)} placeholder="Ex. +225 01 02 03 04 05" className="mt-4 h-12 rounded-xl border-white/10 bg-zinc-950" />{!pending ? <Button disabled={request.isPending || phoneNumber.length < 8} onClick={() => request.mutate({ phoneNumber })} className="mt-4 rounded-full bg-amber-300 text-zinc-950 hover:bg-amber-200">Envoyer le code</Button> : <div className="mt-5 rounded-2xl border border-amber-300/20 bg-amber-300/10 p-4"><Label htmlFor="otp">Code reçu par email</Label><div className="mt-2 flex gap-3"><Input id="otp" inputMode="numeric" maxLength={6} value={code} onChange={event => setCode(event.target.value)} className="h-11 rounded-xl border-white/10 bg-zinc-950" /><Button disabled={verify.isPending || code.length !== 6} onClick={() => verify.mutate({ phoneNumber, code })} className="shrink-0 rounded-full bg-amber-300 text-zinc-950 hover:bg-amber-200">Vérifier</Button></div></div>}{(request.error || verify.error) && <p className="mt-4 text-sm text-red-300">{request.error?.message || verify.error?.message}</p>}</div></div></div></DashboardLayout>;
}
