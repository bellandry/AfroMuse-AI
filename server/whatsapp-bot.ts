import { eq } from "drizzle-orm";
import { authUsers, whatsappIdentities } from "../drizzle/schema";
import { db, listGenerationsForUser } from "./db";
import { OpenWAProvider } from "./providers/openwa";
import { getCreditBalance } from "./services/credits";
import { createGeneration } from "./services/generations";
import { createPaymentOrder } from "./services/payments";
import { requestWhatsappOtp } from "./services/whatsapp-otp";

type IncomingWhatsApp = { from: string; body: string };
type GenerationMode = "vocal" | "instrumental";
type GenerationStyle = "afrobeats" | "amapiano" | "coupe-decale" | "highlife" | "mbalax" | "rumba" | "gospel" | "afro-fusion";
type GenerationMood = "solaire" | "intense" | "romantique" | "spirituel" | "nostalgique" | "festif" | "cinématique";

const bot = new OpenWAProvider();
const STYLES: GenerationStyle[] = ["afrobeats", "amapiano", "coupe-decale", "highlife", "mbalax", "rumba", "gospel", "afro-fusion"];
const MOODS: GenerationMood[] = ["solaire", "intense", "romantique", "spirituel", "nostalgique", "festif", "cinématique"];
const DURATIONS = [30, 60, 120, 180] as const;

export type WhatsAppGenerationCommand = {
  mode: GenerationMode;
  durationSeconds: (typeof DURATIONS)[number];
  style: GenerationStyle;
  mood: GenerationMood;
  prompt: string;
  lyricsMode: "none" | "generate" | "custom";
};

function parseLyricsChoice(value: string): "generate" | "custom" | null {
  const normalized = value.trim().toLowerCase();
  if (["assistées", "assistees", "paroles assistées", "paroles assistees"].includes(normalized)) return "generate";
  if (["personnalisées", "personnalisees", "paroles personnalisées", "paroles personnalisees"].includes(normalized)) return "custom";
  return null;
}

export function parseWhatsAppGenerationCommand(body: string): WhatsAppGenerationCommand | null {
  const payload = body.trim().replace(/^cr[ée]er\s+/i, "");
  const [formatAndDuration = "", rawStyle = "", ...rawOptions] = payload.split("|").map(value => value.trim());
  const match = formatAndDuration.toLowerCase().match(/^(instrumental|chanson|vocal)\s+(30|60|120|180)$/);
  if (!match) return null;

  const mode: GenerationMode = match[1] === "instrumental" ? "instrumental" : "vocal";
  const durationSeconds = Number(match[2]) as WhatsAppGenerationCommand["durationSeconds"];
  const style = rawStyle.toLowerCase() as GenerationStyle;
  if (!STYLES.includes(style)) return null;

  const lyricsMode = mode === "vocal" ? parseLyricsChoice(rawOptions.shift() ?? "") : "none";
  if (!lyricsMode) return null;
  const rawMoodOrPrompt = rawOptions.shift() ?? "";
  const candidateMood = rawMoodOrPrompt.toLowerCase() as GenerationMood;
  const mood = MOODS.includes(candidateMood) ? candidateMood : "solaire";
  const prompt = (MOODS.includes(candidateMood) ? rawOptions : [rawMoodOrPrompt, ...rawOptions]).join(" | ").trim();
  if (prompt.length < 12 || !DURATIONS.includes(durationSeconds)) return null;

  return { mode, durationSeconds, style, mood, prompt, lyricsMode };
}

function studioUrl() {
  return `${process.env.BETTER_AUTH_URL || "https://afromuse.ai"}/creer`;
}

function help() { return "AfroMuse AI — choisissez une commande :\n• créer instrumental 60 | afrobeats | votre idée\n• créer chanson 120 | amapiano | paroles assistées | solaire | votre idée\n• créer vocal 180 | gospel | paroles personnalisées | spirituel | votre idée\nLes paroles personnalisées basculent vers le studio, où vous pouvez écrire, coller et structurer votre texte.\n• statut\n• bibliothèque\n• crédits\n• acheter\n• aide"; }

