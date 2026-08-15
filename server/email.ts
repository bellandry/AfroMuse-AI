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
