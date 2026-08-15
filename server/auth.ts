import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { betterAuth } from "better-auth";
import { magicLink } from "better-auth/plugins";
import * as schema from "../drizzle/schema";
import { db } from "./db";
import { sendAuthEmail } from "./email";

const baseURL = process.env.BETTER_AUTH_URL || "http://localhost:3000";

export const auth = betterAuth({
  baseURL,
  secret: process.env.BETTER_AUTH_SECRET,
  database: drizzleAdapter(db, {
    provider: "mysql",
    schema: {
      user: schema.authUsers,
      session: schema.sessions,
      account: schema.accounts,
      verification: schema.verifications,
    },
  }),
  user: {
    modelName: "authUsers",
    additionalFields: {
      role: {
        type: ["user", "admin"],
        required: false,
        defaultValue: "user",
        input: false,
      },
      phoneNumber: {
        type: "string",
        required: false,
        input: false,
      },
      locale: {
        type: "string",
        required: false,
        defaultValue: "fr",
      },
    },
  },
  session: {
    modelName: "sessions",
  },
  account: {
    modelName: "accounts",
  },
  verification: {
    modelName: "verifications",
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    revokeSessionsOnPasswordReset: true,
    sendResetPassword: async ({ user, url }) => {
      await sendAuthEmail({
        to: user.email,
        subject: "Réinitialisez votre mot de passe AfroMuse AI",
        html: `<p>Utilisez ce lien sécurisé pour réinitialiser votre mot de passe :</p><p><a href="${url}">Réinitialiser mon mot de passe</a></p>`,
      });
    },
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      await sendAuthEmail({
        to: user.email,
        subject: "Confirmez votre adresse email AfroMuse AI",
        html: `<p>Bienvenue sur AfroMuse AI. Confirmez votre adresse email :</p><p><a href="${url}">Confirmer mon adresse</a></p>`,
      });
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "google-client-id-not-configured",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "google-client-secret-not-configured",
      prompt: "select_account",
    },
  },
  plugins: [
    magicLink({
      expiresIn: 10 * 60,
      storeToken: "hashed",
      sendMagicLink: async ({ email, url }) => {
        await sendAuthEmail({
          to: email,
          subject: "Votre lien de connexion AfroMuse AI",
          html: `<p>Utilisez ce lien sécurisé pour vous connecter à AfroMuse AI :</p><p><a href="${url}">Ouvrir ma session</a></p><p>Ce lien expire dans 10 minutes.</p>`,
        });
      },
    }),
  ],
  trustedOrigins: [baseURL],
});