export async function handleWhatsAppMessage(message: IncomingWhatsApp) {
  const body = message.body.trim();
  const command = body.toLowerCase();
  const [identity] = await db.select().from(whatsappIdentities).where(eq(whatsappIdentities.phoneNumber, message.from)).limit(1);
  if (!identity) {
    if (command.startsWith("email ")) {
      const result = await requestWhatsappOtp(message.from, body.slice(6).trim());
      return bot.sendText({ recipient: message.from, text: result.delivered ? "Un code à 6 chiffres vient d’être envoyé à votre adresse email. Répondez : code 123456" : "Aucun compte AfroMuse ne correspond à cette adresse. Créez d’abord votre compte sur le web." });
    }
    return bot.sendText({ recipient: message.from, text: "Bienvenue sur AfroMuse AI. Pour lier votre compte, répondez : email votre@adresse.com" });
  }
  const [user] = await db.select().from(authUsers).where(eq(authUsers.id, identity.userId)).limit(1);
  if (!user) return bot.sendText({ recipient: message.from, text: "Votre compte n’est pas disponible. Réessayez dans quelques instants." });
  if (command === "aide" || command === "help") return bot.sendText({ recipient: message.from, text: help() });
  if (command === "crédits" || command === "credits") { const wallet = await getCreditBalance(user.id); return bot.sendText({ recipient: message.from, text: `Votre solde : ${wallet.balance} crédits. Répondez « acheter » pour recevoir un lien de paiement.` }); }
  if (command === "statut" || command === "bibliothèque" || command === "bibliotheque") { const generations = await listGenerationsForUser(user.id); const latest = generations.slice(0, 3); return bot.sendText({ recipient: message.from, text: latest.length ? latest.map(g => `• ${g.title} — ${g.status}`).join("\n") : "Votre bibliothèque est vide. Écrivez « créer afrobeats | votre idée » pour commencer." }); }
  if (command === "acheter") { const order = await createPaymentOrder({ userId: user.id, email: user.email, planCode: "creator", provider: "chariow", callbackUrl: `${process.env.BETTER_AUTH_URL || "https://afromuse.ai"}/credits?payment=returned` }); return bot.sendText({ recipient: message.from, text: `Voici votre lien unique Chariow pour le pack Créateur (75 crédits). Toute personne peut payer, vos crédits seront ajoutés à votre compte : ${order.checkoutUrl}` }); }
  if (command === "chanson web" || command === "paroles" || command === "paroles personnalisées" || command === "paroles personnalisees") return bot.sendText({ recipient: message.from, text: `Pour une chanson avec paroles personnalisées, ouvrez le studio AfroMuse : ${studioUrl()}. Vous pourrez choisir voix, durée 2 ou 3 minutes, langue, structure et coller vos paroles.` });
  if (command === "créer" || command === "creer") return bot.sendText({ recipient: message.from, text: "Précisez le format : « créer instrumental 60 | afrobeats | votre idée » ou « créer chanson 120 | amapiano | paroles assistées | solaire | votre idée ». Choisissez « paroles personnalisées » pour être dirigé vers le studio." });
  if (command.startsWith("créer ") || command.startsWith("creer ")) {
    const generation = parseWhatsAppGenerationCommand(body);
    if (!generation) return bot.sendText({ recipient: message.from, text: "Je n’ai pas reconnu ce format. Essayez : « créer chanson 120 | amapiano | paroles assistées | solaire | une célébration nocturne à Accra ». Pour vos propres paroles, choisissez « paroles personnalisées » ou écrivez « chanson web »." });
    if (generation.lyricsMode === "custom") return bot.sendText({ recipient: message.from, text: `Très bien : les paroles personnalisées se préparent dans le studio AfroMuse afin de pouvoir les écrire, les relire et choisir la structure. Ouvrez ${studioUrl()}.` });
    try {
      const queued = await createGeneration(user.id, {
        title: `${generation.mode === "vocal" ? "Chanson" : "Instrumental"} ${generation.style}`,
        prompt: generation.prompt,
        style: generation.style,
        mood: generation.mood,
        durationSeconds: generation.durationSeconds,
        mode: generation.mode,
        language: "fr",
        lyricsMode: generation.lyricsMode,
        vocalLanguage: "auto",
      });
      const formatLabel = generation.mode === "vocal" ? "chanson à paroles assistées" : "instrumental";
      return bot.sendText({ recipient: message.from, text: `Votre ${formatLabel} ${generation.style} de ${generation.durationSeconds} secondes est en file d’attente. ${queued.creditsReserved} crédits sont réservés. Écrivez « statut » pour suivre son avancement.` });
    } catch (error) {
      const detail = error instanceof Error ? error.message : "Impossible de lancer la génération pour le moment.";
      return bot.sendText({ recipient: message.from, text: `${detail} Écrivez « crédits » pour consulter votre solde ou « acheter » pour recevoir un lien de paiement.` });
    }
  }
  return bot.sendText({ recipient: message.from, text: help() });
}
