import { eq } from "drizzle-orm";
import { authUsers, whatsappIdentities } from "../drizzle/schema";
import { db, listGenerationsForUser } from "./db";
import { OpenWAProvider } from "./providers/openwa";
import { getCreditBalance } from "./services/credits";
import { createPaymentOrder } from "./services/payments";
import { requestWhatsappOtp } from "./services/whatsapp-otp";

type IncomingWhatsApp = { from: string; body: string };
const bot = new OpenWAProvider();

function help() { return "AfroMuse AI — choisissez une commande :\n• créer afrobeats | votre idée\n• statut\n• bibliothèque\n• crédits\n• acheter\n• aide"; }

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
  if (command === "créer" || command === "creer") return bot.sendText({ recipient: message.from, text: "Dites-moi le style et votre idée, par exemple : créer amapiano | piano électrique, groove nocturne et énergie solaire." });
  return bot.sendText({ recipient: message.from, text: help() });
}
