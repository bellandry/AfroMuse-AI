import { Resend } from "resend";

type EmailPayload = {
  to: string;
  subject: string;
  html: string;
};

export async function sendAuthEmail(payload: EmailPayload) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;

  if (!apiKey || !from) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("Le service email n’est pas configuré.");
    }

    console.info("[Email preview]", { to: payload.to, subject: payload.subject });
    return { delivered: false, preview: true } as const;
  }

  const resend = new Resend(apiKey);
  const response = await resend.emails.send({
    from,
    to: payload.to,
    subject: payload.subject,
    html: payload.html,
  });

  if (response.error) {
    throw new Error(response.error.message);
  }

  return { delivered: true, id: response.data?.id } as const;
}

export async function sendContactEmail(input: { name: string; email: string; message: string }) {
  const inbox = process.env.CONTACT_INBOX_EMAIL || process.env.RESEND_FROM_EMAIL;
  if (!inbox) {
    console.info("[Contact preview]", { from: input.email, name: input.name });
    return { delivered: false, preview: true } as const;
  }
  return sendAuthEmail({
    to: inbox,
    subject: `[AfroMuse] Nouveau message de ${input.name}`,
    html: `<p><strong>Nom :</strong> ${input.name}</p><p><strong>Email :</strong> ${input.email}</p><p>${input.message.replace(/\n/g, "<br />")}</p>`,
  });
}
