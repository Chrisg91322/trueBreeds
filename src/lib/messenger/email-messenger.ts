import "server-only";
import { Resend } from "resend";
import type { Messenger, OutboundMessage } from "./messenger";

export class ResendMessenger implements Messenger {
  private client: Resend | null;

  constructor(apiKey = process.env.RESEND_API_KEY) {
    this.client = apiKey ? new Resend(apiKey) : null;
  }

  async send(message: OutboundMessage) {
    if (!this.client) {
      console.warn(
        `[ResendMessenger] RESEND_API_KEY not set — skipping send to ${message.to}: "${message.subject}"`
      );
      return { skipped: true as const, reason: "RESEND_API_KEY not configured" };
    }

    const from = process.env.EMAIL_FROM || "TrueBreeds <notifications@mail.truebreeds.com>";
    const html = message.unsubscribeCategory
      ? `${message.html}${UNSUBSCRIBE_FOOTER}`
      : message.html;

    const { data, error } = await this.client.emails.send({
      from: message.fromName ? `${message.fromName} <${extractEmail(from)}>` : from,
      to: message.to,
      subject: message.subject,
      html,
      text: message.text,
      replyTo: message.replyTo,
    });

    if (error) {
      console.error("[ResendMessenger] send failed", error);
      throw new Error(`Failed to send email: ${error.message}`);
    }

    return { id: data!.id };
  }
}

function extractEmail(fromHeader: string) {
  const match = fromHeader.match(/<([^>]+)>/);
  return match ? match[1] : fromHeader;
}

const UNSUBSCRIBE_FOOTER = `
  <hr style="margin-top:24px;border:none;border-top:1px solid #e5e5e5" />
  <p style="font-size:12px;color:#888;margin-top:12px">
    You're receiving this because you contacted a breeder on TrueBreeds.
    <a href="{{unsubscribe_url}}" style="color:#888">Unsubscribe from these notifications</a>.
  </p>
`;
