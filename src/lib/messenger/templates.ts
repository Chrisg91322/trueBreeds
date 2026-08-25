type BrandedLayoutArgs = {
  kennelName: string;
  logoUrl?: string | null;
  accentColor?: string | null;
  bodyHtml: string;
};

/** Shared wrapper so every transactional email looks branded per-tenant. */
export function brandedLayout({ kennelName, logoUrl, accentColor, bodyHtml }: BrandedLayoutArgs) {
  const accent = accentColor || "#7C5C42";
  return `
  <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;max-width:560px;margin:0 auto;padding:32px 24px;color:#1f1f1f">
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:24px">
      ${logoUrl ? `<img src="${logoUrl}" width="36" height="36" style="border-radius:999px;object-fit:cover" />` : ""}
      <span style="font-size:18px;font-weight:700;color:${accent}">${kennelName}</span>
    </div>
    ${bodyHtml}
    <p style="margin-top:32px;font-size:12px;color:#999">Sent via TrueBreeds on behalf of ${kennelName}.</p>
  </div>`;
}

export function inquiryReceivedTemplate(args: {
  kennelName: string;
  logoUrl?: string | null;
  accentColor?: string | null;
  leadName: string;
  leadEmail?: string | null;
  leadPhone?: string | null;
  message?: string | null;
}) {
  return brandedLayout({
    ...args,
    bodyHtml: `
      <h2 style="margin:0 0 12px">New inquiry from ${args.leadName}</h2>
      ${args.leadEmail ? `<p style="margin:4px 0"><strong>Email:</strong> ${args.leadEmail}</p>` : ""}
      ${args.leadPhone ? `<p style="margin:4px 0"><strong>Phone:</strong> ${args.leadPhone}</p>` : ""}
      ${args.message ? `<p style="margin:16px 0;white-space:pre-line">${args.message}</p>` : ""}
      <p style="margin-top:16px;color:#555">Reply directly to this email or call/text them — this lead is now in your dashboard CRM.</p>
    `,
  });
}

export function inquiryAcknowledgmentTemplate(args: {
  kennelName: string;
  logoUrl?: string | null;
  accentColor?: string | null;
  leadName: string;
}) {
  return brandedLayout({
    ...args,
    bodyHtml: `
      <h2 style="margin:0 0 12px">Thanks for reaching out, ${args.leadName}!</h2>
      <p>We received your message and ${args.kennelName} will be in touch soon.</p>
    `,
  });
}

export function depositConfirmationBuyerTemplate(args: {
  kennelName: string;
  logoUrl?: string | null;
  accentColor?: string | null;
  buyerName: string;
  offspringName: string;
  amount: number;
  depositPolicy?: string | null;
}) {
  return brandedLayout({
    ...args,
    bodyHtml: `
      <h2 style="margin:0 0 12px">Deposit received — welcome to the family, ${args.buyerName}!</h2>
      <p>Your deposit of <strong>$${args.amount.toLocaleString()}</strong> for <strong>${args.offspringName}</strong> has been received.</p>
      ${args.depositPolicy ? `<p style="margin-top:16px;padding:12px 16px;background:#f6f6f6;border-radius:8px;font-size:14px">${args.depositPolicy}</p>` : ""}
      <p style="margin-top:16px">A receipt from Stripe is on its way separately. ${args.kennelName} will follow up with next steps.</p>
    `,
  });
}

export function depositConfirmationBreederTemplate(args: {
  kennelName: string;
  logoUrl?: string | null;
  accentColor?: string | null;
  buyerName: string;
  buyerEmail: string;
  offspringName: string;
  amount: number;
}) {
  return brandedLayout({
    ...args,
    bodyHtml: `
      <h2 style="margin:0 0 12px">💰 New deposit: ${args.offspringName}</h2>
      <p><strong>${args.buyerName}</strong> (${args.buyerEmail}) just paid a $${args.amount.toLocaleString()} deposit.</p>
      <p style="margin-top:16px">${args.offspringName} has been automatically moved to <strong>Deposit Received</strong> and a lead card was created in your CRM.</p>
    `,
  });
}

export function balanceDueReminderTemplate(args: {
  kennelName: string;
  logoUrl?: string | null;
  accentColor?: string | null;
  buyerName: string;
  offspringName: string;
  amount: number;
  dueDate?: string | null;
  invoiceUrl: string;
}) {
  return brandedLayout({
    ...args,
    bodyHtml: `
      <h2 style="margin:0 0 12px">Balance due for ${args.offspringName}</h2>
      <p>Hi ${args.buyerName}, your remaining balance of <strong>$${args.amount.toLocaleString()}</strong> is due${args.dueDate ? ` by ${args.dueDate}` : ""}.</p>
      <p style="margin-top:16px"><a href="${args.invoiceUrl}" style="display:inline-block;background:${args.accentColor || "#7C5C42"};color:white;padding:10px 20px;border-radius:999px;text-decoration:none">Pay Balance</a></p>
    `,
  });
}

export function teamInviteTemplate(args: {
  kennelName: string;
  logoUrl?: string | null;
  accentColor?: string | null;
  invitedByName: string;
  role: string;
  acceptUrl: string;
}) {
  return brandedLayout({
    ...args,
    bodyHtml: `
      <h2 style="margin:0 0 12px">You've been invited to ${args.kennelName}</h2>
      <p>${args.invitedByName} invited you to join their dashboard as <strong>${args.role}</strong>.</p>
      <p style="margin-top:16px"><a href="${args.acceptUrl}" style="display:inline-block;background:${args.accentColor || "#7C5C42"};color:white;padding:10px 20px;border-radius:999px;text-decoration:none">Accept invite</a></p>
      <p style="margin-top:16px;font-size:13px;color:#777">This invite expires in 7 days.</p>
    `,
  });
}

export function waitlistConfirmationTemplate(args: {
  kennelName: string;
  logoUrl?: string | null;
  accentColor?: string | null;
  name: string;
  breed?: string | null;
}) {
  return brandedLayout({
    ...args,
    bodyHtml: `
      <h2 style="margin:0 0 12px">You're on the waitlist!</h2>
      <p>Hi ${args.name}, you've been added to ${args.kennelName}'s waitlist${args.breed ? ` for ${args.breed}` : ""}. We'll reach out as soon as a spot opens up.</p>
    `,
  });
}
