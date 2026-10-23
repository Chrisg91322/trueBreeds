/**
 * Platform Terms of Service & Privacy Policy for TrueBreeds.
 * Values below match the live product (billing, Connect, Klarna, auth, hosting).
 * This is not legal advice — have counsel review before treating it as final.
 */

const config = {
  companyName: "TrueBreeds",
  productName: "TrueBreeds",
  website: "www.truebreeds.com",
  pricingUrl: "https://www.truebreeds.com/start",
  address: "United States (mailing address available on request at support@truebreeds.com)",
  jurisdiction: "the State of Delaware, United States",
  supportEmail: "support@truebreeds.com",
  privacyEmail: "support@truebreeds.com",
  lastUpdated: "September 16, 2026",
  effectiveDate: "September 16, 2026",
  priceChangeNoticeDays: "30",
  termsChangeNoticeDays: "14",
  liabilityMonths: "12",
  dataDeletionDays: "30",
  accountDeletionDays: "30",
  billingRecordYears: "7",
  backupCycleDays: "30",
  uptimeTarget: "on a commercially reasonable basis, with a target of high availability",
  supportChannels: "email",
  supportHours: "business hours, U.S. Eastern Time, Monday–Friday",
  exportMethod: "a request to support@truebreeds.com (account and kennel data export by request)",
  refundPolicy:
    "The one-time setup fee is non-refundable once onboarding checkout is completed, except as required by law. Monthly membership fees are non-refundable for the current billing period; you may cancel at any time and retain access through the end of that period. We may issue goodwill or statutory refunds at our discretion.",
  disputeResolution:
    "in the state or federal courts located in Delaware, United States, unless mandatory consumer law requires otherwise",
  ssoProviders: "Google",
  hostingProvider: "Vercel and Supabase",
  emailProvider: "Resend",
  analyticsProvider: "Vercel Analytics and Google Analytics",
  supportProvider: "email (Resend for delivery)",
  analyticsTools: "Vercel Analytics and Google Analytics 4 (including optional GA4 on Premium kennel sites)",
  baseCountry: "the United States",
  transferCountries: "the United States and other countries where our service providers operate",
  dpoContact:
    "For privacy requests, email support@truebreeds.com. We have not appointed a separate EU or UK representative at this time.",
} as const;

const termsNav = [
  ["t-1", "Acceptance"],
  ["t-2", "Accounts"],
  ["t-3", "Subscriptions & billing"],
  ["t-4", "Payments via Stripe & Klarna"],
  ["t-5", "Refunds & cancellation"],
  ["t-6", "Acceptable use"],
  ["t-7", "Your content"],
  ["t-8", "Intellectual property"],
  ["t-9", "Availability & support"],
  ["t-10", "Disclaimers"],
  ["t-11", "Limitation of liability"],
  ["t-12", "Termination"],
  ["t-13", "Governing law"],
  ["t-14", "Changes"],
] as const;

const privacyNav = [
  ["p-1", "What we collect"],
  ["p-2", "How we use it"],
  ["p-3", "Payment data"],
  ["p-4", "Sharing"],
  ["p-5", "Cookies"],
  ["p-6", "Retention"],
  ["p-7", "Security"],
  ["p-8", "Your rights"],
  ["p-9", "International transfers"],
  ["p-10", "Children"],
  ["p-11", "Contact"],
] as const;

const usePurposes = [
  [
    "Provide the Service",
    "Creating accounts, hosting kennel sites, CRM, waitlists, deposits, and related features",
    "Performance of a contract",
  ],
  [
    "Billing and payments",
    "Processing setup fees and memberships; enabling Stripe Connect / Klarna for breeders",
    "Performance of a contract; legal obligation; legitimate interests",
  ],
  [
    "Support and communication",
    "Responding to requests, sending service and billing notices",
    "Performance of a contract; legitimate interests",
  ],
  [
    "Improve and secure the Service",
    "Analytics, debugging, abuse and fraud monitoring",
    "Legitimate interests",
  ],
  [
    "Marketing",
    "Product updates and newsletters (opt-out anytime)",
    "Consent; legitimate interests",
  ],
  [
    "Legal compliance",
    "Tax and accounting records; responding to lawful requests",
    "Legal obligation",
  ],
] as const;

