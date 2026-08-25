/**
 * `Messenger` is the single interface all platform-sent transactional email
 * goes through. Per spec §5, v1 ships an email-only implementation; SMS and
 * breeder-composed campaigns can be added later as a new `Messenger`
 * implementation (e.g. `TwilioMessenger`) without touching call sites.
 */
export type OutboundMessage = {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
  /** Shown as the "From" display name, e.g. "Blue Moon Labradors via TrueBreeds" */
  fromName?: string;
  /** Include an unsubscribe footer + honor opt-outs (buyer-facing lists only). */
  unsubscribeCategory?: "buyer_notifications" | null;
};

export interface Messenger {
  send(message: OutboundMessage): Promise<{ id: string } | { skipped: true; reason: string }>;
}