const styles = `
  .legal {
    background: var(--background);
    color: var(--foreground);
    font-family: Georgia, "Times New Roman", serif;
    font-size: 1.0625rem;
    line-height: 1.65;
  }
  .legal *, .legal *::before, .legal *::after { box-sizing: border-box; }
  .legal a { color: var(--primary); }
  .legal .wrap { max-width: 1080px; margin: 0 auto; padding: 3rem 1.5rem 5rem; display: grid; grid-template-columns: 220px 1fr; gap: 3.5rem; }
  .legal nav { position: sticky; top: 2rem; align-self: start; font-family: system-ui, -apple-system, "Segoe UI", sans-serif; font-size: .9rem; }
  .legal nav h2 { font-size: .85rem; font-weight: 600; margin: 1.25rem 0 .5rem; color: var(--muted-foreground); }
  .legal nav h2:first-child { margin-top: 0; }
  .legal nav ol { list-style: none; margin: 0; padding: 0; border-left: 2px solid var(--border); }
  .legal nav li a { display: block; padding: .25rem 0 .25rem .85rem; color: var(--foreground); text-decoration: none; }
  .legal nav li a:hover, .legal nav li a:focus-visible { color: var(--primary); }
  .legal main { min-width: 0; max-width: 68ch; }
  .legal header { border-bottom: 1px solid var(--border); padding-bottom: 1.5rem; margin-bottom: 2.5rem; }
  .legal h1 { font-size: 2.25rem; line-height: 1.15; margin: 0 0 .5rem; font-weight: 400; color: var(--foreground); }
  .legal .meta { color: var(--muted-foreground); font-family: system-ui, -apple-system, "Segoe UI", sans-serif; font-size: .9rem; }
  .legal h2.doc { font-size: 1.75rem; font-weight: 400; margin: 4rem 0 1rem; padding-top: 2rem; border-top: 1px solid var(--border); color: var(--foreground); }
  .legal h2.doc.first { margin-top: 0; border-top: 0; padding-top: 0; }
  .legal h3 { font-size: 1.2rem; font-weight: 600; margin: 2.25rem 0 .6rem; font-family: system-ui, -apple-system, "Segoe UI", sans-serif; color: var(--foreground); }
  .legal p, .legal li { margin: 0 0 .9rem; color: var(--foreground); }
  .legal ul { padding-left: 1.3rem; }
  .legal table { border-collapse: collapse; width: 100%; font-family: system-ui, -apple-system, "Segoe UI", sans-serif; font-size: .92rem; margin: 0 0 1.5rem; }
  .legal th, .legal td { text-align: left; padding: .6rem .75rem; border-bottom: 1px solid var(--border); vertical-align: top; color: var(--foreground); }
  .legal th { font-weight: 600; }
  .legal .table-wrap { overflow-x: auto; }
  @media (max-width: 800px) {
    .legal .wrap { grid-template-columns: 1fr; gap: 2rem; }
    .legal nav { position: static; }
    .legal h1 { font-size: 1.85rem; }
  }
`;

export function LegalPage() {
  const c = config;
  return (
    <div className="legal">
      <style dangerouslySetInnerHTML={{ __html: styles }} />
      <div className="wrap">
        <nav aria-label="Legal documents">
          <h2>Terms of Service</h2>
          <ol>
            {termsNav.map(([id, label]) => (
              <li key={id}>
                <a href={`#${id}`}>{label}</a>
              </li>
            ))}
          </ol>
          <h2>Privacy Policy</h2>
          <ol>
            {privacyNav.map(([id, label]) => (
              <li key={id}>
                <a href={`#${id}`}>{label}</a>
              </li>
            ))}
          </ol>
        </nav>

        <main>
          <header>
            <h1>Terms of Service &amp; Privacy Policy</h1>
            <p className="meta">
              Last updated: {c.lastUpdated} · Effective: {c.effectiveDate}
            </p>
          </header>

          {/* ============================ TERMS ============================ */}
          <h2 className="doc first" id="terms">
            Terms of Service
          </h2>

          <p>
            These Terms of Service (“Terms”) govern your access to and use of {c.productName} (the
            “Service”), operated by {c.companyName} (“we”, “us”, or “our”), with operations in{" "}
            {c.jurisdiction} and principal contact at {c.address}.
          </p>
          <p>
            {c.productName} is a CRM for breeders of livestock, dogs, and cats. It includes a
            website we can set up and update, tools to manage litters and animals, leads and waitlist
            interest,
            and (where enabled) accept buyer deposits and related payments. Public kennel sites may
            appear at subdomains of {c.website} (for example,{" "}
            <em>yourkennel.truebreeds.com</em>) or on a custom domain you configure.
          </p>

          <h3 id="t-1">1. Acceptance of these Terms</h3>
          <p>
            By creating an account, clicking “I agree”, completing checkout, or using the Service,
            you agree to be bound by these Terms and our Privacy Policy. If you are using the Service
            on behalf of an organization (for example, a kennel or breeding business), you represent
            that you have authority to bind that organization, and “you” refers to that organization.
            If you do not agree, do not use the Service.
          </p>
          <p>
            You must be at least 18 years old (or the age of majority where you live) to use the
            Service as a breeder account holder.
          </p>

          <h3 id="t-2">2. Accounts</h3>
          <p>
            You must provide accurate, complete information when registering and keep it up to date.
            You may sign up with email and password or via single sign-on ({c.ssoProviders}). You are
            responsible for safeguarding your login credentials and for all activity under your
            account. Notify us immediately at {c.supportEmail} if you suspect unauthorized use.
          </p>
          <p>
            Team members you invite to a kennel workspace act under your authority. You remain
            responsible for their use of the Service. We may suspend or refuse accounts at our
            discretion, including for suspected fraud, abuse, unpaid fees, or violation of these
            Terms.
          </p>

          <h3 id="t-3">3. Subscriptions and billing</h3>
          <p>
            The Service is offered with a one-time setup fee and a recurring membership (Basic, Pro,
            or Premium). Current pricing is shared when you{" "}
            <a href={c.pricingUrl} rel="noopener noreferrer">
              inquire
            </a>
            . Amounts shown at checkout or in your billing settings control.
          </p>
          <ul>
            <li>
              <strong>Billing cycle.</strong> Memberships renew automatically each month unless
              cancelled before the renewal date via the Stripe customer portal in Dashboard →
              Settings → Billing, or by contacting {c.supportEmail}.
            </li>
            <li>
              <strong>Authorization.</strong> By completing checkout, you authorize us and our
              payment processors to charge your chosen payment method for the setup fee (when
              applicable), the recurring membership fee, applicable taxes, and any add-on charges you
              incur.
            </li>
            <li>
              <strong>Price changes.</strong> We will give you at least {c.priceChangeNoticeDays}{" "}
              days’ notice of any price increase. Continued use after the change takes effect
              constitutes acceptance of the new price.
            </li>
            <li>
              <strong>Taxes.</strong> Prices exclude sales tax, VAT, GST, or similar taxes unless
              stated otherwise. You are responsible for any applicable taxes.
            </li>
            <li>
              <strong>Free trials.</strong> If a trial is offered, you will be charged automatically
              when it ends unless you cancel beforehand. Trial length and terms are shown at signup.
            </li>
            <li>
              <strong>Failed payments.</strong> If a payment fails, we may retry the charge, notify
              you, place the account in a grace period, and suspend or limit your kennel site until
              payment is received.
            </li>
          </ul>

          <h3 id="t-4">4. Payments via Stripe and Klarna</h3>
          <p>
            We do not store your full card number or bank details. Platform membership and setup fees
            are processed on TrueBreeds’ Stripe account. Separately, breeders may connect their own
            Stripe Express accounts (Stripe Connect) to collect deposits and related payments from
            buyers on their kennel sites. Those buyer payments are settled to the breeder, not to
            TrueBreeds as the seller of the animal.
          </p>
          <p>
            <strong>Third-party terms are not part of this document.</strong> Stripe and Klarna are
            independent companies. Their terms of service, consumer agreements, connected-account
            agreements, and privacy policies are published and updated solely by them on their own
            websites. TrueBreeds does not restate, mirror, or maintain those documents, and we are
            not responsible for keeping copies of them current. By using a payment method powered by
            Stripe or Klarna, you agree that the version of that provider’s terms and privacy notice
            in effect on their website at the time of your transaction (and as they update those
            pages thereafter) governs your relationship with that provider. Always review the
            provider’s latest terms and privacy information via the links below (or the legal /
            privacy pages linked from their websites if a URL changes).
          </p>
          <ul>
            <li>
              <strong>Stripe (platform billing).</strong> Card, wallet, and bank payments for your
              TrueBreeds membership are processed by Stripe, Inc. and its affiliates. Review Stripe’s
              latest consumer / services terms and privacy policy on Stripe’s website:{" "}
              <a href="https://stripe.com/legal" rel="noopener noreferrer" target="_blank">
                stripe.com/legal
              </a>{" "}
              (including{" "}
              <a href="https://stripe.com/legal/consumer" rel="noopener noreferrer" target="_blank">
                Consumer Terms
              </a>
              ) and{" "}
              <a href="https://stripe.com/privacy" rel="noopener noreferrer" target="_blank">
                stripe.com/privacy
              </a>
              .
            </li>
            <li>
              <strong>Stripe Connect (breeder deposits).</strong> If you enable deposits, you must
              complete Stripe Connect onboarding and accept Stripe’s connected-account terms as
              presented by Stripe during onboarding and as published at{" "}
              <a href="https://stripe.com/legal/connect-account" rel="noopener noreferrer" target="_blank">
                stripe.com/legal/connect-account
              </a>{" "}
              (or the then-current Stripe Connect legal page). You are the merchant of record for
              buyer deposits and animal sales. You are solely responsible for pricing, refunds of
              deposits (where offered in the dashboard), tax collection, consumer disclosures, and
              any dispute with a buyer about an animal or litter.
            </li>
            <li>
              <strong>Klarna.</strong> On Premium (where enabled), buyers may be offered Klarna
              payment options for eligible purchases. Klarna is a separate lender and payment
              provider. When a buyer selects Klarna, they enter into a separate agreement with
              Klarna. Klarna’s then-current terms and privacy notice on Klarna’s website apply to
              that payment—not these Terms. Review Klarna’s latest documents at{" "}
              <a href="https://www.klarna.com/international/terms/" rel="noopener noreferrer" target="_blank">
                klarna.com/international/terms
              </a>{" "}
              and{" "}
              <a
                href="https://www.klarna.com/international/privacy-policy/"
                rel="noopener noreferrer"
                target="_blank"
              >
                klarna.com/international/privacy-policy
              </a>{" "}
              (or the equivalent pages Klarna publishes for the buyer’s country). Any credit checks,
              eligibility decisions, late fees, interest, or repayment obligations are solely between
              the buyer and Klarna under Klarna’s agreements.
            </li>
          </ul>
          <p>
            Availability of payment methods and options depends on country, order value, plan
            features, and each provider’s own rules. We are not responsible for a payment provider’s
            decision to decline a transaction, or for changes those providers make to their products,
            fees, or legal documents.
          </p>

          <h3 id="t-5">5. Refunds and cancellation</h3>
          <ul>
            <li>
              <strong>Cancellation.</strong> You may cancel your membership at any time from
              Dashboard → Settings → Billing (Stripe customer portal) or by contacting{" "}
              {c.supportEmail}. Cancellation takes effect at the end of the current billing period;
              you retain access until then.
            </li>
            <li>
              <strong>Refunds (platform fees).</strong> {c.refundPolicy}
            </li>
            <li>
              <strong>Buyer deposits.</strong> Refunds of deposits paid to a breeder via Stripe
              Connect are controlled by that breeder and by Stripe’s then-current rules (see{" "}
              <a href="https://stripe.com/legal" rel="noopener noreferrer" target="_blank">
                stripe.com/legal
              </a>
              ). TrueBreeds is not the seller of animals and is not obligated to refund buyer
              deposits paid to a connected account.
            </li>
            <li>
              <strong>Klarna purchases.</strong> If a refund is issued on an order paid with Klarna,
              handling of the refund (including timing and how it affects any Klarna balance or
              instalment plan) is governed by Klarna’s then-current policies on Klarna’s website—not
              by TrueBreeds. See{" "}
              <a href="https://www.klarna.com/international/terms/" rel="noopener noreferrer" target="_blank">
                Klarna’s terms
              </a>
              .
            </li>
            <li>
              <strong>Disputes.</strong> Please contact us before initiating a chargeback on
              platform fees so we can resolve the issue. We reserve the right to suspend accounts
              with unresolved disputed charges.
            </li>
          </ul>

          <h3 id="t-6">6. Acceptable use</h3>
          <p>You agree not to:</p>
          <ul>
            <li>Use the Service for any unlawful purpose or in violation of any applicable law or regulation (including animal welfare, consumer, advertising, and privacy laws);</li>
            <li>
              Upload or transmit malware, or attempt to gain unauthorized access to the Service, its
              systems, or other users’ accounts or kennel data;
            </li>
            <li>
              Reverse engineer, decompile, or attempt to extract source code from the Service, except
              where permitted by law;
            </li>
            <li>
              Resell, sublicense, or provide the Service to third parties except as expressly
              permitted by your plan (for example, inviting team members to your own kennel);
            </li>
            <li>Use automated means to scrape or overload the Service beyond documented limits;</li>
            <li>Infringe the intellectual property, privacy, or other rights of any person;</li>
            <li>
              Use the Service to send spam or unsolicited communications, or to misrepresent
              breeding practices, health testing, or animal availability;
            </li>
            <li>
              Publish unlawful, deceptive, or harmful content on your kennel site, including content
              that exploits animals or people.
            </li>
          </ul>

          <h3 id="t-7">7. Your content and kennel sites</h3>
          <p>
            You retain ownership of the data, files, photos, policies, litter and animal records,
            lead notes, agreements, and other content you submit to the Service (“Customer Content”).
            You grant us a limited, worldwide, non-exclusive license to host, store, process, and
            display Customer Content solely to provide, maintain, and improve the Service and as
            otherwise permitted by our Privacy Policy. You are responsible for Customer Content and
            for having the rights necessary to submit it (including photo rights and accurate
            descriptions of animals).
          </p>
          <p>
            Lead, waitlist, and buyer contact information collected on your kennel site is processed
            to provide the Service to you. You are responsible for your own privacy disclosures to
            visitors and buyers (including any kennel-specific privacy policy you publish) and for
            complying with marketing and messaging laws when you contact those people.
          </p>
          <p>
            We may remove content that violates these Terms. You can request an export of your data
            using {c.exportMethod}.
          </p>

          <h3 id="t-8">8. Intellectual property</h3>
          <p>
            The Service, including its software, design, text, graphics, and trademarks (including
            “TrueBreeds” / “trueBreeds”), is owned by us or our licensors and protected by
            intellectual property laws. Subject to these Terms, we grant you a limited,
            non-exclusive, non-transferable, revocable license to use the Service for your kennel or
            breeding business. No other rights are granted.
          </p>
          <p>If you send us feedback or suggestions, we may use them without obligation to you.</p>

          <h3 id="t-9">9. Availability, changes, and support</h3>
          <p>
            We aim to keep the Service available {c.uptimeTarget}, but we do not guarantee
            uninterrupted access. We may modify, suspend, or discontinue features with reasonable
            notice where practical. Scheduled maintenance will be announced in advance where
            possible. Support is available via {c.supportChannels} during {c.supportHours}.
          </p>

          <h3 id="t-10">10. Disclaimers</h3>
          <p>
            THE SERVICE IS PROVIDED “AS IS” AND “AS AVAILABLE” WITHOUT WARRANTIES OF ANY KIND,
            WHETHER EXPRESS, IMPLIED, OR STATUTORY, INCLUDING IMPLIED WARRANTIES OF MERCHANTABILITY,
            FITNESS FOR A PARTICULAR PURPOSE, TITLE, AND NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE
            SERVICE WILL BE ERROR-FREE, SECURE, OR MEET YOUR REQUIREMENTS. WE ARE NOT A PARTY TO ANY
            SALE, DEPOSIT, OR BREEDING AGREEMENT BETWEEN A BREEDER AND A BUYER, AND WE DO NOT
            GUARANTEE THE HEALTH, TEMPERAMENT, OR AVAILABILITY OF ANY ANIMAL. SOME JURISDICTIONS DO
            NOT ALLOW THE EXCLUSION OF CERTAIN WARRANTIES, SO SOME OF THESE EXCLUSIONS MAY NOT APPLY
            TO YOU.
          </p>

          <h3 id="t-11">11. Limitation of liability</h3>
          <p>
            TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE AND OUR OFFICERS, EMPLOYEES, AND AFFILIATES
            WILL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE
            DAMAGES, OR ANY LOSS OF PROFITS, REVENUE, DATA, OR GOODWILL, ARISING FROM YOUR USE OF THE
            SERVICE OR FROM ANY TRANSACTION BETWEEN A BREEDER AND A BUYER. OUR TOTAL LIABILITY FOR ANY
            CLAIM ARISING OUT OF THESE TERMS OR THE SERVICE WILL NOT EXCEED THE AMOUNT YOU PAID US IN
            PLATFORM FEES IN THE {c.liabilityMonths} MONTHS BEFORE THE EVENT GIVING RISE TO THE
            CLAIM.
          </p>

          <h3 id="t-12">12. Termination</h3>
          <p>
            You may stop using the Service and close your account at any time. We may suspend or
            terminate your access immediately if you materially breach these Terms, fail to pay fees
            when due, or if required by law. On termination, your right to use the Service ends; we
            may delete Customer Content after {c.dataDeletionDays} days unless a longer retention
            period is required by law. Sections that by their nature should survive (including
            payment obligations, intellectual property, disclaimers, limitation of liability, and
            governing law) will survive termination.
          </p>

          <h3 id="t-13">13. Governing law and disputes</h3>
          <p>
            These Terms are governed by the laws of {c.jurisdiction}, without regard to
            conflict-of-law rules. Any dispute will be resolved {c.disputeResolution}. Nothing in
            this section limits any consumer rights you may have under mandatory local law.
          </p>

          <h3 id="t-14">14. Changes to these Terms</h3>
          <p>
            We may update these Terms from time to time. For material changes, we will notify you by
            email or in-app at least {c.termsChangeNoticeDays} days before they take effect. Your
            continued use of the Service after the effective date constitutes acceptance. If you do
            not agree, cancel your subscription before the changes take effect.
          </p>

          <h3>15. General</h3>
          <p>
            These Terms, together with the Privacy Policy and any order form or plan terms, are the
            entire agreement between you and us regarding the Service. If any provision is found
            unenforceable, the remainder remains in effect. You may not assign these Terms without
            our consent; we may assign them in connection with a merger, acquisition, or sale of
            assets. Our failure to enforce a provision is not a waiver.
          </p>

          {/* ============================ PRIVACY ============================ */}
          <h2 className="doc" id="privacy">
            Privacy Policy
          </h2>

          <p>
            This Privacy Policy explains how {c.companyName} (“we”, “us”) collects, uses, and shares
            personal information when you use {c.productName} and our website at {c.website}. We are
            the data controller for the personal information described here for the platform, except
            where noted for payment providers or where a breeder is the controller of buyer/lead data
            collected on their own kennel site.
          </p>

          <h3 id="p-1">1. Information we collect</h3>
          <p>
            <strong>Information you provide</strong>
          </p>
          <ul>
            <li>
              Account details: name, email address, password (hashed via our auth provider), kennel
              or business name, and related profile fields.
            </li>
            <li>
              Billing details: billing address, tax ID (where applicable), and the last four digits
              and brand of your card as returned by our payment processor.
            </li>
            <li>
              Customer Content: kennel site content, animal and litter records, photos, policies,
              lead CRM notes, digital agreements, and similar data you upload or create.
            </li>
            <li>Communications: messages you send us via support, email, or forms.</li>
          </ul>
          <p>
            <strong>Information collected on kennel sites</strong>
          </p>
          <ul>
            <li>
              Contact and waitlist forms may collect a visitor’s name, email, phone, message, and
              interest details, which are delivered to the relevant breeder’s dashboard and (where
              configured) by email.
            </li>
            <li>
              Deposit and reservation flows may collect buyer contact and payment-related metadata
              needed to create a checkout session with Stripe or Klarna.
            </li>
          </ul>
          <p>
            <strong>Information collected automatically</strong>
          </p>
          <ul>
            <li>Usage data: features used, actions taken, timestamps, pages viewed.</li>
            <li>
              Device and log data: IP address, browser type, operating system, device identifiers,
              referring URLs, and error logs.
            </li>
            <li>Cookies and similar technologies, as described in Section 5.</li>
          </ul>
          <p>
            <strong>Information from third parties</strong>
          </p>
          <ul>
            <li>
              Payment providers (Stripe, Klarna): transaction status, payment method type, and
              fraud-risk signals.
            </li>
            <li>
              Single sign-on providers ({c.ssoProviders}): name, email, and profile picture if you
              sign in with them (via Supabase Auth).
            </li>
          </ul>

          <h3 id="p-2">2. How we use information</h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Purpose</th>
                  <th>Examples</th>
                  <th>Legal basis (GDPR/UK GDPR)</th>
                </tr>
              </thead>
              <tbody>
                {usePurposes.map(([purpose, examples, basis]) => (
                  <tr key={purpose}>
                    <td>{purpose}</td>
                    <td>{examples}</td>
                    <td>{basis}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h3 id="p-3">3. Payment data, Stripe, and Klarna</h3>
          <p>
            We do not collect or store full payment card numbers, CVV codes, or bank account
            credentials. When you pay, your payment details are entered directly into forms hosted by
            our payment providers.
          </p>
          <p>
            <strong>Stripe and Klarna privacy practices are theirs, not ours.</strong> Each payment
            provider publishes and updates its own privacy notice on its website. TrueBreeds does not
            restate or maintain those notices. For how Stripe or Klarna collect and use personal
            information as independent controllers (or otherwise under their roles), review the
            then-current documents on their sites:
          </p>
          <ul>
            <li>
              <strong>Stripe:</strong>{" "}
              <a href="https://stripe.com/privacy" rel="noopener noreferrer" target="_blank">
                stripe.com/privacy
              </a>{" "}
              and related pages under{" "}
              <a href="https://stripe.com/legal" rel="noopener noreferrer" target="_blank">
                stripe.com/legal
              </a>
              . Stripe processes platform subscription and setup payments, and (via Stripe Connect)
              processes deposits for connected breeders. We typically receive only limited payment
              metadata from Stripe (for example, payment status, payment-method brand, last four
              digits, and billing address as applicable)—not full card numbers.
            </li>
            <li>
              <strong>Klarna:</strong>{" "}
              <a
                href="https://www.klarna.com/international/privacy-policy/"
                rel="noopener noreferrer"
                target="_blank"
              >
                klarna.com/international/privacy-policy
              </a>{" "}
              (or the country-specific Klarna privacy page applicable to the buyer). If Klarna is
              offered at checkout, limited order and contact details may be shared with Klarna so it
              can process the payment under its own policies. We do not receive Klarna account
              credentials or credit scores.
            </li>
          </ul>
          <p>
            If a Stripe or Klarna URL above changes, use the legal or privacy links on that company’s
            homepage. Requests about data held by Stripe or Klarna as independent controllers should
            be directed to them under their published privacy processes.
          </p>

          <h3 id="p-4">4. How we share information</h3>
          <p>We do not sell your personal information. We share it only with:</p>
          <ul>
            <li>
              <strong>Service providers</strong> who process data on our behalf under contract, such
              as cloud hosting ({c.hostingProvider}), email delivery ({c.emailProvider}), analytics (
              {c.analyticsProvider}), customer support tools ({c.supportProvider}), authentication
              (Supabase Auth), and payment processing (Stripe, Klarna).
            </li>
            <li>
              <strong>Payment providers</strong> as independent controllers, as described in Section
              3.
            </li>
            <li>
              <strong>Kennel owners and their team members</strong>, who can see lead, waitlist, and
              buyer information submitted on their site or entered in their CRM.
            </li>
            <li>
              <strong>Legal and safety recipients</strong> when required by law, subpoena, or to
              protect the rights, property, or safety of us, our users, or others.
            </li>
            <li>
              <strong>Business transfers</strong> in connection with a merger, acquisition,
              financing, or sale of assets, subject to confidentiality obligations.
            </li>
            <li>
              <strong>With your consent</strong> or at your direction, such as integrations you
              enable (for example, social posting or Google Analytics on your kennel site).
            </li>
          </ul>

          <h3 id="p-5">5. Cookies and tracking</h3>
          <p>We use cookies and similar technologies for:</p>
          <ul>
            <li>
              <strong>Essential</strong> functions such as keeping you signed in and securing
              checkout (including cookies set by Stripe and Klarna for fraud prevention).
            </li>
            <li>
              <strong>Analytics</strong> to understand how the Service is used ({c.analyticsTools}).
            </li>
            <li>
              <strong>Marketing</strong>, where enabled, to measure campaign effectiveness.
            </li>
          </ul>
          <p>
            You can control non-essential cookies through your browser settings. Disabling essential
            cookies may prevent the Service from working. We honor Global Privacy Control signals
            where required by law.
          </p>

          <h3 id="p-6">6. Data retention</h3>
          <p>
            We keep personal information for as long as your account is active and as needed to
            provide the Service. After you close your account, we delete or anonymize your personal
            information within {c.accountDeletionDays} days, except that we retain billing and
            transaction records for {c.billingRecordYears} years for tax and accounting purposes, and
            we may retain information as needed to resolve disputes, enforce our agreements, or
            comply with law. Backups are purged on a rolling {c.backupCycleDays}-day cycle.
          </p>

          <h3 id="p-7">7. Security</h3>
          <p>
            We use administrative, technical, and physical safeguards designed to protect your
            information, including encryption in transit (TLS), access controls, tenant isolation in
            our application and database layers, and regular security reviews. No system is
            completely secure; if we become aware of a breach affecting your personal information, we
            will notify you and any relevant authorities as required by law.
          </p>

          <h3 id="p-8">8. Your rights and choices</h3>
          <p>Depending on where you live, you may have the right to:</p>
          <ul>
            <li>Access, correct, or delete your personal information;</li>
            <li>Receive a copy of your data in a portable format;</li>
            <li>Object to or restrict certain processing;</li>
            <li>Withdraw consent where processing is based on consent;</li>
            <li>Opt out of marketing emails (use the unsubscribe link or contact us);</li>
            <li>
              Opt out of the “sale” or “sharing” of personal information and targeted advertising
              (California and other US state residents) — we do not sell personal information;
            </li>
            <li>Not be discriminated against for exercising these rights;</li>
            <li>
              Lodge a complaint with a supervisory authority (for example, your local data protection
              authority in the EEA/UK).
            </li>
          </ul>
          <p>
            To exercise these rights, email {c.privacyEmail}. We will verify your identity and
            respond within the time required by applicable law (generally 30 days, extendable where
            permitted). Requests relating to data held by Stripe or Klarna in their capacity as
            independent controllers should be directed to them. Visitors seeking deletion of a lead
            or waitlist submission may also contact the kennel that collected it.
          </p>

          <h3 id="p-9">9. International data transfers</h3>
          <p>
            We are based in {c.baseCountry} and use service providers in {c.transferCountries}. Where
            we transfer personal information out of the EEA, UK, or Switzerland, we rely on adequacy
            decisions, Standard Contractual Clauses, the EU–US Data Privacy Framework (where the
            recipient is certified), or other lawful mechanisms. You can request a copy of the
            relevant safeguards by contacting us.
          </p>

          <h3 id="p-10">10. Children’s privacy</h3>
          <p>
            The Service is not directed to children under 18 (or under 13 in the United States), and
            we do not knowingly collect personal information from them as account holders. If you
            believe a child has provided us with personal information, contact us and we will delete
            it.
          </p>

          <h3>11. Changes to this policy</h3>
          <p>
            We may update this Privacy Policy from time to time. We will post the updated version
            here with a new “Last updated” date and, for material changes, notify you by email or
            in-app notice before they take effect.
          </p>

          <h3 id="p-11">12. Contact us</h3>
          <p>
            {c.companyName}
            <br />
            {c.address}
            <br />
            Support: {c.supportEmail}
            <br />
            Privacy: {c.privacyEmail}
          </p>
          <p>{c.dpoContact}</p>
        </main>
      </div>
    </div>
  );
}
